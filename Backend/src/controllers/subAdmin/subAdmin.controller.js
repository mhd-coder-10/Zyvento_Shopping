// Handles all sub-admin related API requests
// Manages sub-admin dashboard, profile, sellers, employees
// Also handles order management, reports, notifications, and activity logs

const subAdminService = require('../../services/subAdmin/subAdmin.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');

const subAdminController = {

    // ============ DASHBOARD ============
    getDashboard: asyncHandler(async (req, res) => {
        const subAdminId = req.subAdminId || req.userId;
        const data = await subAdminService.getDashboard(subAdminId);
        res.status(200).json(
            ApiResponse.success(data, 'Dashboard fetched successfully')
        );
    }),

    getDashboardStatistics: asyncHandler(async (req, res) => {
        const subAdminId = req.subAdminId || req.userId;
        const data = await subAdminService.getDashboardStatistics(subAdminId);
        res.status(200).json(
            ApiResponse.success(data, 'Dashboard statistics fetched successfully')
        );
    }),

    // ============ PROFILE ============
    getProfile: asyncHandler(async (req, res) => {
        const subAdminId = req.subAdminId || req.userId;
        const profile = await subAdminService.getProfile(subAdminId);
        res.status(200).json(
            ApiResponse.success(profile, 'Profile fetched successfully')
        );
    }),

    updateProfile: asyncHandler(async (req, res) => {
        const subAdminId = req.subAdminId || req.userId;
        const updateData = req.body;
        const profile = await subAdminService.updateProfile(subAdminId, updateData);
        res.status(200).json(
            ApiResponse.success(profile, 'Profile updated successfully')
        );
    }),

    // ============ SELLER MANAGEMENT ============
    getSellers: asyncHandler(async (req, res) => {
        const {
            page, limit, search, verification_status,
            account_status, business_type, sort_by, sort_order
        } = req.query;

        const result = await subAdminService.getSellers({
            page, limit, search,
            verificationStatus: verification_status,
            accountStatus: account_status,
            businessType: business_type,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.sellers,
                result.pagination,
                'Sellers fetched successfully'
            )
        );
    }),

    getSellerDetails: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const seller = await subAdminService.getSellerDetails(sellerId);
        res.status(200).json(
            ApiResponse.success(seller, 'Seller details fetched successfully')
        );
    }),

    approveSeller: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { notes } = req.body;
        const seller = await subAdminService.approveSeller(sellerId, req.userId, notes);
        res.status(200).json(
            ApiResponse.success(seller, 'Seller approved successfully')
        );
    }),

    rejectSeller: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { rejection_reason } = req.body;
        const seller = await subAdminService.rejectSeller(sellerId, rejection_reason);
        res.status(200).json(
            ApiResponse.success(seller, 'Seller rejected')
        );
    }),

    suspendSeller: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { reason } = req.body;
        const seller = await subAdminService.suspendSeller(sellerId, reason, req.userId);
        res.status(200).json(
            ApiResponse.success(seller, 'Seller suspended successfully')
        );
    }),

    // ============ EMPLOYEE MANAGEMENT ============
    getEmployees: asyncHandler(async (req, res) => {
        const { page, limit, search, seller_id, status } = req.query;
        const result = await subAdminService.getEmployees({
            page, limit, search,
            sellerId: seller_id,
            status
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.employees,
                result.pagination,
                'Employees fetched successfully'
            )
        );
    }),

    getEmployeeDetails: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const employee = await subAdminService.getEmployeeDetails(employeeId);
        res.status(200).json(
            ApiResponse.success(employee, 'Employee details fetched successfully')
        );
    }),

    // ============ ORDER MANAGEMENT ============
    getOrders: asyncHandler(async (req, res) => {
        const {
            page, limit, order_status, payment_status,
            seller_id, start_date, end_date, sort_by, sort_order
        } = req.query;

        const result = await subAdminService.getOrders({
            page, limit,
            orderStatus: order_status,
            paymentStatus: payment_status,
            sellerId: seller_id,
            startDate: start_date,
            endDate: end_date,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.orders,
                result.pagination,
                'Orders fetched successfully'
            )
        );
    }),

    getOrderDetails: asyncHandler(async (req, res) => {
        const { orderId } = req.params;
        const order = await subAdminService.getOrderDetails(orderId);
        res.status(200).json(
            ApiResponse.success(order, 'Order details fetched successfully')
        );
    }),

    // ============ REPORTS ============
    getOverviewReport: asyncHandler(async (req, res) => {
        const { period = 'monthly' } = req.query;
        const report = await subAdminService.getOverviewReport(period);
        res.status(200).json(
            ApiResponse.success(report, 'Overview report generated successfully')
        );
    }),

    getSellerPerformanceReport: asyncHandler(async (req, res) => {
        const { start_date, end_date, seller_id } = req.query;
        const report = await subAdminService.getSellerPerformanceReport({
            startDate: start_date,
            endDate: end_date,
            sellerId: seller_id
        });
        res.status(200).json(
            ApiResponse.success(report, 'Seller performance report generated successfully')
        );
    }),

    getOrderAnalyticsReport: asyncHandler(async (req, res) => {
        const { start_date, end_date, seller_id } = req.query;
        const report = await subAdminService.getOrderAnalyticsReport({
            startDate: start_date,
            endDate: end_date,
            sellerId: seller_id
        });
        res.status(200).json(
            ApiResponse.success(report, 'Order analytics report generated successfully')
        );
    }),

    // ============ NOTIFICATIONS ============
    getNotifications: asyncHandler(async (req, res) => {
        const subAdminId = req.subAdminId || req.userId;
        const { page, limit, is_read } = req.query;
        const result = await subAdminService.getNotifications(subAdminId, {
            page, limit, isRead: is_read
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.notifications,
                result.pagination,
                'Notifications fetched successfully'
            )
        );
    }),

    markNotificationRead: asyncHandler(async (req, res) => {
        const subAdminId = req.subAdminId || req.userId;
        const { notificationId } = req.params;
        const notification = await subAdminService.markNotificationRead(subAdminId, notificationId);
        res.status(200).json(
            ApiResponse.success(notification, 'Notification marked as read')
        );
    }),

    markAllNotificationsRead: asyncHandler(async (req, res) => {
        const subAdminId = req.subAdminId || req.userId;
        const result = await subAdminService.markAllNotificationsRead(subAdminId);
        res.status(200).json(
            ApiResponse.success(result, 'All notifications marked as read')
        );
    }),

    // ============ ACTIVITY LOG ============
    getActivityLogs: asyncHandler(async (req, res) => {
        const subAdminId = req.subAdminId || req.userId;
        const { page, limit, module, action } = req.query;
        const result = await subAdminService.getActivityLogs(subAdminId, {
            page, limit, module, action
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.logs,
                result.pagination,
                'Activity logs fetched successfully'
            )
        );
    })
};

module.exports = subAdminController;