// Admin main route definitions
// Dashboard, user management, seller management, sub-admin management
// All admin routes require authentication and admin role

const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/asyncHandler');

const adminController = require('../../controllers/admin/admin.controller');
const auth = require('../../middleware/auth.middleware');
const { checkSellerAccess, authorize, checkSubAdminAccess, checkPermission } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const adminValidation = require('../../validations/admin.validation');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

// ============ ALL ADMIN ROUTES REQUIRE AUTH & ADMIN ROLE ============
router.use(auth);
router.use(authorize('super_admin', 'sub_admin'));


// ============ DASHBOARD ROUTE ============

/**
 * @swagger
 * /admin/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview
 *     description: Get key metrics for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/dashboard/overview',
    checkPermission('view_admin_dashboard'),
    adminController.getDashboardOverview
);

/**
 * @swagger
 * /admin/dashboard/statistics:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Get detailed statistics for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/dashboard/statistics',
    checkPermission('view_admin_dashboard'),
    adminController.getDashboardStatistics
);

/**
 * @swagger
 * /admin/dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity
 *     description: Get recent activities for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of activities to fetch
 *     responses:
 *       200:
 *         description: Recent activity fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/dashboard/recent-activity',
    checkPermission('view_admin_dashboard'),
    adminController.getRecentActivity
);

/**
 * @swagger
 * /admin/dashboard/charts:
 *   get:
 *     summary: Get charts data
 *     description: Get chart data for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *           default: weekly
 *         description: Period for chart data
 *     responses:
 *       200:
 *         description: Charts data fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/dashboard/charts',
    checkPermission('view_admin_dashboard'),
    adminController.getChartsData
);


// ============ USER MANAGEMENT ROUTES ============

// Get User states
router.get(
    '/users/stats',
    checkPermission('view_users'),
    adminController.getUserStats
);

// Get Users
router.get(
    '/users',
    checkPermission('view_users'),
    validate(adminValidation.getUsers),
    adminController.getAllUsers
);

// Cretae User
router.post(
    '/users',
    checkPermission('create_users'),
    validate(adminValidation.createUser),
    adminController.createUser
);

// Get single user 
router.get(
    '/users/:userId',
    checkPermission('view_users'),
    adminController.getUserById
);

// update user
router.put(
    '/users/:userId',
    checkPermission('update_users'),
    validate(adminValidation.updateUser),
    adminController.updateUser
);

// update user status
router.patch(
    '/users/:userId/status',
    checkPermission('update_users'),
    validate(adminValidation.updateUserStatus),
    adminController.updateUserStatus
);

// delete user
router.delete(
    '/users/:userId',
    checkPermission('delete_users'),
    adminController.deleteUser
);

// ============ SELLER MANAGEMENT ROUTES ============

// Get Seller Stats
router.get(
    '/sellers/stats',
    checkPermission('manage_sellers'),
    adminController.getSellerStats
);

// Export Sellers to CSV
router.get(
    '/sellers/export',
    checkPermission('manage_sellers'),
    adminController.exportSellers
);

// List All Sellers
router.get(
    '/sellers',
    checkPermission('manage_sellers'),
    validate(adminValidation.adminGetSellers),
    adminController.getAllSellers
);

// Get Seller Details (Enhanced - accepts both _id and seller_code)
router.get(
    '/sellers/:sellerCode',
    checkPermission('manage_sellers'),
    validate(adminValidation.adminSellerIdParam),
    adminController.getSellerDetails
);

// Update Seller Details (Business Info)
router.put(
    '/sellers/:sellerCode',
    checkPermission('manage_sellers'),
    validate(adminValidation.adminUpdateSeller),
    adminController.updateSellerDetails
);

// Update Seller Status (Single Route - Handles all transitions)
router.put(
    '/sellers/:sellerCode/status',
    checkPermission('manage_sellers'),
    validate(adminValidation.adminUpdateSellerStatus),
    adminController.updateSellerStatus
);

// Delete Seller (Cascade - Removes seller + user + products + employees + reviews)
router.delete(
    '/sellers/:sellerCode',
    checkPermission('manage_sellers'),
    adminController.deleteSeller
);


// ============== SUB-ADMIN ROUTES ==================

// Get all Sub-Admins
router.get(
    '/sub-admins',
    checkPermission('manage_sub_admins'),
    validate(adminValidation.getAllSubAdmins, 'query'),
    adminController.getAllSubAdmins
);

// Get Sub-Admin stats
// Must be before /sub-admins/:subAdminCode to avoid matching "stats" as a code
router.get(
    '/sub-admins/stats',
    checkPermission('manage_sub_admins'),
    adminController.getSubAdminStats
);

// Get deleted Sub-Admins
// Must be before /sub-admins/:subAdminCode to avoid matching "deleted" as a code
router.get(
    '/sub-admins/deleted',
    checkPermission('manage_sub_admins'),
    validate(adminValidation.getDeletedSubAdmins, 'query'),
    adminController.getDeletedSubAdmins
);

// Create Sub-Admin
router.post(
    '/sub-admins',
    checkPermission('manage_sub_admins'),
    validate(adminValidation.createSubAdmin),
    adminController.createSubAdmin
);

// Get Sub-Admin history
router.get(
    '/sub-admins/:subAdminCode/history',
    checkPermission('manage_sub_admins'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    adminController.getSubAdminHistory
);

// Update Sub-Admin details
router.put(
    '/sub-admins/:subAdminCode',
    checkPermission('manage_sub_admins'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    validate(adminValidation.updateSubAdmin),
    adminController.updateSubAdmin
);

// Update Sub-Admin status
router.put(
    '/sub-admins/:subAdminCode/status',
    checkPermission('manage_sub_admins'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    validate(adminValidation.updateSubAdminStatus),
    adminController.updateSubAdminStatus
);

// Restore deleted Sub-Admin
router.put(
    '/sub-admins/:subAdminCode/restore',
    checkPermission('manage_sub_admins'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    adminController.restoreSubAdmin
);

// Delete Sub-Admin (soft delete)
router.delete(
    '/sub-admins/:subAdminCode',
    checkPermission('manage_sub_admins'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    adminController.deleteSubAdmin
);

// Get Sub-Admin by code
// Must be last among /sub-admins/:subAdminCode patterns
router.get(
    '/sub-admins/:subAdminCode',
    checkPermission('manage_sub_admins'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    adminController.getSubAdminByCode
);


// ============ REVIEW MANAGEMENT ROUTES ============

// Get Review Stats
router.get(
    '/reviews/stats',
    checkPermission('manage_reviews'),
    adminController.getReviewStats
);

// List All Reviews
router.get(
    '/reviews',
    checkPermission('manage_reviews'),
    validate(adminValidation.adminGetReviews),
    adminController.getAllReviews
);

// Get Review Details
router.get(
    '/reviews/:reviewId',
    checkPermission('manage_reviews'),
    validate(adminValidation.adminReviewIdParam),
    adminController.getReviewById
);

// Moderate Review
router.put(
    '/reviews/:reviewId/moderate',
    checkPermission('manage_reviews'),
    validate(adminValidation.adminModerateReview),
    adminController.moderateReview
);





// // ============ EMPLOYEE MANAGEMENT ============

// // Employee Stats
// router.get(
//     '/employees/stats',
//     checkPermission('manage_employees'),
//     adminController.getEmployeeStats
// );

// // Export Employees
// router.get(
//     '/employees/export',
//     checkPermission('manage_employees'),
//     adminController.exportEmployees);

// // Get All Employees
// router.get(
//     '/employees',
//     checkPermission('manage_employees'),
//     adminController.getAllEmployees
// );

// // Create Employee
// router.post(
//     '/employees',
//     checkPermission('manage_employees'),
//     validate(adminValidation.createEmployee),
//     adminController.createEmployee
// );

// // Transfer Employee to Another Seller
// router.put(
//     '/employees/:employeeId/transfer',
//     checkPermission('manage_employees'),
//     validate(adminValidation.transferEmployee),
//     adminController.transferEmployeeToSeller
// );

// // Upload Profile Image
// router.post(
//     '/employees/:employeeId/profile-image',
//     checkPermission('manage_employees'),
//     adminController.uploadEmployeeProfileImage
// );

// // Get Employee by ID
// router.get(
//     '/employees/:employeeId',
//     checkPermission('manage_employees'),
//     validate(adminValidation.employeeIdParam),
//     adminController.getEmployeeById
// );

// // Update Employee
// router.put(
//     '/employees/:employeeId',
//     checkPermission('manage_employees'),
//     validate(adminValidation.updateEmployee),
//     adminController.updateEmployee
// );

// // Delete Employee
// router.delete(
//     '/employees/:employeeId',
//     checkPermission('manage_employees'),
//     validate(adminValidation.employeeIdParam),
//     adminController.deleteEmployee
// );

// // Update Employee Status
// router.patch(
//     '/employees/:employeeId/status',
//     checkPermission('manage_employees'),
//     validate(adminValidation.updateEmployeeStatus),
//     adminController.updateEmployeeStatus
// );

// // Get Employee Performance
// router.get(
//     '/employees/:employeeId/performance',
//     checkPermission('manage_employees'),
//     adminController.getEmployeePerformance
// );

// //  Get Employee Transactions
// router.get(
//     '/employees/:employeeId/transactions',
//     checkPermission('manage_employees'),
//     adminController.getEmployeeTransactions
// );

// //  Get Employee Sellers (Current & Past)
// router.get(
//     '/employees/:employeeId/sellers',
//     checkPermission('manage_employees'),
//     adminController.getEmployeeSellers
// );

// //  Get Employee Career History
// router.get(
//     '/employees/:employeeId/career-history',
//     checkPermission('manage_employees'),
//     adminController.getEmployeeCareerHistory
// );

// //  Get Employee Reports (Filter by Month/Year)
// router.get(
//     '/employees/:employeeId/reports',
//     checkPermission('manage_employees'),
//     adminController.getEmployeeReports
// );

// // Get Employee Roles
// router.get(
//     '/employees/:employeeId/roles',
//     checkPermission('manage_employees'),
//     adminController.getEmployeeRoles
// );

// // Assign Role to Employee
// router.post(
//     '/employees/:employeeId/roles',
//     checkPermission('manage_employees'),
//     adminController.assignEmployeeRole
// );

// // Remove Role from Employee
// router.delete(
//     '/employees/:employeeId/roles/:roleId',
//     checkPermission('manage_employees'),
//     adminController.removeEmployeeRole
// );

// // Get Employee Activity Logs
// router.get(
//     '/employees/:employeeId/activity-logs',
//     checkPermission('manage_employees'),
//     adminController.getEmployeeActivityLogs
// );


// ============ EMPLOYEE ROUTES ============

// Stats (before dynamic routes)
router.get(
    '/employees/stats',
    checkPermission('manage_employees'),
    adminController.getEmployeeStats
);

// Available users for employee creation
router.get(
    '/employees/available-users',
    checkPermission('manage_employees'),
    adminController.getAvailableUsersForEmployee
);

// Deleted list (before dynamic routes)
router.get(
    '/employees/deleted',
    checkPermission('manage_employees'),
    validate(adminValidation.getDeletedEmployees, 'query'),
    adminController.getDeletedEmployees
);

// List
router.get(
    '/employees',
    checkPermission('manage_employees'),
    validate(adminValidation.getAllEmployees, 'query'),
    adminController.getAllEmployees
);

// Create
router.post(
    '/employees',
    checkPermission('manage_employees'),
    validate(adminValidation.createEmployee),
    adminController.createEmployee
);

// Update
router.put(
    '/employees/:employeeCode',
    checkPermission('manage_employees'),
    validate(adminValidation.employeeCodeParam, 'params'),
    validate(adminValidation.updateEmployee),
    adminController.updateEmployee
);

// Status
router.put(
    '/employees/:employeeCode/status',
    checkPermission('manage_employees'),
    validate(adminValidation.employeeCodeParam, 'params'),
    validate(adminValidation.updateEmployeeStatus),
    adminController.updateEmployeeStatus
);

// Restore
router.put(
    '/employees/:employeeCode/restore',
    checkPermission('manage_employees'),
    validate(adminValidation.employeeCodeParam, 'params'),
    adminController.restoreEmployee
);

// Delete (soft)
router.delete(
    '/employees/:employeeCode',
    checkPermission('manage_employees'),
    validate(adminValidation.employeeCodeParam, 'params'),
    adminController.deleteEmployee
);

// Details (LAST — catch-all)
router.get(
    '/employees/:employeeCode',
    checkPermission('manage_employees'),
    validate(adminValidation.employeeCodeParam, 'params'),
    adminController.getEmployeeByCode
);




// ============ PRODUCT MANAGEMENT  ===========

// Product Stats
router.get(
    '/products/stats',
    checkPermission('manage_products'),
    adminController.getProductStats
);

// Export Products
router.get(
    '/products/export',
    checkPermission('manage_products'),
    adminController.exportProducts
);

// Get All Products
router.get(
    '/products',
    checkPermission('manage_products'),
    adminController.getAllProducts
);

// Get Categories for Dropdown
router.get(
    '/products/categories',
    checkPermission('manage_products'),
    adminController.getProductCategories
);

// Create Product
router.post(
    '/products',
    checkPermission('manage_products'),
    validate(adminValidation.createProduct),
    adminController.createProduct
);

// Get Product by Code
router.get(
    '/products/:productCode',
    checkPermission('manage_products'),
    validate(adminValidation.productCodeParam),
    adminController.getProductByCode
);

// Update Product by Code
router.put(
    '/products/:productCode',
    checkPermission('manage_products'),
    validate(adminValidation.updateProduct),
    adminController.updateProductByCode
);

// Delete Product by Code
router.delete(
    '/products/:productCode',
    checkPermission('manage_products'),
    validate(adminValidation.productCodeParam),
    adminController.deleteProductByCode
);

// Approve Product by Code
router.put(
    '/products/:productCode/approve',
    checkPermission('approve_products'),
    adminController.approveProductByCode
);

// Reject Product by Code
router.put(
    '/products/:productCode/reject',
    checkPermission('approve_products'),
    validate(adminValidation.rejectProduct),
    adminController.rejectProductByCode
);

// Suspend Product by Code
router.put(
    '/products/:productCode/suspend',
    checkPermission('manage_products'),
    validate(adminValidation.suspendProduct),
    adminController.suspendProductByCode
);

// Activate Product by Code
router.put(
    '/products/:productCode/activate',
    checkPermission('manage_products'),
    adminController.activateProductByCode
);

// Get Product Reviews by Code
router.get(
    '/products/:productCode/reviews',
    checkPermission('manage_products'),
    adminController.getProductReviewsByCode
);

// Get Product Orders by Code
router.get(
    '/products/:productCode/orders',
    checkPermission('manage_products'),
    adminController.getProductOrdersByCode
);

// ==================== CATEGORY MANAGEMENT ====================

// Routes
router.get(
    '/categories',
    checkPermission('manage_categories'),
    adminController.getAllCategories
);

router.post(
    '/categories',
    checkPermission('manage_categories'),
    adminController.createCategory
);

router.get(
    '/categories/:idOrCode',
    checkPermission('manage_categories'),
    adminController.getCategoryDetails
);

router.put(
    '/categories/:idOrCode',
    checkPermission('manage_categories'),
    adminController.updateCategory
);

router.delete(
    '/categories/:idOrCode',
    checkPermission('manage_categories'),
    adminController.deleteCategory
);

// ============ SUB-CATEGORY ROUTES ============

router.get(
    '/sub-categories/top-categories',
    checkPermission('manage_categories'),
    adminController.getTopCategoriesForDropdown
);

router.get(
    '/sub-categories',
    checkPermission('manage_categories'),
    adminController.getAllSubCategories
);

router.post(
    '/sub-categories',
    checkPermission('manage_categories'),
    adminController.createSubCategory
);

router.get(
    '/sub-categories/:code',
    checkPermission('manage_categories'),
    adminController.getSubCategoryDetails
);

router.put(
    '/sub-categories/:code',
    checkPermission('manage_categories'),
    adminController.updateSubCategory
);

router.delete(
    '/sub-categories/:code',
    checkPermission('manage_categories'),
    adminController.deleteSubCategory
);

// ============ INVENTORY ROUTES ============

router.get('/inventory',
    checkPermission('view_inventory'),
    adminController.getAllInventory
);

router.put('/inventory/:inventoryId/stock',
    checkPermission('manage_inventory'),
    adminController.updateInventoryStock
);

// ============ ORDERS ROUTES ============
router.get(
    '/orders',
    checkPermission('view_orders'), adminController.getAllOrders
);

router.get(
    '/orders/:orderCode',
    checkPermission('view_orders'),
    adminController.getOrderDetails
);

router.put(
    '/orders/:orderCode/status',
    checkPermission('manage_orders'),
    adminController.updateOrderStatus
);

// ============ ORDER-RETURN ROUTES ============

// Static route must be declared first
router.get(
    '/returns/export/pdf',
    checkPermission('view_returns'),
    adminController.exportReturnsPDF
);

// Dynamic routes
router.get(
    '/returns',
    checkPermission('view_returns'),
    adminController.getAllReturns
);

// RETURN - ORDER DETAILS
router.get(
    '/returns/:orderCode',
    checkPermission('view_returns'),
    adminController.getReturnByOrderCode
);

// RETURN ORTDER STATUS
router.put(
    '/returns/:orderCode/status',
    checkPermission('manage_returns'),
    adminController.updateReturnStatus
);

// ============ REVIEW ROUTES ============

// Static Routes First!
// router.get(
//     '/reviews/dashboard',
//     checkPermission('reviews.view'),
//     adminController.getReviewDashboard
// );

// router.get(
//     '/reviews/analytics',
//     checkPermission('reviews.analytics'),
//     adminController.getReviewAnalytics
// );

// router.get(
//     '/reviews/reports',
//     checkPermission('reviews.reports'),
//     adminController.getAllReviewReports
// );

// // Main List Route
// router.get(
//     '/reviews',
//     checkPermission('reviews.view'),
//     adminController.getAllReviews
// );

// // Dynamic Routes (Uses review_code now, not _id)
// router.get(
//     '/reviews/:reviewCode',
//     checkPermission('reviews.view'),
//     adminController.getReviewDetails
// );

// // moderate review
// router.patch(
//     '/reviews/:reviewCode/status',
//     checkPermission('reviews.moderate'),
//     adminController.moderateReview
// );

// router.patch(
//     '/reviews/reports/:reviewCode',
//     checkPermission('reviews.reports'),
//     adminController.updateReviewReport
// );

// ============ PAYMENT ROUTES ============

// Financial Summury
router.get(
    '/payments/summary',
    checkPermission('view_payments'),
    adminController.getFinancialSummary
);

// Export PDF
router.get(
    '/payments/export/pdf',
    checkPermission('view_payments'),
    adminController.exportAccountingPDF
);

//All Payments
router.get(
    '/payments',
    checkPermission('view_payments'),
    adminController.getAllPayments
);

// Payment Details
router.get(
    '/payments/:paymentCode',
    checkPermission('view_payments'),
    adminController.getPaymentDetails
);

// Update payment Status
router.put(
    '/payments/:paymentCode/status',
    checkPermission('manage_payments'),
    adminController.updatePaymentStatus
);


// ============ COMPANY FINANCE ROUTES ============
router.get(
    '/finance',
    checkPermission('view_payments'),
    adminController.getFinanceEntries
);

router.post(
    '/finance',
    checkPermission('manage_payments'),
    adminController.addFinanceEntry
);

router.put(
    '/finance/:entryId',
    checkPermission('manage_payments'),
    adminController.updateFinanceEntry
);

router.delete(
    '/finance/:entryId',
    checkPermission('manage_payments'),
    adminController.deleteFinanceEntry
);

router.get(
    '/finance/export/pdf',
    checkPermission('view_payments'),
    adminController.exportFinancePDF
);


// ============ TRANSACTION ROUTES ============

// Export Report
router.get(
    '/transactions/export/pdf',
    checkPermission('view_transactions'),
    adminController.exportTransactionsPDF
);

//  All transactions
router.get(
    '/transactions',
    checkPermission('view_transactions'),
    adminController.getAllTransactions
);

// Transaction Details
router.get(
    '/transactions/:transactionCode',
    checkPermission('view_transactions'),
    adminController.getTransactionDetails
);


// ============ NOTIFICATION ROUTES ============

router.get(
    '/notifications',
    checkPermission('view_notifications'),
    adminController.getAllNotifications
);

router.post(
    '/notifications/send',
    checkPermission('send_notifications'),
    adminController.sendBroadcastNotification
);

router.patch(
    '/notifications/read-all',
    checkPermission('view_notifications'),
    adminController.markAllNotificationsAsRead
);

router.get(
    '/notifications/:notificationCode',
    checkPermission('view_notifications'),
    adminController.getNotificationByCode
);

router.patch(
    '/notifications/:notificationCode/read',
    checkPermission('view_notifications'),
    adminController.markNotificationAsRead
);

router.delete(
    '/notifications/:notificationCode',
    checkPermission('delete_notifications'),
    adminController.deleteNotification
);


// ============ COUPON ROUTES ============

router.get(
    '/coupons',
    checkPermission('view_coupons'),
    adminController.getAllCoupons
);

router.post(
    '/coupons',
    checkPermission('manage_coupons'),
    adminController.createCoupon
);

router.get(
    '/coupons/:code',
    checkPermission('view_coupons'),
    adminController.getCouponByCode
);

router.put(
    '/coupons/:code',
    checkPermission('manage_coupons'),
    adminController.updateCoupon
);

router.delete(
    '/coupons/:code',
    checkPermission('manage_coupons'),
    adminController.deleteCoupon
);


// ============ REPORT ROUTES ============

router.get(
    '/reports/:reportType',
    checkPermission('view_reports'),
    adminController.getReportData
);

router.get(
    '/reports/:reportType/export/pdf',
    checkPermission('view_reports'),
    adminController.exportReportPDF
);










// ============ AUDIT LOGS ============

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: Get paginated list of system audit logs
 *     tags: [Admin]
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
 *         description: Filter by module
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: user_type
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
 *     responses:
 *       200:
 *         description: Audit logs fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/audit-logs',
    checkPermission('view_audit_logs'),
    adminController.getAuditLogs
);

/**
 * @swagger
 * /admin/audit-logs/{logId}:
 *   get:
 *     summary: Get audit log by ID
 *     description: Get detailed information of a specific audit log
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit log ID
 *     responses:
 *       200:
 *         description: Audit log details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Audit log not found
 */
router.get(
    '/audit-logs/:logId',
    checkPermission('view_audit_logs'),
    validate(adminValidation.idParam),
    adminController.getAuditLogById
);

// ============ SYSTEM SETTINGS ============

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: Get system settings
 *     description: Get all system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *         description: Filter by setting group
 *     responses:
 *       200:
 *         description: System settings fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/settings',
    checkPermission('manage_settings'),
    adminController.getSystemSettings
);

/**
 * @swagger
 * /admin/settings/{key}:
 *   put:
 *     summary: Update system setting
 *     description: Update a specific system setting
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 description: New value for the setting
 *     responses:
 *       200:
 *         description: Setting updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Setting not found
 */
// router.put(
//     '/settings/:key',
//     checkPermission('manage_settings'),
//     adminController.updateSystemSetting
// );

/**
 * @swagger
 * /admin/settings/group/{group}:
 *   get:
 *     summary: Get settings by group
 *     description: Get system settings filtered by group
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting group
 *     responses:
 *       200:
 *         description: Settings by group fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    'setttings/group/:group',
    checkPermission('manage_settings'),
    adminController.getSettingsByGroup
);

router.put(
    'settings/group/:group',
    checkPermission('manage_settings'),
    adminController.updateSettingsByGroup
);

module.exports = router;