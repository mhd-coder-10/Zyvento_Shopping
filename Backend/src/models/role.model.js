// Role schema - Defines roles with assigned permissions
// Supports multiple permissions per role (RBAC)
// Related to: permission.model.js, user.model.js
// A role has a flat list of permissions (no module_access inline)
// Data scope: all | own

const mongoose = require("mongoose");

const role_schema = new mongoose.Schema(
{
    role_name: { type: String, required: true, trim: true },

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

    description: { type: String, trim: true },

    // FLAT permission list (references Permission docs)
    permission_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission"
    }],

    // Amazon-style data scope
    data_scope: {
        type: String,
        enum: ["all", "own"],
        default: "own"
    },

    is_system_role: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
},
{
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
}
);

// ============ INDEXES ============
role_schema.index({ role_type: 1, is_active: 1 });


module.exports = mongoose.model("Role", role_schema);