// Handles all notification related business logic
// Manages creating notifications, marking as read/unread, deleting notifications
// Also handles notification preferences, statistics, and admin broadcast

const Notification = require('../../models/notification.model');
const User = require('../../models/user.model');
const Seller = require('../../models/seller.model');
const Employee = require('../../models/employee.model');
const ApiError = require('../../utils/apiError');
const emailHelper = require('../../utils/emailHelper');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');

class NotificationService {

    // ============ CREATE NOTIFICATION ============
    async createNotification({
        userId,
        receiverType,
        title,
        message,
        notificationType,
        referenceId = null,
        referenceModel = null,
        channel = 'in_app',
        priority = 'medium',
        metadata = {},
        senderId = null
    }) {
        // Create notification in database
        const notification = new Notification({
            user_id: userId,
            receiver_type: receiverType,
            sender_id: senderId,
            title,
            message,
            notification_type: notificationType,
            reference_id: referenceId,
            reference_model: referenceModel,
            channel,
            priority,
            metadata,
            status: 'pending'
        });

        await notification.save();

        // Send email if channel includes email
        if (channel === 'email' || channel === 'both') {
            await this.sendEmailNotification(notification);
        }

        logger.info(`Notification created for user: ${userId}`, { notificationId: notification._id });

        return notification;
    }

    // ============ SEND EMAIL NOTIFICATION ============
    async sendEmailNotification(notification) {
        try {
            const user = await User.findById(notification.user_id);
            if (!user || !user.email) return;

            await emailHelper.sendEmail({
                to: user.email,
                subject: notification.title,
                text: notification.message,
                html: this.getEmailTemplate(notification)
            });

            notification.status = 'sent';
            notification.sent_at = new Date();
            await notification.save();

        } catch (error) {
            notification.status = 'failed';
            notification.error_message = error.message;
            await notification.save();
            logger.error('Failed to send email notification:', error);
        }
    }

    // ============ GET EMAIL TEMPLATE ============
    getEmailTemplate(notification) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #333;">${notification.title}</h2>
                <p style="font-size: 16px; color: #555;">${notification.message}</p>
                ${notification.action_url ? `
                    <div style="background: #4CAF50; padding: 12px 30px; text-align: center; border-radius: 5px; margin: 20px 0; display: inline-block;">
                        <a href="${notification.action_url}" style="color: white; text-decoration: none; font-size: 16px; font-weight: bold;">
                            ${notification.action_label || 'View Details'}
                        </a>
                    </div>
                ` : ''}
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
            </div>
        `;
    }

    // ============ GET NOTIFICATIONS ============
    async getNotifications({ userId, page = 1, limit = 10, type = null, isRead = null }) {
        const query = {
            user_id: userId,
            is_deleted: false
        };

        if (type) {
            query.notification_type = type;
        }

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

        // Get unread count
        const unreadCount = await Notification.countDocuments({
            user_id: userId,
            is_read: false,
            is_deleted: false
        });

        return {
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            },
            unreadCount
        };
    }

    async getUnreadNotifications({ userId, page = 1, limit = 10 }) {
        return this.getNotifications({
            userId,
            page,
            limit,
            isRead: false
        });
    }

    async getNotificationById({ notificationId, userId }) {
        const notification = await Notification.findOne({
            _id: notificationId,
            user_id: userId,
            is_deleted: false
        });

        if (!notification) {
            throw ApiError.notFound('Notification not found');
        }

        return notification;
    }

    // ============ MARK AS READ ============
    async markAsRead({ notificationId, userId }) {
        const notification = await Notification.findOne({
            _id: notificationId,
            user_id: userId,
            is_deleted: false
        });

        if (!notification) {
            throw ApiError.notFound('Notification not found');
        }

        if (notification.is_read) {
            return notification;
        }

        notification.is_read = true;
        notification.read_at = new Date();
        notification.status = 'read';
        await notification.save();

        return notification;
    }

    async markAllAsRead(userId) {
        const result = await Notification.updateMany(
            {
                user_id: userId,
                is_read: false,
                is_deleted: false
            },
            {
                is_read: true,
                read_at: new Date(),
                status: 'read'
            }
        );

        return {
            message: 'All notifications marked as read',
            updatedCount: result.modifiedCount
        };
    }

    // ============ DELETE NOTIFICATIONS ============
    async deleteNotification({ notificationId, userId }) {
        const notification = await Notification.findOne({
            _id: notificationId,
            user_id: userId,
            is_deleted: false
        });

        if (!notification) {
            throw ApiError.notFound('Notification not found');
        }

        notification.is_deleted = true;
        notification.deleted_at = new Date();
        await notification.save();

        return { message: 'Notification deleted successfully' };
    }

    async clearAllNotifications(userId) {
        const result = await Notification.updateMany(
            {
                user_id: userId,
                is_deleted: false
            },
            {
                is_deleted: true,
                deleted_at: new Date()
            }
        );

        return {
            message: 'All notifications cleared successfully',
            clearedCount: result.modifiedCount
        };
    }

    // ============ NOTIFICATION PREFERENCES ============
    async getPreferences(userId) {
        const user = await User.findById(userId).select('preferences');
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        return user.preferences?.notifications || {
            email: true,
            push: true,
            sms: false
        };
    }

    async updatePreferences({ userId, preferences }) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        if (!user.preferences) {
            user.preferences = {};
        }

        user.preferences.notifications = {
            email: preferences.email !== undefined ? preferences.email : true,
            push: preferences.push !== undefined ? preferences.push : true,
            sms: preferences.sms !== undefined ? preferences.sms : false
        };

        await user.save();

        return user.preferences.notifications;
    }

    // ============ NOTIFICATION STATISTICS ============
    async getStatistics(userId) {
        const [total, unread, read, types] = await Promise.all([
            Notification.countDocuments({
                user_id: userId,
                is_deleted: false
            }),
            Notification.countDocuments({
                user_id: userId,
                is_read: false,
                is_deleted: false
            }),
            Notification.countDocuments({
                user_id: userId,
                is_read: true,
                is_deleted: false
            }),
            Notification.aggregate([
                {
                    $match: {
                        user_id: userId,
                        is_deleted: false
                    }
                },
                {
                    $group: {
                        _id: '$notification_type',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        return {
            total,
            unread,
            read,
            types
        };
    }

    // ============ ADMIN ROUTES ============
    async sendBroadcast({
        title,
        message,
        receiverType,
        notificationType,
        channel = 'in_app',
        priority = 'medium',
        senderId = null
    }) {
        let users = [];

        // Get users based on receiver type
        if (receiverType === 'all') {
            users = await User.find({
                account_status: constants.ACCOUNT_STATUS.ACTIVE
            }).select('_id');
        } else if (receiverType === 'customer') {
            users = await User.find({
                user_type: constants.USER_TYPES.CUSTOMER,
                account_status: constants.ACCOUNT_STATUS.ACTIVE
            }).select('_id');
        } else if (receiverType === 'seller') {
            users = await User.find({
                user_type: constants.USER_TYPES.SELLER,
                account_status: constants.ACCOUNT_STATUS.ACTIVE
            }).select('_id');
        } else if (receiverType === 'seller_employee') {
            users = await User.find({
                user_type: constants.USER_TYPES.SELLER_EMPLOYEE,
                account_status: constants.ACCOUNT_STATUS.ACTIVE
            }).select('_id');
        } else if (receiverType === 'admin' || receiverType === 'sub_admin') {
            users = await User.find({
                user_type: { $in: ['super_admin', 'sub_admin', 'admin_employee'] },
                account_status: constants.ACCOUNT_STATUS.ACTIVE
            }).select('_id');
        } else {
            throw ApiError.badRequest('Invalid receiver type');
        }

        // Create notifications for all users
        const notifications = [];
        for (const user of users) {
            const notification = await this.createNotification({
                userId: user._id,
                receiverType: receiverType === 'all' ? 'customer' : receiverType,
                title,
                message,
                notificationType,
                channel,
                priority,
                senderId
            });
            notifications.push(notification._id);
        }

        logger.info(`Broadcast notification sent to ${users.length} users`, {
            senderId,
            receiverType,
            notificationType
        });

        return {
            totalRecipients: users.length,
            notificationsCount: notifications.length
        };
    }

    async adminGetAllNotifications({
        page = 1,
        limit = 10,
        receiverType = null,
        notificationType = null,
        isRead = null
    }) {
        const query = {
            is_deleted: false
        };

        if (receiverType) {
            query.receiver_type = receiverType;
        }

        if (notificationType) {
            query.notification_type = notificationType;
        }

        if (isRead !== null) {
            query.is_read = isRead === 'true' || isRead === true;
        }

        const [notifications, total] = await Promise.all([
            Notification.find(query)
                .populate('user_id', 'first_name last_name email user_type')
                .populate('sender_id', 'first_name last_name email')
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
}

module.exports = new NotificationService();