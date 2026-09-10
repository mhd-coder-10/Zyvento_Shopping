// Global constants used across the application
// Contains user types, status enums, role types, permission actions

/**
 * Application Constants
 * All global constants in one place
 * Import using: const constants = require('../config/constants');
 */

const constants = {
    // ============ USER TYPES ============
    USER_TYPES: {
        SUPER_ADMIN: 'super_admin',
        SUB_ADMIN: 'sub_admin',
        SELLER: 'seller',
        SELLER_EMPLOYEE: 'seller_employee',
        CUSTOMER: 'customer',
    },

    // ============ ACCOUNT STATUS ============
    ACCOUNT_STATUS: {
        ACTIVE: 'active',
        BLOCKED: 'blocked',
        INACTIVE: 'inactive',
        DELETED: 'deleted',
        PENDING: 'pending',
        SUSPENDED: 'suspended',
    },

    // ============ SUB ADMIN TYPES ============
    SUB_ADMIN_TYPES: {
        SUB_ADMIN_MANAGER: 'sub_admin_manager',
        SELLER_MANAGER: 'seller_manager',
        SELLER_OPENING_ACCOUNT_MANAGER: 'seller_opening_account_manager',
        FINANCE_MANAGER: 'finance_manager',
        SUPPORT_MANAGER: 'support_manager',
        REPORT_MANAGER: 'report_manager',
        PRODUCT_CATEGORY_MANAGER: 'product_category_manager',
        CONTENT_MANAGER: 'content_manager',
        MARKETING_MANAGER: 'marketing_manager',
        ANALYTICS_MANAGER: 'analytics_manager',
        COMPLIANCE_MANAGER: 'compliance_manager',
        SHIPPING_MANAGER: 'shipping_manager',
    },

    // ============ EMPLOYEE TYPES ============
    EMPLOYEE_TYPES: {
        PRODUCT_MANAGER: 'product_manager',
        ORDER_MANAGER: 'order_manager',
        INVENTORY_MANAGER: 'inventory_manager',
        SHIPPING_MANAGER: 'shipping_manager',
        CUSTOMER_SERVICE_MANAGER: 'customer_service_manager',
        MARKETING_MANAGER: 'marketing_manager',
        ACCOUNT_MANAGER: 'account_manager',
    },

    // ============ ORDER STATUS ============
    ORDER_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        PACKED: 'packed',
        SHIPPED: 'shipped',
        OUT_FOR_DELIVERY: 'out_for_delivery',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled',
        RETURNED: 'returned',
    },

    // ============ PAYMENT STATUS ============
    PAYMENT_STATUS: {
        PENDING: 'pending',
        PAID: 'paid',
        FAILED: 'failed',
        REFUNDED: 'refunded',
        PARTIALLY_REFUNDED: 'partially_refunded',
    },

    // ============ VERIFICATION STATUS ============
    VERIFICATION_STATUS: {
        PENDING: 'pending',
        UNDER_REVIEW: 'under_review',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        SUSPENDED: 'suspended',
    },

    // ============ NOTIFICATION TYPES ============
    NOTIFICATION_TYPES: {
        ORDER: 'order',
        PAYMENT: 'payment',
        PRODUCT: 'product',
        INVENTORY: 'inventory',
        PROFILE: 'profile',
        SELLER: 'seller',
        EMPLOYEE: 'employee',
        OFFER: 'offer',
        RETURN: 'return',
        REFUND: 'refund',
        SYSTEM: 'system',
        PROMOTION: 'promotion',
        SECURITY: 'security',
        ROLE_CHANGE: 'role_change',
        PERMISSION_CHANGE: 'permission_change',
    },

    // ============ PERMISSION ACTIONS ============
    PERMISSION_ACTIONS: {
        CREATE: 'create',
        READ: 'read',
        UPDATE: 'update',
        DELETE: 'delete',
        MANAGE: 'manage',
        APPROVE: 'approve',
        REJECT: 'reject',
        EXPORT: 'export',
        IMPORT: 'import',
        VIEW_ALL: 'view_all',
        VIEW_OWN: 'view_own',
        ASSIGN: 'assign',
        REVOKE: 'revoke',
    },

    // ============ MODULES ============
    MODULES: {
        AUTH: 'auth',
        ADMIN: 'admin',
        SUB_ADMIN: 'sub_admin',
        SELLER: 'seller',
        EMPLOYEE: 'employee',
        PRODUCT: 'product',
        CATEGORY: 'category',
        INVENTORY: 'inventory',
        ORDER: 'order',
        CART: 'cart',
        WISHLIST: 'wishlist',
        ADDRESS: 'address',
        PAYMENT: 'payment',
        COUPON: 'coupon',
        RETURN: 'return',
        REVIEW: 'review',
        NOTIFICATION: 'notification',
        DASHBOARD: 'dashboard',
        REPORT: 'report',
        SETTINGS: 'settings',
    },

    // ============ ROLE TYPES ============
    ROLE_TYPES: {
        SYSTEM: 'system',
        ADMIN: 'admin',
        SUB_ADMIN: 'sub_admin',
        SELLER: 'seller',
        EMPLOYEE: 'employee',
        CUSTOMER: 'customer',
    },

    // ============ DATA SCOPE ============
    DATA_SCOPE: {
        ALL: 'all',
        OWN: 'own',
        DEPARTMENT: 'department',
        SELLER_ONLY: 'seller_only',
        CUSTOM: 'custom',
    },

    // ============ REGEX PATTERNS ============
    REGEX: {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
        PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
        PINCODE: /^[0-9]{5,6}$/,
        MONGO_ID: /^[0-9a-fA-F]{24}$/,
        URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
        ONLY_LETTERS: /^[a-zA-Z\s]+$/,
    },

    // ============ FILE TYPES ============
    FILE_TYPES: {
        IMAGE: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'],
        DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ALLOWED: [
            'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml',
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
    },

    // ============ PAGINATION ============
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },

    // ============ DATE FORMATS ============
    DATE_FORMATS: {
        DEFAULT: 'YYYY-MM-DD',
        TIME: 'HH:mm:ss',
        DATE_TIME: 'YYYY-MM-DD HH:mm:ss',
        ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',
    },

    // ============ CURRENCY ============
    CURRENCY: {
        DEFAULT: 'INR',
        SYMBOL: '₹',
    },

    // ============ OTP ============
    OTP: {
        LENGTH: 6,
        EXPIRY_MINUTES: 10,
        MAX_ATTEMPTS: 5,
    },

    // ============ JWT ============
    JWT: {
        ACCESS_EXPIRY: '15m',
        REFRESH_EXPIRY: '7d',
    },

    // ============ ORDER ============
    ORDER: {
        STATUS_HISTORY_LIMIT: 50,
        MAX_ITEMS_PER_ORDER: 100,
    },

    // ============ CART ============
    CART: {
        EXPIRY_DAYS: 7,
        MAX_ITEMS: 100,
    },

    // ============ REVIEW ============
    REVIEW: {
        MIN_RATING: 1,
        MAX_RATING: 5,
        IMAGES_LIMIT: 5,
    },

    // ============ RETURN ============
    RETURN: {
        MAX_DAYS: 30,
        REASONS: [
            'defective_product',
            'wrong_product',
            'size_issue',
            'color_issue',
            'quality_issue',
            'not_as_expected',
            'damaged_delivery',
            'other',
        ],
    },

    // ============ SUPPORTED LANGUAGES ============
    LANGUAGES: {
        EN: 'en',
        HI: 'hi',
        TA: 'ta',
        TE: 'te',
        BN: 'bn',
        MR: 'mr',
        GU: 'gu',
    },

    // ============ TIMEZONES ============
    TIMEZONES: {
        IST: 'Asia/Kolkata',
        UTC: 'UTC',
        EST: 'America/New_York',
        PST: 'America/Los_Angeles',
        GMT: 'Europe/London',
        CET: 'Europe/Paris',
        AEST: 'Australia/Sydney',
        JST: 'Asia/Tokyo',
    },

    // ============ API VERSIONS ============
    API_VERSIONS: {
        V1: 'v1',
        V2: 'v2',
    },
};

module.exports = constants;