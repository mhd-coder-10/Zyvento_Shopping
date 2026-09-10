// Dashboard preference - User dashboard customization
// Stores widget preferences, layout, theme settings
// Related to: user.model.js

const mongoose = require("mongoose");

const dashboard_preference_schema = new mongoose.Schema(
{
    // ============ RELATIONSHIPS ============
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    // ======================================

    // ============ WIDGETS ============
    widgets: [{
        widget_id: {
            type: String,
            required: true
        },
        widget_type: {
            type: String,
            enum: [
                "chart",
                "table",
                "card",
                "list",
                "metric",
                "calendar",
                "feed",
                "custom"
            ],
            required: true
        },
        title: String,
        description: String,
        position: {
            x: Number,
            y: Number,
            width: Number,
            height: Number
        },
        config: {
            type: Object,
            default: {}
        },
        data_source: {
            type: Object,
            default: {}
        },
        is_visible: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        }
    }],

    // ============ QUICK ACTIONS ============
    quick_actions: [{
        action_id: String,
        label: String,
        icon: String,
        url: String,
        permission: String,
        order: Number
    }],

    // ============ RECENT ACTIVITIES ============
    recent_activities_config: {
        limit: {
            type: Number,
            default: 10
        },
        modules: [String]
    },

    // ============ REPORT PREFERENCES ============
    report_preferences: {
        default_report: String,
        auto_refresh: {
            type: Boolean,
            default: true
        },
        refresh_interval: {
            type: Number,
            default: 5 // minutes
        },
        date_range: {
            type: String,
            default: "last_7_days"
        }
    },

    // ============ NOTIFICATION PREFERENCES ============
    notification_preferences: {
        show_unread_only: {
            type: Boolean,
            default: false
        },
        show_count_badge: {
            type: Boolean,
            default: true
        },
        auto_dismiss_time: {
            type: Number,
            default: 5 // seconds
        }
    },

    // ============ THEME PREFERENCES ============
    theme_preferences: {
        theme: {
            type: String,
            enum: ["light", "dark", "system"],
            default: "system"
        },
        primary_color: String,
        sidebar_collapsed: {
            type: Boolean,
            default: false
        }
    },

    // ============ CUSTOM LAYOUT ============
    custom_layout: {
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
dashboard_preference_schema.index({ user_id: 1 });

module.exports = mongoose.model("DashboardPreference", dashboard_preference_schema);