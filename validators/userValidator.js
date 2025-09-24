const joi = require("joi");

const updateProfileSchema = joi.object({
    name: joi.string().min(2).max(50).optional(),
    email: joi.string().email().optional(),
    password: joi.string().min(6).optional(),
    role: joi.string().valid("user", "seller", "admin").optional(),
});

module.exports = {
    updateProfileSchema,
};