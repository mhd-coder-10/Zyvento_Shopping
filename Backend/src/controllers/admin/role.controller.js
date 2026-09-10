// Handles all role related API requests
// Manages role CRUD operations, permission assignment, role history
// Also handles role assignment to users and user permissions view  

const roleService = require('../../services/admin/role.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service'); 

const roleController = {

    // ============ ROLE CRUD ============
    createRole: asyncHandler(async (req, res) => {
        const roleData = req.body;
        const role = await roleService.createRole(roleData, req.userId);

        // ✅ AUDIT LOG - Role Creation
        await auditService.log({
            userId: req.userId,
            action: 'create',
            module: 'role',
            moduleId: role._id,
            description: `Role created: ${role.role_name}`,
            newData: { role_name: role.role_name, role_key: role.role_key, role_type: role.role_type },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(201).json(
            ApiResponse.created(role, 'Role created successfully')
        );
    }),

    getAllRoles: asyncHandler(async (req, res) => {
        const { role_type, is_active, page, limit } = req.query;
        const result = await roleService.getAllRoles({
            roleType: role_type,
            isActive: is_active,
            page,
            limit
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.roles,
                result.pagination,
                'Roles fetched successfully'
            )
        );
    }),

    getRoleById: asyncHandler(async (req, res) => {
        const { roleId } = req.params;
        const role = await roleService.getRoleById(roleId);
        res.status(200).json(
            ApiResponse.success(role, 'Role details fetched successfully')
        );
    }),

    updateRole: asyncHandler(async (req, res) => {
        const { roleId } = req.params;
        const updateData = req.body;

        // Get old role data for audit
        const oldRole = await roleService.getRoleById(roleId);

        const role = await roleService.updateRole(roleId, updateData, req.userId);

        // ✅ AUDIT LOG - Role Update
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'role',
            moduleId: roleId,
            description: `Role updated: ${oldRole.role_name}`,
            oldData: { role_name: oldRole.role_name, role_key: oldRole.role_key, is_active: oldRole.is_active },
            newData: updateData,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(role, 'Role updated successfully')
        );
    }),

    deleteRole: asyncHandler(async (req, res) => {
        const { roleId } = req.params;

        // Get old role data for audit
        const oldRole = await roleService.getRoleById(roleId);

        await roleService.deleteRole(roleId, req.userId);

        // ✅ AUDIT LOG - Role Delete
        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'role',
            moduleId: roleId,
            description: `Role deleted: ${oldRole.role_name}`,
            oldData: { role_name: oldRole.role_name, role_key: oldRole.role_key },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(null, 'Role deleted successfully')
        );
    }),

    toggleRoleStatus: asyncHandler(async (req, res) => {
        const { roleId } = req.params;

        // Get old role data for audit
        const oldRole = await roleService.getRoleById(roleId);

        const role = await roleService.toggleRoleStatus(roleId, req.userId);

        // ✅ AUDIT LOG - Role Status Toggle
        await auditService.log({
            userId: req.userId,
            action: 'status_change',
            module: 'role',
            moduleId: roleId,
            description: `Role ${role.role_name} ${role.is_active ? 'activated' : 'deactivated'}`,
            oldData: { is_active: oldRole.is_active },
            newData: { is_active: role.is_active },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(role, `Role ${role.is_active ? 'activated' : 'deactivated'} successfully`)
        );
    }),

    // ============ ROLE PERMISSIONS ============
    assignPermissions: asyncHandler(async (req, res) => {
        const { roleId } = req.params;
        const { permission_ids } = req.body;

        // Get old role data for audit
        const oldRole = await roleService.getRoleById(roleId);

        const role = await roleService.assignPermissions(roleId, permission_ids, req.userId);

        // ✅ AUDIT LOG - Permissions Assigned
        await auditService.log({
            userId: req.userId,
            action: 'assign_permissions',
            module: 'role',
            moduleId: roleId,
            description: `Permissions assigned to role: ${role.role_name}`,
            oldData: { permission_ids: oldRole.permission_ids || [] },
            newData: { permission_ids: permission_ids },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(role, 'Permissions assigned successfully')
        );
    }),

    removePermission: asyncHandler(async (req, res) => {
        const { roleId, permissionId } = req.params;

        // Get old role data for audit
        const oldRole = await roleService.getRoleById(roleId);

        const role = await roleService.removePermission(roleId, permissionId, req.userId);

        // ✅ AUDIT LOG - Permission Removed
        await auditService.log({
            userId: req.userId,
            action: 'remove_permission',
            module: 'role',
            moduleId: roleId,
            description: `Permission removed from role: ${role.role_name}`,
            oldData: { permission_ids: oldRole.permission_ids || [] },
            newData: { permission_ids: role.permission_ids || [] },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(role, 'Permission removed successfully')
        );
    }),

    getRolePermissions: asyncHandler(async (req, res) => {
        const { roleId } = req.params;
        const permissions = await roleService.getRolePermissions(roleId);
        res.status(200).json(
            ApiResponse.success(permissions, 'Role permissions fetched successfully')
        );
    }),

    // ============ ROLE ASSIGNMENT ============
    assignRoleToUser: asyncHandler(async (req, res) => {
        const { user_id, role_ids, reason } = req.body;
        const result = await roleService.assignRoleToUser(user_id, role_ids, req.userId, reason);

        // ✅ AUDIT LOG - Role Assigned to User
        await auditService.log({
            userId: req.userId,
            action: 'assign_role',
            module: 'user',
            moduleId: user_id,
            description: `Roles assigned to user: ${result.user_id}`,
            newData: { role_ids, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Role assigned to user successfully')
        );
    }),

    revokeRoleFromUser: asyncHandler(async (req, res) => {
        const { user_id, role_ids, reason } = req.body;
        const result = await roleService.revokeRoleFromUser(user_id, role_ids, req.userId, reason);

        // ✅ AUDIT LOG - Role Revoked from User
        await auditService.log({
            userId: req.userId,
            action: 'revoke_role',
            module: 'user',
            moduleId: user_id,
            description: `Roles revoked from user: ${result.user_id}`,
            newData: { role_ids, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Role revoked from user successfully')
        );
    }),

    bulkAssignRoles: asyncHandler(async (req, res) => {
        const { assignments, reason } = req.body;
        const result = await roleService.bulkAssignRoles(assignments, req.userId, reason);

        // ✅ AUDIT LOG - Bulk Roles Assigned
        await auditService.log({
            userId: req.userId,
            action: 'bulk_assign_roles',
            module: 'user',
            description: `Bulk roles assigned to ${assignments.length} users`,
            newData: { assignments_count: assignments.length, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Roles assigned successfully')
        );
    }),

    getUserRoles: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const roles = await roleService.getUserRoles(userId);
        res.status(200).json(
            ApiResponse.success(roles, 'User roles fetched successfully')
        );
    }),

    getUserPermissions: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const permissions = await roleService.getUserPermissions(userId);
        res.status(200).json(
            ApiResponse.success(permissions, 'User permissions fetched successfully')
        );
    }),


    // ============ REMOVED getUserPermissions - Already in permissionService ============

    // ============ ROLE HISTORY ============
    getRoleHistory: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const { page, limit } = req.query;
        const result = await roleService.getRoleHistory(userId, { page, limit });
        res.status(200).json(
            ApiResponse.paginated(
                result.history,
                result.pagination,
                'Role history fetched successfully'
            )
        );
    })
};

module.exports = roleController;