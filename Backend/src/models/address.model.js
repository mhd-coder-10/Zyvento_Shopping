// Address schema - Customer shipping/billing addresses
// Supports multiple address types (home, office, other)
// Related to: user.model.js, order.model.js

const mongoose = require("mongoose");

const address_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // ======================================

    // ============ ADDRESS DETAILS ============
    address_type: {
        type: String,
        enum: ["home", "office", "other"],
        default: "home"
    },

    full_name: {
        type: String,
        required: true
    },

    mobile_number: {
        type: String,
        required: true
    },

    house_number: {
        type: String
    },

    street: {
        type: String
    },

    landmark: {
        type: String
    },

    city: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    pincode: {
        type: String,
        required: true
    },

    is_default: {
        type: Boolean,
        default: false
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
address_schema.index({ user_id: 1 });
address_schema.index({ user_id: 1, is_default: 1 });

module.exports = mongoose.model("Address", address_schema);