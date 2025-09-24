const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: "Seller",
        required: [true, "order must belong to a seller"]
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"]
    },
    color: String,
    size: String,
    price: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Order must belong to a user"]
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "online"],
        default: "cash"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    orderStatus: {
        type: String,
        enum: ["pending", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    stripePaymentIntentId: {
        type: String,
        sparse: true // Allows multiple null values, but unique non-null values
    },
    stripeChargeId: String,
    paidAt: Date,
    shippingAddress: {
        street: { type: String },
        city: { type: String, required: true },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String, required: true }
    },
    orderNumber: {
        type: String,
        unique: true
    },
    deliveredAt: Date,
    notes: String
}, { timestamps: true });

// presave ==> generate order ID
orderSchema.pre("save", function (next) {
    if (!this.orderNumber) {
        this.orderNumber = `ORD-${uuidv4()}`;
    }
    next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;