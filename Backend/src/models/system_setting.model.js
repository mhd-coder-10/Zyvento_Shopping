// System settings schema - Platform configurations
// Stores key-value settings grouped by category
// Related to: admin.service.js

const mongoose = require("mongoose");

const system_setting_schema = new mongoose.Schema(
{
    // ============ SETTING DETAILS ============
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },

    // ============ GROUP ============
    group: {
        type: String,
        enum: [
            "general",
            "payment",
            "shipping",
            "commission",
            "notification",
            "security",
            "email",
            "seller",
            "order",
            "product"
        ],
        required: true
    },

    description: {
        type: String,
        trim: true
    },

    // ============ DATA TYPE ============
    data_type: {
        type: String,
        enum: ["string", "number", "boolean", "array", "object"],
        default: "string"
    },

    // ============ VISIBILITY ============
    is_public: {
        type: Boolean,
        default: false
    },

    is_encrypted: {
        type: Boolean,
        default: false
    },

    // ============ AUDIT ============
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
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
system_setting_schema.index({ group: 1 });
system_setting_schema.index({ status: 1 });

module.exports = mongoose.model("SystemSetting", system_setting_schema);