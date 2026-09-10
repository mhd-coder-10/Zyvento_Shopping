// Employee role change history - Tracks role assignments and changes
// Stores old and new role IDs with change reason
// Related to: employee.model.js, role.model.js

const mongoose = require("mongoose");

const employee_role_history_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },

    old_role_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    }],

    new_role_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    }],

    changed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // ======================================

    change_reason: {
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
employee_role_history_schema.index({ employee_id: 1, created_at: -1 });

module.exports = mongoose.model("EmployeeRoleHistory", employee_role_history_schema);