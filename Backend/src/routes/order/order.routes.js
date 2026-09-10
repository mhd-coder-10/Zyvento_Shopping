// Order main route definitions
// Place order, fetch orders, status update, cancellation
// Mixed public, customer, seller, and admin routes

const express = require('express');
const router = express.Router();

const orderController = require('../../controllers/order/order.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission, checkSellerAccess } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const orderValidation = require('../../validations/order.validation');

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management endpoints
 */

// ============ PUBLIC ROUTES ============

/**
 * @swagger
 * /order/track/{orderNumber}:
 *   get:
 *     summary: Track order by order number
 *     description: Get order tracking details using order number (Public)
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number (e.g., ORD-xxx-xxx)
 *     responses:
 *       200:
 *         description: Order tracking details fetched successfully
 *       404:
 *         description: Order not found
 */
router.get(
    '/track/:orderNumber',
    validate(orderValidation.trackOrder),
    orderController.trackOrder
);

// ============ CUSTOMER ROUTES ============

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Place order (Customer only)
 *     description: Place a new order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipping_address
 *               - order_items
 *               - payment_method
 *             properties:
 *               shipping_address:
 *                 type: object
 *                 required:
 *                   - full_name
 *                   - mobile_number
 *                   - city
 *                   - state
 *                   - country
 *                   - pincode
 *                 properties:
 *                   full_name:
 *                     type: string
 *                   mobile_number:
 *                     type: string
 *                   house_number:
 *                     type: string
 *                   street:
 *                     type: string
 *                   landmark:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   pincode:
 *                     type: string
 *               order_items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     variant:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         option:
 *                           type: string
 *               payment_method:
 *                 type: string
 *                 enum: [credit_card, debit_card, upi, net_banking, cash_on_delivery, wallet]
 *               coupon_code:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       422:
 *         description: Validation error
 *       409:
 *         description: Insufficient stock
 */
router.post(
    '/',
    auth,
    authorize('customer'),
    validate(orderValidation.placeOrder),
    orderController.placeOrder
);

/**
 * @swagger
 * /order/customer/orders:
 *   get:
 *     summary: Get customer orders
 *     description: Get all orders of the authenticated customer
 *     tags: [Order]
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
 *         name: order_status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, packed, shipped, out_for_delivery, delivered, cancelled, returned]
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
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
 *         description: Orders fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 */
router.get(
    '/customer/orders',
    auth,
    authorize('customer'),
    validate(orderValidation.getOrders),
    orderController.getCustomerOrders
);

/**
 * @swagger
 * /order/customer/{orderId}:
 *   get:
 *     summary: Get customer order details
 *     description: Get detailed information of a specific order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Order not found
 */
router.get(
    '/customer/:orderId',
    auth,
    authorize('customer'),
    validate(orderValidation.orderIdParam),
    orderController.getCustomerOrderDetails
);

/**
 * @swagger
 * /order/{orderId}/cancel:
 *   post:
 *     summary: Cancel order (Customer only)
 *     description: Cancel an order by the customer
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Order not found
 *       409:
 *         description: Order already delivered or cancelled
 */
router.post(
    '/:orderId/cancel',
    auth,
    authorize('customer'),
    validate(orderValidation.cancelOrder),
    orderController.cancelOrder
);

/**
 * @swagger
 * /order/{orderId}/return:
 *   post:
 *     summary: Request return (Customer only)
 *     description: Request a return for an order item
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_item_id
 *               - reason
 *             properties:
 *               order_item_id:
 *                 type: string
 *               reason:
 *                 type: string
 *                 enum: [defective_product, wrong_product, size_issue, color_issue, quality_issue, not_as_expected, damaged_delivery, other]
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Return request submitted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Order not found
 *       409:
 *         description: Return already requested
 */
router.post(
    '/:orderId/return',
    auth,
    authorize('customer'),
    validate(orderValidation.requestReturn),
    orderController.requestReturn
);

// ============ SELLER ROUTES ============

/**
 * @swagger
 * /order/seller/orders:
 *   get:
 *     summary: Get seller orders
 *     description: Get all orders for the authenticated seller
 *     tags: [Order]
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
 *         name: order_status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, packed, shipped, out_for_delivery, delivered, cancelled, returned]
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
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
 *         description: Orders fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 */
router.get(
    '/seller/orders',
    auth,
    authorize('seller', 'seller_employee'),
    validate(orderValidation.getOrders),
    orderController.getSellerOrders
);

/**
 * @swagger
 * /order/seller/{orderId}:
 *   get:
 *     summary: Get seller order details
 *     description: Get detailed information of a specific order for seller
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Order not found
 */
router.get(
    '/seller/:orderId',
    auth,
    authorize('seller', 'seller_employee'),
    checkSellerAccess(),
    validate(orderValidation.orderIdParam),
    orderController.getSellerOrderDetails
);

/**
 * @swagger
 * /order/seller/{orderId}/status:
 *   put:
 *     summary: Update order status (Seller only)
 *     description: Update the status of an order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
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
 *                 enum: [pending, confirmed, packed, shipped, out_for_delivery, delivered, cancelled, returned]
 *               notes:
 *                 type: string
 *               tracking_id:
 *                 type: string
 *               tracking_carrier:
 *                 type: string
 *               tracking_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Order not found
 *       409:
 *         description: Cannot update status of delivered/cancelled order
 */
router.put(
    '/seller/:orderId/status',
    auth,
    authorize('seller'),
    checkSellerAccess(),
    validate(orderValidation.updateOrderStatus),
    orderController.updateOrderStatus
);

// ============ ADMIN ROUTES ============

/**
 * @swagger
 * /order/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     description: Get all orders with filters (Admin only)
 *     tags: [Order]
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
 *         name: order_status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, packed, shipped, out_for_delivery, delivered, cancelled, returned]
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *       - in: query
 *         name: order_number
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
 *       - in: query
 *         name: min_amount
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_amount
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: All orders fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/all',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_orders'),
    validate(orderValidation.getOrders),
    orderController.adminGetAllOrders
);

/**
 * @swagger
 * /order/admin/{orderId}:
 *   get:
 *     summary: Get order details (Admin only)
 *     description: Get detailed information of a specific order (Admin only)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Order not found
 */
router.get(
    '/admin/:orderId',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_orders'),
    validate(orderValidation.orderIdParam),
    orderController.adminGetOrderDetails
);

/**
 * @swagger
 * /order/admin/{orderId}/status:
 *   put:
 *     summary: Admin update order status
 *     description: Update order status by admin
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
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
 *                 enum: [pending, confirmed, packed, shipped, out_for_delivery, delivered, cancelled, returned]
 *               notes:
 *                 type: string
 *               tracking_id:
 *                 type: string
 *               tracking_carrier:
 *                 type: string
 *               tracking_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Order not found
 */
router.put(
    '/admin/:orderId/status',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_orders'),
    validate(orderValidation.updateOrderStatus),
    orderController.adminUpdateOrderStatus
);

/**
 * @swagger
 * /order/admin/{orderId}/cancel:
 *   post:
 *     summary: Admin cancel order
 *     description: Cancel an order by admin
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Order not found
 *       409:
 *         description: Order already delivered or cancelled
 */
router.post(
    '/admin/:orderId/cancel',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_orders'),
    validate(orderValidation.cancelOrder),
    orderController.adminCancelOrder
);

/**
 * @swagger
 * /order/admin/statistics:
 *   get:
 *     summary: Get order statistics (Admin only)
 *     description: Get order statistics for admin dashboard
 *     tags: [Order]
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
 *         description: Order statistics fetched successfully
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
    orderController.getOrderStatistics
);

/**
 * @swagger
 * /order/admin/report:
 *   get:
 *     summary: Get order report (Admin only)
 *     description: Generate order report
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.get(
    '/admin/report',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    validate(orderValidation.dateRange),
    orderController.getOrderReport
);

// ============ SUB-ADMIN ROUTES ============

/**
 * @swagger
 * /order/sub-admin/seller/{sellerId}:
 *   get:
 *     summary: Get orders by seller (Sub-Admin)
 *     description: Get all orders of a specific seller (Sub-Admin access)
 *     tags: [Order]
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
 *         name: order_status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, packed, shipped, out_for_delivery, delivered, cancelled, returned]
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *     responses:
 *       200:
 *         description: Orders fetched successfully
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
    checkPermission('view_orders'),
    validate(orderValidation.sellerIdParam),
    orderController.getOrdersBySeller
);

// ============ ORDER ITEM ROUTES ============

/**
 * @swagger
 * /order/items/{orderItemId}:
 *   get:
 *     summary: Get order item details
 *     description: Get detailed information of a specific order item
 *     tags: [Order]
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
 *         description: Order item details fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order item not found
 */
router.get(
    '/items/:orderItemId',
    auth,
    validate(orderValidation.orderItemIdParam),
    orderController.getOrderItemDetails
);

/**
 * @swagger
 * /order/items/{orderItemId}/status:
 *   put:
 *     summary: Update order item status (Seller only)
 *     description: Update the status of a specific order item
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order item ID
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
 *                 enum: [pending, confirmed, packed, shipped, delivered, returned, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order item status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Order item not found
 */
router.put(
    '/items/:orderItemId/status',
    auth,
    authorize('seller'),
    validate(orderValidation.updateOrderItemStatus),
    orderController.updateOrderItemStatus
);

module.exports = router;