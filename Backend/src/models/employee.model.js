// Employee schema - Manages seller employees with multiple roles
// Supports multiple designations and role assignments
// Related to: user.model.js, seller.model.js, role.model.js

const mongoose = require("mongoose");

const employee_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // MULTIPLE SELLERS SUPPORT
    seller_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller"
    }],

    // LEGACY SUPPORT (Single seller ke liye)
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        default: null
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // ============ MULTIPLE ROLES SUPPORT ============
    role_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    }],
    // ======================================

    // ============ EMPLOYEE TYPE ============
    employee_type: {
        type: String,
        enum: [
        "manager",
        "product_manager",
        "order_manager",
        "inventory_manager",
        "support_staff",
        "account_manager"
    ],
        required: true
    },

    // ============ MULTIPLE DESIGNATIONS ============
    designations: [{
        type: String,
        trim: true
    }],

    department: {
        type: String,
        trim: true
    },

    departments: [{
        type: String,
        trim: true
    }],

    // ============ ROLE PERMISSIONS ============
    role_permissions: [{
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        },
        is_active: { type: Boolean, default: true }
    }],

    // ============ EMPLOYMENT DETAILS ============
    joining_date: {
        type: Date
    },

    // ============ STATUS ============
    status: {
        type: String,
        enum: ["active", "inactive", "blocked", "pending"],
        default: "pending"
    },

    notes: {
        type: String
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
employee_schema.index({ user_id: 1 });
employee_schema.index({ seller_ids: 1 });      // ✅ Multiple sellers index
employee_schema.index({ seller_id: 1, status: 1 });
employee_schema.index({ employee_type: 1 });
employee_schema.index({ role_ids: 1 });

module.exports = mongoose.model("Employee", employee_schema);