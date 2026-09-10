const Joi = require('joi');

const notificationValidation = {

    // ============ GET NOTIFICATIONS ============
    getAllNotifications: {
        query: {
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            search: Joi.string().allow('').optional(),
            // IMPORTANT: Add 'all' to allowed values
            type: Joi.string().valid('all', 'order', 'payment', 'product', 'system', 'promotion', 'seller').default('all'),
            status: Joi.string().valid('all', 'pending', 'sent', 'failed', 'delivered', 'read').default('all'),
            priority: Joi.string().valid('all', 'low', 'medium', 'high', 'critical').default('all')
        }
    },

    // ============ NOTIFICATION ID PARAM ============
    notificationIdParam: Joi.object({
        notificationId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid notification ID format',
                'string.empty': 'Notification ID is required'
            })
    }),

    // ============ UPDATE PREFERENCES ============
    updatePreferences: Joi.object({
        email: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'Email preference must be true or false'
            }),

        push: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'Push preference must be true or false'
            }),

        sms: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'SMS preference must be true or false'
            })
    }).min(1).messages({
        'object.min': 'At least one preference must be updated'
    }),

    // ============ SEND BROADCAST (Admin) ============
    sendBroadcast: Joi.object({
        title: Joi.string()
            .min(3)
            .max(200)
            .required()
            .messages({
                'string.empty': 'Title is required',
                'string.min': 'Title must be at least 3 characters',
                'string.max': 'Title cannot exceed 200 characters'
            }),

        message: Joi.string()
            .min(5)
            .max(1000)
            .required()
            .messages({
                'string.empty': 'Message is required',
                'string.min': 'Message must be at least 5 characters',
                'string.max': 'Message cannot exceed 1000 characters'
            }),

        receiver_type: Joi.string()
            .valid('all', 'customer', 'seller', 'seller_employee', 'admin', 'sub_admin')
            .required()
            .messages({
                'any.only': 'Invalid receiver type',
                'string.empty': 'Receiver type is required'
            }),

        notification_type: Joi.string()
            .valid(
                'order', 'payment', 'product', 'inventory',
                'profile', 'seller', 'employee', 'offer',
                'return', 'refund', 'system', 'promotion',
                'security', 'role_change', 'permission_change'
            )
            .required()
            .messages({
                'any.only': 'Invalid notification type',
                'string.empty': 'Notification type is required'
            }),

        channel: Joi.string()
            .valid('email', 'sms', 'push_notification', 'in_app')
            .default('in_app')
            .messages({
                'any.only': 'Invalid channel'
            }),

        priority: Joi.string()
            .valid('low', 'medium', 'high', 'critical')
            .default('medium')
            .messages({
                'any.only': 'Invalid priority'
            })
    })
};

module.exports = notificationValidation;