// Generates various types of unique IDs
// Creates UUID, short IDs, order numbers, transaction IDs
// Used for generating unique identifiers for records

const crypto = require('crypto');

class IdGenerator {
    // ============ GENERATE UUID ============
    static generateUUID() {
        return crypto.randomUUID();
    }

    // ============ GENERATE SHORT ID ============
    static generateShortId(length = 12) {
        return crypto.randomBytes(length).toString('hex').toUpperCase();
    }

    // ============ GENERATE NUMERIC OTP ============
    static generateOTP(length = 6) {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    }

    // ============ GENERATE ALPHA NUMERIC OTP ============
    static generateAlphaNumericOTP(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += chars[Math.floor(Math.random() * chars.length)];
        }
        return otp;
    }

    // ============ GENERATE REFERRAL CODE ============
    static generateReferralCode(prefix = 'REF') {
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `${prefix}${random}`;
    }

    // ============ GENERATE SESSION ID ============
    static generateSessionId() {
        return `SESSION_${Date.now()}_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    }

    // ============ GENERATE REQUEST ID ============
    static generateRequestId() {
        return `REQ_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    }

    // ============ GENERATE TOKEN ============
    static generateToken(length = 32) {
        return crypto.randomBytes(length).toString('base64url');
    }

    // ============ GENERATE RESET TOKEN ============
    static generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = IdGenerator;