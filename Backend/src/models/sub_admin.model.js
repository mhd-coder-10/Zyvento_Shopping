// Sub-admin schema - Manages sub-admin details and role history
// Tracks role changes and performance metrics
// Related to: user.model.js, role.model.js

const mongoose = require("mongoose");

const sub_admin_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    assigned_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    suspended_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    // ======================================

    // ============ SUB-ADMIN DETAILS ============
    sub_admin_type: {
        type: String,
        enum: [
        "manager",
        "finance_manager",
        "support_manager",
        "seller_manager"
    ],
        required: true
    },

    department: {
        type: String,
        required: true,
        trim: true
    },

    designation: {
        type: String,
        trim: true
    },

    // ============ MULTIPLE ROLES SUPPORT ============
    current_role_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    }],

    // ============ ROLE HISTORY ============
    role_history: [{
        role_ids: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }],
        assigned_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        assigned_at: {
            type: Date,
            default: Date.now
        },
        reason: String
    }],

    // ============ PERFORMANCE METRICS ============
    performance_metrics: {
        total_tasks_completed: { type: Number, default: 0 },
        total_tasks_assigned: { type: Number, default: 0 },
        average_completion_time: { type: Number, default: 0 },
        tasks_by_module: { type: Object, default: {} },
        success_rate: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        monthly_performance: [{
            month: String,
            tasks_completed: Number,
            tasks_assigned: Number,
            avg_time: Number,
            rating: Number
        }]
    },

    module_activity: [{
        module: String,
        total_actions: Number,
        last_action: Date,
        average_time: Number
    }],

    // ============ STATUS ============
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'pending'],
        default: 'pending'
    },

    last_active: {
        type: Date,
        default: null
    },

    notes: {
        type: String
    },

    suspended_reason: {
        type: String,
        default: null
    },

    suspended_at: {
        type: Date,
        default: null
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
sub_admin_schema.index({ user_id: 1 });
sub_admin_schema.index({ sub_admin_type: 1, status: 1 });
sub_admin_schema.index({ department: 1 });
sub_admin_schema.index({ current_role_ids: 1 });

module.exports = mongoose.model("SubAdmin", sub_admin_schema);