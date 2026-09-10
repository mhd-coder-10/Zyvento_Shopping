// Reusable validation schemas used across multiple modules
// Contains common validations like pagination, date range, ID params
// Used by all validation files as building blocks

const Joi = require('joi');

const commonValidation = {
    // ============ ID PARAM ============
    idParam: Joi.object({
        id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid ID format',
                'string.empty': 'ID is required',
            }),
    }),

    // ============ SELLER ID PARAM ============
    sellerIdParam: Joi.object({
        sellerId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid seller ID format',
                'string.empty': 'Seller ID is required',
            }),
    }),

    // ============ PRODUCT ID PARAM ============
    productIdParam: Joi.object({
        productId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid product ID format',
                'string.empty': 'Product ID is required',
            }),
    }),

    // ============ ORDER ID PARAM ============
    orderIdParam: Joi.object({
        orderId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid order ID format',
                'string.empty': 'Order ID is required',
            }),
    }),

    // ============ USER ID PARAM ============
    userIdParam: Joi.object({
        userId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid user ID format',
                'string.empty': 'User ID is required',
            }),
    }),

    // ============ EMPLOYEE ID PARAM ============
    employeeIdParam: Joi.object({
        employeeId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid employee ID format',
                'string.empty': 'Employee ID is required',
            }),
    }),

    // ============ CATEGORY ID PARAM ============
    categoryIdParam: Joi.object({
        categoryId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid category ID format',
                'string.empty': 'Category ID is required',
            }),
    }),

    // ============ SUB CATEGORY ID PARAM ============
    subCategoryIdParam: Joi.object({
        subCategoryId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid sub-category ID format',
                'string.empty': 'Sub-category ID is required',
            }),
    }),

    // ============ PAGINATION QUERY ============
    pagination: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(10),

        sort_by: Joi.string()
            .optional(),

        sort_order: Joi.string()
            .valid('asc', 'desc')
            .default('desc'),
    }),

    // ============ DATE RANGE ============
    dateRange: Joi.object({
        start_date: Joi.date()
            .required()
            .messages({
                'date.base': 'Start date must be a valid date',
                'any.required': 'Start date is required',
            }),

        end_date: Joi.date()
            .min(Joi.ref('start_date'))
            .required()
            .messages({
                'date.base': 'End date must be a valid date',
                'date.min': 'End date must be after start date',
                'any.required': 'End date is required',
            }),
    }),

    // ============ SEARCH QUERY ============
    search: Joi.object({
        q: Joi.string()
            .min(1)
            .max(100)
            .optional()
            .messages({
                'string.min': 'Search query must be at least 1 character',
                'string.max': 'Search query cannot exceed 100 characters',
            }),
    }),

    // ============ STATUS UPDATE ============
    statusUpdate: Joi.object({
        status: Joi.string()
            .valid('active', 'inactive', 'blocked')
            .required()
            .messages({
                'any.only': 'Invalid status',
                'string.empty': 'Status is required',
            }),

        reason: Joi.string()
            .when('status', {
                is: 'blocked',
                then: Joi.required(),
                otherwise: Joi.optional(),
            })
            .messages({
                'string.empty': 'Reason is required to block',
            }),
    }),

    // ============ BULK IDs ============
    bulkIds: Joi.object({
        ids: Joi.array()
            .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
            .min(1)
            .max(100)
            .required()
            .messages({
                'array.min': 'At least one ID is required',
                'array.max': 'Cannot process more than 100 IDs at once',
                'any.required': 'IDs are required',
            }),
    }),

    // ============ FILE UPLOAD ============
    fileUpload: Joi.object({
        file: Joi.any()
            .required()
            .messages({
                'any.required': 'File is required',
            }),
    }),
};

module.exports = commonValidation;