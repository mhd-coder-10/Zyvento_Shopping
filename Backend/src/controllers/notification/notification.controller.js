// Handles all notification related API requests
// Manages fetching notifications, marking as read/unread, deleting notifications
// Also handles notification preferences, statistics, and admin broadcast

const notificationService = require('../../services/notification/notification.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');


const notificationController = {

    // ============ GET NOTIFICATIONS ============
    getNotifications: asyncHandler(async (req, res) => {
        // ✅ FIX: Use req.user.id instead of req.userId
        const userId = req.user?.id || req.userId;
        const { page = 1, limit = 10, type = null, is_read = null } = req.query;

        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        const result = await notificationService.getNotifications({
            userId,
            page,
            limit,
            type,
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

    getUnreadNotifications: asyncHandler(async (req, res) => {
        // ✅ FIX: Use req.user.id instead of req.userId
        const userId = req.user?.id || req.userId;
        const { page = 1, limit = 10 } = req.query;

        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        const result = await notificationService.getUnreadNotifications({
            userId,
            page,
            limit
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.notifications,
                result.pagination,
                'Unread notifications fetched successfully'
            )
        );
    }),

    getNotificationById: asyncHandler(async (req, res) => {
        // ✅ FIX: Use req.user.id instead of req.userId
        const userId = req.user?.id || req.userId;
        const { notificationId } = req.params;

        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        const notification = await notificationService.getNotificationById({
            notificationId,
            userId
        });

        res.status(200).json(
            ApiResponse.success(notification, 'Notification details fetched successfully')
        );
    }),

    // ============ MARK AS READ ============
    markAsRead: asyncHandler(async (req, res) => {
        // ✅ FIX: Use req.user.id instead of req.userId
        const userId = req.user?.id || req.userId;
        const { notificationId } = req.params;

        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        const notification = await notificationService.markAsRead({
            notificationId,
            userId
        });

        res.status(200).json(
            ApiResponse.success(notification, 'Notification marked as read')
        );
    }),

    markAllAsRead: asyncHandler(async (req, res) => {
        // ✅ FIX: Use req.user.id instead of req.userId
        const userId = req.user?.id || req.userId;

        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        const result = await notificationService.markAllAsRead(userId);

        res.status(200).json(
            ApiResponse.success(result, 'All notifications marked as read')
        );
    }),

    // ============ DELETE NOTIFICATIONS ============
    deleteNotification: asyncHandler(async (req, res) => {
        // ✅ FIX: Use req.user.id instead of req.userId
        const userId = req.user?.id || req.userId;
        const { notificationId } = req.params;

        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        await notificationService.deleteNotification({
            notificationId,
            userId
        });

        res.status(200).json(
            ApiResponse.success(null, 'Notification deleted successfully')
        );
    }),

    clearAllNotifications: asyncHandler(async (req, res) => {
        // ✅ FIX: Use req.user.id instead of req.userId
        const userId = req.user?.id || req.userId;

        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        const result = await notificationService.clearAllNotifications(userId);

        res.status(200).json(
            ApiResponse.success(result, 'All notifications cleared successfully')
        );
    }),

    // ============ NOTIFICATION PREFERENCES ============
    getPreferences: asyncHandler(async (req, res) => {
        // ✅ FIX: Use req.user.id instead of req.userId
        const userId = req.user?.id || req.userId;

        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        const preferences = await notificationService.getPreferences(userId);

        res.status(200).json(
            ApiResponse.success(preferences, 'Notification preferences fetched successfully')
        );
    }),

    updatePreferences: asyncHandler(async (req, res) => {
        // ✅ FIX: Use req.user.id instead of req.userId
        const userId = req.user?.id || req.userId;
        const preferences = req.body;

        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        const updatedPreferences = await notificationService.updatePreferences({
            userId,
            preferences
        });

        res.status(200).json(
            ApiResponse.success(updatedPreferences, 'Notification preferences updated successfully')
        );
    }),

    // ============ NOTIFICATION STATISTICS ============
    getStatistics: asyncHandler(async (req, res) => {
        // ✅ FIX: Use req.user.id instead of req.userId
        const userId = req.user?.id || req.userId;

        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        const statistics = await notificationService.getStatistics(userId);

        res.status(200).json(
            ApiResponse.success(statistics, 'Notification statistics fetched successfully')
        );
    }),

    // ============ ADMIN ROUTES ============
    sendBroadcast: asyncHandler(async (req, res) => {
        // ✅ FIX: Use req.user.id instead of req.userId
        const userId = req.user?.id || req.userId;
        const { title, message, receiver_type, notification_type, channel, priority } = req.body;

        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        const result = await notificationService.sendBroadcast({
            title,
            message,
            receiverType: receiver_type,
            notificationType: notification_type,
            channel: channel || 'in_app',
            priority: priority || 'medium',
            senderId: userId
        });

        res.status(201).json(
            ApiResponse.created(result, 'Broadcast notification sent successfully')
        );
    }),

    adminGetAllNotifications: asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, receiver_type = null, notification_type = null, is_read = null } = req.query;

        const result = await notificationService.adminGetAllNotifications({
            page,
            limit,
            receiverType: receiver_type,
            notificationType: notification_type,
            isRead: is_read
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.notifications,
                result.pagination,
                'All notifications fetched successfully'
            )
        );
    })
};

module.exports = notificationController;