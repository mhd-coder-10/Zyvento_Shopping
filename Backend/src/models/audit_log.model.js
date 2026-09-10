// Audit log schema - Activity tracking for admin dashboard
// Stores user actions, module, old/new data, IP
// Related to: user.model.js

const mongoose = require("mongoose");

const audit_log_schema = new mongoose.Schema(
    {
        // ============ RELATIONSHIPS ============
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

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
            enum: [
                "create",
                "read",
                "update",
                "delete",
                "approve",
                "reject",
                "suspend",
                "activate",
                "register",
                "login",
                "logout",
                "export",
                "import",
                "role_change",
                "permission_change"
            ],
            required: true
        },

        module: {
            type: String,
            required: true,
            enum: [
                "auth",
                "user",
                "seller",
                "product",
                "category",
                "order",
                "payment",
                "review",
                "report",
                "role",
                "permission",
                "notification",
                "settings",
                "profile",
                "cart",
                "wishlist",
                "shipping",
                "coupon",
                "return",
                "analytics"
            ]
        },

        module_id: {
            type: mongoose.Schema.Types.ObjectId
        },

        description: {
            type: String
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

        // ============ STATUS ============
        status: {
            type: String,
            enum: ["success", "failed", "pending"],
            default: "success"
        },

        error_message: {
            type: String
        },

        // ============ REQUEST INFO ============
        request_id: {
            type: String
        },

        session_id: {
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
audit_log_schema.index({ user_id: 1, created_at: -1 });
audit_log_schema.index({ module: 1, created_at: -1 });
audit_log_schema.index({ action: 1, created_at: -1 });
audit_log_schema.index({ user_type: 1, created_at: -1 });

module.exports = mongoose.model("AuditLog", audit_log_schema);