// Global permission management service
// Checks user permissions, assigns permissions to roles and users
// Used by middleware and other services for authorization

const Permission = require('../models/permission.model');
const Role = require('../models/role.model');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');
const constants = require('../config/constants');

class PermissionService {

    // ============ CHECK USER PERMISSIONS ============
    
    async getUserPermissions(userId) {
        const user = await User.findById(userId)
            .populate({
                path: 'role_ids',
                populate: {
                    path: 'permission_ids'
                }
            })
            .populate('direct_permissions');

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const permissions = new Set();

        if (user.role_ids) {
            for (const role of user.role_ids) {
                if (role.permission_ids) {
                    for (const permission of role.permission_ids) {
                        permissions.add(permission.permission_key);
                    }
                }
            }
        }

        if (user.direct_permissions) {
            for (const permission of user.direct_permissions) {
                permissions.add(permission.permission_key);
            }
        }

        return Array.from(permissions);
    }

    async hasPermission(userId, permissionKey) {
        const permissions = await this.getUserPermissions(userId);
        return permissions.includes(permissionKey);
    }

    async hasAllPermissions(userId, requiredPermissions) {
        const permissions = await this.getUserPermissions(userId);
        return requiredPermissions.every(perm => permissions.includes(perm));
    }

    async hasAnyPermission(userId, requiredPermissions) {
        const permissions = await this.getUserPermissions(userId);
        return requiredPermissions.some(perm => permissions.includes(perm));
    }

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

        logger.info(`Permission created: ${permission_key}`, { permissionId: permission._id, userId });

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

        const allowedFields = ['permission_name', 'description', 'priority'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        filteredData.updated_by = userId;
        Object.assign(permission, filteredData);
        await permission.save();

        logger.info(`Permission updated: ${permission.permission_key}`, { permissionId, userId });

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

        const rolesWithPermission = await Role.countDocuments({ permission_ids: permissionId });
        if (rolesWithPermission > 0) {
            throw ApiError.badRequest('Cannot delete permission. It is assigned to roles.');
        }

        await permission.deleteOne();

        logger.info(`Permission deleted: ${permission.permission_key}`, { permissionId });

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

    // ============ ROLE PERMISSIONS ============

    async assignPermissionsToRole(roleId, permissionIds) {
        const role = await Role.findById(roleId);
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        const permissions = await Permission.find({ _id: { $in: permissionIds }, is_active: true });
        if (permissions.length !== permissionIds.length) {
            throw ApiError.badRequest('Some permissions are invalid or inactive');
        }

        role.permission_ids = permissionIds;
        await role.save();

        logger.info(`Permissions assigned to role: ${role.role_key}`, { roleId, permissionIds });

        return role;
    }

    async removePermissionFromRole(roleId, permissionId) {
        const role = await Role.findById(roleId);
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        role.permission_ids = role.permission_ids.filter(
            id => id.toString() !== permissionId
        );
        await role.save();

        logger.info(`Permission removed from role: ${role.role_key}`, { roleId, permissionId });

        return role;
    }

    async getRolePermissions(roleId) {
        const role = await Role.findById(roleId).populate('permission_ids');
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        return role.permission_ids;
    }

    // ============ DIRECT USER PERMISSIONS ============

    async addDirectPermissionToUser(userId, permissionId) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const permission = await Permission.findById(permissionId);
        if (!permission) {
            throw ApiError.notFound('Permission not found');
        }

        if (!user.direct_permissions) {
            user.direct_permissions = [];
        }

        if (!user.direct_permissions.includes(permissionId)) {
            user.direct_permissions.push(permissionId);
            await user.save();
        }

        logger.info(`Direct permission added to user: ${user.email}`, { userId, permissionId });

        return user;
    }

    async removeDirectPermissionFromUser(userId, permissionId) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        user.direct_permissions = user.direct_permissions.filter(
            id => id.toString() !== permissionId
        );
        await user.save();

        logger.info(`Direct permission removed from user: ${user.email}`, { userId, permissionId });

        return user;
    }

    async getUserDirectPermissions(userId) {
        const user = await User.findById(userId).populate('direct_permissions');
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        return user.direct_permissions;
    }

    // ============ PERMISSION VALIDATION ============

    async hasModuleAccess(userId, moduleName, action = 'read') {
        const permissions = await this.getUserPermissions(userId);
        const manageKey = `MANAGE_${moduleName.toUpperCase()}`;
        const actionKey = `${action.toUpperCase()}_${moduleName.toUpperCase()}`;

        return permissions.includes(manageKey) || permissions.includes(actionKey);
    }

    async getUserModulePermissions(userId, moduleName) {
        const allPermissions = await this.getUserPermissions(userId);
        return allPermissions.filter(perm => perm.includes(moduleName.toUpperCase()));
    }

    async hasFieldAccess(userId, moduleName, fieldName) {
        const permissions = await this.getUserPermissions(userId);
        const manageKey = `MANAGE_${moduleName.toUpperCase()}`;
        const fieldKey = `${fieldName.toUpperCase()}_${moduleName.toUpperCase()}`;

        return permissions.includes(manageKey) || permissions.includes(fieldKey);
    }
}

module.exports = new PermissionService();