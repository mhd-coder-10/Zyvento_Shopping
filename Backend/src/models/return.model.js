
const mongoose = require("mongoose");

const return_schema = new mongoose.Schema(
    {
        // ============ IDENTIFIERS ============
        order_code: {
            type: String,
            required: true,
            unique: true // Unique index only here
        },

        // ============ RELATIONSHIPS ============
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
        order_item_id: { type: mongoose.Schema.Types.ObjectId, ref: "OrderItem", required: true },
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        product_code: { type: String, required: true },
        seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
        approved_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        // ============ RETURN DETAILS ============
        return_reason: { type: String, required: true },
        return_description: { type: String },
        return_images: { type: [String], default: [] },

        // ============ RETURN STATUS ============
        return_status: { type: String, enum: ["requested", "approved", "rejected", "picked", "completed"], default: "requested" },

        // ============ REFUND DETAILS ============
        refund_status: { type: String, enum: ["pending", "processed", "failed"], default: "pending" },
        refund_amount: { type: Number, default: 0 },
        refund_transaction_id: { type: String, default: null },

        // ============ ADMIN COMMENTS ============
        admin_comment: { type: String },

        // ============ TIMESTAMPS ============
        approved_at: { type: Date, default: null },
        picked_at: { type: Date, default: null },
        completed_at: { type: Date, default: null },

        // ============ METADATA ============
        metadata: { type: Object, default: {} }
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Only one index for user, seller, status (no order_code index - already unique via field)
return_schema.index({ user_id: 1 });
return_schema.index({ seller_id: 1 });
return_schema.index({ return_status: 1 });

module.exports = mongoose.model("Return", return_schema);