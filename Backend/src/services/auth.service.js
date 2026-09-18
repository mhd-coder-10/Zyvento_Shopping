// Handles all authentication business logic
// Manages user registration, login, logout, token refresh, OTP operations
// Also handles password management and profile updates


// Handles all authentication business logic
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user.model');
const Seller = require('../models/seller.model');
const Employee = require('../models/employee.model');
const VerificationOTP = require('../models/verification_otp_model');
const ApiError = require('../utils/apiError');
const jwtHelper = require('../utils/jwtHelper');
const otpHelper = require('../utils/otpHelper');
const emailHelper = require('../utils/emailHelper');
const cloudinaryHelper = require('../utils/cloudinary.helper');
const logger = require('../utils/logger');
const constants = require('../config/constants');
const permissionService = require('./admin/permission.service');


class AuthService {

    // REGISTER 
    async register(userData) {
        const {
            first_name,
            last_name,
            email,
            mobile_number,
            password,
            user_type = 'customer',
            terms_accepted
        } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { mobile_number }
            ]
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                throw ApiError.conflict('Email already registered');
            }
            if (existingUser.mobile_number === mobile_number) {
                throw ApiError.conflict('Mobile number already registered');
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = new User({
            first_name,
            last_name,
            email: email.toLowerCase(),
            mobile_number,
            password: hashedPassword,
            user_type: user_type,
            account_status: 'pending',
            is_email_verified: false,
            is_mobile_verified: false
        });

        await user.save();

        // Generate OTP for email verification
        const otp = otpHelper.generateOTP();
        const expiryTime = otpHelper.generateOTPExpiry();

        await VerificationOTP.create({
            email: user.email,
            otp: otp,
            purpose: 'user_registration',
            expiry_time: expiryTime,
            is_verified: false
        });

        // Send OTP email
        await emailHelper.sendOTPEmail(user.email, otp, 'Email Verification');

        logger.info(`User registered: ${user.email}`, { userId: user._id, userType: user.user_type });

        // Sanitize user response
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refresh_token;

        // Send welcome email
        await emailHelper.sendWelcomeEmail(user.email, `${user.first_name} ${user.last_name}`);

        return {
            user: userResponse,
            message: 'Please verify your email with the OTP sent to your email address.'
        };
    }

    // LOGIN
    async login(email, password) {
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password')
            .populate('role_ids')
            .populate('direct_permissions');

        if (!user) {
            throw ApiError.unauthorized('Account not found with this email');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw ApiError.unauthorized('Incorrect password. Please try again.');
        }

        if (user.account_status === 'blocked') {
            throw ApiError.forbidden('Your account has been blocked. Please contact support.');
        }

        if (user.account_status === 'deleted') {
            throw ApiError.forbidden('Your account has been deleted.');
        }

        if (user.account_status === 'inactive') {
            throw ApiError.forbidden('Your account is inactive. Please contact support.');
        }

        if (!user.is_email_verified && user.user_type !== 'super_admin') {
            throw ApiError.forbidden('Please verify your email before logging in.');
        }

        user.last_login = new Date();
        await user.save({ validateBeforeSave: false });

        const tokens = jwtHelper.generateTokens(user);

        user.refresh_token = tokens.refreshToken;
        await user.save({ validateBeforeSave: false });

        // FETCH USER PERMISSIONS
        let permissions = [];
        try {
            permissions = await permissionService.getUserPermissionKeys(user._id);
        } catch (permErr) {
            logger.error('Failed to fetch user permissions:', permErr);
            permissions = [];
        }

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refresh_token;

        logger.info(`User logged in: ${user.email}`, { userId: user._id, userType: user.user_type });

        return {
            user: userResponse,
            permissions,          // Must be add this to return permissions
            ...tokens
        };
    }

    // LOGOUT
    async logout(userId, refreshToken) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        user.refresh_token = null;
        await user.save({ validateBeforeSave: false });

        logger.info(`User logged out: ${user.email}`, { userId: user._id });

        return { message: 'Logged out successfully' };
    }

    // REFRESH TOKEN
    async refreshToken(refreshToken) {
        const result = await jwtHelper.refreshAccessToken(refreshToken);
        return result;
    }

    // SEND OTP
    async sendOTP({ email, purpose, mobileNumber = null }) {
        const user = await User.findOne({ email: email });
        const otp = otpHelper.generateOTP();
        const expiryTime = otpHelper.generateOTPExpiry();

        await VerificationOTP.create({
            email: email.toLowerCase(),
            mobile_number: mobileNumber,
            otp: otp,
            purpose: purpose,
            expiry_time: expiryTime,
            is_verified: false
        });

        await emailHelper.sendOTPEmail(user.email, otp, purpose);

        logger.info(`OTP sent to ${email} for ${purpose}`);

        return {
            message: 'OTP sent successfully',
            expiryTime: expiryTime
        };
    }

    // VERIFY OTP 
    async verifyOTP({ email, otp, purpose }) {
        const record = await VerificationOTP.findOne({
            email: email.toLowerCase(),
            otp: otp,
            purpose: purpose,
            is_verified: false
        });

        if (!record) {
            throw ApiError.badRequest('Invalid OTP');
        }

        if (otpHelper.isOTPExpired(record.expiry_time)) {
            throw ApiError.badRequest('OTP has expired. Please request a new one.');
        }

        if (record.attempts >= 5) {
            throw ApiError.badRequest('Too many failed attempts. Please request a new OTP.');
        }

        record.is_verified = true;
        record.verified_at = new Date();
        await record.save();

        const user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            user.is_email_verified = true;
            if (user.account_status === 'pending') {
                user.account_status = 'active';
            }
            await user.save();

            logger.info(`Email verified for user: ${user.email}`, { userId: user._id });
        }

        logger.info(`OTP verified for ${email} for ${purpose}`);

        return {
            message: 'OTP verified successfully',
            user: user
        };
    }

    // UPDATED: FORGOT PASSWORD - No Token in URL
    async forgotPassword(email) {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw ApiError.notFound('No account found with this email address. Please register first.');
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token before storing in database
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Store hashed token with expiry
        user.password_reset_token = hashedToken;
        user.password_reset_expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save({ validateBeforeSave: false });

        // Send email with token (but token is NOT visible in URL)
        await emailHelper.sendResetPasswordEmail(
            user.email,
            `${user.first_name} ${user.last_name}`,
            resetToken // This is the RAW token sent in email body
        );

        logger.info(`Password reset requested for ${email}`, { userId: user._id });

        return {
            message: 'Password reset link sent to your email. The link will expire in 15 minutes.'
        };
    }

    // UPDATED: RESET PASSWORD - Verify hashed token
    async resetPassword(token, newPassword) {
        // Hash the incoming token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            password_reset_token: hashedToken,
            password_reset_expiry: { $gt: new Date() }
        });

        if (!user) {
            throw ApiError.badRequest('Invalid or expired reset token. Please request a new one.');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // ✅ Update password and clear reset token
        user.password = hashedPassword;
        user.password_reset_token = null;
        user.password_reset_expiry = null;
        user.password_updated_at = new Date();
        await user.save();

        // ✅ Send password change confirmation email
        await emailHelper.sendPasswordChangeConfirmationEmail(
            user.email,
            `${user.first_name} ${user.last_name}`
        );

        logger.info(`Password reset completed for ${user.email}`, { userId: user._id });

        return {
            message: 'Password reset successfully',
            userId: user._id
        };
    }

    // CHANGE PASSWORD
    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId).select('+password');
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw ApiError.badRequest('Current password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashedPassword;
        user.password_updated_at = new Date();
        await user.save();

        logger.info(`Password changed for ${user.email}`, { userId: user._id });

        return { message: 'Password changed successfully' };
    }

    // GET PROFILE
    async getProfile(userId) {
        const user = await User.findById(userId)
            .select('-password -refresh_token')
            .populate('role_ids')
            .populate('direct_permissions')
            .populate('seller_id')
            .populate('employee_id');

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        let additionalData = {};

        if (user.user_type === 'seller' || user.user_type === 'seller_employee') {
            if (user.seller_id) {
                const seller = await Seller.findById(user.seller_id)
                    .select('business_name business_type verification_status account_status');
                additionalData.seller = seller;
            }
        }

        if (user.user_type === 'seller_employee') {
            if (user.employee_id) {
                const employee = await Employee.findById(user.employee_id)
                    .select('employee_type designations status joining_date');
                additionalData.employee = employee;
            }
        }

        return {
            user,
            ...additionalData
        };
    }

    // UPDATE PROFILE
    async updateProfile(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const allowedFields = ['first_name', 'last_name', 'mobile_number', 'preferences'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        Object.assign(user, filteredData);
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refresh_token;

        logger.info(`Profile updated for ${user.email}`, { userId: user._id });

        return userResponse;
    }

    // UPLOAD PROFILE IMAGE
    async uploadProfileImage(userId, file) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        if (user.profile_image_public_id) {
            await cloudinaryHelper.deleteFile(user.profile_image_public_id);
        }

        const result = await cloudinaryHelper.uploadFile(file.path, {
            folder: `users/${userId}`,
            width: 500,
            height: 500,
            crop: 'fill',
            quality: 'auto',
            format: 'webp'
        });

        user.profile_image = result.url;
        user.profile_image_public_id = result.public_id;
        await user.save();

        logger.info(`Profile image uploaded for ${user.email}`, { userId: user._id });

        return {
            profile_image: result.url,
            public_id: result.public_id
        };
    }

    // DELETE PROFILE IMAGE
    async deleteProfileImage(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        if (!user.profile_image_public_id) {
            throw ApiError.badRequest('No profile image to delete');
        }

        await cloudinaryHelper.deleteFile(user.profile_image_public_id);

        user.profile_image = null;
        user.profile_image_public_id = null;
        await user.save();

        logger.info(`Profile image deleted for ${user.email}`, { userId: user._id });

        return { message: 'Profile image deleted successfully' };
    }

    // VERIFY EMAIL
    async verifyEmail(userId, otp) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        if (user.is_email_verified) {
            throw ApiError.badRequest('Email already verified');
        }

        const record = await VerificationOTP.findOne({
            email: user.email,
            otp: otp,
            purpose: 'user_registration',
            is_verified: false
        });

        if (!record) {
            throw ApiError.badRequest('Invalid OTP');
        }

        if (otpHelper.isOTPExpired(record.expiry_time)) {
            throw ApiError.badRequest('OTP has expired. Please request a new one.');
        }

        record.is_verified = true;
        record.verified_at = new Date();
        await record.save();

        user.is_email_verified = true;
        if (user.account_status === 'pending') {
            user.account_status = 'active';
        }
        await user.save();

        logger.info(`Email verified for ${user.email}`, { userId: user._id });

        return { message: 'Email verified successfully' };
    }

    // RESEND VERIFICATION
    async resendVerification(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        if (user.is_email_verified) {
            throw ApiError.badRequest('Email already verified');
        }

        const otp = otpHelper.generateOTP();
        const expiryTime = otpHelper.generateOTPExpiry();

        await VerificationOTP.create({
            email: user.email,
            otp: otp,
            purpose: 'user_registration',
            expiry_time: expiryTime,
            is_verified: false
        });

        await emailHelper.sendOTPEmail(user.email, otp, 'Email Verification');

        logger.info(`Verification email resent for ${user.email}`, { userId: user._id });

        return { message: 'Verification email sent successfully' };
    }
}

module.exports = new AuthService();