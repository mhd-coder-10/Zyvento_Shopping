// User activity log - Tracks all user actions
// Stores action type, module, IP, user agent
// Related to: user.model.js

const mongoose = require("mongoose");

const user_activity_log_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // ======================================

    // ============ USER TYPE ============
    user_type: {
        type: String,
        enum: [
            "super_admin",
            "sub_admin",
            "admin_employee",
            "seller",
            "seller_employee",
            "customer"
        ],
        required: true
    },

    // ============ ACTION DETAILS ============
    action: {
        type: String,
        required: true
    },

    action_type: {
        type: String,
        enum: [
            "login",
            "logout",
            "create",
            "update",
            "delete",
            "view",
            "export",
            "import",
            "approve",
            "reject",
            "suspend",
            "activate",
            "deactivate",
            "role_change",
            "permission_change",
            "password_change",
            "profile_update"
        ],
        required: true
    },

    // ============ MODULE DETAILS ============
    module: {
        type: String,
        required: true
    },

    module_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    description: {
        type: String,
        trim: true
    },

    // ============ DATA CHANGES ============
    old_data: {
        type: Object,
        default: {}
    },

    new_data: {
        type: Object,
        default: {}
    },

    changes: {
        type: Object,
        default: {}
    },

    // ============ REQUEST INFO ============
    ip_address: {
        type: String
    },

    user_agent: {
        type: String
    },

    device_info: {
        type: Object,
        default: {}
    },

    // ============ STATUS ============
    status: {
        type: String,
        enum: ["success", "failed", "pending"],
        default: "success"
    },

    error_message: {
        type: String
    },

    // ============ PERFORMANCE ============
    response_time: {
        type: Number // in milliseconds
    },

    // ============ REQUEST INFO ============
    session_id: {
        type: String
    },

    request_id: {
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
        updatedAt: false
    }
}
);

// ============ INDEXES ============
user_activity_log_schema.index({ user_id: 1, created_at: -1 });
user_activity_log_schema.index({ module: 1, created_at: -1 });
user_activity_log_schema.index({ action_type: 1, created_at: -1 });
user_activity_log_schema.index({ user_type: 1, created_at: -1 });
user_activity_log_schema.index({ session_id: 1 });

module.exports = mongoose.model("UserActivityLog", user_activity_log_schema);