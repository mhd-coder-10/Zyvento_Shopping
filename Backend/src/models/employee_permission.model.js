// Employee permissions mapping - Links employees to permissions
// Direct permission assignment for employees
// Related to: employee.model.js, permission.model.js

const mongoose = require("mongoose");

const employee_permission_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },

    permission_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission"
    }],

    assigned_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // ======================================

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
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
employee_permission_schema.index({ employee_id: 1 });

module.exports = mongoose.model("EmployeePermission", employee_permission_schema);