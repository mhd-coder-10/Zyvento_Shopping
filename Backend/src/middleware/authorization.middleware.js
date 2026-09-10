// Checks if user has required roles or permissions
// Supports role-based and permission-based access control
// Used in routes to restrict access

const ApiError = require('../utils/apiError');
const permissionService = require('../services/permission.service');

/**
 * Authorization Middleware
 * Checks if user has required roles
 */
const authorize = (...requiredRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return next(ApiError.unauthorized('Authentication required'));
            }

            // Super admin has access to everything
            if (req.userType === 'super_admin') {
                return next();
            }

            if (requiredRoles.length === 0) {
                return next();
            }

            if (!requiredRoles.includes(req.userType)) {
                return next(
                    ApiError.forbidden('You do not have permission to access this resource')
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Permission Check Middleware
 * Checks if user has specific permission
 */
const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(ApiError.unauthorized('Authentication required'));
            }

            // Super admin has all permissions
            if (req.userType === 'super_admin') {
                return next();
            }

            const hasPermission = await permissionService.hasPermission(
                req.userId,
                requiredPermission
            );

            if (!hasPermission) {
                return next(
                    ApiError.forbidden(`Permission '${requiredPermission}' required`)
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Seller Access Check Middleware
 * Ensures user can only access their own seller data
 */
const checkSellerAccess = (paramName = 'sellerId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return next(ApiError.unauthorized('Authentication required'));
            }

            // Super admin and admins can access all
            if (['super_admin', 'sub_admin'].includes(req.userType)) {
                return next();
            }

            const sellerId = req.params[paramName] || req.body[paramName];

            if (!sellerId) {
                return next(ApiError.badRequest('Seller ID is required'));
            }

            // Seller can only access their own data
            if (req.userType === 'seller' || req.userType === 'seller_employee') {
                const userSellerId = req.sellerId?.toString();
                const targetSellerId = sellerId.toString();

                if (userSellerId !== targetSellerId) {
                    return next(
                        ApiError.forbidden('You can only access your own seller data')
                    );
                }
                return next();
            }

            return next(ApiError.forbidden('Insufficient permissions'));
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Employee Access Check Middleware
 * Ensures employee can only access their own data
 */
const checkEmployeeAccess = (paramName = 'employeeId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return next(ApiError.unauthorized('Authentication required'));
            }

            // Super admin and admins can access all
            if (['super_admin', 'sub_admin', 'admin_employee'].includes(req.userType)) {
                return next();
            }

            const employeeId = req.params[paramName] || req.body[paramName];

            if (!employeeId) {
                return next(ApiError.badRequest('Employee ID is required'));
            }

            // Employee can only access their own data
            if (req.userType === 'seller_employee') {
                if (req.employeeId?.toString() !== employeeId.toString()) {
                    return next(
                        ApiError.forbidden('You can only access your own employee data')
                    );
                }
                return next();
            }

            return next(ApiError.forbidden('Insufficient permissions'));
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Sub-Admin Access Check Middleware
 * Ensures sub-admin can only access their department data
 */
const checkSubAdminAccess = () => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return next(ApiError.unauthorized('Authentication required'));
            }

            // Super admin can access all
            if (req.userType === 'super_admin') {
                return next();
            }

            // Sub-admin can access their department
            if (req.userType === 'sub_admin') {
                // Add department based access logic here
                return next();
            }

            return next(ApiError.forbidden('Insufficient permissions'));
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    authorize,
    checkPermission,
    checkSellerAccess,
    checkEmployeeAccess,
    checkSubAdminAccess,
};