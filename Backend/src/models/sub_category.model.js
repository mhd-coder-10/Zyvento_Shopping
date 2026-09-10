// Sub-category schema - Product sub-categories under main categories
// Linked to category with unique constraint
// Related to: category.model.js, product.model.js

// const mongoose = require("mongoose");

// const sub_category_schema = new mongoose.Schema(
// {
//     // ============ RELATIONSHIPS ============
//     category_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//         required: true
//     },

//     sub_category_name: {
//         type: String,
//         required: true,
//         trim: true
//     },

//     sub_category_image: {
//         type: String,
//         default: null
//     },

//     description: {
//         type: String,
//         trim: true
//     },

//     display_order: {
//         type: Number,
//         default: 0
//     },

//     status: {
//         type: String,
//         enum: ["active", "inactive"],
//         default: "active"
//     },

//     created_by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//     },

//     updated_by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
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
// sub_category_schema.index({ category_id: 1, sub_category_name: 1 }, { unique: true });
// sub_category_schema.index({ category_id: 1, status: 1 });
// sub_category_schema.index({ display_order: 1 });

// module.exports = mongoose.model("SubCategory", sub_category_schema);





const mongoose = require("mongoose");

const sub_category_schema = new mongoose.Schema({
    sub_category_code: { type: String, unique: true, sparse: true, index: true },
    sub_category_name: { type: String, required: true, trim: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    sub_category_image: { type: String, default: null },
    description: { type: String, default: '' },
    display_order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // Audit Fields
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deleted_at: { type: Date, default: null }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

sub_category_schema.index({ category_id: 1, status: 1 });
module.exports = mongoose.model("SubCategory", sub_category_schema);