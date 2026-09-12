
const mongoose = require("mongoose");

const product_schema = new mongoose.Schema(
    {
        // ============ PRODUCT CODE (CUSTOM ID) ============
        product_code: {
            type: String,
            unique: true,
            sparse: true,
        },

        // ============ BASIC INFO ============
        product_name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ''
        },

        brand: {
            type: String,
            default: ''
        },

        sku: {
            type: String,
            unique: true,
            sparse: true,
        },

        // ============ PRICING ============
        price: {
            type: Number,
            required: true,
            min: 0
        },

        mrp: {
            type: Number,
            min: 0
        },

        discount_percent: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },

        final_price: {
            type: Number,
            min: 0
        },

        // ============ STOCK ============
        stock_quantity: {
            type: Number,
            default: 0,
            min: 0
        },

        // ============ IMAGES ============
        images: [{
            type: String
        }],

        // ============ RELATIONSHIPS ============
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        sub_category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            default: null
        },

        seller_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            default: null
        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // ============ ATTRIBUTES & TAGS ============
        attributes: {
            type: Object,
            default: {}
        },

        tags: [{
            type: String
        }],

        // ============ STATUS ============
        status: {
            type: String,
            enum: ["pending", "active", "rejected", "suspended", "inactive"],
            default: "pending"
        },

        approval_status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        rejection_reason: {
            type: String,
            default: null
        },

        suspension_reason: {
            type: String,
            default: null
        },

        // ============ APPROVAL INFO ============
        approved_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        approved_at: {
            type: Date,
            default: null
        },

        rejected_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        rejected_at: {
            type: Date,
            default: null
        },

        // ============ TIMESTAMPS ============
        deleted_at: {
            type: Date,
            default: null
        },

        deleted_by: {
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
product_schema.index({ product_name: 1 });
product_schema.index({ category_id: 1 });
product_schema.index({ seller_id: 1 });
product_schema.index({ status: 1 });
product_schema.index({ approval_status: 1 });

module.exports = mongoose.model("Product", product_schema);