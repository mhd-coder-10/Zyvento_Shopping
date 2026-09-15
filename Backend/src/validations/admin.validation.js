// Validation schemas for admin routes
// Validates user management, sub-admin, role, seller management, product management
// Used in admin.routes.js for request validation

const Joi = require('joi');

const adminValidation = {

    // ============ USERS MANAGEMENT VALIDATION ==============
    // GET USERS (With Filters) 
    getUsers: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().optional().allow(''),
        user_type: Joi.string()
            .valid('all', 'super_admin', 'sub_admin', 'seller', 'seller_employee', 'customer')
            .optional(),
        sub_admin_type: Joi.string()
            .valid('all', 'manager', 'finance_manager', 'support_manager', 'seller_manager')
            .optional(),
        employee_type: Joi.string()
            .valid('all', 'manager', 'product_manager', 'order_manager', 'inventory_manager', 'support_staff', 'account_manager')
            .optional(),
        account_status: Joi.string()
            .valid('all', 'active', 'blocked', 'inactive', 'deleted', 'pending')
            .optional(),
        sort_by: Joi.string()
            .valid('created_at', 'updated_at', 'first_name', 'last_name', 'email')
            .default('created_at'),
        sort_order: Joi.string().valid('asc', 'desc').default('desc'),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
    }),

    // CREATE USER 
    createUser: Joi.object({
        first_name: Joi.string().min(2).max(50).required(),
        last_name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        mobile_number: Joi.string()
            .pattern(/^[0-9+\-\s()]{7,15}$/)
            .optional()
            .allow(''),
        username: Joi.string().min(3).max(30).optional().allow(''),
        password: Joi.string().min(6).required(),

        user_type: Joi.string()
            .valid('super_admin', 'sub_admin', 'seller', 'seller_employee', 'customer')
            .required(),

        sub_admin_type: Joi.string()
            .valid('manager', 'finance_manager', 'support_manager', 'seller_manager')
            .when('user_type', {
                is: 'sub_admin',
                then: Joi.required(),
                otherwise: Joi.optional().allow(null)
            }),

        employee_type: Joi.string()
            .valid('manager', 'product_manager', 'order_manager', 'inventory_manager', 'support_staff', 'account_manager')
            .when('user_type', {
                is: 'seller_employee',
                then: Joi.required(),
                otherwise: Joi.optional().allow(null)
            }),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .when('user_type', {
                is: 'seller_employee',
                then: Joi.optional().allow(null, ''),
                otherwise: Joi.optional().allow(null, '')
            }),

        account_status: Joi.string()
            .valid('active', 'inactive', 'pending', 'blocked')
            .default('active'),
    }),

    // UPDATE USER 
    updateUser: Joi.object({
        first_name: Joi.string().min(2).max(50).optional(),
        last_name: Joi.string().min(2).max(50).optional(),
        email: Joi.string().email().optional(),
        mobile_number: Joi.string().optional().allow(''),
        username: Joi.string().min(3).max(30).optional().allow(''),

        user_type: Joi.string()
            .valid('super_admin', 'sub_admin', 'seller', 'seller_employee', 'customer')
            .optional(),

        sub_admin_type: Joi.string()
            .valid('manager', 'finance_manager', 'support_manager', 'seller_manager')
            .optional()
            .allow(null, ''),

        employee_type: Joi.string()
            .valid('manager', 'product_manager', 'order_manager', 'inventory_manager', 'support_staff', 'account_manager')
            .optional()
            .allow(null, ''),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .allow(null, ''),

        account_status: Joi.string()
            .valid('active', 'blocked', 'inactive', 'deleted', 'pending')
            .optional(),

        date_of_birth: Joi.date().optional().allow(null, ''),
        gender: Joi.string().valid('male', 'female', 'other').optional().allow(null, ''),
        address: Joi.string().optional().allow('', null),
        city: Joi.string().optional().allow('', null),
        state: Joi.string().optional().allow('', null),
        country: Joi.string().optional().allow('', null),
        postal_code: Joi.string().optional().allow('', null),

        preferences: Joi.object({
            language: Joi.string().default('en'),
            timezone: Joi.string().default('UTC'),
            notifications: Joi.object({
                email: Joi.boolean().default(true),
                push: Joi.boolean().default(true),
                sms: Joi.boolean().default(false),
            }),
        }).optional(),
    }),

    // UPDATE USER STATUS 
    updateUserStatus: Joi.object({
        account_status: Joi.string()
            .valid('active', 'blocked', 'inactive', 'deleted')
            .required(),
        reason: Joi.string().optional().allow(''),
    }),

    // ============ SELLER MANAGEMENT VALIDATION (ADMIN SIDE) ============

    // Get Sellers (List with Filters)
    adminGetSellers: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().optional().allow(''),
        account_status: Joi.string()
            .valid('all', 'pending', 'approved', 'active', 'inactive', 'suspended', 'rejected')
            .optional(),
        verification_status: Joi.string()
            .valid('all', 'pending', 'under_review', 'approved', 'rejected', 'suspended')
            .optional(),
        business_type: Joi.string()
            .valid('all', 'individual', 'company', 'brand', 'partnership')
            .optional(),
        sort_by: Joi.string()
            .valid('created_at', 'business_name', 'total_orders', 'total_revenue', 'rating')
            .default('created_at'),
        sort_order: Joi.string().valid('asc', 'desc').default('desc'),
    }),

    // Seller Code/ID Param (URL param validation)
    adminSellerIdParam: Joi.object({
        sellerCode: Joi.string()
            .required()
            .messages({
                'string.empty': 'Seller identifier is required',
            }),
    }),

    // Update Seller Details
    adminUpdateSeller: Joi.object({
        business_name: Joi.string().min(2).max(100).optional(),
        owner_name: Joi.string().min(2).max(50).optional(),
        email: Joi.string().email().optional(),
        mobile_number: Joi.string().optional().allow(''),
        business_type: Joi.string()
            .valid('individual', 'company', 'brand', 'partnership')
            .optional(),
        gst_number: Joi.string().optional().allow(''),
        pan_number: Joi.string().optional().allow(''),
        business_address: Joi.object({
            street: Joi.string().optional().allow(''),
            city: Joi.string().optional().allow(''),
            state: Joi.string().optional().allow(''),
            country: Joi.string().optional().allow(''),
            zip_code: Joi.string().optional().allow(''),
        }).optional(),
        commission_rate: Joi.number().min(0).max(100).optional(),
        settings: Joi.object({
            order_processing_time: Joi.number().integer().min(1).max(72).optional(),
            return_policy: Joi.string().optional().allow(''),
        }).optional(),
    }),

    // Update Seller Status (Single Route - Handles all transitions)
    adminUpdateSellerStatus: Joi.object({
        status: Joi.string()
            .valid('pending', 'approved', 'rejected', 'active', 'inactive', 'suspended')
            .required()
            .messages({
                'any.only': 'Invalid status value',
                'string.empty': 'Status is required',
            }),
        reason: Joi.string().optional().allow(''),
        notes: Joi.string().optional().allow(''),
    }),


    // ============ SUB-ADMIN MANAGEMENT VALIDATION ==============

    // URL Param
    subAdminCodeParam: Joi.object({
        subAdminCode: Joi.string()
            .pattern(/^SUBA-[A-Z0-9]+$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid Sub-Admin code format'
            })
    }),

    // GET ALL SUB-ADMINS (With Filters)
    getAllSubAdmins: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().optional().allow(''),
        sub_admin_type: Joi.string()
            .valid('all', 'manager', 'finance_manager', 'support_manager', 'seller_manager')
            .optional(),
        status: Joi.string()
            .valid('all', 'pending', 'active', 'inactive', 'suspended')
            .optional(),
        department: Joi.string().optional().allow('', 'all'),
        sort_by: Joi.string()
            .valid('created_at', 'updated_at', 'full_name', 'email', 'department')
            .default('created_at'),
        sort_order: Joi.string().valid('asc', 'desc').default('desc'),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional()
    }),

    getAvailableUsersQuery: Joi.object({
        search: Joi.string().optional().allow(''),
        limit: Joi.number().integer().min(1).max(200).default(50)
    }),

    // CREATE SUB-ADMIN
    createSubAdmin: Joi.object({
        user_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid user ID',
                'any.required': 'Please select a user'
            }),
        sub_admin_type: Joi.string()
            .valid('manager', 'finance_manager', 'support_manager', 'seller_manager')
            .required(),
        department: Joi.string().trim().min(2).max(100).required(),
        designation: Joi.string().trim().max(100).optional().allow('', null),
        current_role_ids: Joi.array()
            .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
            .optional()
            .default([]),
        password: Joi.string()
            .min(6)
            .max(128)
            .optional()
            .allow('', null)
            .messages({
                'string.min': 'Password must be at least 6 characters'
            }),
        notes: Joi.string().trim().max(1000).optional().allow('', null)
    }),

    // UPDATE SUB-ADMIN
    updateSubAdmin: Joi.object({
        full_name: Joi.string().trim().min(2).max(100).optional(),
        mobile_number: Joi.string()
            .pattern(/^[0-9]{10,15}$/)
            .optional()
            .allow('', null)
            .messages({
                'string.pattern.base': 'Mobile number must be 10-15 digits'
            }),
        sub_admin_type: Joi.string()
            .valid('manager', 'finance_manager', 'support_manager', 'seller_manager')
            .optional(),
        department: Joi.string().trim().min(2).max(100).optional(),
        designation: Joi.string().trim().max(100).optional().allow('', null),
        current_role_ids: Joi.array()
            .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
            .optional(),
        role_change_reason: Joi.string().trim().max(500).optional().allow('', null),
        notes: Joi.string().trim().max(1000).optional().allow('', null)
    }).min(1),

    // UPDATE SUB-ADMIN STATUS
    updateSubAdminStatus: Joi.object({
        status: Joi.string()
            .valid('active', 'inactive', 'suspended')
            .required(),
        reason: Joi.string().trim().max(500).optional().allow('', null),
        notes: Joi.string().trim().max(1000).optional().allow('', null)
    }),

    // GET DELETED SUB-ADMINS
    getDeletedSubAdmins: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().optional().allow(''),
        sub_admin_type: Joi.string()
            .valid('all', 'manager', 'finance_manager', 'support_manager', 'seller_manager')
            .optional(),
        sort_by: Joi.string()
            .valid('deleted_at', 'created_at', 'full_name', 'email')
            .default('deleted_at'),
        sort_order: Joi.string().valid('asc', 'desc').default('desc')
    }),

    // Also UPDATE existing getAllSubAdmins — add `view` field
    getAllSubAdmins: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().optional().allow(''),
        sub_admin_type: Joi.string()
            .valid('all', 'manager', 'finance_manager', 'support_manager', 'seller_manager')
            .optional(),
        status: Joi.string()
            .valid('all', 'pending', 'active', 'inactive', 'suspended')
            .optional(),
        department: Joi.string().optional().allow('', 'all'),
        view: Joi.string().valid('active', 'deleted').default('active'),   // 👈 NEW
        sort_by: Joi.string()
            .valid('created_at', 'updated_at', 'full_name', 'email', 'department')
            .default('created_at'),
        sort_order: Joi.string().valid('asc', 'desc').default('desc'),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional()
    }),


    // ============ EMPLOYEE VALIDATION ============

    employeeCodeParam: Joi.object({
        employeeCode: Joi.string()
            .pattern(/^EMP-[A-Z0-9]+$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid employee code format'
            })
    }),

    getAllEmployees: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().optional().allow(''),
        status: Joi.string()
            .valid('all', 'pending', 'active', 'inactive', 'blocked')
            .default('all'),
        employee_type: Joi.string()
            .valid('all', 'manager', 'product_manager', 'order_manager',
                'inventory_manager', 'support_staff', 'account_manager')
            .default('all'),
        seller_id: Joi.string().optional().allow('', 'all'),
        view: Joi.string().valid('active', 'deleted').default('active'),
        sort_by: Joi.string()
            .valid('created_at', 'updated_at', 'full_name', 'employee_code', 'joining_date')
            .default('created_at'),
        sort_order: Joi.string().valid('asc', 'desc').default('desc'),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional()
    }),

    getAvailableUsersQuery: Joi.object({
        search: Joi.string().optional().allow(''),
        limit: Joi.number().integer().min(1).max(200).default(50)
    }),

    getDeletedEmployees: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().optional().allow(''),
        employee_type: Joi.string()
            .valid('all', 'manager', 'product_manager', 'order_manager',
                'inventory_manager', 'support_staff', 'account_manager')
            .default('all'),
        sort_by: Joi.string().valid('deleted_at', 'created_at', 'full_name').default('deleted_at'),
        sort_order: Joi.string().valid('asc', 'desc').default('desc')
    }),

    createEmployee: Joi.object({
        // Existing user OR new user creation
        user_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
        first_name: Joi.string().trim().min(2).max(50).optional(),
        last_name: Joi.string().trim().min(2).max(50).optional(),
        email: Joi.string().email().optional(),
        mobile_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
        password: Joi.string().min(6).max(128).optional(),

        seller_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        employee_type: Joi.string()
            .valid('manager', 'product_manager', 'order_manager',
                'inventory_manager', 'support_staff', 'account_manager')
            .required(),
        designation: Joi.string().trim().max(100).optional().allow('', null),
        department: Joi.string().trim().max(100).optional().allow('', null),
        joining_date: Joi.date().optional(),
        notes: Joi.string().trim().max(1000).optional().allow('', null),
        current_role_ids: Joi.array()
            .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
            .optional().default([])
    }).xor('user_id', 'email'),   // either existing user_id OR new email required

    updateEmployee: Joi.object({
        full_name: Joi.string().trim().min(2).max(100).optional(),
        mobile_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional().allow('', null),
        seller_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
        employee_type: Joi.string()
            .valid('manager', 'product_manager', 'order_manager',
                'inventory_manager', 'support_staff', 'account_manager')
            .optional(),
        designation: Joi.string().trim().max(100).optional().allow('', null),
        department: Joi.string().trim().max(100).optional().allow('', null),
        joining_date: Joi.date().optional(),
        notes: Joi.string().trim().max(1000).optional().allow('', null),
        current_role_ids: Joi.array()
            .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
            .optional(),
        role_change_reason: Joi.string().trim().max(500).optional().allow('', null)
    }).min(1),

    // updateEmployeeStatus
    updateEmployeeStatus: Joi.object({
        status: Joi.string()
            .valid('active', 'inactive', 'blocked')
            .required(),
        reason: Joi.string().trim().max(500).optional().allow('', null),
        notes: Joi.string().trim().max(1000).optional().allow('', null)
    }),













    // ============ REVIEW MANAGEMENT (ADMIN SIDE) ============

    // Get Reviews (List with Filters)
    adminGetReviews: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().optional().allow(''),
        status: Joi.string()
            .valid('all', 'pending', 'published', 'flagged', 'reported', 'hidden', 'rejected')
            .optional(),
        rating: Joi.number().integer().min(1).max(5).optional(),
        seller_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
        product_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
        report_count_min: Joi.number().integer().min(0).optional(),
        sort_by: Joi.string()
            .valid('created_at', 'rating', 'helpful_count', 'report_count')
            .default('created_at'),
        sort_order: Joi.string().valid('asc', 'desc').default('desc'),
    }),

    // Review ID Param
    adminReviewIdParam: Joi.object({
        reviewId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required(),
    }),

    // Moderate Review (Publish/Hide/Reject/Flag)
    adminModerateReview: Joi.object({
        action: Joi.string()
            .valid('publish', 'hide', 'reject', 'flag', 'unflag')
            .required(),
        reason: Joi.string().optional().allow(''),
        admin_comment: Joi.string().optional().allow(''),
    }),















    // ============ PRODUCT VALIDATION  ============

    // Create Product
    createProduct: Joi.object({
        product_name: Joi.string()
            .min(2)
            .max(200)
            .required()
            .messages({
                'string.empty': 'Product name is required',
                'string.min': 'Product name must be at least 2 characters',
            }),

        description: Joi.string()
            .max(5000)
            .optional(),

        price: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Price must be a number',
                'number.positive': 'Price must be positive',
                'any.required': 'Price is required',
            }),

        mrp: Joi.number()
            .positive()
            .optional(),

        discount_percent: Joi.number()
            .min(0)
            .max(100)
            .optional(),

        stock_quantity: Joi.number()
            .integer()
            .min(0)
            .required()
            .messages({
                'number.base': 'Stock quantity must be a number',
                'number.integer': 'Stock quantity must be an integer',
                'number.min': 'Stock quantity cannot be negative',
                'any.required': 'Stock quantity is required',
            }),

        sku: Joi.string()
            .required()
            .messages({
                'string.empty': 'SKU is required',
            }),

        images: Joi.array()
            .items(Joi.string().uri())
            .optional(),

        category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid category ID',
                'string.empty': 'Category is required',
            }),

        sub_category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        brand: Joi.string()
            .optional(),

        attributes: Joi.object()
            .optional(),

        tags: Joi.array()
            .items(Joi.string())
            .optional(),

        status: Joi.string()
            .valid('active', 'inactive', 'pending', 'rejected', 'suspended')
            .default('pending'),

        approval_status: Joi.string()
            .valid('pending', 'approved', 'rejected')
            .default('pending'),
    }),

    // Update Product
    updateProduct: Joi.object({
        product_name: Joi.string()
            .min(2)
            .max(200)
            .optional(),

        description: Joi.string()
            .max(5000)
            .optional(),

        price: Joi.number()
            .positive()
            .optional(),

        mrp: Joi.number()
            .positive()
            .optional(),

        discount_percent: Joi.number()
            .min(0)
            .max(100)
            .optional(),

        stock_quantity: Joi.number()
            .integer()
            .min(0)
            .optional(),

        sku: Joi.string()
            .optional(),

        images: Joi.array()
            .items(Joi.string().uri())
            .optional(),

        category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        sub_category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        brand: Joi.string()
            .optional(),

        attributes: Joi.object()
            .optional(),

        tags: Joi.array()
            .items(Joi.string())
            .optional(),

        status: Joi.string()
            .valid('active', 'inactive', 'pending', 'rejected', 'suspended')
            .optional(),

        rejection_reason: Joi.string()
            .optional(),

        suspension_reason: Joi.string()
            .optional(),
    }),

    // Product Code Param (Since we use custom product_code)
    productCodeParam: Joi.object({
        productCode: Joi.string()
            .required()
            .messages({
                'string.empty': 'Product code is required',
            }),
    }),

    // Reject Product
    rejectProduct: Joi.object({
        rejection_reason: Joi.string()
            .required()
            .messages({
                'string.empty': 'Rejection reason is required',
            }),
    }),

    // Suspend Product
    suspendProduct: Joi.object({
        reason: Joi.string()
            .required()
            .messages({
                'string.empty': 'Suspension reason is required',
            }),
    }),

    // Get Products (With Filters)
    getProducts: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(10),

        search: Joi.string()
            .optional(),

        status: Joi.string()
            .valid('active', 'inactive', 'pending', 'rejected', 'suspended')
            .optional(),

        approval_status: Joi.string()
            .valid('pending', 'approved', 'rejected')
            .optional(),

        category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        sort_by: Joi.string()
            .valid('created_at', 'price', 'product_name', 'updated_at')
            .default('created_at'),

        sort_order: Joi.string()
            .valid('asc', 'desc')
            .default('desc'),
    }),

    // Product ID Param
    productIdParam: Joi.object({
        productId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid product ID',
                'string.empty': 'Product ID is required',
            }),
    }),
};

module.exports = adminValidation;