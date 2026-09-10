// Return route definitions
// Return request, processing, status updates
// Mixed customer, seller, and admin routes

const express = require('express');
const router = express.Router();

const returnController = require('../../controllers/order/return.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission, checkSellerAccess } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const orderValidation = require('../../validations/order.validation');

/**
 * @swagger
 * tags:
 *   name: Return
 *   description: Return management endpoints
 */

// ============ CUSTOMER ROUTES ============

/**
 * @swagger
 * /return/customer/returns:
 *   get:
 *     summary: Get customer returns
 *     description: Get all return requests of the authenticated customer
 *     tags: [Return]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [requested, approved, rejected, picked, completed]
 *         description: Filter by return status
 *     responses:
 *       200:
 *         description: Returns fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 */
router.get(
    '/customer/returns',
    auth,
    authorize('customer'),
    validate(orderValidation.getReturns),
    returnController.getCustomerReturns
);

/**
 * @swagger
 * /return/customer/{returnId}:
 *   get:
 *     summary: Get return details
 *     description: Get detailed information of a specific return request
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *         description: Return ID
 *     responses:
 *       200:
 *         description: Return details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Return not found
 */
router.get(
    '/customer/:returnId',
    auth,
    authorize('customer'),
    validate(orderValidation.returnIdParam),
    returnController.getReturnDetails
);

/**
 * @swagger
 * /return/customer/{returnId}/cancel:
 *   delete:
 *     summary: Cancel return request (Customer only)
 *     description: Cancel a pending return request
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *         description: Return ID
 *     responses:
 *       200:
 *         description: Return cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Return not found
 *       409:
 *         description: Cannot cancel processed return
 */
router.delete(
    '/customer/:returnId/cancel',
    auth,
    authorize('customer'),
    validate(orderValidation.returnIdParam),
    returnController.cancelReturn
);

// ============ SELLER ROUTES ============

/**
 * @swagger
 * /return/seller/returns:
 *   get:
 *     summary: Get seller returns
 *     description: Get all return requests for the authenticated seller
 *     tags: [Return]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [requested, approved, rejected, picked, completed]
 *         description: Filter by return status
 *     responses:
 *       200:
 *         description: Returns fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 */
router.get(
    '/seller/returns',
    auth,
    authorize('seller', 'seller_employee'),
    validate(orderValidation.getReturns),
    returnController.getSellerReturns
);

/**
 * @swagger
 * /return/seller/{returnId}/process:
 *   put:
 *     summary: Process return (Seller only)
 *     description: Process a return request by seller
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *         description: Return ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, picked, completed]
 *               admin_comment:
 *                 type: string
 *               refund_amount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Return processed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Return not found
 *       409:
 *         description: Return already processed
 *       422:
 *         description: Validation error
 */
router.put(
    '/seller/:returnId/process',
    auth,
    authorize('seller'),
    checkSellerAccess(),
    validate(orderValidation.processReturn),
    returnController.processReturn
);

// ============ ADMIN ROUTES ============

/**
 * @swagger
 * /return/admin/all:
 *   get:
 *     summary: Get all returns (Admin only)
 *     description: Get all return requests across all sellers
 *     tags: [Return]
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
 *         name: seller_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [requested, approved, rejected, picked, completed]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: All returns fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/all',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_returns'),
    validate(orderValidation.getReturns),
    returnController.adminGetAllReturns
);

/**
 * @swagger
 * /return/admin/{returnId}/process:
 *   put:
 *     summary: Admin process return
 *     description: Process a return request by admin
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *         description: Return ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, picked, completed]
 *               admin_comment:
 *                 type: string
 *               refund_amount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Return processed successfully by admin
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Return not found
 *       409:
 *         description: Return already processed
 *       422:
 *         description: Validation error
 */
router.put(
    '/admin/:returnId/process',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_returns'),
    validate(orderValidation.processReturn),
    returnController.adminProcessReturn
);

/**
 * @swagger
 * /return/admin/statistics:
 *   get:
 *     summary: Get return statistics (Admin only)
 *     description: Get return statistics for admin dashboard
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Return statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/statistics',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    returnController.getReturnStatistics
);

// ============ SUB-ADMIN ROUTES ============

/**
 * @swagger
 * /return/sub-admin/seller/{sellerId}:
 *   get:
 *     summary: Get returns by seller (Sub-Admin)
 *     description: Get all return requests of a specific seller
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [requested, approved, rejected, picked, completed]
 *     responses:
 *       200:
 *         description: Returns fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       404:
 *         description: Seller not found
 */
router.get(
    '/sub-admin/seller/:sellerId',
    auth,
    authorize('sub_admin'),
    checkPermission('view_returns'),
    validate(orderValidation.sellerIdParam),
    returnController.getReturnsBySeller
);

// ============ RETURN ITEM ROUTES ============

/**
 * @swagger
 * /return/order-item/{orderItemId}:
 *   get:
 *     summary: Get return by order item
 *     description: Get return details for a specific order item
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order item ID
 *     responses:
 *       200:
 *         description: Return details fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Return not found for this order item
 */
router.get(
    '/order-item/:orderItemId',
    auth,
    validate(orderValidation.orderItemIdParam),
    returnController.getReturnByOrderItem
);

module.exports = router;