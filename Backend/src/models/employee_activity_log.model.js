// Employee activity tracking - Logs all actions performed by employees
// Stores action, module, old/new data for audit
// Related to: employee.model.js

const mongoose = require("mongoose");

const employee_activity_log_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },

    performed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // ======================================

    action: {
        type: String,
        required: true
    },

    module_name: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    old_data: {
        type: Object,
        default: {}
    },

    new_data: {
        type: Object,
        default: {}
    },

    ip_address: {
        type: String
    },

    user_agent: {
        type: String
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
employee_activity_log_schema.index({ employee_id: 1, created_at: -1 });

module.exports = mongoose.model("EmployeeActivityLog", employee_activity_log_schema);