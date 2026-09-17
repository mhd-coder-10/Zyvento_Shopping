
// Role management route definitions
// All routes require authentication and specific permissions

const express = require('express');
const router = express.Router();

const roleController = require('../../controllers/admin/role.controller');
const auth = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const adminValidation = require('../../validations/admin.validation');

// ALL ROLE ROUTES REQUIRE AUTH
router.use(auth);


// STATIC ROUTES FIRST (before dynamic /:roleId) :

// Assign roles to user - used in user module (ApiService)
router.post(
    '/assign',
    checkPermission('ROLES_ASSIGN'),
    validate(adminValidation.assignRoleToUser),
    roleController.assignRoleToUser
);

// Revoke roles from user - used in user module (ApiService))
router.post(
    '/revoke',
    checkPermission('ROLES_ASSIGN'),
    validate(adminValidation.revokeRoleFromUser),
    roleController.revokeRoleFromUser
);

// Bulk assign roles
router.post(
    '/bulk-assign',
    checkPermission('ROLES_ASSIGN'),
    validate(adminValidation.bulkAssignRoles),
    roleController.bulkAssignRoles
);

// Get user roles - used in user module (ApiService)
router.get(
    '/user/:userId',
    checkPermission('ROLES_READ'),
    validate(adminValidation.userIdParam, 'params'),
    roleController.getUserRoles
);

// Get user permissions
router.get(
    '/user/:userId/permissions',
    checkPermission('ROLES_READ'),
    validate(adminValidation.userIdParam, 'params'),
    roleController.getUserPermissions
);

// Get role change history for user
router.get(
    '/history/:userId',
    checkPermission('ROLES_READ'),
    validate(adminValidation.userIdParam, 'params'),
    roleController.getRoleHistory
);


// LIST + CREATE :

// Get all roles
router.get(
    '/',
    checkPermission('ROLES_READ'),
    roleController.getAllRoles
);

// Create role
router.post(
    '/',
    checkPermission('ROLES_CREATE'),
    validate(adminValidation.createRole),
    roleController.createRole
);


// DYNAMIC ROUTES (with :roleId) — at the end :

// Get role permissions
router.get(
    '/:roleId/permissions',
    checkPermission('ROLES_READ'),
    validate(adminValidation.idParam, 'params'),
    roleController.getRolePermissions
);


// Get users assigned to this role
router.get(
    '/:roleId/users',
    checkPermission('ROLES_READ'),
    validate(adminValidation.idParam, 'params'),
    roleController.getUsersWithRole
);

// Get role by ID
router.get(
    '/:roleId',
    checkPermission('ROLES_READ'),
    validate(adminValidation.idParam, 'params'),
    roleController.getRoleById
);

// Update role
router.put(
    '/:roleId',
    checkPermission('ROLES_UPDATE'),
    validate(adminValidation.idParam, 'params'),
    validate(adminValidation.updateRole),
    roleController.updateRole
);


// Delete role
router.delete(
    '/:roleId',
    checkPermission('ROLES_DELETE'),
    validate(adminValidation.idParam, 'params'),
    roleController.deleteRole
);

// Toggle role status
router.patch(
    '/:roleId/status',
    checkPermission('ROLES_UPDATE'),
    validate(adminValidation.idParam, 'params'),
    roleController.toggleRoleStatus
);

// Assign permissions to role
router.post(
    '/:roleId/permissions',
    checkPermission('ROLES_UPDATE'),
    validate(adminValidation.idParam, 'params'),
    roleController.assignPermissions
);

// Remove permission from role
router.delete(
    '/:roleId/permissions/:permissionId',
    checkPermission('ROLES_UPDATE'),
    validate(adminValidation.idParam, 'params'),
    roleController.removePermission
);

module.exports = router;