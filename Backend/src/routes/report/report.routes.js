// Report route definitions
// Sales report, order report, product report, user report
// Export reports (CSV, PDF, Excel), scheduled reports
// All report routes require authentication with appropriate roles

const express = require('express');
const router = express.Router();

const reportController = require('../../controllers/report/report.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const reportValidation = require('../../validations/report.validation');

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: Report management endpoints
 */

// ============ ALL REPORT ROUTES REQUIRE AUTH ============
router.use(auth);

// ============ SELLER REPORTS ============

/**
 * @swagger
 * /report/seller/sales:
 *   get:
 *     summary: Get seller sales report
 *     description: Get sales report for the authenticated seller
 *     tags: [Report]
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
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *     responses:
 *       200:
 *         description: Sales report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/seller/sales',
    authorize('seller'),
    validate(reportValidation.dateRange),
    reportController.getSellerSalesReport
);

/**
 * @swagger
 * /report/seller/orders:
 *   get:
 *     summary: Get seller order report
 *     description: Get order report for the authenticated seller
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: Order report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/seller/orders',
    authorize('seller'),
    validate(reportValidation.dateRange),
    reportController.getSellerOrderReport
);

/**
 * @swagger
 * /report/seller/products:
 *   get:
 *     summary: Get seller product report
 *     description: Get product report for the authenticated seller
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: Product report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/seller/products',
    authorize('seller'),
    validate(reportValidation.dateRange),
    reportController.getSellerProductReport
);

/**
 * @swagger
 * /report/seller/performance:
 *   get:
 *     summary: Get seller performance report
 *     description: Get performance report for the authenticated seller
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: Performance report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/seller/performance',
    authorize('seller'),
    validate(reportValidation.dateRange),
    reportController.getSellerPerformanceReport
);

// ============ ADMIN REPORTS ============

/**
 * @swagger
 * /report/admin/overview:
 *   get:
 *     summary: Get admin overview report
 *     description: Get overview report for admin dashboard
 *     tags: [Report]
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
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/overview',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    reportController.getAdminOverviewReport
);

/**
 * @swagger
 * /report/admin/revenue:
 *   get:
 *     summary: Get admin revenue report
 *     description: Get revenue report for admin
 *     tags: [Report]
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
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *     responses:
 *       200:
 *         description: Revenue report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/admin/revenue',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    validate(reportValidation.dateRange),
    reportController.getAdminRevenueReport
);

/**
 * @swagger
 * /report/admin/sellers:
 *   get:
 *     summary: Get admin seller report
 *     description: Get seller report for admin
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: Seller report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/admin/sellers',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    validate(reportValidation.dateRange),
    reportController.getAdminSellerReport
);

/**
 * @swagger
 * /report/admin/orders:
 *   get:
 *     summary: Get admin order report
 *     description: Get order report for admin
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: Order report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/admin/orders',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    validate(reportValidation.dateRange),
    reportController.getAdminOrderReport
);

/**
 * @swagger
 * /report/admin/products:
 *   get:
 *     summary: Get admin product report
 *     description: Get product report for admin
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: Product report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/admin/products',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    validate(reportValidation.dateRange),
    reportController.getAdminProductReport
);

/**
 * @swagger
 * /report/admin/users:
 *   get:
 *     summary: Get admin user report
 *     description: Get user report for admin
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: User report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/admin/users',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    validate(reportValidation.dateRange),
    reportController.getAdminUserReport
);

/**
 * @swagger
 * /report/admin/payments:
 *   get:
 *     summary: Get admin payment report
 *     description: Get payment report for admin
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: Payment report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/admin/payments',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    validate(reportValidation.dateRange),
    reportController.getAdminPaymentReport
);

// ============ SUB-ADMIN REPORTS ============

/**
 * @swagger
 * /report/sub-admin/sellers:
 *   get:
 *     summary: Get sub-admin seller report
 *     description: Get seller report for sub-admin
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: Seller report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/sub-admin/sellers',
    authorize('sub_admin'),
    checkPermission('view_reports'),
    validate(reportValidation.dateRange),
    reportController.getSubAdminSellerReport
);

/**
 * @swagger
 * /report/sub-admin/orders:
 *   get:
 *     summary: Get sub-admin order report
 *     description: Get order report for sub-admin
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: Order report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/sub-admin/orders',
    authorize('sub_admin'),
    checkPermission('view_reports'),
    validate(reportValidation.dateRange),
    reportController.getSubAdminOrderReport
);

// ============ ANALYTICS ============

/**
 * @swagger
 * /report/analytics:
 *   get:
 *     summary: Get analytics dashboard
 *     description: Get analytics dashboard data
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *           default: monthly
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics dashboard data fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/analytics',
    validate(reportValidation.analyticsQuery),
    reportController.getAnalyticsDashboard
);

/**
 * @swagger
 * /report/analytics/realtime:
 *   get:
 *     summary: Get real-time analytics
 *     description: Get real-time analytics data
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Real-time analytics fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/analytics/realtime',
    reportController.getRealtimeAnalytics
);

// ============ EXPORT REPORTS ============

/**
 * @swagger
 * /report/export/csv:
 *   get:
 *     summary: Export report to CSV
 *     description: Export report data to CSV format
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: report_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sales, orders, products, sellers, users, payments]
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
 *     responses:
 *       200:
 *         description: Report exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       422:
 *         description: Validation error
 */
router.get(
    '/export/csv',
    validate(reportValidation.exportReport),
    reportController.exportCSV
);

/**
 * @swagger
 * /report/export/pdf:
 *   get:
 *     summary: Export report to PDF
 *     description: Export report data to PDF format
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: report_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sales, orders, products, sellers, users, payments]
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
 *     responses:
 *       200:
 *         description: Report exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       422:
 *         description: Validation error
 */
router.get(
    '/export/pdf',
    validate(reportValidation.exportReport),
    reportController.exportPDF
);

/**
 * @swagger
 * /report/export/excel:
 *   get:
 *     summary: Export report to Excel
 *     description: Export report data to Excel format
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: report_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sales, orders, products, sellers, users, payments]
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
 *     responses:
 *       200:
 *         description: Report exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       422:
 *         description: Validation error
 */
router.get(
    '/export/excel',
    validate(reportValidation.exportReport),
    reportController.exportExcel
);

// ============ SCHEDULED REPORTS ============

/**
 * @swagger
 * /report/schedule:
 *   post:
 *     summary: Create scheduled report (Admin only)
 *     description: Create a scheduled report
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - report_name
 *               - report_type
 *               - schedule
 *               - recipients
 *             properties:
 *               report_name:
 *                 type: string
 *               report_type:
 *                 type: string
 *                 enum: [user_activity, role_changes, permission_changes, seller_performance, sub_admin_performance, order_analytics, revenue_report, product_report, custom]
 *               filters:
 *                 type: object
 *               columns:
 *                 type: array
 *                 items:
 *                   type: string
 *               group_by:
 *                 type: array
 *                 items:
 *                   type: string
 *               sort_by:
 *                 type: object
 *               schedule:
 *                 type: object
 *                 required:
 *                   - frequency
 *                 properties:
 *                   frequency:
 *                     type: string
 *                     enum: [once, daily, weekly, monthly, custom]
 *                   time:
 *                     type: string
 *                   day_of_week:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 6
 *                   day_of_month:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 31
 *                   custom_cron:
 *                     type: string
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     user_id:
 *                       type: string
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, csv, json]
 *                 default: pdf
 *     responses:
 *       201:
 *         description: Scheduled report created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.post(
    '/schedule',
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_reports'),
    validate(reportValidation.createSchedule),
    reportController.createScheduledReport
);

/**
 * @swagger
 * /report/schedule:
 *   get:
 *     summary: Get scheduled reports (Admin only)
 *     description: Get all scheduled reports
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: Scheduled reports fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/schedule',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    reportController.getScheduledReports
);

/**
 * @swagger
 * /report/schedule/{scheduleId}:
 *   put:
 *     summary: Update scheduled report (Admin only)
 *     description: Update an existing scheduled report
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               report_name:
 *                 type: string
 *               filters:
 *                 type: object
 *               columns:
 *                 type: array
 *               group_by:
 *                 type: array
 *               schedule:
 *                 type: object
 *               recipients:
 *                 type: array
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, csv, json]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Scheduled report updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Scheduled report not found
 *       422:
 *         description: Validation error
 */
router.put(
    '/schedule/:scheduleId',
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_reports'),
    validate(reportValidation.updateSchedule),
    reportController.updateScheduledReport
);

/**
 * @swagger
 * /report/schedule/{scheduleId}:
 *   delete:
 *     summary: Delete scheduled report (Admin only)
 *     description: Delete a scheduled report
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Scheduled report deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Scheduled report not found
 */
router.delete(
    '/schedule/:scheduleId',
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_reports'),
    validate(reportValidation.scheduleIdParam),
    reportController.deleteScheduledReport
);

/**
 * @swagger
 * /report/schedule/{scheduleId}/run:
 *   post:
 *     summary: Run scheduled report now (Admin only)
 *     description: Run a scheduled report immediately
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Report generation started successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Scheduled report not found
 */
router.post(
    '/schedule/:scheduleId/run',
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_reports'),
    validate(reportValidation.scheduleIdParam),
    reportController.runScheduledReportNow
);

// ============ CUSTOM REPORTS ============

/**
 * @swagger
 * /report/custom:
 *   post:
 *     summary: Generate custom report (Admin only)
 *     description: Generate a custom report with user-defined configuration
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               report_type:
 *                 type: string
 *               filters:
 *                 type: object
 *               columns:
 *                 type: array
 *                 items:
 *                   type: string
 *               group_by:
 *                 type: array
 *                 items:
 *                   type: string
 *               sort_by:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                   order:
 *                     type: string
 *                     enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Custom report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.post(
    '/custom',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    validate(reportValidation.customReport),
    reportController.generateCustomReport
);

/**
 * @swagger
 * /report/custom/saved:
 *   get:
 *     summary: Get saved custom reports (Admin only)
 *     description: Get all saved custom report templates
 *     tags: [Report]
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
 *     responses:
 *       200:
 *         description: Saved custom reports fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/custom/saved',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    reportController.getSavedCustomReports
);

/**
 * @swagger
 * /report/custom/save:
 *   post:
 *     summary: Save custom report template (Admin only)
 *     description: Save a custom report as a template
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - config
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               config:
 *                 type: object
 *     responses:
 *       201:
 *         description: Custom report template saved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.post(
    '/custom/save',
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_reports'),
    validate(reportValidation.saveCustomReport),
    reportController.saveCustomReportTemplate
);

/**
 * @swagger
 * /report/custom/{reportId}:
 *   get:
 *     summary: Get custom report by ID (Admin only)
 *     description: Get a specific saved custom report
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Custom report fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Custom report not found
 */
router.get(
    '/custom/:reportId',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    validate(reportValidation.reportIdParam),
    reportController.getCustomReportById
);

module.exports = router;