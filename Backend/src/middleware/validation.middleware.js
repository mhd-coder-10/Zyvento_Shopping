// Validates incoming request data using Joi schemas
// Returns validation errors if data is invalid
// Attaches validated data to request object

// const Joi = require('joi');
// const ApiError = require('../utils/apiError');

// const validate = (schema) => {
//     return (req, res, next) => {
//         // Decide which part of request to validate
//         const dataToValidate = { ...req.body, ...req.query, ...req.params };
        
//         // Joi validation
//         const { error, value } = schema.validate(dataToValidate, {
//             abortEarly: false,
//             stripUnknown: true,
//             allowUnknown: true,
//         });

//         if (error) {
//             const errors = error.details.map((detail) => ({
//                 field: detail.path.join('.'),
//                 message: detail.message.replace(/['"]/g, ''),
//             }));

//             return next(ApiError.validation('Validation failed', errors));
//         }

//         // Attach validated data back to request
//         req.validatedData = value;
//         req.body = { ...req.body, ...value };

//         next();
//     };
// };

// /**
//  * Validate specific request part
//  */
// const validateBody = (schema) => {
//     return (req, res, next) => {
//         const { error, value } = schema.validate(req.body, {
//             abortEarly: false,
//             stripUnknown: true,
//         });

//         if (error) {
//             const errors = error.details.map((detail) => ({
//                 field: detail.path.join('.'),
//                 message: detail.message.replace(/['"]/g, ''),
//             }));

//             return next(ApiError.validation('Validation failed', errors));
//         }

//         req.validatedBody = value;
//         req.body = value;
//         next();
//     };
// };

// const validateQuery = (schema) => {
//     return (req, res, next) => {
//         const { error, value } = schema.validate(req.query, {
//             abortEarly: false,
//             stripUnknown: true,
//         });

//         if (error) {
//             const errors = error.details.map((detail) => ({
//                 field: detail.path.join('.'),
//                 message: detail.message.replace(/['"]/g, ''),
//             }));

//             return next(ApiError.validation('Query validation failed', errors));
//         }

//         req.validatedQuery = value;
//         req.query = value;
//         next();
//     };
// };

// const validateParams = (schema) => {
//     return (req, res, next) => {
//         const { error, value } = schema.validate(req.params, {
//             abortEarly: false,
//             stripUnknown: true,
//         });

//         if (error) {
//             const errors = error.details.map((detail) => ({
//                 field: detail.path.join('.'),
//                 message: detail.message.replace(/['"]/g, ''),
//             }));

//             return next(ApiError.validation('Params validation failed', errors));
//         }

//         req.validatedParams = value;
//         req.params = value;
//         next();
//     };
// };

// module.exports = {
//     validate,
//     validateBody,
//     validateQuery,
//     validateParams,
// };





const Joi = require('joi');
const ApiError = require('../utils/apiError');

const validate = (schema) => {
    return (req, res, next) => {
        // ✅ Check if schema exists, else skip validation
        if (!schema) {
            return next();
        }

        // Decide which part of request to validate
        const dataToValidate = { ...req.body, ...req.query, ...req.params };
        
        // Joi validation
        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
            stripUnknown: true,
            allowUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, ''),
            }));

            return next(ApiError.validation('Validation failed', errors));
        }

        // Attach validated data back to request
        req.validatedData = value;
        req.body = { ...req.body, ...value };

        next();
    };
};

/**
 * Validate specific request part
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        if (!schema) return next();
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, ''),
            }));

            return next(ApiError.validation('Validation failed', errors));
        }

        req.validatedBody = value;
        req.body = value;
        next();
    };
};

const validateQuery = (schema) => {
    return (req, res, next) => {
        if (!schema) return next();
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, ''),
            }));

            return next(ApiError.validation('Query validation failed', errors));
        }

        req.validatedQuery = value;
        req.query = value;
        next();
    };
};

const validateParams = (schema) => {
    return (req, res, next) => {
        if (!schema) return next();
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, ''),
            }));

            return next(ApiError.validation('Params validation failed', errors));
        }

        req.validatedParams = value;
        req.params = value;
        next();
    };
};

module.exports = {
    validate,
    validateBody,
    validateQuery,
    validateParams,
};