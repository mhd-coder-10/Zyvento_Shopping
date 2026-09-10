// Handles all permission related business logic
// Manages permission CRUD, module wise permissions, permission groups
// Also handles permission audit logs

const Permission = require('../../models/permission.model');
const PermissionAuditLog = require('../../models/permission_audit_log.model');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');

class PermissionService {

    // ============ PERMISSION CRUD ============
    async createPermission(permissionData, userId) {
        const { permission_name, permission_key, module_name, sub_module, action, description, is_system, priority } = permissionData;

        const existingPermission = await Permission.findOne({ permission_key });
        if (existingPermission) {
            throw ApiError.conflict('Permission key already exists');
        }

        const permission = new Permission({
            permission_name,
            permission_key,
            module_name,
            sub_module: sub_module || null,
            action,
            description,
            is_system: is_system || false,
            priority: priority || 0,
            created_by: userId,
            is_active: true
        });

        await permission.save();

        await this.createPermissionAuditLog({
            userId,
            action: 'permission_created',
            affectedRoleId: null,
            newState: permission.toObject()
        });

        logger.info(`Permission created: ${permission_key}`, { permissionId: permission._id, createdBy: userId });

        return permission;
    }

    async getAllPermissions({ moduleName = null, isActive = null, page = 1, limit = 10 }) {
        const query = {};
        if (moduleName) {
            query.module_name = moduleName;
        }
        if (isActive !== null) {
            query.is_active = isActive === 'true' || isActive === true;
        }

        const [permissions, total] = await Promise.all([
            Permission.find(query)
                .populate('created_by', 'first_name last_name email')
                .populate('updated_by', 'first_name last_name email')
                .sort({ module_name: 1, action: 1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Permission.countDocuments(query)
        ]);

        return {
            permissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getPermissionById(permissionId) {
        const permission = await Permission.findById(permissionId)
            .populate('created_by', 'first_name last_name email')
            .populate('updated_by', 'first_name last_name email');

        if (!permission) {
            throw ApiError.notFound('Permission not found');
        }

        return permission;
    }

    async updatePermission(permissionId, updateData, userId) {
        const permission = await Permission.findById(permissionId);
        if (!permission) {
            throw ApiError.notFound('Permission not found');
        }

        if (permission.is_system) {
            throw ApiError.forbidden('Cannot modify system permission');
        }

        const oldState = permission.toObject();
        const allowedFields = ['permission_name', 'description', 'priority'];

        const filteredData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        Object.assign(permission, filteredData);
        permission.updated_by = userId;
        await permission.save();

        await this.createPermissionAuditLog({
            userId,
            action: 'permission_updated',
            affectedRoleId: null,
            oldState,
            newState: permission.toObject()
        });

        logger.info(`Permission updated: ${permission.permission_key}`, { permissionId: permission._id, updatedBy: userId });

        return permission;
    }

    async deletePermission(permissionId) {
        const permission = await Permission.findById(permissionId);
        if (!permission) {
            throw ApiError.notFound('Permission not found');
        }

        if (permission.is_system) {
            throw ApiError.forbidden('Cannot delete system permission');
        }

        // Check if permission is assigned to any role
        const Role = require('../../models/role.model');
        const rolesWithPermission = await Role.countDocuments({ permission_ids: permissionId });
        if (rolesWithPermission > 0) {
            throw ApiError.badRequest('Cannot delete permission. It is assigned to roles.');
        }

        await permission.deleteOne();

        await this.createPermissionAuditLog({
            userId: null,
            action: 'permission_deleted',
            affectedRoleId: null,
            oldState: permission.toObject()
        });

        logger.info(`Permission deleted: ${permission.permission_key}`, { permissionId: permission._id });

        return { message: 'Permission deleted successfully' };
    }

    async togglePermissionStatus(permissionId) {
        const permission = await Permission.findById(permissionId);
        if (!permission) {
            throw ApiError.notFound('Permission not found');
        }

        permission.is_active = !permission.is_active;
        await permission.save();

        return permission;
    }

    // ============ PERMISSION GROUPS ============
    async getPermissionModules() {
        const modules = await Permission.distinct('module_name', { is_active: true });
        return modules.sort();
    }

    async getPermissionsByModule(moduleName) {
        const permissions = await Permission.find({
            module_name: moduleName,
            is_active: true
        }).sort({ action: 1 });

        if (permissions.length === 0) {
            throw ApiError.notFound(`No permissions found for module: ${moduleName}`);
        }

        return permissions;
    }

    async getPermissionActions() {
        return Object.values(constants.PERMISSION_ACTIONS);
    }

    // ============ PERMISSION AUDIT ============
    async getPermissionAuditLogs({ page = 1, limit = 10, action = null, userId = null }) {
        const query = {};
        if (action) {
            query.action = action;
        }
        if (userId) {
            query.user_id = userId;
        }

        const [logs, total] = await Promise.all([
            PermissionAuditLog.find(query)
                .populate('user_id', 'first_name last_name email')
                .populate('affected_user_id', 'first_name last_name email')
                .populate('affected_role_id', 'role_name role_key')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            PermissionAuditLog.countDocuments(query)
        ]);

        return {
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getPermissionAuditById(auditId) {
        const log = await PermissionAuditLog.findById(auditId)
            .populate('user_id', 'first_name last_name email')
            .populate('affected_user_id', 'first_name last_name email')
            .populate('affected_role_id', 'role_name role_key');

        if (!log) {
            throw ApiError.notFound('Permission audit log not found');
        }

        return log;
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

module.exports = new PermissionService();