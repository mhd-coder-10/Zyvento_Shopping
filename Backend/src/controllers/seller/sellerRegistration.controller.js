// Handles seller registration flow API requests
// Manages OTP sending, verification, and registration submission
// Also handles registration status and resend OTP

const sellerRegistrationService = require('../../services/seller/sellerRegistration.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service'); // ✅ ADDED

const sellerRegistrationController = {

    // ============ STEP 1: SEND OTP ============
    sendOTP: asyncHandler(async (req, res) => {
        const { email, purpose } = req.body;
        const result = await sellerRegistrationService.sendOTP({ email, purpose });

        // ✅ AUDIT LOG - OTP Sent
        await auditService.log({
            userId: null,
            action: 'send_otp',
            module: 'seller_registration',
            description: `OTP sent to ${email} for seller registration`,
            newData: { email, purpose },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'OTP sent successfully. Please check your email.')
        );
    }),

    // ============ STEP 2: VERIFY OTP ============
    verifyOTP: asyncHandler(async (req, res) => {
        const { email, otp, purpose } = req.body;
        const result = await sellerRegistrationService.verifyOTP({ email, otp, purpose });

        // ✅ AUDIT LOG - OTP Verified
        await auditService.log({
            userId: null,
            action: 'verify_otp',
            module: 'seller_registration',
            description: `OTP verified for ${email}`,
            newData: { email, purpose },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'OTP verified successfully. You can now fill registration form.')
        );
    }),

    // ============ STEP 3: SUBMIT REGISTRATION ============
    submitRegistration: asyncHandler(async (req, res) => {
        const registrationData = req.body;
        const result = await sellerRegistrationService.submitRegistration(registrationData);

        // ✅ AUDIT LOG - Registration Submitted
        await auditService.log({
            userId: result.seller_id,
            action: 'register',
            module: 'seller',
            moduleId: result.seller_id,
            description: `Seller registration submitted: ${registrationData.business_name}`,
            newData: { 
                business_name: registrationData.business_name,
                email: registrationData.email,
                business_type: registrationData.business_type
            },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(201).json(
            ApiResponse.created(
                result,
                'Seller registration submitted successfully. Please wait for admin approval.'
            )
        );
    }),

    // ============ STEP 4: CHECK REGISTRATION STATUS ============
    getRegistrationStatus: asyncHandler(async (req, res) => {
        const { email } = req.query;
        if (!email) {
            throw ApiError.badRequest('Email is required');
        }
        const status = await sellerRegistrationService.getRegistrationStatus(email);
        res.status(200).json(
            ApiResponse.success(status, 'Registration status fetched successfully')
        );
    }),

    // ============ STEP 5: RESEND OTP ============
    resendOTP: asyncHandler(async (req, res) => {
        const { email, purpose } = req.body;
        const result = await sellerRegistrationService.resendOTP({ email, purpose });

        // ✅ AUDIT LOG - OTP Resent
        await auditService.log({
            userId: null,
            action: 'resend_otp',
            module: 'seller_registration',
            description: `OTP resent to ${email}`,
            newData: { email, purpose },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'OTP resent successfully. Please check your email.')
        );
    })
};

module.exports = sellerRegistrationController;