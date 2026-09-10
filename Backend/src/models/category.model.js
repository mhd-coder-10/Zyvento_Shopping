// Category schema - Product categories with parent-child support
// Manages category hierarchy and display order
// Related to: product.model.js, sub_category.model.js

// const mongoose = require("mongoose");

// const category_schema = new mongoose.Schema(
// {
//     category_name: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true
//     },

//     category_image: {
//         type: String,
//         default: null
//     },

//     description: {
//         type: String,
//         trim: true
//     },

//     parent_category_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//         default: null
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
// category_schema.index({ status: 1 });
// category_schema.index({ parent_category_id: 1 });

// module.exports = mongoose.model("Category", category_schema);


const mongoose = require("mongoose");

const category_schema = new mongoose.Schema({
    category_code: { type: String, unique: true, sparse: true, index: true },
    category_name: { type: String, required: true, unique: true, trim: true },
    category_image: { type: String, default: null },
    description: { type: String, default: '' },
    display_order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    
    // Audit Fields 
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deleted_at: { type: Date, default: null }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

category_schema.index({ status: 1, deleted_at: 1 });

module.exports = mongoose.model("Category", category_schema);