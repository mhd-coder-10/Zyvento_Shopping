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
const auditService = require("../../services/audit.service");
const roleRoutes = require('./role.routes');
const permissionRoutes = require('./permission.routes');

// ============ ALL ADMIN ROUTES REQUIRE AUTH & ADMIN ROLE ============
router.use(auth);
router.use(authorize('super_admin', 'sub_admin'));

// Registration
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);

// ============ DASHBOARD ROUTES ============

router.get(
    '/dashboard/overview',
    checkPermission('DASHBOARD_READ'),
    adminController.getDashboardOverview
);

router.get(
    '/dashboard/statistics',
    checkPermission('DASHBOARD_READ'),
    adminController.getDashboardStatistics
);

router.get(
    '/dashboard/recent-activity',
    checkPermission('DASHBOARD_READ'),
    adminController.getRecentActivity
);

router.get(
    '/dashboard/charts',
    checkPermission('DASHBOARD_READ'),
    adminController.getChartsData
);

// ============ USER MANAGEMENT ROUTES ============

// Get User stats
router.get(
    '/users/stats',
    checkPermission('USERS_READ'),
    adminController.getUserStats
);

// Get Users
router.get(
    '/users',
    checkPermission('USERS_READ'),
    validate(adminValidation.getUsers),
    adminController.getAllUsers
);

// Create User
router.post(
    '/users',
    checkPermission('USERS_CREATE'),
    validate(adminValidation.createUser),
    adminController.createUser
);

// Get single user
router.get(
    '/users/:userId',
    checkPermission('USERS_READ'),
    adminController.getUserById
);

// Update user
router.put(
    '/users/:userId',
    checkPermission('USERS_UPDATE'),
    validate(adminValidation.updateUser),
    adminController.updateUser
);

// Update user status
router.patch(
    '/users/:userId/status',
    checkPermission('USERS_UPDATE'),
    validate(adminValidation.updateUserStatus),
    adminController.updateUserStatus
);

// Delete user
router.delete(
    '/users/:userId',
    checkPermission('USERS_DELETE'),
    adminController.deleteUser
);

// ============ SELLER MANAGEMENT ROUTES ============

// Get Seller Stats
router.get(
    '/sellers/stats',
    checkPermission('SELLERS_READ'),
    adminController.getSellerStats
);

// Export Sellers to CSV
router.get(
    '/sellers/export',
    checkPermission('SELLERS_READ'),
    adminController.exportSellers
);

// List All Sellers
router.get(
    '/sellers',
    checkPermission('SELLERS_READ'),
    validate(adminValidation.adminGetSellers),
    adminController.getAllSellers
);

// Get Seller Details
router.get(
    '/sellers/:sellerCode',
    checkPermission('SELLERS_READ'),
    validate(adminValidation.adminSellerIdParam),
    adminController.getSellerDetails
);

// Update Seller Details
router.put(
    '/sellers/:sellerCode',
    checkPermission('SELLERS_UPDATE'),
    validate(adminValidation.adminUpdateSeller),
    adminController.updateSellerDetails
);

// Update Seller Status
router.put(
    '/sellers/:sellerCode/status',
    checkPermission('SELLERS_UPDATE'),
    validate(adminValidation.adminUpdateSellerStatus),
    adminController.updateSellerStatus
);

// Delete Seller
router.delete(
    '/sellers/:sellerCode',
    checkPermission('SELLERS_DELETE'),
    adminController.deleteSeller
);

// ============ SUB-ADMIN ROUTES ============

// Get available users for Sub-Admin creation
router.get(
    '/sub-admins/available-users',
    checkPermission('SUB_ADMINS_READ'),
    adminController.getAvailableUsersForSubAdmin
);

// Get all Sub-Admins
router.get(
    '/sub-admins',
    checkPermission('SUB_ADMINS_READ'),
    validate(adminValidation.getAllSubAdmins, 'query'),
    adminController.getAllSubAdmins
);

// Get Sub-Admin stats
router.get(
    '/sub-admins/stats',
    checkPermission('SUB_ADMINS_READ'),
    adminController.getSubAdminStats
);

// Create Sub-Admin
router.post(
    '/sub-admins',
    checkPermission('SUB_ADMINS_CREATE'),
    validate(adminValidation.createSubAdmin),
    adminController.createSubAdmin
);

// Get Sub-Admin history
router.get(
    '/sub-admins/:subAdminCode/history',
    checkPermission('SUB_ADMINS_READ'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    adminController.getSubAdminHistory
);

// Update Sub-Admin details
router.put(
    '/sub-admins/:subAdminCode',
    checkPermission('SUB_ADMINS_UPDATE'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    validate(adminValidation.updateSubAdmin),
    adminController.updateSubAdmin
);

// Update Sub-Admin status
router.put(
    '/sub-admins/:subAdminCode/status',
    checkPermission('SUB_ADMINS_UPDATE'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    validate(adminValidation.updateSubAdminStatus),
    adminController.updateSubAdminStatus
);

// Restore deleted Sub-Admin
router.put(
    '/sub-admins/:subAdminCode/restore',
    checkPermission('SUB_ADMINS_UPDATE'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    adminController.restoreSubAdmin
);

// Delete Sub-Admin (soft)
router.delete(
    '/sub-admins/:subAdminCode',
    checkPermission('SUB_ADMINS_DELETE'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    adminController.deleteSubAdmin
);

// Get Sub-Admin by code
router.get(
    '/sub-admins/:subAdminCode',
    checkPermission('SUB_ADMINS_READ'),
    validate(adminValidation.subAdminCodeParam, 'params'),
    adminController.getSubAdminByCode
);

// ============ EMPLOYEE ROUTES ============

router.get(
    '/employees/stats',
    checkPermission('EMPLOYEES_READ'),
    adminController.getEmployeeStats
);

router.get(
    '/employees/available-users',
    checkPermission('EMPLOYEES_READ'),
    adminController.getAvailableUsersForEmployee
);

router.get(
    '/employees/deleted',
    checkPermission('EMPLOYEES_READ'),
    validate(adminValidation.getDeletedEmployees, 'query'),
    adminController.getDeletedEmployees
);

router.get(
    '/employees',
    checkPermission('EMPLOYEES_READ'),
    validate(adminValidation.getAllEmployees, 'query'),
    adminController.getAllEmployees
);

router.post(
    '/employees',
    checkPermission('EMPLOYEES_CREATE'),
    validate(adminValidation.createEmployee),
    adminController.createEmployee
);

router.put(
    '/employees/:employeeCode',
    checkPermission('EMPLOYEES_UPDATE'),
    validate(adminValidation.employeeCodeParam, 'params'),
    validate(adminValidation.updateEmployee),
    adminController.updateEmployee
);

router.put(
    '/employees/:employeeCode/status',
    checkPermission('EMPLOYEES_UPDATE'),
    validate(adminValidation.employeeCodeParam, 'params'),
    validate(adminValidation.updateEmployeeStatus),
    adminController.updateEmployeeStatus
);

router.put(
    '/employees/:employeeCode/restore',
    checkPermission('EMPLOYEES_UPDATE'),
    validate(adminValidation.employeeCodeParam, 'params'),
    adminController.restoreEmployee
);

router.delete(
    '/employees/:employeeCode',
    checkPermission('EMPLOYEES_DELETE'),
    validate(adminValidation.employeeCodeParam, 'params'),
    adminController.deleteEmployee
);

router.get(
    '/employees/:employeeCode',
    checkPermission('EMPLOYEES_READ'),
    validate(adminValidation.employeeCodeParam, 'params'),
    adminController.getEmployeeByCode
);

// ============ REVIEW MANAGEMENT ROUTES ============

router.get(
    '/reviews/stats',
    checkPermission('REVIEWS_READ'),
    adminController.getReviewStats
);

router.get(
    '/reviews',
    checkPermission('REVIEWS_READ'),
    validate(adminValidation.adminGetReviews),
    adminController.getAllReviews
);

router.get(
    '/reviews/:reviewId',
    checkPermission('REVIEWS_READ'),
    validate(adminValidation.adminReviewIdParam),
    adminController.getReviewById
);

router.put(
    '/reviews/:reviewId/moderate',
    checkPermission('REVIEWS_MANAGE'),
    validate(adminValidation.adminModerateReview),
    adminController.moderateReview
);

// ============ PRODUCT MANAGEMENT ===========

router.get(
    '/products/stats',
    checkPermission('PRODUCTS_READ'),
    adminController.getProductStats
);

router.get(
    '/products/export',
    checkPermission('PRODUCTS_READ'),
    adminController.exportProducts
);

router.get(
    '/products',
    checkPermission('PRODUCTS_READ'),
    adminController.getAllProducts
);

router.get(
    '/products/categories',
    checkPermission('PRODUCTS_READ'),
    adminController.getProductCategories
);

router.post(
    '/products',
    checkPermission('PRODUCTS_CREATE'),
    validate(adminValidation.createProduct),
    adminController.createProduct
);

router.get(
    '/products/:productCode',
    checkPermission('PRODUCTS_READ'),
    validate(adminValidation.productCodeParam),
    adminController.getProductByCode
);

router.put(
    '/products/:productCode',
    checkPermission('PRODUCTS_UPDATE'),
    validate(adminValidation.updateProduct),
    adminController.updateProductByCode
);

router.delete(
    '/products/:productCode',
    checkPermission('PRODUCTS_DELETE'),
    validate(adminValidation.productCodeParam),
    adminController.deleteProductByCode
);

router.put(
    '/products/:productCode/approve',
    checkPermission('PRODUCTS_APPROVE'),
    adminController.approveProductByCode
);

router.put(
    '/products/:productCode/reject',
    checkPermission('PRODUCTS_REJECT'),
    validate(adminValidation.rejectProduct),
    adminController.rejectProductByCode
);

router.put(
    '/products/:productCode/suspend',
    checkPermission('PRODUCTS_UPDATE'),
    validate(adminValidation.suspendProduct),
    adminController.suspendProductByCode
);

router.put(
    '/products/:productCode/activate',
    checkPermission('PRODUCTS_UPDATE'),
    adminController.activateProductByCode
);

router.get(
    '/products/:productCode/reviews',
    checkPermission('PRODUCTS_READ'),
    adminController.getProductReviewsByCode
);

router.get(
    '/products/:productCode/orders',
    checkPermission('PRODUCTS_READ'),
    adminController.getProductOrdersByCode
);

// ==================== CATEGORY MANAGEMENT ====================

router.get(
    '/categories',
    checkPermission('CATEGORIES_READ'),
    adminController.getAllCategories
);

router.post(
    '/categories',
    checkPermission('CATEGORIES_CREATE'),
    adminController.createCategory
);

router.get(
    '/categories/:idOrCode',
    checkPermission('CATEGORIES_READ'),
    adminController.getCategoryDetails
);

router.put(
    '/categories/:idOrCode',
    checkPermission('CATEGORIES_UPDATE'),
    adminController.updateCategory
);

router.delete(
    '/categories/:idOrCode',
    checkPermission('CATEGORIES_DELETE'),
    adminController.deleteCategory
);

// ============ SUB-CATEGORY ROUTES ============

router.get(
    '/sub-categories/top-categories',
    checkPermission('CATEGORIES_READ'),
    adminController.getTopCategoriesForDropdown
);

router.get(
    '/sub-categories',
    checkPermission('CATEGORIES_READ'),
    adminController.getAllSubCategories
);

router.post(
    '/sub-categories',
    checkPermission('CATEGORIES_CREATE'),
    adminController.createSubCategory
);

router.get(
    '/sub-categories/:code',
    checkPermission('CATEGORIES_READ'),
    adminController.getSubCategoryDetails
);

router.put(
    '/sub-categories/:code',
    checkPermission('CATEGORIES_UPDATE'),
    adminController.updateSubCategory
);

router.delete(
    '/sub-categories/:code',
    checkPermission('CATEGORIES_DELETE'),
    adminController.deleteSubCategory
);

// ============ INVENTORY ROUTES ============

router.get('/inventory',
    checkPermission('INVENTORY_READ'),
    adminController.getAllInventory
);

router.put('/inventory/:inventoryId/stock',
    checkPermission('INVENTORY_UPDATE'),
    adminController.updateInventoryStock
);

// ============ ORDERS ROUTES ============

router.get(
    '/orders',
    checkPermission('ORDERS_READ'),
    adminController.getAllOrders
);

router.get(
    '/orders/:orderCode',
    checkPermission('ORDERS_READ'),
    adminController.getOrderDetails
);

router.put(
    '/orders/:orderCode/status',
    checkPermission('ORDERS_UPDATE'),
    adminController.updateOrderStatus
);

// ============ ORDER-RETURN ROUTES ============

router.get(
    '/returns/export/pdf',
    checkPermission('RETURNS_READ'),
    adminController.exportReturnsPDF
);

router.get(
    '/returns',
    checkPermission('RETURNS_READ'),
    adminController.getAllReturns
);

router.get(
    '/returns/:orderCode',
    checkPermission('RETURNS_READ'),
    adminController.getReturnByOrderCode
);

router.put(
    '/returns/:orderCode/status',
    checkPermission('RETURNS_MANAGE'),
    adminController.updateReturnStatus
);

// ============ PAYMENT ROUTES ============

router.get(
    '/payments/summary',
    checkPermission('PAYMENTS_READ'),
    adminController.getFinancialSummary
);

router.get(
    '/payments/export/pdf',
    checkPermission('PAYMENTS_EXPORT'),
    adminController.exportAccountingPDF
);

router.get(
    '/payments',
    checkPermission('PAYMENTS_READ'),
    adminController.getAllPayments
);

router.get(
    '/payments/:paymentCode',
    checkPermission('PAYMENTS_READ'),
    adminController.getPaymentDetails
);

router.put(
    '/payments/:paymentCode/status',
    checkPermission('PAYMENTS_MANAGE'),
    adminController.updatePaymentStatus
);

// ============ COMPANY FINANCE ROUTES ============

router.get(
    '/finance',
    checkPermission('FINANCE_READ'),
    adminController.getFinanceEntries
);

router.post(
    '/finance',
    checkPermission('FINANCE_UPDATE'),
    adminController.addFinanceEntry
);

router.put(
    '/finance/:entryId',
    checkPermission('FINANCE_UPDATE'),
    adminController.updateFinanceEntry
);

router.delete(
    '/finance/:entryId',
    checkPermission('FINANCE_UPDATE'),
    adminController.deleteFinanceEntry
);

router.get(
    '/finance/export/pdf',
    checkPermission('FINANCE_EXPORT'),
    adminController.exportFinancePDF
);

// ============ TRANSACTION ROUTES ============

router.get(
    '/transactions/export/pdf',
    checkPermission('TRANSACTIONS_EXPORT'),
    adminController.exportTransactionsPDF
);

router.get(
    '/transactions',
    checkPermission('TRANSACTIONS_READ'),
    adminController.getAllTransactions
);

router.get(
    '/transactions/:transactionCode',
    checkPermission('TRANSACTIONS_READ'),
    adminController.getTransactionDetails
);

// ============ NOTIFICATION ROUTES ============

router.get(
    '/notifications',
    checkPermission('NOTIFICATIONS_READ'),
    adminController.getAllNotifications
);

router.post(
    '/notifications/send',
    checkPermission('NOTIFICATIONS_CREATE'),
    adminController.sendBroadcastNotification
);

router.patch(
    '/notifications/read-all',
    checkPermission('NOTIFICATIONS_READ'),
    adminController.markAllNotificationsAsRead
);

router.get(
    '/notifications/:notificationCode',
    checkPermission('NOTIFICATIONS_READ'),
    adminController.getNotificationByCode
);

router.patch(
    '/notifications/:notificationCode/read',
    checkPermission('NOTIFICATIONS_READ'),
    adminController.markNotificationAsRead
);

router.delete(
    '/notifications/:notificationCode',
    checkPermission('NOTIFICATIONS_DELETE'),
    adminController.deleteNotification
);

// ============ COUPON ROUTES ============

router.get(
    '/coupons',
    checkPermission('COUPONS_READ'),
    adminController.getAllCoupons
);

router.post(
    '/coupons',
    checkPermission('COUPONS_CREATE'),
    adminController.createCoupon
);

router.get(
    '/coupons/:code',
    checkPermission('COUPONS_READ'),
    adminController.getCouponByCode
);

router.put(
    '/coupons/:code',
    checkPermission('COUPONS_UPDATE'),
    adminController.updateCoupon
);

router.delete(
    '/coupons/:code',
    checkPermission('COUPONS_DELETE'),
    adminController.deleteCoupon
);

// ============ REPORT ROUTES ============

router.get(
    '/reports/:reportType',
    checkPermission('REPORTS_READ'),
    adminController.getReportData
);

router.get(
    '/reports/:reportType/export/pdf',
    checkPermission('REPORTS_EXPORT'),
    adminController.exportReportPDF
);

// ============ AUDIT LOGS ============

router.get(
    '/audit-logs',
    checkPermission('SETTINGS_READ'),
    adminController.getAuditLogs
);

router.get(
    '/audit-logs/:logId',
    checkPermission('SETTINGS_READ'),
    validate(adminValidation.idParam),
    adminController.getAuditLogById
);

// ============ SYSTEM SETTINGS ============

router.get(
    '/settings',
    checkPermission('SETTINGS_READ'),
    adminController.getSystemSettings
);

router.get(
    'setttings/group/:group',
    checkPermission('SETTINGS_READ'),
    adminController.getSettingsByGroup
);

router.put(
    'settings/group/:group',
    checkPermission('SETTINGS_UPDATE'),
    adminController.updateSettingsByGroup
);

module.exports = router;