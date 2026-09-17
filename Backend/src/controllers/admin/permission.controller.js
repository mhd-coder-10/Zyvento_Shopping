
// Handles all permission related API requests
// Manages permission CRUD operations and permission groups
// Also handles permission audit logs and module wise permissions

const permissionService = require('../../services/admin/permission.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service');


const permissionController = {

    // ============ PERMISSION CRUD ============

    // Create permission
    createPermission: asyncHandler(async (req, res) => {
        const permission = await permissionService.createPermission(
            req.body,
            req.userId
        );

        await auditService.log({
            userId: req.userId,
            action: 'create',
            module: 'permission',
            moduleId: permission._id,
            description: `Permission created: ${permission.permission_name}`,
            newData: {
                permission_name: permission.permission_name,
                permission_key: permission.permission_key,
                module_name: permission.module_name,
                action: permission.action
            },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(201).json(
            ApiResponse.created(permission, 'Permission created successfully')
        );
    }),

    // Get all permissions
    getAllPermissions: asyncHandler(async (req, res) => {
        const { module_name, is_active, search, page, limit } = req.query;

        const result = await permissionService.getAllPermissions({
            moduleName: module_name,
            isActive: is_active,
            search,
            page,
            limit
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.permissions,
                result.pagination,
                'Permissions fetched successfully'
            )
        );
    }),

    // Get permission by ID
    getPermissionById: asyncHandler(async (req, res) => {
        const { permissionId } = req.params;
        const permission = await permissionService.getPermissionById(permissionId);
        res.status(200).json(
            ApiResponse.success(permission, 'Permission details fetched successfully')
        );
    }),

    // Get roles using this permission
    getRolesWithPermission: asyncHandler(async (req, res) => {
        const { permissionId } = req.params;
        const { page, limit, search } = req.query;

        const result = await permissionService.getRolesWithPermission(permissionId, {
            page, limit, search
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.roles,
                result.pagination,
                'Roles with this permission fetched successfully'
            )
        );
    }),

    // Update permission
    updatePermission: asyncHandler(async (req, res) => {
        const { permissionId } = req.params;

        const oldPermission = await permissionService.getPermissionById(permissionId);
        const permission = await permissionService.updatePermission(
            permissionId,
            req.body,
            req.userId
        );

        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'permission',
            moduleId: permissionId,
            description: `Permission updated: ${oldPermission.permission_name}`,
            oldData: {
                permission_name: oldPermission.permission_name,
                description: oldPermission.description,
                priority: oldPermission.priority
            },
            newData: req.body,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(permission, 'Permission updated successfully')
        );
    }),

    // Delete permission
    deletePermission: asyncHandler(async (req, res) => {
        const { permissionId } = req.params;

        const oldPermission = await permissionService.getPermissionById(permissionId);
        await permissionService.deletePermission(permissionId);

        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'permission',
            moduleId: permissionId,
            description: `Permission deleted: ${oldPermission.permission_name}`,
            oldData: {
                permission_name: oldPermission.permission_name,
                permission_key: oldPermission.permission_key
            },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(null, 'Permission deleted successfully')
        );
    }),

    // Toggle permission status (activate/deactivate)
    togglePermissionStatus: asyncHandler(async (req, res) => {
        const { permissionId } = req.params;

        const oldPermission = await permissionService.getPermissionById(permissionId);
        const permission = await permissionService.togglePermissionStatus(permissionId);

        await auditService.log({
            userId: req.userId,
            action: 'status_change',
            module: 'permission',
            moduleId: permissionId,
            description: `Permission ${permission.permission_name} ${permission.is_active ? 'activated' : 'deactivated'}`,
            oldData: { is_active: oldPermission.is_active },
            newData: { is_active: permission.is_active },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(
                permission,
                `Permission ${permission.is_active ? 'activated' : 'deactivated'} successfully`
            )
        );
    }),

    // ============ PERMISSION GROUPS ============

    // Get all permission modules
    getPermissionModules: asyncHandler(async (req, res) => {
        const modules = await permissionService.getPermissionModules();
        res.status(200).json(
            ApiResponse.success(modules, 'Permission modules fetched successfully')
        );
    }),

    // Get permissions by module
    getPermissionsByModule: asyncHandler(async (req, res) => {
        const { moduleName } = req.params;
        const permissions = await permissionService.getPermissionsByModule(moduleName);
        res.status(200).json(
            ApiResponse.success(
                permissions,
                `Permissions for module ${moduleName} fetched successfully`
            )
        );
    }),

    // Get all permission actions
    getPermissionActions: asyncHandler(async (req, res) => {
        const actions = await permissionService.getPermissionActions();
        res.status(200).json(
            ApiResponse.success(actions, 'Permission actions fetched successfully')
        );
    }),

    // ============ PERMISSION AUDIT ============

    // Get permission audit logs
    getPermissionAuditLogs: asyncHandler(async (req, res) => {
        const { page, limit, action, user_id } = req.query;

        const result = await permissionService.getPermissionAuditLogs({
            page,
            limit,
            action,
            userId: user_id
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.logs,
                result.pagination,
                'Permission audit logs fetched successfully'
            )
        );
    }),

    // Get permission audit log by ID
    getPermissionAuditById: asyncHandler(async (req, res) => {
        const { auditId } = req.params;
        const log = await permissionService.getPermissionAuditById(auditId);
        res.status(200).json(
            ApiResponse.success(log, 'Permission audit log details fetched successfully')
        );
    })
};


module.exports = permissionController;