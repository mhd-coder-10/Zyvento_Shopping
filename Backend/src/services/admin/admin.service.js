// Handles all admin related business logic
// Manages dashboard data, user management, seller management, sub-admin management
// Also handles audit logs and system settings


const mongoose = require('mongoose');
const ApiError = require('../../utils/apiError');
const Helpers = require('../../utils/helpers');

const User = require('../../models/user.model');
const Seller = require('../../models/seller.model');
const SubAdmin = require('../../models/sub_admin.model')
const Employee = require('../../models/employee.model');
const EmployeeActivityLog = require('../../models/employee_activity_log.model');
const EmployeePermission = require('../../models/employee_permission.model');
const EmployeeRoleHistory = require('../../models/employee_role_history.model');
const Transaction = require('../../models/transaction.model');
const Category = require('../../models/category.model');
const SubCategory = require('../../models/sub_category.model');
const Order = require('../../models/order.model');
const OrderItem = require("../../models/order_item.model")
const Product = require('../../models/product.model');
const Finance = require('../../models/finance.model');
const Payment = require('../../models/payment.model');
const Inventory = require('../../models/inventory.model');
const AuditLog = require('../../models/audit_log.model');
const Return = require("../../models/return.model");
const Review = require('../../models/review.model');
const ReviewReport = require('../../models/review_report.model');
const Notification = require('../../models/notification.model');
const Coupon = require("../../models/coupon.model");
const SystemSetting = require('../../models/system_setting.model');
const CustomerComplaint = require('../../models/customer_complaint.model');

const logger = require('../../utils/logger');
const constants = require('../../config/constants');
const permissionService = require('../permission.service');
const auditService = require('../audit.service');





class AdminService {


    // ========== CREATE SUB-ADMIN ==========
    async createSubAdmin(data, assignedBy) {
        // Check if user exists
        const user = await User.findById(data.user_id);
        if (!user) throw ApiError.notFound('User not found');

        // Check if already a sub-admin
        const existing = await SubAdmin.findOne({ user_id: data.user_id });
        if (existing) throw ApiError.conflict('User is already a sub-admin');

        const subAdmin = new SubAdmin({
            ...data,
            assigned_by: assignedBy,
            current_role_ids: data.role_ids || [],
        });

        await subAdmin.save();

        // Optional: Update user's role to 'sub_admin' in User model if needed
        await User.findByIdAndUpdate(data.user_id, { user_type: 'sub_admin' });

        return subAdmin.populate('user_id', 'name email profile_image');
    }

    // ========== GET ALL SUB-ADMINS ==========
    async getAllSubAdmins(filters = {}) {
        const { page = 1, limit = 10, status, sub_admin_type, search } = filters;
        const query = {};

        if (status) query.status = status;
        if (sub_admin_type) query.sub_admin_type = sub_admin_type;

        if (search) {
            // Search by user name or email (we need to populate first, so we'll handle via aggregation or separate logic)
            // For simplicity, we'll use aggregation with lookup for search
            const pipeline = [
                { $match: query },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $match: search ? {
                        $or: [
                            { 'user.name': { $regex: search, $options: 'i' } },
                            { 'user.email': { $regex: search, $options: 'i' } },
                            { department: { $regex: search, $options: 'i' } },
                            { sub_admin_type: { $regex: search, $options: 'i' } }
                        ]
                    } : {}
                },
                { $sort: { created_at: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        sub_admin_type: 1,
                        department: 1,
                        designation: 1,
                        status: 1,
                        created_at: 1,
                        'user._id': 1,
                        'user.name': 1,
                        'user.email': 1,
                        'user.profile_image': 1
                    }
                }
            ];

            const data = await SubAdmin.aggregate(pipeline);
            const total = await SubAdmin.countDocuments(query);
            return { data, total, page, limit };
        } else {
            // Simple populate query
            const data = await SubAdmin.find(query)
                .populate('user_id', 'name email profile_image')
                .populate('current_role_ids', 'name slug')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await SubAdmin.countDocuments(query);
            return { data, total, page, limit };
        }
    }

    // ========== GET SINGLE SUB-ADMIN ==========
    async getSubAdminById(id) {
        const subAdmin = await SubAdmin.findById(id)
            .populate('user_id', 'name email profile_image phone')
            .populate('current_role_ids', 'name slug permissions')
            .populate('assigned_by', 'name')
            .populate('role_history.assigned_by', 'name');

        if (!subAdmin) throw ApiError.notFound('Sub-admin not found');
        return subAdmin;
    }

    // ========== UPDATE SUB-ADMIN ==========
    async updateSubAdmin(id, data) {
        const subAdmin = await SubAdmin.findById(id);
        if (!subAdmin) throw ApiError.notFound('Sub-admin not found');

        // Update fields
        if (data.sub_admin_type) subAdmin.sub_admin_type = data.sub_admin_type;
        if (data.department) subAdmin.department = data.department;
        if (data.designation) subAdmin.designation = data.designation;
        if (data.notes) subAdmin.notes = data.notes;
        if (data.current_role_ids) subAdmin.current_role_ids = data.current_role_ids;

        // Track role history if roles changed
        if (data.current_role_ids) {
            subAdmin.role_history.push({
                role_ids: data.current_role_ids,
                assigned_by: data.updated_by || subAdmin.assigned_by,
                reason: data.role_change_reason || 'Role updated'
            });
        }

        await subAdmin.save();
        return subAdmin.populate('user_id', 'name email');
    }

    // ========== UPDATE STATUS ==========
    async updateSubAdminStatus(id, status, suspendedReason = null, updatedBy) {
        const subAdmin = await SubAdmin.findById(id);
        if (!subAdmin) throw ApiError.notFound('Sub-admin not found');

        // Prevent self status change
        if (subAdmin.assigned_by.toString() === updatedBy) {
            throw ApiError.forbidden('You cannot change your own status');
        }

        subAdmin.status = status;
        if (status === 'suspended') {
            subAdmin.suspended_by = updatedBy;
            subAdmin.suspended_reason = suspendedReason;
            subAdmin.suspended_at = new Date();
        } else {
            subAdmin.suspended_by = null;
            subAdmin.suspended_reason = null;
            subAdmin.suspended_at = null;
        }

        await subAdmin.save();
        return subAdmin;
    }

    // ========== DELETE SUB-ADMIN ==========
    async deleteSubAdmin(id, userId) {
        const subAdmin = await SubAdmin.findById(id);
        if (!subAdmin) throw ApiError.notFound('Sub-admin not found');

        // Prevent self delete
        if (subAdmin.assigned_by.toString() === userId) {
            throw ApiError.forbidden('You cannot delete your own account');
        }

        await subAdmin.deleteOne();
        return { success: true };
    }

    // ============ DASHBOARD SERVICES ============
    async getDashboardOverview() {
        const [
            totalUsers,
            totalSellers,
            totalOrders,
            totalProducts,
            totalRevenue,
            pendingSellers,
            pendingOrders,
            activeUsers
        ] = await Promise.all([
            User.countDocuments({ user_type: { $ne: constants.USER_TYPES.SUPER_ADMIN } }),
            Seller.countDocuments({ account_status: constants.ACCOUNT_STATUS.ACTIVE }),
            Order.countDocuments(),
            Product.countDocuments({ status: 'active' }),
            Payment.aggregate([
                { $match: { payment_status: constants.PAYMENT_STATUS.PAID } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Seller.countDocuments({ verification_status: constants.VERIFICATION_STATUS.PENDING }),
            Order.countDocuments({ order_status: constants.ORDER_STATUS.PENDING }),
            User.countDocuments({ account_status: constants.ACCOUNT_STATUS.ACTIVE })
        ]);

        return {
            totalUsers,
            totalSellers,
            totalOrders,
            totalProducts,
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingSellers,
            pendingOrders,
            activeUsers
        };
    }

    async getDashboardStatistics() {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const [dailyOrders, dailyRevenue, topSellers, topProducts] = await Promise.all([
            Order.aggregate([
                { $match: { created_at: { $gte: last7Days } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Payment.aggregate([
                {
                    $match: {
                        created_at: { $gte: last7Days },
                        payment_status: constants.PAYMENT_STATUS.PAID
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        total: { $sum: '$amount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                { $match: { created_at: { $gte: last7Days } } },
                { $group: { _id: '$seller_id', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'sellers',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                { $unwind: '$seller' },
                {
                    $project: {
                        sellerId: '$_id',
                        businessName: '$seller.business_name',
                        orders: '$count'
                    }
                }
            ]),
            Product.aggregate([
                { $match: { created_at: { $gte: last7Days } } },
                { $group: { _id: '$_id', views: { $sum: '$views' } } },
                { $sort: { views: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $project: {
                        productId: '$_id',
                        productName: '$product.product_name',
                        views: 1
                    }
                }
            ])
        ]);

        const orderStatusCounts = await Order.aggregate([
            { $group: { _id: '$order_status', count: { $sum: 1 } } }
        ]);

        return {
            dailyOrders,
            dailyRevenue,
            topSellers,
            topProducts,
            orderStatusCounts
        };
    }

    async getRecentActivity(limit = 10) {
        const logs = await AuditLog.find()
            .sort({ created_at: -1 })
            .limit(limit)
            .populate('user_id', 'first_name last_name email user_type');
        return logs;
    }

    async getChartsData(period = 'weekly') {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'monthly':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'yearly':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 7));
        }

        const [orders, revenue, users, sellers] = await Promise.all([
            Order.aggregate([
                { $match: { created_at: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Payment.aggregate([
                {
                    $match: {
                        created_at: { $gte: startDate },
                        payment_status: constants.PAYMENT_STATUS.PAID
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        total: { $sum: '$amount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            User.aggregate([
                { $match: { created_at: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Seller.aggregate([
                { $match: { created_at: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        return {
            orders,
            revenue,
            users,
            sellers,
            period
        };
    }

    // ============ USER MANAGEMENT SERVICE ============

    // Get All Users
    async getAllUsers({
        page = 1,
        limit = 10,
        search = null,
        userType = null,
        subAdminType = null,
        employeeType = null,
        accountStatus = null,
        sortBy = 'created_at',
        sortOrder = 'desc',
        startDate = null,
        endDate = null
    }) {
        const query = {};

        // 🔥 ALWAYS hide deleted users (unless admin explicitly asks for "deleted")
        if (accountStatus && accountStatus !== 'all') {
            query.account_status = accountStatus;
        } else {
            // Default: exclude deleted users from list
            query.account_status = { $ne: 'deleted' };
        }

        // Filter: exact user_type
        if (userType && userType !== 'all') {
            query.user_type = userType;
        }

        // Filter: sub_admin_type
        if (subAdminType && subAdminType !== 'all') {
            query.sub_admin_type = subAdminType;
        }

        // Filter: employee_type
        if (employeeType && employeeType !== 'all') {
            query.employee_type = employeeType;
        }

        // Filter: search
        if (search) {
            query.$or = [
                { first_name: { $regex: search, $options: 'i' } },
                { last_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile_number: { $regex: search, $options: 'i' } },
                { user_code: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter: date range
        if (startDate || endDate) {
            query.created_at = {};
            if (startDate) query.created_at.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.created_at.$lte = end;
            }
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -refresh_token -password_reset_token')
                .populate('seller_id', 'business_name account_status')
                .populate('employee_id', 'employee_type designation')
                .populate('role_ids', 'role_name role_key')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        return {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit) || 1
            }
        };
    }

    // USER STATS (For Summary Cards)
    async getUserStats() {
        const result = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: { $sum: { $cond: [{ $eq: ['$account_status', 'active'] }, 1, 0] } },
                    inactiveUsers: { $sum: { $cond: [{ $eq: ['$account_status', 'inactive'] }, 1, 0] } },
                    blockedUsers: { $sum: { $cond: [{ $eq: ['$account_status', 'blocked'] }, 1, 0] } },
                    pendingUsers: { $sum: { $cond: [{ $eq: ['$account_status', 'pending'] }, 1, 0] } },
                    superAdmins: { $sum: { $cond: [{ $eq: ['$user_type', 'super_admin'] }, 1, 0] } },
                    subAdmins: { $sum: { $cond: [{ $eq: ['$user_type', 'sub_admin'] }, 1, 0] } },
                    sellers: { $sum: { $cond: [{ $eq: ['$user_type', 'seller'] }, 1, 0] } },
                    sellerEmployees: { $sum: { $cond: [{ $eq: ['$user_type', 'seller_employee'] }, 1, 0] } },
                    customers: { $sum: { $cond: [{ $eq: ['$user_type', 'customer'] }, 1, 0] } }
                }
            }
        ]);

        return result[0] || {
            totalUsers: 0, activeUsers: 0, inactiveUsers: 0, blockedUsers: 0, pendingUsers: 0,
            superAdmins: 0, subAdmins: 0, sellers: 0, sellerEmployees: 0, customers: 0
        };
    }

    // GET USER BY ID OR CODE
    async getUserById(identifier) {
        let query = {};

        // Check if it's a valid Mongo ObjectId
        if (mongoose.Types.ObjectId.isValid(identifier) && String(identifier).length === 24) {
            query = { _id: identifier };
        } else {
            query = { user_code: identifier };
        }

        const user = await User.findOne(query)
            .select('-password -refresh_token -password_reset_token')
            .populate('role_ids')
            .populate('direct_permissions')
            .populate('seller_id')
            .populate('employee_id')
            .lean();

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        let additionalData = {};

        if (
            (user.user_type === constants.USER_TYPES.SELLER ||
                user.user_type === constants.USER_TYPES.SELLER_EMPLOYEE) &&
            user.seller_id
        ) {
            const seller = await Seller.findById(user.seller_id)
                .select('business_name business_type verification_status account_status')
                .lean();
            additionalData.seller = seller;
        }

        if (user.user_type === constants.USER_TYPES.SUB_ADMIN) {
            const subAdmin = await SubAdmin.findOne({ user_id: user._id })
                .populate('current_role_ids')
                .lean();
            additionalData.subAdmin = subAdmin;
        }

        return {
            user,
            ...additionalData
        };
    }

    // CREATE USER
    async createUser(createData, adminUserId) {
        const {
            first_name, last_name, email, mobile_number, password,
            user_type, sub_admin_type, employee_type, seller_id,
            account_status, username
        } = createData;

        // Check email exists
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            throw ApiError.conflict('Email already registered');
        }

        // Check mobile
        if (mobile_number) {
            const existingMobile = await User.findOne({ mobile_number });
            if (existingMobile) {
                throw ApiError.conflict('Mobile number already registered');
            }
        }

        // Check username
        if (username) {
            const existingUsername = await User.findOne({ username: username.toLowerCase() });
            if (existingUsername) {
                throw ApiError.conflict('Username already taken');
            }
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Conditional validation
        const finalSubAdminType = user_type === 'sub_admin' ? (sub_admin_type || null) : null;
        const finalEmployeeType = user_type === 'seller_employee' ? (employee_type || null) : null;

        if (user_type === 'sub_admin' && !finalSubAdminType) {
            throw ApiError.badRequest('Sub-admin type is required for sub-admin');
        }

        if (user_type === 'seller_employee' && !finalEmployeeType) {
            throw ApiError.badRequest('Employee type is required for seller employee');
        }

        const newUser = new User({
            first_name,
            last_name,
            email: email.toLowerCase(),
            mobile_number: mobile_number || null,
            password: hashedPassword,
            username: username ? username.toLowerCase() : null,
            user_type,
            sub_admin_type: finalSubAdminType,
            employee_type: finalEmployeeType,
            seller_id: seller_id || null,
            account_status: account_status || 'pending',
            is_email_verified: false,
            is_mobile_verified: false
        });

        await newUser.save(); // Pre-save hook generates user_code

        // Remove sensitive
        const userResponse = newUser.toObject();
        delete userResponse.password;
        delete userResponse.refresh_token;

        return userResponse;
    }

    // UPDATE USER
    async updateUser(identifier, updateData) {
        let query = {};
        if (mongoose.Types.ObjectId.isValid(identifier) && String(identifier).length === 24) {
            query = { _id: identifier };
        } else {
            query = { user_code: identifier };
        }

        const user = await User.findOne(query);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const allowedFields = [
            'first_name', 'last_name', 'email', 'mobile_number', 'username',
            'user_type', 'sub_admin_type', 'employee_type', 'seller_id',
            'account_status', 'date_of_birth', 'gender',
            'address', 'city', 'state', 'country', 'postal_code',
            'preferences'
        ];

        // Handle conditional enum cleanup
        const newUserType = updateData.user_type || user.user_type;

        if (newUserType !== 'sub_admin') {
            updateData.sub_admin_type = null;
        }
        if (newUserType !== 'seller_employee') {
            updateData.employee_type = null;
            updateData.seller_id = null;
        }

        const filteredData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        Object.assign(user, filteredData);
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refresh_token;

        return userResponse;
    }

    // UPDATE USER STATUS
    async updateUserStatus(identifier, status, reason = null) {
        let query = {};
        if (mongoose.Types.ObjectId.isValid(identifier) && String(identifier).length === 24) {
            query = { _id: identifier };
        } else {
            query = { user_code: identifier };
        }

        const user = await User.findOne(query);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        if (user.user_type === constants.USER_TYPES.SUPER_ADMIN) {
            throw ApiError.forbidden('Cannot update super admin status');
        }

        user.account_status = status;
        await user.save();

        if (status === constants.ACCOUNT_STATUS.BLOCKED && user.seller_id) {
            await Seller.findByIdAndUpdate(user.seller_id, {
                account_status: constants.ACCOUNT_STATUS.BLOCKED
            });
        }

        return user;
    }

    //  DELETE USER
    async deleteUser(identifier) {
        let query = {};
        if (mongoose.Types.ObjectId.isValid(identifier) && String(identifier).length === 24) {
            query = { _id: identifier };
        } else {
            query = { user_code: identifier };
        }

        const user = await User.findOne(query);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        // Prevent deleting Super Admin
        if (user.user_type === constants.USER_TYPES.SUPER_ADMIN) {
            throw ApiError.forbidden('Cannot delete super admin');
        }

        // Delete related extension documents
        if (user.user_type === 'sub_admin') {
            await SubAdmin.deleteMany({ user_id: user._id });
        }
        if (user.user_type === 'seller_employee') {
            await Employee.deleteMany({ user_id: user._id });
        }

        // Permanently remove from database
        await User.deleteOne({ _id: user._id });

        return { message: 'User permanently deleted', _id: user._id, email: user.email };
    }

    // ============ SELLER MANAGEMENT SERVICE ============

    // Helper: Build query for seller lookup (supports both _id and seller_code)
    _buildSellerQuery(identifier) {
        const mongoose = require('mongoose');
        if (mongoose.Types.ObjectId.isValid(identifier) && String(identifier).length === 24) {
            return { _id: identifier };
        }
        return { seller_code: identifier };
    }

    // Get Seller Stats
    async getSellerStats() {
        const [
            totalSellers,
            activeSellers,
            pendingSellers,
            approvedSellers,
            inactiveSellers,
            suspendedSellers,
            rejectedSellers,
        ] = await Promise.all([
            Seller.countDocuments(),
            Seller.countDocuments({ account_status: 'active' }),
            Seller.countDocuments({ account_status: 'pending' }),
            Seller.countDocuments({ account_status: 'approved' }),
            Seller.countDocuments({ account_status: 'inactive' }),
            Seller.countDocuments({ account_status: 'suspended' }),
            Seller.countDocuments({ account_status: 'rejected' }),
        ]);

        return {
            totalSellers,
            activeSellers,
            pendingSellers,
            approvedSellers,
            inactiveSellers,
            suspendedSellers,
            rejectedSellers,
        };
    }

    // Get All Sellers (with filters, pagination)
    async getAllSellers({
        page = 1,
        limit = 10,
        search = null,
        accountStatus = null,
        verificationStatus = null,
        businessType = null,
        sortBy = 'created_at',
        sortOrder = 'desc',
    }) {
        const query = {};

        if (accountStatus && accountStatus !== 'all') {
            query.account_status = accountStatus;
        }
        if (verificationStatus && verificationStatus !== 'all') {
            query.verification_status = verificationStatus;
        }
        if (businessType && businessType !== 'all') {
            query.business_type = businessType;
        }

        if (search) {
            query.$or = [
                { business_name: { $regex: search, $options: 'i' } },
                { owner_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile_number: { $regex: search, $options: 'i' } },
                { business_registration_number: { $regex: search, $options: 'i' } },
                { seller_code: { $regex: search, $options: 'i' } },
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [sellers, total] = await Promise.all([
            Seller.find(query)
                .populate('user_id', 'first_name last_name email mobile_number user_code profile_image account_status')
                .populate('approved_by', 'first_name last_name')
                .sort(sortOptions)
                .skip((parseInt(page) - 1) * parseInt(limit))
                .limit(parseInt(limit))
                .lean(),
            Seller.countDocuments(query),
        ]);

        return {
            sellers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)) || 1,
            },
        };
    }

    // Get Seller By ID or Code (Enhanced)
    async getSellerById(identifier) {

        const query = this._buildSellerQuery(identifier);

        const seller = await Seller.findOne(query)
            .populate('user_id', 'first_name last_name email mobile_number user_code profile_image account_status')
            .populate('approved_by', 'first_name last_name email')
            .lean();

        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const sellerId = seller._id;

        // Fetch related data in parallel
        const [
            employees,
            totalProducts,
            activeProducts,
            totalOrders,
            recentOrders,
            recentReviews,
            reviewsData,
            complaintStats,
        ] = await Promise.all([
            // Employees under this seller
            Employee.find({ $or: [{ seller_id: sellerId }, { seller_ids: sellerId }] })
                .populate('user_id', 'first_name last_name email mobile_number user_code profile_image account_status')
                .populate('role_ids', 'role_name role_key')
                .lean(),

            // Product counts
            Product.countDocuments({ seller_id: sellerId, deleted_at: null }),
            Product.countDocuments({ seller_id: sellerId, status: 'active', deleted_at: null }),

            // Order count
            Order.countDocuments({ seller_id: sellerId }),

            // Recent orders
            Order.find({ seller_id: sellerId })
                .select('order_code order_number total_amount order_status payment_status created_at')
                .sort({ created_at: -1 })
                .limit(5)
                .lean(),

            // Recent reviews
            Review.find({ seller_id: sellerId, deleted_at: null })
                .populate('user_id', 'first_name last_name user_code profile_image')
                .populate('product_id', 'product_name product_code images')
                .select('review_code rating title comment images status is_verified_purchase helpful_count created_at')
                .sort({ created_at: -1 })
                .limit(5)
                .lean(),

            // Review statistics
            Review.aggregate([
                {
                    $match: {
                        seller_id: sellerId,
                        status: { $in: ['published', 'reported'] },
                        deleted_at: null,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalReviews: { $sum: 1 },
                        averageRating: { $avg: '$rating' },
                        fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                        fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                        threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                        twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                        oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                    },
                },
            ]),

            // Complaint statistics
            CustomerComplaint.aggregate([
                { $match: { seller_id: sellerId, deleted_at: null } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
        ]);

        // Process review stats
        const reviewStats = reviewsData[0] || {
            totalReviews: 0,
            averageRating: 0,
            fiveStar: 0,
            fourStar: 0,
            threeStar: 0,
            twoStar: 0,
            oneStar: 0,
        };
        delete reviewStats._id;

        // Process complaint stats
        const complaintsByStatus = {
            pending: 0,
            under_review: 0,
            resolved: 0,
            rejected: 0,
            dismissed: 0,
            escalated: 0,
        };
        complaintStats.forEach((c) => {
            if (complaintsByStatus[c._id] !== undefined) {
                complaintsByStatus[c._id] = c.count;
            }
        });
        const totalComplaints = Object.values(complaintsByStatus).reduce((a, b) => a + b, 0);

        return {
            seller,
            employees,
            statistics: {
                totalProducts,
                activeProducts,
                totalOrders,
                reviews: reviewStats,
                complaints: {
                    total: totalComplaints,
                    ...complaintsByStatus,
                },
            },
            recentOrders,
            recentReviews,
        };
    }

    // Update Seller Details (Business Info Only)
    async updateSellerDetails(identifier, updateData) {
        const query = this._buildSellerQuery(identifier);

        const allowedFields = [
            'business_name',
            'owner_name',
            'email',
            'mobile_number',
            'business_type',
            'gst_number',
            'pan_number',
            'business_address',
            'commission_rate',
            'settings',
        ];

        const filteredData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        const seller = await Seller.findOneAndUpdate(query, filteredData, {
            new: true,
            runValidators: true,
        })
            .populate('user_id', 'first_name last_name email')
            .populate('approved_by', 'first_name last_name');

        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        return seller;
    }

    // Update Seller Status (Single Method - Handles all transitions)
    async updateSellerStatus(identifier, newStatus, reason, notes, adminId) {
        const query = this._buildSellerQuery(identifier);

        const seller = await Seller.findOne(query);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const currentStatus = seller.account_status;

        // Validate transition rules
        const allowedTransitions = {
            pending: ['approved', 'rejected'],
            approved: ['active'],
            active: ['inactive', 'suspended'],
            inactive: ['active', 'suspended'],
            suspended: ['active', 'inactive'],
            rejected: ['pending'],
        };

        const allowed = allowedTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw ApiError.badRequest(
                `Cannot change status from '${currentStatus}' to '${newStatus}'. Allowed: ${allowed.join(', ') || 'none'}`
            );
        }

        // Once approved, cannot revert to pending or approved again
        if (seller.approved_at && (newStatus === 'pending' || newStatus === 'approved')) {
            throw ApiError.forbidden(
                'Seller has already been approved. Cannot revert to pending or approved status.'
            );
        }

        // Update fields based on new status
        const updateData = { account_status: newStatus };

        switch (newStatus) {
            case 'approved':
                updateData.verification_status = 'approved';
                updateData.approved_by = adminId;
                updateData.approved_at = new Date();
                updateData.rejection_reason = null;
                break;

            case 'rejected':
                updateData.verification_status = 'rejected';
                updateData.rejection_reason = reason || 'Rejected by admin';
                break;

            case 'active':
                updateData.rejection_reason = null;
                if (seller.verification_status !== 'approved') {
                    updateData.verification_status = 'approved';
                }
                if (!seller.approved_at) {
                    updateData.approved_at = new Date();
                    updateData.approved_by = adminId;
                }
                break;

            case 'inactive':
                break;

            case 'suspended':
                updateData.rejection_reason = reason || 'Suspended by admin';
                updateData.verification_status = 'suspended';
                break;

            case 'pending':
                updateData.verification_status = 'pending';
                updateData.rejection_reason = null;
                break;

            default:
                break;
        }

        // Apply update
        Object.assign(seller, updateData);
        await seller.save();

        // Sync with User account status (for authentication + seller-side enforcement)
        if (seller.user_id) {
            const userStatusMap = {
                pending: 'pending',
                approved: 'active',
                active: 'active',
                inactive: 'inactive',
                suspended: 'blocked',
                rejected: 'inactive',
            };
            const userAccountStatus = userStatusMap[newStatus] || 'active';
            await User.findByIdAndUpdate(seller.user_id, {
                account_status: userAccountStatus,
            });
        }

        return seller.populate([
            { path: 'user_id', select: 'first_name last_name email user_code account_status' },
            { path: 'approved_by', select: 'first_name last_name' },
        ]);
    }

    // DELETE SELLER (Cascade - Removes all related data)
    async deleteSeller(identifier) {

        const query = this._buildSellerQuery(identifier);

        const seller = await Seller.findOne(query);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const sellerId = seller._id;
        const sellerUserId = seller.user_id;

        // ============ CASCADE DELETE ALL RELATED DATA ============

        // 1. Delete all products of this seller
        const deletedProducts = await Product.deleteMany({ seller_id: sellerId });

        // 2. Delete all reviews for this seller
        const deletedReviews = await Review.deleteMany({ seller_id: sellerId });

        // 3. Delete all complaints for this seller
        const deletedComplaints = await CustomerComplaint.deleteMany({ seller_id: sellerId });

        // 4. Delete all order items for this seller (order records stay for history)
        const deletedOrderItems = await OrderItem.deleteMany({ seller_id: sellerId });

        // 5. Find and delete all employees of this seller
        const employees = await Employee.find({
            $or: [{ seller_id: sellerId }, { seller_ids: sellerId }],
        }).select('user_id');

        const employeeUserIds = employees.map((e) => e.user_id).filter(Boolean);

        await Employee.deleteMany({
            $or: [{ seller_id: sellerId }, { seller_ids: sellerId }],
        });

        // 6. Delete employee user accounts
        if (employeeUserIds.length > 0) {
            await User.deleteMany({ _id: { $in: employeeUserIds } });
        }

        // 7. Delete the linked user account (the seller's own user account)
        if (sellerUserId) {
            await User.deleteOne({ _id: sellerUserId });
        }

        // 8. Finally delete the seller document
        await Seller.deleteOne({ _id: sellerId });

        return {
            success: true,
            message: 'Seller and all related data permanently deleted',
            deleted: {
                seller_id: sellerId,
                seller_code: seller.seller_code,
                business_name: seller.business_name,
                products_deleted: deletedProducts.deletedCount,
                reviews_deleted: deletedReviews.deletedCount,
                complaints_deleted: deletedComplaints.deletedCount,
                order_items_deleted: deletedOrderItems.deletedCount,
                employees_deleted: employees.length,
            },
        };
    }

    // Export Sellers to CSV
    async exportSellers({ search = null, status = null } = {}) {
        const query = {};
        if (status && status !== 'all') query.account_status = status;
        if (search) {
            query.$or = [
                { business_name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { owner_name: new RegExp(search, 'i') },
                { mobile_number: new RegExp(search, 'i') },
                { seller_code: new RegExp(search, 'i') },
            ];
        }

        const sellers = await Seller.find(query)
            .populate('user_id', 'user_code')
            .lean();

        const headers = [
            'Seller Code',
            'Business Name',
            'Owner Name',
            'Email',
            'Mobile',
            'Business Type',
            'Verification Status',
            'Account Status',
            'Commission Rate',
            'Total Orders',
            'Total Revenue',
            'Rating',
            'Joined',
        ];

        const csvRows = [headers.join(',')];

        sellers.forEach((seller) => {
            const row = [
                seller.seller_code || 'N/A',
                seller.business_name || '',
                seller.owner_name || '',
                seller.email || '',
                seller.mobile_number || '',
                seller.business_type || 'individual',
                seller.verification_status || 'pending',
                seller.account_status || 'pending',
                seller.commission_rate || 10,
                seller.total_orders || 0,
                seller.total_revenue || 0,
                seller.rating || 0,
                seller.created_at ? new Date(seller.created_at).toLocaleDateString('en-IN') : '',
            ];
            csvRows.push(
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
            );
        });

        return csvRows.join('\n');
    }




    // ============ SUB-ADMINS MANAGEMENT SERVICE ============

    // Generate Sub Admin Code
    // _generateSubAdminCode() {
    //     const ts = Date.now().toString(36).toUpperCase();
    //     const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    //     return `SUBA-${ts}${rand}`;
    // }

    // // Get All Sub-Admins (paginated + filters + view switching)
    // // view: 'active' (default) | 'deleted'
    // async getAllSubAdmins(query = {}) {
    //     const {
    //         page = 1,
    //         limit = 10,
    //         search = '',
    //         sub_admin_type = 'all',
    //         status = 'all',
    //         department = 'all',
    //         view = 'active',
    //         sort_by = 'created_at',
    //         sort_order = 'desc',
    //         start_date,
    //         end_date
    //     } = query;

    //     // 👇 View-based filter — safe with $ne for legacy data
    //     const filter = view === 'deleted'
    //         ? { is_deleted: true }
    //         : { is_deleted: { $ne: true } };

    //     if (sub_admin_type !== 'all') filter.sub_admin_type = sub_admin_type;
    //     if (status !== 'all') filter.status = status;
    //     if (department !== 'all') filter.department = department;

    //     if (search) {
    //         filter.$or = [
    //             { sub_admin_code: { $regex: search, $options: 'i' } },
    //             { full_name: { $regex: search, $options: 'i' } },
    //             { email: { $regex: search, $options: 'i' } },
    //             { department: { $regex: search, $options: 'i' } }
    //         ];
    //     }

    //     if (start_date || end_date) {
    //         filter.created_at = {};
    //         if (start_date) filter.created_at.$gte = new Date(start_date);
    //         if (end_date) filter.created_at.$lte = new Date(end_date);
    //     }

    //     const skip = (page - 1) * limit;
    //     const sort = { [sort_by]: sort_order === 'asc' ? 1 : -1 };

    //     const [subAdmins, total] = await Promise.all([
    //         SubAdmin.find(filter)
    //             .populate('user_id', 'profile_image email mobile_number')
    //             .populate('current_role_ids', 'name display_name')
    //             .sort(sort)
    //             .skip(skip)
    //             .limit(Number(limit))
    //             .lean(),
    //         SubAdmin.countDocuments(filter)
    //     ]);

    //     return {
    //         sub_admins: subAdmins,
    //         pagination: {
    //             total,
    //             page: Number(page),
    //             limit: Number(limit),
    //             total_pages: Math.ceil(total / limit)
    //         }
    //     };
    // }

    // // Get Subadmin by code
    // async getSubAdminByCode(subAdminCode) {
    //     const subAdmin = await SubAdmin.findOne({
    //         sub_admin_code: subAdminCode,
    //         is_deleted: { $ne: true }
    //     })
    //         .populate('user_id', 'profile_image email mobile_number user_type')
    //         .populate('current_role_ids', 'name display_name permissions')
    //         .populate('assigned_by', 'email')
    //         .populate('suspended_by', 'email')
    //         .populate('status_history.changed_by', 'email')
    //         .lean();

    //     if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');
    //     return { subAdmin };
    // }

    // // Get Sub Admin State
    // async getSubAdminStats() {
    //     const baseFilter = { is_deleted: { $ne: true } };
    //     const [total, active, pending, suspended, inactive, deletedCount] = await Promise.all([
    //         SubAdmin.countDocuments(baseFilter),
    //         SubAdmin.countDocuments({ ...baseFilter, status: 'active' }),
    //         SubAdmin.countDocuments({ ...baseFilter, status: 'pending' }),
    //         SubAdmin.countDocuments({ ...baseFilter, status: 'suspended' }),
    //         SubAdmin.countDocuments({ ...baseFilter, status: 'inactive' }),
    //         SubAdmin.countDocuments({ is_deleted: true })
    //     ]);

    //     const byType = await SubAdmin.aggregate([
    //         { $match: { is_deleted: { $ne: true } } },
    //         { $group: { _id: '$sub_admin_type', count: { $sum: 1 } } }
    //     ]);

    //     return {
    //         total,
    //         active,
    //         pending,
    //         suspended,
    //         inactive,
    //         deleted: deletedCount,
    //         by_type: byType.reduce((acc, t) => {
    //             acc[t._id] = t.count;
    //             return acc;
    //         }, {})
    //     };
    // }

    // // Create Sub Admin
    // async createSubAdmin(data, assignedByUserId) {
    //     const { user_id, sub_admin_type, department, designation, notes, current_role_ids = [] } = data;

    //     const user = await User.findById(user_id);
    //     if (!user) throw ApiError.notFound('User not found');

    //     const existing = await SubAdmin.findOne({ user_id, is_deleted: { $ne: true } });
    //     if (existing) throw ApiError.badRequest('User is already a Sub-Admin');

    //     if (current_role_ids.length > 0) {
    //         const roleCount = await Role.countDocuments({ _id: { $in: current_role_ids } });
    //         if (roleCount !== current_role_ids.length) {
    //             throw ApiError.badRequest('One or more roles are invalid');
    //         }
    //     }

    //     const subAdmin = await SubAdmin.create({
    //         sub_admin_code: this._generateSubAdminCode(),
    //         user_id,
    //         assigned_by: assignedByUserId,
    //         email: user.email,
    //         full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
    //         mobile_number: user.mobile_number || null,
    //         sub_admin_type,
    //         department,
    //         designation: designation || null,
    //         current_role_ids,
    //         role_history: current_role_ids.length > 0
    //             ? [{ role_ids: current_role_ids, assigned_by: assignedByUserId, reason: 'Initial assignment' }]
    //             : [],
    //         status: 'pending',
    //         notes: notes || '',
    //         status_history: [{
    //             from: null,
    //             to: 'pending',
    //             changed_by: assignedByUserId,
    //             reason: 'Sub-Admin created'
    //         }]
    //     });

    //     return { subAdmin };
    // }

    // // Update Sub-admin Profile
    // async updateSubAdmin(subAdminCode, data, updatedByUserId) {
    //     const subAdmin = await SubAdmin.findOne({
    //         sub_admin_code: subAdminCode,
    //         is_deleted: { $ne: true }
    //     });
    //     if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');

    //     const allowed = ['sub_admin_type', 'department', 'designation', 'notes', 'mobile_number', 'full_name'];
    //     allowed.forEach((key) => {
    //         if (data[key] !== undefined) subAdmin[key] = data[key];
    //     });

    //     if (Array.isArray(data.current_role_ids)) {
    //         const roleCount = await Role.countDocuments({ _id: { $in: data.current_role_ids } });
    //         if (roleCount !== data.current_role_ids.length) {
    //             throw ApiError.badRequest('One or more roles are invalid');
    //         }
    //         subAdmin.current_role_ids = data.current_role_ids;
    //         subAdmin.role_history.push({
    //             role_ids: data.current_role_ids,
    //             assigned_by: updatedByUserId,
    //             assigned_at: new Date(),
    //             reason: data.role_change_reason || 'Roles updated'
    //         });
    //     }

    //     await subAdmin.save();

    //     if (data.full_name || data.mobile_number) {
    //         await User.updateOne(
    //             { _id: subAdmin.user_id },
    //             {
    //                 $set: {
    //                     ...(data.full_name && {
    //                         first_name: data.full_name.split(' ')[0] || '',
    //                         last_name: data.full_name.split(' ').slice(1).join(' ') || ''
    //                     }),
    //                     ...(data.mobile_number && { mobile_number: data.mobile_number })
    //                 }
    //             }
    //         );
    //     }

    //     return { subAdmin };
    // }

    // // Update Status — with User account_status sync
    // async updateSubAdminStatus(subAdminCode, { status, reason, notes }, changedByUserId) {
    //     const ALLOWED_TRANSITIONS = {
    //         pending: ['active', 'inactive'],
    //         active: ['inactive', 'suspended'],
    //         inactive: ['active', 'suspended'],
    //         suspended: ['active', 'inactive']
    //     };

    //     const subAdmin = await SubAdmin.findOne({
    //         sub_admin_code: subAdminCode,
    //         is_deleted: { $ne: true }
    //     });
    //     if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');

    //     if (subAdmin.status === status) {
    //         throw ApiError.badRequest(`Sub-Admin is already ${status}`);
    //     }

    //     const allowed = ALLOWED_TRANSITIONS[subAdmin.status] || [];
    //     if (!allowed.includes(status)) {
    //         throw ApiError.badRequest(
    //             `Invalid transition: ${subAdmin.status} → ${status}. Allowed: ${allowed.join(', ')}`
    //         );
    //     }

    //     if (status === 'suspended' && (!reason || !reason.trim())) {
    //         throw ApiError.badRequest('Suspension reason is required');
    //     }

    //     const previousStatus = subAdmin.status;
    //     subAdmin.status = status;

    //     if (status === 'suspended') {
    //         subAdmin.suspended_by = changedByUserId;
    //         subAdmin.suspended_reason = reason;
    //         subAdmin.suspended_at = new Date();
    //     } else if (previousStatus === 'suspended') {
    //         subAdmin.suspended_by = null;
    //         subAdmin.suspended_reason = null;
    //         subAdmin.suspended_at = null;
    //     }

    //     subAdmin.status_history.push({
    //         from: previousStatus,
    //         to: status,
    //         changed_by: changedByUserId,
    //         reason: reason || '',
    //         notes: notes || '',
    //         changed_at: new Date()
    //     });

    //     await subAdmin.save();

    //     // Sync User account_status
    //     const userStatusMap = {
    //         active: 'active',
    //         inactive: 'inactive',
    //         suspended: 'blocked',
    //         pending: 'pending'
    //     };
    //     await User.updateOne(
    //         { _id: subAdmin.user_id },
    //         { $set: { account_status: userStatusMap[status] || 'pending' } }
    //     );

    //     return { subAdmin };
    // }

    // // Soft Delete Sub-Admin — Blocks login + hides from list
    // async deleteSubAdmin(subAdminCode, deletedByUserId) {
    //     const subAdmin = await SubAdmin.findOne({
    //         sub_admin_code: subAdminCode,
    //         is_deleted: { $ne: true }
    //     });
    //     if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');

    //     subAdmin.is_deleted = true;
    //     subAdmin.deleted_at = new Date();
    //     subAdmin.deleted_by = deletedByUserId;

    //     subAdmin.status_history.push({
    //         from: subAdmin.status,
    //         to: 'deleted',
    //         changed_by: deletedByUserId,
    //         reason: 'Sub-Admin deleted by admin',
    //         changed_at: new Date()
    //     });

    //     await subAdmin.save();

    //     // Block linked user account — login pe access nahi milega
    //     await User.updateOne(
    //         { _id: subAdmin.user_id },
    //         { $set: { account_status: 'deleted' } }
    //     );

    //     return { subAdmin };
    // }

    // // Get Deleted Sub-Admins (for Deleted tab)
    // async getDeletedSubAdmins(query = {}) {
    //     const {
    //         page = 1,
    //         limit = 10,
    //         search = '',
    //         sub_admin_type = 'all',
    //         sort_by = 'deleted_at',
    //         sort_order = 'desc'
    //     } = query;

    //     const filter = { is_deleted: true };

    //     if (sub_admin_type !== 'all') filter.sub_admin_type = sub_admin_type;

    //     if (search) {
    //         filter.$or = [
    //             { sub_admin_code: { $regex: search, $options: 'i' } },
    //             { full_name: { $regex: search, $options: 'i' } },
    //             { email: { $regex: search, $options: 'i' } }
    //         ];
    //     }

    //     const skip = (page - 1) * limit;
    //     const sort = { [sort_by]: sort_order === 'asc' ? 1 : -1 };

    //     const [subAdmins, total] = await Promise.all([
    //         SubAdmin.find(filter)
    //             .populate('deleted_by', 'email first_name last_name')
    //             .sort(sort)
    //             .skip(skip)
    //             .limit(Number(limit))
    //             .lean(),
    //         SubAdmin.countDocuments(filter)
    //     ]);

    //     return {
    //         sub_admins: subAdmins,
    //         pagination: {
    //             total,
    //             page: Number(page),
    //             limit: Number(limit),
    //             total_pages: Math.ceil(total / limit)
    //         }
    //     };
    // }

    // // Restore Sub-Admin — Bring back with previous status
    // async restoreSubAdmin(subAdminCode, restoredByUserId) {
    //     const subAdmin = await SubAdmin.findOne({
    //         sub_admin_code: subAdminCode,
    //         is_deleted: true
    //     });
    //     if (!subAdmin) throw ApiError.notFound('Deleted Sub-Admin not found');

    //     // Restore to INACTIVE state — manager explicitly activate karega
    //     // (Safety: agar status active tha, tab bhi restore karte waqt inactive rakho)
    //     const restoreStatus = subAdmin.status === 'active' ? 'inactive' : subAdmin.status;

    //     subAdmin.is_deleted = false;
    //     subAdmin.deleted_at = null;
    //     subAdmin.deleted_by = null;
    //     subAdmin.status = restoreStatus;

    //     subAdmin.status_history.push({
    //         from: 'deleted',
    //         to: restoreStatus,
    //         changed_by: restoredByUserId,
    //         reason: 'Sub-Admin restored by admin',
    //         notes: 'Restored to inactive — activate manually after review',
    //         changed_at: new Date()
    //     });

    //     await subAdmin.save();

    //     // Sync User account_status — inactive so login works but no dashboard access
    //     await User.updateOne(
    //         { _id: subAdmin.user_id },
    //         { $set: { account_status: 'inactive' } }
    //     );

    //     return { subAdmin };
    // }

    // // Get History
    // async getSubAdminHistory(subAdminCode) {
    //     const subAdmin = await SubAdmin.findOne({
    //         sub_admin_code: subAdminCode,
    //         is_deleted: { $ne: true }
    //     })
    //         .select('status_history role_history')
    //         .populate('status_history.changed_by', 'email first_name last_name')
    //         .lean();

    //     if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');
    //     return subAdmin;
    // }




    // ============ SUB-ADMIN MANAGEMENT SERVICE ============

    // Generate unique Sub-Admin code
    _generateSubAdminCode() {
        const ts = Date.now().toString(36).toUpperCase();
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `SUBA-${ts}${rand}`;
    }

    // Get all Sub-Admins (paginated + filters + view switching)
    // view: 'active' (default) | 'deleted'
    async getAllSubAdmins(query = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            sub_admin_type = 'all',
            status = 'all',
            department = 'all',
            view = 'active',
            sort_by = 'created_at',
            sort_order = 'desc',
            start_date,
            end_date
        } = query;

        // View-based filter (uses $ne to handle legacy records)
        const filter = view === 'deleted'
            ? { is_deleted: true }
            : { is_deleted: { $ne: true } };

        if (sub_admin_type !== 'all') filter.sub_admin_type = sub_admin_type;
        if (status !== 'all') filter.status = status;
        if (department !== 'all') filter.department = department;

        if (search) {
            filter.$or = [
                { sub_admin_code: { $regex: search, $options: 'i' } },
                { full_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } }
            ];
        }

        if (start_date || end_date) {
            filter.created_at = {};
            if (start_date) filter.created_at.$gte = new Date(start_date);
            if (end_date) filter.created_at.$lte = new Date(end_date);
        }

        const skip = (page - 1) * limit;
        const sort = { [sort_by]: sort_order === 'asc' ? 1 : -1 };

        const [subAdmins, total] = await Promise.all([
            SubAdmin.find(filter)
                .populate('user_id', 'profile_image email mobile_number')
                .populate('current_role_ids', 'name display_name')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            SubAdmin.countDocuments(filter)
        ]);

        return {
            sub_admins: subAdmins,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                total_pages: Math.ceil(total / limit)
            }
        };
    }

    // Get Sub-Admin by code
    async getSubAdminByCode(subAdminCode) {
        const subAdmin = await SubAdmin.findOne({
            sub_admin_code: subAdminCode,
            is_deleted: { $ne: true }
        })
            .populate('user_id', 'profile_image email mobile_number user_type')
            .populate('current_role_ids', 'name display_name permissions')
            .populate('assigned_by', 'email')
            .populate('suspended_by', 'email')
            .populate('status_history.changed_by', 'email')
            .lean();

        if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');
        return { subAdmin };
    }

    // Get Sub-Admin stats
    async getSubAdminStats() {
        const baseFilter = { is_deleted: { $ne: true } };

        const [total, active, pending, suspended, inactive, deletedCount] = await Promise.all([
            SubAdmin.countDocuments(baseFilter),
            SubAdmin.countDocuments({ ...baseFilter, status: 'active' }),
            SubAdmin.countDocuments({ ...baseFilter, status: 'pending' }),
            SubAdmin.countDocuments({ ...baseFilter, status: 'suspended' }),
            SubAdmin.countDocuments({ ...baseFilter, status: 'inactive' }),
            SubAdmin.countDocuments({ is_deleted: true })
        ]);

        const byType = await SubAdmin.aggregate([
            { $match: { is_deleted: { $ne: true } } },
            { $group: { _id: '$sub_admin_type', count: { $sum: 1 } } }
        ]);

        return {
            total,
            active,
            pending,
            suspended,
            inactive,
            deleted: deletedCount,
            by_type: byType.reduce((acc, t) => {
                acc[t._id] = t.count;
                return acc;
            }, {})
        };
    }

    // Create Sub-Admin
    async createSubAdmin(data, assignedByUserId) {
        const { user_id, sub_admin_type, department, designation, notes, current_role_ids = [] } = data;

        const user = await User.findById(user_id);
        if (!user) throw ApiError.notFound('User not found');

        const existing = await SubAdmin.findOne({ user_id, is_deleted: { $ne: true } });
        if (existing) throw ApiError.badRequest('User is already a Sub-Admin');

        if (current_role_ids.length > 0) {
            const roleCount = await Role.countDocuments({ _id: { $in: current_role_ids } });
            if (roleCount !== current_role_ids.length) {
                throw ApiError.badRequest('One or more roles are invalid');
            }
        }

        const subAdmin = await SubAdmin.create({
            sub_admin_code: this._generateSubAdminCode(),
            user_id,
            assigned_by: assignedByUserId,
            email: user.email,
            full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
            mobile_number: user.mobile_number || null,
            sub_admin_type,
            department,
            designation: designation || null,
            current_role_ids,
            role_history: current_role_ids.length > 0
                ? [{ role_ids: current_role_ids, assigned_by: assignedByUserId, reason: 'Initial assignment' }]
                : [],
            status: 'pending',
            notes: notes || '',
            status_history: [{
                from: null,
                to: 'pending',
                changed_by: assignedByUserId,
                reason: 'Sub-Admin created'
            }]
        });

        return { subAdmin };
    }

    // Update Sub-Admin profile
    // async updateSubAdmin(subAdminCode, data, updatedByUserId) {
    //     const subAdmin = await SubAdmin.findOne({
    //         sub_admin_code: subAdminCode,
    //         is_deleted: { $ne: true }
    //     });
    //     if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');

    //     const allowed = ['sub_admin_type', 'department', 'designation', 'notes', 'mobile_number', 'full_name'];
    //     allowed.forEach((key) => {
    //         if (data[key] !== undefined) subAdmin[key] = data[key];
    //     });

    //     if (Array.isArray(data.current_role_ids)) {
    //         const roleCount = await Role.countDocuments({ _id: { $in: data.current_role_ids } });
    //         if (roleCount !== data.current_role_ids.length) {
    //             throw ApiError.badRequest('One or more roles are invalid');
    //         }
    //         subAdmin.current_role_ids = data.current_role_ids;
    //         subAdmin.role_history.push({
    //             role_ids: data.current_role_ids,
    //             assigned_by: updatedByUserId,
    //             assigned_at: new Date(),
    //             reason: data.role_change_reason || 'Roles updated'
    //         });
    //     }

    //     await subAdmin.save();

    //     // Sync denormalized fields back to User if changed
    //     if (data.full_name || data.mobile_number) {
    //         await User.updateOne(
    //             { _id: subAdmin.user_id },
    //             {
    //                 $set: {
    //                     ...(data.full_name && {
    //                         first_name: data.full_name.split(' ')[0] || '',
    //                         last_name: data.full_name.split(' ').slice(1).join(' ') || ''
    //                     }),
    //                     ...(data.mobile_number && { mobile_number: data.mobile_number })
    //                 }
    //             }
    //         );
    //     }

    //     return { subAdmin };
    // }
    // Update Sub-Admin profile
    async updateSubAdmin(subAdminCode, data, updatedByUserId) {
        const subAdmin = await SubAdmin.findOne({
            sub_admin_code: subAdminCode,
            is_deleted: { $ne: true }
        });
        if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');

        const allowed = ['sub_admin_type', 'department', 'designation', 'notes', 'mobile_number', 'full_name'];
        allowed.forEach((key) => {
            // Skip if undefined, null, or empty string
            const val = data[key];
            if (val !== undefined && val !== null && String(val).trim() !== '') {
                subAdmin[key] = typeof val === 'string' ? val.trim() : val;
            }
        });

        if (Array.isArray(data.current_role_ids)) {
            const roleCount = await Role.countDocuments({ _id: { $in: data.current_role_ids } });
            if (roleCount !== data.current_role_ids.length) {
                throw ApiError.badRequest('One or more roles are invalid');
            }
            subAdmin.current_role_ids = data.current_role_ids;
            subAdmin.role_history.push({
                role_ids: data.current_role_ids,
                assigned_by: updatedByUserId,
                assigned_at: new Date(),
                reason: data.role_change_reason || 'Roles updated'
            });
        }

        await subAdmin.save();

        // Sync denormalized fields back to User if changed
        if (data.full_name || data.mobile_number) {
            await User.updateOne(
                { _id: subAdmin.user_id },
                {
                    $set: {
                        ...(data.full_name && data.full_name.trim() && {
                            first_name: data.full_name.trim().split(' ')[0] || '',
                            last_name: data.full_name.trim().split(' ').slice(1).join(' ') || ''
                        }),
                        ...(data.mobile_number && data.mobile_number.trim() && { mobile_number: data.mobile_number.trim() })
                    }
                }
            );
        }

        return { subAdmin };
    }

    // Update Sub-Admin status (with User account_status sync)
    // async updateSubAdminStatus(subAdminCode, { status, reason, notes }, changedByUserId) {
    //     const ALLOWED_TRANSITIONS = {
    //         pending: ['active', 'inactive'],
    //         active: ['inactive', 'suspended'],
    //         inactive: ['active', 'suspended'],
    //         suspended: ['active', 'inactive']
    //     };

    //     const subAdmin = await SubAdmin.findOne({
    //         sub_admin_code: subAdminCode,
    //         is_deleted: { $ne: true }
    //     });
    //     if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');

    //     if (subAdmin.status === status) {
    //         throw ApiError.badRequest(`Sub-Admin is already ${status}`);
    //     }

    //     const allowed = ALLOWED_TRANSITIONS[subAdmin.status] || [];
    //     if (!allowed.includes(status)) {
    //         throw ApiError.badRequest(
    //             `Invalid transition: ${subAdmin.status} → ${status}. Allowed: ${allowed.join(', ')}`
    //         );
    //     }

    //     if (status === 'suspended' && (!reason || !reason.trim())) {
    //         throw ApiError.badRequest('Suspension reason is required');
    //     }

    //     const previousStatus = subAdmin.status;
    //     subAdmin.status = status;

    //     if (status === 'suspended') {
    //         subAdmin.suspended_by = changedByUserId;
    //         subAdmin.suspended_reason = reason;
    //         subAdmin.suspended_at = new Date();
    //     } else if (previousStatus === 'suspended') {
    //         subAdmin.suspended_by = null;
    //         subAdmin.suspended_reason = null;
    //         subAdmin.suspended_at = null;
    //     }

    //     subAdmin.status_history.push({
    //         from: previousStatus,
    //         to: status,
    //         changed_by: changedByUserId,
    //         reason: reason || '',
    //         notes: notes || '',
    //         changed_at: new Date()
    //     });

    //     await subAdmin.save();

    //     // Sync User account_status based on Sub-Admin status
    //     const userStatusMap = {
    //         active: 'active',
    //         inactive: 'inactive',
    //         suspended: 'blocked',
    //         pending: 'pending'
    //     };
    //     await User.updateOne(
    //         { _id: subAdmin.user_id },
    //         { $set: { account_status: userStatusMap[status] || 'pending' } }
    //     );

    //     return { subAdmin };
    // }

    // Update Sub-Admin status (with User account_status sync)
    async updateSubAdminStatus(subAdminCode, { status, reason, notes }, changedByUserId) {
        const ALLOWED_TRANSITIONS = {
            pending: ['active', 'inactive'],
            active: ['inactive', 'suspended'],
            inactive: ['active', 'suspended'],
            suspended: ['active', 'inactive']
        };

        const subAdmin = await SubAdmin.findOne({
            sub_admin_code: subAdminCode,
            is_deleted: { $ne: true }
        });
        if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');

        if (subAdmin.status === status) {
            throw ApiError.badRequest(`Sub-Admin is already ${status}`);
        }

        const allowed = ALLOWED_TRANSITIONS[subAdmin.status] || [];
        if (!allowed.includes(status)) {
            throw ApiError.badRequest(
                `Invalid transition: ${subAdmin.status} → ${status}. Allowed: ${allowed.join(', ')}`
            );
        }

        if (status === 'suspended' && (!reason || !reason.trim())) {
            throw ApiError.badRequest('Suspension reason is required');
        }

        const previousStatus = subAdmin.status;

        // Build update payload (only status-related fields)
        const statusHistoryEntry = {
            from: previousStatus,
            to: status,
            changed_by: changedByUserId,
            reason: reason || '',
            notes: notes || '',
            changed_at: new Date()
        };

        const updatePayload = {
            status,
            $push: { status_history: statusHistoryEntry }
        };

        if (status === 'suspended') {
            updatePayload.suspended_by = changedByUserId;
            updatePayload.suspended_reason = reason;
            updatePayload.suspended_at = new Date();
        } else if (previousStatus === 'suspended') {
            updatePayload.suspended_by = null;
            updatePayload.suspended_reason = null;
            updatePayload.suspended_at = null;
        }

        // 👇 Use findOneAndUpdate to only touch status-related fields
        const updated = await SubAdmin.findOneAndUpdate(
            { _id: subAdmin._id },
            updatePayload,
            { new: true }
        );

        // Sync User account_status
        const userStatusMap = {
            active: 'active',
            inactive: 'inactive',
            suspended: 'blocked',
            pending: 'pending'
        };
        await User.updateOne(
            { _id: subAdmin.user_id },
            { $set: { account_status: userStatusMap[status] || 'pending' } }
        );

        return { subAdmin: updated };
    }

    // Soft delete Sub-Admin (hides from list + blocks login)
    async deleteSubAdmin(subAdminCode, deletedByUserId) {
        const subAdmin = await SubAdmin.findOne({
            sub_admin_code: subAdminCode,
            is_deleted: { $ne: true }
        });
        if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');

        subAdmin.is_deleted = true;
        subAdmin.deleted_at = new Date();
        subAdmin.deleted_by = deletedByUserId;

        subAdmin.status_history.push({
            from: subAdmin.status,
            to: 'deleted',
            changed_by: deletedByUserId,
            reason: 'Sub-Admin deleted by admin',
            changed_at: new Date()
        });

        await subAdmin.save();

        // Block linked user account to prevent login
        await User.updateOne(
            { _id: subAdmin.user_id },
            { $set: { account_status: 'deleted' } }
        );

        return { subAdmin };
    }

    // Get deleted Sub-Admins (for Deleted tab)
    async getDeletedSubAdmins(query = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            sub_admin_type = 'all',
            sort_by = 'deleted_at',
            sort_order = 'desc'
        } = query;

        const filter = { is_deleted: true };

        if (sub_admin_type !== 'all') filter.sub_admin_type = sub_admin_type;

        if (search) {
            filter.$or = [
                { sub_admin_code: { $regex: search, $options: 'i' } },
                { full_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sort_by]: sort_order === 'asc' ? 1 : -1 };

        const [subAdmins, total] = await Promise.all([
            SubAdmin.find(filter)
                .populate('deleted_by', 'email first_name last_name')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            SubAdmin.countDocuments(filter)
        ]);

        return {
            sub_admins: subAdmins,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                total_pages: Math.ceil(total / limit)
            }
        };
    }

    // Restore Sub-Admin (returns to inactive state for safety)
    async restoreSubAdmin(subAdminCode, restoredByUserId) {
        const subAdmin = await SubAdmin.findOne({
            sub_admin_code: subAdminCode,
            is_deleted: true
        });
        if (!subAdmin) throw ApiError.notFound('Deleted Sub-Admin not found');

        // Restore to inactive state — manager must activate manually
        // (Safety: even if previous status was active, restore as inactive)
        const restoreStatus = subAdmin.status === 'active' ? 'inactive' : subAdmin.status;

        subAdmin.is_deleted = false;
        subAdmin.deleted_at = null;
        subAdmin.deleted_by = null;
        subAdmin.status = restoreStatus;

        subAdmin.status_history.push({
            from: 'deleted',
            to: restoreStatus,
            changed_by: restoredByUserId,
            reason: 'Sub-Admin restored by admin',
            notes: 'Restored to inactive — activate manually after review',
            changed_at: new Date()
        });

        await subAdmin.save();

        // Sync User account_status to inactive (login allowed but no dashboard access)
        await User.updateOne(
            { _id: subAdmin.user_id },
            { $set: { account_status: 'inactive' } }
        );

        return { subAdmin };
    }

    // Get Sub-Admin status and role history
    async getSubAdminHistory(subAdminCode) {
        const subAdmin = await SubAdmin.findOne({
            sub_admin_code: subAdminCode,
            is_deleted: { $ne: true }
        })
            .select('status_history role_history')
            .populate('status_history.changed_by', 'email first_name last_name')
            .lean();

        if (!subAdmin) throw ApiError.notFound('Sub-Admin not found');
        return subAdmin;
    }








    // ============ REVIEW MANAGEMENT SERVICE ============

    // Get All Reviews (with filters)
    async getAllReviews({
        page = 1,
        limit = 10,
        search = null,
        status = null,
        rating = null,
        sellerId = null,
        productId = null,
        reportCountMin = null,
        sortBy = 'created_at',
        sortOrder = 'desc',
    }) {

        const query = { deleted_at: null };

        if (status && status !== 'all') query.status = status;
        if (rating) query.rating = rating;
        if (sellerId) query.seller_id = sellerId;
        if (productId) query.product_id = productId;
        if (reportCountMin !== null) query.report_count = { $gte: reportCountMin };

        if (search) {
            query.$or = [
                { review_code: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { comment: { $regex: search, $options: 'i' } },
                { product_code: { $regex: search, $options: 'i' } },
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate('user_id', 'first_name last_name email user_code profile_image')
                .populate('product_id', 'product_name product_code images')
                .populate('seller_id', 'business_name')
                .sort(sortOptions)
                .skip((parseInt(page) - 1) * parseInt(limit))
                .limit(parseInt(limit))
                .lean(),
            Review.countDocuments(query),
        ]);

        return {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)) || 1,
            },
        };
    }

    // Get Review Stats
    async getReviewStats() {
        const Review = require('../models/review.model');
        const [
            totalReviews,
            publishedReviews,
            pendingReviews,
            flaggedReviews,
            reportedReviews,
            hiddenReviews,
            rejectedReviews,
            avgRatingAgg,
        ] = await Promise.all([
            Review.countDocuments({ deleted_at: null }),
            Review.countDocuments({ status: 'published', deleted_at: null }),
            Review.countDocuments({ status: 'pending', deleted_at: null }),
            Review.countDocuments({ status: 'flagged', deleted_at: null }),
            Review.countDocuments({ status: 'reported', deleted_at: null }),
            Review.countDocuments({ status: 'hidden', deleted_at: null }),
            Review.countDocuments({ status: 'rejected', deleted_at: null }),
            Review.aggregate([
                { $match: { deleted_at: null, status: { $in: ['published', 'reported'] } } },
                { $group: { _id: null, avg: { $avg: '$rating' } } },
            ]),
        ]);

        return {
            totalReviews,
            publishedReviews,
            pendingReviews,
            flaggedReviews,
            reportedReviews,
            hiddenReviews,
            rejectedReviews,
            averageRating: avgRatingAgg[0]?.avg
                ? parseFloat(avgRatingAgg[0].avg.toFixed(2))
                : 0,
        };
    }

    // Get Review By ID
    async getReviewById(reviewId) {
        const Review = require('../models/review.model');
        const review = await Review.findById(reviewId)
            .populate('user_id', 'first_name last_name email user_code profile_image')
            .populate('product_id', 'product_name product_code images price')
            .populate('seller_id', 'business_name email')
            .populate('order_id', 'order_code order_number')
            .populate('moderated_by', 'first_name last_name')
            .populate('moderation_history.admin_id', 'first_name last_name');

        if (!review) {
            throw ApiError.notFound('Review not found');
        }

        return review;
    }

    // Moderate Review (Publish/Hide/Reject/Flag)
    async moderateReview(reviewId, action, reason, adminComment, adminId) {
        const review = await Review.findById(reviewId);
        if (!review) {
            throw ApiError.notFound('Review not found');
        }

        const previousStatus = review.status;
        let newStatus = previousStatus;

        switch (action) {
            case 'publish':
                newStatus = 'published';
                review.published_at = new Date();
                break;
            case 'hide':
                newStatus = 'hidden';
                review.hidden_at = new Date();
                break;
            case 'reject':
                newStatus = 'rejected';
                review.rejected_at = new Date();
                break;
            case 'flag':
                newStatus = 'flagged';
                break;
            case 'unflag':
                newStatus = 'published';
                break;
            default:
                throw ApiError.badRequest('Invalid moderation action');
        }

        review.status = newStatus;
        review.moderation_reason = reason || null;
        review.admin_comment = adminComment || review.admin_comment;
        review.moderated_by = adminId;
        review.moderated_at = new Date();

        // Add to moderation history
        review.moderation_history.push({
            action,
            previous_status: previousStatus,
            new_status: newStatus,
            reason: reason || '',
            admin_id: adminId,
            timestamp: new Date(),
        });

        await review.save();

        return review;
    }






    // ============ EMPLOYEE MANAGEMENT  ============

    // Get Employee Stats
    async getEmployeeStats() {
        const [total, active, inactive, blocked, pending] = await Promise.all([
            Employee.countDocuments(),
            Employee.countDocuments({ status: 'active' }),
            Employee.countDocuments({ status: 'inactive' }),
            Employee.countDocuments({ status: 'blocked' }),
            Employee.countDocuments({ status: 'pending' }),
        ]);
        return { total, active, inactive, blocked, pending };
    }

    // Get All Employees
    async getAllEmployees({ page = 1, limit = 10, search = null, status = null, sortBy = 'created_at', sortOrder = 'desc' } = {}) {
        const query = {};
        if (status) query.status = status;

        // Search - Only Employee collection fields 
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { employee_code: regex },
                { employee_type: regex },
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [employees, total] = await Promise.all([
            Employee.find(query)
                .populate('user_id', 'first_name last_name email mobile_number profile_image')
                .populate('seller_id', 'business_name')
                .populate('role_ids', 'name')
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .sort(sortOptions),
            Employee.countDocuments(query)
        ]);

        // Response structure - data array direct
        return {
            employees,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
        };
    }

    // Create Employee (With Auto Employee Code)
    async createEmployee(employeeData, adminId) {
        const { user_id, seller_ids, seller_id, employee_type, role_ids, designations, department, joining_date, status, first_name, last_name, email, mobile_number, password } = employeeData;

        let user = null;
        if (user_id) {
            user = await User.findById(user_id);
            if (!user) throw ApiError.notFound('User not found');
            // Check if already an employee
            const existingEmp = await Employee.findOne({ user_id });
            if (existingEmp) throw ApiError.conflict('User is already an employee');
        } else {
            // Create new user
            if (!first_name || !last_name || !email || !mobile_number || !password) {
                throw ApiError.validation('Missing required fields for user creation');
            }
            user = new User({
                first_name, last_name, email, mobile_number, password,
                user_type: 'seller_employee'
            });
            await user.save();
        }

        // Generate employee code
        const employeeCode = await this.generateEmployeeCode(user.first_name, user.last_name);

        const employee = new Employee({
            user_id: user._id,
            employee_code: employeeCode,
            seller_ids: seller_ids || [],
            seller_id: seller_id || null,
            created_by: adminId,
            employee_type,
            role_ids: role_ids || [],
            designations: designations || [],
            department,
            joining_date: joining_date || new Date(),
            status: status || 'active'
        });

        await employee.save();

        // Update user type
        await User.findByIdAndUpdate(user._id, { user_type: 'seller_employee', employee_id: employee._id });

        // Log activity
        await EmployeeActivityLog.create({
            employee_id: employee._id,
            performed_by: adminId,
            action: 'create',
            module_name: 'employee',
            description: `Employee created with code ${employeeCode}`,
            new_data: { employee_type, seller_ids: seller_ids || [] }
        });

        return employee.populate('user_id', 'first_name last_name email mobile_number').populate('seller_id', 'business_name');
    }

    // Generate Employee Code
    async generateEmployeeCode(firstName, lastName) {
        const baseName = (firstName || 'employee').toLowerCase().replace(/[^a-z0-9]/g, '');
        let code = '';
        let isUnique = false;
        while (!isUnique) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            code = `${baseName}${randomNum}`;
            const existing = await Employee.findOne({ employee_code: code });
            if (!existing) isUnique = true;
        }
        return code;
    }

    // Get Employee by ID
    async getEmployeeById(employeeId) {
        const employee = await Employee.findById(employeeId)
            .populate('user_id', 'first_name last_name email mobile_number profile_image')
            .populate('seller_ids', 'business_name owner_name email')
            .populate('seller_id', 'business_name owner_name email')
            .populate('role_ids', 'name permissions')
            .populate('created_by', 'first_name last_name email');
        if (!employee) throw ApiError.notFound('Employee not found');
        return employee;
    }

    // Update Employee
    async updateEmployee(employeeId, updateData, adminId) {
        const employee = await Employee.findById(employeeId);
        if (!employee) throw ApiError.notFound('Employee not found');

        const allowedFields = ['employee_type', 'seller_ids', 'seller_id', 'role_ids', 'designations', 'department', 'joining_date', 'notes', 'status'];
        const filteredData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) filteredData[field] = updateData[field];
        }

        // If seller changed, log to history
        if (filteredData.seller_id && filteredData.seller_id.toString() !== employee.seller_id?.toString()) {
            await EmployeeRoleHistory.create({
                employee_id: employee._id,
                old_role_ids: employee.role_ids,
                new_role_ids: filteredData.role_ids || employee.role_ids,
                changed_by: adminId,
                change_reason: 'Seller changed'
            });
        }

        Object.assign(employee, filteredData);
        await employee.save();

        // Log activity
        await EmployeeActivityLog.create({
            employee_id: employee._id,
            performed_by: adminId,
            action: 'update',
            module_name: 'employee',
            description: 'Employee updated',
            old_data: employee._doc,
            new_data: filteredData
        });

        return employee.populate('user_id', 'first_name last_name email mobile_number').populate('seller_id', 'business_name');
    }

    // Delete Employee
    async deleteEmployee(employeeId, adminId) {
        const employee = await Employee.findById(employeeId);
        if (!employee) throw ApiError.notFound('Employee not found');

        // Delete related logs
        await EmployeeActivityLog.deleteMany({ employee_id: employeeId });
        await EmployeePermission.deleteMany({ employee_id: employeeId });
        await EmployeeRoleHistory.deleteMany({ employee_id: employeeId });

        // Update user
        await User.findByIdAndUpdate(employee.user_id, { user_type: 'customer', employee_id: null, seller_id: null });
        await employee.deleteOne();

        return { message: 'Employee deleted successfully' };
    }

    //  Update Employee Status
    async updateEmployeeStatus(employeeId, status, reason = null, adminId) {
        const employee = await Employee.findById(employeeId);
        if (!employee) throw ApiError.notFound('Employee not found');

        employee.status = status;
        if (reason) employee.notes = reason;
        await employee.save();

        // Update user status
        const userStatus = status === 'active' ? 'active' : status === 'inactive' ? 'inactive' : status === 'blocked' ? 'blocked' : 'pending';
        await User.findByIdAndUpdate(employee.user_id, { account_status: userStatus });

        // Log activity
        await EmployeeActivityLog.create({
            employee_id: employee._id,
            performed_by: adminId,
            action: 'status_change',
            module_name: 'employee',
            description: `Status changed to ${status}`,
            new_data: { status, reason }
        });

        return employee;
    }

    // Transfer Employee to Another Seller
    async transferEmployeeToSeller(employeeId, newSellerId, newRoleId = null, newPermissionIds = [], adminId) {
        const employee = await Employee.findById(employeeId);
        if (!employee) throw ApiError.notFound('Employee not found');

        const oldSellerId = employee.seller_id || employee.seller_ids[0];
        const oldRoleIds = employee.role_ids;

        employee.seller_id = newSellerId;
        employee.seller_ids = [newSellerId];
        if (newRoleId) employee.employee_type = newRoleId;
        if (newPermissionIds.length > 0) employee.role_ids = newPermissionIds;
        employee.updated_by = adminId;
        await employee.save();

        // Log seller transfer in history
        await EmployeeRoleHistory.create({
            employee_id: employee._id,
            old_role_ids: oldRoleIds,
            new_role_ids: employee.role_ids,
            changed_by: adminId,
            change_reason: 'Seller transfer'
        });

        // Log activity
        await EmployeeActivityLog.create({
            employee_id: employee._id,
            performed_by: adminId,
            action: 'transfer',
            module_name: 'employee',
            description: `Transferred from seller ${oldSellerId} to ${newSellerId}`,
            old_data: { seller_id: oldSellerId },
            new_data: { seller_id: newSellerId, role_ids: employee.role_ids }
        });

        return employee.populate('user_id', 'first_name last_name email').populate('seller_id', 'business_name');
    }

    // Export Employees to CSV
    async exportEmployees({ search = null, status = null } = {}) {
        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { employee_code: new RegExp(search, 'i') },
                { 'user_id.first_name': new RegExp(search, 'i') },
                { 'user_id.last_name': new RegExp(search, 'i') },
                { 'user_id.email': new RegExp(search, 'i') },
            ];
        }

        const employees = await Employee.find(query).populate('user_id', 'first_name last_name email mobile_number').lean();
        const headers = ['Employee Code', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Joined'];
        const csvRows = [headers.join(',')];
        employees.forEach(emp => {
            const row = [
                `"${(emp.employee_code || '').replace(/"/g, '""')}"`,
                `"${(emp.user_id?.first_name || emp.first_name || '').replace(/"/g, '""')} ${(emp.user_id?.last_name || emp.last_name || '').replace(/"/g, '""')}"`,
                `"${(emp.user_id?.email || emp.email || '').replace(/"/g, '""')}"`,
                `"${(emp.user_id?.mobile_number || emp.mobile_number || '').replace(/"/g, '""')}"`,
                `"${(emp.employee_type || '').replace(/"/g, '""')}"`,
                `"${(emp.status || '').replace(/"/g, '""')}"`,
                `"${emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-IN') : ''}"`
            ];
            csvRows.push(row.join(','));
        });
        return csvRows.join('\n');
    }

    // Upload Employee Profile Image
    async uploadEmployeeProfileImage(employeeId, file) {
        const employee = await Employee.findById(employeeId);
        if (!employee) throw ApiError.notFound('Employee not found');
        if (file) {
            const result = await cloudinaryHelper.uploadFile(file.path, { folder: `employees/${employeeId}/profile`, resource_type: 'image' });
            employee.profile_image = result.url;
            await employee.save();
        }
        return employee;
    }

    // Get Employee Performance
    async getEmployeePerformance(employeeId, period = 'monthly') {
        const employee = await Employee.findById(employeeId);
        if (!employee) throw ApiError.notFound('Employee not found');

        const now = new Date();
        let startDate;
        if (period === 'weekly') startDate = new Date(now.setDate(now.getDate() - 7));
        else if (period === 'yearly') startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        else startDate = new Date(now.setMonth(now.getMonth() - 1));

        // only order count 
        const orderCount = await Order.countDocuments({
            processed_by: employeeId,
            created_at: { $gte: startDate }
        });

        // count action fro activity schema
        const activityCount = await EmployeeActivityLog.countDocuments({
            employee_id: employeeId,
            created_at: { $gte: startDate }
        });

        return {
            period,
            total_orders: orderCount,
            total_products: 0, // Agar Product model mein created_by hai toh use karo
            total_activities: activityCount,
            efficiency_score: 78, // Calculate based on your logic
        };
    }

    // Get Employee Transactions
    async getEmployeeTransactions(employeeId, { page = 1, limit = 10 } = {}) {
        const [transactions, total] = await Promise.all([
            Transaction.find({ employee_id: employeeId }).sort({ created_at: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
            Transaction.countDocuments({ employee_id: employeeId })
        ]);
        return { transactions, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
    }

    // Get Employee Sellers (Current & Past)
    async getEmployeeSellers(employeeId) {
        const employee = await Employee.findById(employeeId).populate('seller_ids', 'business_name owner_name email').populate('seller_id', 'business_name owner_name email');
        if (!employee) throw ApiError.notFound('Employee not found');
        return { current_sellers: employee.seller_ids || (employee.seller_id ? [employee.seller_id] : []), past_sellers: [] };
    }

    // Get Employee Career History
    async getEmployeeCareerHistory(employeeId, { page = 1, limit = 10 } = {}) {
        const [history, total] = await Promise.all([
            EmployeeRoleHistory.find({ employee_id: employeeId }).sort({ created_at: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
            EmployeeRoleHistory.countDocuments({ employee_id: employeeId })
        ]);
        return { history, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
    }

    // Get Employee Reports (Filter by Month/Year)
    async getEmployeeReports(employeeId, { month, year, type = 'monthly' } = {}) {
        const employee = await Employee.findById(employeeId);
        if (!employee) throw ApiError.notFound('Employee not found');

        let startDate, endDate;
        if (month && year) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 1);
        } else if (year) {
            startDate = new Date(year, 0, 1);
            endDate = new Date(year + 1, 0, 1);
        } else {
            const now = new Date();
            if (type === 'yearly') startDate = new Date(now.getFullYear(), 0, 1);
            else startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date();
        }

        const orders = await Order.countDocuments({
            processed_by: employeeId,
            created_at: { $gte: startDate, $lte: endDate }
        });

        const activities = await EmployeeActivityLog.countDocuments({
            employee_id: employeeId,
            created_at: { $gte: startDate, $lte: endDate }
        });

        return {
            period: { startDate, endDate },
            total_orders: orders,
            total_activities: activities,
        };
    }

    // Get Employee Roles
    async getEmployeeRoles(employeeId) {
        const employee = await Employee.findById(employeeId).populate('role_ids', 'name permissions');
        if (!employee) throw ApiError.notFound('Employee not found');
        return employee.role_ids;
    }

    // Assign Role to Employee
    async assignEmployeeRole(employeeId, roleIds, adminId) {
        const employee = await Employee.findById(employeeId);
        if (!employee) throw ApiError.notFound('Employee not found');
        employee.role_ids = roleIds || [];
        await employee.save();

        await EmployeeRoleHistory.create({
            employee_id: employee._id,
            old_role_ids: employee.role_ids,
            new_role_ids: roleIds || [],
            changed_by: adminId,
            change_reason: 'Role assigned'
        });

        return employee.populate('role_ids', 'name');
    }

    // Remove Role from Employee
    async removeEmployeeRole(employeeId, roleId, adminId) {
        const employee = await Employee.findById(employeeId);
        if (!employee) throw ApiError.notFound('Employee not found');
        employee.role_ids = employee.role_ids.filter(r => r.toString() !== roleId);
        await employee.save();

        await EmployeeRoleHistory.create({
            employee_id: employee._id,
            old_role_ids: employee.role_ids,
            new_role_ids: employee.role_ids,
            changed_by: adminId,
            change_reason: 'Role removed'
        });

        return employee.populate('role_ids', 'name');
    }

    // Get Employee Activity Logs
    async getEmployeeActivityLogs(employeeId, { page = 1, limit = 20 } = {}) {
        const [logs, total] = await Promise.all([
            EmployeeActivityLog.find({ employee_id: employeeId }).sort({ created_at: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
            EmployeeActivityLog.countDocuments({ employee_id: employeeId })
        ]);
        return { logs, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
    }

    // ============ PRODUCT MANAGEMENT ============

    // Generate Product Code (Auto - e.g., table0012)
    async generateProductCode(productName) {
        const baseName = (productName || 'product').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
        let code = '';
        let isUnique = false;
        while (!isUnique) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            code = `${baseName}${randomNum}`;
            const existing = await Product.findOne({ product_code: code });
            if (!existing) isUnique = true;
        }
        return code;
    }

    // Get Product Stats (FIXED - Robust query)
    async getProductStats() {
        const [total, active, pending, rejected, suspended, inactive] = await Promise.all([
            Product.countDocuments({ deleted_at: null }),
            Product.countDocuments({ status: 'active', approval_status: 'approved', deleted_at: null }),
            Product.countDocuments({ $or: [{ approval_status: 'pending' }, { status: 'pending' }], deleted_at: null }),
            Product.countDocuments({ $or: [{ approval_status: 'rejected' }, { status: 'rejected' }], deleted_at: null }),
            Product.countDocuments({ status: 'suspended', deleted_at: null }),
            Product.countDocuments({ status: 'inactive', deleted_at: null })
        ]);
        return { total, active, pending, rejected, suspended, inactive };
    }

    // Get All Products (FIXED - deleted_at filter + category 'others' fix)
    async getAllProducts({ page = 1, limit = 10, search = null, status = null, category = null, sellerId = null, sortBy = 'created_at', sortOrder = 'desc' } = {}) {
        const query = { deleted_at: null }; // Soft-deleted hide karo

        if (status) query.status = status;
        if (category && category !== 'others') query.category_id = category;
        if (category === 'others') {
            const mainCategories = await Category.find().sort({ created_at: -1 }).limit(10).select('_id');
            const mainCategoryIds = mainCategories.map(c => c._id);
            query.category_id = { $nin: mainCategoryIds };
        }
        if (sellerId) query.seller_id = sellerId;

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { product_name: regex },
                { brand: regex },
                { sku: regex },
                { product_code: regex },
                { description: regex }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category_id', 'category_name')
                .populate('sub_category_id', 'sub_category_name')
                .populate('seller_id', 'business_name owner_name email')
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .sort(sortOptions),
            Product.countDocuments(query)
        ]);

        return {
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Get Categories for Dropdown (10 main + Others)
    async getProductCategories() {
        const categories = await Category.find({ status: 'active' })
            .sort({ created_at: -1 })
            .select('category_name _id')
            .limit(10);

        const categoryList = categories.map(cat => ({
            _id: cat._id,
            category_name: cat.category_name
        }));

        const mainCategoryIds = categories.map(c => c._id);
        const othersCount = await Product.countDocuments({ category_id: { $nin: mainCategoryIds }, deleted_at: null });

        categoryList.push({
            _id: 'others',
            category_name: 'Others',
            count: othersCount
        });

        return categoryList;
    }

    // Create Product (Auto-generate product_code)
    async createProduct(productData, adminId) {
        const product = new Product({
            ...productData,
            product_code: await this.generateProductCode(productData.product_name),
            created_by: adminId
        });
        await product.save();
        return product.populate('category_id', 'category_name').populate('seller_id', 'business_name');
    }

    // Get Product by Code (FIXED - deleted_at filter)
    async getProductByCode(productCode) {
        const product = await Product.findOne({ product_code: productCode, deleted_at: null })
            .populate('category_id', 'category_name')
            .populate('sub_category_id', 'sub_category_name')
            .populate('seller_id', 'business_name owner_name email mobile_number')
            .populate('created_by', 'first_name last_name email');

        if (!product) throw ApiError.notFound('Product not found');

        const [orderCount, reviewCount, avgRating] = await Promise.all([
            Order.countDocuments({ 'order_items.product_id': product._id, order_status: { $ne: 'cancelled' } }),
            Review.countDocuments({ product_id: product._id, review_status: 'approved' }),
            Review.aggregate([
                { $match: { product_id: product._id, review_status: 'approved' } },
                { $group: { _id: null, avg: { $avg: '$rating' } } }
            ])
        ]);

        return {
            ...product.toObject(),
            stats: {
                total_orders: orderCount,
                total_reviews: reviewCount,
                average_rating: avgRating[0]?.avg || 0
            }
        };
    }

    // Update Product by Code 
    async updateProductByCode(productCode, updateData, adminId) {
        const product = await Product.findOne({ product_code: productCode });
        if (!product) throw ApiError.notFound('Product not found');

        // LOGIC: Manage Approval Status (Dropdown 1)
        // If product is already approved, lock it and prevent reverting to pending
        if (product.approval_status === 'approved') {
            updateData.approval_status = 'approved';
            product.approved_at = product.approved_at || new Date();
            product.approved_by = product.approved_by || adminId;
        } else {
            // If coming from pending, allow changing to approved
            if (updateData.approval_status === 'approved') {
                product.approved_at = new Date();
                product.approved_by = adminId;
                updateData.approval_status = 'approved';
            } else {
                updateData.approval_status = 'pending';
            }
        }

        // LOGIC: Manage Product Status (Dropdown 2)
        // If not approved, force status to pending
        if (updateData.approval_status !== 'approved') {
            updateData.status = 'pending';
        } else {
            // If approved, ensure status is never 'pending' or 'approved' (since those are in Dropdown 1)
            if (updateData.status === 'pending' || updateData.status === 'approved') {
                updateData.status = 'active'; // Default to active if invalid status selected
            }
        }

        // Handle Rejection/Suspension Reason
        if (updateData.status === 'rejected' || updateData.status === 'suspended') {
            // Reason required logic can be added here
        } else {
            updateData.rejection_reason = null;
            updateData.suspension_reason = null;
        }

        // Allowed Fields
        const allowedFields = [
            'product_name', 'description', 'price', 'mrp', 'discount_percent',
            'stock_quantity', 'sku', 'images', 'category_id', 'sub_category_id',
            'brand', 'attributes', 'tags', 'status', 'approval_status', 'rejection_reason', 'suspension_reason'
        ];

        const filteredData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        if (updateData.price || updateData.discount_percent) {
            const newPrice = updateData.price || product.price;
            const newDiscount = updateData.discount_percent || product.discount_percent;
            filteredData.final_price = newPrice - (newPrice * newDiscount / 100);
        }

        filteredData.updated_by = adminId;
        filteredData.updated_at = new Date();

        Object.assign(product, filteredData);
        await product.save();

        return product.populate('category_id', 'category_name').populate('seller_id', 'business_name');
    }

    // Delete Product by Code (Soft delete)
    async deleteProductByCode(productCode, adminId) {
        const product = await Product.findOne({ product_code: productCode });
        if (!product) throw ApiError.notFound('Product not found');

        product.status = 'inactive';
        product.deleted_at = new Date();
        product.deleted_by = adminId;
        await product.save();

        return { message: 'Product deleted successfully' };
    }

    // Approve Product by Code
    async approveProductByCode(productCode, adminId) {
        const product = await Product.findOne({ product_code: productCode });
        if (!product) throw ApiError.notFound('Product not found');

        product.status = 'active';
        product.approval_status = 'approved';
        product.approved_by = adminId;
        product.approved_at = new Date();
        product.rejection_reason = null;
        await product.save();

        return product;
    }

    // Reject Product by Code
    async rejectProductByCode(productCode, rejection_reason, adminId) {
        const product = await Product.findOne({ product_code: productCode });
        if (!product) throw ApiError.notFound('Product not found');

        product.status = 'rejected';
        product.approval_status = 'rejected';
        product.rejection_reason = rejection_reason;
        product.rejected_by = adminId;
        product.rejected_at = new Date();
        await product.save();

        return product;
    }

    // Suspend Product by Code
    async suspendProductByCode(productCode, reason, adminId) {
        const product = await Product.findOne({ product_code: productCode });
        if (!product) throw ApiError.notFound('Product not found');

        product.status = 'suspended';
        product.suspension_reason = reason;
        product.suspended_by = adminId;
        product.suspended_at = new Date();
        await product.save();

        return product;
    }

    // Activate Product by Code
    async activateProductByCode(productCode, adminId) {
        const product = await Product.findOne({ product_code: productCode });
        if (!product) throw ApiError.notFound('Product not found');

        product.status = 'active';
        product.suspension_reason = null;
        product.suspended_by = null;
        product.suspended_at = null;
        await product.save();

        return product;
    }

    // Get Product Reviews by Code
    async getProductReviewsByCode(productCode, { page = 1, limit = 10 } = {}) {
        const product = await Product.findOne({ product_code: productCode });
        if (!product) throw ApiError.notFound('Product not found');

        const [reviews, total] = await Promise.all([
            Review.find({ product_id: product._id })
                .populate('user_id', 'first_name last_name profile_image')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Review.countDocuments({ product_id: product._id })
        ]);

        return {
            reviews,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
        };
    }

    // Get Product Orders by Code
    async getProductOrdersByCode(productCode, { page = 1, limit = 10 } = {}) {
        const product = await Product.findOne({ product_code: productCode });
        if (!product) throw ApiError.notFound('Product not found');

        const orders = await Order.find({ 'order_items.product_id': product._id })
            .populate('user_id', 'first_name last_name email')
            .sort({ created_at: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Order.countDocuments({ 'order_items.product_id': product._id });

        return {
            orders,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
        };
    }

    // Export Products
    async exportProducts({ search = null, status = null, category = null } = {}) {
        const query = { deleted_at: null };
        if (status) query.status = status;
        if (category && category !== 'others') query.category_id = category;
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { product_name: regex },
                { brand: regex },
                { sku: regex },
                { product_code: regex }
            ];
        }

        const products = await Product.find(query)
            .populate('category_id', 'category_name')
            .populate('seller_id', 'business_name')
            .lean();

        const headers = ['Product Code', 'Product Name', 'SKU', 'Category', 'Price', 'MRP', 'Discount', 'Stock', 'Seller', 'Status', 'Approval Status'];
        const csvRows = [headers.join(',')];

        products.forEach(product => {
            const row = [
                `"${(product.product_code || '').replace(/"/g, '""')}"`,
                `"${(product.product_name || '').replace(/"/g, '""')}"`,
                `"${(product.sku || '').replace(/"/g, '""')}"`,
                `"${(product.category_id?.category_name || '').replace(/"/g, '""')}"`,
                `"${product.price || 0}"`,
                `"${product.mrp || 0}"`,
                `"${product.discount_percent || 0}"`,
                `"${product.stock_quantity || 0}"`,
                `"${(product.seller_id?.business_name || '').replace(/"/g, '""')}"`,
                `"${(product.status || '').replace(/"/g, '""')}"`,
                `"${(product.approval_status || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    // ==================== CATEGORY MANAGEMENT ====================

    // Generate unique category code (e.g., electro1234)
    async generateCategoryCode(name) {
        const baseName = (name || 'category').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
        let code = '';
        let isUnique = false;
        while (!isUnique) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            code = `${baseName}${randomNum}`;
            const existing = await Category.findOne({ category_code: code });
            if (!existing) isUnique = true;
        }
        return code;
    }

    // Get all categories (with stats, product counts, order counts, sub-category counts)
    async getAllCategories({ page = 1, limit = 10, search = null, status = null } = {}) {
        const query = { deleted_at: null };

        // Only apply status filter if explicit status is provided
        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [{ category_name: regex }, { category_code: regex }];
        }

        const [categories, total] = await Promise.all([
            Category.find(query)
                .populate('created_by', 'first_name last_name')
                .sort({ display_order: 1, created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Category.countDocuments(query)
        ]);

        // Attach counts
        const categoryIds = categories.map(c => c._id);
        const productCounts = await Product.aggregate([
            { $match: { category_id: { $in: categoryIds }, deleted_at: null } },
            { $group: { _id: "$category_id", count: { $sum: 1 } } }
        ]);
        const subCatCounts = await SubCategory.aggregate([
            { $match: { category_id: { $in: categoryIds } } },
            { $group: { _id: "$category_id", count: { $sum: 1 } } }
        ]);

        // Order counts per category (based on products in that category)
        const orderCounts = {};
        for (const cat of categories) {
            const productIds = await Product.find({ category_id: cat._id }).select('_id');
            orderCounts[cat._id] = await Order.countDocuments({ 'order_items.product_id': { $in: productIds } });
        }

        // Ensure category_code exists and attach data
        const data = [];
        for (const cat of categories) {
            if (!cat.category_code) {
                cat.category_code = await this.generateCategoryCode(cat.category_name);
                await cat.save();
            }
            data.push({
                ...cat.toObject(),
                category_code: cat.category_code,
                product_count: productCounts.find(p => p._id.equals(cat._id))?.count || 0,
                sub_category_count: subCatCounts.find(s => s._id.equals(cat._id))?.count || 0,
                order_count: orderCounts[cat._id] || 0
            });
        }

        // Stats for cards
        const stats = {
            total: await Category.countDocuments({ deleted_at: null }),
            active: await Category.countDocuments({ status: 'active', deleted_at: null }),
            inactive: await Category.countDocuments({ status: 'inactive', deleted_at: null })
        };

        return { categories: data, stats, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
    }

    // Get single category details (for detail page)
    async getCategoryDetails(idOrCode) {
        const isMongoId = mongoose.Types.ObjectId.isValid(idOrCode);
        const query = isMongoId ? { _id: idOrCode } : { category_code: idOrCode };
        query.deleted_at = null;

        const category = await Category.findOne(query).populate('created_by', 'first_name last_name');
        if (!category) throw ApiError.notFound('Category not found');

        if (!category.category_code) {
            category.category_code = await this.generateCategoryCode(category.category_name);
            await category.save();
        }

        const productIds = await Product.find({ category_id: category._id }).select('_id');
        const productIdArray = productIds.map(p => p._id);

        const [totalProducts, totalOrders, recentOrders, subCategories] = await Promise.all([
            Product.countDocuments({ category_id: category._id, deleted_at: null }),
            Order.countDocuments({ 'order_items.product_id': { $in: productIdArray } }),
            Order.countDocuments({
                'order_items.product_id': { $in: productIdArray },
                created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
            }),
            SubCategory.countDocuments({ category_id: category._id })
        ]);

        return {
            ...category.toObject(),
            total_products: totalProducts,
            total_orders: totalOrders,
            recent_orders: recentOrders,
            sub_category_count: subCategories
        };
    }

    // Get single category (for edit form) – same as details but simpler
    async getCategoryByCode(idOrCode) {
        return this.getCategoryDetails(idOrCode); // reuses details logic, but can be separate
    }

    // Create category
    async createCategory(data, adminId) {
        const category_code = await this.generateCategoryCode(data.category_name);
        const category = new Category({ ...data, category_code, created_by: adminId });
        await category.save();
        return category;
    }

    // Update category (with product propagation)
    async updateCategory(idOrCode, updateData, adminId) {
        const isMongoId = mongoose.Types.ObjectId.isValid(idOrCode);
        const query = isMongoId ? { _id: idOrCode } : { category_code: idOrCode };
        query.deleted_at = null;

        const category = await Category.findOne(query);
        if (!category) throw ApiError.notFound('Category not found');

        Object.assign(category, updateData, { updated_by: adminId });
        await category.save();

        // Update all products linked to this category with the new name
        await Product.updateMany(
            { category_id: category._id, deleted_at: null },
            { $set: { category_name: category.category_name } }
        );

        return category;
    }

    // Delete category (soft delete)
    async deleteCategory(idOrCode, adminId) {
        const isMongoId = mongoose.Types.ObjectId.isValid(idOrCode);
        const query = isMongoId ? { _id: idOrCode } : { category_code: idOrCode };
        query.deleted_at = null;

        const category = await Category.findOne(query);
        if (!category) throw ApiError.notFound('Category not found');

        category.deleted_at = new Date();
        category.deleted_by = adminId;
        category.status = 'inactive';
        await category.save();
        return { message: 'Category deleted successfully' };
    }

    // ==================== SUB-CATEGORY MANAGEMENT ====================

    // Generate Sub-Category Code (e.g., subelectro1234)
    async generateSubCategoryCode(name) {
        const baseName = (name || 'subcat').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
        let code = '';
        let isUnique = false;
        while (!isUnique) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            code = `sub${baseName}${randomNum}`;
            const existing = await SubCategory.findOne({ sub_category_code: code });
            if (!existing) isUnique = true;
        }
        return code;
    }

    // Get All Sub-Categories - SIMPLE SEARCH (Name + Code only)
    async getAllSubCategories({ page = 1, limit = 10, search = null, status = null, categoryId = null } = {}) {
        const query = { deleted_at: null };
        if (status && status !== 'all') query.status = status;
        if (categoryId) query.category_id = categoryId;

        // SIMPLE SEARCH - Only Sub-Category Name and Code (Removed Main Category/Product logic)
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { sub_category_name: regex },
                { sub_category_code: regex }
            ];
        }

        // Fetch sub-categories with main category details for display
        const [subCategories, total] = await Promise.all([
            SubCategory.find(query)
                .populate('category_id', 'category_name')
                .populate('created_by', 'first_name last_name')
                .sort({ display_order: 1, created_at: -1 })
                .skip((page - 1) * limit).limit(parseInt(limit)),
            SubCategory.countDocuments(query)
        ]);

        // Attach product count to each sub-category
        const subCatIds = subCategories.map(s => s._id);
        const productCounts = await Product.aggregate([
            { $match: { sub_category_id: { $in: subCatIds }, deleted_at: null } },
            { $group: { _id: "$sub_category_id", count: { $sum: 1 } } }
        ]);

        const data = subCategories.map(sub => ({
            ...sub.toObject(),
            sub_category_code: sub.sub_category_code,
            product_count: productCounts.find(p => p._id.equals(sub._id))?.count || 0
        }));

        // Stats for the top cards
        const stats = {
            total: await SubCategory.countDocuments({ deleted_at: null }),
            active: await SubCategory.countDocuments({ status: 'active', deleted_at: null }),
            inactive: await SubCategory.countDocuments({ status: 'inactive', deleted_at: null })
        };

        return { subCategories: data, stats, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
    }

    // Get Sub-Category Details (by Code or ID)
    async getSubCategoryDetails(idOrCode) {
        const isMongoId = mongoose.Types.ObjectId.isValid(idOrCode);
        const query = isMongoId ? { _id: idOrCode } : { sub_category_code: idOrCode };
        query.deleted_at = null;

        const subCategory = await SubCategory.findOne(query)
            .populate('category_id', 'category_name category_code')
            .populate('created_by', 'first_name last_name');

        if (!subCategory) throw ApiError.notFound('Sub-Category not found');
        if (!subCategory.sub_category_code) {
            subCategory.sub_category_code = await this.generateSubCategoryCode(subCategory.sub_category_name);
            await subCategory.save();
        }

        const productCount = await Product.countDocuments({ sub_category_id: subCategory._id, deleted_at: null });

        return { ...subCategory.toObject(), product_count: productCount };
    }

    // Create Sub-Category
    async createSubCategory(data, adminId) {
        // Check if Main Category exists
        const mainCat = await Category.findById(data.category_id);
        if (!mainCat) throw ApiError.notFound('Main category not found');

        const sub_category_code = await this.generateSubCategoryCode(data.sub_category_name);
        const subCategory = new SubCategory({ ...data, sub_category_code, created_by: adminId });
        await subCategory.save();
        return subCategory.populate('category_id', 'category_name');
    }

    // Update Sub-Category (With Product Propagation)
    async updateSubCategory(idOrCode, updateData, adminId) {
        const isMongoId = mongoose.Types.ObjectId.isValid(idOrCode);
        const query = isMongoId ? { _id: idOrCode } : { sub_category_code: idOrCode };
        query.deleted_at = null;

        const subCategory = await SubCategory.findOne(query);
        if (!subCategory) throw ApiError.notFound('Sub-Category not found');

        Object.assign(subCategory, updateData, { updated_by: adminId });
        await subCategory.save();

        // Update all Products linked to this Sub-Category
        await Product.updateMany(
            { sub_category_id: subCategory._id, deleted_at: null },
            { $set: { sub_category_name: subCategory.sub_category_name } }
        );

        return subCategory.populate('category_id', 'category_name');
    }

    // Delete Sub-Category (Soft Delete)
    async deleteSubCategory(idOrCode, adminId) {
        const isMongoId = mongoose.Types.ObjectId.isValid(idOrCode);
        const query = isMongoId ? { _id: idOrCode } : { sub_category_code: idOrCode };
        query.deleted_at = null;

        const subCategory = await SubCategory.findOne(query);
        if (!subCategory) throw ApiError.notFound('Sub-Category not found');

        subCategory.deleted_at = new Date();
        subCategory.deleted_by = adminId;
        subCategory.status = 'inactive';
        await subCategory.save();
        return { message: 'Sub-Category deleted successfully' };
    }

    // ==================== INVENTORY MANAGEMENT ====================

    // Get All Inventory (with Product & Seller details, Stats, Dates fixed)
    async getAllInventory({ page = 1, limit = 10, search = null, stockStatus = null } = {}) {
        const query = {};

        // Filter by Stock Status (available, low_stock, out_of_stock)
        if (stockStatus && stockStatus !== 'all') {
            query.stock_status = stockStatus;
        }

        // Search by Product Name or SKU (via Product collection)
        if (search) {
            const regex = new RegExp(search, 'i');
            const matchedProducts = await Product.find({
                $or: [{ product_name: regex }, { sku: regex }]
            }).select('_id');
            const productIds = matchedProducts.map(p => p._id);
            query.product_id = { $in: productIds };
        }

        // Fetch Inventory with populated Product and Seller
        const [inventory, total] = await Promise.all([
            Inventory.find(query)
                .populate('product_id', 'product_name sku price category_id images stock_quantity')
                .populate('seller_id', 'business_name owner_name')
                .sort({ last_stock_update: -1 })
                .skip((page - 1) * limit).limit(parseInt(limit)),
            Inventory.countDocuments(query)
        ]);

        // Format Data for Frontend (Fix Invalid Date, Seller N/A)
        const data = inventory.map(item => {
            // If Seller is null (Admin added product), show "Admin"
            const sellerName = item.seller_id?.business_name || 'Admin';

            return {
                _id: item._id,
                product_id: item.product_id?._id || null,
                product_name: item.product_id?.product_name || 'N/A',
                product_sku: item.product_id?.sku || 'N/A',
                product_image: item.product_id?.images?.[0] || null,
                price: item.product_id?.price || 0,
                category: item.product_id?.category_id?.category_name || 'N/A',
                seller_name: sellerName,
                stock_quantity: item.stock_quantity || 0,
                stock_status: item.stock_status,
                low_stock_limit: item.low_stock_limit || 5,
                // Send Date in safe format
                updated_at: item.updated_at ? new Date(item.updated_at).toISOString() : null
            };
        });

        // Stats for Cards (Aggregations)
        const totalProducts = await Inventory.countDocuments();
        const stockAgg = await Inventory.aggregate([
            { $group: { _id: null, total_units: { $sum: "$stock_quantity" } } }
        ]);
        const totalStockUnits = stockAgg[0]?.total_units || 0;

        const lowStockCount = await Inventory.countDocuments({
            $or: [{ stock_status: 'low_stock' }, { $expr: { $lte: ["$stock_quantity", "$low_stock_limit"] } }]
        });
        const outOfStockCount = await Inventory.countDocuments({
            $or: [{ stock_status: 'out_of_stock' }, { stock_quantity: 0 }]
        });

        const stats = {
            total_products: totalProducts,
            total_stock_units: totalStockUnits,
            low_stock_items: lowStockCount,
            out_of_stock: outOfStockCount
        };

        return { inventory: data, stats, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
    }

    // Update Stock 
    async updateInventoryStock(inventoryId, updateData, adminId) {
        const inventory = await Inventory.findById(inventoryId);
        if (!inventory) throw ApiError.notFound('Inventory not found');

        const newQuantity = parseInt(updateData.stock_quantity);
        if (isNaN(newQuantity) || newQuantity < 0) throw ApiError.badRequest('Invalid stock quantity');

        // Update inventory stock
        inventory.stock_quantity = newQuantity;

        // Auto-update stock status
        if (newQuantity === 0) {
            inventory.stock_status = 'out_of_stock';
        } else if (newQuantity <= inventory.low_stock_limit) {
            inventory.stock_status = 'low_stock';
        } else {
            inventory.stock_status = 'available';
        }

        // Add movement log
        inventory.stock_movements.push({
            type: updateData.type === 'remove' ? 'remove' : 'add',
            quantity: Math.abs(newQuantity - (inventory.last_stock_quantity || 0)),
            reason: updateData.reason || 'Admin updated stock',
            performed_by: adminId,
            timestamp: new Date()
        });

        inventory.last_stock_update = new Date();
        inventory.updated_by = adminId;
        await inventory.save();

        // 🔥 IMPORTANT: Sync with Product model
        if (inventory.product_id) {
            await Product.findByIdAndUpdate(
                inventory.product_id,
                {
                    stock_quantity: newQuantity,
                    updated_by: adminId,
                    updated_at: new Date()
                }
            );
        }

        return inventory;
    }

    // ==================== ORDER MANAGEMENT ====================

    // Generate Order Code (e.g., ORD-123456)
    async generateOrderCode() {
        let code = '';
        let isUnique = false;
        while (!isUnique) {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            code = `ORD-${randomNum}`;
            const existing = await Order.findOne({ order_code: code });
            if (!existing) isUnique = true;
        }
        return code;
    }

    // Get All Orders (List + Stats)
    async getAllOrders({ page = 1, limit = 10, search = null, status = null, paymentStatus = null } = {}) {
        const query = {};
        if (status && status !== 'all') query.order_status = status;

        // NEW: Payment Status Filter
        if (paymentStatus && paymentStatus !== 'all') query.payment_status = paymentStatus;

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { order_code: regex },
                { order_number: regex },
                { 'user_id.email': regex }
            ];
        }

        // ... baaki same rahega
        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user_id', 'first_name last_name email mobile_number')
                .populate('seller_id', 'business_name')
                .populate('order_items', 'product_name quantity total_price item_status product_id')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit).limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        const stats = {
            total: await Order.countDocuments(),
            pending: await Order.countDocuments({ order_status: 'pending' }),
            delivered: await Order.countDocuments({ order_status: 'delivered' }),
            cancelled: await Order.countDocuments({ order_status: 'cancelled' })
        };

        return { orders, stats, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
    }

    // Get Order Details - Include Payment Method
    async getOrderDetails(orderCode) {
        const order = await Order.findOne({ order_code: orderCode })
            .populate('user_id', 'first_name last_name email mobile_number')
            .populate('seller_id', 'business_name')
            .populate('payment_id')
            .populate({
                path: 'order_items',
                populate: {
                    path: 'product_id',
                    select: 'product_code product_name images sku price brand category_id'
                }
            });

        if (!order) throw ApiError.notFound('Order not found');
        return order;
    }

    // Update Order Status + Payment Status + Payment Method (FIXED)
    async updateOrderStatus(orderCode, updateData, adminId) {
        const order = await Order.findOne({ order_code: orderCode });
        if (!order) throw ApiError.notFound('Order not found');

        // 1. Update Order Status
        if (updateData.order_status) {
            order.order_status = updateData.order_status;
            order.status_history.push({
                status: updateData.order_status,
                updated_by: adminId,
                notes: updateData.notes || 'Status updated by admin',
                timestamp: new Date()
            });
            if (updateData.order_status === 'delivered') order.delivered_at = new Date();
            if (updateData.order_status === 'cancelled') {
                order.cancelled_at = new Date();
                order.cancelled_reason = updateData.notes || 'Cancelled by admin';
            }
            await OrderItem.updateMany({ order_id: order._id }, { $set: { item_status: updateData.order_status } });
        }

        // 2. Update Payment Status (Agar 'pending' ho toh bhi update ho!)
        if (updateData.payment_status) {
            order.payment_status = updateData.payment_status;
        }

        // 3. Update Payment Method (Naya feature)
        if (updateData.payment_method) {
            order.payment_method = updateData.payment_method;
        }

        await order.save(); // <-- Save hamesha execute hoga
        return order;
    }

    // ============ ORDER - RETURN MANAGEMENT (order base) ============

    // Get All Returns - Orders with 'cancelled' OR 'returned' status
    async getAllReturns({ page = 1, limit = 10, search = null, orderStatus = null, paymentStatus = null } = {}) {
        const query = {};

        // Filter by Order Status (cancelled/returned)
        // By default, show both cancelled and returned orders
        if (orderStatus && orderStatus !== 'all') {
            query.order_status = orderStatus;
        } else {
            query.order_status = { $in: ['cancelled', 'returned'] };
        }

        // Filter by Payment Status
        if (paymentStatus && paymentStatus !== 'all') {
            query.payment_status = paymentStatus;
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [{ order_code: regex }, { 'user_id.email': regex }];
        }

        const [returns, total] = await Promise.all([
            Order.find(query)
                .populate('user_id', 'first_name last_name email')
                .populate('seller_id', 'business_name')
                .populate('order_items', 'product_name product_code quantity price')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit).limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        // Stats for Cards (based on Payment Status)
        const stats = {
            total: await Order.countDocuments({ order_status: { $in: ['cancelled', 'returned'] } }),
            pending: await Order.countDocuments({ order_status: { $in: ['cancelled', 'returned'] }, payment_status: 'pending' }),
            paid: await Order.countDocuments({ order_status: { $in: ['cancelled', 'returned'] }, payment_status: 'paid' }),
            refunded: await Order.countDocuments({ order_status: { $in: ['cancelled', 'returned'] }, payment_status: 'refunded' })
        };

        return { returns, stats, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
    }

    // Get Return Details by Order Code
    async getReturnByOrderCode(orderCode) {
        const order = await Order.findOne({ order_code: orderCode })
            .populate('user_id', 'first_name last_name email mobile_number')
            .populate('seller_id', 'business_name')
            .populate('order_items', 'product_name product_code quantity price total_price item_status')
            .populate('payment_id');

        if (!order) throw ApiError.notFound('Order not found');
        return order;
    }

    // Update Return Status (Update Order Status + Payment Status)
    async updateReturnStatus(orderCode, updateData, adminId) {
        const order = await Order.findOne({ order_code: orderCode });
        if (!order) throw ApiError.notFound('Order not found');

        // Update Order Status if provided
        if (updateData.order_status) {
            order.order_status = updateData.order_status;
            order.updated_by = adminId;
            order.status_history.push({
                status: updateData.order_status,
                updated_by: adminId,
                notes: updateData.notes || 'Status updated from Returns module',
                timestamp: new Date()
            });
        }

        // Update Payment Status if provided
        if (updateData.payment_status) {
            order.payment_status = updateData.payment_status;
            if (updateData.payment_status === 'refunded') {
                // Update related Payment record
                await Payment.findOneAndUpdate({ order_id: order._id }, { payment_status: 'refunded' });
            }
        }

        // Update all Order Items status to match order_status
        if (updateData.order_status && order.order_items && order.order_items.length > 0) {
            await OrderItem.updateMany(
                { order_id: order._id },
                { $set: { item_status: updateData.order_status } }
            );
        }

        await order.save();
        return order;
    }

    // Export Returns PDF (Cancelled/Returned Orders PDF)
    async exportReturnsPDF() {
        const PDFDocument = require('pdfkit');
        const orders = await Order.find({ order_status: { $in: ['cancelled', 'returned'] } })
            .populate('user_id', 'first_name last_name email')
            .sort({ created_at: -1 });

        const doc = new PDFDocument({ margin: 50 });

        return {
            doc,
            content: () => {
                doc.fontSize(24).text('Returns Report', { align: 'center' });
                doc.moveDown();
                doc.fontSize(12).text(`Total Returns: ${orders.length}`);
                doc.moveDown();

                doc.fontSize(10).text('Order Code | Customer | Amount | Order Status | Payment Status');
                doc.moveDown();

                orders.forEach(order => {
                    doc.fontSize(9).text(`${order.order_code} | ${order.user_id?.first_name || 'N/A'} | ₹${order.total_amount} | ${order.order_status} | ${order.payment_status}`);
                });

                doc.end();
            }
        };
    }

    // ============ REVIEW MODULE ============

    // Get Review Dashboard Stats
    // async getReviewDashboard() {
    //     const [total, published, pending, flagged, reported, hidden, rejected, avgRating] = await Promise.all([
    //         Review.countDocuments({ deleted_at: null }),
    //         Review.countDocuments({ status: 'published', deleted_at: null }),
    //         Review.countDocuments({ status: 'pending', deleted_at: null }),
    //         Review.countDocuments({ status: 'flagged', deleted_at: null }),
    //         Review.countDocuments({ status: 'reported', deleted_at: null }),
    //         Review.countDocuments({ status: 'hidden', deleted_at: null }),
    //         Review.countDocuments({ status: 'rejected', deleted_at: null }),
    //         Review.aggregate([
    //             { $match: { status: 'published', deleted_at: null } },
    //             { $group: { _id: null, avg: { $avg: '$rating' } } }
    //         ])
    //     ]);

    //     // Rating distribution
    //     const ratingDistribution = await Review.aggregate([
    //         { $match: { deleted_at: null } },
    //         { $group: { _id: '$rating', count: { $sum: 1 } } },
    //         { $sort: { _id: -1 } }
    //     ]);

    //     const ratingMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    //     ratingDistribution.forEach(item => {
    //         ratingMap[item._id] = item.count;
    //     });

    //     // Recent trends (last 7 days)
    //     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    //     const recentReviews = await Review.countDocuments({ created_at: { $gte: sevenDaysAgo }, deleted_at: null });

    //     return {
    //         total,
    //         published,
    //         pending,
    //         flagged,
    //         reported,
    //         hidden,
    //         rejected,
    //         average_rating: avgRating[0]?.avg || 0,
    //         rating_distribution: ratingMap,
    //         reviews_last_7_days: recentReviews
    //     };
    // }

    // // Get All Reviews (List + Search + Filters + Pagination)
    // async getAllReviews({ page = 1, limit = 10, search = null, status = null, rating = null, verified = null, sellerId = null, productId = null, sortBy = 'newest' } = {}) {
    //     const query = { deleted_at: null };

    //     // Filters
    //     if (status && status !== 'all') query.status = status;
    //     if (rating && rating !== 'all') query.rating = parseInt(rating);
    //     if (verified && verified !== 'all') query.is_verified_purchase = verified === 'true';

    //     if (sellerId) query.seller_id = sellerId;
    //     if (productId) query.product_id = productId;

    //     // Search
    //     if (search) {
    //         const regex = new RegExp(search, 'i');
    //         // Find matching products and users first
    //         const [matchedProducts, matchedUsers] = await Promise.all([
    //             Product.find({ product_name: regex }).select('_id'),
    //             User.find({ $or: [{ first_name: regex }, { last_name: regex }, { email: regex }] }).select('_id')
    //         ]);

    //         query.$or = [
    //             { title: regex },
    //             { comment: regex },
    //             { review_code: regex },
    //             { product_id: { $in: matchedProducts.map(p => p._id) } },
    //             { user_id: { $in: matchedUsers.map(u => u._id) } }
    //         ];
    //     }

    //     // Sorting
    //     let sortOptions = { created_at: -1 }; // default: newest first
    //     if (sortBy === 'oldest') sortOptions = { created_at: 1 };
    //     if (sortBy === 'highest_rating') sortOptions = { rating: -1 };
    //     if (sortBy === 'lowest_rating') sortOptions = { rating: 1 };
    //     if (sortBy === 'most_reported') sortOptions = { report_count: -1 };

    //     const [reviews, total] = await Promise.all([
    //         Review.find(query)
    //             .populate('user_id', 'first_name last_name email')
    //             .populate('product_id', 'product_name product_code images')
    //             .populate('seller_id', 'business_name')
    //             .populate('order_id', 'order_code')
    //             .sort(sortOptions)
    //             .skip((page - 1) * limit)
    //             .limit(parseInt(limit)),
    //         Review.countDocuments(query)
    //     ]);

    //     return {
    //         reviews,
    //         pagination: {
    //             page: parseInt(page),
    //             limit: parseInt(limit),
    //             total,
    //             totalPages: Math.ceil(total / limit)
    //         }
    //     };
    // }

    // // Get Review Details
    // async getReviewDetails(reviewCode) {
    //     const review = await Review.findOne({ review_code: reviewCode, deleted_at: null })
    //         .populate('user_id', 'first_name last_name email _id')
    //         .populate('product_id', 'product_name product_code images category_id sub_category_id')
    //         .populate('seller_id', 'business_name _id')
    //         .populate('order_id', 'order_code')
    //         .populate('order_item_id', 'quantity price')
    //         .populate('moderated_by', 'first_name last_name email')
    //         .populate('moderation_history.admin_id', 'first_name last_name');

    //     if (!review) throw ApiError.notFound('Review not found');
    //     return review;
    // }

    // // Moderate Review (Publish, Hide, Flag, Reject, Restore)
    // async moderateReview(reviewCode, { action, reason }, adminId) {
    //     // IMPORTANT: Search by review_code, NOT _id
    //     const review = await Review.findOne({ review_code: reviewCode, deleted_at: null });
    //     if (!review) throw ApiError.notFound('Review not found');

    //     let newStatus = review.status;
    //     if (action === 'publish') newStatus = 'published';
    //     if (action === 'hide') newStatus = 'hidden';
    //     if (action === 'flag') newStatus = 'flagged';
    //     if (action === 'reject') newStatus = 'rejected';
    //     if (action === 'restore') newStatus = 'published';

    //     const validTransitions = {
    //         pending: ['published', 'rejected'],
    //         published: ['flagged', 'hidden', 'rejected'],
    //         flagged: ['published', 'hidden', 'rejected'],
    //         reported: ['published', 'hidden', 'flagged', 'rejected'],
    //         hidden: ['published', 'rejected'],
    //         rejected: ['published']
    //     };

    //     if (!validTransitions[review.status]?.includes(newStatus)) {
    //         throw ApiError.badRequest(`Invalid status transition from ${review.status} to ${newStatus}`);
    //     }

    //     const previousStatus = review.status;
    //     review.status = newStatus;
    //     review.moderated_by = adminId;
    //     review.moderated_at = new Date();
    //     review.moderation_reason = reason || 'No reason provided';

    //     if (newStatus === 'published') review.published_at = new Date();
    //     if (newStatus === 'hidden') review.hidden_at = new Date();
    //     if (newStatus === 'rejected') review.rejected_at = new Date();

    //     review.moderation_history.push({
    //         action,
    //         previous_status: previousStatus,
    //         new_status: newStatus,
    //         reason,
    //         admin_id: adminId,
    //         timestamp: new Date()
    //     });

    //     await review.save();

    //     // Recalculate product rating if published
    //     if (newStatus === 'published') {
    //         await this.recalculateProductRating(review.product_id);
    //     }

    //     return review;
    // }

    // // Recalculate Product Rating
    // async recalculateProductRating(productId) {
    //     const result = await Review.aggregate([
    //         { $match: { product_id: productId, status: 'published', deleted_at: null } },
    //         { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    //     ]);

    //     await Product.findByIdAndUpdate(productId, {
    //         rating: result[0]?.avg || 0,
    //         total_reviews: result[0]?.count || 0
    //     });
    // }

    // // Get Review Reports
    // async getAllReviewReports({ page = 1, limit = 10, search = null, status = null } = {}) {
    //     const query = {};
    //     if (status && status !== 'all') query.status = status;

    //     if (search) {
    //         const regex = new RegExp(search, 'i');
    //         const [matchedReviews] = await Promise.all([
    //             Review.find({ $or: [{ comment: regex }, { title: regex }] }).select('_id')
    //         ]);
    //         query.$or = [
    //             { reason: regex },
    //             { description: regex },
    //             { review_id: { $in: matchedReviews.map(r => r._id) } }
    //         ];
    //     }

    //     const [reports, total] = await Promise.all([
    //         ReviewReport.find(query)
    //             .populate('review_id', 'title comment rating status')
    //             .populate('product_id', 'product_name product_code')
    //             .populate('customer_id', 'first_name last_name email')
    //             .populate('reported_by', 'first_name last_name email')
    //             .sort({ created_at: -1 })
    //             .skip((page - 1) * limit).limit(parseInt(limit)),
    //         ReviewReport.countDocuments(query)
    //     ]);

    //     return { reports, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
    // }

    // // Update Report Status
    // async updateReviewReport(reportId, { status, action }, adminId) {
    //     const report = await ReviewReport.findById(reportId);
    //     if (!report) throw ApiError.notFound('Report not found');

    //     report.status = status;
    //     report.action_taken = action || null;
    //     report.resolved_by = adminId;
    //     await report.save();

    //     // If action taken on the review
    //     if (action && report.review_id) {
    //         await this.moderateReview(report.review_id, { action, reason: report.description || 'Reported' }, adminId);
    //     }

    //     return report;
    // }

    // // Get Analytics (Rating distribution, trend)
    // async getReviewAnalytics() {
    //     const ratingDist = await Review.aggregate([
    //         { $match: { deleted_at: null } },
    //         { $group: { _id: '$rating', count: { $sum: 1 } } }
    //     ]);

    //     const statusDist = await Review.aggregate([
    //         { $match: { deleted_at: null } },
    //         { $group: { _id: '$status', count: { $sum: 1 } } }
    //     ]);

    //     return { rating_distribution: ratingDist, status_distribution: statusDist };
    // }


    // ==================== PAYMENT MANAGEMENT ====================

    // Generate Payment Code (PAY-123456)
    async generatePaymentCode() {
        let code = '';
        let isUnique = false;
        while (!isUnique) {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            code = `PAY-${randomNum}`;
            const existing = await Payment.findOne({ payment_code: code });
            if (!existing) isUnique = true;
        }
        return code;
    }

    // Get All Payments
    async getAllPayments({ page = 1, limit = 10, search = null, status = null } = {}) {
        const query = {};
        if (status && status !== 'all') query.payment_status = status;
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [{ payment_code: regex }, { order_code: regex }, { transaction_id: regex }];
        }

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .populate('order_id', 'order_code')
                .populate('user_id', 'first_name last_name email')
                .populate('seller_id', 'business_name')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit).limit(parseInt(limit)),
            Payment.countDocuments(query)
        ]);

        const stats = {
            total: await Payment.countDocuments(),
            success: await Payment.countDocuments({ payment_status: 'success' }),
            pending: await Payment.countDocuments({ payment_status: 'pending' }),
            failed: await Payment.countDocuments({ payment_status: 'failed' })
        };

        return { payments, stats, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
    }

    // Get Payment Details by Code
    async getPaymentDetails(paymentCode) {
        const payment = await Payment.findOne({ payment_code: paymentCode })
            .populate('order_id', 'order_code')
            .populate('user_id', 'first_name last_name email mobile_number')
            .populate('seller_id', 'business_name');
        if (!payment) throw ApiError.notFound('Payment not found');
        return payment;
    }

    // Update Payment Status
    async updatePaymentStatus(paymentCode, updateData, adminId) {
        const payment = await Payment.findOne({ payment_code: paymentCode });
        if (!payment) throw ApiError.notFound('Payment not found');

        payment.payment_status = updateData.payment_status;
        if (updateData.payment_status === 'success') payment.payment_date = new Date();

        payment.updated_by = adminId;
        await payment.save();
        return payment;
    }

    // Get Financial Summary (Income, Expense, Profit, Pending, Refunds)
    async getFinancialSummary({ startDate = null, endDate = null } = {}) {
        const dateQuery = {};
        if (startDate || endDate) {
            dateQuery.payment_date = {};
            if (startDate) dateQuery.payment_date.$gte = new Date(startDate);
            if (endDate) dateQuery.payment_date.$lte = new Date(endDate);
        }

        // Income (Successful payments)
        const incomeAgg = await Payment.aggregate([
            { $match: { payment_status: 'success', ...dateQuery } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);
        const totalIncome = incomeAgg[0]?.total || 0;
        const incomeCount = incomeAgg[0]?.count || 0;

        // Refunds (Payments with refunded status)
        const refundAgg = await Payment.aggregate([
            { $match: { $or: [{ payment_status: 'refunded' }, { payment_status: 'partially_refunded' }], ...dateQuery } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);
        const totalRefunds = refundAgg[0]?.total || 0;
        const refundCount = refundAgg[0]?.count || 0;

        // Pending payments
        const pendingAgg = await Payment.aggregate([
            { $match: { payment_status: 'pending', ...dateQuery } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);
        const totalPending = pendingAgg[0]?.total || 0;
        const pendingCount = pendingAgg[0]?.count || 0;

        // Net Profit = Income - Refunds (Simple for now, Expenses/Commission will be added in Finance Module)
        const netProfit = totalIncome - totalRefunds;

        return {
            income: { total: totalIncome, count: incomeCount },
            refunds: { total: totalRefunds, count: refundCount },
            pending: { total: totalPending, count: pendingCount },
            net_profit: netProfit
        };
    }

    // Export Accounting Report as PDF
    async exportAccountingPDF(startDate = null, endDate = null) {
        const PDFDocument = require('pdfkit');
        const fs = require('fs');
        const path = require('path');

        const summary = await this.getFinancialSummary({ startDate, endDate });

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        const filePath = path.join(__dirname, '../reports/accounting-report.pdf');

        // Ensure reports directory exists
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        doc.pipe(fs.createWriteStream(filePath));

        // Report Header
        doc.fontSize(24).text('Accounting Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Period: ${startDate ? new Date(startDate).toLocaleDateString() : 'All Time'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`);
        doc.moveDown();

        // Summary Section (Updated - No failed/commission)
        doc.fontSize(18).text('Financial Summary', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Total Income: ₹${summary.income.total.toLocaleString('en-IN')} (${summary.income.count} transactions)`);
        doc.text(`Total Refunds: ₹${summary.refunds.total.toLocaleString('en-IN')} (${summary.refunds.count} refunds)`);
        doc.text(`Total Pending: ₹${summary.pending.total.toLocaleString('en-IN')} (${summary.pending.count} pending)`);
        doc.moveDown();
        doc.fontSize(16).font('Helvetica-Bold').text(`Net Profit: ₹${summary.net_profit.toLocaleString('en-IN')}`, { color: '#2E7D32' });

        doc.end();

        // Wait for PDF to be created
        return new Promise((resolve, reject) => {
            doc.on('finish', () => {
                resolve(filePath);
            });
            doc.on('error', reject);
        });
    }

    // ============ COMPANY GENERAL FINANCE MANAGEMENT ============

    // Get All Finance Entries (with summary)
    async getFinanceEntries({ page = 1, limit = 10, type = null, search = null } = {}) {
        const query = { deleted_at: null };
        if (type && type !== 'all') query.entry_type = type;
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [{ category: regex }, { description: regex }, { entry_code: regex }];
        }

        const [entries, total] = await Promise.all([
            Finance.find(query)
                .populate('created_by', 'first_name last_name')
                .populate('updated_by', 'first_name last_name')
                .sort({ entry_date: -1 })
                .skip((page - 1) * limit).limit(parseInt(limit)),
            Finance.countDocuments(query)
        ]);

        // Calculate Totals for Cards
        const [totalIncome, totalExpense] = await Promise.all([
            Finance.aggregate([{ $match: { deleted_at: null, entry_type: 'income' } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
            Finance.aggregate([{ $match: { deleted_at: null, entry_type: 'expense' } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
        ]);

        return {
            entries,
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
        };
    }

    // Add New Finance Entry
    async addFinanceEntry(data, adminId) {
        const entry_code = `FIN-${Math.floor(100000 + Math.random() * 900000)}`;
        const entry = new Finance({ ...data, entry_code, created_by: adminId });
        await entry.save();
        return entry;
    }

    // Update Finance Entry
    async updateFinanceEntry(entryId, updateData, adminId) {
        const entry = await Finance.findOne({ _id: entryId, deleted_at: null });
        if (!entry) throw ApiError.notFound('Finance entry not found');
        Object.assign(entry, updateData, { updated_by: adminId });
        await entry.save();
        return entry;
    }

    // Delete Finance Entry (Soft Delete)
    async deleteFinanceEntry(entryId) {
        const entry = await Finance.findOne({ _id: entryId, deleted_at: null });
        if (!entry) throw ApiError.notFound('Finance entry not found');
        entry.deleted_at = new Date();
        await entry.save();
        return { message: 'Entry deleted successfully' };
    }

    // Export Finance PDF
    async exportFinancePDF() {
        const PDFDocument = require('pdfkit');
        const fs = require('fs');
        const path = require('path');

        const data = await this.getFinanceEntries({ limit: 1000 });
        const doc = new PDFDocument({ margin: 50 });
        const filePath = path.join(__dirname, '../reports/finance-report.pdf');

        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        doc.pipe(fs.createWriteStream(filePath));
        doc.fontSize(24).text('Company Finance Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Total Income: ₹${data.totalIncome.toLocaleString('en-IN')}`);
        doc.fontSize(14).text(`Total Expense: ₹${data.totalExpense.toLocaleString('en-IN')}`);
        doc.fontSize(14).text(`Net Balance: ₹${(data.totalIncome - data.totalExpense).toLocaleString('en-IN')}`);
        doc.moveDown();

        doc.fontSize(18).text('Entries', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Code     | Type     | Category     | Amount     | Date`);
        doc.moveDown();

        data.entries.forEach(entry => {
            doc.fontSize(10).text(`${entry.entry_code}     | ${entry.entry_type}     | ${entry.category}     | ₹${entry.amount}     | ${new Date(entry.entry_date).toLocaleDateString('en-IN')}`);
        });

        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('finish', () => resolve(filePath));
            doc.on('error', reject);
        });
    }

    // ============ TRANSACTION MANAGEMENT ============
    // Export Transactions PDF
    async exportTransactionsPDF() {
        const PDFDocument = require('pdfkit');
        const fs = require('fs');
        const path = require('path');

        const transactions = await Transaction.find().populate('user_id', 'first_name last_name').sort({ created_at: -1 }).limit(1000);
        const doc = new PDFDocument({ margin: 50 });
        const filePath = path.join(__dirname, '../reports/transactions-report.pdf');

        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        doc.pipe(fs.createWriteStream(filePath));
        doc.fontSize(24).text('Transactions Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Total Transactions: ${transactions.length}`);
        doc.moveDown();

        doc.fontSize(10).text(`Code     | Type     | Amount     | Status     | Date`);
        doc.moveDown();

        transactions.forEach(txn => {
            doc.fontSize(10).text(`${txn.transaction_code}     | ${txn.transaction_type}     | ₹${txn.amount}     | ${txn.status}     | ${new Date(txn.transaction_date).toLocaleDateString('en-IN')}`);
        });

        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('finish', () => resolve(filePath));
            doc.on('error', reject);
        });
    }

    // Get All Transactions
    async getAllTransactions({ page = 1, limit = 10, search = null, status = null } = {}) {
        const query = {};
        if (status && status !== 'all') query.status = status;
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [{ transaction_code: regex }, { order_code: regex }, { transaction_id: regex }];
        }

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('payment_id', 'payment_code')
                .populate('order_id', 'order_code')
                .populate('user_id', 'first_name last_name email')
                .populate('seller_id', 'business_name')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit).limit(parseInt(limit)),
            Transaction.countDocuments(query)
        ]);

        const stats = {
            total: await Transaction.countDocuments(),
            success: await Transaction.countDocuments({ status: 'success' }),
            pending: await Transaction.countDocuments({ status: 'pending' }),
            failed: await Transaction.countDocuments({ status: 'failed' })
        };

        return { transactions, stats, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
    }

    // Get Transaction Details by Code
    async getTransactionDetails(transactionCode) {
        const transaction = await Transaction.findOne({ transaction_code: transactionCode })
            .populate('payment_id', 'payment_code')
            .populate('order_id', 'order_code')
            .populate('user_id', 'first_name last_name email')
            .populate('seller_id', 'business_name');
        if (!transaction) throw ApiError.notFound('Transaction not found');
        return transaction;
    }


    // ============ NOTIFICATION MODULE ============

    // Generate Notification Code (e.g., NOT-123456)
    async generateNotificationCode() {
        let code = '';
        let isUnique = false;
        while (!isUnique) {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            code = `NOT-${randomNum}`;
            const existing = await Notification.findOne({ notification_code: code });
            if (!existing) isUnique = true;
        }
        return code;
    }

    // Get All Notifications (List + Search + Filter + Pagination)
    async getAllNotifications({ page = 1, limit = 10, search = null, type = null, status = null, priority = null } = {}) {
        const query = { is_deleted: false };

        if (type && type !== 'all') query.notification_type = type;
        if (status && status !== 'all') query.status = status;
        if (priority && priority !== 'all') query.priority = priority;

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { title: regex },
                { message: regex },
                { notification_code: regex }
            ];
        }

        const [notifications, total] = await Promise.all([
            Notification.find(query)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Notification.countDocuments(query)
        ]);

        // Ensure every notification has a code
        for (const notif of notifications) {
            if (!notif.notification_code) {
                notif.notification_code = await this.generateNotificationCode();
                await notif.save();
            }
        }

        // Stats for Cards
        const stats = {
            total: await Notification.countDocuments({ is_deleted: false }),
            unread: await Notification.countDocuments({ is_deleted: false, is_read: false }),
            read: await Notification.countDocuments({ is_deleted: false, is_read: true }),
            failed: await Notification.countDocuments({ is_deleted: false, status: 'failed' })
        };

        return {
            notifications,
            stats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Get Notification
    async getNotificationByCode(notificationCode) {
        const notification = await Notification.findOne({ notification_code: notificationCode, is_deleted: false });
        if (!notification) throw ApiError.notFound('Notification not found');
        return notification;
    }

    // Mark as Read 
    async markNotificationAsRead(notificationCode) {
        const notification = await Notification.findOne({ notification_code: notificationCode, is_deleted: false });
        if (!notification) throw ApiError.notFound('Notification not found');

        notification.is_read = true;
        notification.read_at = new Date();
        notification.status = 'read';
        await notification.save();
        return notification;
    }

    // Mark All Notifications as Read
    async markAllNotificationsAsRead() {
        await Notification.updateMany(
            { is_deleted: false, is_read: false },
            { $set: { is_read: true, read_at: new Date(), status: 'read' } }
        );
        return { message: 'All notifications marked as read' };
    }

    // Delete 
    async deleteNotification(notificationCode) {
        const notification = await Notification.findOne({ notification_code: notificationCode, is_deleted: false });
        if (!notification) throw ApiError.notFound('Notification not found');

        notification.is_deleted = true;
        notification.deleted_at = new Date();
        await notification.save();
        return { message: 'Notification deleted successfully' };
    }

    // Send Broadcast Notification
    async sendBroadcastNotification(data, adminId) {
        // Generate code
        const notification_code = await this.generateNotificationCode();

        // CRITICAL: Agar user_id nahi diya, toh adminId ya koi super_admin use karo
        let recipientUserId = data.user_id || adminId;
        if (!recipientUserId) {
            const superAdmin = await User.findOne({ user_type: 'super_admin' });
            recipientUserId = superAdmin ? superAdmin._id : null;
        }
        if (!recipientUserId) throw new Error('No valid user found for notification');

        const newNotification = new Notification({
            ...data,
            notification_code,
            user_id: recipientUserId, // YEH LINE ZAROORI HAI
            sender_id: adminId,
            receiver_type: data.receiver_type || 'admin',
            channel: data.channel || 'in_app',
            priority: data.priority || 'medium',
            status: data.status || 'sent',
            sent_at: new Date()
        });
        await newNotification.save();
        return newNotification;
    }

    // ============ COUPON MODULE ============

    // Generate unique coupon code
    async generateCouponCode() {
        let code = '';
        let isUnique = false;
        while (!isUnique) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            code = `CPN${randomNum}`;
            const existing = await Coupon.findOne({ coupon_code: code });
            if (!existing) isUnique = true;
        }
        return code;
    }

    // Calculate status based on dates
    _calculateStatus(startDate, expiryDate) {
        const now = new Date();
        const start = new Date(startDate);
        const expiry = new Date(expiryDate);

        // If start date is in future → Pending
        if (start > now) return 'pending';

        // If expiry date is in past → Expired
        if (expiry < now) return 'expired';

        // Otherwise → Active
        return 'active';
    }

    // Get all coupons (List, Search, Filter, Pagination)
    async getAllCoupons({ page = 1, limit = 10, search = null, status = null } = {}) {
        const query = {};
        if (status && status !== 'all') query.status = status;

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [{ coupon_code: regex }, { description: regex }];
        }

        const [coupons, total] = await Promise.all([
            Coupon.find(query)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Coupon.countDocuments(query)
        ]);

        // Stats for Cards
        const stats = {
            total: await Coupon.countDocuments(),
            active: await Coupon.countDocuments({ status: 'active' }),
            pending: await Coupon.countDocuments({ status: 'pending' }),
            expired: await Coupon.countDocuments({ $or: [{ status: 'expired' }, { expiry_date: { $lt: new Date() } }] }),
            disabled: await Coupon.countDocuments({ status: 'disabled' })
        };

        const data = coupons.map(c => ({
            code: c.coupon_code,
            description: c.description,
            discountType: c.discount_type,
            discountValue: c.discount_value,
            minOrderAmount: c.minimum_order_amount,
            maxDiscountAmount: c.maximum_discount,
            startDate: c.start_date,
            expiryDate: c.expiry_date,
            usageLimit: c.usage_limit,
            perUserLimit: c.per_user_limit,
            usedCount: c.used_count,
            status: c.status,
            created_at: c.created_at,
            updated_at: c.updated_at
        }));

        return {
            coupons: data,
            stats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Get coupon by coupon_code
    async getCouponByCode(code) {
        const coupon = await Coupon.findOne({ coupon_code: code });
        if (!coupon) throw ApiError.notFound('Coupon not found');

        return {
            code: coupon.coupon_code,
            description: coupon.description,
            discountType: coupon.discount_type,
            discountValue: coupon.discount_value,
            minOrderAmount: coupon.minimum_order_amount,
            maxDiscountAmount: coupon.maximum_discount,
            startDate: coupon.start_date,
            expiryDate: coupon.expiry_date,
            usageLimit: coupon.usage_limit,
            perUserLimit: coupon.per_user_limit,
            usedCount: coupon.used_count,
            status: coupon.status,
            created_at: coupon.created_at,
            updated_at: coupon.updated_at
        };
    }

    // Create Coupon (Updated)
    async createCoupon(data, adminId) {
        const derivedStatus = this._calculateStatus(data.startDate, data.expiryDate);

        let finalStatus = derivedStatus;
        if (data.status === 'disabled') {
            if (derivedStatus !== 'expired') {
                throw ApiError.badRequest(`Cannot set 'disabled' because this coupon is currently '${derivedStatus}'.`);
            }
            finalStatus = 'disabled';
        } else {
            if (data.status && data.status !== derivedStatus) {
                throw ApiError.badRequest(`Invalid status. Based on selected dates, status should be '${derivedStatus}'.`);
            }
        }

        const coupon = new Coupon({
            coupon_code: data.code || await this.generateCouponCode(),
            description: data.description || '',
            discount_type: data.discountType, // Frontend se seedha le lo
            discount_value: data.discountValue,
            minimum_order_amount: data.minOrderAmount || 0,
            maximum_discount: data.maxDiscountAmount || null,
            start_date: data.startDate ? new Date(data.startDate) : new Date(),
            expiry_date: new Date(data.expiryDate),
            usage_limit: data.usageLimit || null,
            per_user_limit: data.perUserLimit || 1,
            status: finalStatus,
            created_by: adminId
        });
        await coupon.save();
        return coupon;
    }

    // Update Coupon (Updated)
    async updateCoupon(code, data, adminId) {
        const coupon = await Coupon.findOne({ coupon_code: code });
        if (!coupon) throw ApiError.notFound('Coupon not found');

        const newStartDate = data.startDate ? new Date(data.startDate) : coupon.start_date;
        const newExpiryDate = data.expiryDate ? new Date(data.expiryDate) : coupon.expiry_date;
        const derivedStatus = this._calculateStatus(newStartDate, newExpiryDate);

        let finalStatus = derivedStatus;
        if (data.status === 'disabled') {
            if (derivedStatus !== 'expired') {
                throw ApiError.badRequest(`Cannot set 'disabled' because this coupon is currently '${derivedStatus}'.`);
            }
            finalStatus = 'disabled';
        } else {
            if (data.status && data.status !== derivedStatus) {
                throw ApiError.badRequest(`Invalid status. Based on selected dates, status should be '${derivedStatus}'.`);
            }
        }

        if (data.code) coupon.coupon_code = data.code;
        if (data.description !== undefined) coupon.description = data.description;
        if (data.discountType) coupon.discount_type = data.discountType; // Update
        if (data.discountValue !== undefined) coupon.discount_value = data.discountValue;
        if (data.minOrderAmount !== undefined) coupon.minimum_order_amount = data.minOrderAmount;
        if (data.maxDiscountAmount !== undefined) coupon.maximum_discount = data.maxDiscountAmount;

        coupon.start_date = newStartDate;
        coupon.expiry_date = newExpiryDate;

        if (data.usageLimit !== undefined) coupon.usage_limit = data.usageLimit;
        if (data.perUserLimit !== undefined) coupon.per_user_limit = data.perUserLimit;
        coupon.status = finalStatus;
        coupon.updated_by = adminId;
        await coupon.save();
        return coupon;
    }

    // Delete Coupon (By coupon_code)
    async deleteCoupon(code) {
        const coupon = await Coupon.findOne({ coupon_code: code });
        if (!coupon) throw ApiError.notFound('Coupon not found');
        await coupon.deleteOne();
        return { message: 'Coupon deleted successfully' };
    }

    // ============ ADMIN REPORT MODULE ============

    // Generate Report Code
    async generateReportCode(reportType) {
        const prefix = reportType.toUpperCase().substring(0, 6); // e.g., SALES
        let code = '';
        let isUnique = false;
        while (!isUnique) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            code = `${prefix}-${randomNum}`;
            const existing = await ReportSchedule.findOne({ report_code: code });
            if (!existing) isUnique = true;
        }
        return code;
    }

    async exportReportPDF(reportType, filters) {
        const PDFDocument = require('pdfkit');
        const { data } = await this.getReportData(reportType, filters);

        const doc = new PDFDocument({ margin: 50, bufferPages: true, size: 'A4' });

        const BRAND_COLOR = '#2563eb';
        const TEXT_DARK = '#0f172a';
        const TEXT_MUTED = '#64748b';
        const BORDER = '#e2e8f0';
        const ROW_ALT = '#f8fafc';

        const PAGE_WIDTH = doc.page.width;
        const MARGIN = doc.page.margins.left;
        const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
        const PAGE_BOTTOM = doc.page.height - doc.page.margins.bottom;

        const reportTitles = {
            sales: 'Sales Report',
            revenue: 'Revenue Report',
            orders: 'Order Report',
            products: 'Product Report',
            users: 'User Report',
        };
        const title = reportTitles[reportType] || `${reportType.charAt(0).toUpperCase()}${reportType.slice(1)} Report`;

        // IMPORTANT: we never read doc.y for layout decisions. PDFKit's
        // doc.text(text, x, y, opts) mutates doc.y as a side effect even when
        // explicit x/y are passed, which was silently drifting our layout and
        // triggering spurious page breaks. Instead we track our own cursorY
        // and treat it as the single source of truth for vertical position.
        let cursorY = 0;

        // Draws text at an explicit position without letting it affect our
        // own cursor tracking.
        const printText = (text, x, y, options = {}) => {
            doc.text(text, x, y, { lineBreak: false, ellipsis: true, ...options });
        };

        const startNewPage = () => {
            doc.addPage();
            cursorY = doc.page.margins.top;
        };

        const ensureSpace = (needed) => {
            if (cursorY + needed > PAGE_BOTTOM - 30) {
                startNewPage();
            }
        };

        const drawHeader = () => {
            doc.rect(0, 0, PAGE_WIDTH, 90).fill(BRAND_COLOR);
            doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold');
            printText('ZYVENTO SHOPPING', MARGIN, 28);
            doc.fontSize(11).font('Helvetica');
            printText(title, MARGIN, 56);

            doc.fillColor('#ffffff').fontSize(9).font('Helvetica');
            printText(`Generated: ${new Date().toLocaleString('en-GB')}`, MARGIN, 12, {
                align: 'right', width: CONTENT_WIDTH,
            });

            cursorY = 110;
            doc.fillColor(TEXT_MUTED).fontSize(10);
            printText(`Period: ${filters.startDate || 'N/A'}  to  ${filters.endDate || 'N/A'}`, MARGIN, cursorY);
            cursorY += 24;
        };

        const drawSummaryCards = (summaryEntries) => {
            if (summaryEntries.length === 0) return;

            const cols = 3;
            const gap = 12;
            const cardWidth = (CONTENT_WIDTH - gap * (cols - 1)) / cols;
            const cardHeight = 58;
            const rows = Math.ceil(summaryEntries.length / cols);
            const gridHeight = rows * cardHeight + (rows - 1) * gap;

            ensureSpace(gridHeight);
            const gridStartY = cursorY;

            summaryEntries.forEach(([key, value], idx) => {
                const col = idx % cols;
                const row = Math.floor(idx / cols);
                const x = MARGIN + col * (cardWidth + gap);
                const y = gridStartY + row * (cardHeight + gap);

                doc.roundedRect(x, y, cardWidth, cardHeight, 6).fillAndStroke('#f1f5f9', BORDER);

                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
                const displayValue = typeof value === 'number'
                    ? new Intl.NumberFormat('en-IN').format(value)
                    : String(value);

                doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica');
                printText(label, x + 10, y + 10, { width: cardWidth - 20 });

                doc.fillColor(TEXT_DARK).fontSize(15).font('Helvetica-Bold');
                printText(displayValue, x + 10, y + 28, { width: cardWidth - 20 });
            });

            cursorY = gridStartY + gridHeight + 14;
        };

        const drawTable = (heading, rows) => {
            if (!Array.isArray(rows) || rows.length === 0) return;

            ensureSpace(30);
            doc.fillColor(TEXT_DARK).fontSize(13).font('Helvetica-Bold');
            printText(heading.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim(), MARGIN, cursorY);
            cursorY += 22;

            const sample = rows[0];
            const columns = Object.keys(sample)
                .filter((k) => typeof sample[k] !== 'object' || sample[k] === null)
                .slice(0, 5);
            if (columns.length === 0) return;

            const colWidth = CONTENT_WIDTH / columns.length;
            const rowHeight = 22;

            const drawTableHeaderRow = () => {
                const y = cursorY;
                doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight).fill(BRAND_COLOR);
                doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
                columns.forEach((col, i) => {
                    printText(col.replace(/_/g, ' ').toUpperCase(), MARGIN + i * colWidth + 6, y + 6, {
                        width: colWidth - 12,
                    });
                });
                cursorY = y + rowHeight;
            };

            ensureSpace(rowHeight);
            drawTableHeaderRow();

            rows.slice(0, 50).forEach((row, idx) => {
                const yBefore = cursorY;
                ensureSpace(rowHeight);
                if (cursorY !== yBefore) {
                    // A page break happened inside ensureSpace — repeat the
                    // header row at the top of the new page.
                    drawTableHeaderRow();
                }

                const y = cursorY;
                if (idx % 2 === 1) {
                    doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight).fill(ROW_ALT);
                }

                doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica');
                columns.forEach((col, i) => {
                    const val = row[col];
                    const text = val === null || val === undefined
                        ? '-'
                        : (val instanceof Date ? new Date(val).toLocaleDateString('en-IN') : String(val));
                    printText(text, MARGIN + i * colWidth + 6, y + 6, { width: colWidth - 12 });
                });

                cursorY = y + rowHeight;
                doc.moveTo(MARGIN, cursorY).lineTo(MARGIN + CONTENT_WIDTH, cursorY).strokeColor(BORDER).lineWidth(0.5).stroke();
            });

            if (rows.length > 50) {
                cursorY += 6;
                doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica-Oblique');
                printText(`Showing 50 of ${rows.length} records.`, MARGIN, cursorY);
                cursorY += 14;
            }

            cursorY += 18;
        };

        const drawFooter = () => {
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica');
                doc.text(
                    `Page ${i - range.start + 1} of ${range.count}`,
                    MARGIN,
                    doc.page.height - 30,
                    { align: 'center', width: CONTENT_WIDTH, lineBreak: false }
                );
            }
        };

        return {
            doc,
            content: () => {
                drawHeader();

                const summaryEntries = Object.entries(data).filter(
                    ([, value]) => value !== null && value !== undefined && typeof value !== 'object'
                );
                drawSummaryCards(summaryEntries);

                const arrayEntries = Object.entries(data).filter(
                    ([, value]) => Array.isArray(value) && value.length > 0
                );
                arrayEntries.forEach(([key, value]) => drawTable(key, value));

                drawFooter();
                doc.end();
            },
        };
    }

    async getReportData(reportType, {
        // startDate = null, endDate = null, period = null, metric = null 
        startDate = null, endDate = null, period = null, metric = null,
        page = 1, limit = 10, search = '', seller_id = '', status = ''
    } = {}) {

        const dateQuery = {};
        if (startDate || endDate) {
            dateQuery.created_at = {};
            if (startDate) dateQuery.created_at.$gte = new Date(startDate);
            if (endDate) dateQuery.created_at.$lte = new Date(endDate);
        }

        let data = {};

        if (reportType === 'revenue') {
            // ========== DATE RANGE SETUP ==========
            const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const end = endDate ? new Date(endDate) : new Date();
            end.setHours(23, 59, 59, 999);

            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

            // ========== GET CURRENT COMMISSION RATE ==========
            const commissionSetting = await SystemSetting.findOne({ key: 'platform_commission_rate', status: 'active' });
            const PLATFORM_COMMISSION = commissionSetting ? Number(commissionSetting.value) : 10; // default 10%


            const orderValueExpr = {
                $subtract: ['$total_amount', { $ifNull: ['$delivery_charge', 0] }]
            };
            const commissionExpr = {
                $multiply: [
                    { $ifNull: ['$commission_rate', PLATFORM_COMMISSION] },
                    { $divide: [orderValueExpr, 100] }
                ]
            };


            const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

            // ========== 1. SUMMARY CARDS (PARALLEL AGGREGATIONS) ==========
            const [
                totalRevenueAgg,
                todayRevenueAgg,
                thisMonthRevenueAgg,
                lastMonthRevenueAgg,
                pendingRevenueAgg,
                refundedRevenueAgg
            ] = await Promise.all([
                // Total Revenue (all time - delivered & paid)
                Order.aggregate([
                    { $match: { order_status: 'delivered', payment_status: { $in: ['paid', 'partially_refunded'] } } },
                    { $project: { commission: commissionExpr } },
                    { $group: { _id: null, total: { $sum: '$commission' } } }
                ]),

                // Today's Revenue
                Order.aggregate([
                    { $match: { created_at: { $gte: todayStart, $lte: now }, order_status: 'delivered', payment_status: { $in: ['paid', 'partially_refunded'] } } },
                    { $project: { commission: commissionExpr } },
                    { $group: { _id: null, total: { $sum: '$commission' } } }
                ]),

                // This Month Revenue
                Order.aggregate([
                    { $match: { created_at: { $gte: monthStart, $lte: now }, order_status: 'delivered', payment_status: { $in: ['paid', 'partially_refunded'] } } },
                    { $project: { commission: commissionExpr } },
                    { $group: { _id: null, total: { $sum: '$commission' } } }
                ]),

                // Last Month Revenue
                Order.aggregate([
                    { $match: { created_at: { $gte: prevMonthStart, $lte: prevMonthEnd }, order_status: 'delivered', payment_status: { $in: ['paid', 'partially_refunded'] } } },
                    { $project: { commission: commissionExpr } },
                    { $group: { _id: null, total: { $sum: '$commission' } } }
                ]),

                // Pending Revenue
                Order.aggregate([
                    {
                        $match: {
                            order_status: { $nin: ['delivered', 'cancelled', 'returned'] },
                            payment_status: { $nin: ['paid', 'refunded', 'partially_refunded'] }
                        }
                    },
                    { $project: { commission: commissionExpr } },
                    { $group: { _id: null, total: { $sum: '$commission' } } }
                ]),

                // Refunded Revenue (cancelled/returned/refunded)
                Order.aggregate([
                    { $match: { $or: [{ order_status: { $in: ['cancelled', 'returned'] } }, { payment_status: 'refunded' }] } },
                    { $project: { commission: commissionExpr } },
                    { $group: { _id: null, total: { $sum: '$commission' } } }
                ])
            ]);

            const summary = {
                totalRevenue: round2(totalRevenueAgg[0]?.total || 0),
                todayRevenue: round2(todayRevenueAgg[0]?.total || 0),
                thisMonthRevenue: round2(thisMonthRevenueAgg[0]?.total || 0),
                lastMonthRevenue: round2(lastMonthRevenueAgg[0]?.total || 0),
                pendingRevenue: round2(pendingRevenueAgg[0]?.total || 0),
                refundedRevenue: round2(refundedRevenueAgg[0]?.total || 0),
                commissionRate: PLATFORM_COMMISSION,
            };

            // ========== 2. REVENUE TREND (DYNAMIC PERIOD) ==========
            const selectedPeriod = period || 'this_month';
            let trendStartDate, groupFormat, groupNames = [];

            switch (selectedPeriod) {
                case 'today':
                    trendStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    groupFormat = { $hour: '$created_at' };
                    for (let h = 0; h < 24; h++) groupNames.push(`${h}:00`);
                    break;
                case 'last_7_days':
                    trendStartDate = new Date(now);
                    trendStartDate.setDate(now.getDate() - 7);
                    groupFormat = { $dayOfMonth: '$created_at' };
                    for (let d = 0; d < 7; d++) {
                        const date = new Date(now);
                        date.setDate(now.getDate() - 6 + d);
                        groupNames.push(date.getDate().toString());
                    }
                    break;
                case 'last_30_days':
                    trendStartDate = new Date(now);
                    trendStartDate.setDate(now.getDate() - 30);
                    groupFormat = { $dayOfMonth: '$created_at' };
                    for (let d = 0; d < 30; d++) {
                        const date = new Date(now);
                        date.setDate(now.getDate() - 29 + d);
                        groupNames.push(date.getDate().toString());
                    }
                    break;
                case 'this_month':
                    trendStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    groupFormat = { $dayOfMonth: '$created_at' };
                    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                    for (let d = 1; d <= daysInMonth; d++) groupNames.push(d.toString());
                    break;
                case 'last_month':
                    trendStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const lastMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
                    groupFormat = { $dayOfMonth: '$created_at' };
                    for (let d = 1; d <= lastMonthDays; d++) groupNames.push(d.toString());
                    break;
                case 'this_year':
                default:
                    trendStartDate = new Date(now.getFullYear(), 0, 1);
                    groupFormat = { $month: '$created_at' };
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    for (let m = 0; m < 12; m++) groupNames.push(monthNames[m]);
                    break;
            }

            const trendAgg = await Order.aggregate([
                {
                    $match: {
                        created_at: { $gte: trendStartDate, $lte: now },
                        order_status: 'delivered',
                        payment_status: { $in: ['paid', 'partially_refunded'] }
                    }
                },
                { $project: { dateKey: groupFormat, commission: commissionExpr } },
                { $group: { _id: '$dateKey', revenue: { $sum: '$commission' } } },
                { $sort: { _id: 1 } }
            ]);

            const trendMap = {};
            trendAgg.forEach(item => { trendMap[item._id] = item.revenue; });

            const trendLabels = [];
            const trendValues = [];
            groupNames.forEach((label, idx) => {
                const key = selectedPeriod === 'today' ? idx : Number(label) || label;
                trendLabels.push(label);
                trendValues.push(Math.round(trendMap[key] || 0));
            });

            const trend = { labels: trendLabels, values: trendValues };

            // ========== 3. REVENUE RECORDS TABLE (WITH PAGINATION & FILTERS) ==========
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const searchTerm = search || '';
            const sellerIdFilter = seller_id || '';
            const statusFilter = status || '';
            const filterStartDate = startDate || '';
            const filterEndDate = endDate || '';

            // ========== STATUS BUCKET MATCH ==========

            let statusMatch;
            switch (statusFilter) {
                case 'Pending':
                    statusMatch = {
                        order_status: { $nin: ['delivered', 'cancelled', 'returned'] },
                        payment_status: { $nin: ['paid', 'refunded', 'partially_refunded'] }
                    };
                    break;
                case 'Refunded':
                    statusMatch = {
                        $or: [
                            { order_status: { $in: ['cancelled', 'returned'] } },
                            { payment_status: 'refunded' }
                        ]
                    };
                    break;
                case 'Partially Refunded':
                    statusMatch = { order_status: 'delivered', payment_status: 'partially_refunded' };
                    break;
                case 'Earned':
                    statusMatch = { order_status: 'delivered', payment_status: 'paid' };
                    break;
                default:
                    // FIX: "All Status" (empty statusFilter) was silently narrowed to
                    // delivered + paid/partially_refunded — so Pending and Refunded rows
                    // never showed up even with no filter applied at all. No status
                    // chosen now genuinely means no restriction: every row, every status.
                    statusMatch = {};
            }

            // Filters that apply on top of the status bucket, combined via $and so they
            // never clobber each other's $or clauses (statusMatch's own $or for
            // "Refunded" vs. the search term's $or, for example).
            const andConditions = [statusMatch];

            if (filterStartDate || filterEndDate) {
                const dateMatch = {};
                if (filterStartDate) dateMatch.$gte = new Date(filterStartDate);
                if (filterEndDate) {
                    const filterEnd = new Date(filterEndDate);
                    filterEnd.setHours(23, 59, 59, 999);
                    dateMatch.$lte = filterEnd;
                }
                andConditions.push({ created_at: dateMatch });
            }
            if (sellerIdFilter) andConditions.push({ seller_id: sellerIdFilter });
            if (searchTerm) {
                andConditions.push({
                    $or: [
                        { order_code: { $regex: searchTerm, $options: 'i' } },
                        { order_number: { $regex: searchTerm, $options: 'i' } },
                    ]
                });
            }

            const recordsMatch = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

            // ========== PER-ROW STATUS / NET REVENUE ==========
            // Computed directly from order_status/payment_status (not from which bucket
            // was queried), so it's correct regardless of which status filter is active
            // — including the default view, where Earned and Partially Refunded rows
            // are mixed together and still need to be told apart per row.
            const rowStatusExpr = {
                $switch: {
                    branches: [
                        {
                            case: {
                                $or: [
                                    { $in: ['$order_status', ['cancelled', 'returned']] },
                                    { $eq: ['$payment_status', 'refunded'] }
                                ]
                            },
                            then: 'Refunded'
                        },
                        { case: { $eq: ['$payment_status', 'partially_refunded'] }, then: 'Partially Refunded' },
                        {
                            case: { $and: [{ $eq: ['$order_status', 'delivered'] }, { $eq: ['$payment_status', 'paid'] }] },
                            then: 'Earned'
                        }
                    ],
                    default: 'Pending'
                }
            };

            // Net revenue is only realized once the order is delivered and paid (in
            // full or partially) — Pending orders haven't earned anything yet, and
            // refunded ones have given it back, so both show 0 here.
            const rowNetRevenueExpr = {
                $cond: {
                    if: { $and: [{ $eq: ['$order_status', 'delivered'] }, { $in: ['$payment_status', ['paid', 'partially_refunded']] }] },
                    then: commissionExpr,
                    else: 0
                }
            };

            const recordsPipeline = [
                { $match: recordsMatch },
                {
                    $lookup: {
                        from: 'sellers',
                        localField: 'seller_id',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        revenue_id: { $concat: ['REV-', { $toString: '$_id' }] },
                        order_id: '$_id',
                        order_code: 1,
                        order_number: 1,
                        seller_name: { $ifNull: ['$seller.business_name', 'Unknown'] },
                        total_amount: 1,
                        product_amount: orderValueExpr,
                        commission_rate: { $ifNull: ['$commission_rate', PLATFORM_COMMISSION] },
                        commission_amount: commissionExpr,
                        refund_adjustment: {
                            $cond: {
                                if: { $in: ['$order_status', ['cancelled', 'returned']] },
                                then: commissionExpr,
                                else: 0
                            }
                        },
                        net_revenue: rowNetRevenueExpr,
                        status: rowStatusExpr,
                        created_at: 1,
                        seller_payout: { $subtract: ['$total_amount', commissionExpr] },
                        delivery_charge: 1
                    }
                },
                { $sort: { created_at: -1 } },
                { $skip: (pageNum - 1) * limitNum },
                { $limit: limitNum }
            ];

            const countPipeline = [
                { $match: recordsMatch },
                { $count: 'total' }
            ];

            const [recordsResult, countResult] = await Promise.all([
                Order.aggregate(recordsPipeline),
                Order.aggregate(countPipeline)
            ]);

            // ========== 4. FINAL DATA ==========
            data = {
                summary,
                trend,
                records: recordsResult,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: countResult[0]?.total || 0,
                    totalPages: Math.ceil((countResult[0]?.total || 0) / limitNum)
                }
            };
        }

        else if (reportType === 'sales') {

            // ⚠️ FIELD MAP — verify these against your actual Order / OrderItem / Product / Category schema.
            // If a field/collection name below is wrong, only change it here — nothing
            // else in this block needs to be touched.
            //
            // Category does NOT live on OrderItem — confirmed via fix_category_id_types.js,
            // which shows `products.category_id` (ObjectId, ref → categories collection).
            // So getting a category name means: order_items → products → categories.
            const FIELD_MAP = {
                paymentMethod: 'payment_method',      // Order.payment_method → 'cod' | 'upi' | ...
                itemsCollection: 'orderitems',        // Mongo collection OrderItem docs live in
                itemPrice: 'price',                   // OrderItem.price (unit price)
                itemQuantity: 'quantity',             // OrderItem.quantity
                itemTotal: 'total_price',             // OrderItem.total_price (if pre-computed line total)

                productsCollection: 'products',       // confirmed by fix_category_id_types.js
                itemProductIdField: 'product_id',     // OrderItem field that references the Product (falls back to 'product' if not found)
                productCategoryId: 'category_id',     // Product.category_id (ObjectId, ref → categories)
                productCode: 'product_code',          // Product.product_code (shown under the name in Top Products)

                categoriesCollection: 'categories',   // collection the category_id points to
                categoryNameField: 'category_name',   // falls back to 'name' if this doesn't exist
            };

            // ========== DATE RANGE SETUP ==========
            const currentStartDate = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const currentEndDate = endDate ? new Date(endDate) : new Date();

            // ========== PREVIOUS PERIOD (For Growth) ==========
            const timeDiff = currentEndDate.getTime() - currentStartDate.getTime();
            const prevStartDate = new Date(currentStartDate.getTime() - timeDiff);
            const prevEndDate = new Date(currentStartDate.getTime() - 1);

            const currentQuery = { created_at: { $gte: currentStartDate, $lte: currentEndDate } };
            const prevQuery = { created_at: { $gte: prevStartDate, $lte: prevEndDate } };

            // Valid (net-sales eligible) orders: delivered + paid or partially refunded.
            // Cancelled / returned / fully refunded orders are excluded here itself.
            const validSalesMatch = {
                order_status: 'delivered',
                payment_status: { $in: ['paid', 'partially_refunded'] }
            };

            // Safe resolver for refunded amount (picks up whichever field exists in the schema)
            const refundedAmountExpr = {
                $ifNull: [
                    '$refunded_amount',
                    { $ifNull: ['$refund_amount', { $ifNull: ['$total_refund_amount', 0] }] }
                ]
            };

            // one order's net sales = total_amount − refunded_amount (not below 0)
            const netAmountExpr = {
                $max: [0, { $subtract: ['$total_amount', refundedAmountExpr] }]
            };

            // Line-item revenue = pre-computed total, else price × quantity
            const itemRevenueExpr = {
                $ifNull: [
                    `$items.${FIELD_MAP.itemTotal}`,
                    {
                        $multiply: [
                            { $ifNull: [`$items.${FIELD_MAP.itemPrice}`, 0] },
                            { $ifNull: [`$items.${FIELD_MAP.itemQuantity}`, 1] }
                        ]
                    }
                ]
            };
            const itemQtyExpr = { $ifNull: [`$items.${FIELD_MAP.itemQuantity}`, 1] };

            // Category name once `product` and `categoryDoc` have been $lookup'd in (see
            // the two pipelines below) — tries category_name, then name, then falls back.
            const categoryNameExpr = {
                $ifNull: [
                    `$categoryDoc.${FIELD_MAP.categoryNameField}`,
                    { $ifNull: ['$categoryDoc.name', 'Uncategorized'] }
                ]
            };

            // Shared lookup stages: order_items -> products -> categories.
            // Normalizes the product-reference field first (some schemas call it
            // `product_id`, some just `product`), so the $lookup below always has a
            // single field to join on regardless of which one exists.
            const productAndCategoryLookupStages = [
                {
                    $addFields: {
                        itemProductId: {
                            $ifNull: [`$items.${FIELD_MAP.itemProductIdField}`, '$items.product']
                        }
                    }
                },
                {
                    $lookup: {
                        from: FIELD_MAP.productsCollection,
                        localField: 'itemProductId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: FIELD_MAP.categoriesCollection,
                        localField: `product.${FIELD_MAP.productCategoryId}`,
                        foreignField: '_id',
                        as: 'categoryDoc'
                    }
                },
                { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } }
            ];

            const [
                successfulAgg, returnCancelAgg, totalOrders, prevSuccessfulAgg, prevReturnCancelAgg, prevOrders,
                recentOrders, monthlyAgg,
                categoryAgg, paymentMethodAgg, topProductsAgg
            ] = await Promise.all([

                // 1. Valid Sales (Gross + Refunded + Net)
                Order.aggregate([
                    { $match: { ...currentQuery, ...validSalesMatch } },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            revenue: { $sum: '$total_amount' },      // gross
                            refunded: { $sum: refundedAmountExpr },   // partial refunds
                            netRevenue: { $sum: netAmountExpr }       // actual net sales
                        }
                    }
                ]),

                // 2. Cancelled / Returned / Fully Refunded orders (for reporting purposes only)
                Order.aggregate([
                    {
                        $match: {
                            ...currentQuery,
                            $or: [
                                { order_status: { $in: ['cancelled', 'returned'] } },
                                { payment_status: 'refunded' }
                            ]
                        }
                    },
                    { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total_amount' } } }
                ]),

                // 3. Total Orders Count
                Order.countDocuments(currentQuery),

                // 4. Previous Period Valid Sales (Net) - For Growth
                Order.aggregate([
                    { $match: { ...prevQuery, ...validSalesMatch } },
                    { $group: { _id: null, netRevenue: { $sum: netAmountExpr } } }
                ]),

                // 5. Previous Cancel/Return (reporting only)
                Order.aggregate([
                    {
                        $match: {
                            ...prevQuery,
                            $or: [
                                { order_status: { $in: ['cancelled', 'returned'] } },
                                { payment_status: 'refunded' }
                            ]
                        }
                    },
                    { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total_amount' } } }
                ]),

                // 6. Previous Total Orders (For Growth)
                Order.countDocuments(prevQuery),

                // 7. Recent Orders (Max 15)
                Order.find(currentQuery)
                    .populate('user_id', 'first_name last_name')
                    .populate('order_items', 'product_name')
                    .sort({ created_at: -1 })
                    .limit(15)
                    .lean(),

                // 8. Monthly Chart Data (Net sales)
                Order.aggregate([
                    { $match: { ...currentQuery, ...validSalesMatch } },
                    {
                        $group: {
                            _id: { $dateToString: { format: '%b', date: '$created_at' } },
                            total: { $sum: netAmountExpr }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]),

                // 9. Sales by Category — matches Revenue's definition: all orders in
                // range, not just delivered+paid (per your choice).
                Order.aggregate([
                    { $match: { ...currentQuery } },
                    {
                        $lookup: {
                            from: FIELD_MAP.itemsCollection,
                            localField: 'order_items',
                            foreignField: '_id',
                            as: 'items'
                        }
                    },
                    { $unwind: '$items' },
                    ...productAndCategoryLookupStages,
                    {
                        $group: {
                            _id: categoryNameExpr,
                            revenue: { $sum: itemRevenueExpr }
                        }
                    },
                    { $sort: { revenue: -1 } },
                    { $limit: 6 }
                ]),

                // 10. Payment Methods
                Order.aggregate([
                    { $match: { ...currentQuery, ...validSalesMatch } },
                    {
                        $group: {
                            _id: { $ifNull: [`$${FIELD_MAP.paymentMethod}`, 'Other'] },
                            revenue: { $sum: netAmountExpr }
                        }
                    },
                    { $sort: { revenue: -1 } }
                ]),

                // 11. Top Products by Sales — same broadened match as #9
                Order.aggregate([
                    { $match: { ...currentQuery } },
                    {
                        $lookup: {
                            from: FIELD_MAP.itemsCollection,
                            localField: 'order_items',
                            foreignField: '_id',
                            as: 'items'
                        }
                    },
                    { $unwind: '$items' },
                    ...productAndCategoryLookupStages,
                    {
                        $group: {
                            _id: { $ifNull: ['$itemProductId', '$items.product_name'] },
                            productName: { $first: '$items.product_name' },
                            productCode: { $first: { $ifNull: [`$product.${FIELD_MAP.productCode}`, ''] } },
                            category: { $first: categoryNameExpr },
                            sold: { $sum: itemQtyExpr },
                            revenue: { $sum: itemRevenueExpr }
                        }
                    },
                    { $sort: { revenue: -1 } },
                    { $limit: 5 }
                ])
            ]);

            // ========== PROCESS AGGREGATION RESULTS ==========
            const successfulSalesCount = successfulAgg[0]?.count || 0;
            const successfulSalesRevenue = successfulAgg[0]?.revenue || 0;        // gross
            const partialRefundedAmount = successfulAgg[0]?.refunded || 0;        // partial refunds
            const netSalesRevenue = successfulAgg[0]?.netRevenue || 0;            // NET SALES

            const returnCancelSalesCount = returnCancelAgg[0]?.count || 0;
            const returnCancelSalesRevenue = returnCancelAgg[0]?.revenue || 0;

            // Total Sales = valid sales − cancelled − fully refunded − partial refund amount
            const totalRevenue = netSalesRevenue;

            const prevTotalRevenue = prevSuccessfulAgg[0]?.netRevenue || 0;
            const prevReturnCancelRevenue = prevReturnCancelAgg[0]?.revenue || 0;

            // ========== GROWTH CALCULATIONS ==========
            const calcGrowth = (current, previous) => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return ((current - previous) / previous) * 100;
            };

            const totalRevenueGrowth = Math.round(calcGrowth(totalRevenue, prevTotalRevenue) * 10) / 10;
            const orderGrowth = Math.round(calcGrowth(totalOrders, prevOrders) * 10) / 10;

            // ========== PROCESS RECENT ORDERS ==========
            const ordersData = recentOrders.map(order => ({
                order_code: order.order_code,
                total_amount: order.total_amount,
                created_at: order.created_at,
                order_status: order.order_status,
                product_name: order.order_items?.[0]?.product_name || 'Multiple Items',
                customer_name: order.user_id ? `${order.user_id.first_name} ${order.user_id.last_name}` : 'Guest'
            }));

            // ========== PROCESS MONTHLY CHART DATA ==========
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyMap = {};
            monthlyAgg.forEach(item => { monthlyMap[item._id] = item.total; });

            const chartData = {
                labels: months,
                values: months.map(m => Math.round(monthlyMap[m] || 0))
            };

            // ========== PROCESS SALES BY CATEGORY ==========
            const categoryData = categoryAgg.map(c => ({
                category: c._id || 'Uncategorized',
                revenue: c.revenue || 0
            }));

            // ========== PROCESS PAYMENT METHODS ==========
            const paymentMethods = paymentMethodAgg.map(p => ({
                method: (p._id || 'Other').toString().toUpperCase(),
                revenue: p.revenue || 0
            }));

            // ========== PROCESS TOP PRODUCTS BY SALES ==========
            const topProducts = topProductsAgg.map((p, idx) => ({
                rank: idx + 1,
                productName: p.productName || 'Unknown Product',
                productCode: p.productCode || '',
                category: p.category || 'Uncategorized',
                sold: p.sold || 0,
                revenue: p.revenue || 0
            }));

            data = {
                // ===== NET SALES (main) =====
                totalSales: totalRevenue,          // Total Sales card + Sales Overview widget
                totalRevenue: totalRevenue,

                // ===== BREAKDOWN =====
                successfulSalesCount: successfulSalesCount,
                successfulSalesRevenue: successfulSalesRevenue,   // gross (before refunds)
                partialRefundedAmount: partialRefundedAmount,
                returnCancelSalesCount: returnCancelSalesCount,
                returnCancelSalesRevenue: returnCancelSalesRevenue,

                totalOrders: totalOrders,

                // Growth
                salesGrowth: totalRevenueGrowth,
                orderGrowth: orderGrowth,

                // Last Period
                lastMonthSales: prevTotalRevenue,
                lastMonthRevenue: prevTotalRevenue,
                lastMonthOrders: prevOrders,

                // Returns
                returnProducts: returnCancelSalesCount,
                returnRate: 0,
                lastMonthReturns: 0,

                recentOrders: ordersData,
                chartData: chartData,

                // ===== NEW SECTIONS =====
                categoryData: categoryData,     // → "Sales by Category"
                paymentMethods: paymentMethods, // → "Payment Methods"
                topProducts: topProducts        // → "Top Products by Sales"
            };
        }

        else if (reportType === 'orders') {
            // ========== DATE RANGE SETUP ==========
            const currentStartDate = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const currentEndDate = endDate ? new Date(endDate) : new Date();
            const currentQuery = { created_at: { $gte: currentStartDate, $lte: currentEndDate } };

            // ========== PARALLEL QUERIES FOR SPEED (Fixes 6-7 sec lag) ==========
            const [
                totalOrders, pendingOrders, confirmedOrders, packedOrders,
                shippedOrders, deliveredOrders, cancelledOrders, returnedOrders,
                recentOrders, monthlyAgg
            ] = await Promise.all([
                Order.countDocuments(currentQuery),
                Order.countDocuments({ ...currentQuery, order_status: 'pending' }),
                Order.countDocuments({ ...currentQuery, order_status: 'confirmed' }),
                Order.countDocuments({ ...currentQuery, order_status: 'packed' }),
                Order.countDocuments({ ...currentQuery, order_status: { $in: ['packed', 'shipped', 'out_for_delivery'] } }),
                Order.countDocuments({ ...currentQuery, order_status: 'delivered' }),
                Order.countDocuments({ ...currentQuery, order_status: 'cancelled' }),
                Order.countDocuments({ ...currentQuery, order_status: 'returned' }),
                Order.find(currentQuery)
                    .populate('user_id', 'first_name last_name')
                    .populate('order_items', 'product_name')
                    .sort({ created_at: -1 })
                    .limit(15)
                    .lean(),
                Order.aggregate([
                    { $match: currentQuery },
                    { $group: { _id: { $dateToString: { format: "%b", date: "$created_at" } }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ])
            ]);

            // ========== PROCESS RECENT ORDERS ==========
            const ordersData = recentOrders.map(order => ({
                order_code: order.order_code,
                total_amount: order.total_amount,
                created_at: order.created_at,
                order_status: order.order_status,
                product_name: order.order_items?.[0]?.product_name || 'Multiple Items',
                customer_name: order.user_id ? `${order.user_id.first_name} ${order.user_id.last_name}` : 'Guest'
            }));

            // ========== PROCESS MONTHLY CHART DATA ==========
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyMap = {};
            monthlyAgg.forEach(item => { monthlyMap[item._id] = item.count; });

            data = {
                totalOrders: totalOrders,
                pendingOrders: pendingOrders,
                confirmedOrders: confirmedOrders,
                packedOrders: packedOrders,
                shippedOrders: shippedOrders,
                deliveredOrders: deliveredOrders,
                cancelledOrders: cancelledOrders,
                returnedOrders: returnedOrders,
                inProgressOrders: pendingOrders + confirmedOrders + shippedOrders,
                recentOrders: ordersData,
                chartData: {
                    labels: months,
                    values: months.map(m => monthlyMap[m] || 0)
                }
            };
        }

        else if (reportType === 'products') {
            // ========== DATE RANGE SETUP ==========
            const currentStartDate = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const currentEndDate = endDate ? new Date(endDate) : new Date();
            const currentQuery = { created_at: { $gte: currentStartDate, $lte: currentEndDate } };

            // ========== PARALLEL AGGREGATION (Fast + Populated) ==========
            const [
                totalProducts, activeProducts, outOfStock, lowStock,
                recentProducts, categoryAgg,
                topSellingAgg, monthlyProductSalesAgg
            ] = await Promise.all([
                Product.countDocuments({ deleted_at: null }),
                Product.countDocuments({ status: 'active', deleted_at: null }),
                Product.countDocuments({ stock_quantity: 0, deleted_at: null }),
                Product.countDocuments({ stock_quantity: { $gt: 0, $lte: 10 }, deleted_at: null }),

                // Recent Products with Category Populated
                Product.find({ deleted_at: null })
                    .populate('category_id', 'category_name')
                    .sort({ created_at: -1 })
                    .limit(15)
                    .lean(),

                // Category Aggregation with Name Lookup
                Product.aggregate([
                    { $match: { deleted_at: null } },
                    {
                        $group: {
                            _id: "$category_id",
                            count: { $sum: 1 },
                            avgRating: { $avg: "$rating" }
                        }
                    },
                    {
                        $lookup: {
                            from: "categories",
                            localField: "_id",
                            foreignField: "_id",
                            as: "categoryInfo"
                        }
                    },
                    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            name: { $ifNull: ["$categoryInfo.category_name", "Uncategorized"] },
                            count: 1,
                            avgRating: 1
                        }
                    },
                    { $sort: { count: -1 } },
                    { $limit: 6 }
                ]),


                // Top Selling Products (Via Orders -> OrderItems -> Products)
                Order.aggregate([
                    { $match: currentQuery },
                    {
                        $lookup: {
                            from: "orderitems",
                            localField: "order_items",
                            foreignField: "_id",
                            as: "items"
                        }
                    },
                    { $unwind: "$items" },
                    {
                        $group: {
                            _id: "$items.product_id",
                            totalSold: { $sum: "$items.quantity" },
                            totalRevenue: { $sum: "$items.total_price" }
                        }
                    },
                    { $sort: { totalRevenue: -1 } },
                    { $limit: 10 },              // increased from 5 to 10
                    {
                        $lookup: {
                            from: "products",
                            localField: "_id",
                            foreignField: "_id",
                            as: "productInfo"
                        }
                    },
                    { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            product_id: "$_id",
                            product_name: { $ifNull: ["$productInfo.product_name", "Unknown Product"] },
                            product_code: { $ifNull: ["$productInfo.product_code", "N/A"] },
                            totalSold: 1,
                            totalRevenue: 1
                        }
                    }
                ]),

                // Monthly Product Sales (For Chart) - Via Orders -> OrderItems
                Order.aggregate([
                    { $match: currentQuery },
                    {
                        $lookup: {
                            from: "orderitems",
                            localField: "order_items",
                            foreignField: "_id",
                            as: "items"
                        }
                    },
                    { $unwind: "$items" },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%b", date: "$created_at" } },
                            count: { $sum: "$items.quantity" }
                        }
                    },
                    { $sort: { _id: 1 } }
                ])
            ]);

            // ========== PROCESS RECENT PRODUCTS ==========
            const recentProductsData = recentProducts.map(product => ({
                _id: product._id,
                product_code: product.product_code,
                product_name: product.product_name,
                price: product.price,
                stock_quantity: product.stock_quantity,
                status: product.status,
                category_name: product.category_id?.category_name || 'Uncategorized',
                created_at: product.created_at,
                images: product.images?.[0] || null
            }));

            // ========== PROCESS CATEGORY DATA ==========
            const categories = categoryAgg.map(cat => ({
                name: cat.name || 'Uncategorized',
                count: cat.count,
                avgRating: cat.avgRating || 0
            }));

            // ========== PROCESS TOP SELLING ==========
            const topSellingProducts = topSellingAgg.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name || 'Unknown Product',
                product_code: item.product_code || 'N/A',
                totalSold: item.totalSold || 0,
                totalRevenue: item.totalRevenue || 0
            }));

            // ========== CHART DATA ==========
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyMap = {};
            monthlyProductSalesAgg.forEach(item => { monthlyMap[item._id] = item.count; });

            data = {
                totalProducts: totalProducts,
                activeProducts: activeProducts,
                outOfStock: outOfStock,
                lowStock: lowStock,
                topSellingProducts: topSellingProducts,
                categories: categories,
                recentProducts: recentProductsData,
                chartData: {
                    labels: months,
                    values: months.map(m => monthlyMap[m] || 0)
                }
            };
        }

        // Charts
        else if (reportType === 'monthly-revenue') {
            // ========== DATE RANGE (optional filter override, else current calendar year) ==========
            const now = new Date();
            const rangeStart = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
            const rangeEnd = endDate
                ? (() => { const d = new Date(endDate); d.setHours(23, 59, 59, 999); return d; })()
                : new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

            const commissionSetting = await SystemSetting.findOne({ key: 'platform_commission_rate', status: 'active' });
            const PLATFORM_COMMISSION = commissionSetting ? Number(commissionSetting.value) : 10;


            const orderValueExpr = {
                $subtract: ['$total_amount', { $ifNull: ['$delivery_charge', 0] }]
            };

            const commissionAgg = await Order.aggregate([
                {
                    $match: {
                        created_at: { $gte: rangeStart, $lte: rangeEnd },
                        order_status: 'delivered',
                        payment_status: { $in: ['paid', 'partially_refunded'] }
                    }
                },
                {
                    $project: {
                        month: { $month: '$created_at' },
                        commission: {
                            $multiply: [
                                { $ifNull: ['$commission_rate', PLATFORM_COMMISSION] },
                                { $divide: [orderValueExpr, 100] }
                            ]
                        }
                    }
                },
                { $group: { _id: '$month', revenue: { $sum: '$commission' } } }
            ]);

            const map = {};
            commissionAgg.forEach(a => { map[a._id] = a.revenue; });

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const labels = [];
            const values = [];
            for (let m = 1; m <= 12; m++) {
                labels.push(monthNames[m - 1]);
                values.push(Math.round(((map[m] || 0) + Number.EPSILON) * 100) / 100);
            }

            data = { labels, revenue: values };

        }

        else if (reportType === 'monthly-sales') {

            const year = new Date().getFullYear();
            const yearStart = new Date(year, 0, 1);
            const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

            const refundedAmountExpr = {
                $ifNull: [
                    '$refunded_amount',
                    { $ifNull: ['$refund_amount', { $ifNull: ['$total_refund_amount', 0] }] }
                ]
            };

            const netAmountExpr = {
                $max: [0, { $subtract: ['$total_amount', refundedAmountExpr] }]
            };

            const salesAgg = await Order.aggregate([
                {
                    $match: {
                        created_at: { $gte: yearStart, $lte: yearEnd },
                        order_status: 'delivered',
                        payment_status: { $in: ['paid', 'partially_refunded'] }
                    }
                },
                { $group: { _id: { $month: '$created_at' }, revenue: { $sum: netAmountExpr } } }
            ]);

            const map = {};
            salesAgg.forEach(a => { map[a._id] = a.revenue; });

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const labels = [];
            const values = [];
            for (let m = 1; m <= 12; m++) {
                labels.push(monthNames[m - 1]);
                values.push(Math.round(map[m] || 0));
            }

            data = { labels, revenue: values }; // net sales (cancel/refund adjusted)
        }

        else if (reportType === 'monthly-orders') {
            const year = new Date().getFullYear();
            const yearStart = new Date(year, 0, 1);
            const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

            const ordersAgg = await Order.aggregate([
                { $match: { created_at: { $gte: yearStart, $lte: yearEnd } } },
                { $group: { _id: { $month: '$created_at' }, count: { $sum: 1 } } }
            ]);

            const map = {};
            ordersAgg.forEach(a => { map[a._id] = a.count; });

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const labels = [];
            const values = [];
            for (let m = 1; m <= 12; m++) {
                labels.push(monthNames[m - 1]);
                values.push(map[m] || 0);
            }

            data = { labels, orders: values };
        }

        else if (reportType === 'monthly-products') {
            const year = new Date().getFullYear();
            const yearStart = new Date(year, 0, 1);
            const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

            const unitsAgg = await Order.aggregate([
                { $match: { created_at: { $gte: yearStart, $lte: yearEnd } } },
                { $unwind: '$order_items' },
                { $lookup: { from: 'orderitems', localField: 'order_items', foreignField: '_id', as: 'itemDetails' } },
                { $unwind: '$itemDetails' },
                { $group: { _id: { $month: '$created_at' }, units: { $sum: '$itemDetails.quantity' } } }
            ]);

            const map = {};
            unitsAgg.forEach(a => { map[a._id] = a.units; });

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const labels = [];
            const values = [];
            for (let m = 1; m <= 12; m++) {
                labels.push(monthNames[m - 1]);
                values.push(map[m] || 0);
            }

            data = { labels, orders: values }; // 'orders' key reused — AdminCharts reads this for non-'revenue' chart types
        }

        return { type: reportType, dateQuery, data };
    }

    // ============ SYSTEM SETTINGS ============
    // async updateSystemSetting(key, value, userId) {
    //     //  PERMISSION CHECK
    //     const hasPermission = await permissionService.hasPermission(userId, 'UPDATE_SETTINGS');
    //     if (!hasPermission) {
    //         throw ApiError.forbidden('You do not have permission to update settings');
    //     }

    //     try {
    //         const setting = await SystemSetting.findOne({ key });
    //         if (!setting) {
    //             throw ApiError.notFound('Setting not found');
    //         }

    //         const oldValue = setting.value;
    //         setting.value = value;
    //         setting.updated_by = userId;
    //         await setting.save();

    //         // ✅ AUDIT LOG
    //         await auditService.log({
    //             userId,
    //             action: 'update',
    //             module: 'settings',
    //             moduleId: setting._id,
    //             description: `System setting ${key} updated`,
    //             oldData: { value: oldValue },
    //             newData: { value: value },
    //             status: 'success'
    //         });

    //         return setting;
    //     } catch (error) {
    //         logger.error('Error in updateSystemSetting:', error);
    //         throw error;
    //     }
    // }

    async getSystemSettings(group = null) {
        const query = { status: 'active' };
        if (group) {
            query.group = group;
        }

        const settings = await SystemSetting.find(query).sort({ group: 1, key: 1 });
        return settings;
    }

    async getSettingsByGroup(group) {
        const settings = await SystemSetting.find({
            group,
            status: 'active'
        }).sort({ key: 1 });

        return settings;
    }

    // async updateSettingsByGroup(group, settingsObj, userId) {
    //     const hasPermission = await permissionService.hasPermission(userId, 'UPDATE_SETTINGS');
    //     if (!hasPermission) {
    //         throw ApiError.forbidden('Permission denied');
    //     }

    //     const updates = [];
    //     const keys = Object.keys(settingsObj);
    //     for (const key of keys) {
    //         const value = settingsObj[key];
    //         const setting = await SystemSetting.findOne({ key, group });
    //         if (!setting) {
    //             throw ApiError.notFound(`Setting ${key} not found in group ${group}`);
    //         }
    //         setting.value = value;
    //         setting.updated_by = userId;
    //         await setting.save();
    //         updates.push({ key, value });
    //     }
    //     return updates;
    // }

    // async updateSettingsByGroup(group, settingsObj, userId) {
    //     // permission check etc.
    //     const updates = [];
    //     for (const [key, value] of Object.entries(settingsObj)) {
    //         const setting = await SystemSetting.findOne({ key, group });
    //         if (!setting) {
    //             throw ApiError.notFound(`Setting ${key} not found in group ${group}`);
    //         }
    //         setting.value = value;
    //         setting.updated_by = userId;
    //         await setting.save();
    //         updates.push({ key, value });
    //     }
    //     return updates;
    // }

    async updateSettingsByGroup(group, settingsObj, userId) {
        const hasPermission = await permissionService.hasPermission(userId, 'UPDATE_SETTINGS');
        if (!hasPermission) {
            throw ApiError.forbidden('Permission denied');
        }

        const updates = [];
        for (const [key, value] of Object.entries(settingsObj)) {
            const setting = await SystemSetting.findOne({ key, group });
            if (!setting) {
                throw ApiError.notFound(`Setting ${key} not found in group ${group}`);
            }
            setting.value = value;
            setting.updated_by = userId;
            await setting.save();
            updates.push({ key, value });
        }
        return updates;
    }


}

module.exports = new AdminService();