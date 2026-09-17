// Handles all role related business logic
// Amazon-style: role → permission_ids (flat), no module_access

const mongoose = require('mongoose');
const Role = require('../../models/role.model');
const User = require('../../models/user.model');
const RoleChangeHistory = require('../../models/role_change_history.model');
const PermissionAuditLog = require('../../models/permission_audit_log.model');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');
const permissionService = require('./permission.service');

class RoleService {

    // ============ ROLE CRUD ============

    // Create role
    async createRole(roleData, userId) {
        const {
            role_name, role_key, role_type, description,
            permission_ids, data_scope, priority
        } = roleData;

        // Duplicate checks
        const existingKey = await Role.findOne({ role_key: role_key?.toUpperCase() });
        if (existingKey) throw ApiError.conflict('Role key already exists');

        const existingName = await Role.findOne({ role_name, role_type });
        if (existingName) {
            throw ApiError.conflict(`Role "${role_name}" already exists for type "${role_type}"`);
        }

        const role = await Role.create({
            role_name,
            role_key: role_key.toUpperCase(),
            role_type,
            description,
            permission_ids: permission_ids || [],
            data_scope: data_scope || 'own',
            is_system_role: false,
            priority: priority || 0,
            created_by: userId,
            is_active: true
        });

        await this.createPermissionAuditLog({
            userId,
            action: 'role_created',
            affectedRoleId: role._id,
            newState: role.toObject()
        });

        return role;
    }

    // Get all roles
    async getAllRoles({ roleType = null, isActive = null, search = null, page = 1, limit = 100 } = {}) {
        const query = {};
        if (roleType) query.role_type = roleType;
        if (isActive !== null && isActive !== undefined) {
            query.is_active = isActive === 'true' || isActive === true;
        }
        if (search) {
            const re = new RegExp(search, 'i');
            query.$or = [{ role_name: re }, { role_key: re }, { description: re }];
        }

        const [roles, total] = await Promise.all([
            Role.find(query)
                .populate('permission_ids', 'permission_name permission_key module_name action')
                .populate('created_by', 'first_name last_name email')
                .sort({ priority: -1, created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean(),
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

    // Get role by ID
    async getRoleById(roleId) {
        const role = await Role.findById(roleId)
            .populate('permission_ids')
            .populate('created_by', 'first_name last_name email')
            .populate('updated_by', 'first_name last_name email');
        if (!role) throw ApiError.notFound('Role not found');
        return role;
    }

    // ============ GET USERS WITH ROLE ============

    // Get users with this role - used in role details page
    async getUsersWithRole(roleId, { page = 1, limit = 10, search = null } = {}) {
        const role = await Role.findById(roleId).lean();
        if (!role) throw ApiError.notFound('Role not found');

        const query = { role_ids: roleId };
        if (search) {
            const re = new RegExp(search, 'i');
            query.$or = [
                { first_name: re },
                { last_name: re },
                { email: re },
                { user_code: re }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('_id user_code first_name last_name email mobile_number user_type account_status profile_image created_at')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        return {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Update role
    async updateRole(roleId, updateData, userId) {
        const role = await Role.findById(roleId);
        if (!role) throw ApiError.notFound('Role not found');

        // ✅ System role bhi edit ho sakta hai, BUT role_key aur role_type nahi change ho sakte

        const oldState = role.toObject();

        // Allowed fields — role_key and role_type excluded
        const allowed = ['role_name', 'description', 'permission_ids', 'data_scope', 'priority'];
        allowed.forEach((k) => {
            if (updateData[k] !== undefined) role[k] = updateData[k];
        });

        role.updated_by = userId;
        await role.save();

        await this.createPermissionAuditLog({
            userId,
            action: 'role_updated',
            affectedRoleId: role._id,
            oldState,
            newState: role.toObject()
        });

        return role;
    }

    // Delete role
    async deleteRole(roleId, userId) {
        const role = await Role.findById(roleId);
        if (!role) throw ApiError.notFound('Role not found');
        if (role.is_system_role) throw ApiError.forbidden('Cannot delete system role');

        const usersWithRole = await User.countDocuments({ role_ids: roleId });
        if (usersWithRole > 0) {
            const err = ApiError.badRequest(
                `Cannot delete role. It is assigned to ${usersWithRole} user${usersWithRole > 1 ? 's' : ''}. Please unassign first.`
            );
            err.meta = { assigned_users_count: usersWithRole, role_id: roleId };
            throw err;
        }

        const oldState = role.toObject();
        await role.deleteOne();

        await this.createPermissionAuditLog({
            userId,
            action: 'role_deleted',
            affectedRoleId: role._id,
            oldState
        });

        return { message: 'Role deleted successfully' };
    }

    // Toggle role status (activate/deactivate)
    async toggleRoleStatus(roleId, userId) {
        const role = await Role.findById(roleId);
        if (!role) throw ApiError.notFound('Role not found');
        role.is_active = !role.is_active;
        await role.save();
        return role;
    }

    // ============ ROLE PERMISSIONS ============

    // Assign permissions to role
    async assignPermissions(roleId, permissionIds, userId) {
        const role = await Role.findOne(roleId);
        if (!role) throw ApiError.notFound('Role not found');
        if (role.is_system_role) throw ApiError.forbidden('Cannot modify system role');

        const oldState = role.toObject();
        role.permission_ids = permissionIds || [];
        await role.save();

        await this.createPermissionAuditLog({
            userId,
            action: 'permission_assigned',
            affectedRoleId: role._id,
            oldState,
            newState: role.toObject()
        });

        return role;
    }

    // Remove permission from role
    async removePermission(roleId, permissionId, userId) {
        const role = await Role.findById(roleId);
        if (!role) throw ApiError.notFound('Role not found');

        const oldState = role.toObject();
        role.permission_ids = role.permission_ids.filter(
            (id) => id.toString() !== permissionId
        );
        await role.save();

        await this.createPermissionAuditLog({
            userId,
            action: 'permission_revoked',
            affectedRoleId: role._id,
            oldState,
            newState: role.toObject()
        });

        return role;
    }

    // Get role permissions
    async getRolePermissions(roleId) {
        const role = await Role.findById(roleId).populate('permission_ids');
        if (!role) throw ApiError.notFound('Role not found');
        return role.permission_ids;
    }

    // ============ ROLE ASSIGNMENT ============

    // Assign role to user
    async assignRoleToUser(identifier, roleIds, assignedBy, reason = '') {
        let query = {};
        if (mongoose.Types.ObjectId.isValid(identifier) && String(identifier).length === 24) {
            query = { _id: identifier };
        } else {
            query = { user_code: identifier };
        }

        const user = await User.findOne(query);   // findOne (no findById because findById is take the only string of object ID )
        if (!user) throw ApiError.notFound('User not found');

        const roles = await Role.find({ _id: { $in: roleIds }, is_active: true });
        if (roles.length !== roleIds.length) {
            throw ApiError.badRequest('Some roles are invalid or inactive');
        }

        const oldRoleIds = (user.role_ids || []).map((id) => id.toString());
        const newRoleIds = [...new Set([...oldRoleIds, ...roleIds.map(String)])];

        user.role_ids = newRoleIds;
        await user.save();

        await RoleChangeHistory.create({
            user_id: user._id,
            changed_by: assignedBy,
            old_role_ids: oldRoleIds,
            new_role_ids: newRoleIds,
            change_type: 'role_added',
            reason
        });

        await this.createPermissionAuditLog({
            userId: assignedBy,
            action: 'role_assigned',
            affectedUserId: user._id,
            oldState: { role_ids: oldRoleIds },
            newState: { role_ids: newRoleIds }
        });

        return { user_id: user._id, assigned_roles: roleIds };   // 👈 user._id
    }

    // Revoke role from user
    async revokeRoleFromUser(identifier, roleIds, revokedBy, reason = '') {
        let query = {};
        if (mongoose.Types.ObjectId.isValid(identifier) && String(identifier).length === 24) {
            query = { _id: identifier };
        } else {
            query = { user_code: identifier };
        }

        const user = await User.findOne(query); 
        if (!user) throw ApiError.notFound('User not found');

        const oldRoleIds = (user.role_ids || []).map((id) => id.toString());
        const revokeSet = new Set(roleIds.map(String));
        const newRoleIds = oldRoleIds.filter((id) => !revokeSet.has(id));

        user.role_ids = newRoleIds;
        await user.save();

        await RoleChangeHistory.create({
            user_id: user._id,
            changed_by: revokedBy,
            old_role_ids: oldRoleIds,
            new_role_ids: newRoleIds,
            change_type: 'role_removed',
            reason
        });

        return { user_id: user._id, revoked_roles: roleIds };
    }

    // Bulk assign roles to users
    async bulkAssignRoles(assignments, assignedBy, reason = '') {
        const results = [];
        const errors = [];
        for (const a of assignments) {
            try {
                const r = await this.assignRoleToUser(a.user_id, a.role_ids, assignedBy, reason);
                results.push(r);
            } catch (e) {
                errors.push({ user_id: a.user_id, error: e.message });
            }
        }
        return { success: results, errors };
    }

    // Get user roles
    async getUserRoles(identifier) {
        let query = {};
        if (mongoose.Types.ObjectId.isValid(identifier) && String(identifier).length === 24) {
            query = { _id: identifier };
        } else {
            query = { user_code: identifier };
        }

        const user = await User.findOne(query)
            .populate({
                path: 'role_ids',
                match: { is_active: true }
            })
            .select('role_ids')                  // plural
            .lean();

        if (!user) throw ApiError.notFound('User not found');
        return user.role_ids || [];
    }

    // Get user permissions
    async getUserPermissions(userId) {
        return permissionService.getUserPermissions(userId);
    }

    // ============ ROLE HISTORY ============

    // Get role history for user
    async getRoleHistory(userId, { page = 1, limit = 10 } = {}) {
        const [history, total] = await Promise.all([
            RoleChangeHistory.find({ user_id: userId })
                .populate('changed_by', 'first_name last_name email')
                .populate('old_role_ids', 'role_name role_key')
                .populate('new_role_ids', 'role_name role_key')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean(),
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

    // ============ AUDIT LOG ============
    // Create Permission Auding Log
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
        } catch (err) {
            logger.error('Failed to create permission audit log:', err);
        }
    }
}

module.exports = new RoleService();