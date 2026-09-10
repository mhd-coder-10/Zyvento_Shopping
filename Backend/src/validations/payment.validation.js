const Joi = require('joi');

const paymentValidation = {

    // Initiate Payment
    initiatePayment: Joi.object({
        order_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid order ID',
                'string.empty': 'Order ID is required'
            }),
        payment_method: Joi.string()
            .valid('credit_card', 'debit_card', 'upi', 'net_banking', 'cash_on_delivery', 'wallet')
            .required(),
        gateway: Joi.string()
            .valid('razorpay', 'paytm', 'stripe', 'paypal')
            .default('razorpay')
    }),

    // Confirm Payment
    confirmPayment: Joi.object({
        payment_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required(),
        payment_data: Joi.object().required()
    }),

    // Payment ID Param
    paymentIdParam: Joi.object({
        paymentId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
    }),

    // Refund ID Param
    refundIdParam: Joi.object({
        refundId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
    }),

    // Seller ID Param
    sellerIdParam: Joi.object({
        sellerId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
    }),

    // Get Payments
    getPayments: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        status: Joi.string()
            .valid('pending', 'paid', 'failed', 'refunded', 'partially_refunded')
            .optional(),
        payment_method: Joi.string()
            .valid('credit_card', 'debit_card', 'upi', 'net_banking', 'cash_on_delivery', 'wallet')
            .optional(),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        sort_by: Joi.string()
            .valid('created_at', 'updated_at', 'amount', 'payment_status')
            .default('created_at'),
        sort_order: Joi.string()
            .valid('asc', 'desc')
            .default('desc')
    }),

    // Get Transactions
    getTransactions: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        type: Joi.string()
            .valid('payment', 'refund', 'payout', 'commission')
            .optional(),
        status: Joi.string()
            .valid('pending', 'success', 'failed', 'processing')
            .optional(),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        sort_by: Joi.string()
            .valid('created_at', 'amount', 'status')
            .default('created_at'),
        sort_order: Joi.string()
            .valid('asc', 'desc')
            .default('desc')
    }),

    // Request Refund
    requestRefund: Joi.object({
        reason: Joi.string()
            .min(5)
            .max(500)
            .required()
    }),

    // Admin Process Refund
    adminProcessRefund: Joi.object({
        payment_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required(),
        amount: Joi.number()
            .min(0)
            .required(),
        reason: Joi.string()
            .min(5)
            .max(500)
            .required()
    }),

    // Get Payment Statistics
    getPaymentStatistics: Joi.object({
        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional()
    })
};

module.exports = paymentValidation;