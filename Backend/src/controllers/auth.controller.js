// Handles all authentication related API requests
// Manages user registration, login, logout, OTP verification
// Also handles password reset, email verification, and profile management

const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const auditService = require('../services/audit.service');
const logger = require('../utils/logger');


const authController = {

    // ============ REGISTER ============
    register: asyncHandler(async (req, res) => {
        const userData = req.body;
        const result = await authService.register(userData);

        // Audit log - Registration
        await auditService.log({
            userId: result.user?._id,
            action: 'register',
            module: 'auth',
            description: `User registered: ${userData.email}`,
            newData: { email: userData.email, userType: userData.user_type },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        // Log important event
        logger.important('New user registered', {
            email: userData.email,
            userType: userData.user_type,
            ip: req.ip
        });

        res.status(201).json(
            ApiResponse.created(result, 'User registered successfully. Please verify your email.')
        );
    }),

    // ============ LOGIN ============
    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        // Audit log - Login
        await auditService.logLogin(
            result.user._id,
            req.ip,
            req.get('user-agent')
        );

        // Log important event
        logger.important('User logged in', {
            email: email,
            userId: result.user._id,
            ip: req.ip
        });

        res.status(200).json(
            ApiResponse.success(result, 'Login successful')
        );
    }),


    // ============ LOGOUT ============
    logout: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { refresh_token } = req.body;

        await authService.logout(userId, refresh_token);

        // Audit log - Logout
        await auditService.logLogout(
            userId,
            req.ip,
            req.get('user-agent')
        );

        res.status(200).json(
            ApiResponse.success(null, 'Logout successful')
        );
    }),

    // ============ REFRESH TOKEN ============
    refreshToken: asyncHandler(async (req, res) => {
        const { refresh_token } = req.body;
        const result = await authService.refreshToken(refresh_token);

        res.status(200).json(
            ApiResponse.success(result, 'Token refreshed successfully')
        );
    }),

    // ============ SEND OTP ============
    sendOTP: asyncHandler(async (req, res) => {
        const { email, purpose, mobile_number } = req.body;
        const result = await authService.sendOTP({ email, purpose, mobileNumber: mobile_number });

        res.status(200).json(
            ApiResponse.success(result, 'OTP sent successfully')
        );
    }),

    // ============ VERIFY OTP ============
    verifyOTP: asyncHandler(async (req, res) => {
        const { email, otp, purpose } = req.body;
        const result = await authService.verifyOTP({ email, otp, purpose });

        res.status(200).json(
            ApiResponse.success(result, 'OTP verified successfully')
        );
    }),

    // ============ FORGOT PASSWORD ============
    forgotPassword: asyncHandler(async (req, res) => {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);

        res.status(200).json(
            ApiResponse.success(result, 'Password reset link sent to your email')
        );
    }),

    // ============ RESET PASSWORD ============
    // resetPassword: asyncHandler(async (req, res) => {
    //     const { token, new_password } = req.body;
    //     const result = await authService.resetPassword(token, new_password);

    //     // Audit log - Password Reset
    //     await auditService.log({
    //         userId: result.userId,
    //         action: 'password_reset',
    //         module: 'auth',
    //         description: 'Password reset successfully',
    //         ip: req.ip,
    //         userAgent: req.get('user-agent'),
    //         status: 'success'
    //     });

    //     // Log important event
    //     logger.important('Password reset completed', {
    //         userId: result.userId,
    //         ip: req.ip
    //     });

    //     res.status(200).json(
    //         ApiResponse.success(result, 'Password reset successfully')
    //     );
    // }),

    // ============ RESET PASSWORD ============
    resetPassword: asyncHandler(async (req, res) => {
        const { token, new_password, confirm_password } = req.body;

        // ✅ Validate passwords match (already done in validation)
        if (new_password !== confirm_password) {
            throw ApiError.badRequest('Passwords do not match');
        }

        const result = await authService.resetPassword(token, new_password);

        // Audit log - Password Reset
        await auditService.log({
            userId: result.userId,
            action: 'password_reset',
            module: 'auth',
            description: 'Password reset successfully',
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        logger.important('Password reset completed', {
            userId: result.userId,
            ip: req.ip
        });

        res.status(200).json(
            ApiResponse.success(result, 'Password reset successfully')
        );
    }),


    // ============ CHANGE PASSWORD ============
    changePassword: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { current_password, new_password } = req.body;

        const result = await authService.changePassword(userId, current_password, new_password);

        // Audit log - Password Change
        await auditService.logPasswordChange(
            userId,
            req.ip,
            req.get('user-agent')
        );

        // Log important event
        logger.important('Password changed', {
            userId: userId,
            ip: req.ip
        });

        res.status(200).json(
            ApiResponse.success(result, 'Password changed successfully')
        );
    }),

    // ============ GET PROFILE ============
    getProfile: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const user = await authService.getProfile(userId);

        res.status(200).json(
            ApiResponse.success(user, 'Profile fetched successfully')
        );
    }),

    // ============ UPDATE PROFILE ============
    updateProfile: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const updateData = req.body;

        const user = await authService.updateProfile(userId, updateData);

        // Audit log - Profile Update
        await auditService.log({
            userId: userId,
            action: 'update',
            module: 'profile',
            moduleId: userId,
            description: 'Profile updated',
            newData: updateData,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        // Log important event
        logger.important('Profile updated', {
            userId: userId,
            updatedFields: Object.keys(updateData)
        });

        res.status(200).json(
            ApiResponse.success(user, 'Profile updated successfully')
        );
    }),

    // ============ UPLOAD PROFILE IMAGE ============
    uploadProfileImage: asyncHandler(async (req, res) => {
        const userId = req.userId;

        if (!req.file) {
            throw ApiError.badRequest('No file uploaded');
        }

        const result = await authService.uploadProfileImage(userId, req.file);

        // Audit log - Profile Image Upload
        await auditService.log({
            userId: userId,
            action: 'upload',
            module: 'profile',
            moduleId: userId,
            description: 'Profile image uploaded',
            newData: { imageUrl: result.profile_image },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Profile image uploaded successfully')
        );
    }),

    // ============ DELETE PROFILE IMAGE ============
    deleteProfileImage: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const result = await authService.deleteProfileImage(userId);

        // Audit log - Profile Image Delete
        await auditService.log({
            userId: userId,
            action: 'delete',
            module: 'profile',
            moduleId: userId,
            description: 'Profile image deleted',
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Profile image deleted successfully')
        );
    }),

    // ============ VERIFY EMAIL ============
    verifyEmail: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { otp } = req.body;

        const result = await authService.verifyEmail(userId, otp);

        // Audit log - Email Verification
        await auditService.log({
            userId: userId,
            action: 'verify',
            module: 'auth',
            moduleId: userId,
            description: 'Email verified',
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        // Log important event
        logger.important('Email verified', {
            userId: userId,
            ip: req.ip
        });

        res.status(200).json(
            ApiResponse.success(result, 'Email verified successfully')
        );
    }),

    // ============ RESEND VERIFICATION ============
    resendVerification: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const result = await authService.resendVerification(userId);

        // Audit log - Resend Verification
        await auditService.log({
            userId: userId,
            action: 'resend',
            module: 'auth',
            moduleId: userId,
            description: 'Verification email resent',
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Verification email sent successfully')
        );
    })
};

module.exports = authController;