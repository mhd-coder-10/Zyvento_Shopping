
// Advanced permission checking for complex scenarios
// Supports all/any permissions, module access, field level access
// Used alongside authorization middleware for fine-grained control

const constants = require('../config/constants');
const ApiError = require('../utils/apiError');
const permissionService = require('../services/permission.service');

const permissionsMiddleware = {
    /**
     * Check if user has all required permissions
     */
    hasAllPermissions: (...requiredPermissions) => {
        return async (req, res, next) => {
            try {
                if (!req.user) {
                    return next(ApiError.unauthorized('Authentication required'));
                }

                if (req.userType === 'super_admin') {
                    return next();
                }

                const hasAll = await permissionService.hasAllPermissions(
                    req.userId,
                    requiredPermissions
                );

                if (!hasAll) {
                    return next(
                        ApiError.forbidden(
                            `Missing permissions: ${requiredPermissions.join(', ')}`
                        )
                    );
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    },

    /**
     * Check if user has any of the required permissions
     */
    hasAnyPermission: (...requiredPermissions) => {
        return async (req, res, next) => {
            try {
                if (!req.user) {
                    return next(ApiError.unauthorized('Authentication required'));
                }

                if (req.userType === 'super_admin') {
                    return next();
                }

                const hasAny = await permissionService.hasAnyPermission(
                    req.userId,
                    requiredPermissions
                );

                if (!hasAny) {
                    return next(
                        ApiError.forbidden(
                            `Need at least one of these permissions: ${requiredPermissions.join(', ')}`
                        )
                    );
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    },

    /**
     * Module based permission check
     */
    moduleAccess: (module, action = 'read') => {
        return async (req, res, next) => {
            try {
                if (!req.user) {
                    return next(ApiError.unauthorized('Authentication required'));
                }

                if (req.userType === 'super_admin') {
                    return next();
                }

                const hasAccess = await permissionService.hasModuleAccess(
                    req.userId,
                    module,
                    action
                );

                if (!hasAccess) {
                    return next(
                        ApiError.forbidden(`You don't have ${action} access to ${module}`)
                    );
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    },

    /**
     * Field level access check
     */
    fieldAccess: (module, fields) => {
        return async (req, res, next) => {
            try {
                if (!req.user) {
                    return next(ApiError.unauthorized('Authentication required'));
                }

                if (req.userType === 'super_admin') {
                    return next();
                }

                const allowedFields = [];
                const deniedFields = [];

                for (const field of fields) {
                    const hasAccess = await permissionService.hasFieldAccess(
                        req.userId,
                        module,
                        field
                    );

                    if (hasAccess) {
                        allowedFields.push(field);
                    } else {
                        deniedFields.push(field);
                    }
                }

                if (deniedFields.length > 0 && allowedFields.length === 0) {
                    return next(
                        ApiError.forbidden(
                            `You don't have access to any of these fields: ${deniedFields.join(', ')}`
                        )
                    );
                }

                req.allowedFields = allowedFields;
                req.deniedFields = deniedFields;
                next();
            } catch (error) {
                next(error);
            }
        };
    },

    /**
     * Data scope check (sync – throw is fine here)
     */
    dataScope: (scope) => {
        return (req, res, next) => {
            try {
                if (!req.user) {
                    return next(ApiError.unauthorized('Authentication required'));
                }

                if (req.userType === 'super_admin') {
                    return next();
                }

                const userScope = req.user.role_ids?.[0]?.data_scope || 'own';

                const scopeHierarchy = {
                    own: 1,
                    department: 2,
                    seller_only: 3,
                    all: 4,
                };

                if (scopeHierarchy[userScope] < scopeHierarchy[scope]) {
                    return next(
                        ApiError.forbidden(
                            `You don't have access to ${scope} data. Your scope is ${userScope}`
                        )
                    );
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    },
};

module.exports = permissionsMiddleware;