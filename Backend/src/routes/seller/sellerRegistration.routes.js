// Seller registration route definitions
// OTP verification, registration submission, status check
// Public routes for seller registration flow

const express = require('express');
const router = express.Router();

const sellerRegistrationController = require('../../controllers/seller/sellerRegistration.controller');
const { validate } = require('../../middleware/validation.middleware');
const { strictRateLimiter, otpRateLimiter } = require('../../middleware/rateLimiter.middleware');
const sellerValidation = require('../../validations/seller.validation');
const authValidation = require('../../validations/auth.validation');

/**
 * @swagger
 * tags:
 *   name: Seller Registration
 *   description: Seller registration flow endpoints
 */

// ============ SELLER REGISTRATION FLOW ============

/**
 * @swagger
 * /seller/registration/send-otp:
 *   post:
 *     summary: Step 1 - Send OTP for email verification
 *     description: Send OTP to email for seller registration verification
 *     tags: [Seller Registration]
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
 *                 example: seller@example.com
 *               purpose:
 *                 type: string
 *                 enum: [user_registration, seller_registration, forgot_password, login, email_verification, mobile_verification]
 *                 example: seller_registration
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
 *                       example: OTP sent successfully
 *                     expiryTime:
 *                       type: string
 *                       format: date-time
 *       409:
 *         description: Email already registered as seller
 *       429:
 *         description: Too many requests
 *       422:
 *         description: Validation error
 */
router.post(
    '/send-otp',
    strictRateLimiter,
    validate(authValidation.sendOTP),
    sellerRegistrationController.sendOTP
);

/**
 * @swagger
 * /seller/registration/verify-otp:
 *   post:
 *     summary: Step 2 - Verify OTP
 *     description: Verify OTP for seller registration
 *     tags: [Seller Registration]
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
 *                 example: seller@example.com
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *               purpose:
 *                 type: string
 *                 enum: [user_registration, seller_registration, forgot_password, login, email_verification, mobile_verification]
 *                 example: seller_registration
 *     responses:
 *       200:
 *         description: OTP verified successfully
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
 *                       example: OTP verified successfully. You can now fill registration form.
 *                     verified:
 *                       type: boolean
 *                       example: true
 *                     token:
 *                       type: string
 *       400:
 *         description: Invalid OTP
 *       429:
 *         description: Too many attempts
 *       422:
 *         description: Validation error
 */
router.post(
    '/verify-otp',
    otpRateLimiter,
    validate(authValidation.verifyOTP),
    sellerRegistrationController.verifyOTP
);

/**
 * @swagger
 * /seller/registration/submit:
 *   post:
 *     summary: Step 3 - Submit seller registration form
 *     description: Submit complete seller registration application
 *     tags: [Seller Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_name
 *               - owner_name
 *               - email
 *               - mobile_number
 *               - business_registration_number
 *               - tax_id
 *               - business_address
 *               - bank_details
 *             properties:
 *               business_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               owner_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               mobile_number:
 *                 type: string
 *               business_registration_number:
 *                 type: string
 *               tax_id:
 *                 type: string
 *               business_type:
 *                 type: string
 *                 enum: [individual, company, brand, partnership]
 *                 default: individual
 *               gst_number:
 *                 type: string
 *               pan_number:
 *                 type: string
 *               business_address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - country
 *                   - zip_code
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   zip_code:
 *                     type: string
 *               bank_details:
 *                 type: object
 *                 required:
 *                   - account_holder_name
 *                   - bank_name
 *                   - account_number
 *                   - ifsc_code
 *                 properties:
 *                   account_holder_name:
 *                     type: string
 *                   bank_name:
 *                     type: string
 *                   account_number:
 *                     type: string
 *                   ifsc_code:
 *                     type: string
 *                   upi_id:
 *                     type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     document_type:
 *                       type: string
 *                       enum: [business_license, tax_certificate, identity_proof, address_proof, bank_details, gst_certificate, pan_card]
 *                     document_url:
 *                       type: string
 *     responses:
 *       201:
 *         description: Seller registration submitted successfully
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
 *                     seller_id:
 *                       type: string
 *                     message:
 *                       type: string
 *                       example: Registration submitted successfully. Please wait for admin approval.
 *       409:
 *         description: Seller already registered
 *       422:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */
router.post(
    '/submit',
    strictRateLimiter,
    validate(sellerValidation.sellerRegistration),
    sellerRegistrationController.submitRegistration
);

/**
 * @swagger
 * /seller/registration/status:
 *   get:
 *     summary: Step 4 - Check registration status
 *     description: Check the status of seller registration
 *     tags: [Seller Registration]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Seller email
 *     responses:
 *       200:
 *         description: Registration status fetched successfully
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
 *                     status:
 *                       type: string
 *                       enum: [pending, under_review, approved, rejected, suspended]
 *                     account_status:
 *                       type: string
 *                       enum: [active, blocked, inactive, suspended]
 *                     business_name:
 *                       type: string
 *                     submitted_at:
 *                       type: string
 *                       format: date-time
 *                     rejection_reason:
 *                       type: string
 *       404:
 *         description: No registration found
 *       400:
 *         description: Email is required
 */
router.get(
    '/status',
    sellerRegistrationController.getRegistrationStatus
);

/**
 * @swagger
 * /seller/registration/resend-otp:
 *   post:
 *     summary: Step 5 - Resend OTP
 *     description: Resend OTP for seller registration
 *     tags: [Seller Registration]
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
 *                 example: seller@example.com
 *               purpose:
 *                 type: string
 *                 enum: [user_registration, seller_registration, forgot_password, login, email_verification, mobile_verification]
 *                 example: seller_registration
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       429:
 *         description: Too many requests
 *       422:
 *         description: Validation error
 */
router.post(
    '/resend-otp',
    strictRateLimiter,
    validate(authValidation.sendOTP),
    sellerRegistrationController.resendOTP
);

module.exports = router;