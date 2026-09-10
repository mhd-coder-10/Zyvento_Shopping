// Cart schema - Customer shopping cart with items
// Stores product details, quantity, pricing, expiry
// Related to: user.model.js, product.model.js, seller.model.js

const mongoose = require("mongoose");

const cart_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // ======================================

    // ============ CART ITEMS ============
    products: [{
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

        quantity: {
            type: Number,
            default: 1,
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

        final_price: {
            type: Number,
            required: true
        },

        product_name: {
            type: String
        },

        product_image: {
            type: String
        },

        added_at: {
            type: Date,
            default: Date.now
        }
    }],

    // ============ CART TOTALS ============
    total_items: {
        type: Number,
        default: 0
    },

    total_amount: {
        type: Number,
        default: 0
    },

    // ============ CART EXPIRY ============
    cart_expiry: {
        type: Date,
        default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) // 7 days
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
cart_schema.index({ user_id: 1 });
cart_schema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model("Cart", cart_schema);