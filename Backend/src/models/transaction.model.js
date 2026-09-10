// const mongoose = require("mongoose");

// const transaction_schema = new mongoose.Schema({
//     transaction_code: { type: String, unique: true, sparse: true, index: true }, // For URL (e.g., TXN-123456)
//     payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
//     payment_code: { type: String, default: null },
//     order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
//     order_code: { type: String, default: null },
//     user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },

//     transaction_id: { type: String, required: true, unique: true },
//     transaction_type: { type: String, enum: ["payment", "refund", "payout", "commission", "Expense"], default: "payment" },
//     amount: { type: Number, required: true },

//     status: { type: String, enum: ["pending", "success", "failed", "processing"], default: "pending" },

//     gateway_name: { type: String },
//     gateway_reference: { type: String },
//     gateway_response: { type: Object, default: {} },

//     transaction_date: { type: Date, default: Date.now },
//     settled_date: { type: Date, default: null },
//     metadata: { type: Object, default: {} }
// }, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

// transaction_schema.index({ payment_id: 1 });
// transaction_schema.index({ order_id: 1 });
// transaction_schema.index({ user_id: 1 });
// transaction_schema.index({ seller_id: 1 });
// transaction_schema.index({ status: 1 });

// module.exports = mongoose.model("Transaction", transaction_schema);



const mongoose = require("mongoose");

const transaction_schema = new mongoose.Schema(
    {
        // ============ IDENTIFIERS ============
        transaction_code: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        }, // For URL (e.g., TXN-123456)

        // ============ RELATIONSHIPS ============
        payment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            required: true
        },
        payment_code: {
            type: String,
            default: null
        },
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        order_code: {
            type: String,
            default: null
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        seller_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            required: true
        },

        // ============ TRANSACTION DETAILS ============
        transaction_id: {
            type: String,
            required: true,
            unique: true
        },
        transaction_type: {
            type: String,
            enum: ["payment", "refund", "payout", "commission", "expense"], // Lowercase "expense" (Fixed)
            default: "payment"
        },
        amount: {
            type: Number,
            required: true
        },

        // ============ TRANSACTION STATUS ============
        status: {
            type: String,
            enum: ["pending", "success", "failed", "processing"],
            default: "pending"
        },

        // ============ GATEWAY DETAILS ============
        gateway_name: {
            type: String
        },
        gateway_reference: {
            type: String
        },
        gateway_response: {
            type: Object,
            default: {}
        },

        // ============ TIMESTAMPS ============
        transaction_date: {
            type: Date,
            default: Date.now
        },
        settled_date: {
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
transaction_schema.index({ payment_id: 1 });
transaction_schema.index({ order_id: 1 });
transaction_schema.index({ user_id: 1 });
transaction_schema.index({ seller_id: 1 });
transaction_schema.index({ status: 1 });

module.exports = mongoose.model("Transaction", transaction_schema);