// Permission management route definitions
// All routes require authentication and specific permissions

const express = require('express');
const router = express.Router();

const permissionController = require('../../controllers/admin/permission.controller');
const auth = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const adminValidation = require('../../validations/admin.validation');

// ALL PERMISSION ROUTES REQUIRE AUTH 
router.use(auth);


// STATIC ROUTES FIRST (before dynamic /:permissionId)

// Get all permission modules
router.get(
    '/modules',
    checkPermission('PERMISSIONS_READ'),
    permissionController.getPermissionModules
);

// Get permissions by module
router.get(
    '/module/:moduleName',
    checkPermission('PERMISSIONS_READ'),
    permissionController.getPermissionsByModule
);

// Get all permission actions
router.get(
    '/actions',
    checkPermission('PERMISSIONS_READ'),
    permissionController.getPermissionActions
);

// Get permission audit logs
router.get(
    '/audit',
    checkPermission('PERMISSIONS_READ'),
    permissionController.getPermissionAuditLogs
);

// Get permission audit log by ID
router.get(
    '/audit/:auditId',
    checkPermission('PERMISSIONS_READ'),
    validate(adminValidation.auditIdParam, 'params'),
    permissionController.getPermissionAuditById
);

// Get roles using this permission
router.get(
    '/:permissionId/roles',
    checkPermission('PERMISSIONS_READ'),
    validate(adminValidation.permissionIdParam, 'params'),
    permissionController.getRolesWithPermission
);


// LIST + CREATE

// Get all permissions
router.get(
    '/',
    checkPermission('PERMISSIONS_READ'),
    permissionController.getAllPermissions
);

// Create permission
router.post(
    '/',
    checkPermission('PERMISSIONS_CREATE'),
    validate(adminValidation.createPermission),
    permissionController.createPermission
);


// DYNAMIC ROUTES (with :permissionId) — at the end

// Get permission by ID
router.get(
    '/:permissionId',
    checkPermission('PERMISSIONS_READ'),
    validate(adminValidation.permissionIdParam, 'params'),
    permissionController.getPermissionById
);

// Update permission
router.put(
    '/:permissionId',
    checkPermission('PERMISSIONS_UPDATE'),
    validate(adminValidation.permissionIdParam, 'params'),
    validate(adminValidation.updatePermission),
    permissionController.updatePermission
);

// Delete permission
router.delete(
    '/:permissionId',
    checkPermission('PERMISSIONS_DELETE'),
    validate(adminValidation.permissionIdParam, 'params'),
    permissionController.deletePermission
);

// Toggle permission status
router.patch(
    '/:permissionId/status',
    checkPermission('PERMISSIONS_UPDATE'),
    validate(adminValidation.permissionIdParam, 'params'),
    permissionController.togglePermissionStatus
);

module.exports = router;