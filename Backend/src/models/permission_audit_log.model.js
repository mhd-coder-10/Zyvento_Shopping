// Permission audit log - Tracks permission changes
// Stores who changed permissions and what changed
// Related to: permission.model.js, role.model.js, user.model.js

const mongoose = require("mongoose");

const permission_audit_log_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    affected_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    affected_role_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },
    // ======================================

    // ============ ACTION ============
    action: {
        type: String,
        enum: [
            "role_created",
            "role_updated",
            "role_deleted",
            "permission_created",
            "permission_updated",
            "permission_deleted",
            "permission_assigned",
            "permission_revoked",
            "role_assigned",
            "role_revoked",
            "scope_changed"
        ],
        required: true
    },

    // ============ OLD STATE ============
    old_state: {
        type: Object,
        default: {}
    },

    // ============ NEW STATE ============
    new_state: {
        type: Object,
        default: {}
    },

    // ============ CHANGES ============
    changes: [{
        field: String,
        old_value: mongoose.Schema.Types.Mixed,
        new_value: mongoose.Schema.Types.Mixed
    }],

    // ============ REASON ============
    reason: {
        type: String,
        trim: true
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
        updatedAt: false
    }
}
);

// ============ INDEXES ============
permission_audit_log_schema.index({ user_id: 1, created_at: -1 });
permission_audit_log_schema.index({ affected_user_id: 1 });
permission_audit_log_schema.index({ affected_role_id: 1 });
permission_audit_log_schema.index({ action: 1 });

module.exports = mongoose.model("PermissionAuditLog", permission_audit_log_schema);