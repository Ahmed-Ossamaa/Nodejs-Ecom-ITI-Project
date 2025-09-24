const Joi = require("joi");

// Address schema (nested object)
const addressSchema = Joi.object({
    street: Joi.string().max(100).optional(),
    city: Joi.string().max(50).optional(),
    zipCode: Joi.string().max(20).optional(),
    country: Joi.string().max(50).optional()
});

const updateSellerSchema = Joi.object({
    businessName: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": "Business name is required",
            "string.min": "Business name must be at least 3 characters",
            "string.max": "Business name must be at most 50 characters",
        }),
    businessDescription: Joi.string()
        .max(500)
        .optional()
        .messages({
            "string.max": "Business description must be at most 500 characters",
        }),
    businessAddress: addressSchema.optional(),
    isVerified: Joi.boolean().optional(),
    rating: Joi.number().min(0).max(5).optional(),
    ratingCount: Joi.number().min(0).optional(),
});

module.exports = {
    updateSellerSchema,
};
