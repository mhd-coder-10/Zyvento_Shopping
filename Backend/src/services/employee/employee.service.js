// Handles all employee related business logic
// Manages employee profile, dashboard, activities, notifications
// Also handles role management, permissions, performance, and reports

const Employee = require('../../models/employee.model');
const User = require('../../models/user.model');
const Seller = require('../../models/seller.model');
const Role = require('../../models/role.model');
const EmployeeRoleHistory = require('../../models/employee_role_history.model');
const EmployeeActivityLog = require('../../models/employee_activity_log.model');
const EmployeePermission = require('../../models/employee_permission.model');
const Notification = require('../../models/notification.model');
const Order = require('../../models/order.model');
const OrderItem = require('../../models/order_item.model');
const Product = require('../../models/product.model');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');

class EmployeeService {

    // ============ EMPLOYEE PROFILE (Self) ============
    async getProfile(employeeId) {
        const employee = await Employee.findById(employeeId)
            .populate('user_id', 'first_name last_name email mobile_number profile_image')
            .populate('role_ids')
            .populate('seller_id', 'business_name business_type')
            .populate('created_by', 'first_name last_name email');

        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        return employee;
    }

    async updateProfile(employeeId, updateData) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const allowedFields = ['designation', 'department', 'notes'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        Object.assign(employee, filteredData);
        await employee.save();

        if (updateData.first_name || updateData.last_name || updateData.mobile_number) {
            await User.findByIdAndUpdate(employee.user_id, {
                first_name: updateData.first_name,
                last_name: updateData.last_name,
                mobile_number: updateData.mobile_number
            });
        }

        return employee;
    }

    // ============ EMPLOYEE DASHBOARD ============
    async getDashboard(employeeId) {
        const employee = await Employee.findById(employeeId)
            .populate('seller_id')
            .populate('role_ids');

        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const employeeType = employee.employee_type;
        const sellerId = employee.seller_id?._id || employee.seller_id;

        let dashboardData = {
            employeeType,
            sellerName: employee.seller_id?.business_name || 'N/A',
            roles: employee.role_ids || []
        };

        if (employeeType === 'product_manager') {
            const [totalProducts, activeProducts, pendingProducts, totalInventory] = await Promise.all([
                Product.countDocuments({ seller_id: sellerId }),
                Product.countDocuments({ seller_id: sellerId, status: 'active' }),
                Product.countDocuments({ seller_id: sellerId, approval_status: 'pending' }),
                Product.aggregate([
                    { $match: { seller_id: sellerId } },
                    { $group: { _id: null, total: { $sum: '$quantity' } } }
                ])
            ]);

            dashboardData = {
                ...dashboardData,
                totalProducts,
                activeProducts,
                pendingProducts,
                totalInventory: totalInventory[0]?.total || 0
            };
        }

        if (employeeType === 'order_manager') {
            const [totalOrders, pendingOrders, processingOrders, deliveredOrders] = await Promise.all([
                Order.countDocuments({ seller_id: sellerId }),
                Order.countDocuments({ seller_id: sellerId, order_status: constants.ORDER_STATUS.PENDING }),
                Order.countDocuments({ seller_id: sellerId, order_status: constants.ORDER_STATUS.CONFIRMED }),
                Order.countDocuments({ seller_id: sellerId, order_status: constants.ORDER_STATUS.DELIVERED })
            ]);

            dashboardData = {
                ...dashboardData,
                totalOrders,
                pendingOrders,
                processingOrders,
                deliveredOrders
            };
        }

        if (employeeType === 'inventory_manager') {
            const [totalStock, lowStockItems, outOfStockItems] = await Promise.all([
                Product.aggregate([
                    { $match: { seller_id: sellerId } },
                    { $group: { _id: null, total: { $sum: '$quantity' } } }
                ]),
                Product.countDocuments({
                    seller_id: sellerId,
                    quantity: { $lte: 10 },
                    quantity: { $gt: 0 }
                }),
                Product.countDocuments({
                    seller_id: sellerId,
                    quantity: 0,
                    status: 'active'
                })
            ]);

            dashboardData = {
                ...dashboardData,
                totalStock: totalStock[0]?.total || 0,
                lowStockItems,
                outOfStockItems
            };
        }

        const recentActivity = await EmployeeActivityLog.find({ employee_id: employeeId })
            .sort({ created_at: -1 })
            .limit(10);

        dashboardData.recentActivity = recentActivity;

        return dashboardData;
    }

    async getDashboardStatistics(employeeId, period = 'weekly') {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const sellerId = employee.seller_id;
        const employeeType = employee.employee_type;

        const now = new Date();
        let startDate;

        switch (period) {
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'monthly':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'yearly':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 7));
        }

        let statistics = {};

        if (employeeType === 'product_manager') {
            const productTrend = await Product.aggregate([
                {
                    $match: {
                        seller_id: sellerId,
                        created_at: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            statistics = { productTrend };
        }

        if (employeeType === 'order_manager') {
            const orderTrend = await Order.aggregate([
                {
                    $match: {
                        seller_id: sellerId,
                        created_at: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            const statusDistribution = await Order.aggregate([
                {
                    $match: {
                        seller_id: sellerId,
                        created_at: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$order_status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            statistics = { orderTrend, statusDistribution };
        }

        if (employeeType === 'inventory_manager') {
            const stockTrend = await Product.aggregate([
                {
                    $match: {
                        seller_id: sellerId,
                        created_at: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        totalStock: { $sum: '$quantity' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            statistics = { stockTrend };
        }

        return {
            period,
            ...statistics
        };
    }

    // ============ EMPLOYEE ACTIVITY ============
    async getMyActivities({ employeeId, page = 1, limit = 10, module = null }) {
        const query = { employee_id: employeeId };

        if (module) {
            query.module_name = module;
        }

        const [activities, total] = await Promise.all([
            EmployeeActivityLog.find(query)
                .populate('performed_by', 'first_name last_name email')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            EmployeeActivityLog.countDocuments(query)
        ]);

        return {
            activities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ EMPLOYEE NOTIFICATIONS ============
    async getNotifications({ employeeId, page = 1, limit = 10, isRead = null }) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const query = {
            user_id: employee.user_id,
            is_deleted: false
        };

        if (isRead !== null) {
            query.is_read = isRead === 'true' || isRead === true;
        }

        const [notifications, total] = await Promise.all([
            Notification.find(query)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Notification.countDocuments(query)
        ]);

        return {
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async markNotificationRead(employeeId, notificationId) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const notification = await Notification.findOne({
            _id: notificationId,
            user_id: employee.user_id
        });

        if (!notification) {
            throw ApiError.notFound('Notification not found');
        }

        notification.is_read = true;
        notification.read_at = new Date();
        await notification.save();

        return notification;
    }

    // ============ SELLER EMPLOYEE MANAGEMENT ============
    async getEmployeesBySeller({
        sellerId,
        page = 1,
        limit = 10,
        status = null,
        employeeType = null,
        search = null
    }) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const query = { seller_id: sellerId };

        if (status) {
            query.status = status;
        }

        if (employeeType) {
            query.employee_type = employeeType;
        }

        if (search) {
            const userIds = await User.find({
                $or: [
                    { first_name: { $regex: search, $options: 'i' } },
                    { last_name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).distinct('_id');

            query.user_id = { $in: userIds };
        }

        const [employees, total] = await Promise.all([
            Employee.find(query)
                .populate('user_id', 'first_name last_name email mobile_number profile_image')
                .populate('role_ids')
                .populate('created_by', 'first_name last_name email')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Employee.countDocuments(query)
        ]);

        return {
            employees,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getEmployeeById(employeeId) {
        const employee = await Employee.findById(employeeId)
            .populate('user_id', 'first_name last_name email mobile_number profile_image')
            .populate('role_ids')
            .populate('seller_id', 'business_name business_type')
            .populate('created_by', 'first_name last_name email');

        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        return employee;
    }

    async updateEmployee(employeeId, updateData) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const allowedFields = ['employee_type', 'designation', 'department', 'notes'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        Object.assign(employee, filteredData);
        await employee.save();

        // Log important event - Employee updated
        logger.important('Employee updated', {
            employeeId: employee._id,
            employeeType: employee.employee_type,
            updatedFields: Object.keys(filteredData)
        });

        return employee;
    }

    async updateEmployeeStatus({ employeeId, status, reason = '' }) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const oldStatus = employee.status;

        employee.status = status;
        await employee.save();

        const userStatus = status === 'active' ? constants.ACCOUNT_STATUS.ACTIVE :
                          status === 'blocked' ? constants.ACCOUNT_STATUS.BLOCKED :
                          constants.ACCOUNT_STATUS.INACTIVE;

        await User.findByIdAndUpdate(employee.user_id, {
            account_status: userStatus
        });

        await EmployeeActivityLog.create({
            employee_id: employee._id,
            performed_by: employee.created_by,
            action: 'status_change',
            module_name: 'employee',
            description: `Employee status changed to ${status}`,
            new_data: { status, reason }
        });

        // Log important event - Employee status changed
        logger.important('Employee status changed', {
            employeeId: employee._id,
            oldStatus: oldStatus,
            newStatus: status,
            reason: reason
        });

        return employee;
    }

    async deleteEmployee(employeeId) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const employeeData = {
            employeeId: employee._id,
            employeeType: employee.employee_type,
            sellerId: employee.seller_id
        };

        await User.findByIdAndUpdate(employee.user_id, {
            user_type: constants.USER_TYPES.CUSTOMER,
            employee_id: null,
            seller_id: null
        });

        employee.status = 'inactive';
        await employee.save();

        // Log important event - Employee deleted
        logger.important('Employee deleted', employeeData);

        logger.info(`Employee deleted: ${employeeId}`);

        return { message: 'Employee deleted successfully' };
    }

    // ============ EMPLOYEE ROLE MANAGEMENT ============
    async assignRole({ employeeId, roleIds, reason = '' }) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const roles = await Role.find({ _id: { $in: roleIds }, is_active: true });
        if (roles.length !== roleIds.length) {
            throw ApiError.badRequest('Some roles are invalid or inactive');
        }

        const oldRoleIds = employee.role_ids || [];
        const newRoleIds = [...new Set([...oldRoleIds.map(id => id.toString()), ...roleIds])];

        await EmployeeRoleHistory.create({
            employee_id: employee._id,
            old_role_ids: oldRoleIds,
            new_role_ids: newRoleIds,
            changed_by: employee.created_by,
            change_reason: reason || 'Role assigned'
        });

        employee.role_ids = newRoleIds;
        await employee.save();

        await User.findByIdAndUpdate(employee.user_id, {
            role_ids: newRoleIds
        });

        await EmployeeActivityLog.create({
            employee_id: employee._id,
            performed_by: employee.created_by,
            action: 'role_assigned',
            module_name: 'employee',
            description: `Roles assigned: ${roleIds.join(', ')}`,
            new_data: { roleIds, reason }
        });

        // Log important event - Role assigned to employee
        logger.important('Role assigned to employee', {
            employeeId: employee._id,
            employeeType: employee.employee_type,
            assignedRoles: roleIds,
            reason: reason
        });

        return employee;
    }

    async removeRole({ employeeId, roleId, reason = '' }) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const oldRoleIds = employee.role_ids || [];
        const newRoleIds = oldRoleIds.filter(id => id.toString() !== roleId);

        if (oldRoleIds.length === newRoleIds.length) {
            throw ApiError.badRequest('Role not found for this employee');
        }

        await EmployeeRoleHistory.create({
            employee_id: employee._id,
            old_role_ids: oldRoleIds,
            new_role_ids: newRoleIds,
            changed_by: employee.created_by,
            change_reason: reason || 'Role removed'
        });

        employee.role_ids = newRoleIds;
        await employee.save();

        await User.findByIdAndUpdate(employee.user_id, {
            role_ids: newRoleIds
        });

        await EmployeeActivityLog.create({
            employee_id: employee._id,
            performed_by: employee.created_by,
            action: 'role_removed',
            module_name: 'employee',
            description: `Role removed: ${roleId}`,
            new_data: { roleId, reason }
        });

        // Log important event - Role removed from employee
        logger.important('Role removed from employee', {
            employeeId: employee._id,
            employeeType: employee.employee_type,
            removedRole: roleId,
            reason: reason
        });

        return employee;
    }

    async getEmployeeRoles(employeeId) {
        const employee = await Employee.findById(employeeId).populate('role_ids');
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        return employee.role_ids;
    }

    async getEmployeePermissions(employeeId) {
        const employee = await Employee.findById(employeeId)
            .populate({
                path: 'role_ids',
                populate: {
                    path: 'permission_ids'
                }
            });

        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const permissions = [];

        if (employee.role_ids) {
            for (const role of employee.role_ids) {
                if (role.permission_ids) {
                    for (const permission of role.permission_ids) {
                        permissions.push(permission);
                    }
                }
            }
        }

        const uniquePermissions = permissions.filter(
            (p, index, self) => self.findIndex(p2 => p2._id.toString() === p._id.toString()) === index
        );

        return uniquePermissions;
    }

    // ============ EMPLOYEE ROLE HISTORY ============
    async getRoleHistory({ employeeId, page = 1, limit = 10 }) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const [history, total] = await Promise.all([
            EmployeeRoleHistory.find({ employee_id: employeeId })
                .populate('changed_by', 'first_name last_name email')
                .populate('old_role_ids')
                .populate('new_role_ids')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            EmployeeRoleHistory.countDocuments({ employee_id: employeeId })
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

    // ============ EMPLOYEE ACTIVITY LOG ============
    async getEmployeeActivities({ employeeId, page = 1, limit = 10, module = null, action = null }) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const query = { employee_id: employeeId };

        if (module) {
            query.module_name = module;
        }

        if (action) {
            query.action = action;
        }

        const [activities, total] = await Promise.all([
            EmployeeActivityLog.find(query)
                .populate('performed_by', 'first_name last_name email')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            EmployeeActivityLog.countDocuments(query)
        ]);

        return {
            activities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ EMPLOYEE PERFORMANCE ============
    async getEmployeePerformance({ employeeId, period = 'monthly' }) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const employeeType = employee.employee_type;
        const sellerId = employee.seller_id;

        const now = new Date();
        let startDate;

        switch (period) {
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'monthly':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'yearly':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setMonth(now.getMonth() - 1));
        }

        let performanceData = {};

        if (employeeType === 'product_manager') {
            const [productsAdded, productsUpdated, productsDeleted] = await Promise.all([
                EmployeeActivityLog.countDocuments({
                    employee_id: employeeId,
                    action: 'create',
                    module_name: 'product',
                    created_at: { $gte: startDate }
                }),
                EmployeeActivityLog.countDocuments({
                    employee_id: employeeId,
                    action: 'update',
                    module_name: 'product',
                    created_at: { $gte: startDate }
                }),
                EmployeeActivityLog.countDocuments({
                    employee_id: employeeId,
                    action: 'delete',
                    module_name: 'product',
                    created_at: { $gte: startDate }
                })
            ]);

            performanceData = {
                productsAdded,
                productsUpdated,
                productsDeleted,
                totalActions: productsAdded + productsUpdated + productsDeleted
            };
        }

        if (employeeType === 'order_manager') {
            const [ordersProcessed, ordersDelivered, avgProcessingTime] = await Promise.all([
                EmployeeActivityLog.countDocuments({
                    employee_id: employeeId,
                    action: 'update',
                    module_name: 'order',
                    created_at: { $gte: startDate }
                }),
                Order.countDocuments({
                    seller_id: sellerId,
                    order_status: constants.ORDER_STATUS.DELIVERED,
                    delivered_at: { $gte: startDate }
                }),
                Order.aggregate([
                    {
                        $match: {
                            seller_id: sellerId,
                            order_status: constants.ORDER_STATUS.DELIVERED,
                            delivered_at: { $gte: startDate }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            avgTime: { $avg: { $subtract: ['$delivered_at', '$created_at'] } }
                        }
                    }
                ])
            ]);

            performanceData = {
                ordersProcessed,
                ordersDelivered,
                avgProcessingTime: avgProcessingTime[0]?.avgTime / (1000 * 60 * 60) || 0
            };
        }

        if (employeeType === 'inventory_manager') {
            const [stockUpdates, lowStockResolved] = await Promise.all([
                EmployeeActivityLog.countDocuments({
                    employee_id: employeeId,
                    module_name: 'inventory',
                    created_at: { $gte: startDate }
                }),
                EmployeeActivityLog.countDocuments({
                    employee_id: employeeId,
                    action: 'resolve',
                    module_name: 'inventory',
                    created_at: { $gte: startDate }
                })
            ]);

            performanceData = {
                stockUpdates,
                lowStockResolved
            };
        }

        return {
            period,
            employeeType,
            performance: performanceData
        };
    }

    // ============ EMPLOYEE REPORTS ============
    async getEmployeeReports({ employeeId, startDate, endDate }) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const activities = await EmployeeActivityLog.find({
            employee_id: employeeId,
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        })
            .populate('performed_by', 'first_name last_name email')
            .sort({ created_at: -1 });

        const moduleWise = {};
        for (const activity of activities) {
            if (!moduleWise[activity.module_name]) {
                moduleWise[activity.module_name] = 0;
            }
            moduleWise[activity.module_name]++;
        }

        const actionWise = {};
        for (const activity of activities) {
            if (!actionWise[activity.action]) {
                actionWise[activity.action] = 0;
            }
            actionWise[activity.action]++;
        }

        return {
            period: { startDate, endDate },
            totalActivities: activities.length,
            moduleWise,
            actionWise,
            activities
        };
    }

    // ============ SUB-ADMIN ACCESS ============
    async getAllEmployees({
        page = 1,
        limit = 10,
        search = null,
        sellerId = null,
        status = null,
        employeeType = null
    }) {
        const query = {};

        if (sellerId) {
            query.seller_id = sellerId;
        }

        if (status) {
            query.status = status;
        }

        if (employeeType) {
            query.employee_type = employeeType;
        }

        if (search) {
            const userIds = await User.find({
                $or: [
                    { first_name: { $regex: search, $options: 'i' } },
                    { last_name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).distinct('_id');

            query.user_id = { $in: userIds };
        }

        const [employees, total] = await Promise.all([
            Employee.find(query)
                .populate('user_id', 'first_name last_name email mobile_number profile_image')
                .populate('role_ids')
                .populate('seller_id', 'business_name')
                .populate('created_by', 'first_name last_name email')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Employee.countDocuments(query)
        ]);

        return {
            employees,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ SUPER ADMIN ACCESS ============
    async getAllEmployeesSuperAdmin({
        page = 1,
        limit = 10,
        search = null,
        sellerId = null,
        status = null,
        employeeType = null
    }) {
        return this.getAllEmployees({
            page,
            limit,
            search,
            sellerId,
            status,
            employeeType
        });
    }
}

module.exports = new EmployeeService();