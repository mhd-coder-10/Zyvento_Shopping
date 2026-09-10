// Handles all employee related API requests
// Manages employee profile, dashboard, activities, notifications
// Also handles employee role management, permissions, performance and reports

const employeeService = require('../../services/employee/employee.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service'); // ✅ ADDED

const employeeController = {

    // ============ EMPLOYEE PROFILE (Self) ============
    getProfile: asyncHandler(async (req, res) => {
        const employeeId = req.employeeId;
        const profile = await employeeService.getProfile(employeeId);
        res.status(200).json(
            ApiResponse.success(profile, 'Profile fetched successfully')
        );
    }),

    updateProfile: asyncHandler(async (req, res) => {
        const employeeId = req.employeeId;
        const updateData = req.body;
        const profile = await employeeService.updateProfile(employeeId, updateData);
        
        // ✅ AUDIT LOG - Employee Profile Update
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'employee',
            moduleId: employeeId,
            description: 'Employee profile updated',
            newData: updateData,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(profile, 'Profile updated successfully')
        );
    }),

    // ============ EMPLOYEE DASHBOARD ============
    getDashboard: asyncHandler(async (req, res) => {
        const employeeId = req.employeeId;
        const dashboard = await employeeService.getDashboard(employeeId);
        res.status(200).json(
            ApiResponse.success(dashboard, 'Dashboard fetched successfully')
        );
    }),

    getDashboardStatistics: asyncHandler(async (req, res) => {
        const employeeId = req.employeeId;
        const { period = 'weekly' } = req.query;
        const statistics = await employeeService.getDashboardStatistics(employeeId, period);
        res.status(200).json(
            ApiResponse.success(statistics, 'Dashboard statistics fetched successfully')
        );
    }),

    // ============ EMPLOYEE ACTIVITY ============
    getMyActivities: asyncHandler(async (req, res) => {
        const employeeId = req.employeeId;
        const { page, limit, module } = req.query;
        const result = await employeeService.getMyActivities({
            employeeId,
            page,
            limit,
            module
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.activities,
                result.pagination,
                'Activities fetched successfully'
            )
        );
    }),

    // ============ EMPLOYEE NOTIFICATIONS ============
    getNotifications: asyncHandler(async (req, res) => {
        const employeeId = req.employeeId;
        const { page, limit, is_read } = req.query;
        const result = await employeeService.getNotifications({
            employeeId,
            page,
            limit,
            isRead: is_read
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.notifications,
                result.pagination,
                'Notifications fetched successfully'
            )
        );
    }),

    markNotificationRead: asyncHandler(async (req, res) => {
        const employeeId = req.employeeId;
        const { notificationId } = req.params;
        const notification = await employeeService.markNotificationRead(employeeId, notificationId);
        res.status(200).json(
            ApiResponse.success(notification, 'Notification marked as read')
        );
    }),

    // ============ SELLER EMPLOYEE MANAGEMENT ============
    getEmployeesBySeller: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { page, limit, status, employee_type, search } = req.query;
        const result = await employeeService.getEmployeesBySeller({
            sellerId,
            page,
            limit,
            status,
            employeeType: employee_type,
            search
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.employees,
                result.pagination,
                'Employees fetched successfully'
            )
        );
    }),

    getEmployeeById: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const employee = await employeeService.getEmployeeById(employeeId);
        res.status(200).json(
            ApiResponse.success(employee, 'Employee details fetched successfully')
        );
    }),

    updateEmployee: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const updateData = req.body;
        
        // Get old employee data for audit
        const oldEmployee = await employeeService.getEmployeeById(employeeId);
        
        const employee = await employeeService.updateEmployee(employeeId, updateData);
        
        // ✅ AUDIT LOG - Employee Update
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'employee',
            moduleId: employeeId,
            description: `Employee updated: ${oldEmployee.employee_type}`,
            oldData: { employee_type: oldEmployee.employee_type, status: oldEmployee.status },
            newData: updateData,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(employee, 'Employee updated successfully')
        );
    }),

    updateEmployeeStatus: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { status, reason } = req.body;
        
        // Get old employee data for audit
        const oldEmployee = await employeeService.getEmployeeById(employeeId);
        
        const employee = await employeeService.updateEmployeeStatus({
            employeeId,
            status,
            reason
        });
        
        // ✅ AUDIT LOG - Employee Status Update
        await auditService.log({
            userId: req.userId,
            action: 'status_change',
            module: 'employee',
            moduleId: employeeId,
            description: `Employee status changed to ${status}`,
            oldData: { status: oldEmployee.status },
            newData: { status, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(employee, `Employee status updated to ${status}`)
        );
    }),

    deleteEmployee: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        
        // Get old employee data for audit
        const oldEmployee = await employeeService.getEmployeeById(employeeId);
        
        await employeeService.deleteEmployee(employeeId);
        
        // ✅ AUDIT LOG - Employee Delete
        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'employee',
            moduleId: employeeId,
            description: `Employee deleted: ${oldEmployee.employee_type}`,
            oldData: { employee_type: oldEmployee.employee_type },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(null, 'Employee deleted successfully')
        );
    }),

    // ============ EMPLOYEE ROLE MANAGEMENT ============
    assignRole: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { role_ids, reason } = req.body;
        
        // Get old employee data for audit
        const oldEmployee = await employeeService.getEmployeeById(employeeId);
        
        const employee = await employeeService.assignRole({
            employeeId,
            roleIds: role_ids,
            reason
        });
        
        // ✅ AUDIT LOG - Role Assigned to Employee
        await auditService.log({
            userId: req.userId,
            action: 'assign_role',
            module: 'employee',
            moduleId: employeeId,
            description: `Role assigned to employee: ${oldEmployee.employee_type}`,
            newData: { role_ids, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(employee, 'Role assigned successfully')
        );
    }),

    removeRole: asyncHandler(async (req, res) => {
        const { employeeId, roleId } = req.params;
        const { reason } = req.body;
        
        // Get old employee data for audit
        const oldEmployee = await employeeService.getEmployeeById(employeeId);
        
        const employee = await employeeService.removeRole({
            employeeId,
            roleId,
            reason
        });
        
        // ✅ AUDIT LOG - Role Removed from Employee
        await auditService.log({
            userId: req.userId,
            action: 'remove_role',
            module: 'employee',
            moduleId: employeeId,
            description: `Role removed from employee: ${oldEmployee.employee_type}`,
            newData: { roleId, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(employee, 'Role removed successfully')
        );
    }),

    getEmployeeRoles: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const roles = await employeeService.getEmployeeRoles(employeeId);
        res.status(200).json(
            ApiResponse.success(roles, 'Employee roles fetched successfully')
        );
    }),

    getEmployeePermissions: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const permissions = await employeeService.getEmployeePermissions(employeeId);
        res.status(200).json(
            ApiResponse.success(permissions, 'Employee permissions fetched successfully')
        );
    }),

    // ============ EMPLOYEE ROLE HISTORY ============
    getRoleHistory: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { page, limit } = req.query;
        const result = await employeeService.getRoleHistory({
            employeeId,
            page,
            limit
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.history,
                result.pagination,
                'Role history fetched successfully'
            )
        );
    }),

    // ============ EMPLOYEE ACTIVITY LOG ============
    getEmployeeActivities: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { page, limit, module, action } = req.query;
        const result = await employeeService.getEmployeeActivities({
            employeeId,
            page,
            limit,
            module,
            action
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.activities,
                result.pagination,
                'Employee activities fetched successfully'
            )
        );
    }),

    // ============ EMPLOYEE PERFORMANCE ============
    getEmployeePerformance: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { period = 'monthly' } = req.query;
        const performance = await employeeService.getEmployeePerformance({
            employeeId,
            period
        });
        res.status(200).json(
            ApiResponse.success(performance, 'Employee performance fetched successfully')
        );
    }),

    // ============ EMPLOYEE REPORTS ============
    getEmployeeReports: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { start_date, end_date } = req.query;
        const reports = await employeeService.getEmployeeReports({
            employeeId,
            startDate: start_date,
            endDate: end_date
        });
        res.status(200).json(
            ApiResponse.success(reports, 'Employee reports fetched successfully')
        );
    }),

    // ============ SUB-ADMIN ACCESS ============
    getAllEmployees: asyncHandler(async (req, res) => {
        const { page, limit, search, seller_id, status, employee_type } = req.query;
        const result = await employeeService.getAllEmployees({
            page,
            limit,
            search,
            sellerId: seller_id,
            status,
            employeeType: employee_type
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.employees,
                result.pagination,
                'All employees fetched successfully'
            )
        );
    }),

    // ============ SUPER ADMIN ACCESS ============
    getAllEmployeesSuperAdmin: asyncHandler(async (req, res) => {
        const { page, limit, search, seller_id, status, employee_type } = req.query;
        const result = await employeeService.getAllEmployeesSuperAdmin({
            page,
            limit,
            search,
            sellerId: seller_id,
            status,
            employeeType: employee_type
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.employees,
                result.pagination,
                'All employees fetched successfully'
            )
        );
    })
};

module.exports = employeeController;