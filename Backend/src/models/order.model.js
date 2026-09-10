
// Order schema - Manages customer orders with multiple items
// const mongoose = require("mongoose");

// const order_schema = new mongoose.Schema(
//     {
//         // ============ ORDER IDENTIFIERS ============
//         order_code: { type: String, unique: true, sparse: true, index: true }, // For URL (e.g., ORD-123456)
//         order_number: { type: String, required: true, unique: true },

//         // ============ RELATIONSHIPS ============
//         user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//         seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
//         order_items: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }],
//         payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
//         coupon_id: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
//         cancelled_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

//         // ============ SHIPPING ADDRESS ============
//         shipping_address: {
//             full_name: String,
//             mobile_number: String,
//             house_number: String,
//             street: String,
//             landmark: String,
//             city: String,
//             state: String,
//             country: String,
//             pincode: String
//         },

//         // ============ ORDER TOTALS ============
//         total_items: { type: Number, default: 0 },
//         subtotal: { type: Number, default: 0 },
//         discount_amount: { type: Number, default: 0 },
//         delivery_charge: { type: Number, default: 0 },
//         total_amount: { type: Number, required: true },

//         // ============ PAYMENT STATUS ============
//         payment_status: { type: String, enum: ["pending", "paid", "failed", "refunded", "partially_refunded"], default: "pending" },

//         payment_method: {
//             type: String,
//             enum: ['UPI', 'COD', 'Wallet', 'Net_Banking', 'Debit_Card', 'Credit_Card'],
//             default: 'COD'
//         },
//         // ============ ORDER STATUS ============
//         order_status: { type: String, enum: ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"], default: "pending" },

//         // ============ STATUS HISTORY ============
//         status_history: [{
//             status: { type: String, required: true },
//             updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//             notes: String,
//             timestamp: { type: Date, default: Date.now }
//         }],

//         // ============ TRACKING DETAILS ============
//         tracking_id: { type: String, default: null },
//         tracking_carrier: { type: String, default: null },
//         tracking_url: { type: String, default: null },

//         // ============ CANCELLATION DETAILS ============
//         cancelled_reason: { type: String, default: null },
//         cancelled_at: { type: Date, default: null },

//         // ============ DELIVERY DETAILS ============
//         delivered_at: { type: Date, default: null },

//         // ============ NOTES ============
//         notes: { type: String },
//         admin_notes: { type: String },

//         // ============ METADATA ============
//         metadata: { type: Object, default: {} }
//     },
//     { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
// );

// order_schema.index({ user_id: 1, created_at: -1 });
// order_schema.index({ seller_id: 1, created_at: -1 });
// order_schema.index({ seller_id: 1, order_status: 1 });
// order_schema.index({ payment_status: 1 });
// order_schema.index({ order_status: 1 });

// module.exports = mongoose.model("Order", order_schema);





// Order schema - Manages customer orders with multiple items
const mongoose = require("mongoose");

const order_schema = new mongoose.Schema(
    {
        // ============ ORDER IDENTIFIERS ============
        order_code: { type: String, unique: true, sparse: true, index: true }, // For URL (e.g., ORD-123456)
        order_number: { type: String, required: true, unique: true },

        // ============ RELATIONSHIPS ============
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
        order_items: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }],
        payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
        coupon_id: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
        cancelled_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        // ============ SHIPPING ADDRESS ============
        shipping_address: {
            full_name: String,
            mobile_number: String,
            house_number: String,
            street: String,
            landmark: String,
            city: String,
            state: String,
            country: String,
            pincode: String
        },

        // ============ ORDER TOTALS ============
        total_items: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
        discount_amount: { type: Number, default: 0 },
        delivery_charge: { type: Number, default: 0 },
        total_amount: { type: Number, required: true },

        // ============ PAYMENT STATUS ============
        payment_status: { type: String, enum: ["pending", "paid", "failed", "refunded", "partially_refunded"], default: "pending" },

        payment_method: {
            type: String,
            enum: ['UPI', 'COD', 'Wallet', 'Net_Banking', 'Debit_Card', 'Credit_Card'],
            default: 'COD'
        },
        // ============ ORDER STATUS ============
        order_status: { type: String, enum: ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"], default: "pending" },

        // ============ STATUS HISTORY ============
        status_history: [{
            status: { type: String, required: true },
            updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            notes: String,
            timestamp: { type: Date, default: Date.now }
        }],

        // ============ TRACKING DETAILS ============
        tracking_id: { type: String, default: null },
        tracking_carrier: { type: String, default: null },
        tracking_url: { type: String, default: null },

        // ============ CANCELLATION DETAILS ============
        cancelled_reason: { type: String, default: null },
        cancelled_at: { type: Date, default: null },

        // ============ DELIVERY DETAILS ============
        delivered_at: { type: Date, default: null },

        // ============ COMMISSION & REVENUE ============
        commission_rate: {
            type: Number,
            default: null
        },
        commission_amount: {
            type: Number,
            default: null
        },
        commission_snapshot: {
            rate: Number,
            amount: Number,
            recorded_at: Date
        },
        settlement_status: {
            type: String,
            enum: ['pending', 'processing', 'settled'],
            default: 'pending'
        },
        settlement_date: {
            type: Date,
            default: null
        },

        // ============ NOTES ============
        notes: { type: String },
        admin_notes: { type: String },

        // ============ METADATA ============
        metadata: { type: Object, default: {} }
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

order_schema.index({ user_id: 1, created_at: -1 });
order_schema.index({ seller_id: 1, created_at: -1 });
order_schema.index({ seller_id: 1, order_status: 1 });
order_schema.index({ payment_status: 1 });
order_schema.index({ order_status: 1 });
order_schema.index({ settlement_status: 1 });

module.exports = mongoose.model("Order", order_schema);