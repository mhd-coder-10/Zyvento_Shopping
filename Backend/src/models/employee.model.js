
// Employee schema - Manages seller employees (seller's staff)
// Distinct from Sub-Admin (which is Zyvento's own staff)
// Related to: user.model.js, seller.model.js, role.model.js

const mongoose = require("mongoose");

const employee_schema = new mongoose.Schema(
{
    // ============ IDENTIFIERS ============
    employee_code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },

    // ============ RELATIONSHIPS ============
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    // Single seller link (primary owner)
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true,
        index: true
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // ============ DENORMALIZED (for fast list rendering) ============
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile_number: { type: String, trim: true, default: null },

    // ============ EMPLOYEE DETAILS ============
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
        required: true,
        index: true
    },

    designation: { type: String, trim: true, default: null },
    department: { type: String, trim: true, default: null },

    joining_date: { type: Date, default: null },

    // ============ ROLES ============
    role_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    }],

    role_history: [{
        role_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
        changed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changed_at: { type: Date, default: Date.now },
        reason: String
    }],

    // ============ STATUS ============
    status: {
        type: String,
        enum: ["pending", "active", "inactive", "blocked"],
        default: "pending",
        index: true
    },

    status_history: [{
        from: { type: String },
        to: { type: String, required: true },
        changed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, default: '' },
        notes: { type: String, default: '' },
        changed_at: { type: Date, default: Date.now }
    }],

    notes: { type: String, default: '' },

    // ============ SOFT DELETE ============
    is_deleted: { type: Boolean, default: false, index: true },
    deleted_at: { type: Date, default: null },
    deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
},
{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
}
);

// ============ INDEXES ============

employee_schema.index({ seller_id: 1, status: 1 });
employee_schema.index({ role_ids: 1 });
employee_schema.index({ is_deleted: 1, status: 1, created_at: -1 });

module.exports = mongoose.model("Employee", employee_schema);