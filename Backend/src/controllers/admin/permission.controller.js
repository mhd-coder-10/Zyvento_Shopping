// Handles all permission related API requests
// Manages permission CRUD operations and permission groups
// Also handles permission audit logs and module wise permissions

const permissionService = require('../../services/admin/permission.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service'); // ✅ ADDED

const permissionController = {

    // ============ PERMISSION CRUD ============
    createPermission: asyncHandler(async (req, res) => {
        const permissionData = req.body;
        const permission = await permissionService.createPermission(permissionData, req.userId);
        
        // ✅ AUDIT LOG - Permission Created
        await auditService.log({
            userId: req.userId,
            action: 'create',
            module: 'permission',
            moduleId: permission._id,
            description: `Permission created: ${permission.permission_name}`,
            newData: { permission_name: permission.permission_name, permission_key: permission.permission_key },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(201).json(
            ApiResponse.created(permission, 'Permission created successfully')
        );
    }),

    getAllPermissions: asyncHandler(async (req, res) => {
        const { module_name, is_active, page, limit } = req.query;
        const result = await permissionService.getAllPermissions({
            moduleName: module_name,
            isActive: is_active,
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

    getPermissionById: asyncHandler(async (req, res) => {
        const { permissionId } = req.params;
        const permission = await permissionService.getPermissionById(permissionId);
        res.status(200).json(
            ApiResponse.success(permission, 'Permission details fetched successfully')
        );
    }),

    updatePermission: asyncHandler(async (req, res) => {
        const { permissionId } = req.params;
        const updateData = req.body;
        
        // Get old permission data for audit
        const oldPermission = await permissionService.getPermissionById(permissionId);
        
        const permission = await permissionService.updatePermission(permissionId, updateData, req.userId);
        
        // ✅ AUDIT LOG - Permission Updated
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'permission',
            moduleId: permissionId,
            description: `Permission updated: ${oldPermission.permission_name}`,
            oldData: { permission_name: oldPermission.permission_name, is_active: oldPermission.is_active },
            newData: updateData,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(permission, 'Permission updated successfully')
        );
    }),

    deletePermission: asyncHandler(async (req, res) => {
        const { permissionId } = req.params;
        
        // Get old permission data for audit
        const oldPermission = await permissionService.getPermissionById(permissionId);
        
        await permissionService.deletePermission(permissionId, req.userId);
        
        // ✅ AUDIT LOG - Permission Deleted
        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'permission',
            moduleId: permissionId,
            description: `Permission deleted: ${oldPermission.permission_name}`,
            oldData: { permission_name: oldPermission.permission_name, permission_key: oldPermission.permission_key },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(null, 'Permission deleted successfully')
        );
    }),

    togglePermissionStatus: asyncHandler(async (req, res) => {
        const { permissionId } = req.params;
        
        // Get old permission data for audit
        const oldPermission = await permissionService.getPermissionById(permissionId);
        
        const permission = await permissionService.togglePermissionStatus(permissionId, req.userId);
        
        // ✅ AUDIT LOG - Permission Status Toggle
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
            ApiResponse.success(permission, `Permission ${permission.is_active ? 'activated' : 'deactivated'} successfully`)
        );
    }),

    // ============ PERMISSION GROUPS ============
    getPermissionModules: asyncHandler(async (req, res) => {
        const modules = await permissionService.getPermissionModules();
        res.status(200).json(
            ApiResponse.success(modules, 'Permission modules fetched successfully')
        );
    }),

    getPermissionsByModule: asyncHandler(async (req, res) => {
        const { moduleName } = req.params;
        const permissions = await permissionService.getPermissionsByModule(moduleName);
        res.status(200).json(
            ApiResponse.success(permissions, `Permissions for module ${moduleName} fetched successfully`)
        );
    }),

    getPermissionActions: asyncHandler(async (req, res) => {
        const actions = await permissionService.getPermissionActions();
        res.status(200).json(
            ApiResponse.success(actions, 'Permission actions fetched successfully')
        );
    }),

    // ============ PERMISSION AUDIT ============
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

    getPermissionAuditById: asyncHandler(async (req, res) => {
        const { auditId } = req.params;
        const log = await permissionService.getPermissionAuditById(auditId);
        res.status(200).json(
            ApiResponse.success(log, 'Permission audit log details fetched successfully')
        );
    })
};

module.exports = permissionController;