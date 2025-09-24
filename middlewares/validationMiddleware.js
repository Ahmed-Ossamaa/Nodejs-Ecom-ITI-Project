const ApiError = require("../utils/apiError");

const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
        const dataToValidate = req[property];
        const { error } = schema.validate(dataToValidate, { 
            abortEarly: false, // Get all errors, not just the first one
            allowUnknown: false, // Don't allow unknown fields
            stripUnknown: true // Remove unknown fields
        });
        
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return next(new ApiError(errorMessage, 400));
        }
        
        next();
    };
};

// Specific validation middleware for params
const validateParams = (schema) => validateRequest(schema, 'params');

// Specific validation middleware for body
const validateBody = (schema) => validateRequest(schema, 'body');

// Specific validation middleware for query
const validateQuery = (schema) => validateRequest(schema, 'query');

module.exports = {
    validateRequest,
    validateParams,
    validateBody,
    validateQuery
};