const Joi = require('joi');

const employeeValidation = {

    // Create Employee
    createEmployee: Joi.object({
        user_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid user ID',
                'string.empty': 'User ID is required'
            }),

        employee_type: Joi.string()
            .valid(
                'product_manager',
                'order_manager',
                'inventory_manager',
                'shipping_manager',
                'customer_service_manager',
                'marketing_manager',
                'account_manager'
            )
            .required()
            .messages({
                'any.only': 'Invalid employee type',
                'string.empty': 'Employee type is required'
            }),

        role_ids: Joi.array()
            .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
            .optional(),

        designation: Joi.string()
            .optional(),

        department: Joi.string()
            .optional(),

        joining_date: Joi.date()
            .optional()
    }),

    // Update Employee
    updateEmployee: Joi.object({
        employee_type: Joi.string()
            .valid(
                'product_manager',
                'order_manager',
                'inventory_manager',
                'shipping_manager',
                'customer_service_manager',
                'marketing_manager',
                'account_manager'
            )
            .optional(),

        role_ids: Joi.array()
            .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
            .optional(),

        designation: Joi.string()
            .optional(),

        department: Joi.string()
            .optional(),

        status: Joi.string()
            .valid('active', 'inactive', 'blocked', 'pending')
            .optional(),

        notes: Joi.string()
            .optional()
    }),

    // Update Employee Status
    updateEmployeeStatus: Joi.object({
        status: Joi.string()
            .valid('active', 'inactive', 'blocked', 'pending')
            .required()
            .messages({
                'any.only': 'Invalid status',
                'string.empty': 'Status is required'
            }),

        reason: Joi.string()
            .optional()
    }),

    // Employee ID Param
    employeeIdParam: Joi.object({
        employeeId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid employee ID',
                'string.empty': 'Employee ID is required'
            })
    }),

    // Seller ID Param
    sellerIdParam: Joi.object({
        sellerId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid seller ID',
                'string.empty': 'Seller ID is required'
            })
    }),

    // ID Param
    idParam: Joi.object({
        id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid ID',
                'string.empty': 'ID is required'
            })
    }),

    // Assign Employee Role
    assignEmployeeRole: Joi.object({
        role_ids: Joi.array()
            .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
            .min(1)
            .required()
            .messages({
                'array.min': 'At least one role is required',
                'any.required': 'Role IDs are required'
            }),

        reason: Joi.string()
            .optional()
    }),

    // Remove Employee Role
    removeEmployeeRole: Joi.object({
        employeeId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid employee ID',
                'string.empty': 'Employee ID is required'
            }),

        roleId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid role ID',
                'string.empty': 'Role ID is required'
            }),

        reason: Joi.string()
            .optional()
    }),

    // GetAll Employees
    getAllEmployees: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(10),

        search: Joi.string()
            .optional(),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        status: Joi.string()
            .valid('active', 'inactive', 'blocked', 'pending')
            .optional(),

        employee_type: Joi.string()
            .valid(
                'product_manager',
                'order_manager',
                'inventory_manager',
                'shipping_manager',
                'customer_service_manager',
                'marketing_manager',
                'account_manager'
            )
            .optional()
    })
};

module.exports = employeeValidation;