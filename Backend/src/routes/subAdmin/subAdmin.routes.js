// Sub-admin route definitions
// Dashboard, profile, seller management, employee management
// All sub-admin routes require authentication and sub-admin role

const express = require('express');
const router = express.Router();

const subAdminController = require('../../controllers/subAdmin/subAdmin.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const adminValidation = require('../../validations/admin.validation');

/**
 * @swagger
 * tags:
 *   name: Sub-Admin
 *   description: Sub-Admin management endpoints
 */

// ============ ALL SUB-ADMIN ROUTES REQUIRE AUTH ============
router.use(auth);
router.use(authorize('sub_admin', 'super_admin'));

// ============ SUB-ADMIN DASHBOARD ============

/**
 * @swagger
 * /sub-admin/dashboard:
 *   get:
 *     summary: Get sub-admin dashboard
 *     description: Get dashboard data for the authenticated sub-admin
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.get(
    '/dashboard',
    checkPermission('view_sub_admin_dashboard'),
    subAdminController.getDashboard
);

/**
 * @swagger
 * /sub-admin/dashboard/statistics:
 *   get:
 *     summary: Get sub-admin dashboard statistics
 *     description: Get statistics for sub-admin dashboard
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.get(
    '/dashboard/statistics',
    checkPermission('view_sub_admin_dashboard'),
    subAdminController.getDashboardStatistics
);

// ============ SUB-ADMIN PROFILE ============

/**
 * @swagger
 * /sub-admin/profile:
 *   get:
 *     summary: Get sub-admin profile
 *     description: Get profile of the authenticated sub-admin
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.get(
    '/profile',
    subAdminController.getProfile
);

/**
 * @swagger
 * /sub-admin/profile:
 *   put:
 *     summary: Update sub-admin profile
 *     description: Update profile of the authenticated sub-admin
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *               designation:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       422:
 *         description: Validation error
 */
router.put(
    '/profile',
    validate(adminValidation.updateSubAdmin),
    subAdminController.updateProfile
);

// ============ SUB-ADMIN SELLER MANAGEMENT ============

/**
 * @swagger
 * /sub-admin/sellers:
 *   get:
 *     summary: Get sellers (Sub-Admin)
 *     description: Get all sellers with filters
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: verification_status
 *         schema:
 *           type: string
 *           enum: [pending, under_review, approved, rejected, suspended]
 *       - in: query
 *         name: account_status
 *         schema:
 *           type: string
 *           enum: [active, blocked, inactive, suspended]
 *       - in: query
 *         name: business_type
 *         schema:
 *           type: string
 *           enum: [individual, company, brand, partnership]
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Sellers fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.get(
    '/sellers',
    checkPermission('manage_sellers'),
    validate(adminValidation.getSellers),
    subAdminController.getSellers
);

/**
 * @swagger
 * /sub-admin/sellers/{sellerId}:
 *   get:
 *     summary: Get seller details (Sub-Admin)
 *     description: Get detailed information of a specific seller
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       404:
 *         description: Seller not found
 */
router.get(
    '/sellers/:sellerId',
    checkPermission('manage_sellers'),
    validate(adminValidation.sellerIdParam),
    subAdminController.getSellerDetails
);

/**
 * @swagger
 * /sub-admin/sellers/{sellerId}/approve:
 *   put:
 *     summary: Approve seller (Sub-Admin)
 *     description: Approve a seller account
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seller approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       404:
 *         description: Seller not found
 *       409:
 *         description: Seller not in pending state
 */
router.put(
    '/sellers/:sellerId/approve',
    checkPermission('approve_sellers'),
    validate(adminValidation.approveSeller),
    subAdminController.approveSeller
);

/**
 * @swagger
 * /sub-admin/sellers/{sellerId}/reject:
 *   put:
 *     summary: Reject seller (Sub-Admin)
 *     description: Reject a seller account with reason
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejection_reason
 *             properties:
 *               rejection_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seller rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       404:
 *         description: Seller not found
 *       409:
 *         description: Seller not in pending state
 */
router.put(
    '/sellers/:sellerId/reject',
    checkPermission('approve_sellers'),
    validate(adminValidation.rejectSeller),
    subAdminController.rejectSeller
);

/**
 * @swagger
 * /sub-admin/sellers/{sellerId}/suspend:
 *   put:
 *     summary: Suspend seller (Sub-Admin)
 *     description: Suspend a seller account with reason
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seller suspended successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       404:
 *         description: Seller not found
 */
router.put(
    '/sellers/:sellerId/suspend',
    checkPermission('suspend_sellers'),
    validate(adminValidation.suspendSeller),
    subAdminController.suspendSeller
);

// ============ SUB-ADMIN EMPLOYEE MANAGEMENT ============

/**
 * @swagger
 * /sub-admin/employees:
 *   get:
 *     summary: Get employees (Sub-Admin)
 *     description: Get all employees with filters
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, blocked, pending]
 *       - in: query
 *         name: employee_type
 *         schema:
 *           type: string
 *           enum: [product_manager, order_manager, inventory_manager, shipping_manager, customer_service_manager, marketing_manager, account_manager]
 *     responses:
 *       200:
 *         description: Employees fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.get(
    '/employees',
    checkPermission('manage_employees'),
    subAdminController.getEmployees
);

/**
 * @swagger
 * /sub-admin/employees/{employeeId}:
 *   get:
 *     summary: Get employee details (Sub-Admin)
 *     description: Get detailed information of a specific employee
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       404:
 *         description: Employee not found
 */
router.get(
    '/employees/:employeeId',
    checkPermission('manage_employees'),
    validate(adminValidation.employeeIdParam),
    subAdminController.getEmployeeDetails
);

// ============ SUB-ADMIN ORDER MANAGEMENT ============

/**
 * @swagger
 * /sub-admin/orders:
 *   get:
 *     summary: Get orders (Sub-Admin)
 *     description: Get all orders with filters
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: order_status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, packed, shipped, out_for_delivery, delivered, cancelled, returned]
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded, partially_refunded]
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.get(
    '/orders',
    checkPermission('view_orders'),
    subAdminController.getOrders
);

/**
 * @swagger
 * /sub-admin/orders/{orderId}:
 *   get:
 *     summary: Get order details (Sub-Admin)
 *     description: Get detailed information of a specific order
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       404:
 *         description: Order not found
 */
router.get(
    '/orders/:orderId',
    checkPermission('view_orders'),
    validate(adminValidation.orderIdParam),
    subAdminController.getOrderDetails
);

// ============ SUB-ADMIN REPORTS ============

/**
 * @swagger
 * /sub-admin/reports/overview:
 *   get:
 *     summary: Get overview report (Sub-Admin)
 *     description: Get overview report for sub-admin
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: Overview report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.get(
    '/reports/overview',
    checkPermission('view_reports'),
    subAdminController.getOverviewReport
);

/**
 * @swagger
 * /sub-admin/reports/seller-performance:
 *   get:
 *     summary: Get seller performance report (Sub-Admin)
 *     description: Get seller performance report for sub-admin
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller performance report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/reports/seller-performance',
    checkPermission('view_reports'),
    subAdminController.getSellerPerformanceReport
);

/**
 * @swagger
 * /sub-admin/reports/order-analytics:
 *   get:
 *     summary: Get order analytics report (Sub-Admin)
 *     description: Get order analytics report for sub-admin
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order analytics report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/reports/order-analytics',
    checkPermission('view_reports'),
    subAdminController.getOrderAnalyticsReport
);

// ============ SUB-ADMIN NOTIFICATIONS ============

/**
 * @swagger
 * /sub-admin/notifications:
 *   get:
 *     summary: Get sub-admin notifications
 *     description: Get notifications for the authenticated sub-admin
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: is_read
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.get(
    '/notifications',
    subAdminController.getNotifications
);

/**
 * @swagger
 * /sub-admin/notifications/{notificationId}/read:
 *   put:
 *     summary: Mark notification as read (Sub-Admin)
 *     description: Mark a specific notification as read
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       404:
 *         description: Notification not found
 */
router.put(
    '/notifications/:notificationId/read',
    validate(adminValidation.idParam),
    subAdminController.markNotificationRead
);

/**
 * @swagger
 * /sub-admin/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read (Sub-Admin)
 *     description: Mark all notifications as read for the sub-admin
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.put(
    '/notifications/read-all',
    subAdminController.markAllNotificationsRead
);

// ============ SUB-ADMIN ACTIVITY LOG ============

/**
 * @swagger
 * /sub-admin/activity-logs:
 *   get:
 *     summary: Get sub-admin activity logs
 *     description: Get activity logs of the authenticated sub-admin
 *     tags: [Sub-Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Activity logs fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.get(
    '/activity-logs',
    checkPermission('view_audit_logs'),
    subAdminController.getActivityLogs
);

module.exports = router;