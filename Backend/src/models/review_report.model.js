// Review Report schema - Manages customer reports against reviews
const mongoose = require("mongoose");

const review_report_schema = new mongoose.Schema(
    {
        // ============ IDENTIFIERS ============
        report_code: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        }, // e.g., RPT-123456

        // ============ RELATIONSHIPS ============
        review_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
            required: true
        },
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        reported_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ============ REPORT DETAILS ============
        reason: {
            type: String,
            enum: ["Spam", "Offensive Content", "Fake Review", "Harassment", "Misleading Information", "Irrelevant Content", "Policy Violation", "Other"],
            required: true
        },
        description: {
            type: String,
            default: ""
        },

        // ============ REPORT STATUS ============
        status: {
            type: String,
            enum: ["pending", "reviewed", "dismissed", "action_taken"],
            default: "pending"
        },

        // ============ ADMIN ACTION ============
        action_taken: {
            type: String,
            default: null
        },
        resolved_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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
review_report_schema.index({ review_id: 1 });
review_report_schema.index({ status: 1 });
review_report_schema.index({ created_at: -1 });

module.exports = mongoose.model("ReviewReport", review_report_schema);