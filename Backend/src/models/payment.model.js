
// const mongoose = require("mongoose");

// const payment_schema = new mongoose.Schema({
//     payment_code: { type: String, unique: true, sparse: true, index: true }, // For URL (e.g., PAY-123456)
//     order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
//     order_code: { type: String, default: null }, // Denormalized for easy lookup
//     user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },

//     payment_method: {
//         type: String,
//         enum: ['UPI', 'COD', 'Wallet', 'Net_Banking', 'Debit_Card', 'Credit_Card'],
//         default: 'COD'
//     },
//     payment_gateway: { type: String, default: null },
//     transaction_id: { type: String, unique: true, sparse: true },
//     amount: { type: Number, required: true, min: 0 },

//     payment_status: { type: String, enum: ["pending", "success", "failed", "refunded", "partially_refunded"], default: "pending" },
//     payment_date: { type: Date, default: null },

//     gateway_request: { type: Object, default: {} },
//     gateway_response: { type: Object, default: {} },
//     metadata: { type: Object, default: {} }
// }, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

// payment_schema.index({ order_id: 1 });
// payment_schema.index({ user_id: 1 });
// payment_schema.index({ seller_id: 1 });
// payment_schema.index({ payment_status: 1 });

// module.exports = mongoose.model("Payment", payment_schema);





const mongoose = require("mongoose");

const payment_schema = new mongoose.Schema(
    {
        // ============ IDENTIFIERS ============
        payment_code: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        }, // For URL (e.g., PAY-123456)

        // ============ RELATIONSHIPS ============
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        order_code: {
            type: String,
            default: null
        }, // Denormalized for easy lookup
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

        // ============ PAYMENT DETAILS ============
        payment_method: {
            type: String,
            enum: ['UPI', 'COD', 'Wallet', 'Net_Banking', 'Debit_Card', 'Credit_Card'],
            default: 'COD'
        },
        payment_gateway: {
            type: String,
            default: null
        },
        transaction_id: {
            type: String,
            unique: true,
            sparse: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },

        // ============ PAYMENT STATUS ============
        payment_status: {
            type: String,
            enum: ["pending", "success", "failed", "refunded", "partially_refunded"],
            default: "pending"
        },
        payment_date: {
            type: Date,
            default: null
        },

        // ============ GATEWAY RESPONSE ============
        gateway_request: {
            type: Object,
            default: {}
        },
        gateway_response: {
            type: Object,
            default: {}
        },
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
payment_schema.index({ order_id: 1 });
payment_schema.index({ user_id: 1 });
payment_schema.index({ seller_id: 1 });
payment_schema.index({ payment_status: 1 });

module.exports = mongoose.model("Payment", payment_schema);