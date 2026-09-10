// Product schema - Manages products added by sellers
// Stores product details, variants, pricing, images, SEO
// Related to: seller.model.js, category.model.js, inventory.model.js

// const mongoose = require("mongoose");

// const product_schema = new mongoose.Schema(
// {
//     // ============ RELATIONSHIPS ============
//     seller_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Seller",
//         required: true
//     },

//     category_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//         required: true
//     },

//     sub_category_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "SubCategory",
//         required: true
//     },

//     approved_by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         default: null
//     },

//     // ============ BASIC DETAILS ============
//     product_name: {
//         type: String,
//         required: true,
//         trim: true
//     },

//     brand: {
//         type: String,
//         trim: true
//     },

//     description: {
//         type: String
//     },

//     images: {
//         type: [String],
//         default: []
//     },

//     // ============ SKU & PRICING ============
//     sku: {
//         type: String,
//         required: true,
//         unique: true,
//         uppercase: true,
//         trim: true
//     },

//     price: {
//         type: Number,
//         required: true,
//         min: 0
//     },

//     compare_at_price: {
//         type: Number,
//         min: 0,
//         default: null
//     },

//     cost_per_item: {
//         type: Number,
//         min: 0,
//         default: null
//     },

//     discount: {
//         type: Number,
//         default: 0,
//         min: 0,
//         max: 100
//     },

//     final_price: {
//         type: Number,
//         required: true,
//         min: 0
//     },

//     // ============ WEIGHT & DIMENSIONS ============
//     weight: {
//         type: Number,
//         default: 0,
//         min: 0
//     },

//     dimensions: {
//         length: { type: Number, default: 0 },
//         width: { type: Number, default: 0 },
//         height: { type: Number, default: 0 },
//         unit: { type: String, default: 'cm', enum: ['cm', 'in', 'mm'] }
//     },

//     // ============ VARIANTS ============
//     variants: [{
//         name: { type: String, required: true },
//         options: [{
//             value: { type: String, required: true },
//             price: { type: Number, default: 0 },
//             quantity: { type: Number, default: 0 },
//             sku: { type: String }
//         }]
//     }],

//     // ============ SPECIFICATIONS ============
//     specifications: {
//         type: Object,
//         default: {}
//     },

//     // ============ SEO ============
//     is_featured: {
//         type: Boolean,
//         default: false
//     },

//     tags: [String],

//     seo: {
//         title: String,
//         description: String,
//         keywords: [String]
//     },

//     // ============ RETURN POLICY ============
//     return_policy: {
//         type: String
//     },

//     // ============ RATINGS & REVIEWS ============
//     rating: {
//         type: Number,
//         default: 0,
//         min: 0,
//         max: 5
//     },

//     total_reviews: {
//         type: Number,
//         default: 0
//     },

//     // ============ STATISTICS ============
//     views: {
//         type: Number,
//         default: 0
//     },

//     sales_count: {
//         type: Number,
//         default: 0
//     },

//     // ============ APPROVAL STATUS ============
//     approval_status: {
//         type: String,
//         enum: ["pending", "approved", "rejected"],
//         default: "pending"
//     },

//     approval_comment: {
//         type: String,
//         default: null
//     },

//     approved_at: {
//         type: Date,
//         default: null
//     },

//     // ============ PRODUCT STATUS ============
//     status: {
//         type: String,
//         enum: ["active", "inactive", "blocked", "draft"],
//         default: "draft"
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
// product_schema.index({ seller_id: 1, status: 1 });
// product_schema.index({ category_id: 1, status: 1 });
// product_schema.index({ sub_category_id: 1, status: 1 });
// product_schema.index({ product_name: 'text', description: 'text', brand: 'text' });
// product_schema.index({ final_price: 1 });
// product_schema.index({ rating: -1 });
// product_schema.index({ approval_status: 1 });
// product_schema.index({ is_featured: 1 });

// module.exports = mongoose.model("Product", product_schema);




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
product_schema.index({ product_code: 1 });
product_schema.index({ sku: 1 });

module.exports = mongoose.model("Product", product_schema);