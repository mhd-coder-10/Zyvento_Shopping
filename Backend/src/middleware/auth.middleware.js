
// AUTH MIDDLEWARE - JWT Token Verification
// Description: Verifies JWT token from request headers
// Attaches user object and permissions to request for further use
// Blocks unauthenticated requests

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const environment = require('../config/environment');
const permissionService = require('../services/admin/permission.service');

const auth = asyncHandler(async (req, res, next) => {
    // ============ GET TOKEN FROM HEADER ============
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ApiError.unauthorized('Authentication required. Please provide a valid token.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        throw ApiError.unauthorized('Authentication required. Please provide a valid token.');
    }

    // ============ VERIFY JWT TOKEN ============
    let decoded;
    try {
        decoded = jwt.verify(token, environment.JWT_ACCESS_SECRET);
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw ApiError.unauthorized('Invalid token. Please login again.');
        }
        if (error.name === 'TokenExpiredError') {
            throw ApiError.unauthorized('Token expired. Please refresh your token.');
        }
        throw ApiError.unauthorized('Authentication failed. Please login again.');
    }

    // ============ GET USER FROM DATABASE ============
    const user = await User.findById(decoded.id || decoded.userId)
        .select('-password -refresh_token')
        .populate('role_ids')
        .populate('direct_permissions');

    if (!user) {
        throw ApiError.unauthorized('User not found. Please login again.');
    }

    // ============ CHECK ACCOUNT STATUS ============
    if (user.account_status === 'blocked') {
        throw ApiError.forbidden('Your account has been blocked. Please contact support.');
    }

    if (user.account_status === 'deleted') {
        throw ApiError.forbidden('Your account has been deleted.');
    }

    if (user.account_status === 'inactive') {
        throw ApiError.forbidden('Your account is inactive. Please contact support.');
    }

    // Allow pending users to access only specific routes (like verify-otp)
    // For other routes, check if user is verified
    const publicRoutes = ['/api/auth/verify-otp', '/api/auth/verify-email', '/api/auth/resend-verification'];
    const isPublicRoute = publicRoutes.some(route => req.path.includes(route));

    if (user.account_status === 'pending' && !isPublicRoute) {
        // Allow access to public routes, block others
        if (!req.path.includes('/verify') && !req.path.includes('/resend')) {
            throw ApiError.forbidden('Please verify your email before accessing this resource.');
        }
    }

    // ============ FILTER ACTIVE ROLES ONLY ============
    // Inactive roles must not grant any permission to the user.
    // This ensures that disabling a role immediately revokes its access.
    const activeRoles = (user.role_ids || []).filter(
        (role) => role && role.is_active !== false
    );

    // ============ ATTACH USER TO REQUEST ============
    req.user = user;
    req.userId = user._id;
    req.userType = user.user_type;
    req.sellerId = user.seller_id;
    req.employeeId = user.employee_id;
    req.subAdminType = user.sub_admin_type;
    req.employeeType = user.employee_type;
    req.roleIds = activeRoles.map((r) => r._id);
    req.activeRoles = activeRoles;

    // ============ GET USER PERMISSIONS ============
    // Permission service receives the pre-filtered active roles so that
    // no permission is granted from an inactive role.
    try {
        const permissions = await permissionService.getUserPermissions(user._id);
        req.permissions = permissions || [];
    } catch (error) {
        // If permission service fails, set empty permissions
        req.permissions = [];
    }

    // ============ UPDATE LAST LOGIN ============
    // Only update if not already updated in last 5 minutes (to avoid multiple updates)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (!user.last_login || user.last_login < fiveMinutesAgo) {
        user.last_login = new Date();
        await user.save({ validateBeforeSave: false });
    }

    next();
});

module.exports = auth;