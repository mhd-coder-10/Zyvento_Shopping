// Wishlist schema - Customer wishlist for products
// Stores products user wants to buy later
// Related to: user.model.js, product.model.js

const mongoose = require("mongoose");

const wishlist_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    products: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        added_at: {
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
wishlist_schema.index({ user_id: 1 });
wishlist_schema.index({ user_id: 1, "products.product_id": 1 });

module.exports = mongoose.model("Wishlist", wishlist_schema);