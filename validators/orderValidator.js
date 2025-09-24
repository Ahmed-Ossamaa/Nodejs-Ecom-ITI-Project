const Joi = require("joi");

// Schema for creating an order
const createOrderSchema = Joi.object({
    shippingAddress: Joi.object({
        street: Joi.string().optional(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().optional(),
        country: Joi.string().required()
    }).required().messages({
        "any.required": "Shipping address is required",
        "object.base": "Shipping address must be an object"
    }),
  paymentMethod: Joi.string().valid("cash", "online").default("cash")
});


// Schema for validating :id param
const orderIdSchema = Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
        .messages({
            "any.required": "Order ID is required",
            "string.empty": "Order ID cannot be empty",
        }),
});

// Schema for updating order status (admin only)
const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid("pending", "shipped", "delivered", "cancelled")
        .required()
        .messages({
            "any.required": "Order status is required",
            "any.only": "Invalid order status",
        }),
});

module.exports = {
    createOrderSchema,
    orderIdSchema,
    updateOrderStatusSchema,
};
