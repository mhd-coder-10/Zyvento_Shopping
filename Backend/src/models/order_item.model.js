// Order item schema - Individual items within an order
// Tracks per-item status, pricing, delivery information
// Related to: order.model.js, product.model.js, seller.model.js

const mongoose = require("mongoose");

const order_item_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true
    },

    // ============ PRODUCT SNAPSHOT ============
    product_name: {
        type: String,
        required: true
    },

    product_image: {
        type: String
    },

    variant_name: {
        type: String,
        default: null
    },

    variant_option: {
        type: String,
        default: null
    },

    // ============ QUANTITY & PRICING ============
    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    discount: {
        type: Number,
        default: 0
    },

    total_price: {
        type: Number,
        required: true
    },

    // ============ ITEM STATUS ============
    item_status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "packed",
            "shipped",
            "out_for_delivery",
            "delivered",
            "returned",
            "cancelled"
        ],
        default: "pending"
    },

    // ============ SELLER SPECIFIC TRACKING ============
    tracking_id: {
        type: String,
        default: null
    },

    tracking_carrier: {
        type: String,
        default: null
    },

    tracking_url: {
        type: String,
        default: null
    },

    // ============ DELIVERY INFORMATION ============
    delivery_partner: {
        type: String,
        default: null
    },

    shipped_at: {
        type: Date,
        default: null
    },

    delivered_at: {
        type: Date,
        default: null
    },

    // ============ STATUS HISTORY ============
    status_history: [{
        status: {
            type: String,
            required: true
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        notes: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
},
{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
}
);

// ============ INDEXES ============
order_item_schema.index({ order_id: 1 });
order_item_schema.index({ seller_id: 1, item_status: 1 });
order_item_schema.index({ product_id: 1 });

module.exports = mongoose.model("OrderItem", order_item_schema);


