const Seller = require("../models/sellerModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// Get seller profile
exports.getSellerProfile = asyncHandler(async (req, res, next) => {
    const seller = await Seller.findOne({ user: req.user._id }).populate('user');
    
    if (!seller) {
        return next(new ApiError("Seller profile not found", 404));
    }
    
    res.status(200).json({
        status: "success",
        data: { seller }
    });
});

// Update seller profile
exports.updateSellerProfile = asyncHandler(async (req, res, next) => {
    const allowedFields = ["businessName", "businessDescription", "businessAddress"];
    const updates = {};
    
    allowedFields.forEach(field => {
        if (req.body[field]) updates[field] = req.body[field];
    });
    
    const seller = await Seller.findOneAndUpdate(
        { user: req.user._id },
        updates,
        { new: true, runValidators: true }
    ).populate('user');
    
    if (!seller) {
        return next(new ApiError("Seller profile not found", 404));
    }
    
    res.status(200).json({
        status: "success",
        message: "Seller profile updated successfully",
        data: { seller }
    });
});

// Get seller's products
exports.getSellerProducts = asyncHandler(async (req, res, next) => {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
        return next(new ApiError("Seller profile not found", 404));
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const total = await Product.countDocuments({ seller: seller._id });
    const products = await Product.find({ seller: seller._id })
        .populate('category subCategory brand')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    
    res.status(200).json({
        page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        limit,
        result: products.length,
        data: products
    });
});