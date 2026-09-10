const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { strictRateLimiter, otpRateLimiter } = require('../middleware/rateLimiter.middleware');
const authValidation = require('../validations/auth.validation');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *             properties:
 *               first_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: John
 *               last_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               mobile_number:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: John@123
 *               user_type:
 *                 type: string
 *                 enum: [customer, seller]
 *                 default: customer
 *               terms_accepted:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully. Please verify your email.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     message:
 *                       type: string
 *       409:
 *         description: Email or mobile number already registered
 *       422:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */
router.post(
    '/register',
    strictRateLimiter,
    validate(authValidation.register),
    authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and return JWT tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: John@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token (expires in 15 minutes)
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token (expires in 7 days)
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many attempts
 */
router.post(
    '/login',
    strictRateLimiter,
    validate(authValidation.login),
    authController.login
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate user session and clear refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/logout',
    auth,
    authController.logout
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get new access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIs..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
    '/refresh-token',
    validate(authValidation.refreshToken),
    authController.refreshToken
);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to email
 *     description: Send one-time password for verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - purpose
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               purpose:
 *                 type: string
 *                 enum: [user_registration, seller_registration, forgot_password, login, email_verification, mobile_verification]
 *                 example: user_registration
 *               mobile_number:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     expiryTime:
 *                       type: string
 *                       format: date-time
 *       429:
 *         description: Too many OTP requests
 */
router.post(
    '/send-otp',
    otpRateLimiter,
    validate(authValidation.sendOTP),
    authController.sendOTP
);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verify one-time password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - purpose
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *               purpose:
 *                 type: string
 *                 enum: [user_registration, seller_registration, forgot_password, login, email_verification, mobile_verification]
 *                 example: user_registration
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       429:
 *         description: Too many attempts
 */
router.post(
    '/verify-otp',
    otpRateLimiter,
    validate(authValidation.verifyOTP),
    authController.verifyOTP
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset link
 *     description: Send password reset link to user's email (secure - no token in URL)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent
 *       404:
 *         description: User not found
 */
router.post(
    '/forgot-password',
    strictRateLimiter,
    validate(authValidation.forgotPassword),
    authController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     description: Reset user password using secure token (sent via email)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - new_password
 *               - confirm_password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token received in email
 *               new_password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewPass@123
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 example: NewPass@123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post(
    '/reset-password',
    strictRateLimiter,
    validate(authValidation.resetPassword),
    authController.resetPassword
);-





/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password (logged in user)
 *     description: Change password for authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *               - confirm_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 format: password
 *                 example: OldPass@123
 *               new_password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewPass@123
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 example: NewPass@123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/change-password',
    auth,
    validate(authValidation.changePassword),
    authController.changePassword
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Get profile of authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     seller:
 *                       type: object
 *                     employee:
 *                       type: object
 *                     subAdmin:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/profile',
    auth,
    authController.getProfile
);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update current user profile
 *     description: Update profile of authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: John
 *               last_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Doe
 *               mobile_number:
 *                 type: string
 *                 example: "9876543210"
 *               preferences:
 *                 type: object
 *                 properties:
 *                   language:
 *                     type: string
 *                     enum: [en, hi, ta, te, bn, mr, gu]
 *                     default: en
 *                   timezone:
 *                     type: string
 *                     default: UTC
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.put(
    '/profile',
    auth,
    authController.updateProfile
);

/**
 * @swagger
 * /auth/profile-image:
 *   post:
 *     summary: Upload profile image
 *     description: Upload profile picture for authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WEBP)
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile_image:
 *                       type: string
 *                       format: url
 *                     public_id:
 *                       type: string
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 */
router.post(
    '/profile-image',
    auth,
    authController.uploadProfileImage
);

/**
 * @swagger
 * /auth/profile-image:
 *   delete:
 *     summary: Delete profile image
 *     description: Delete profile picture for authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile image deleted successfully
 *       400:
 *         description: No profile image to delete
 *       401:
 *         description: Unauthorized
 */
router.delete(
    '/profile-image',
    auth,
    authController.deleteProfileImage
);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     description: Verify email using OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid OTP or email already verified
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/verify-email',
    auth,
    authController.verifyEmail
);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend email verification
 *     description: Resend verification email with OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: Email already verified
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 */
router.post(
    '/resend-verification',
    auth,
    authController.resendVerification
);

module.exports = router;