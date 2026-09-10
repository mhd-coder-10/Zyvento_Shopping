const Joi = require('joi');

const authValidation = {
    // ============ REGISTER ============
    register: Joi.object({
        first_name: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'First name is required',
                'string.min': 'First name must be at least 2 characters',
                'string.max': 'First name cannot exceed 50 characters',
            }),

        last_name: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Last name is required',
                'string.min': 'Last name must be at least 2 characters',
                'string.max': 'Last name cannot exceed 50 characters',
            }),

        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'string.empty': 'Email is required',
            }),

        mobile_number: Joi.string()
            .pattern(/^[0-9]{10}$/)  // ✅ Changed to 10-digit Indian number
            .required()
            .messages({
                'string.pattern.base': 'Please enter a valid 10-digit mobile number',
                'string.empty': 'Mobile number is required',
            }),

        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)  // ✅ Added special char
            .required()
            .messages({
                'string.min': 'Password must be at least 8 characters',
                'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, one number, and one special character (@$!%*?&)',
                'string.empty': 'Password is required',
            }),

        user_type: Joi.string()
            .valid('customer', 'seller')
            .default('customer'),

        terms_accepted: Joi.boolean()
            .valid(true)
            .required()
            .messages({
                'any.only': 'You must accept the terms and conditions',
                'boolean.base': 'Terms acceptance is required',
            }),
    }),

    // ============ LOGIN ============
    login: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email',
                'string.empty': 'Email is required',
            }),

        password: Joi.string()
            .required()
            .messages({
                'string.empty': 'Password is required',
            }),
    }),

    // ============ SEND OTP ============
    sendOTP: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email',
                'string.empty': 'Email is required',
            }),

        purpose: Joi.string()
            .valid(
                'user_registration',
                'seller_registration',
                'forgot_password',
                'login',
                'email_verification',
                'mobile_verification'
            )
            .required()
            .messages({
                'any.only': 'Invalid OTP purpose',
                'string.empty': 'Purpose is required',
            }),

        mobile_number: Joi.string()
            .pattern(/^[0-9]{10}$/)  // ✅ Changed to 10-digit
            .optional(),
    }),

    // ============ VERIFY OTP ============
    verifyOTP: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email',
                'string.empty': 'Email is required',
            }),

        otp: Joi.string()
            .length(6)
            .pattern(/^[0-9]{6}$/)
            .required()
            .messages({
                'string.length': 'OTP must be 6 digits',
                'string.pattern.base': 'OTP must contain only numbers',
                'string.empty': 'OTP is required',
            }),

        purpose: Joi.string()
            .valid(
                'user_registration',
                'seller_registration',
                'forgot_password',
                'login',
                'email_verification',
                'mobile_verification'
            )
            .required()
            .messages({
                'any.only': 'Invalid OTP purpose',
                'string.empty': 'Purpose is required',
            }),
    }),

    // ============ FORGOT PASSWORD ============
    forgotPassword: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email',
                'string.empty': 'Email is required',
            }),
    }),

    // ============ RESET PASSWORD ============
    resetPassword: Joi.object({
        token: Joi.string()
            .required()
            .messages({
                'string.empty': 'Reset token is required',
            }),

        new_password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)  // ✅ Added special char
            .required()
            .messages({
                'string.min': 'Password must be at least 8 characters',
                'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, one number, and one special character (@$!%*?&)',
                'string.empty': 'New password is required',
            }),

        confirm_password: Joi.string()
            .valid(Joi.ref('new_password'))
            .required()
            .messages({
                'any.only': 'Passwords do not match',
                'string.empty': 'Confirm password is required',
            }),
    }),

    // ============ CHANGE PASSWORD ============
    changePassword: Joi.object({
        current_password: Joi.string()
            .required()
            .messages({
                'string.empty': 'Current password is required',
            }),

        new_password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)  // Added special char
            .required()
            .messages({
                'string.min': 'Password must be at least 8 characters',
                'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, one number, and one special character (@$!%*?&)',
                'string.empty': 'New password is required',
            }),

        confirm_password: Joi.string()
            .valid(Joi.ref('new_password'))
            .required()
            .messages({
                'any.only': 'Passwords do not match',
                'string.empty': 'Confirm password is required',
            }),
    }),

    // ============ REFRESH TOKEN ============
    refreshToken: Joi.object({
        refresh_token: Joi.string()
            .required()
            .messages({
                'string.empty': 'Refresh token is required',
            }),
    }),

    // ============ LOGOUT ============
    logout: Joi.object({
        refresh_token: Joi.string()
            .optional(),
    }),
};

module.exports = authValidation;