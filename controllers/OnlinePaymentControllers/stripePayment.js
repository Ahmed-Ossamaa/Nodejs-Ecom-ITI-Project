const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('express-async-handler');
const ApiError = require('../../utils/apiError');
const Order = require('../../models/orderModel');
const Cart = require('../../models/cartModel');
const Product = require('../../models/productModel');

// Create order and payment intent 
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
    if (!req.body) {
        return next(new ApiError('Request body is missing', 400));
    }

    const { shippingAddress } = req.body;
    
    // Validate required fields  
    if (!shippingAddress) {
        return next(new ApiError('Shipping address is required', 400));
    }

    // Get user cart with products and sellers 
    const cart = await Cart.findOne({ user: req.user._id }).populate({
        path: "items.productId",
        select: "_id seller price discount title"
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

    try {
        // Create order first 
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            totalAmount: cart.totalPrice,
            paymentMethod: "online", 
            paymentStatus: "pending", // Will be updated after payment
            orderStatus: "pending",
            shippingAddress
        });

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.totalAmount * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                orderId: order._id.toString(),
                userId: req.user._id.toString(),
                orderNumber: order.orderNumber
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        
        // Save payment intent ID to order
        order.stripePaymentIntentId = paymentIntent.id;
        await order.save();

        // Populate order with product + seller details 
        await order.populate([
            { path: "items.product", select: "title thumbnail price" },
            { path: "items.seller", select: "name email" }
        ]);
        
        res.status(201).json({
            status: "success",
            message: "Order created and payment intent generated",
            data: {
                order,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            }
        });

    } catch (error) {
        console.error('Stripe payment intent creation failed:', error);
        return next(new ApiError(`Payment setup failed: ${error.message}`, 500));
    }
});

// Confirm Payment Success 
exports.confirmPayment = asyncHandler(async (req, res, next) => {
    if (!req.body) {
        return next(new ApiError('Request body is missing', 400));
    }

    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
        return next(new ApiError('Payment Intent ID is required', 400));
    }
    
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // For testing xxxx accept both '
        if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_payment_method') {
            const order = await Order.findOne({ 
                stripePaymentIntentId: paymentIntentId,
                user: req.user._id 
            });
            
            if (order) {
                // Update order status (
                order.paymentStatus = 'paid';
                order.orderStatus = 'shipped';
                order.paidAt = new Date();
                await order.save();

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

                await order.populate([
                    { path: "items.product", select: "title thumbnail price" },
                    { path: "items.seller", select: "name email" }
                ]);
                
                res.json({
                    status: "success",
                    message: "Payment confirmed successfully",
                    data: { order }
                });
            } else {
                return next(new ApiError("Order not found", 404));
            }
        } else {
            return next(new ApiError("Payment not completed", 400));
        }
    } catch (error) {
        console.error('Payment confirmation failed:', error);
        return next(new ApiError(`Payment confirmation failed: ${error.message}`, 500));
    }
});

// Handle Stripe Webhook 
exports.stripeWebhook = asyncHandler(async (req, res, next) => {
    let event;
    
    if (process.env.NODE_ENV === 'development') {
        // In development, accept the request body as the event
        event = req.body;
    } else {
        // In production, verify signature
        const sig = req.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(
                req.body, 
                sig, 
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return next(new ApiError('Webhook signature verification failed', 400));
        }
    }
    
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            
            // Update order status automatically
            const order = await Order.findOne({ 
                stripePaymentIntentId: paymentIntent.id 
            });
            
            if (order && order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                order.paidAt = new Date();
                order.orderStatus = 'shipped';
                await order.save();

                // Auto-complete order (clear cart, update sold count)
                const cart = await Cart.findOne({ user: order.user });
                if (cart && cart.items.length > 0) {
                    cart.items = [];
                    cart.totalPrice = 0;
                    cart.totalItems = 0;
                    await cart.save();
                }

                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { sold: item.quantity }
                    });
                }
            }
            break;
            
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            const failedOrder = await Order.findOne({ 
                stripePaymentIntentId: failedPayment.id 
            });
            
            if (failedOrder) {
                failedOrder.paymentStatus = 'failed';
                await failedOrder.save();
            }
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
});