const Joi = require("joi");

const sizeSchema = Joi.object({
    name: Joi.string().valid("XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "One Size").required(),
    qty: Joi.number().min(0).required(),
});

const stockSchema = Joi.object({
    color: Joi.string().required(),
    images: Joi.array().items(Joi.string().required()).min(1).required(),
    sizes: Joi.array().items(sizeSchema).min(1).required(),
});

const createProductSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": "Product title is required",
            "string.min": "Product title must be at least 3 characters",
            "string.max": "Product title must be at most 50 characters",
        }),
    brand: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.empty": "Brand is required",
            "string.pattern.base": "Invalid brand id format",
        }),
    description: Joi.string()
        .min(20)
        .max(500)
        .required()
        .messages({
            "string.empty": "Product description is required",
            "string.min": "Product description must be at least 20 characters",
            "string.max": "Product description must be at most 500 characters",
        }),
    price: Joi.number().min(0).required(),
    discount: Joi.number().min(0).max(1).default(0),
    status: Joi.string().valid("pending", "approved", "rejected").default("pending"),
    stock: Joi.array().items(stockSchema).min(1).required(),
    material: Joi.string().optional(),
    thumbnail: Joi.string().required(),
    offers: Joi.array().items(Joi.string()).optional(),
    sold: Joi.number().min(0).default(0),
    ratingQty: Joi.number().min(0).default(0),
    rating: Joi.number().min(0).max(5).default(0),
    category: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid category id format",
        }),
    subCategory: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid subCategory id format",
        }),
});

const updateProductSchema = Joi.object({
    title: Joi.string().min(3).max(50).optional(),
    brand: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            "string.pattern.base": "Invalid brand id format",
        }),
    description: Joi.string().min(20).max(500).optional(),
    price: Joi.number().min(0).optional(),
    discount: Joi.number().min(0).max(1).optional(),
    status: Joi.string().valid("pending", "approved", "rejected").optional(),
    stock: Joi.array().items(stockSchema).optional(),
    material: Joi.string().optional(),
    thumbnail: Joi.string().optional(),
    offers: Joi.array().items(Joi.string()).optional(),
    sold: Joi.number().min(0).optional(),
    ratingQty: Joi.number().min(0).optional(),
    rating: Joi.number().min(0).max(5).optional(),
    category: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            "string.pattern.base": "Invalid category id format",
        }),
    subCategory: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            "string.pattern.base": "Invalid subCategory id format",
        }),
});

const productIdSchema = Joi.object({
    id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid product id format",
            "any.required": "Product id is required",
        }),
});

// Pagination schema
const paginationSchema = Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
    paginationSchema
};