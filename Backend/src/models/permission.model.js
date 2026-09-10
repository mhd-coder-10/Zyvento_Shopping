// Permission schema - Defines individual permissions for modules
// Each permission has module, action (create/read/update/delete)
// Related to: role.model.js

const mongoose = require("mongoose");

const permission_schema = new mongoose.Schema(
{
    permission_name: {
        type: String,
        required: true,
        trim: true
    },

    permission_key: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    module_name: {
        type: String,
        required: true,
        trim: true
    },

    sub_module: {
        type: String,
        trim: true,
        default: null
    },

    action: {
        type: String,
        enum: [
            "create", "read", "update", "delete", "manage",
            "approve", "reject", "export", "import",
            "view_all", "view_own", "assign", "revoke"
        ],
        required: true
    },

    description: {
        type: String,
        trim: true
    },

    is_system: {
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
permission_schema.index({ module_name: 1, action: 1 });
permission_schema.index({ module_name: 1, sub_module: 1 });

module.exports = mongoose.model("Permission", permission_schema);