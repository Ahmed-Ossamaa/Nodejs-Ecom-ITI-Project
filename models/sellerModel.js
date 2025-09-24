const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Seller must be linked to a user"],
        unique: true
    },
    businessName: {
        type: String,
        required: [true, "Business name is required"],
        trim: true,
        minLength: [3, "Business name must be at least 3 characters"],
        maxLength: [50, "Business name must be at most 50 characters"]
    },
    businessDescription: {
        type: String,
        maxLength: [500, "Description must be at most 500 characters"]
    },
    businessAddress: {
        street: String,
        state: String,
        zipCode: String,
        city: String,
        country: String
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Virtual for products
sellerSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'seller'
});

const Seller = mongoose.model("Seller", sellerSchema);
module.exports = Seller;