
// Report schedule schema - Scheduled report generation
// Stores report type, schedule, recipients, format
const mongoose = require("mongoose");

const report_schedule_schema = new mongoose.Schema(
    {
        // ============ REPORT IDENTIFIER ============
        report_code: { type: String, unique: true, sparse: true, index: true }, // e.g., SALES-REP
        report_name: { type: String, required: true, trim: true },

        report_type: {
            type: String,
            enum: ["sales", "revenue", "orders", "products", "users", "payments", "sellers", "custom"],
            required: true
        },

        // ============ RELATIONSHIPS ============
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        // ============ REPORT FILTERS ============
        filters: { type: Object, default: {} },
        columns: [String],
        group_by: [String],
        sort_by: {
            field: String,
            order: { type: String, enum: ["asc", "desc"], default: "desc" }
        },

        // ============ SCHEDULE ============
        schedule: {
            frequency: { type: String, enum: ["once", "daily", "weekly", "monthly", "custom"], default: "once" },
            time: String,
            day_of_week: { type: Number, min: 0, max: 6 },
            day_of_month: { type: Number, min: 1, max: 31 },
            custom_cron: String
        },

        // ============ RECIPIENTS & FORMAT ============
        recipients: [{ email: String, user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }],
        format: { type: String, enum: ["pdf", "excel", "csv", "json"], default: "pdf" },

        // ============ STATUS & TIMESTAMPS ============
        is_active: { type: Boolean, default: true },
        last_run: { type: Date, default: null },
        next_run: { type: Date, default: null },
        deleted_at: { type: Date, default: null }
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// ============ INDEXES ============
report_schedule_schema.index({ created_by: 1 });
report_schedule_schema.index({ report_type: 1, is_active: 1 });
report_schedule_schema.index({ next_run: 1 });

module.exports = mongoose.model("ReportSchedule", report_schedule_schema);