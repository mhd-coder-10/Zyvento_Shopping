
const mongoose = require("mongoose");
const Counter = require("./counter.model");


const user_schema = new mongoose.Schema(
    {
        // ============ CUSTOM USER CODE (For URL) ============
        user_code: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
            trim: true
        },

        // ============ BASIC DETAILS ============
        first_name: {
            type: String,
            required: true,
            trim: true
        },

        last_name: {
            type: String,
            required: true,
            trim: true
        },

        username: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            lowercase: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        mobile_number: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        // ============ PROFILE IMAGE ============
        profile_image: {
            type: String,
            default: null
        },

        profile_image_public_id: {
            type: String,
            default: null
        },

        // ============ USER TYPE (ONLY 5 TYPES) ============
        user_type: {
            type: String,
            enum: [
                "super_admin",
                "sub_admin",
                "seller",
                "seller_employee",
                "customer"
            ],
            required: true
        },

        // ============ SUB-ADMIN TYPE (Only 4 types - Platform Employees) ============
        sub_admin_type: {
            type: String,
            enum: [
                "manager",
                "finance_manager",
                "support_manager",
                "seller_manager"
            ],
            default: null
        },

        // ============ SELLER EMPLOYEE TYPE (6 types) ============
        employee_type: {
            type: String,
            enum: [
                "manager",
                "product_manager",
                "order_manager",
                "inventory_manager",
                "support_staff",
                "account_manager"
            ],
            default: null
        },

        // ============ EXTRA DETAILS ============
        date_of_birth: {
            type: Date,
            default: null
        },

        gender: {
            type: String,
            enum: ["male", "female", "other", null],
            default: null
        },

        address: {
            type: String,
            default: null
        },

        city: {
            type: String,
            default: null
        },

        state: {
            type: String,
            default: null
        },

        country: {
            type: String,
            default: null
        },

        postal_code: {
            type: String,
            default: null
        },

        // ============ RELATIONSHIPS ============
        role_ids: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }],

        direct_permissions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permission"
        }],

        seller_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            default: null
        },

        employee_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null
        },

        // ============ VERIFICATION STATUS ============
        is_email_verified: {
            type: Boolean,
            default: false
        },

        is_mobile_verified: {
            type: Boolean,
            default: false
        },

        // ============ ACCOUNT STATUS ============
        account_status: {
            type: String,
            enum: ["active", "blocked", "inactive", "deleted", "pending"],
            default: "pending"
        },

        // ============ AUTH TOKENS ============
        refresh_token: {
            type: String,
            default: null
        },

        password_reset_token: {
            type: String,
            default: null
        },

        password_reset_expiry: {
            type: Date,
            default: null
        },

        // ============ LAST ACTIVITY ============
        last_login: {
            type: Date,
            default: null
        },

        // ============ PREFERENCES ============
        preferences: {
            language: {
                type: String,
                default: "en"
            },
            timezone: {
                type: String,
                default: "UTC"
            },
            notifications: {
                email: { type: Boolean, default: true },
                push: { type: Boolean, default: true },
                sms: { type: Boolean, default: false }
            }
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

// ============ PRE-SAVE HOOK: Auto-generate user_code ============
user_schema.pre('save', async function () {
    // Only generate if new and not already set
    if (!this.isNew || this.user_code) return;

    // ---------- Build base from username/email/first_name ----------
    let base = this.username
        || (this.email ? this.email.split('@')[0] : null)
        || this.first_name
        || 'user';

    // Sanitize: lowercase, remove special chars
    base = base.toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '');

    if (!base) base = 'user';

    // ---------- Get next global sequence number (atomic) ----------
    const counter = await Counter.findOneAndUpdate(
        { _id: 'user_code' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const seqNumber = String(counter.seq).padStart(2, '0'); // 01, 02, ..., 10, 99, 100
    let code = `USR-${base}${seqNumber}`;

    // ---------- Ensure uniqueness (edge case: counter reset) ----------
    let suffix = 1;
    while (await mongoose.model('User').exists({ user_code: code, _id: { $ne: this._id } })) {
        code = `USR-${base}${seqNumber}-${suffix}`;
        suffix += 1;
        if (suffix > 999) {
            code = `USR-${base}-${Date.now()}`;
            break;
        }
    }

    this.user_code = code;
});

// ============ INDEXES ============
user_schema.index({ user_type: 1, account_status: 1 });
user_schema.index({ sub_admin_type: 1 });
user_schema.index({ employee_type: 1 });
user_schema.index({ seller_id: 1 });
user_schema.index({ employee_id: 1 });
user_schema.index({ role_ids: 1 });

module.exports = mongoose.model("User", user_schema);