const User = require("../models/userModel");
const Seller = require("../models/sellerModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Product = require("../models/productModel");

// Import email service
const { sendPasswordResetEmail, sendWelcomeEmail } = require("../utils/emailService");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });
};

// Register user
exports.register = asyncHandler(async (req, res, next) => {
    const {name, email, password, role, phone } = req.body;
    
    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || "user",
        phone
    });
    
    // If role is seller, create seller profile
    if (role === "seller") {
        await Seller.create({
            user: user._id,
            businessName: req.body.businessName || name + "'s Store",
            businessDescription: req.body.businessDescription
        });
    }
    

    try {
        await sendWelcomeEmail(user);
    } catch (error) {
        console.log('Welcome email failed, but registration succeeded');
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
        status: "success",
        message: "User registered successfully",
        token,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    });
});

// Login user
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    
    // Find user and include password
    const user = await User.findOne({ email }).select("+password");
    
    if (!user || !(await user.comparePassword(password))) {
        return next(new ApiError("Invalid email or password", 401));
    }
    
    if (!user.isActive) {
        return next(new ApiError("Account is deactivated", 401));
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(200).json({
        status: "success",
        message: "Login successful",
        token,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    });
});

// Protect middleware
    exports.protect = asyncHandler(async (req, res, next) => {
        let token;
        
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        
        if (!token) {
            return next(new ApiError("Please login to access this resource", 401));
        }
        
        // Verify the sent token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new ApiError("User no longer exists", 401));
        }
        
        // Check if user is active
        if (!user.isActive) {
            return next(new ApiError("Account is deactivated", 401));
        }
        
        req.user = user;
        next();
    });

// Restrict to role (admin, seller, user)
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError("You don't have permission to perform this action", 403));
        }
        next();
    };
};

// Forgot password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ApiError("No user found with that email", 404));
    }
    
    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    try {
        // Send password reset email
        await sendPasswordResetEmail(user, resetToken);
        
        res.status(200).json({
            status: "success",
            message: "Password reset link sent to your email"
        });
        
    } catch (error) {
        // If email fails, clean up the reset token
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        
        return next(new ApiError("There was an error sending the email. Please try again later.", 500));
    }
});

// Reset password
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;
    
    // Hash token and find user
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
        return next(new ApiError("Token is invalid or has expired", 400));
    }
    
    // Update password and clear reset fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    
    await user.save();
    
    // Generate new JWT token
    const jwtToken = generateToken(user._id);
    
    res.status(200).json({
        status: "success",
        message: "Password has been reset successfully",
        token: jwtToken
    });
});
