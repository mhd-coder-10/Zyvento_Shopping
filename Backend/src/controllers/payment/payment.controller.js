// Handles all payment related API requests
// Manages payment initiation, confirmation, refunds, and transaction history
// Also handles payment status, webhooks, and seller payment summaries

const paymentService = require('../../services/payment/payment.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service');
const logger = require('../../utils/logger');


const paymentController = {

    // ============ CUSTOMER ROUTES ============
    initiatePayment: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { order_id, payment_method, gateway } = req.body;

        const result = await paymentService.initiatePayment({
            userId,
            orderId: order_id,
            paymentMethod: payment_method,
            gateway
        });

        // Audit log - Payment Initiated
        await auditService.log({
            userId: req.userId,
            action: 'initiate',
            module: 'payment',
            moduleId: result.payment_id,
            description: `Payment initiated for order: ${order_id}`,
            newData: { order_id, payment_method, gateway, amount: result.amount },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        // Log important event
        logger.important('Payment initiated', {
            userId: userId,
            orderId: order_id,
            amount: result.amount,
            paymentMethod: payment_method
        });

        res.status(200).json(
            ApiResponse.success(result, 'Payment initiated successfully')
        );
    }),

    confirmPayment: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { payment_id, payment_data } = req.body;

        const result = await paymentService.confirmPayment({
            userId,
            paymentId: payment_id,
            paymentData: payment_data
        });

        // Audit log - Payment Confirmed
        await auditService.logPayment(
            userId,
            payment_id,
            result.amount || 0,
            'success',
            req.ip,
            req.get('user-agent')
        );

        // Log important event
        logger.important('Payment confirmed', {
            userId: userId,
            paymentId: payment_id,
            amount: result.amount || 0,
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Payment confirmed successfully')
        );
    }),

    getPaymentStatus: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { paymentId } = req.params;

        const status = await paymentService.getPaymentStatus({
            paymentId,
            userId
        });

        res.status(200).json(
            ApiResponse.success(status, 'Payment status fetched successfully')
        );
    }),

    getUserPayments: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { page, limit, status, start_date, end_date } = req.query;

        const result = await paymentService.getUserPayments({
            userId,
            page,
            limit,
            status,
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.payments,
                result.pagination,
                'Payments fetched successfully'
            )
        );
    }),

    getUserTransactions: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { page, limit, type, status, start_date, end_date } = req.query;

        const result = await paymentService.getUserTransactions({
            userId,
            page,
            limit,
            type,
            status,
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.transactions,
                result.pagination,
                'Transactions fetched successfully'
            )
        );
    }),

    requestRefund: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { paymentId } = req.params;
        const { reason } = req.body;

        const result = await paymentService.requestRefund({
            paymentId,
            userId,
            reason
        });

        // Audit log - Refund Requested
        await auditService.log({
            userId: req.userId,
            action: 'request_refund',
            module: 'payment',
            moduleId: paymentId,
            description: `Refund requested for payment: ${paymentId}`,
            newData: { reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        // Log important event
        logger.important('Refund requested', {
            userId: userId,
            paymentId: paymentId,
            reason: reason
        });

        res.status(200).json(
            ApiResponse.success(result, 'Refund requested successfully')
        );
    }),

    getRefundStatus: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { refundId } = req.params;

        const status = await paymentService.getRefundStatus({
            refundId,
            userId
        });

        res.status(200).json(
            ApiResponse.success(status, 'Refund status fetched successfully')
        );
    }),

    // ============ SELLER ROUTES ============
    getSellerPayments: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { page, limit, status, start_date, end_date } = req.query;

        const result = await paymentService.getSellerPayments({
            sellerId,
            page,
            limit,
            status,
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.payments,
                result.pagination,
                'Seller payments fetched successfully'
            )
        );
    }),

    getSellerTransactions: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { page, limit, type, status, start_date, end_date } = req.query;

        const result = await paymentService.getSellerTransactions({
            sellerId,
            page,
            limit,
            type,
            status,
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.transactions,
                result.pagination,
                'Seller transactions fetched successfully'
            )
        );
    }),

    getSellerPaymentSummary: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;

        const summary = await paymentService.getSellerPaymentSummary(sellerId);

        res.status(200).json(
            ApiResponse.success(summary, 'Seller payment summary fetched successfully')
        );
    }),

    // ============ ADMIN ROUTES ============
    adminGetAllPayments: asyncHandler(async (req, res) => {
        const {
            page, limit, seller_id, user_id, status,
            payment_method, start_date, end_date, sort_by, sort_order
        } = req.query;

        const result = await paymentService.adminGetAllPayments({
            page,
            limit,
            sellerId: seller_id,
            userId: user_id,
            status,
            paymentMethod: payment_method,
            startDate: start_date,
            endDate: end_date,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.payments,
                result.pagination,
                'All payments fetched successfully'
            )
        );
    }),

    adminGetAllTransactions: asyncHandler(async (req, res) => {
        const {
            page, limit, seller_id, user_id, type,
            status, start_date, end_date, sort_by, sort_order
        } = req.query;

        const result = await paymentService.adminGetAllTransactions({
            page,
            limit,
            sellerId: seller_id,
            userId: user_id,
            type,
            status,
            startDate: start_date,
            endDate: end_date,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.transactions,
                result.pagination,
                'All transactions fetched successfully'
            )
        );
    }),

    adminProcessRefund: asyncHandler(async (req, res) => {
        const { paymentId } = req.params;
        const { amount, reason } = req.body;

        const result = await paymentService.adminProcessRefund({
            paymentId,
            amount,
            reason,
            processedBy: req.userId
        });

        // Audit log - Admin Refund Processed
        await auditService.log({
            userId: req.userId,
            action: 'admin_process_refund',
            module: 'payment',
            moduleId: paymentId,
            description: `Refund of ${amount} processed by admin for payment: ${paymentId}`,
            newData: { amount, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        // Log important event
        logger.important('Admin refund processed', {
            paymentId: paymentId,
            amount: amount,
            reason: reason,
            processedBy: req.userId
        });

        res.status(200).json(
            ApiResponse.success(result, 'Refund processed successfully')
        );
    }),

    getPaymentStatistics: asyncHandler(async (req, res) => {
        const { seller_id, start_date, end_date } = req.query;

        const statistics = await paymentService.getPaymentStatistics({
            sellerId: seller_id,
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(statistics, 'Payment statistics fetched successfully')
        );
    }),

    adminGetSellerPaymentSummary: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;

        const summary = await paymentService.getSellerPaymentSummary(sellerId);

        res.status(200).json(
            ApiResponse.success(summary, 'Seller payment summary fetched successfully')
        );
    }),

    // ============ WEBHOOK ============
    webhook: asyncHandler(async (req, res) => {
        const payload = req.body;
        const signature = req.headers['x-payment-signature'];

        const result = await paymentService.handleWebhook({
            payload,
            signature
        });

        // Audit log - Webhook Received
        await auditService.log({
            userId: null,
            action: 'webhook',
            module: 'payment',
            description: `Payment webhook received`,
            newData: { event: payload.event },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        // Log important event
        logger.important('Payment webhook received', {
            event: payload.event,
            ip: req.ip
        });

        res.status(200).json(
            ApiResponse.success(result, 'Webhook processed successfully')
        );
    })
};

module.exports = paymentController;