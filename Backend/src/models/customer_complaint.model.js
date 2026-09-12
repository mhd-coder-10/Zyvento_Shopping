
// Customer Complaint Schema
// Manages customer complaints against orders, products, or sellers
// Always linked to an order, which connects to the specific product and seller
// Different from review_report.model.js which handles reports against reviews

const mongoose = require("mongoose");

const customer_complaint_schema = new mongoose.Schema(
    {
        // ============ IDENTIFIERS ============
        complaint_code: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },

        // ============ RELATIONSHIPS ============
        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        order_code: {
            type: String,
            required: true
        },
        order_item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderItem",
            required: true
        },
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        product_code: {
            type: String,
            required: true
        },
        seller_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            required: true
        },

        // ============ COMPLAINT DETAILS ============
        complaint_type: {
            type: String,
            enum: [
                "damaged_product",
                "wrong_product",
                "counterfeit",
                "missing_item",
                "poor_quality",
                "not_as_described",
                "late_delivery",
                "seller_behavior",
                "seller_fraud",
                "refund_not_received",
                "billing_issue",
                "other"
            ],
            required: true
        },
        severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium"
        },
        title: {
            type: String,
            trim: true,
            maxlength: 200,
            required: true
        },
        description: {
            type: String,
            required: true,
            maxlength: 2000
        },

        // ============ EVIDENCE ============
        evidence_images: {
            type: [String],
            default: []
        },
        evidence_videos: {
            type: [String],
            default: []
        },
        evidence_notes: {
            type: String,
            default: ""
        },

        // ============ COMPLAINT STATUS ============
        status: {
            type: String,
            enum: [
                "pending",
                "under_review",
                "awaiting_seller",
                "awaiting_customer",
                "resolved",
                "rejected",
                "dismissed",
                "escalated"
            ],
            default: "pending"
        },
        priority: {
            type: String,
            enum: ["low", "normal", "high", "urgent"],
            default: "normal"
        },

        // ============ ADMIN RESOLUTION ============
        assigned_to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        resolution: {
            type: String,
            enum: [
                "refund_issued",
                "replacement_sent",
                "seller_warned",
                "seller_penalized",
                "seller_suspended",
                "no_action",
                "other"
            ],
            default: null
        },
        resolution_notes: {
            type: String,
            default: null
        },
        refund_amount: {
            type: Number,
            default: 0,
            min: 0
        },
        resolved_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        resolved_at: {
            type: Date,
            default: null
        },

        // ============ SELLER RESPONSE ============
        seller_response: {
            responded: { type: Boolean, default: false },
            response_text: { type: String, default: "" },
            responded_at: { type: Date, default: null }
        },

        // ============ CUSTOMER FEEDBACK ============
        customer_feedback: {
            satisfied: { type: Boolean, default: null },
            feedback_text: { type: String, default: "" },
            feedback_at: { type: Date, default: null }
        },

        // ============ AUDIT TRAIL ============
        history: [{
            action: { type: String, required: true },
            previous_status: String,
            new_status: String,
            note: String,
            performed_by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            performed_by_type: {
                type: String,
                enum: ["customer", "seller", "admin", "sub_admin", "system"],
                default: "system"
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],

        // ============ SOFT DELETE ============
        deleted_at: {
            type: Date,
            default: null
        },

        // ============ METADATA ============
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
customer_complaint_schema.index({ customer_id: 1, created_at: -1 });
customer_complaint_schema.index({ seller_id: 1, status: 1 });
customer_complaint_schema.index({ product_id: 1, status: 1 });
customer_complaint_schema.index({ order_id: 1 });
customer_complaint_schema.index({ status: 1, priority: -1 });
customer_complaint_schema.index({ complaint_type: 1 });
customer_complaint_schema.index({ assigned_to: 1, status: 1 });
customer_complaint_schema.index({ created_at: -1 });

module.exports = mongoose.model("CustomerComplaint", customer_complaint_schema);