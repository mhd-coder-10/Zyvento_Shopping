// Notification schema - User notifications across platform
// Supports in-app, email, push notifications with soft delete
// Related to: user.model.js

// const mongoose = require("mongoose");

// const notification_schema = new mongoose.Schema(
// {
//     // ============ RELATIONSHIPS ============
//     user_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },

//     sender_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         default: null
//     },
//     // ======================================

//     // ============ RECEIVER TYPE ============
//     receiver_type: {
//         type: String,
//         enum: [
//             "customer",
//             "seller",
//             "seller_employee",
//             "admin",
//             "sub_admin",
//             "super_admin"
//         ],
//         required: true
//     },

//     // ============ NOTIFICATION DETAILS ============
//     title: {
//         type: String,
//         required: true,
//         trim: true
//     },

//     message: {
//         type: String,
//         required: true,
//         trim: true
//     },

//     // ============ NOTIFICATION TYPE ============
//     notification_type: {
//         type: String,
//         enum: [
//             "order",
//             "payment",
//             "product",
//             "inventory",
//             "profile",
//             "seller",
//             "employee",
//             "offer",
//             "return",
//             "refund",
//             "system",
//             "promotion",
//             "security",
//             "role_change",
//             "permission_change"
//         ],
//         required: true
//     },

//     // ============ REFERENCE ============
//     reference_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         default: null
//     },

//     reference_model: {
//         type: String,
//         enum: [
//             "Order",
//             "OrderItem",
//             "Payment",
//             "Product",
//             "Inventory",
//             "Return",
//             "Refund",
//             "Seller",
//             "Employee",
//             "Coupon",
//             "Role",
//             "Permission"
//         ],
//         default: null
//     },

//     // ============ READ STATUS ============
//     is_read: {
//         type: Boolean,
//         default: false
//     },

//     read_at: {
//         type: Date,
//         default: null
//     },

//     // ============ DELETE (SOFT DELETE) ============
//     is_deleted: {
//         type: Boolean,
//         default: false
//     },

//     deleted_at: {
//         type: Date,
//         default: null
//     },

//     // ============ CHANNEL ============
//     channel: {
//         type: String,
//         enum: ["email", "sms", "push_notification", "in_app"],
//         default: "in_app"
//     },

//     // ============ PRIORITY ============
//     priority: {
//         type: String,
//         enum: ["low", "medium", "high", "critical"],
//         default: "medium"
//     },

//     // ============ STATUS ============
//     status: {
//         type: String,
//         enum: ["pending", "sent", "failed", "delivered", "read"],
//         default: "pending"
//     },

//     sent_at: {
//         type: Date,
//         default: null
//     },

//     delivered_at: {
//         type: Date,
//         default: null
//     },

//     error_message: {
//         type: String
//     },

//     // ============ ACTION ============
//     action_url: {
//         type: String
//     },

//     action_label: {
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
// notification_schema.index({ user_id: 1, is_read: 1, is_deleted: 1 });
// notification_schema.index({ user_id: 1, created_at: -1 });
// notification_schema.index({ notification_type: 1 });
// notification_schema.index({ status: 1 });
// notification_schema.index({ is_deleted: 1 });

// module.exports = mongoose.model("Notification", notification_schema);





// Notification schema - User notifications across platform
// Supports in-app, email, push notifications with soft delete
// Related to: user.model.js

const mongoose = require("mongoose");

const notification_schema = new mongoose.Schema(
    {
        // ============ IDENTIFIERS ============
        notification_code: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        }, // e.g., NOT-123456

        // ============ RELATIONSHIPS ============
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // ============ RECEIVER TYPE ============
        receiver_type: {
            type: String,
            enum: ["customer", "seller", "seller_employee", "admin", "sub_admin", "super_admin"],
            required: true
        },

        // ============ NOTIFICATION DETAILS ============
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },

        // ============ NOTIFICATION TYPE ============
        notification_type: {
            type: String,
            enum: [
                "order", "payment", "product", "inventory", "profile",
                "seller", "employee", "offer", "return", "refund",
                "system", "promotion", "security", "role_change", "permission_change"
            ],
            required: true
        },

        // ============ REFERENCE ============
        reference_id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        reference_model: {
            type: String,
            enum: [
                "Order", "OrderItem", "Payment", "Product", "Inventory",
                "Return", "Refund", "Seller", "Employee", "Coupon", "Role", "Permission"
            ],
            default: null
        },

        // ============ READ STATUS ============
        is_read: {
            type: Boolean,
            default: false
        },
        read_at: {
            type: Date,
            default: null
        },

        // ============ DELETE (SOFT DELETE) ============
        is_deleted: {
            type: Boolean,
            default: false
        },
        deleted_at: {
            type: Date,
            default: null
        },

        // ============ CHANNEL ============
        channel: {
            type: String,
            enum: ["email", "sms", "push_notification", "in_app"],
            default: "in_app"
        },

        // ============ PRIORITY ============
        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium"
        },

        // ============ STATUS ============
        status: {
            type: String,
            enum: ["pending", "sent", "failed", "delivered", "read"],
            default: "pending"
        },
        sent_at: {
            type: Date,
            default: null
        },
        delivered_at: {
            type: Date,
            default: null
        },
        error_message: {
            type: String
        },

        // ============ ACTION ============
        action_url: {
            type: String
        },
        action_label: {
            type: String
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
notification_schema.index({ user_id: 1, is_read: 1, is_deleted: 1 });
notification_schema.index({ user_id: 1, created_at: -1 });
notification_schema.index({ notification_type: 1 });
notification_schema.index({ status: 1 });
notification_schema.index({ is_deleted: 1 });

module.exports = mongoose.model("Notification", notification_schema);