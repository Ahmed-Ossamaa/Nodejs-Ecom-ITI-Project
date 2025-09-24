const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// Get user's cart
exports.getCart = asyncHandler(async (req, res, next) => {
    // Use lean here since this is read-only (faster + includes virtuals)
    let cart = await Cart.findOne({ user: req.user._id })
        .populate({
            path: 'items.productId',
            select: "_id title price discount thumbnail", // include discount for finalPrice calculation
        })
        .lean({ virtuals: true });

    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
        status: "success",
        data: { cart }
    });
});

// Add item to cart
exports.addToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity, color, size } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        return next(new ApiError("Product not found", 404));
    }
    const finalPrice = product.price - (product.price * product.discount);
    console.log(finalPrice)

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item =>
        item.productId.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        cart.items.push({
            productId: productId,
            quantity,
            color,
            size,
            price: finalPrice || product.price  // use finalPrice if there is discount
        });
    }

    await cart.save();
    await cart.populate({
        path: 'items.productId',
        select: "_id title price discount thumbnail" 
    });

    // convert to plain object with virtuals (to include finalPrice)
    const cartObj = cart.toObject({ virtuals: true });

    res.status(200).json({
        status: "success",
        message: "Item added to cart",
        data: { cart: cartObj }
    });
});

// Update cart item
exports.updateCartItem = asyncHandler(async (req, res, next) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new ApiError("Cart not found", 404));
    }

    const item = cart.items.id(itemId);
    if (!item) {
        return next(new ApiError("Item not found in cart", 404));
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate({
        path: 'items.productId',
        select: "_id title price discount thumbnail"
    });

    const cartObj = cart.toObject({ virtuals: true });

    res.status(200).json({
        status: "success",
        message: "Cart updated successfully",
        data: { cart: cartObj }
    });
});

// Remove item from cart
exports.removeFromCart = asyncHandler(async (req, res, next) => {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new ApiError("Cart not found", 404));
    }

    cart.items.pull(itemId);
    await cart.save();
    await cart.populate({
        path: 'items.productId',
        select: "_id title price discount thumbnail" // include discount
    });

    const cartObj = cart.toObject({ virtuals: true });

    res.status(200).json({
        status: "success",
        message: "Item removed from cart",
        data: { cart: cartObj }
    });
});

// Clear cart
exports.clearCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        { items: [], totalPrice: 0, totalItems: 0 },
        { new: true }
    );

    res.status(200).json({
        status: "success",
        message: "Cart cleared successfully",
        data: { cart }
    });
});
