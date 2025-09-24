const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// Create order from cart
exports.createOrder = asyncHandler(async (req, res, next) => {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart with products and sellers
    const cart = await Cart.findOne({ user: req.user._id }).populate({
        path: "items.productId",
        select: "_id seller"
    });

    if (!cart || cart.items.length === 0) {
        return next(new ApiError("Cart is empty", 400));
    }

    // Create order items with seller info
    const orderItems = cart.items.map(item => ({
        product: item.productId._id,
        seller: item.productId.seller,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: item.price,
        totalPrice: item.price * item.quantity
    }));

    // Create order
    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        totalAmount: cart.totalPrice,
        paymentMethod: paymentMethod || "cash",
        paymentStatus: paymentMethod === "online" ? "pending" : "cash",
        orderStatus: "pending",
        shippingAddress
    });

    // Clear cart after successful order
    if (paymentMethod == "cash") {
        cart.items = [];
        cart.totalPrice = 0;
        cart.totalItems = 0;
        await cart.save();

        // Update product sold count
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { sold: item.quantity }
            });
        }
        order.orderStatus = "shipped";
        await order.save()
    }


    // Populate order with product + seller details
    await order.populate([
        { path: "items.product", select: "title thumbnail price" },
        { path: "items.seller", select: "name email" }
    ]);

    res.status(201).json({
        status: "success",
        message: "Order created successfully",
        data: { order }
    });
});

// Complete order after successful payment
exports.completeOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;

    const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
        paymentStatus: 'paid'
    });

    if (!order) {
        return next(new ApiError("Order not found or not paid", 404));
    }

    // Clear user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        cart.items = [];
        cart.totalPrice = 0;
        cart.totalItems = 0;
        await cart.save();
    }

    // Update product sold count
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { sold: item.quantity }
        });
    }

    res.json({
        status: "success",
        message: "Order completed successfully",
        data: { order }
    });
});



// Get user's orders
exports.getMyOrders = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id })
        .populate('items.product items.seller')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    res.status(200).json({
        page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        limit,
        result: orders.length,
        data: orders
    });
});

// Get single order
exports.getOrder = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const order = await Order.findById(id).populate({
        path: "items.product",
        select: "title thumbnail price",
        populate: {
            path: "seller",
            select: "name email"
        }
    });

    if (!order) {
        return next(new ApiError("Order not found", 404));
    }

    // Check if user owns the order (or is admin)
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ApiError("Not authorized to access this order", 403));
    }

    res.status(200).json({
        status: "success",
        data: { order }
    });
});

// Update order status (admin only)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
        id,
        { orderStatus, paymentStatus },
        { new: true }
    ).populate('items.product items.seller');

    if (!order) {
        return next(new ApiError("Order not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Order updated successfully",
        data: { order }
    });
});

// Delete order by id
exports.deleteOrder = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
        return next(new ApiError("Order not found", 404));
    }

    // admin delete at any stage
    if (
        req.user.role !== "admin" &&
        order.user !== req.user._id
    ) {
        return next(new ApiError("Not authorized to delete this order", 403));
    }

    //  user can only delete if order is still pending
    if (req.user.role === "user" && order.orderStatus !== "pending") {
        return next(new ApiError("You can only cancel pending orders", 400));
    }

    await order.deleteOne();

    res.status(200).json({
        status: "success",
        message: "Order deleted successfully",
    });
});
