// Handles all role related business logic
// Manages role CRUD, permission assignment, role assignment to users
// Also handles role history and permission audit logs

const Role = require('../../models/role.model');
const User = require('../../models/user.model');
const SubAdmin = require('../../models/sub_admin.model');
const Employee = require('../../models/employee.model');
const RoleChangeHistory = require('../../models/role_change_history.model');
const PermissionAuditLog = require('../../models/permission_audit_log.model');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');
const permissionService = require('../permission.service'); 


class RoleService {

    // ============ ROLE CRUD ============
    async createRole(roleData, userId) {
        const { role_name, role_key, role_type, description, permission_ids, module_access, data_scope, is_system_role, priority } = roleData;

        // ✅ CHECK PERMISSION TO CREATE ROLE
        const hasPermission = await permissionService.hasPermission(userId, 'CREATE_ROLE');
        if (!hasPermission) {
            throw ApiError.forbidden('You do not have permission to create roles');
        }

        const existingRole = await Role.findOne({ role_key });
        if (existingRole) {
            throw ApiError.conflict('Role key already exists');
        }

        const existingName = await Role.findOne({
            role_name,
            role_type
        });
        if (existingName) {
            throw ApiError.conflict(`Role "${role_name}" already exists for type "${role_type}"`);
        }

        const role = new Role({
            role_name,
            role_key,
            role_type,
            description,
            permission_ids: permission_ids || [],
            module_access: module_access || [],
            data_scope: data_scope || constants.DATA_SCOPE.OWN,
            is_system_role: is_system_role || false,
            priority: priority || 0,
            created_by: userId,
            is_active: true
        });

        await role.save();

        await this.createPermissionAuditLog({
            userId,
            action: 'role_created',
            affectedRoleId: role._id,
            newState: role.toObject()
        });

        logger.info(`Role created: ${role_key}`, { roleId: role._id, createdBy: userId });

        return role;
    }

    async getAllRoles({ roleType = null, isActive = null, page = 1, limit = 10 }) {
        const query = {};
        if (roleType) {
            query.role_type = roleType;
        }
        if (isActive !== null) {
            query.is_active = isActive === 'true' || isActive === true;
        }

        const [roles, total] = await Promise.all([
            Role.find(query)
                .populate('permission_ids')
                .populate('created_by', 'first_name last_name email')
                .populate('updated_by', 'first_name last_name email')
                .sort({ priority: -1, created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Role.countDocuments(query)
        ]);

        return {
            roles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getRoleById(roleId) {
        const role = await Role.findById(roleId)
            .populate('permission_ids')
            .populate('created_by', 'first_name last_name email')
            .populate('updated_by', 'first_name last_name email');

        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        return role;
    }

    async updateRole(roleId, updateData, userId) {
        // ✅ CHECK PERMISSION TO UPDATE ROLE
        const hasPermission = await permissionService.hasPermission(userId, 'UPDATE_ROLE');
        if (!hasPermission) {
            throw ApiError.forbidden('You do not have permission to update roles');
        }

        const role = await Role.findById(roleId);
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        if (role.is_system_role) {
            throw ApiError.forbidden('Cannot modify system role');
        }

        const oldState = role.toObject();
        const allowedFields = [
            'role_name', 'description', 'permission_ids',
            'module_access', 'data_scope', 'priority'
        ];

        const filteredData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        Object.assign(role, filteredData);
        role.updated_by = userId;
        await role.save();

        await this.createPermissionAuditLog({
            userId,
            action: 'role_updated',
            affectedRoleId: role._id,
            oldState,
            newState: role.toObject()
        });

        logger.info(`Role updated: ${role.role_key}`, { roleId: role._id, updatedBy: userId });

        return role;
    }

    async deleteRole(roleId, userId) { // ✅ ADDED userId parameter
        // ✅ CHECK PERMISSION TO DELETE ROLE
        const hasPermission = await permissionService.hasPermission(userId, 'DELETE_ROLE');
        if (!hasPermission) {
            throw ApiError.forbidden('You do not have permission to delete roles');
        }

        const role = await Role.findById(roleId);
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        if (role.is_system_role) {
            throw ApiError.forbidden('Cannot delete system role');
        }

        const usersWithRole = await User.countDocuments({ role_ids: roleId });
        if (usersWithRole > 0) {
            throw ApiError.badRequest('Cannot delete role. It is assigned to users.');
        }

        await role.deleteOne();

        await this.createPermissionAuditLog({
            userId: userId,
            action: 'role_deleted',
            affectedRoleId: role._id,
            oldState: role.toObject()
        });

        logger.info(`Role deleted: ${role.role_key}`, { roleId: role._id });

        return { message: 'Role deleted successfully' };
    }

    async toggleRoleStatus(roleId, userId) { // ✅ ADDED userId parameter
        // ✅ CHECK PERMISSION TO UPDATE ROLE STATUS
        const hasPermission = await permissionService.hasPermission(userId, 'UPDATE_ROLE');
        if (!hasPermission) {
            throw ApiError.forbidden('You do not have permission to update role status');
        }

        const role = await Role.findById(roleId);
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        role.is_active = !role.is_active;
        await role.save();

        return role;
    }

    // ============ ROLE PERMISSIONS ============
    async assignPermissions(roleId, permissionIds, userId) { // ✅ ADDED userId parameter
        // ✅ CHECK PERMISSION TO ASSIGN PERMISSIONS
        const hasPermission = await permissionService.hasPermission(userId, 'ASSIGN_PERMISSIONS');
        if (!hasPermission) {
            throw ApiError.forbidden('You do not have permission to assign permissions');
        }

        const role = await Role.findById(roleId);
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        const oldState = role.toObject();
        role.permission_ids = permissionIds;
        await role.save();

        await this.createPermissionAuditLog({
            userId: userId,
            action: 'permission_assigned',
            affectedRoleId: role._id,
            oldState,
            newState: role.toObject()
        });

        return role;
    }

    async removePermission(roleId, permissionId, userId) { // ✅ ADDED userId parameter
        // ✅ CHECK PERMISSION TO REMOVE PERMISSION
        const hasPermission = await permissionService.hasPermission(userId, 'REMOVE_PERMISSIONS');
        if (!hasPermission) {
            throw ApiError.forbidden('You do not have permission to remove permissions');
        }

        const role = await Role.findById(roleId);
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        const oldState = role.toObject();
        role.permission_ids = role.permission_ids.filter(
            id => id.toString() !== permissionId
        );
        await role.save();

        await this.createPermissionAuditLog({
            userId: userId,
            action: 'permission_revoked',
            affectedRoleId: role._id,
            oldState,
            newState: role.toObject()
        });

        return role;
    }

    async getRolePermissions(roleId) {
        const role = await Role.findById(roleId).populate('permission_ids');
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        return role.permission_ids;
    }

    // ============ ROLE ASSIGNMENT ============
    async assignRoleToUser(userId, roleIds, assignedBy, reason = '') {
        // ✅ CHECK PERMISSION TO ASSIGN ROLES
        const hasPermission = await permissionService.hasPermission(assignedBy, 'ASSIGN_ROLES');
        if (!hasPermission) {
            throw ApiError.forbidden('You do not have permission to assign roles');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const roles = await Role.find({ _id: { $in: roleIds }, is_active: true });
        if (roles.length !== roleIds.length) {
            throw ApiError.badRequest('Some roles are invalid or inactive');
        }

        const oldRoleIds = user.role_ids || [];
        const newRoleIds = [...new Set([...oldRoleIds.map(id => id.toString()), ...roleIds])];
        user.role_ids = newRoleIds;
        await user.save();

        await RoleChangeHistory.create({
            user_id: userId,
            changed_by: assignedBy,
            old_role_ids: oldRoleIds,
            new_role_ids: newRoleIds,
            change_type: 'role_added',
            reason
        });

        await this.createPermissionAuditLog({
            userId: assignedBy,
            action: 'role_assigned',
            affectedUserId: userId,
            oldState: { role_ids: oldRoleIds },
            newState: { role_ids: newRoleIds }
        });

        logger.info(`Roles assigned to user: ${user.email}`, { userId, roles: roleIds, assignedBy });

        return { user_id: userId, assigned_roles: roleIds };
    }

    async revokeRoleFromUser(userId, roleIds, revokedBy, reason = '') {
        // ✅ CHECK PERMISSION TO REVOKE ROLES
        const hasPermission = await permissionService.hasPermission(revokedBy, 'REVOKE_ROLES');
        if (!hasPermission) {
            throw ApiError.forbidden('You do not have permission to revoke roles');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const oldRoleIds = user.role_ids || [];
        const newRoleIds = oldRoleIds.filter(id => !roleIds.includes(id.toString()));

        user.role_ids = newRoleIds;
        await user.save();

        await RoleChangeHistory.create({
            user_id: userId,
            changed_by: revokedBy,
            old_role_ids: oldRoleIds,
            new_role_ids: newRoleIds,
            change_type: 'role_removed',
            reason
        });

        await this.createPermissionAuditLog({
            userId: revokedBy,
            action: 'role_revoked',
            affectedUserId: userId,
            oldState: { role_ids: oldRoleIds },
            newState: { role_ids: newRoleIds }
        });

        logger.info(`Roles revoked from user: ${user.email}`, { userId, roles: roleIds, revokedBy });

        return { user_id: userId, revoked_roles: roleIds };
    }

    async bulkAssignRoles(assignments, assignedBy, reason = '') {
        // ✅ CHECK PERMISSION FOR BULK ASSIGN
        const hasPermission = await permissionService.hasPermission(assignedBy, 'ASSIGN_ROLES');
        if (!hasPermission) {
            throw ApiError.forbidden('You do not have permission to bulk assign roles');
        }

        const results = [];
        const errors = [];

        for (const assignment of assignments) {
            try {
                const result = await this.assignRoleToUser(
                    assignment.user_id,
                    assignment.role_ids,
                    assignedBy,
                    reason
                );
                results.push(result);
            } catch (error) {
                errors.push({
                    user_id: assignment.user_id,
                    error: error.message
                });
            }
        }

        return { success: results, errors };
    }

    async getUserRoles(userId) {
        const user = await User.findById(userId).populate('role_ids');
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        return user.role_ids;
    }

    // ✅ REMOVED getUserPermissions - Already in permissionService

    // ============ ROLE HISTORY ============
    async getRoleHistory(userId, { page = 1, limit = 10 }) {
        const [history, total] = await Promise.all([
            RoleChangeHistory.find({ user_id: userId })
                .populate('changed_by', 'first_name last_name email')
                .populate('old_role_ids')
                .populate('new_role_ids')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            RoleChangeHistory.countDocuments({ user_id: userId })
        ]);

        return {
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ PERMISSION AUDIT LOG ============
    async createPermissionAuditLog({
        userId,
        action,
        affectedUserId = null,
        affectedRoleId = null,
        oldState = null,
        newState = null
    }) {
        try {
            await PermissionAuditLog.create({
                user_id: userId,
                affected_user_id: affectedUserId,
                affected_role_id: affectedRoleId,
                action,
                old_state: oldState,
                new_state: newState
            });
        } catch (error) {
            logger.error('Failed to create permission audit log:', error);
        }
    }
}

module.exports = new RoleService();