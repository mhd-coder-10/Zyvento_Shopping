// Notification route definitions
// Fetch notifications, mark read/unread, delete, broadcast
// All notification routes require authentication

const express = require('express');
const router = express.Router();

const notificationController = require('../../controllers/notification/notification.controller');
const auth = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const notificationValidation = require('../../validations/notification.validation');
const {authorize, checkPermission} = require('../../middleware/authorization.middleware')

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Notification management endpoints
 */

// ============ ALL NOTIFICATION ROUTES REQUIRE AUTH ============
router.use(auth);

// ============ GET NOTIFICATIONS ============

/**
 * @swagger
 * /notification:
 *   get:
 *     summary: Get all notifications
 *     description: Get paginated list of user notifications
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [order, payment, product, inventory, profile, seller, employee, offer, return, refund, system, promotion, security, role_change, permission_change]
 *         description: Filter by notification type
 *       - in: query
 *         name: is_read
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/',
    validate(notificationValidation.getNotifications),
    notificationController.getNotifications
);

/**
 * @swagger
 * /notification/unread:
 *   get:
 *     summary: Get unread notifications
 *     description: Get all unread notifications for the user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Unread notifications fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/unread',
    validate(notificationValidation.getNotifications),
    notificationController.getUnreadNotifications
);

/**
 * @swagger
 * /notification/{notificationId}:
 *   get:
 *     summary: Get notification by ID
 *     description: Get detailed information of a specific notification
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.get(
    '/:notificationId',
    validate(notificationValidation.notificationIdParam),
    notificationController.getNotificationById
);

// ============ MARK AS READ ============

/**
 * @swagger
 * /notification/{notificationId}/read:
 *   put:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.put(
    '/:notificationId/read',
    validate(notificationValidation.notificationIdParam),
    notificationController.markAsRead
);

/**
 * @swagger
 * /notification/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     description: Mark all notifications as read for the user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.put(
    '/read-all',
    notificationController.markAllAsRead
);

// ============ DELETE NOTIFICATIONS ============

/**
 * @swagger
 * /notification/{notificationId}:
 *   delete:
 *     summary: Delete notification (Soft Delete)
 *     description: Soft delete a specific notification
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.delete(
    '/:notificationId',
    validate(notificationValidation.notificationIdParam),
    notificationController.deleteNotification
);

/**
 * @swagger
 * /notification/clear/all:
 *   delete:
 *     summary: Clear all notifications
 *     description: Soft delete all notifications for the user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete(
    '/clear/all',
    notificationController.clearAllNotifications
);

// ============ NOTIFICATION PREFERENCES ============

/**
 * @swagger
 * /notification/preferences:
 *   get:
 *     summary: Get notification preferences
 *     description: Get user's notification preferences
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification preferences fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/preferences',
    notificationController.getPreferences
);

/**
 * @swagger
 * /notification/preferences:
 *   put:
 *     summary: Update notification preferences
 *     description: Update user's notification preferences
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: boolean
 *               push:
 *                 type: boolean
 *               sms:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.put(
    '/preferences',
    validate(notificationValidation.updatePreferences),
    notificationController.updatePreferences
);

// ============ NOTIFICATION STATISTICS ============

/**
 * @swagger
 * /notification/statistics:
 *   get:
 *     summary: Get notification statistics
 *     description: Get statistics about user's notifications
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification statistics fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/statistics',
    notificationController.getStatistics
);

// ============ ADMIN ROUTES ============

/**
 * @swagger
 * /notification/admin/broadcast:
 *   post:
 *     summary: Send broadcast notification (Admin)
 *     description: Send broadcast notification to all users or specific user types
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - receiver_type
 *               - notification_type
 *             properties:
 *               title:
 *                 type: string
 *                 example: "System Update"
 *               message:
 *                 type: string
 *                 example: "Our system will be down for maintenance tonight."
 *               receiver_type:
 *                 type: string
 *                 enum: [all, customer, seller, seller_employee, admin, sub_admin]
 *               notification_type:
 *                 type: string
 *                 enum: [order, payment, product, inventory, profile, seller, employee, offer, return, refund, system, promotion, security, role_change, permission_change]
 *               channel:
 *                 type: string
 *                 enum: [email, sms, push_notification, in_app]
 *                 default: in_app
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 default: medium
 *     responses:
 *       201:
 *         description: Broadcast notification sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.post(
    '/admin/broadcast',
    authorize('super_admin', 'sub_admin'),
    checkPermission('send_notifications'),
    validate(notificationValidation.sendBroadcast),
    notificationController.sendBroadcast
);

/**
 * @swagger
 * /notification/admin/all:
 *   get:
 *     summary: Get all notifications (Admin)
 *     description: Get all notifications across all users (Admin only)
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: receiver_type
 *         schema:
 *           type: string
 *           enum: [customer, seller, seller_employee, admin, sub_admin]
 *       - in: query
 *         name: notification_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_read
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: All notifications fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/all',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_notifications'),
    validate(notificationValidation.getNotifications),
    notificationController.adminGetAllNotifications
);

module.exports = router;