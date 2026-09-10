// Generates and verifies OTP (One Time Password)
// Creates OTP expiry time and checks if OTP is expired
// Used for email verification, registration, password reset

const crypto = require('crypto');
const environment = require('../config/environment');

class OtpHelper {
    // ============ GENERATE OTP ============
    static generateOTP(length = environment.OTP_LENGTH) {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    }

    // ============ GENERATE ALPHANUMERIC OTP ============
    static generateAlphaNumericOTP(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += chars[Math.floor(Math.random() * chars.length)];
        }
        return otp;
    }

    // ============ GENERATE OTP EXPIRY ============
    // Add fallback 
    static generateOTPExpiry(minutes = environment.OTP_EXPIRY_MINUTES || 10) {
        return new Date(Date.now() + minutes * 60 * 1000);
    }

    // ============ CHECK OTP EXPIRED ============
    static isOTPExpired(expiryTime) {
        return new Date() > new Date(expiryTime);
    }

    // ============ GET REMAINING TIME ============
    static getRemainingTime(expiryTime) {
        const now = new Date();
        const expiry = new Date(expiryTime);
        const diff = expiry.getTime() - now.getTime();
        return Math.max(0, Math.floor(diff / 1000)); // Return in seconds
    }

    // ============ GENERATE RANDOM TOKEN ============
    static generateRandomToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    // ============ GENERATE REFERRAL CODE ============
    static generateReferralCode(prefix = 'REF') {
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `${prefix}${random}`;
    }

    // ============ GENERATE VERIFICATION CODE ============
    static generateVerificationCode(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    // ============ HASH OTP (For secure storage) ============
    static hashOTP(otp) {
        return crypto.createHash('sha256').update(otp).digest('hex');
    }

    // ============ VERIFY OTP (With hashing) ============
    static verifyOTP(inputOTP, storedHash) {
        const hashedInput = this.hashOTP(inputOTP);
        return hashedInput === storedHash;
    }
}

module.exports = OtpHelper;