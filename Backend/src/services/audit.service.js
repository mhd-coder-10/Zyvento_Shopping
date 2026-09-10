// Global audit logging service
// Logs all user actions, system events, and data changes
// Used across all controllers and services for activity tracking

const AuditLog = require('../models/audit_log.model');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

class AuditService {

    // ============ CREATE AUDIT LOG ============
    /**
     * Create an audit log entry
     * @param {Object} params
     * @param {string} params.userId - ID of the user performing the action
     * @param {string} params.action - Action performed (create, update, delete, etc.)
     * @param {string} params.module - Module name (product, order, user, etc.)
     * @param {string} params.moduleId - ID of the affected record
     * @param {string} params.description - Description of the action
     * @param {Object} params.oldData - Previous state (for updates)
     * @param {Object} params.newData - New state (for updates/create)
     * @param {string} params.ip - IP address of the requester
     * @param {string} params.userAgent - User agent of the requester
     * @param {string} params.status - Status (success, failed, pending)
     * @param {string} params.errorMessage - Error message if failed
     */
    async log({
        userId,
        action,
        module,
        moduleId = null,
        description = null,
        oldData = null,
        newData = null,
        ip = null,
        userAgent = null,
        status = 'success',
        errorMessage = null
    }) {
        try {
            // Get user details if userId provided
            let userType = null;
            
            if (userId) {
                const user = await User.findById(userId).select('user_type');
                if (user) {
                    userType = user.user_type;
                }
            }

            const auditLog = new AuditLog({
                user_id: userId,
                user_type: userType,
                action,
                module,
                module_id: moduleId,
                description: description || `${action} on ${module}`,
                old_data: oldData ? this.sanitizeData(oldData) : null,
                new_data: newData ? this.sanitizeData(newData) : null,
                ip_address: ip,
                user_agent: userAgent,
                status,
                error_message: errorMessage
            });

            await auditLog.save();

            logger.debug(`Audit log created: ${action} on ${module}`, { 
                userId, 
                module, 
                moduleId,
                logId: auditLog._id 
            });

            return auditLog;
        } catch (error) {
            logger.error('Failed to create audit log:', error);
            // Don't throw error to avoid breaking main flow
            return null;
        }
    }

    // ============ SANITIZE DATA ============
    /**
     * Remove sensitive data before storing
     */
    sanitizeData(data) {
        if (!data) return null;
        
        const sanitized = { ...data };
        const sensitiveFields = ['password', 'refresh_token', 'password_reset_token'];
        
        for (const field of sensitiveFields) {
            if (sanitized[field] !== undefined) {
                sanitized[field] = '***REDACTED***';
            }
        }
        
        return sanitized;
    }

    // ============ GET AUDIT LOGS ============
    /**
     * Get audit logs with filters
     */
    async getLogs({
        userId = null,
        module = null,
        action = null,
        userType = null,
        startDate = null,
        endDate = null,
        status = null,
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const query = {};

        if (userId) {
            query.user_id = userId;
        }

        if (module) {
            query.module = module;
        }

        if (action) {
            query.action = action;
        }

        if (userType) {
            query.user_type = userType;
        }

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.created_at = {};
            if (startDate) {
                query.created_at.$gte = new Date(startDate);
            }
            if (endDate) {
                query.created_at.$lte = new Date(endDate);
            }
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .populate('user_id', 'first_name last_name email')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            AuditLog.countDocuments(query)
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

    // ============ GET LOG BY ID ============
    /**
     * Get a single audit log by ID
     */
    async getLogById(logId) {
        const log = await AuditLog.findById(logId)
            .populate('user_id', 'first_name last_name email user_type');

        if (!log) {
            throw ApiError.notFound('Audit log not found');
        }

        return log;
    }

    // ============ GET USER ACTIVITY ============
    /**
     * Get activity logs for a specific user
     */
    async getUserActivity(userId, { page = 1, limit = 10 }) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        return this.getLogs({
            userId,
            page,
            limit,
            sortBy: 'created_at',
            sortOrder: 'desc'
        });
    }

    // ============ GET MODULE ACTIVITY ============
    /**
     * Get activity logs for a specific module
     */
    async getModuleActivity(module, { page = 1, limit = 10, moduleId = null }) {
        return this.getLogs({
            module,
            moduleId,
            page,
            limit,
            sortBy: 'created_at',
            sortOrder: 'desc'
        });
    }

    // ============ GET ACTIVITY STATISTICS ============
    /**
     * Get statistics about audit logs
     */
    async getActivityStatistics({ startDate = null, endDate = null, module = null }) {
        const matchQuery = {};
        
        if (startDate || endDate) {
            matchQuery.created_at = {};
            if (startDate) {
                matchQuery.created_at.$gte = new Date(startDate);
            }
            if (endDate) {
                matchQuery.created_at.$lte = new Date(endDate);
            }
        }

        if (module) {
            matchQuery.module = module;
        }

        const [
            totalLogs,
            moduleWise,
            actionWise,
            userTypeWise,
            statusWise,
            recentActivity
        ] = await Promise.all([
            AuditLog.countDocuments(matchQuery),
            AuditLog.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$module', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            AuditLog.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            AuditLog.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$user_type', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            AuditLog.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            AuditLog.find(matchQuery)
                .populate('user_id', 'first_name last_name email')
                .sort({ created_at: -1 })
                .limit(10)
        ]);

        return {
            totalLogs,
            moduleWise,
            actionWise,
            userTypeWise,
            statusWise,
            recentActivity
        };
    }

    // ============ CLEANUP OLD LOGS ============
    /**
     * Delete audit logs older than specified days
     */
    async cleanupOldLogs(days = 30) {
        const date = new Date();
        date.setDate(date.getDate() - days);

        const result = await AuditLog.deleteMany({
            created_at: { $lt: date }
        });

        logger.info(`Cleaned up ${result.deletedCount} old audit logs`, {
            olderThan: `${days} days`
        });

        return {
            deletedCount: result.deletedCount,
            olderThan: `${days} days`
        };
    }

    // ============ EXPORT LOGS ============
    /**
     * Export logs to JSON format
     */
    async exportLogs({
        startDate = null,
        endDate = null,
        module = null,
        userId = null
    }) {
        const query = {};

        if (startDate || endDate) {
            query.created_at = {};
            if (startDate) {
                query.created_at.$gte = new Date(startDate);
            }
            if (endDate) {
                query.created_at.$lte = new Date(endDate);
            }
        }

        if (module) {
            query.module = module;
        }

        if (userId) {
            query.user_id = userId;
        }

        const logs = await AuditLog.find(query)
            .populate('user_id', 'first_name last_name email')
            .sort({ created_at: -1 });

        return {
            count: logs.length,
            logs,
            exportedAt: new Date().toISOString()
        };
    }

    // ============ GET USER ACTIVITY SUMMARY ============
    /**
     * Get summary of user activity
     */
    async getUserActivitySummary(userId, { days = 30 }) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const logs = await AuditLog.find({
            user_id: userId,
            created_at: { $gte: startDate }
        });

        // Count by action
        const actionSummary = {};
        for (const log of logs) {
            if (!actionSummary[log.action]) {
                actionSummary[log.action] = 0;
            }
            actionSummary[log.action]++;
        }

        // Count by module
        const moduleSummary = {};
        for (const log of logs) {
            if (!moduleSummary[log.module]) {
                moduleSummary[log.module] = 0;
            }
            moduleSummary[log.module]++;
        }

        return {
            userId,
            userEmail: user.email,
            period: `${days} days`,
            totalActivities: logs.length,
            actionSummary,
            moduleSummary
        };
    }

    // ============ LOG ACTION HELPERS ============
    /**
     * Log user login
     */
    async logLogin(userId, ip, userAgent) {
        return this.log({
            userId,
            action: 'login',
            module: 'auth',
            description: 'User logged in',
            ip,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log user logout
     */
    async logLogout(userId, ip, userAgent) {
        return this.log({
            userId,
            action: 'logout',
            module: 'auth',
            description: 'User logged out',
            ip,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log failed login attempt
     */
    async logFailedLogin(email, ip, userAgent, reason = 'Invalid credentials') {
        return this.log({
            userId: null,
            action: 'login_failed',
            module: 'auth',
            description: `Failed login attempt for ${email}`,
            newData: { email, reason },
            ip,
            userAgent,
            status: 'failed',
            errorMessage: reason
        });
    }

    /**
     * Log password change
     */
    async logPasswordChange(userId, ip, userAgent) {
        return this.log({
            userId,
            action: 'password_change',
            module: 'auth',
            description: 'User changed password',
            ip,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log order creation
     */
    async logOrderCreation(userId, orderId, orderData, ip, userAgent) {
        return this.log({
            userId,
            action: 'create',
            module: 'order',
            moduleId: orderId,
            description: `Order created: ${orderData.order_number}`,
            newData: orderData,
            ip,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log order status update
     */
    async logOrderStatusUpdate(userId, orderId, oldStatus, newStatus, ip, userAgent) {
        return this.log({
            userId,
            action: 'update',
            module: 'order',
            moduleId: orderId,
            description: `Order status updated from ${oldStatus} to ${newStatus}`,
            oldData: { status: oldStatus },
            newData: { status: newStatus },
            ip,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log product creation
     */
    async logProductCreation(userId, productId, productData, ip, userAgent) {
        return this.log({
            userId,
            action: 'create',
            module: 'product',
            moduleId: productId,
            description: `Product created: ${productData.product_name}`,
            newData: productData,
            ip,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log product update
     */
    async logProductUpdate(userId, productId, oldData, newData, ip, userAgent) {
        return this.log({
            userId,
            action: 'update',
            module: 'product',
            moduleId: productId,
            description: `Product updated: ${newData.product_name || productId}`,
            oldData,
            newData,
            ip,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log seller approval
     */
    async logSellerApproval(adminId, sellerId, sellerData, ip, userAgent) {
        return this.log({
            userId: adminId,
            action: 'approve',
            module: 'seller',
            moduleId: sellerId,
            description: `Seller approved: ${sellerData.business_name}`,
            newData: sellerData,
            ip,
            userAgent,
            status: 'success'
        });
    }

    /**
     * Log payment transaction
     */
    async logPayment(userId, paymentId, amount, status, ip, userAgent) {
        return this.log({
            userId,
            action: status === 'success' ? 'payment_success' : 'payment_failed',
            module: 'payment',
            moduleId: paymentId,
            description: `Payment of ₹${amount} ${status === 'success' ? 'successful' : 'failed'}`,
            newData: { amount, status },
            ip,
            userAgent,
            status: status === 'success' ? 'success' : 'failed'
        });
    }
}

module.exports = new AuditService();