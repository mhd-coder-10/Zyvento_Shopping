// Handles all sub-admin related business logic
// Manages sub-admin dashboard, profile, seller management, employee management
// Also handles order management, reports, notifications, and activity logs

const Seller = require('../../models/seller.model');
const Employee = require('../../models/employee.model');
const Order = require('../../models/order.model');
const User = require('../../models/user.model');
const SubAdmin = require('../../models/sub_admin.model');
const Notification = require('../../models/notification.model');
const AuditLog = require('../../models/audit_log.model');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');


class SubAdminService {

    // ============ DASHBOARD ============
    async getDashboard(subAdminId) {
        const subAdmin = await SubAdmin.findOne({ user_id: subAdminId });
        if (!subAdmin) {
            throw ApiError.notFound('Sub-admin not found');
        }

        const subAdminType = subAdmin.sub_admin_type;

        // Get statistics based on sub-admin type
        let statistics = {};

        if (subAdminType === 'seller_manager' || subAdminType === 'seller_opening_account_manager') {
            const [totalSellers, pendingSellers, approvedSellers, rejectedSellers] = await Promise.all([
                Seller.countDocuments(),
                Seller.countDocuments({ verification_status: constants.VERIFICATION_STATUS.PENDING }),
                Seller.countDocuments({ verification_status: constants.VERIFICATION_STATUS.APPROVED }),
                Seller.countDocuments({ verification_status: constants.VERIFICATION_STATUS.REJECTED })
            ]);

            statistics = {
                totalSellers,
                pendingSellers,
                approvedSellers,
                rejectedSellers
            };
        }

        if (subAdminType === 'finance_manager') {
            const [totalRevenue, pendingPayments, completedPayments] = await Promise.all([
                Order.aggregate([
                    { $match: { payment_status: constants.PAYMENT_STATUS.PAID } },
                    { $group: { _id: null, total: { $sum: '$total_amount' } } }
                ]),
                Order.countDocuments({ payment_status: constants.PAYMENT_STATUS.PENDING }),
                Order.countDocuments({ payment_status: constants.PAYMENT_STATUS.PAID })
            ]);

            statistics = {
                totalRevenue: totalRevenue[0]?.total || 0,
                pendingPayments,
                completedPayments
            };
        }

        if (subAdminType === 'support_manager') {
            const [totalOrders, pendingOrders, deliveredOrders, cancelledOrders] = await Promise.all([
                Order.countDocuments(),
                Order.countDocuments({ order_status: constants.ORDER_STATUS.PENDING }),
                Order.countDocuments({ order_status: constants.ORDER_STATUS.DELIVERED }),
                Order.countDocuments({ order_status: constants.ORDER_STATUS.CANCELLED })
            ]);

            statistics = {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                cancelledOrders
            };
        }

        // Get recent activity
        const recentActivity = await AuditLog.find()
            .sort({ created_at: -1 })
            .limit(10)
            .populate('user_id', 'first_name last_name email');

        return {
            subAdminType,
            statistics,
            recentActivity
        };
    }

    async getDashboardStatistics(subAdminId) {
        const subAdmin = await SubAdmin.findOne({ user_id: subAdminId });
        if (!subAdmin) {
            throw ApiError.notFound('Sub-admin not found');
        }

        const subAdminType = subAdmin.sub_admin_type;
        let statistics = {};

        if (subAdminType === 'seller_manager' || subAdminType === 'seller_opening_account_manager') {
            // Monthly seller registration trend
            const monthlyTrend = await Seller.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: '$created_at' },
                            year: { $year: '$created_at' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
                { $limit: 12 }
            ]);

            // Seller status distribution
            const statusDistribution = await Seller.aggregate([
                {
                    $group: {
                        _id: '$verification_status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            statistics = {
                monthlyTrend,
                statusDistribution
            };
        }

        return statistics;
    }

    // ============ PROFILE ============
    async getProfile(subAdminId) {
        const subAdmin = await SubAdmin.findOne({ user_id: subAdminId })
            .populate('user_id', 'first_name last_name email mobile_number profile_image')
            .populate('current_role_ids')
            .populate('assigned_by', 'first_name last_name email');

        if (!subAdmin) {
            throw ApiError.notFound('Sub-admin not found');
        }

        return subAdmin;
    }

    async updateProfile(subAdminId, updateData) {
        const subAdmin = await SubAdmin.findOne({ user_id: subAdminId });
        if (!subAdmin) {
            throw ApiError.notFound('Sub-admin not found');
        }

        const allowedFields = ['department', 'designation', 'notes'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        Object.assign(subAdmin, filteredData);
        await subAdmin.save();

        // Update user profile if needed
        if (updateData.first_name || updateData.last_name || updateData.mobile_number) {
            await User.findByIdAndUpdate(subAdminId, {
                first_name: updateData.first_name,
                last_name: updateData.last_name,
                mobile_number: updateData.mobile_number
            });
        }

        return subAdmin;
    }

    // ============ SELLER MANAGEMENT ============
    async getSellers({
        page = 1,
        limit = 10,
        search = null,
        verificationStatus = null,
        accountStatus = null,
        businessType = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const query = {};

        if (verificationStatus) {
            query.verification_status = verificationStatus;
        }

        if (accountStatus) {
            query.account_status = accountStatus;
        }

        if (businessType) {
            query.business_type = businessType;
        }

        if (search) {
            query.$or = [
                { business_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { owner_name: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [sellers, total] = await Promise.all([
            Seller.find(query)
                .populate('user_id', 'first_name last_name email mobile_number')
                .populate('approved_by', 'first_name last_name email')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Seller.countDocuments(query)
        ]);

        return {
            sellers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getSellerDetails(sellerId) {
        const seller = await Seller.findById(sellerId)
            .populate('user_id', 'first_name last_name email mobile_number profile_image')
            .populate('approved_by', 'first_name last_name email');

        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        // Get seller statistics
        const [totalOrders, totalRevenue, averageRating] = await Promise.all([
            Order.countDocuments({ seller_id: sellerId }),
            Order.aggregate([
                { $match: { seller_id: sellerId, payment_status: constants.PAYMENT_STATUS.PAID } },
                { $group: { _id: null, total: { $sum: '$total_amount' } } }
            ]),
            Order.aggregate([
                { $match: { seller_id: sellerId } },
                { $group: { _id: null, avg: { $avg: '$rating' } } }
            ])
        ]);

        return {
            seller,
            statistics: {
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                averageRating: averageRating[0]?.avg || 0
            }
        };
    }

    async approveSeller(sellerId, adminId, notes = '') {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        if (seller.verification_status !== constants.VERIFICATION_STATUS.PENDING) {
            throw ApiError.badRequest('Seller is not in pending state');
        }

        seller.verification_status = constants.VERIFICATION_STATUS.APPROVED;
        seller.account_status = constants.ACCOUNT_STATUS.ACTIVE;
        seller.approved_by = adminId;
        seller.approved_at = new Date();
        await seller.save();

        // Update user status
        await User.findByIdAndUpdate(seller.user_id, {
            account_status: constants.ACCOUNT_STATUS.ACTIVE
        });

        // Create notification for seller
        await Notification.create({
            user_id: seller.user_id,
            receiver_type: 'seller',
            title: 'Seller Account Approved',
            message: `Your seller account "${seller.business_name}" has been approved. You can now start selling.`,
            notification_type: 'seller',
            reference_id: seller._id,
            reference_model: 'Seller',
            channel: 'in_app',
            priority: 'high'
        });

        // Log activity
        await AuditLog.create({
            user_id: adminId,
            action: 'approve',
            module: 'seller',
            description: `Seller ${seller.business_name} approved`,
            new_data: { sellerId: seller._id, notes }
        });

        return seller;
    }

    async rejectSeller(sellerId, rejectionReason) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        if (seller.verification_status !== constants.VERIFICATION_STATUS.PENDING) {
            throw ApiError.badRequest('Seller is not in pending state');
        }

        seller.verification_status = constants.VERIFICATION_STATUS.REJECTED;
        seller.rejection_reason = rejectionReason;
        seller.account_status = constants.ACCOUNT_STATUS.INACTIVE;
        await seller.save();

        // Update user status
        await User.findByIdAndUpdate(seller.user_id, {
            account_status: constants.ACCOUNT_STATUS.INACTIVE
        });

        // Create notification for seller
        await Notification.create({
            user_id: seller.user_id,
            receiver_type: 'seller',
            title: 'Seller Account Rejected',
            message: `Your seller account "${seller.business_name}" has been rejected. Reason: ${rejectionReason}`,
            notification_type: 'seller',
            reference_id: seller._id,
            reference_model: 'Seller',
            channel: 'in_app',
            priority: 'high'
        });

        return seller;
    }

    async suspendSeller(sellerId, reason, adminId) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        seller.verification_status = constants.VERIFICATION_STATUS.SUSPENDED;
        seller.account_status = constants.ACCOUNT_STATUS.SUSPENDED;
        seller.rejection_reason = reason;
        await seller.save();

        // Update user status
        await User.findByIdAndUpdate(seller.user_id, {
            account_status: constants.ACCOUNT_STATUS.SUSPENDED
        });

        // Suspend all products
        await Product.updateMany(
            { seller_id: sellerId },
            { status: 'blocked' }
        );

        // Create notification for seller
        await Notification.create({
            user_id: seller.user_id,
            receiver_type: 'seller',
            title: 'Seller Account Suspended',
            message: `Your seller account "${seller.business_name}" has been suspended. Reason: ${reason}`,
            notification_type: 'seller',
            reference_id: seller._id,
            reference_model: 'Seller',
            channel: 'in_app',
            priority: 'high'
        });

        // Log activity
        await AuditLog.create({
            user_id: adminId,
            action: 'suspend',
            module: 'seller',
            description: `Seller ${seller.business_name} suspended`,
            new_data: { sellerId: seller._id, reason }
        });

        return seller;
    }

    // ============ EMPLOYEE MANAGEMENT ============
    async getEmployees({
        page = 1,
        limit = 10,
        search = null,
        sellerId = null,
        status = null
    }) {
        const query = {};

        if (sellerId) {
            query.seller_id = sellerId;
        }

        if (status) {
            query.status = status;
        }

        if (search) {
            const userIds = await User.find({
                $or: [
                    { first_name: { $regex: search, $options: 'i' } },
                    { last_name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).distinct('_id');

            query.user_id = { $in: userIds };
        }

        const [employees, total] = await Promise.all([
            Employee.find(query)
                .populate('user_id', 'first_name last_name email mobile_number profile_image')
                .populate('role_ids')
                .populate('seller_id', 'business_name')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Employee.countDocuments(query)
        ]);

        return {
            employees,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getEmployeeDetails(employeeId) {
        const employee = await Employee.findById(employeeId)
            .populate('user_id', 'first_name last_name email mobile_number profile_image')
            .populate('role_ids')
            .populate('seller_id', 'business_name business_type')
            .populate('created_by', 'first_name last_name email');

        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        return employee;
    }

    // ============ ORDER MANAGEMENT ============
    async getOrders({
        page = 1,
        limit = 10,
        orderStatus = null,
        paymentStatus = null,
        sellerId = null,
        startDate = null,
        endDate = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const query = {};

        if (orderStatus) {
            query.order_status = orderStatus;
        }

        if (paymentStatus) {
            query.payment_status = paymentStatus;
        }

        if (sellerId) {
            query.seller_id = sellerId;
        }

        if (startDate || endDate) {
            query.created_at = {};
            if (startDate) {
                query.created_at.$gte = new Date(startDate);
            }
            if (endDate) {
                query.created_at.$lte = new Date(endDate);
            }
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user_id', 'first_name last_name email')
                .populate('seller_id', 'business_name')
                .populate('order_items')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        return {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getOrderDetails(orderId) {
        const order = await Order.findById(orderId)
            .populate('user_id', 'first_name last_name email mobile_number')
            .populate('seller_id', 'business_name business_address')
            .populate({
                path: 'order_items',
                populate: {
                    path: 'product_id',
                    select: 'product_name images sku price'
                }
            })
            .populate('payment_id');

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        return order;
    }

    // ============ REPORTS ============
    async getOverviewReport(period = 'monthly') {
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
                startDate = new Date(now.setMonth(now.getMonth() - 1));
        }

        const [totalSellers, totalOrders, totalRevenue, newSellers, newOrders] = await Promise.all([
            Seller.countDocuments(),
            Order.countDocuments(),
            Order.aggregate([
                { $match: { payment_status: constants.PAYMENT_STATUS.PAID } },
                { $group: { _id: null, total: { $sum: '$total_amount' } } }
            ]),
            Seller.countDocuments({ created_at: { $gte: startDate } }),
            Order.countDocuments({ created_at: { $gte: startDate } })
        ]);

        return {
            period,
            totalSellers,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            newSellers,
            newOrders
        };
    }

    async getSellerPerformanceReport({ startDate, endDate, sellerId = null }) {
        const matchQuery = {
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        if (sellerId) {
            matchQuery.seller_id = sellerId;
        }

        const performance = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$seller_id',
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total_amount' },
                    avgOrderValue: { $avg: '$total_amount' }
                }
            },
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
                    totalOrders: 1,
                    totalRevenue: 1,
                    avgOrderValue: 1
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        return {
            period: { startDate, endDate },
            performance
        };
    }

    async getOrderAnalyticsReport({ startDate, endDate, sellerId = null }) {
        const matchQuery = {
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        if (sellerId) {
            matchQuery.seller_id = sellerId;
        }

        // Daily order trend
        const dailyTrend = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                    count: { $sum: 1 },
                    revenue: { $sum: '$total_amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Status distribution
        const statusDistribution = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$order_status',
                    count: { $sum: 1 }
                }
            }
        ]);

        return {
            period: { startDate, endDate },
            dailyTrend,
            statusDistribution
        };
    }

    // ============ NOTIFICATIONS ============
    async getNotifications(subAdminId, { page = 1, limit = 10, isRead = null }) {
        const query = {
            user_id: subAdminId,
            is_deleted: false
        };

        if (isRead !== null) {
            query.is_read = isRead === 'true' || isRead === true;
        }

        const [notifications, total] = await Promise.all([
            Notification.find(query)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Notification.countDocuments(query)
        ]);

        return {
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async markNotificationRead(subAdminId, notificationId) {
        const notification = await Notification.findOne({
            _id: notificationId,
            user_id: subAdminId
        });

        if (!notification) {
            throw ApiError.notFound('Notification not found');
        }

        notification.is_read = true;
        notification.read_at = new Date();
        await notification.save();

        return notification;
    }

    async markAllNotificationsRead(subAdminId) {
        await Notification.updateMany(
            { user_id: subAdminId, is_read: false },
            { is_read: true, read_at: new Date() }
        );

        return { message: 'All notifications marked as read' };
    }

    // ============ ACTIVITY LOG ============
    async getActivityLogs(subAdminId, { page = 1, limit = 10, module = null, action = null }) {
        const query = { user_id: subAdminId };

        if (module) {
            query.module = module;
        }

        if (action) {
            query.action = action;
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            AuditLog.countDocuments(query)
        ]);

        return {
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = new SubAdminService();