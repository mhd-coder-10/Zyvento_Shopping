const Joi = require('joi');

const reportValidation = {

    // ============ DATE RANGE ============
    dateRange: Joi.object({
        start_date: Joi.date()
            .required()
            .messages({
                'date.base': 'Start date must be a valid date',
                'any.required': 'Start date is required'
            }),

        end_date: Joi.date()
            .min(Joi.ref('start_date'))
            .required()
            .messages({
                'date.base': 'End date must be a valid date',
                'date.min': 'End date must be after start date',
                'any.required': 'End date is required'
            }),

        group_by: Joi.string()
            .valid('daily', 'weekly', 'monthly')
            .default('daily')
            .messages({
                'any.only': 'Group by must be daily, weekly, or monthly'
            }),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Invalid seller ID format'
            })
    }),

    // ============ ANALYTICS QUERY ============
    analyticsQuery: Joi.object({
        period: Joi.string()
            .valid('weekly', 'monthly', 'yearly')
            .default('monthly')
            .messages({
                'any.only': 'Period must be weekly, monthly, or yearly'
            }),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Invalid seller ID format'
            })
    }),

    // ============ EXPORT REPORT ============
    exportReport: Joi.object({
        report_type: Joi.string()
            .valid('sales', 'orders', 'products', 'sellers', 'users', 'payments')
            .required()
            .messages({
                'any.only': 'Invalid report type',
                'string.empty': 'Report type is required'
            }),

        start_date: Joi.date()
            .required()
            .messages({
                'date.base': 'Start date must be a valid date',
                'any.required': 'Start date is required'
            }),

        end_date: Joi.date()
            .min(Joi.ref('start_date'))
            .required()
            .messages({
                'date.base': 'End date must be a valid date',
                'date.min': 'End date must be after start date',
                'any.required': 'End date is required'
            }),

        format: Joi.string()
            .valid('csv', 'pdf', 'excel')
            .default('csv')
            .messages({
                'any.only': 'Format must be csv, pdf, or excel'
            })
    }),

    // ============ CREATE SCHEDULE ============
    createSchedule: Joi.object({
        report_name: Joi.string()
            .min(3)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Report name is required',
                'string.min': 'Report name must be at least 3 characters',
                'string.max': 'Report name cannot exceed 100 characters'
            }),

        report_type: Joi.string()
            .valid(
                'user_activity', 'role_changes', 'permission_changes',
                'seller_performance', 'sub_admin_performance',
                'order_analytics', 'revenue_report', 'product_report',
                'custom'
            )
            .required()
            .messages({
                'any.only': 'Invalid report type',
                'string.empty': 'Report type is required'
            }),

        filters: Joi.object()
            .default({})
            .optional(),

        columns: Joi.array()
            .items(Joi.string())
            .optional(),

        group_by: Joi.array()
            .items(Joi.string())
            .optional(),

        sort_by: Joi.object({
            field: Joi.string().optional(),
            order: Joi.string()
                .valid('asc', 'desc')
                .default('desc')
        }).optional(),

        schedule: Joi.object({
            frequency: Joi.string()
                .valid('once', 'daily', 'weekly', 'monthly', 'custom')
                .required()
                .messages({
                    'any.only': 'Invalid frequency',
                    'string.empty': 'Frequency is required'
                }),
            time: Joi.string()
                .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .optional()
                .messages({
                    'string.pattern.base': 'Invalid time format (HH:MM)'
                }),
            day_of_week: Joi.number()
                .min(0)
                .max(6)
                .when('frequency', {
                    is: 'weekly',
                    then: Joi.required(),
                    otherwise: Joi.optional()
                }),
            day_of_month: Joi.number()
                .min(1)
                .max(31)
                .when('frequency', {
                    is: 'monthly',
                    then: Joi.required(),
                    otherwise: Joi.optional()
                }),
            custom_cron: Joi.string()
                .when('frequency', {
                    is: 'custom',
                    then: Joi.required(),
                    otherwise: Joi.optional()
                })
        }).required(),

        recipients: Joi.array()
            .items(
                Joi.object({
                    email: Joi.string().email().required(),
                    user_id: Joi.string()
                        .pattern(/^[0-9a-fA-F]{24}$/)
                        .optional()
                })
            )
            .min(1)
            .required()
            .messages({
                'array.min': 'At least one recipient is required'
            }),

        format: Joi.string()
            .valid('pdf', 'excel', 'csv', 'json')
            .default('pdf')
            .messages({
                'any.only': 'Invalid format'
            })
    }),

    // ============ UPDATE SCHEDULE ============
    updateSchedule: Joi.object({
        report_name: Joi.string()
            .min(3)
            .max(100)
            .optional(),

        filters: Joi.object()
            .optional(),

        columns: Joi.array()
            .items(Joi.string())
            .optional(),

        group_by: Joi.array()
            .items(Joi.string())
            .optional(),

        schedule: Joi.object({
            frequency: Joi.string()
                .valid('once', 'daily', 'weekly', 'monthly', 'custom')
                .optional(),
            time: Joi.string()
                .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .optional(),
            day_of_week: Joi.number()
                .min(0)
                .max(6)
                .optional(),
            day_of_month: Joi.number()
                .min(1)
                .max(31)
                .optional(),
            custom_cron: Joi.string()
                .optional()
        }).optional(),

        recipients: Joi.array()
            .items(
                Joi.object({
                    email: Joi.string().email().required(),
                    user_id: Joi.string()
                        .pattern(/^[0-9a-fA-F]{24}$/)
                        .optional()
                })
            )
            .optional(),

        format: Joi.string()
            .valid('pdf', 'excel', 'csv', 'json')
            .optional(),

        is_active: Joi.boolean()
            .optional()
    }),

    // ============ SCHEDULE ID PARAM ============
    scheduleIdParam: Joi.object({
        scheduleId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid schedule ID format',
                'string.empty': 'Schedule ID is required'
            })
    }),

    // ============ REPORT ID PARAM ============
    reportIdParam: Joi.object({
        reportId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid report ID format',
                'string.empty': 'Report ID is required'
            })
    }),

    // ============ CUSTOM REPORT ============
    customReport: Joi.object({
        report_type: Joi.string()
            .required(),
        filters: Joi.object()
            .default({}),
        columns: Joi.array()
            .items(Joi.string())
            .optional(),
        group_by: Joi.array()
            .items(Joi.string())
            .optional(),
        sort_by: Joi.object({
            field: Joi.string().optional(),
            order: Joi.string()
                .valid('asc', 'desc')
                .default('desc')
        }).optional()
    }),

    // ============ SAVE CUSTOM REPORT ============
    saveCustomReport: Joi.object({
        name: Joi.string()
            .min(3)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Name is required',
                'string.min': 'Name must be at least 3 characters'
            }),
        description: Joi.string()
            .max(500)
            .optional(),
        config: Joi.object()
            .required()
            .messages({
                'any.required': 'Report configuration is required'
            })
    })
};

module.exports = reportValidation;