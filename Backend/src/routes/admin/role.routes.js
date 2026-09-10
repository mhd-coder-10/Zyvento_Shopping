// Role management route definitions
// Role CRUD, permission assignment, role assignment to users
// All role routes require authentication and admin role

const express = require('express');
const router = express.Router();

const roleController = require('../../controllers/admin/role.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const adminValidation = require('../../validations/admin.validation');

/**
 * @swagger
 * tags:
 *   name: Admin Roles
 *   description: Role management endpoints
 */

// ============ ALL ROLE ROUTES REQUIRE AUTH & ADMIN ROLE ============
router.use(auth);
router.use(authorize('super_admin', 'sub_admin'));

// ============ ROLE CRUD ============

/**
 * @swagger
 * /admin/roles:
 *   post:
 *     summary: Create a new role
 *     description: Create a new role with permissions
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_name
 *               - role_key
 *               - role_type
 *             properties:
 *               role_name:
 *                 type: string
 *                 example: "Seller Manager"
 *               role_key:
 *                 type: string
 *                 example: "SELLER_MANAGER"
 *               role_type:
 *                 type: string
 *                 enum: [system, admin, sub_admin, seller, employee, customer]
 *                 example: "sub_admin"
 *               description:
 *                 type: string
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               module_access:
 *                 type: array
 *                 items:
 *                   type: object
 *               data_scope:
 *                 type: string
 *                 enum: [all, own, department, seller_only, custom]
 *                 default: "own"
 *               is_system_role:
 *                 type: boolean
 *                 default: false
 *               priority:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Role created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       409:
 *         description: Role key already exists
 */
router.post(
    '/',
    checkPermission('create_role'),
    validate(adminValidation.createRole),
    roleController.createRole
);

/**
 * @swagger
 * /admin/roles:
 *   get:
 *     summary: Get all roles
 *     description: Get paginated list of all roles
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role_type
 *         schema:
 *           type: string
 *           enum: [system, admin, sub_admin, seller, employee, customer]
 *         description: Filter by role type
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
 *         description: Roles fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
    '/',
    checkPermission('view_roles'),
    roleController.getAllRoles
);

/**
 * @swagger
 * /admin/roles/{roleId}:
 *   get:
 *     summary: Get role by ID
 *     description: Get detailed information of a specific role
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.get(
    '/:roleId',
    checkPermission('view_roles'),
    validate(adminValidation.idParam),
    roleController.getRoleById
);

/**
 * @swagger
 * /admin/roles/{roleId}:
 *   put:
 *     summary: Update role
 *     description: Update an existing role
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *               description:
 *                 type: string
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               module_access:
 *                 type: array
 *                 items:
 *                   type: object
 *               data_scope:
 *                 type: string
 *                 enum: [all, own, department, seller_only, custom]
 *               priority:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.put(
    '/:roleId',
    checkPermission('update_role'),
    validate(adminValidation.updateRole),
    roleController.updateRole
);

/**
 * @swagger
 * /admin/roles/{roleId}:
 *   delete:
 *     summary: Delete role
 *     description: Delete a role (system roles cannot be deleted)
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role assigned to users, cannot delete
 */
router.delete(
    '/:roleId',
    checkPermission('delete_role'),
    validate(adminValidation.idParam),
    roleController.deleteRole
);

/**
 * @swagger
 * /admin/roles/{roleId}/status:
 *   patch:
 *     summary: Toggle role status
 *     description: Activate or deactivate a role
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.patch(
    '/:roleId/status',
    checkPermission('update_role'),
    validate(adminValidation.idParam),
    roleController.toggleRoleStatus
);

// ============ ROLE PERMISSIONS ============

/**
 * @swagger
 * /admin/roles/{roleId}/permissions:
 *   post:
 *     summary: Assign permissions to role
 *     description: Assign multiple permissions to a role
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission_ids
 *             properties:
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Permissions assigned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.post(
    '/:roleId/permissions',
    checkPermission('assign_permissions'),
    validate(adminValidation.idParam),
    roleController.assignPermissions
);

/**
 * @swagger
 * /admin/roles/{roleId}/permissions/{permissionId}:
 *   delete:
 *     summary: Remove permission from role
 *     description: Remove a specific permission from a role
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.delete(
    '/:roleId/permissions/:permissionId',
    checkPermission('remove_permissions'),
    validate(adminValidation.idParam),
    roleController.removePermission
);

/**
 * @swagger
 * /admin/roles/{roleId}/permissions:
 *   get:
 *     summary: Get role permissions
 *     description: Get all permissions assigned to a role
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role permissions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.get(
    '/:roleId/permissions',
    checkPermission('view_roles'),
    validate(adminValidation.idParam),
    roleController.getRolePermissions
);

// ============ ROLE ASSIGNMENT ============

/**
 * @swagger
 * /admin/roles/assign:
 *   post:
 *     summary: Assign roles to user
 *     description: Assign one or more roles to a user
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - role_ids
 *             properties:
 *               user_id:
 *                 type: string
 *               role_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role assigned to user successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User or role not found
 */
router.post(
    '/assign',
    checkPermission('assign_roles'),
    validate(adminValidation.assignRoleToUser),
    roleController.assignRoleToUser
);

/**
 * @swagger
 * /admin/roles/revoke:
 *   post:
 *     summary: Revoke roles from user
 *     description: Revoke one or more roles from a user
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - role_ids
 *             properties:
 *               user_id:
 *                 type: string
 *               role_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role revoked from user successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User or role not found
 */
router.post(
    '/revoke',
    checkPermission('assign_roles'),
    validate(adminValidation.revokeRoleFromUser),
    roleController.revokeRoleFromUser
);

/**
 * @swagger
 * /admin/roles/bulk-assign:
 *   post:
 *     summary: Bulk assign roles to users
 *     description: Assign roles to multiple users at once
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignments
 *             properties:
 *               assignments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - user_id
 *                     - role_ids
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     role_ids:
 *                       type: array
 *                       items:
 *                         type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Roles assigned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post(
    '/bulk-assign',
    checkPermission('assign_roles'),
    validate(adminValidation.bulkAssignRoles),
    roleController.bulkAssignRoles
);

/**
 * @swagger
 * /admin/roles/user/{userId}:
 *   get:
 *     summary: Get user roles
 *     description: Get all roles assigned to a user
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User roles fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get(
    '/user/:userId',
    checkPermission('view_roles'),
    validate(adminValidation.userIdParam),
    roleController.getUserRoles
);

/**
 * @swagger
 * /admin/roles/user/{userId}/permissions:
 *   get:
 *     summary: Get user permissions
 *     description: Get all permissions of a user (from roles + direct)
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User permissions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get(
    '/user/:userId/permissions',
    checkPermission('view_user_permissions'),
    validate(adminValidation.userIdParam),
    roleController.getUserPermissions
);

// ============ ROLE HISTORY ============

/**
 * @swagger
 * /admin/roles/history/{userId}:
 *   get:
 *     summary: Get role history
 *     description: Get role change history of a user
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *         description: User not found
 */
router.get(
    '/history/:userId',
    checkPermission('view_role_history'),
    validate(adminValidation.userIdParam),
    roleController.getRoleHistory
);

module.exports = router;