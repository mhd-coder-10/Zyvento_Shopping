const Joi = require('joi');

const cartValidation = {
    // Add to cart
    addToCart: Joi.object({
        product_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid product ID',
                'string.empty': 'Product ID is required'
            }),
        quantity: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .messages({
                'number.min': 'Quantity must be at least 1'
            }),
        variant: Joi.object({
            name: Joi.string().optional(),
            option: Joi.string().optional()
        }).optional()
    }),

    // Update cart item
    updateCartItem: Joi.object({
        quantity: Joi.number()
            .integer()
            .min(1)
            .required()
            .messages({
                'number.min': 'Quantity must be at least 1',
                'any.required': 'Quantity is required'
            }),
        variant: Joi.object({
            name: Joi.string().optional(),
            option: Joi.string().optional()
        }).optional()
    }),

    // Product ID param
    productIdParam: Joi.object({
        productId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid product ID',
                'string.empty': 'Product ID is required'
            })
    }),

    // Apply coupon
    applyCoupon: Joi.object({
        coupon_code: Joi.string()
            .required()
            .messages({
                'string.empty': 'Coupon code is required'
            })
    })
};

module.exports = cartValidation;