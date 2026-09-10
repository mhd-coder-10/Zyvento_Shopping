// Inventory schema - Manages product stock and availability
// Tracks stock movements, low stock alerts, warehouse info
// Related to: product.model.js, seller.model.js

const mongoose = require("mongoose");

const inventory_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: null
    },


    // ============ STOCK QUANTITIES ============
    stock_quantity: {
        type: Number,
        default: 0,
        min: 0
    },

    sold_quantity: {
        type: Number,
        default: 0,
        min: 0
    },

    reserved_quantity: {
        type: Number,
        default: 0,
        min: 0
    },

    available_quantity: {
        type: Number,
        default: 0,
        min: 0
    },

    // ============ STOCK LIMITS ============
    low_stock_limit: {
        type: Number,
        default: 5,
        min: 0
    },

    stock_status: {
        type: String,
        enum: ["available", "low_stock", "out_of_stock"],
        default: "available"
    },

    // ============ WAREHOUSE ============
    warehouse_location: {
        name: String,
        address: String,
        city: String,
        state: String,
        country: String,
        contact: String
    },

    // ============ RESTOCK DETAILS ============
    last_restocked_at: {
        type: Date,
        default: null
    },

    next_restock_date: {
        type: Date,
        default: null
    },

    // ============ SUPPLIER INFO ============
    supplier_info: {
        name: String,
        contact: String,
        email: String,
        lead_time: Number
    },

    // ============ STOCK MOVEMENTS ============
    stock_movements: [{
        type: {
            type: String,
            enum: ['add', 'remove', 'reserve', 'release', 'sold'],
            required: true
        },
        quantity: { type: Number, required: true },
        reason: String,
        reference_id: { type: mongoose.Schema.Types.ObjectId },
        reference_model: String,
        performed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now }
    }],

    last_stock_update: {
        type: Date,
        default: Date.now
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
inventory_schema.index({ seller_id: 1, product_id: 1 }, { unique: true });
inventory_schema.index({ seller_id: 1, stock_status: 1 });
inventory_schema.index({ product_id: 1 });
inventory_schema.index({ stock_quantity: 1 });

module.exports = mongoose.model("Inventory", inventory_schema);