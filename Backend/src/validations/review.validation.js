// validations/review/review.validation.js

const Joi = require('joi');

/**
 * Review Validations
 * All review related request validations
 */
const reviewValidation = {

    // ============ CREATE REVIEW ============
    createReview: Joi.object({
        product_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid product ID format',
                'string.empty': 'Product ID is required',
            }),

        order_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid order ID format',
                'string.empty': 'Order ID is required',
            }),

        rating: Joi.number()
            .min(1)
            .max(5)
            .required()
            .messages({
                'number.min': 'Rating must be at least 1',
                'number.max': 'Rating cannot exceed 5',
                'any.required': 'Rating is required',
            }),

        title: Joi.string()
            .min(2)
            .max(100)
            .optional()
            .messages({
                'string.min': 'Title must be at least 2 characters',
                'string.max': 'Title cannot exceed 100 characters',
            }),

        comment: Joi.string()
            .min(5)
            .max(1000)
            .optional()
            .messages({
                'string.min': 'Comment must be at least 5 characters',
                'string.max': 'Comment cannot exceed 1000 characters',
            }),

        images: Joi.array()
            .items(Joi.string())
            .max(5)
            .optional()
            .messages({
                'array.max': 'Cannot upload more than 5 images',
            }),
    }),

    // ============ UPDATE REVIEW ============
    updateReview: Joi.object({
        rating: Joi.number()
            .min(1)
            .max(5)
            .optional()
            .messages({
                'number.min': 'Rating must be at least 1',
                'number.max': 'Rating cannot exceed 5',
            }),

        title: Joi.string()
            .min(2)
            .max(100)
            .optional()
            .messages({
                'string.min': 'Title must be at least 2 characters',
                'string.max': 'Title cannot exceed 100 characters',
            }),

        comment: Joi.string()
            .min(5)
            .max(1000)
            .optional()
            .messages({
                'string.min': 'Comment must be at least 5 characters',
                'string.max': 'Comment cannot exceed 1000 characters',
            }),
    }),

    // ============ GET PRODUCT REVIEWS ============
    getProductReviews: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .messages({
                'number.base': 'Page must be a number',
                'number.min': 'Page must be at least 1',
            }),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(50)
            .default(10)
            .messages({
                'number.base': 'Limit must be a number',
                'number.min': 'Limit must be at least 1',
                'number.max': 'Limit cannot exceed 50',
            }),

        rating: Joi.number()
            .min(1)
            .max(5)
            .optional()
            .messages({
                'number.min': 'Rating must be at least 1',
                'number.max': 'Rating cannot exceed 5',
            }),

        sort_by: Joi.string()
            .valid('created_at', 'rating', 'helpful_count')
            .default('created_at')
            .messages({
                'any.only': 'Invalid sort field',
            }),

        sort_order: Joi.string()
            .valid('asc', 'desc')
            .default('desc')
            .messages({
                'any.only': 'Sort order must be asc or desc',
            }),

        with_images: Joi.boolean()
            .default(false)
            .messages({
                'boolean.base': 'with_images must be a boolean',
            }),
    }),

    // ============ GET SELLER REVIEWS ============
    getSellerReviews: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .messages({
                'number.base': 'Page must be a number',
                'number.min': 'Page must be at least 1',
            }),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(50)
            .default(10)
            .messages({
                'number.base': 'Limit must be a number',
                'number.min': 'Limit must be at least 1',
                'number.max': 'Limit cannot exceed 50',
            }),

        rating: Joi.number()
            .min(1)
            .max(5)
            .optional()
            .messages({
                'number.min': 'Rating must be at least 1',
                'number.max': 'Rating cannot exceed 5',
            }),

        review_status: Joi.string()
            .valid('pending', 'approved', 'rejected')
            .optional()
            .messages({
                'any.only': 'Invalid review status',
            }),

        sort_by: Joi.string()
            .valid('created_at', 'rating', 'helpful_count')
            .default('created_at')
            .messages({
                'any.only': 'Invalid sort field',
            }),

        sort_order: Joi.string()
            .valid('asc', 'desc')
            .default('desc')
            .messages({
                'any.only': 'Sort order must be asc or desc',
            }),
    }),

    // ============ GET USER REVIEWS ============
    getUserReviews: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(50)
            .default(10),
    }),

    // ============ ADMIN APPROVE REVIEW ============
    approveReview: Joi.object({
        review_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid review ID format',
                'string.empty': 'Review ID is required',
            }),

        status: Joi.string()
            .valid('approved', 'rejected')
            .required()
            .messages({
                'any.only': 'Status must be approved or rejected',
                'string.empty': 'Status is required',
            }),

        admin_comment: Joi.string()
            .max(500)
            .optional()
            .messages({
                'string.max': 'Comment cannot exceed 500 characters',
            }),
    }),

    // ============ MARK REVIEW HELPFUL ============
    markHelpful: Joi.object({
        review_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid review ID format',
                'string.empty': 'Review ID is required',
            }),
    }),

    // ============ ADMIN GET ALL REVIEWS ============
    adminGetAllReviews: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(50)
            .default(10),

        review_status: Joi.string()
            .valid('pending', 'approved', 'rejected')
            .optional()
            .messages({
                'any.only': 'Invalid review status',
            }),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Invalid seller ID format',
            }),

        product_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Invalid product ID format',
            }),

        rating: Joi.number()
            .min(1)
            .max(5)
            .optional()
            .messages({
                'number.min': 'Rating must be at least 1',
                'number.max': 'Rating cannot exceed 5',
            }),

        start_date: Joi.date()
            .optional()
            .messages({
                'date.base': 'Invalid start date format',
            }),

        end_date: Joi.date()
            .optional()
            .messages({
                'date.base': 'Invalid end date format',
            }),

        sort_by: Joi.string()
            .valid('created_at', 'rating', 'helpful_count')
            .default('created_at'),

        sort_order: Joi.string()
            .valid('asc', 'desc')
            .default('desc'),
    }),

    // ============ REVIEW REPORT ============
    reviewReport: Joi.object({
        start_date: Joi.date()
            .required()
            .messages({
                'date.base': 'Invalid start date format',
                'any.required': 'Start date is required',
            }),

        end_date: Joi.date()
            .min(Joi.ref('start_date'))
            .required()
            .messages({
                'date.base': 'Invalid end date format',
                'date.min': 'End date must be after start date',
                'any.required': 'End date is required',
            }),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Invalid seller ID format',
            }),
    }),

    // ============ REVIEW STATISTICS ============
    reviewStatistics: Joi.object({
        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Invalid seller ID format',
            }),

        product_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Invalid product ID format',
            }),
    }),

    // ============ DELETE REVIEW ============
    deleteReview: Joi.object({
        review_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid review ID format',
                'string.empty': 'Review ID is required',
            }),
    }),
};

module.exports = reviewValidation;