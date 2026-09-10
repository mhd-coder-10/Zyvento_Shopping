// Handles JWT token generation, verification, and refresh
// Creates access and refresh tokens for authentication
// Used by auth middleware and auth service

const jwt = require('jsonwebtoken');
const environment = require('../config/environment');
const ApiError = require('./apiError');

class JwtHelper {
    // ============ GENERATE TOKENS ============
    static generateTokens(user) {
        const payload = {
            id: user._id,
            email: user.email,
            userType: user.user_type,
            roleIds: user.role_ids || [],
            sellerId: user.seller_id,
            employeeId: user.employee_id,
            subAdminType: user.sub_admin_type,
            employeeType: user.employee_type,
        };

        const accessToken = jwt.sign(payload, environment.JWT_ACCESS_SECRET, {
            expiresIn: environment.JWT_ACCESS_EXPIRY,
        });

        const refreshToken = jwt.sign({ id: user._id }, environment.JWT_REFRESH_SECRET, {
            expiresIn: environment.JWT_REFRESH_EXPIRY,
        });

        return { accessToken, refreshToken };
    }

    // ============ GENERATE ACCESS TOKEN ============
    static generateAccessToken(user) {
        const payload = {
            id: user._id,
            email: user.email,
            userType: user.user_type,
            roleIds: user.role_ids || [],
            sellerId: user.seller_id,
            employeeId: user.employee_id,
        };

        return jwt.sign(payload, environment.JWT_ACCESS_SECRET, {
            expiresIn: environment.JWT_ACCESS_EXPIRY,
        });
    }

    // ============ GENERATE REFRESH TOKEN ============
    static generateRefreshToken(userId) {
        return jwt.sign({ id: userId }, environment.JWT_REFRESH_SECRET, {
            expiresIn: environment.JWT_REFRESH_EXPIRY,
        });
    }

    // ============ VERIFY ACCESS TOKEN ============
    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, environment.JWT_ACCESS_SECRET);
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw ApiError.unauthorized('Invalid token');
            }
            if (error.name === 'TokenExpiredError') {
                throw ApiError.unauthorized('Token expired. Please refresh.');
            }
            throw ApiError.unauthorized('Authentication failed');
        }
    }

    // ============ VERIFY REFRESH TOKEN ============
    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, environment.JWT_REFRESH_SECRET);
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw ApiError.unauthorized('Invalid refresh token');
            }
            if (error.name === 'TokenExpiredError') {
                throw ApiError.unauthorized('Refresh token expired. Please login again.');
            }
            throw ApiError.unauthorized('Authentication failed');
        }
    }

    // ============ DECODE TOKEN ============
    static decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            return null;
        }
    }

    // ============ GET TOKEN FROM HEADER ============
    static getTokenFromHeader(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.split(' ')[1];
    }

    // ============ REFRESH ACCESS TOKEN ============
    static async refreshAccessToken(refreshToken) {
        const decoded = this.verifyRefreshToken(refreshToken);
        const User = require('../models/user.model');
        const user = await User.findById(decoded.id);
        
        if (!user) {
            throw ApiError.unauthorized('User not found');
        }

        if (user.account_status === 'blocked' || user.account_status === 'deleted') {
            throw ApiError.forbidden('Account is blocked or deleted');
        }

        const newAccessToken = this.generateAccessToken(user);
        return { accessToken: newAccessToken };
    }
}

module.exports = JwtHelper;