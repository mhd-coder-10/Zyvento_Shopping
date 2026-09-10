// Role change history - Tracks role assignments and revokes
// Stores old and new roles with change reason
// Related to: user.model.js, role.model.js

const mongoose = require("mongoose");

const role_change_history_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    changed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // ======================================

    // ============ OLD ROLES ============
    old_role_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    }],

    // ============ NEW ROLES ============
    new_role_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    }],

    // ============ OLD PERMISSIONS ============
    old_permission_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission"
    }],

    // ============ NEW PERMISSIONS ============
    new_permission_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission"
    }],

    // ============ CHANGE TYPE ============
    change_type: {
        type: String,
        enum: [
            "role_added",
            "role_removed",
            "roles_replaced",
            "permission_added",
            "permission_removed",
            "role_permission_updated",
            "status_changed",
            "department_changed",
            "multiple_roles_updated"
        ],
        required: true
    },

    // ============ CHANGE REASON ============
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
role_change_history_schema.index({ user_id: 1, created_at: -1 });
role_change_history_schema.index({ changed_by: 1 });
role_change_history_schema.index({ change_type: 1 });

module.exports = mongoose.model("RoleChangeHistory", role_change_history_schema);