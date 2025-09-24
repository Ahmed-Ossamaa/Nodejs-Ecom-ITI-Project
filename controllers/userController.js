const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// Get current user profile
exports.getProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
        status: "success",
        data: { user }
    });
});

// Update user profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
    // Fields that can be updated
    const allowedFields = ["name", "phone", "address", "profileImage"];
    const updates = {};
    
    allowedFields.forEach(field => {
        if (req.body[field]) updates[field] = req.body[field];
    });
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        status: "success",
        message: "Profile updated successfully",
        data: { user }
    });
});

// Delete user account
exports.deleteAccount = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    
    res.status(204).json({
        status: "success",
        message: "Account deleted successfully"
    });
});

// Admin: Get all users
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const total = await User.countDocuments();
    const users = await User.find({}).skip(skip).limit(limit).sort({ createdAt: -1 });
    
    res.status(200).json({
        page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        limit,
        result: users.length,
        data: users
    });
});