// Employee route definitions
// Profile, dashboard, activities, role management, performance
// All employee routes require authentication and employee role

const express = require('express');
const router = express.Router();

const employeeController = require('../../controllers/employee/employee.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission, checkEmployeeAccess, checkSellerAccess } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const employeeValidation = require('../../validations/employee.validation');

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employee management endpoints
 */

// ============ ALL EMPLOYEE ROUTES REQUIRE AUTH ============
router.use(auth);

// ============ EMPLOYEE PROFILE (Self) ============

/**
 * @swagger
 * /employee/profile:
 *   get:
 *     summary: Get employee profile (Self)
 *     description: Get profile of the authenticated employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employee role required
 */
router.get(
    '/profile',
    authorize('seller_employee'),
    employeeController.getProfile
);

/**
 * @swagger
 * /employee/profile:
 *   put:
 *     summary: Update employee profile (Self)
 *     description: Update profile of the authenticated employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *               designation:
 *                 type: string
 *               department:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employee role required
 *       422:
 *         description: Validation error
 */
router.put(
    '/profile',
    authorize('seller_employee'),
    validate(employeeValidation.updateEmployeeProfile),
    employeeController.updateProfile
);

// ============ EMPLOYEE DASHBOARD ============

/**
 * @swagger
 * /employee/dashboard:
 *   get:
 *     summary: Get employee dashboard
 *     description: Get dashboard data for the authenticated employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employee role required
 */
router.get(
    '/dashboard',
    authorize('seller_employee'),
    employeeController.getDashboard
);

/**
 * @swagger
 * /employee/dashboard/statistics:
 *   get:
 *     summary: Get employee dashboard statistics
 *     description: Get statistics for the employee dashboard
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *           default: weekly
 *         description: Statistics period
 *     responses:
 *       200:
 *         description: Dashboard statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employee role required
 */
router.get(
    '/dashboard/statistics',
    authorize('seller_employee'),
    employeeController.getDashboardStatistics
);

// ============ EMPLOYEE ACTIVITY ============

/**
 * @swagger
 * /employee/activities:
 *   get:
 *     summary: Get employee activities (Self)
 *     description: Get activity log of the authenticated employee
 *     tags: [Employee]
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
 *     responses:
 *       200:
 *         description: Activities fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employee role required
 */
router.get(
    '/activities',
    authorize('seller_employee'),
    employeeController.getMyActivities
);

// ============ EMPLOYEE NOTIFICATIONS ============

/**
 * @swagger
 * /employee/notifications:
 *   get:
 *     summary: Get employee notifications
 *     description: Get notifications for the authenticated employee
 *     tags: [Employee]
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
 *         description: Filter by read status
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employee role required
 */
router.get(
    '/notifications',
    authorize('seller_employee'),
    employeeController.getNotifications
);

/**
 * @swagger
 * /employee/notifications/{notificationId}/read:
 *   put:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags: [Employee]
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
 *         description: Forbidden - Employee role required
 *       404:
 *         description: Notification not found
 */
router.put(
    '/notifications/:notificationId/read',
    authorize('seller_employee'),
    validate(employeeValidation.idParam),
    employeeController.markNotificationRead
);

// ============ SELLER EMPLOYEE MANAGEMENT (Seller/Admin) ============

/**
 * @swagger
 * /employee/seller/{sellerId}:
 *   get:
 *     summary: Get employees by seller
 *     description: Get all employees of a specific seller
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
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
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Seller not found
 */
router.get(
    '/seller/:sellerId',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkSellerAccess('sellerId'),
    validate(employeeValidation.sellerIdParam),
    employeeController.getEmployeesBySeller
);

/**
 * @swagger
 * /employee/{employeeId}:
 *   get:
 *     summary: Get employee by ID
 *     description: Get detailed information of a specific employee
 *     tags: [Employee]
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
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 */
router.get(
    '/:employeeId',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.employeeIdParam),
    employeeController.getEmployeeById
);

/**
 * @swagger
 * /employee/{employeeId}:
 *   put:
 *     summary: Update employee
 *     description: Update an employee's details
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_type:
 *                 type: string
 *                 enum: [product_manager, order_manager, inventory_manager, shipping_manager, customer_service_manager, marketing_manager, account_manager]
 *               designation:
 *                 type: string
 *               department:
 *                 type: string
 *               role_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Validation error
 */
router.put(
    '/:employeeId',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.updateEmployee),
    employeeController.updateEmployee
);

/**
 * @swagger
 * /employee/{employeeId}/status:
 *   patch:
 *     summary: Update employee status
 *     description: Update an employee's account status
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, blocked, pending]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Validation error
 */
router.patch(
    '/:employeeId/status',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.updateEmployeeStatus),
    employeeController.updateEmployeeStatus
);

/**
 * @swagger
 * /employee/{employeeId}:
 *   delete:
 *     summary: Delete employee
 *     description: Delete an employee (soft delete)
 *     tags: [Employee]
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
 *         description: Employee deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 */
router.delete(
    '/:employeeId',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.employeeIdParam),
    employeeController.deleteEmployee
);

// ============ EMPLOYEE ROLE MANAGEMENT ============

/**
 * @swagger
 * /employee/{employeeId}/roles:
 *   post:
 *     summary: Assign role to employee
 *     description: Assign one or more roles to an employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_ids
 *             properties:
 *               role_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Validation error
 */
router.post(
    '/:employeeId/roles',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.assignEmployeeRole),
    employeeController.assignRole
);

/**
 * @swagger
 * /employee/{employeeId}/roles/{roleId}:
 *   delete:
 *     summary: Remove role from employee
 *     description: Remove a specific role from an employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee or role not found
 */
router.delete(
    '/:employeeId/roles/:roleId',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.removeEmployeeRole),
    employeeController.removeRole
);

/**
 * @swagger
 * /employee/{employeeId}/roles:
 *   get:
 *     summary: Get employee roles
 *     description: Get all roles assigned to an employee
 *     tags: [Employee]
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
 *         description: Employee roles fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 */
router.get(
    '/:employeeId/roles',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.employeeIdParam),
    employeeController.getEmployeeRoles
);

/**
 * @swagger
 * /employee/{employeeId}/permissions:
 *   get:
 *     summary: Get employee permissions
 *     description: Get all permissions of an employee
 *     tags: [Employee]
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
 *         description: Employee permissions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 */
router.get(
    '/:employeeId/permissions',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.employeeIdParam),
    employeeController.getEmployeePermissions
);

// ============ EMPLOYEE ROLE HISTORY ============

/**
 * @swagger
 * /employee/{employeeId}/role-history:
 *   get:
 *     summary: Get employee role history
 *     description: Get role change history of an employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
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
 *         description: Role history fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 */
router.get(
    '/:employeeId/role-history',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.employeeIdParam),
    employeeController.getRoleHistory
);

// ============ EMPLOYEE ACTIVITY LOG (Admin/Seller) ============

/**
 * @swagger
 * /employee/{employeeId}/activities:
 *   get:
 *     summary: Get employee activities
 *     description: Get activity log of a specific employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
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
 *         description: Employee activities fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 */
router.get(
    '/:employeeId/activities',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.employeeIdParam),
    employeeController.getEmployeeActivities
);

// ============ EMPLOYEE PERFORMANCE (Admin/Seller) ============

/**
 * @swagger
 * /employee/{employeeId}/performance:
 *   get:
 *     summary: Get employee performance
 *     description: Get performance metrics of a specific employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *           default: monthly
 *         description: Performance period
 *     responses:
 *       200:
 *         description: Employee performance fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 */
router.get(
    '/:employeeId/performance',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.employeeIdParam),
    employeeController.getEmployeePerformance
);

// ============ EMPLOYEE REPORTS (Admin/Seller) ============

/**
 * @swagger
 * /employee/{employeeId}/reports:
 *   get:
 *     summary: Get employee reports
 *     description: Get reports of a specific employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Employee reports fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 */
router.get(
    '/:employeeId/reports',
    authorize('seller', 'super_admin', 'sub_admin'),
    checkEmployeeAccess('employeeId'),
    validate(employeeValidation.employeeIdParam),
    employeeController.getEmployeeReports
);

// ============ SUB-ADMIN ACCESS ============

/**
 * @swagger
 * /employee/all:
 *   get:
 *     summary: Get all employees (Sub-Admin)
 *     description: Get all employees across all sellers (Sub-Admin access)
 *     tags: [Employee]
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
 *         description: All employees fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/all',
    authorize('sub_admin', 'super_admin'),
    checkPermission('manage_employees'),
    validate(employeeValidation.getAllEmployees),
    employeeController.getAllEmployees
);

// ============ SUPER ADMIN ACCESS ============

/**
 * @swagger
 * /employee/super-admin/all:
 *   get:
 *     summary: Get all employees (Super Admin)
 *     description: Get all employees across all sellers (Super Admin only)
 *     tags: [Employee]
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
 *         description: All employees fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin only
 */
router.get(
    '/super-admin/all',
    authorize('super_admin'),
    checkPermission('manage_employees'),
    validate(employeeValidation.getAllEmployees),
    employeeController.getAllEmployeesSuperAdmin
);

module.exports = router;