const Joi = require('joi');

const wishlistValidation = {

    // ============ GET WISHLIST ============
    // Query params validation (pagination)
    getWishlist: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .messages({
                'number.base': 'Page must be a number',
                'number.min': 'Page must be at least 1'
            }),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(10)
            .messages({
                'number.base': 'Limit must be a number',
                'number.min': 'Limit must be at least 1',
                'number.max': 'Limit cannot exceed 100'
            })
    }),

    // ============ ADD TO WISHLIST ============
    addToWishlist: Joi.object({
        product_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid product ID format',
                'string.empty': 'Product ID is required',
                'any.required': 'Product ID is required'
            })
    }),

    // ============ REMOVE FROM WISHLIST ============
    removeFromWishlist: Joi.object({
        product_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid product ID format',
                'string.empty': 'Product ID is required'
            })
    }),

    // ============ CHECK WISHLIST ============
    checkWishlist: Joi.object({
        product_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid product ID format',
                'string.empty': 'Product ID is required'
            })
    }),

    // ============ MOVE TO CART ============
    moveToCart: Joi.object({
        product_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid product ID format',
                'string.empty': 'Product ID is required'
            }),

        quantity: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .messages({
                'number.base': 'Quantity must be a number',
                'number.min': 'Quantity must be at least 1'
            })
    }),

    // ============ PRODUCT ID PARAM (Route Param) ============
    productIdParam: Joi.object({
        productId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid product ID format',
                'string.empty': 'Product ID is required'
            })
    })
};

module.exports = wishlistValidation;