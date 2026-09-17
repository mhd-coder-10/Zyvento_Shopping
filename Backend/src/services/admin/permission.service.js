// Handles all permission related business logic
// Manages permission CRUD, module wise permissions, permission groups
// Also handles permission audit logs and user permission resolution

const Permission = require('../../models/permission.model');
const PermissionAuditLog = require('../../models/permission_audit_log.model');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');

class PermissionService {

    // CRITICAL — USER PERMISSION RESOLUTION

    /**
     * Check if user has a specific permission
     * Super Admin → always true (bypass)
     */
    async hasPermission(userId, requiredPermission) {
        try {
            const User = require('../../models/user.model');
            const user = await User.findById(userId)
                .populate({
                    path: 'role_ids',
                    match: { is_active: true },
                    populate: {
                        path: 'permission_ids',
                        match: { is_active: true }
                    }
                })
                .lean();

            if (!user) return false;

            // Super admin bypass
            if (user.user_type === 'super_admin') return true;

            // Collect all permission keys from all roles
            const permissionKeys = new Set();
            (user.role_ids || []).forEach((role) => {
                (role.permission_ids || []).forEach((p) => {
                    if (p?.permission_key) {
                        permissionKeys.add(p.permission_key.toUpperCase());
                    }
                });
            });

            return permissionKeys.has(String(requiredPermission).toUpperCase());
        } catch (err) {
            logger.error('hasPermission failed:', err);
            return false;
        }
    }

    /**
     * Check if user has ALL of the required permissions
     */
    async hasAllPermissions(userId, requiredPermissions = []) {
        if (!requiredPermissions.length) return true;
        const userPerms = await this.getUserPermissions(userId);
        const set = new Set(userPerms.map((p) => p.permission_key));
        return requiredPermissions.every((p) => set.has(p.toUpperCase()));
    }

    /**
     * Check if user has ANY of the required permissions
     */
    async hasAnyPermission(userId, requiredPermissions = []) {
        if (!requiredPermissions.length) return false;
        const userPerms = await this.getUserPermissions(userId);
        const set = new Set(userPerms.map((p) => p.permission_key));
        return requiredPermissions.some((p) => set.has(p.toUpperCase()));
    }

    /**
     * Check module-level access (e.g., "orders" + "read")
     */
    async hasModuleAccess(userId, moduleName, action = 'read') {
        const key = `${moduleName}.${action}`; // informational
        const userPerms = await this.getUserPermissions(userId);
        return userPerms.some(
            (p) =>
                p.module_name === moduleName &&
                (p.action === action || p.action === 'manage')
        );
    }

    /**
     * Field-level access (basic support — checks if any role has module manage)
     */
    async hasFieldAccess(userId, moduleName, field) {
        return this.hasModuleAccess(userId, moduleName, 'read');
    }

    /**
     * Get flat list of all active permissions a user has (from all roles)
     */
    async getUserPermissions(userId) {
        try {
            const User = require('../../models/user.model');
            const user = await User.findById(userId)
                .populate({
                    path: 'role_ids',
                    match: { is_active: true },
                    populate: {
                        path: 'permission_ids',
                        match: { is_active: true }
                    }
                })
                .lean();

            if (!user) return [];

            // Super admin — return all active permissions
            if (user.user_type === 'super_admin') {
                return Permission.find({ is_active: true }).lean();
            }

            // Merge unique permissions
            const permMap = new Map();
            (user.role_ids || []).forEach((role) => {
                (role.permission_ids || []).forEach((p) => {
                    if (p?._id) permMap.set(String(p._id), p);
                });
            });

            return Array.from(permMap.values());
        } catch (err) {
            logger.error('getUserPermissions failed:', err);
            return [];
        }
    }

    /**
     * Get permission keys only (for frontend menu visibility)
     */
    async getUserPermissionKeys(userId) {
        const perms = await this.getUserPermissions(userId);
        return perms.map((p) => p.permission_key);
    }

    // ========== PERMISSION CRUD ==========

    // Create permission
    async createPermission(permissionData, userId) {
        const {
            permission_name,
            permission_key,
            module_name,
            sub_module,
            action,
            description,
            is_system,
            priority
        } = permissionData;

        const existing = await Permission.findOne({ permission_key: permission_key?.toUpperCase() });
        if (existing) throw ApiError.conflict('Permission key already exists');

        const permission = await Permission.create({
            permission_name,
            permission_key: permission_key.toUpperCase(),
            module_name,
            sub_module: sub_module || null,
            action,
            description,
            is_system: is_system || false,
            priority: priority || 0,
            created_by: userId,
            is_active: true
        });

        await this.createPermissionAuditLog({
            userId,
            action: 'permission_created',
            newState: permission.toObject()
        });

        logger.info(`Permission created: ${permission_key}`);
        return permission;
    }

    // Get all permissions
    async getAllPermissions({ moduleName = null, isActive = null, search = null, page = 1, limit = 100 } = {}) {
        const query = {};
        if (moduleName) query.module_name = moduleName;
        if (isActive !== null && isActive !== undefined) {
            query.is_active = isActive === 'true' || isActive === true;
        }
        if (search) {
            const re = new RegExp(search, 'i');
            query.$or = [
                { permission_name: re },
                { permission_key: re },
                { module_name: re }
            ];
        }

        const [permissions, total] = await Promise.all([
            Permission.find(query)
                .populate('created_by', 'first_name last_name email')
                .sort({ module_name: 1, action: 1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean(),
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

    // Get permission by ID
    async getPermissionById(permissionId) {
        const permission = await Permission.findById(permissionId)
            .populate('created_by', 'first_name last_name email')
            .populate('updated_by', 'first_name last_name email');
        if (!permission) throw ApiError.notFound('Permission not found');
        return permission;
    }

    // Get roles using this permission
    async getRolesWithPermission(permissionId, { page = 1, limit = 10, search = null } = {}) {
        const permission = await Permission.findById(permissionId).lean();
        if (!permission) throw ApiError.notFound('Permission not found');

        const Role = require('../../models/role.model');

        const query = { permission_ids: permissionId };
        if (search) {
            const re = new RegExp(search, 'i');
            query.$or = [
                { role_name: re },
                { role_key: re },
                { description: re }
            ];
        }

        const [roles, total] = await Promise.all([
            Role.find(query)
                .select('_id role_name role_key role_type description is_active is_system_role priority permission_ids')
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

    // Update permission
    async updatePermission(permissionId, updateData, userId) {
        const permission = await Permission.findById(permissionId);
        if (!permission) throw ApiError.notFound('Permission not found');
        // if (permission.is_system) throw ApiError.forbidden('Cannot modify system permission');

        const oldState = permission.toObject();
        const allowed = ['permission_name', 'description', 'priority'];
        allowed.forEach((k) => {
            if (updateData[k] !== undefined) permission[k] = updateData[k];
        });
        permission.updated_by = userId;
        await permission.save();

        await this.createPermissionAuditLog({
            userId,
            action: 'permission_updated',
            oldState,
            newState: permission.toObject()
        });

        return permission;
    }

    // Delete permission
    async deletePermission(permissionId) {
        const permission = await Permission.findById(permissionId);
        if (!permission) throw ApiError.notFound('Permission not found');

        if (permission.is_system) throw ApiError.forbidden('Cannot delete system permission'); // restricted

        const Role = require('../../models/role.model');
        const assigned = await Role.countDocuments({ permission_ids: permissionId });
        if (assigned > 0) {
            throw ApiError.badRequest('Cannot delete permission. It is assigned to roles.');
        }

        await permission.deleteOne();

        await this.createPermissionAuditLog({
            userId: null,
            action: 'permission_deleted',
            oldState: permission.toObject()
        });

        return { message: 'Permission deleted successfully' };
    }

    // Toggle permission status (activate/deactivate)
    async togglePermissionStatus(permissionId) {
        const permission = await Permission.findById(permissionId);
        if (!permission) throw ApiError.notFound('Permission not found');
        permission.is_active = !permission.is_active;
        await permission.save();
        return permission;
    }


    // ========== PERMISSION GROUPS ==========

    async getPermissionModules() {
        const modules = await Permission.distinct('module_name', { is_active: true });
        return modules.sort();
    }

    async getPermissionsByModule(moduleName) {
        const permissions = await Permission.find({
            module_name: moduleName,
            is_active: true
        }).sort({ action: 1 });
        if (!permissions.length) {
            throw ApiError.notFound(`No permissions found for module: ${moduleName}`);
        }
        return permissions;
    }

    async getPermissionActions() {
        return Object.values(constants.PERMISSION_ACTIONS);
    }


    // ========== PERMISSION AUDIT ==========

    async getPermissionAuditLogs({ page = 1, limit = 10, action = null, userId = null }) {
        const query = {};
        if (action) query.action = action;
        if (userId) query.user_id = userId;

        const [logs, total] = await Promise.all([
            PermissionAuditLog.find(query)
                .populate('user_id', 'first_name last_name email')
                .populate('affected_user_id', 'first_name last_name email')
                .populate('affected_role_id', 'role_name role_key')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean(),
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
        if (!log) throw ApiError.notFound('Permission audit log not found');
        return log;
    }

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

module.exports = new PermissionService();