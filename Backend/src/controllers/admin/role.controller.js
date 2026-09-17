
// Handles all role related API requests
// Manages role CRUD, permission assignment, role history
// Also handles role assignment to users and user permissions view

const roleService = require('../../services/admin/role.service');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service');

const roleController = {

    // ============ ROLE CRUD ============

    // Create role
    createRole: asyncHandler(async (req, res) => {
        const role = await roleService.createRole(req.body, req.userId);

        await auditService.log({
            userId: req.userId,
            action: 'create',
            module: 'role',
            moduleId: role._id,
            description: `Role created: ${role.role_name}`,
            newData: {
                role_name: role.role_name,
                role_key: role.role_key,
                role_type: role.role_type
            },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(201).json(
            ApiResponse.created(role, 'Role created successfully')
        );
    }),

    // Get all roles
    getAllRoles: asyncHandler(async (req, res) => {
        const { role_type, is_active, search, page, limit } = req.query;

        const result = await roleService.getAllRoles({
            roleType: role_type,
            isActive: is_active,
            search,
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

    // Get role by ID
    getRoleById: asyncHandler(async (req, res) => {
        const { roleId } = req.params;
        const role = await roleService.getRoleById(roleId);
        res.status(200).json(
            ApiResponse.success(role, 'Role details fetched successfully')
        );
    }),

    // Get users with this role
    getUsersWithRole: asyncHandler(async (req, res) => {
        const { roleId } = req.params;
        const { page, limit, search } = req.query;

        const result = await roleService.getUsersWithRole(roleId, { page, limit, search });

        res.status(200).json(
            ApiResponse.paginated(
                result.users,
                result.pagination,
                'Users with this role fetched successfully'
            )
        );
    }),

    // Update role
    updateRole: asyncHandler(async (req, res) => {
        const { roleId } = req.params;

        const oldRole = await roleService.getRoleById(roleId);
        const role = await roleService.updateRole(roleId, req.body, req.userId);

        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'role',
            moduleId: roleId,
            description: `Role updated: ${oldRole.role_name}`,
            oldData: {
                role_name: oldRole.role_name,
                role_key: oldRole.role_key,
                is_active: oldRole.is_active
            },
            newData: req.body,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(role, 'Role updated successfully')
        );
    }),

    // Delete role
    deleteRole: asyncHandler(async (req, res) => {
        const { roleId } = req.params;

        const oldRole = await roleService.getRoleById(roleId);
        await roleService.deleteRole(roleId, req.userId);

        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'role',
            moduleId: roleId,
            description: `Role deleted: ${oldRole.role_name}`,
            oldData: {
                role_name: oldRole.role_name,
                role_key: oldRole.role_key
            },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(null, 'Role deleted successfully')
        );
    }),

    // Toggle role status (activate/deactivate)
    toggleRoleStatus: asyncHandler(async (req, res) => {
        const { roleId } = req.params;

        const oldRole = await roleService.getRoleById(roleId);
        const role = await roleService.toggleRoleStatus(roleId, req.userId);

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
            ApiResponse.success(
                role,
                `Role ${role.is_active ? 'activated' : 'deactivated'} successfully`
            )
        );
    }),

    // ============ ROLE PERMISSIONS ============

    // Assign permissions to role
    assignPermissions: asyncHandler(async (req, res) => {
        const { roleId } = req.params;
        const { permission_ids } = req.body;

        const oldRole = await roleService.getRoleById(roleId);
        const role = await roleService.assignPermissions(roleId, permission_ids, req.userId);

        await auditService.log({
            userId: req.userId,
            action: 'assign_permissions',
            module: 'role',
            moduleId: roleId,
            description: `Permissions assigned to role: ${role.role_name}`,
            oldData: { permission_ids: (oldRole.permission_ids || []).map((p) => p._id || p) },
            newData: { permission_ids },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(role, 'Permissions assigned successfully')
        );
    }),

    // Remove permission from role
    removePermission: asyncHandler(async (req, res) => {
        const { roleId, permissionId } = req.params;

        const oldRole = await roleService.getRoleById(roleId);
        const role = await roleService.removePermission(roleId, permissionId, req.userId);

        await auditService.log({
            userId: req.userId,
            action: 'remove_permission',
            module: 'role',
            moduleId: roleId,
            description: `Permission removed from role: ${role.role_name}`,
            oldData: { permission_ids: (oldRole.permission_ids || []).map((p) => p._id || p) },
            newData: { permission_ids: (role.permission_ids || []).map((p) => p._id || p) },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(role, 'Permission removed successfully')
        );
    }),

    // Get role permissions
    getRolePermissions: asyncHandler(async (req, res) => {
        const { roleId } = req.params;
        const permissions = await roleService.getRolePermissions(roleId);
        res.status(200).json(
            ApiResponse.success(permissions, 'Role permissions fetched successfully')
        );
    }),

    // ============ ROLE ASSIGNMENT ============

    // Assign role to user
    assignRoleToUser: asyncHandler(async (req, res) => {
        const { user_id, role_ids, reason } = req.body;
        const result = await roleService.assignRoleToUser(
            user_id,
            role_ids,
            req.userId,
            reason
        );

        await auditService.log({
            userId: req.userId,
            action: 'assign_role',
            module: 'user',
            moduleId: user_id,
            description: `Roles assigned to user: ${user_id}`,
            newData: { role_ids, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Role assigned to user successfully')
        );
    }),

    // Revoke role from user
    revokeRoleFromUser: asyncHandler(async (req, res) => {
        const { user_id, role_ids, reason } = req.body;
        const result = await roleService.revokeRoleFromUser(
            user_id,
            role_ids,
            req.userId,
            reason
        );

        await auditService.log({
            userId: req.userId,
            action: 'revoke_role',
            module: 'user',
            moduleId: user_id,
            description: `Roles revoked from user: ${user_id}`,
            newData: { role_ids, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Role revoked from user successfully')
        );
    }),

    // Bulk assign roles to users
    bulkAssignRoles: asyncHandler(async (req, res) => {
        const { assignments, reason } = req.body;
        const result = await roleService.bulkAssignRoles(
            assignments,
            req.userId,
            reason
        );

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

    // Get user roles
    getUserRoles: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const roles = await roleService.getUserRoles(userId);
        res.status(200).json(
            ApiResponse.success(roles, 'User roles fetched successfully')
        );
    }),

    // Get user permissions
    getUserPermissions: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const permissions = await roleService.getUserPermissions(userId);
        res.status(200).json(
            ApiResponse.success(permissions, 'User permissions fetched successfully')
        );
    }),

    // ============ ROLE HISTORY ============

    // Get role history for user
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