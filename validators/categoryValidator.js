const Joi = require("joi");

// Category creation schema
const createCategorySchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(32)
        .required()
        .messages({
            "string.empty": "Category is required",
            "string.min": "Category name must be at least 3 characters long",
            "string.max": "Category name must be at most 32 characters long",
        }),
    image: Joi.string().optional(), // Added optional image field
});

// Category update schema
const updateCategorySchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(32)
        .optional()
        .messages({
            "string.min": "Category name must be at least 3 characters long",
            "string.max": "Category name must be at most 32 characters long",
        }),
    image: Joi.string().optional(), // Added optional image field
});

// Category ID validation schema
const categoryIdSchema = Joi.object({
    id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid category id format",
            "any.required": "Category id is required",
        }),
});

// Pagination schema
const paginationSchema = Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(50).optional(),
});

module.exports = {
    createCategorySchema,
    updateCategorySchema,
    categoryIdSchema,
    paginationSchema
};