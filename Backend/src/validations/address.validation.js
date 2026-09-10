const Joi = require('joi');

const addressValidation = {

    // ============ CREATE ADDRESS ============
    createAddress: Joi.object({
        address_type: Joi.string()
            .valid('home', 'office', 'other')
            .default('home')
            .messages({
                'any.only': 'Address type must be home, office, or other'
            }),

        full_name: Joi.string()
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Full name is required',
                'string.min': 'Full name must be at least 2 characters',
                'string.max': 'Full name cannot exceed 100 characters'
            }),

        mobile_number: Joi.string()
            .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
            .required()
            .messages({
                'string.pattern.base': 'Please provide a valid mobile number',
                'string.empty': 'Mobile number is required'
            }),

        house_number: Joi.string()
            .max(50)
            .optional(),

        street: Joi.string()
            .max(100)
            .optional(),

        landmark: Joi.string()
            .max(100)
            .optional(),

        city: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'City is required',
                'string.min': 'City must be at least 2 characters',
                'string.max': 'City cannot exceed 50 characters'
            }),

        state: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'State is required',
                'string.min': 'State must be at least 2 characters',
                'string.max': 'State cannot exceed 50 characters'
            }),

        country: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Country is required',
                'string.min': 'Country must be at least 2 characters',
                'string.max': 'Country cannot exceed 50 characters'
            }),

        pincode: Joi.string()
            .pattern(/^[0-9]{5,6}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid pincode format (5-6 digits required)',
                'string.empty': 'Pincode is required'
            }),

        is_default: Joi.boolean()
            .default(false)
            .messages({
                'boolean.base': 'is_default must be true or false'
            })
    }),

    // ============ UPDATE ADDRESS ============
    updateAddress: Joi.object({
        address_type: Joi.string()
            .valid('home', 'office', 'other')
            .optional(),

        full_name: Joi.string()
            .min(2)
            .max(100)
            .optional(),

        mobile_number: Joi.string()
            .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
            .optional(),

        house_number: Joi.string()
            .max(50)
            .optional(),

        street: Joi.string()
            .max(100)
            .optional(),

        landmark: Joi.string()
            .max(100)
            .optional(),

        city: Joi.string()
            .min(2)
            .max(50)
            .optional(),

        state: Joi.string()
            .min(2)
            .max(50)
            .optional(),

        country: Joi.string()
            .min(2)
            .max(50)
            .optional(),

        pincode: Joi.string()
            .pattern(/^[0-9]{5,6}$/)
            .optional(),

        is_default: Joi.boolean()
            .optional()
    }),

    // ============ ADDRESS ID PARAM ============
    addressIdParam: Joi.object({
        addressId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid address ID format',
                'string.empty': 'Address ID is required'
            })
    })
};

module.exports = addressValidation;