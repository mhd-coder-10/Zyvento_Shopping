// OTP schema - Email and mobile verification OTPs
// Tracks OTP, purpose, expiry, verification status
// Related to: user.model.js, seller.model.js

const mongoose = require("mongoose");

const verification_otp_schema = new mongoose.Schema(
{
    // ============ CONTACT DETAILS ============
    email: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true
    },

    mobile_number: {
        type: String,
        trim: true,
        sparse: true
    },

    // ============ OTP DETAILS ============
    otp: {
        type: String,
        required: true
    },

    purpose: {
        type: String,
        enum: [
            "user_registration",
            "seller_registration",
            "forgot_password",
            "email_verification",
            "mobile_verification",
            "login"
        ],
        required: true
    },

    // ============ EXPIRY ============
    expiry_time: {
        type: Date,
        required: true
    },

    // ============ VERIFICATION STATUS ============
    is_verified: {
        type: Boolean,
        default: false
    },

    verified_at: {
        type: Date,
        default: null
    },

    // ============ ATTEMPTS ============
    attempts: {
        type: Number,
        default: 0,
        max: 5
    },

    // ============ REQUEST INFO ============
    ip_address: {
        type: String
    },

    user_agent: {
        type: String
    },

    // ============ METADATA ============
    metadata: {
        type: Object,
        default: {}
    }
},
{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
}
);

// ============ INDEXES ============
verification_otp_schema.index({ expiry_time: 1 }, { expireAfterSeconds: 0 });
verification_otp_schema.index({ email: 1, purpose: 1 });
verification_otp_schema.index({ mobile_number: 1, purpose: 1 });

module.exports = mongoose.model("VerificationOTP", verification_otp_schema);