// Report schema - Manages predefined admin report types
const mongoose = require("mongoose");

const report_schema = new mongoose.Schema(
    {
        // ============ IDENTIFIERS ============
        report_code: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        }, // For URL (e.g., RPT-SALES-001)

        // ============ REPORT DETAILS ============
        report_name: {
            type: String,
            required: true,
            trim: true
        },
        report_type: {
            type: String,
            enum: [
                "sales_report",
                "order_report",
                "user_report",
                "seller_report",
                "product_report",
                "inventory_report",
                "revenue_report"
            ],
            required: true
        },
        description: {
            type: String,
            default: ""
        },

        // ============ STATUS ============
        is_active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

module.exports = mongoose.model("Report", report_schema);