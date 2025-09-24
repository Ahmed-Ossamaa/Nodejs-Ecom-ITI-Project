const Joi = require("joi");

// Create SubCategory schema
const createSubCategorySchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(20)
        .required()
        .messages({
            "string.empty": "SubCategory is required",
            "string.min": "SubCategory name must be at least 2 characters long",
            "string.max": "SubCategory name must be at most 20 characters long",
        }),
    category: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.empty": "Category is required for SubCategory",
            "string.pattern.base": "Invalid category id format",
        }),
});

// Update SubCategory schema
const updateSubCategorySchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(20)
        .optional()
        .messages({
            "string.min": "SubCategory name must be at least 2 characters long",
            "string.max": "SubCategory name must be at most 20 characters long",
        }),
    category: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            "string.pattern.base": "Invalid category id format",
        }),
});

// SubCategory ID validation schema
const subCategoryIdSchema = Joi.object({
    id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid SubCategory id format",
            "any.required": "SubCategory id is required",
        }),
});

// Category ID for nested route
const categoryIdSchema = Joi.object({
    categoryId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)

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
    createSubCategorySchema,
    updateSubCategorySchema,
    subCategoryIdSchema,
    categoryIdSchema,
    paginationSchema
};