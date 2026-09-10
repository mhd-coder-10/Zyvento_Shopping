// Validation schemas for order routes
// Validates place order, update status, cancel, return
// Used in order.routes.js for request validation

const Joi = require('joi');

const orderValidation = {
    // ============ PLACE ORDER ============
    placeOrder: Joi.object({
        shipping_address: Joi.object({
            full_name: Joi.string().required(),
            mobile_number: Joi.string()
                .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
                .required(),
            house_number: Joi.string().optional(),
            street: Joi.string().required(),
            landmark: Joi.string().optional(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            country: Joi.string().required(),
            pincode: Joi.string()
                .pattern(/^[0-9]{5,6}$/)
                .required()
                .messages({
                    'string.pattern.base': 'Invalid pincode format',
                }),
        }).required(),

        order_items: Joi.array()
            .items(
                Joi.object({
                    product_id: Joi.string()
                        .pattern(/^[0-9a-fA-F]{24}$/)
                        .required(),
                    quantity: Joi.number()
                        .integer()
                        .min(1)
                        .required()
                        .messages({
                            'number.min': 'Quantity must be at least 1',
                        }),
                    variant: Joi.object({
                        name: Joi.string().optional(),
                        option: Joi.string().optional(),
                    }).optional(),
                })
            )
            .min(1)
            .required()
            .messages({
                'array.min': 'At least one item is required in the order',
            }),

        payment_method: Joi.string()
            .valid('credit_card', 'debit_card', 'upi', 'net_banking', 'cash_on_delivery', 'wallet')
            .required()
            .messages({
                'any.only': 'Invalid payment method',
                'string.empty': 'Payment method is required',
            }),

        coupon_code: Joi.string()
            .optional(),

        notes: Joi.string()
            .max(500)
            .optional(),
    }),

    // ============ UPDATE ORDER STATUS ============
    updateOrderStatus: Joi.object({
        order_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid order ID',
                'string.empty': 'Order ID is required',
            }),

        status: Joi.string()
            .valid(
                'pending',
                'confirmed',
                'packed',
                'shipped',
                'out_for_delivery',
                'delivered',
                'cancelled',
                'returned'
            )
            .required()
            .messages({
                'any.only': 'Invalid order status',
                'string.empty': 'Status is required',
            }),

        notes: Joi.string()
            .max(500)
            .optional(),

        tracking_id: Joi.string()
            .when('status', {
                is: 'shipped',
                then: Joi.required(),
                otherwise: Joi.optional(),
            })
            .messages({
                'string.empty': 'Tracking ID is required for shipped orders',
            }),

        tracking_carrier: Joi.string()
            .when('status', {
                is: 'shipped',
                then: Joi.required(),
                otherwise: Joi.optional(),
            }),

        tracking_url: Joi.string()
            .uri()
            .when('status', {
                is: 'shipped',
                then: Joi.optional(),
                otherwise: Joi.optional(),
            }),
    }),

    // ============ CANCEL ORDER ============
    cancelOrder: Joi.object({
        order_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid order ID',
                'string.empty': 'Order ID is required',
            }),

        reason: Joi.string()
            .required()
            .messages({
                'string.empty': 'Cancellation reason is required',
            }),
    }),

    // ============ REQUEST RETURN ============
    requestReturn: Joi.object({
        order_item_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid order item ID',
                'string.empty': 'Order item ID is required',
            }),

        reason: Joi.string()
            .valid(
                'defective_product',
                'wrong_product',
                'size_issue',
                'color_issue',
                'quality_issue',
                'not_as_expected',
                'damaged_delivery',
                'other'
            )
            .required()
            .messages({
                'any.only': 'Invalid return reason',
                'string.empty': 'Return reason is required',
            }),

        description: Joi.string()
            .max(500)
            .optional(),

        images: Joi.array()
            .items(Joi.string())
            .max(5)
            .optional(),
    }),

    // ============ PROCESS RETURN ============
    processReturn: Joi.object({
        return_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid return ID',
                'string.empty': 'Return ID is required',
            }),

        status: Joi.string()
            .valid('approved', 'rejected', 'picked', 'completed')
            .required()
            .messages({
                'any.only': 'Invalid return status',
                'string.empty': 'Status is required',
            }),

        admin_comment: Joi.string()
            .when('status', {
                is: 'rejected',
                then: Joi.required(),
                otherwise: Joi.optional(),
            })
            .messages({
                'string.empty': 'Comment is required for rejection',
            }),

        refund_amount: Joi.number()
            .min(0)
            .when('status', {
                is: 'completed',
                then: Joi.required(),
                otherwise: Joi.optional(),
            }),
    }),

    // ============ GET ORDERS (With Filters) ============
    getOrders: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(10),

        order_status: Joi.string()
            .valid(
                'pending',
                'confirmed',
                'packed',
                'shipped',
                'out_for_delivery',
                'delivered',
                'cancelled',
                'returned'
            )
            .optional(),

        payment_status: Joi.string()
            .valid('pending', 'paid', 'failed', 'refunded', 'partially_refunded')
            .optional(),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        user_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        order_number: Joi.string()
            .optional(),

        start_date: Joi.date()
            .optional(),

        end_date: Joi.date()
            .optional(),

        min_amount: Joi.number()
            .min(0)
            .optional(),

        max_amount: Joi.number()
            .min(0)
            .optional(),

        sort_by: Joi.string()
            .valid('created_at', 'total_amount', 'order_status', 'order_number')
            .default('created_at'),

        sort_order: Joi.string()
            .valid('asc', 'desc')
            .default('desc'),
    }),

    // ============ ORDER TRACKING ============
    trackOrder: Joi.object({
        order_number: Joi.string()
            .required()
            .messages({
                'string.empty': 'Order number is required',
            }),
    }),
};

module.exports = orderValidation;