// Payment route definitions
// Initiate, confirm, refund, webhook, status check
// Mixed customer, seller, admin, and public (webhook) routes

const express = require('express');
const router = express.Router();

const paymentController = require('../../controllers/payment/payment.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const paymentValidation = require('../../validations/payment.validation');

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment management endpoints
 */

// ============ CUSTOMER ROUTES (Auth Required) ============
router.use(auth);

/**
 * @swagger
 * /payment/initiate:
 *   post:
 *     summary: Initiate payment
 *     description: Initiate a new payment for an order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - payment_method
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               payment_method:
 *                 type: string
 *                 enum: [credit_card, debit_card, upi, net_banking, cash_on_delivery, wallet]
 *               gateway:
 *                 type: string
 *                 enum: [razorpay, paytm, stripe, paypal]
 *                 default: razorpay
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Order not found
 *       422:
 *         description: Validation error
 *       409:
 *         description: Order already paid
 */
router.post(
    '/initiate',
    authorize('customer'),
    validate(paymentValidation.initiatePayment),
    paymentController.initiatePayment
);

/**
 * @swagger
 * /payment/confirm:
 *   post:
 *     summary: Confirm payment
 *     description: Confirm a payment after gateway response
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_id
 *               - payment_data
 *             properties:
 *               payment_id:
 *                 type: string
 *               payment_data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Payment not found
 *       409:
 *         description: Payment already processed
 */
router.post(
    '/confirm',
    authorize('customer'),
    validate(paymentValidation.confirmPayment),
    paymentController.confirmPayment
);

/**
 * @swagger
 * /payment/{paymentId}/status:
 *   get:
 *     summary: Get payment status
 *     description: Get status of a specific payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment status fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Payment not found
 */
router.get(
    '/:paymentId/status',
    authorize('customer'),
    validate(paymentValidation.paymentIdParam),
    paymentController.getPaymentStatus
);

/**
 * @swagger
 * /payment/user/payments:
 *   get:
 *     summary: Get user payments
 *     description: Get all payments of the authenticated user
 *     tags: [Payment]
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
 *           enum: [pending, paid, failed, refunded, partially_refunded]
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
 *         description: Payments fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 */
router.get(
    '/user/payments',
    authorize('customer'),
    validate(paymentValidation.getPayments),
    paymentController.getUserPayments
);

/**
 * @swagger
 * /payment/user/transactions:
 *   get:
 *     summary: Get user transactions
 *     description: Get all transactions of the authenticated user
 *     tags: [Payment]
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
 *           enum: [payment, refund, payout, commission]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed, processing]
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
 *         description: Transactions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 */
router.get(
    '/user/transactions',
    authorize('customer'),
    validate(paymentValidation.getTransactions),
    paymentController.getUserTransactions
);

/**
 * @swagger
 * /payment/{paymentId}/refund:
 *   post:
 *     summary: Request refund
 *     description: Request a refund for a payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
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
 *                 minLength: 5
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Refund requested successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Payment not found
 *       409:
 *         description: Refund already requested
 */
router.post(
    '/:paymentId/refund',
    authorize('customer'),
    validate(paymentValidation.requestRefund),
    paymentController.requestRefund
);

/**
 * @swagger
 * /payment/refund/{refundId}/status:
 *   get:
 *     summary: Get refund status
 *     description: Get status of a specific refund
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema:
 *           type: string
 *         description: Refund ID
 *     responses:
 *       200:
 *         description: Refund status fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Refund not found
 */
router.get(
    '/refund/:refundId/status',
    authorize('customer'),
    validate(paymentValidation.refundIdParam),
    paymentController.getRefundStatus
);

// ============ SELLER ROUTES (Auth Required) ============

/**
 * @swagger
 * /payment/seller/payments:
 *   get:
 *     summary: Get seller payments
 *     description: Get all payments for the authenticated seller
 *     tags: [Payment]
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
 *           enum: [pending, paid, failed, refunded, partially_refunded]
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
 *         description: Seller payments fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 */
router.get(
    '/seller/payments',
    authorize('seller'),
    validate(paymentValidation.getPayments),
    paymentController.getSellerPayments
);

/**
 * @swagger
 * /payment/seller/transactions:
 *   get:
 *     summary: Get seller transactions
 *     description: Get all transactions for the authenticated seller
 *     tags: [Payment]
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
 *           enum: [payment, refund, payout, commission]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed, processing]
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
 *         description: Seller transactions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 */
router.get(
    '/seller/transactions',
    authorize('seller'),
    validate(paymentValidation.getTransactions),
    paymentController.getSellerTransactions
);

/**
 * @swagger
 * /payment/seller/summary:
 *   get:
 *     summary: Get seller payment summary
 *     description: Get payment summary for the authenticated seller
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller payment summary fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 */
router.get(
    '/seller/summary',
    authorize('seller'),
    paymentController.getSellerPaymentSummary
);

// ============ ADMIN ROUTES (Auth Required) ============

/**
 * @swagger
 * /payment/admin/all:
 *   get:
 *     summary: Get all payments (Admin)
 *     description: Get all payments across all users
 *     tags: [Payment]
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
 *           enum: [pending, paid, failed, refunded, partially_refunded]
 *       - in: query
 *         name: payment_method
 *         schema:
 *           type: string
 *           enum: [credit_card, debit_card, upi, net_banking, cash_on_delivery, wallet]
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
 *         description: All payments fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/all',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_payments'),
    validate(paymentValidation.getPayments),
    paymentController.adminGetAllPayments
);

/**
 * @swagger
 * /payment/admin/transactions:
 *   get:
 *     summary: Get all transactions (Admin)
 *     description: Get all transactions across all users
 *     tags: [Payment]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [payment, refund, payout, commission]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed, processing]
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
 *         description: All transactions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/transactions',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_payments'),
    validate(paymentValidation.getTransactions),
    paymentController.adminGetAllTransactions
);

/**
 * @swagger
 * /payment/admin/{paymentId}/refund:
 *   post:
 *     summary: Admin process refund
 *     description: Process a refund by admin
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - reason
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               reason:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Payment not found
 *       409:
 *         description: Payment not paid or already refunded
 */
router.post(
    '/admin/:paymentId/refund',
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_payments'),
    validate(paymentValidation.adminProcessRefund),
    paymentController.adminProcessRefund
);

/**
 * @swagger
 * /payment/admin/statistics:
 *   get:
 *     summary: Get payment statistics (Admin)
 *     description: Get payment statistics for admin dashboard
 *     tags: [Payment]
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
 *         description: Payment statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/statistics',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    validate(paymentValidation.getPaymentStatistics),
    paymentController.getPaymentStatistics
);

/**
 * @swagger
 * /payment/admin/seller/{sellerId}/summary:
 *   get:
 *     summary: Get seller payment summary (Admin)
 *     description: Get payment summary of a specific seller
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller payment summary fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Seller not found
 */
router.get(
    '/admin/seller/:sellerId/summary',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_payments'),
    validate(paymentValidation.sellerIdParam),
    paymentController.adminGetSellerPaymentSummary
);

// ============ SUB-ADMIN ROUTES (Auth Required) ============

/**
 * @swagger
 * /payment/sub-admin/seller/{sellerId}/payments:
 *   get:
 *     summary: Get payments by seller (Sub-Admin)
 *     description: Get all payments of a specific seller
 *     tags: [Payment]
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
 *           enum: [pending, paid, failed, refunded, partially_refunded]
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
 *         description: Seller payments fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       404:
 *         description: Seller not found
 */
router.get(
    '/sub-admin/seller/:sellerId/payments',
    authorize('sub_admin'),
    checkPermission('view_payments'),
    validate(paymentValidation.sellerIdParam),
    paymentController.getSellerPayments
);

// ============ WEBHOOK (Public) ============

/**
 * @swagger
 * /payment/webhook:
 *   post:
 *     summary: Payment gateway webhook
 *     description: Webhook endpoint for payment gateway callbacks (Public)
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook payload
 */
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    paymentController.webhook
);

module.exports = router;