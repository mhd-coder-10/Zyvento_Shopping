// Review schema - Product reviews and ratings from customers
// Supports rating, comment, images, helpful votes
// Related to: user.model.js, product.model.js, order.model.js

// const mongoose = require("mongoose");

// const review_schema = new mongoose.Schema(
// {
//     // ============ RELATIONSHIPS ============
//     user_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },

//     product_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Product",
//         required: true
//     },

//     order_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Order",
//         required: true
//     },

//     seller_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Seller",
//         required: true
//     },
//     // ======================================

//     // ============ REVIEW DETAILS ============
//     rating: {
//         type: Number,
//         required: true,
//         min: 1,
//         max: 5
//     },

//     title: {
//         type: String,
//         trim: true
//     },

//     comment: {
//         type: String
//     },

//     images: {
//         type: [String],
//         default: []
//     },

//     // ============ REVIEW STATUS ============
//     review_status: {
//         type: String,
//         enum: ["pending", "approved", "rejected"],
//         default: "pending"
//     },

//     // ============ HELPFUL VOTES ============
//     helpful_count: {
//         type: Number,
//         default: 0
//     },

//     helpful_users: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//     }],

//     // ============ ADMIN COMMENTS ============
//     admin_comment: {
//         type: String
//     },

//     // ============ METADATA ============
//     metadata: {
//         type: Object,
//         default: {}
//     }
// },
// {
//     timestamps: {
//         createdAt: "created_at",
//         updatedAt: "updated_at"
//     }
// }
// );

// // ============ INDEXES ============
// review_schema.index({ product_id: 1, review_status: 1 });
// review_schema.index({ user_id: 1 });
// review_schema.index({ seller_id: 1 });
// review_schema.index({ rating: -1 });
// review_schema.index({ helpful_count: -1 });

// module.exports = mongoose.model("Review", review_schema);




// Review schema - Product reviews and ratings from customers
// Extended for Super Admin moderation, reports, and analytics
const mongoose = require("mongoose");

const review_schema = new mongoose.Schema(
    {
        // ============ IDENTIFIERS ============
        review_code: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        }, // For URL (e.g., REV-123456)

        // ============ RELATIONSHIPS ============
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        product_code: {
            type: String,
            required: true
        }, // SAME as Product module
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        order_code: {
            type: String,
            required: true
        }, // SAME as Order module
        order_item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderItem",
            required: true
        },
        seller_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            required: true
        },

        // ============ REVIEW DETAILS ============
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        title: {
            type: String,
            trim: true,
            default: ""
        },
        comment: {
            type: String,
            default: ""
        },
        images: {
            type: [String],
            default: []
        },
        videos: {
            type: [String],
            default: []
        },

        // ============ VERIFICATION & STATUS ============
        is_verified_purchase: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ["pending", "published", "flagged", "reported", "hidden", "rejected"],
            default: "pending"
        },
        // Keep legacy field for backward compatibility if needed
        review_status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        // ============ REPORTING ============
        report_count: {
            type: Number,
            default: 0
        },

        // ============ HELPFUL VOTES ============
        helpful_count: {
            type: Number,
            default: 0
        },
        helpful_users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        // ============ MODERATION ============
        moderation_reason: {
            type: String,
            default: null
        },
        moderated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        moderated_at: {
            type: Date,
            default: null
        },
        published_at: {
            type: Date,
            default: null
        },
        hidden_at: {
            type: Date,
            default: null
        },
        rejected_at: {
            type: Date,
            default: null
        },
        admin_comment: {
            type: String
        },

        // ============ MODERATION HISTORY (Sub-Document) ============
        moderation_history: [{
            action: {
                type: String,
                required: true
            },
            previous_status: {
                type: String,
                required: true
            },
            new_status: {
                type: String,
                required: true
            },
            reason: {
                type: String,
                default: ""
            },
            admin_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],

        // ============ SOFT DELETE ============
        deleted_at: {
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
review_schema.index({ product_id: 1, status: 1 });
review_schema.index({ user_id: 1 });
review_schema.index({ seller_id: 1 });
review_schema.index({ order_id: 1 });
review_schema.index({ status: 1 });
review_schema.index({ rating: -1 });
review_schema.index({ created_at: -1 });
review_schema.index({ report_count: -1 });

module.exports = mongoose.model("Review", review_schema);