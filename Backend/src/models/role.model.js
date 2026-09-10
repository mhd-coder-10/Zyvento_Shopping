// Role schema - Defines roles with assigned permissions
// Supports multiple permissions per role (RBAC)
// Related to: permission.model.js, user.model.js

const mongoose = require("mongoose");

const role_schema = new mongoose.Schema(
{
    role_name: {
        type: String,
        required: true,
        trim: true
    },

    role_key: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    role_type: {
        type: String,
        enum: ["system", "admin", "sub_admin", "seller", "employee", "customer"],
        required: true
    },

    description: {
        type: String,
        trim: true
    },

    // ============ PERMISSIONS ============
    permission_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission"
    }],

    // ============ MODULE ACCESS ============
    module_access: [{
        module: {
            type: String,
            required: true
        },
        permissions: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            manage: { type: Boolean, default: false },
            approve: { type: Boolean, default: false },
            reject: { type: Boolean, default: false },
            export: { type: Boolean, default: false },
            import: { type: Boolean, default: false }
        },
        fields: [String]
    }],

    // ============ DATA SCOPE ============
    data_scope: {
        type: String,
        enum: ["all", "own", "department", "seller_only", "custom"],
        default: "own"
    },

    custom_scope: {
        type: Object,
        default: null
    },

    // ============ SYSTEM ROLE ============
    is_system_role: {
        type: Boolean,
        default: false
    },

    is_active: {
        type: Boolean,
        default: true
    },

    priority: {
        type: Number,
        default: 0
    },

    // ============ AUDIT ============
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

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
role_schema.index({ role_type: 1, is_active: 1 });
role_schema.index({ role_name: 1, role_type: 1 }, { unique: true });

module.exports = mongoose.model("Role", role_schema);