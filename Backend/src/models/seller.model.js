// Seller schema - Manages seller registration, business details, documents
// Stores verification status and account information
// Related to: user.model.js, product.model.js, order.model.js

const mongoose = require("mongoose");

const seller_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    // ======================================

    // ============ BUSINESS DETAILS ============
    business_name: {
        type: String,
        required: true,
        trim: true
    },

    owner_name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    mobile_number: {
        type: String,
        required: true
    },

    business_registration_number: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    tax_id: {
        type: String,
        required: true,
        trim: true
    },

    business_type: {
        type: String,
        enum: ["individual", "company", "brand", "partnership"],
        default: "individual"
    },

    gst_number: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true
    },

    pan_number: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true
    },

    business_address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zip_code: String
    },

    // ============ DOCUMENTS ============
    documents: [{
        document_type: {
            type: String,
            enum: [
                "business_license",
                "tax_certificate",
                "identity_proof",
                "address_proof",
                "bank_details",
                "gst_certificate",
                "pan_card"
            ]
        },
        document_url: String,
        uploaded_at: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false }
    }],

    // ============ BANK DETAILS ============
    bank_details: {
        account_holder_name: String,
        bank_name: String,
        account_number: String,
        ifsc_code: String,
        upi_id: String
    },

    // ============ COMMISSION & SETTINGS ============
    commission_rate: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
    },

    settings: {
        order_processing_time: { type: Number, default: 24 },
        return_policy: { type: String, default: '30 days return policy' },
        shipping_methods: [{
            name: String,
            cost: Number,
            estimated_days: Number
        }]
    },

    // ============ STATISTICS ============
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },

    total_orders: {
        type: Number,
        default: 0
    },

    total_revenue: {
        type: Number,
        default: 0
    },

    // ============ VERIFICATION STATUS ============
    verification_status: {
        type: String,
        enum: ["pending", "under_review", "approved", "rejected", "suspended"],
        default: "pending"
    },

    rejection_reason: {
        type: String,
        default: null
    },

    approved_at: {
        type: Date,
        default: null
    },

    // ============ ACCOUNT STATUS ============
    account_status: {
        type: String,
        enum: ["active", "blocked", "inactive", "suspended"],
        default: "inactive"
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
seller_schema.index({ business_name: 1 });
seller_schema.index({ verification_status: 1, account_status: 1 });
seller_schema.index({ user_id: 1 });

module.exports = mongoose.model("Seller", seller_schema);