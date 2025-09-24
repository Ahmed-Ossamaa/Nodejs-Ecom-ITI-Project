const Joi = require("joi");

// Register validation
const registerSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "Name is required",
            "string.min": "Name must be at least 2 characters",
            "string.max": "Name must be at most 50 characters"
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email"
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters"
        }),
    role: Joi.string()
        .valid("user", "seller", "admin")
        .optional()
        .default("user"),
    phone: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .optional()
        .messages({
            "string.pattern.base": "Phone number must be 10-15 digits"
        }),
    businessName: Joi.string()
        .min(3)
        .max(100)
        .optional(),
    businessDescription: Joi.string()
        .max(500)
        .optional()
});

// Login validation
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email"
        }),
    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required"
        })
});

// Forgot password validation
const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email"
        })
});

// Reset password validation
const resetPasswordSchema = Joi.object({
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "New password is required",
            "string.min": "Password must be at least 6 characters"
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};
