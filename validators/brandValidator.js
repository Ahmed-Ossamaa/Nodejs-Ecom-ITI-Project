const Joi = require("joi");

// Brand creation schema
const createBrandSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(20)
        .required()
        .messages({
            "string.empty": "Brand is required",
            "string.min": "Brand name must be at least 3 characters long",
            "string.max": "Brand name must be at most 20 characters long",
        }),
    image: Joi.string().optional(), // Added optional image field
});

// Brand update schema (only name is updatable)
const updateBrandSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(20)
        .optional()
        .messages({
            "string.min": "Brand name must be at least 3 characters long",
            "string.max": "Brand name must be at most 20 characters long",
        }),
    image: Joi.string().optional(), // Added optional image field
});

// Brand ID validation schema (for params)
const brandIdSchema = Joi.object({
    id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid Brand id format",
            "any.required": "Brand id is required",
        }),
});

// Pagination schema (for query params)
const paginationSchema = Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(50).optional(),
});

module.exports = {
    createBrandSchema,
    updateBrandSchema,
    brandIdSchema,
    paginationSchema
};
