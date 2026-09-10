// // Permission management route definitions
// // Permission CRUD, module wise permissions, permission groups
// // All permission routes require authentication and admin role

const express = require('express');
const router = express.Router();

const permissionController = require('../../controllers/admin/permission.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const adminValidation = require('../../validations/admin.validation');

/**
 * @swagger
 * tags:
 *   name: Admin Permissions
 *   description: Permission management endpoints
 */

// ============ ALL PERMISSION ROUTES REQUIRE AUTH & ADMIN ROLE ============
router.use(auth);
router.use(authorize('super_admin', 'sub_admin'));

// ============ PERMISSION CRUD ============

/**
 * @swagger
 * /admin/permissions:
 *   post:
 *     summary: Create a new permission
 *     description: Create a new permission for a module
 *     tags: [Admin Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission_name
 *               - permission_key
 *               - module_name
 *               - action
 *             properties:
 *               permission_name:
 *                 type: string
 *                 example: Create Product
 *               permission_key:
 *                 type: string
 *                 example: CREATE_PRODUCT
 *               module_name:
 *                 type: string
 *                 example: product
 *               sub_module:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [create, read, update, delete, manage, approve, reject, export, import, view_all, view_own]
 *                 example: create
 *               description:
 *                 type: string
 *               is_system:
 *                 type: boolean
 *                 default: false
 *               priority:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       409:
 *         description: Permission key already exists
 */
router.post(
    '/',
    checkPermission('create_permission'),
    validate(adminValidation.createPermission),
    permissionController.createPermission
);

/**
 * @swagger
 * /admin/permissions:
 *   get:
 *     summary: Get all permissions
 *     description: Get paginated list of all permissions
 *     tags: [Admin Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module_name
 *         schema:
 *           type: string
 *         description: Filter by module name
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
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
 *         description: Permissions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/',
    checkPermission('view_permissions'),
    permissionController.getAllPermissions
);

/**
 * @swagger
 * /admin/permissions/{permissionId}:
 *   get:
 *     summary: Get permission by ID
 *     description: Get detailed information of a specific permission
 *     tags: [Admin Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Permission not found
 */
router.get(
    '/:permissionId',
    checkPermission('view_permissions'),
    validate(adminValidation.idParam),
    permissionController.getPermissionById
);

/**
 * @swagger
 * /admin/permissions/{permissionId}:
 *   put:
 *     summary: Update permission
 *     description: Update an existing permission
 *     tags: [Admin Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permission_name:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Permission not found
 */
router.put(
    '/:permissionId',
    checkPermission('update_permission'),
    validate(adminValidation.updatePermission),
    permissionController.updatePermission
);

/**
 * @swagger
 * /admin/permissions/{permissionId}:
 *   delete:
 *     summary: Delete permission
 *     description: Delete a permission (system permissions cannot be deleted)
 *     tags: [Admin Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Permission not found
 *       409:
 *         description: Permission assigned to roles, cannot delete
 */
router.delete(
    '/:permissionId',
    checkPermission('delete_permission'),
    validate(adminValidation.idParam),
    permissionController.deletePermission
);

/**
 * @swagger
 * /admin/permissions/{permissionId}/status:
 *   patch:
 *     summary: Toggle permission status
 *     description: Activate or deactivate a permission
 *     tags: [Admin Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Permission not found
 */
router.patch(
    '/:permissionId/status',
    checkPermission('update_permission'),
    validate(adminValidation.idParam),
    permissionController.togglePermissionStatus
);

// ============ PERMISSION GROUPS ============

/**
 * @swagger
 * /admin/permissions/modules:
 *   get:
 *     summary: Get all permission modules
 *     description: Get list of all modules that have permissions
 *     tags: [Admin Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission modules fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/modules',
    checkPermission('view_permissions'),
    permissionController.getPermissionModules
);

/**
 * @swagger
 * /admin/permissions/module/{moduleName}:
 *   get:
 *     summary: Get permissions by module
 *     description: Get all permissions for a specific module
 *     tags: [Admin Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleName
 *         required: true
 *         schema:
 *           type: string
 *         description: Module name
 *     responses:
 *       200:
 *         description: Permissions by module fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Module not found
 */
router.get(
    '/module/:moduleName',
    checkPermission('view_permissions'),
    permissionController.getPermissionsByModule
);

/**
 * @swagger
 * /admin/permissions/actions:
 *   get:
 *     summary: Get all permission actions
 *     description: Get list of all available permission actions
 *     tags: [Admin Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission actions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/actions',
    checkPermission('view_permissions'),
    permissionController.getPermissionActions
);

// ============ PERMISSION AUDIT ============

/**
 * @swagger
 * /admin/permissions/audit:
 *   get:
 *     summary: Get permission audit logs
 *     description: Get paginated list of permission audit logs
 *     tags: [Admin Permissions]
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
 *         name: action
 *         schema:
 *           type: string
 *           enum: [role_created, role_updated, role_deleted, permission_created, permission_updated, permission_deleted, permission_assigned, permission_revoked, role_assigned, role_revoked, scope_changed]
 *         description: Filter by action
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by user
 *     responses:
 *       200:
 *         description: Permission audit logs fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/audit',
    checkPermission('view_permission_audit'),
    permissionController.getPermissionAuditLogs
);

/**
 * @swagger
 * /admin/permissions/audit/{auditId}:
 *   get:
 *     summary: Get permission audit log by ID
 *     description: Get detailed information of a specific permission audit log
 *     tags: [Admin Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: auditId
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit log ID
 *     responses:
 *       200:
 *         description: Permission audit log details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Audit log not found
 */
router.get(
    '/audit/:auditId',
    checkPermission('view_permission_audit'),
    validate(adminValidation.idParam),
    permissionController.getPermissionAuditById
);

module.exports = router;