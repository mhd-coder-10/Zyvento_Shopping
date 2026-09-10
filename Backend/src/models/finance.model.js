// Finance schema - Manages company income and expenses
// Tracks manual entries and links to other modules (Orders, Payments, etc.)
const mongoose = require("mongoose");

const finance_schema = new mongoose.Schema(
    {
        entry_code: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        }, // For URL (e.g., FIN-123456)

        entry_type: {
            type: String,
            enum: ["income", "expense"],
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        category: {
            type: String,
            enum: [
                "Sales", "Advertising", "Marketing", "Rent", "Salaries",
                "Utilities", "Logistics", "Tax", "Other"
            ],
            default: "Other"
        },

        description: {
            type: String,
            default: ""
        },

        entry_date: {
            type: Date,
            default: Date.now
        },

        // Link to other modules (Optional, but fulfills requirement)
        reference_type: {
            type: String,
            enum: ["order", "payment", "transaction", "manual"],
            default: "manual"
        },

        reference_id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        // Audit fields
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        deleted_at: {
            type: Date,
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

finance_schema.index({ entry_type: 1 });
finance_schema.index({ entry_date: -1 });

module.exports = mongoose.model("Finance", finance_schema);