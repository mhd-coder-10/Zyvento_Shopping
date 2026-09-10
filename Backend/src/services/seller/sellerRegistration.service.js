// Handles seller registration business logic
// Manages OTP verification, registration submission, and status checks
// Also handles resend OTP and admin notifications

const User = require('../../models/user.model');
const Seller = require('../../models/seller.model');
const VerificationOTP = require('../../models/verification_otp_model');
const Notification = require('../../models/notification.model');
const ApiError = require('../../utils/apiError');
const otpHelper = require('../../utils/otpHelper');
const emailHelper = require('../../utils/emailHelper');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');
const bcrypt = require('bcryptjs');


class SellerRegistrationService {

    // ============ STEP 1: SEND OTP ============
    async sendOTP({ email, purpose }) {
        // Check if email already registered as seller
        const existingSeller = await Seller.findOne({ email: email.toLowerCase() });
        if (existingSeller) {
            throw ApiError.conflict('This email is already registered as a seller');
        }

        // Check if user already exists with this email
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            // Check if user is already a seller
            if (existingUser.user_type === constants.USER_TYPES.SELLER) {
                throw ApiError.conflict('This user is already a seller');
            }
        }

        // Generate OTP
        const otp = otpHelper.generateOTP();
        const expiryTime = otpHelper.generateOTPExpiry();

        // Save OTP to database
        await VerificationOTP.create({
            email: email.toLowerCase(),
            otp: otp,
            purpose: purpose || 'seller_registration',
            expiry_time: expiryTime,
            is_verified: false
        });

        // Send OTP via email
        await emailHelper.sendOTPEmail(email, otp, 'Seller Registration');

        logger.info(`Seller registration OTP sent to ${email}`);

        return {
            message: 'OTP sent successfully',
            expiryTime: expiryTime
        };
    }

    // ============ STEP 2: VERIFY OTP ============
    async verifyOTP({ email, otp, purpose }) {
        const record = await VerificationOTP.findOne({
            email: email.toLowerCase(),
            otp: otp,
            purpose: purpose || 'seller_registration',
            is_verified: false
        });

        if (!record) {
            throw ApiError.badRequest('Invalid OTP');
        }

        // Check if OTP is expired
        if (otpHelper.isOTPExpired(record.expiry_time)) {
            throw ApiError.badRequest('OTP has expired. Please request a new one.');
        }

        // Check attempts
        if (record.attempts >= 5) {
            throw ApiError.badRequest('Too many failed attempts. Please request a new OTP.');
        }

        // Mark as verified
        record.is_verified = true;
        record.verified_at = new Date();
        await record.save();

        logger.info(`Seller registration OTP verified for ${email}`);

        // Generate a verification token for form access
        const verificationToken = otpHelper.generateRandomToken(32);

        return {
            message: 'OTP verified successfully',
            verified: true,
            token: verificationToken
        };
    }

    // ============ STEP 3: SUBMIT REGISTRATION ============
    async submitRegistration(registrationData) {
        const {
            business_name,
            owner_name,
            email,
            mobile_number,
            business_registration_number,
            tax_id,
            business_type,
            gst_number,
            pan_number,
            business_address,
            bank_details,
            documents = []
        } = registrationData;

        // Check if seller already exists
        const existingSeller = await Seller.findOne({
            $or: [
                { email: email.toLowerCase() },
                { business_registration_number: business_registration_number }
            ]
        });

        if (existingSeller) {
            throw ApiError.conflict('Seller already registered with this email or registration number');
        }

        // Check if user exists
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // Check if user is already a seller
            if (user.user_type === constants.USER_TYPES.SELLER) {
                throw ApiError.conflict('This user is already a seller');
            }
        }

        // If user doesn't exist, create a new user with pending status
        if (!user) {
            // Generate temporary password (user will set password later)
            const tempPassword = otpHelper.generateRandomToken(10);
            const hashedPassword = await bcrypt.hash(tempPassword, 12);

            user = new User({
                first_name: owner_name.split(' ')[0] || '',
                last_name: owner_name.split(' ').slice(1).join(' ') || '',
                email: email.toLowerCase(),
                mobile_number: mobile_number,
                password: hashedPassword,
                user_type: constants.USER_TYPES.SELLER,
                account_status: constants.ACCOUNT_STATUS.PENDING,
                is_email_verified: true
            });

            await user.save();
        } else {
            // Update existing user to seller type
            user.user_type = constants.USER_TYPES.SELLER;
            user.account_status = constants.ACCOUNT_STATUS.PENDING;
            await user.save();
        }

        // Create seller
        const seller = new Seller({
            user_id: user._id,
            business_name,
            owner_name,
            email: email.toLowerCase(),
            mobile_number,
            business_registration_number,
            tax_id,
            business_type: business_type || 'individual',
            gst_number: gst_number || null,
            pan_number: pan_number || null,
            business_address: business_address || {},
            bank_details: bank_details || {},
            documents: documents.map(doc => ({
                ...doc,
                uploaded_at: new Date(),
                verified: false
            })),
            verification_status: constants.VERIFICATION_STATUS.PENDING,
            account_status: constants.ACCOUNT_STATUS.INACTIVE
        });

        await seller.save();

        // Update user with seller_id
        user.seller_id = seller._id;
        await user.save();

        // Admin notification for new seller registration
        try {
            // Get all admin users to notify
            const adminUsers = await User.find({
                user_type: { $in: ['super_admin', 'sub_admin'] },
                account_status: constants.ACCOUNT_STATUS.ACTIVE
            }).select('_id user_type');

            // Create notification for each admin
            for (const admin of adminUsers) {
                await Notification.create({
                    user_id: admin._id,
                    receiver_type: admin.user_type === 'super_admin' ? 'super_admin' : 'sub_admin',
                    title: 'New Seller Registration',
                    message: `New seller "${business_name}" has registered and is pending approval.`,
                    notification_type: 'seller',
                    reference_id: seller._id,
                    reference_model: 'Seller',
                    channel: 'in_app',
                    priority: 'high',
                    metadata: {
                        business_name: business_name,
                        email: email,
                        business_type: business_type,
                        registration_number: business_registration_number
                    }
                });
            }
            logger.info(`Admin notifications sent for seller registration: ${email}`);
        } catch (error) {
            logger.error('Failed to send admin notification for seller registration:', error);
        }

        // Log important event for seller registration
        logger.important('New seller registered', {
            businessName: business_name,
            email: email,
            businessType: business_type,
            sellerId: seller._id
        });

        logger.info(`Seller registration submitted: ${email}`, { sellerId: seller._id });

        // Send confirmation email to seller
        await emailHelper.sendEmail({
            to: email,
            subject: 'Seller Registration Submitted',
            text: `Dear ${owner_name},\n\nYour seller registration for "${business_name}" has been submitted successfully.\n\nWe will review your application and notify you once approved.\n\nRegards,\nMarketplace Team`
        });

        return {
            seller_id: seller._id,
            message: 'Registration submitted successfully. Please wait for admin approval.'
        };
    }

    // ============ STEP 4: CHECK REGISTRATION STATUS ============
    async getRegistrationStatus(email) {
        const seller = await Seller.findOne({ email: email.toLowerCase() });

        if (!seller) {
            throw ApiError.notFound('No registration found for this email');
        }

        return {
            status: seller.verification_status,
            account_status: seller.account_status,
            business_name: seller.business_name,
            submitted_at: seller.created_at,
            rejection_reason: seller.rejection_reason || null
        };
    }

    // ============ STEP 5: RESEND OTP ============
    async resendOTP({ email, purpose }) {
        // Check if OTP already exists and delete old ones
        await VerificationOTP.deleteMany({
            email: email.toLowerCase(),
            purpose: purpose || 'seller_registration',
            is_verified: false
        });

        // Generate new OTP
        const otp = otpHelper.generateOTP();
        const expiryTime = otpHelper.generateOTPExpiry();

        await VerificationOTP.create({
            email: email.toLowerCase(),
            otp: otp,
            purpose: purpose || 'seller_registration',
            expiry_time: expiryTime,
            is_verified: false
        });

        await emailHelper.sendOTPEmail(email, otp, 'Seller Registration');

        logger.info(`Seller registration OTP resent to ${email}`);

        return {
            message: 'OTP resent successfully',
            expiryTime: expiryTime
        };
    }
}

module.exports = new SellerRegistrationService();