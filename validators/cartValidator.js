const Joi = require("joi");

const addToCartSchema = Joi.object({
    productId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid product id format",
            "any.required": "Product id is requiredddd",
        }),
    quantity: Joi.number().min(1).required().messages({
        "number.base": "Quantity must be a number",
        "number.min": "Quantity must be at least 1",
        "any.required": "Quantity is required",
    }),
    color: Joi.string().required().messages({
        "string.empty": "Color cannot be empty",
        "any.required": "Color is required",
    }),
    size: Joi.string().required().messages({
        "string.empty": "Size cannot be empty",
        "any.required": "Size is required",
    }),
});

const updateCartItemSchema = Joi.object({
    quantity: Joi.number().min(1).required().messages({
        "number.base": "Quantity must be a number",
        "number.min": "Quantity must be at least 1",
        "any.required": "Quantity is required",
    }),
});

const cartItemIdSchema = Joi.object({
    itemId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid cart item id format",
            "any.required": "Cart item id is required",
        }),
});

module.exports = {
    addToCartSchema,
    updateCartItemSchema,
    cartItemIdSchema,
};
