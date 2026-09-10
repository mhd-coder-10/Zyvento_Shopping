// Handles all payment related business logic
// Manages payment initiation, confirmation, refunds, and transaction history
// Also handles payment status, webhooks, and seller payment summaries

const Payment = require('../../models/payment.model');
const Transaction = require('../../models/transaction.model');
const Order = require('../../models/order.model');
const OrderItem = require('../../models/order_item.model');
const Seller = require('../../models/seller.model');
const Notification = require('../../models/notification.model');
const ApiError = require('../../utils/apiError');
const Helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');

class PaymentService {

    // ============ CUSTOMER ROUTES ============
    async initiatePayment({ userId, orderId, paymentMethod, gateway = 'razorpay' }) {
        // Check order exists and belongs to user
        const order = await Order.findOne({
            _id: orderId,
            user_id: userId,
            payment_status: constants.PAYMENT_STATUS.PENDING
        });

        if (!order) {
            throw ApiError.notFound('Order not found or already paid');
        }

        // Create payment record
        const payment = new Payment({
            order_id: order._id,
            user_id: userId,
            seller_id: order.seller_id,
            payment_method: paymentMethod,
            payment_gateway: gateway,
            amount: order.total_amount,
            payment_status: constants.PAYMENT_STATUS.PENDING
        });

        await payment.save();

        // Generate payment order (For Razorpay/Paytm etc.)
        // This will be implemented based on actual gateway integration
        const paymentOrder = {
            id: payment._id,
            amount: order.total_amount,
            currency: 'INR',
            order_id: order.order_number,
            key: process.env.PAYMENT_GATEWAY_KEY,
            secret: process.env.PAYMENT_GATEWAY_SECRET
        };

        return {
            payment_id: payment._id,
            payment_order: paymentOrder,
            amount: order.total_amount,
            order_number: order.order_number
        };
    }

    async confirmPayment({ userId, paymentId, paymentData }) {
        // Check payment exists
        const payment = await Payment.findOne({
            _id: paymentId,
            user_id: userId
        });

        if (!payment) {
            throw ApiError.notFound('Payment not found');
        }

        if (payment.payment_status !== constants.PAYMENT_STATUS.PENDING) {
            throw ApiError.badRequest('Payment already processed');
        }

        // Verify payment with gateway (Mock for now)
        // In real implementation, verify with payment gateway
        const isVerified = true; // Mock verification

        if (!isVerified) {
            payment.payment_status = constants.PAYMENT_STATUS.FAILED;
            payment.gateway_response = paymentData;
            await payment.save();

            throw ApiError.badRequest('Payment verification failed');
        }

        // Update payment
        payment.payment_status = constants.PAYMENT_STATUS.PAID;
        payment.transaction_id = paymentData.transaction_id || Helpers.generateTransactionId();
        payment.payment_date = new Date();
        payment.gateway_response = paymentData;
        await payment.save();

        // Update order
        const order = await Order.findById(payment.order_id);
        if (order) {
            order.payment_status = constants.PAYMENT_STATUS.PAID;
            order.payment_id = payment._id;
            await order.save();

            // Create transaction
            const transaction = new Transaction({
                payment_id: payment._id,
                order_id: order._id,
                user_id: userId,
                seller_id: order.seller_id,
                transaction_id: payment.transaction_id,
                transaction_type: 'payment',
                amount: payment.amount,
                status: 'success',
                gateway_name: payment.payment_gateway,
                gateway_response: paymentData,
                transaction_date: new Date()
            });
            await transaction.save();

            // Notify user
            await Notification.create({
                user_id: userId,
                receiver_type: 'customer',
                title: 'Payment Successful',
                message: `Payment of ₹${payment.amount} for order #${order.order_number} was successful.`,
                notification_type: 'payment',
                reference_id: payment._id,
                reference_model: 'Payment',
                channel: 'in_app'
            });

            // Notify seller
            await Notification.create({
                user_id: order.seller_id,
                receiver_type: 'seller',
                title: 'New Payment Received',
                message: `Payment received for order #${order.order_number}`,
                notification_type: 'payment',
                reference_id: payment._id,
                reference_model: 'Payment',
                channel: 'in_app'
            });
        }

        logger.info(`Payment confirmed: ${paymentId}`, { userId, amount: payment.amount });

        return {
            payment_id: payment._id,
            status: payment.payment_status,
            transaction_id: payment.transaction_id
        };
    }

    async getPaymentStatus({ paymentId, userId }) {
        const payment = await Payment.findOne({
            _id: paymentId,
            user_id: userId
        })
            .populate('order_id', 'order_number total_amount');

        if (!payment) {
            throw ApiError.notFound('Payment not found');
        }

        return {
            payment_id: payment._id,
            status: payment.payment_status,
            amount: payment.amount,
            order_number: payment.order_id?.order_number,
            transaction_id: payment.transaction_id,
            payment_date: payment.payment_date
        };
    }

    async getUserPayments({
        userId,
        page = 1,
        limit = 10,
        status = null,
        startDate = null,
        endDate = null
    }) {
        const query = { user_id: userId };

        if (status) {
            query.payment_status = status;
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

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .populate('order_id', 'order_number total_amount')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Payment.countDocuments(query)
        ]);

        return {
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getUserTransactions({
        userId,
        page = 1,
        limit = 10,
        type = null,
        status = null,
        startDate = null,
        endDate = null
    }) {
        const query = { user_id: userId };

        if (type) {
            query.transaction_type = type;
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

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('order_id', 'order_number total_amount')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query)
        ]);

        return {
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async requestRefund({ paymentId, userId, reason }) {
        const payment = await Payment.findOne({
            _id: paymentId,
            user_id: userId
        });

        if (!payment) {
            throw ApiError.notFound('Payment not found');
        }

        if (payment.payment_status !== constants.PAYMENT_STATUS.PAID) {
            throw ApiError.badRequest('Only paid payments can be refunded');
        }

        // Check if refund already requested
        const existingRefund = await Transaction.findOne({
            payment_id: paymentId,
            transaction_type: 'refund'
        });

        if (existingRefund) {
            throw ApiError.conflict('Refund already requested');
        }

        // Create refund transaction
        const refund = new Transaction({
            payment_id: payment._id,
            order_id: payment.order_id,
            user_id: userId,
            seller_id: payment.seller_id,
            transaction_id: Helpers.generateTransactionId(),
            transaction_type: 'refund',
            amount: payment.amount,
            status: 'pending',
            gateway_name: payment.payment_gateway,
            transaction_date: new Date(),
            metadata: { reason }
        });

        await refund.save();

        // Update payment status
        payment.payment_status = constants.PAYMENT_STATUS.REFUNDED;
        await payment.save();

        // Notify admin
        await Notification.create({
            user_id: payment.seller_id,
            receiver_type: 'seller',
            title: 'Refund Request',
            message: `Refund requested for payment #${payment._id}`,
            notification_type: 'refund',
            reference_id: refund._id,
            reference_model: 'Transaction',
            channel: 'in_app',
            priority: 'high'
        });

        logger.info(`Refund requested: ${paymentId}`, { userId, amount: payment.amount });

        return {
            refund_id: refund._id,
            status: refund.status,
            amount: refund.amount
        };
    }

    async getRefundStatus({ refundId, userId }) {
        const refund = await Transaction.findOne({
            _id: refundId,
            user_id: userId,
            transaction_type: 'refund'
        });

        if (!refund) {
            throw ApiError.notFound('Refund not found');
        }

        return {
            refund_id: refund._id,
            status: refund.status,
            amount: refund.amount,
            transaction_id: refund.transaction_id,
            transaction_date: refund.transaction_date
        };
    }

    // ============ SELLER ROUTES ============
    async getSellerPayments({
        sellerId,
        page = 1,
        limit = 10,
        status = null,
        startDate = null,
        endDate = null
    }) {
        const query = { seller_id: sellerId };

        if (status) {
            query.payment_status = status;
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

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .populate('user_id', 'first_name last_name email')
                .populate('order_id', 'order_number total_amount')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Payment.countDocuments(query)
        ]);

        return {
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getSellerTransactions({
        sellerId,
        page = 1,
        limit = 10,
        type = null,
        status = null,
        startDate = null,
        endDate = null
    }) {
        const query = { seller_id: sellerId };

        if (type) {
            query.transaction_type = type;
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

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('order_id', 'order_number total_amount')
                .populate('user_id', 'first_name last_name email')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query)
        ]);

        return {
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getSellerPaymentSummary(sellerId) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const [
            totalRevenue,
            totalTransactions,
            pendingPayments,
            totalRefunds
        ] = await Promise.all([
            Payment.aggregate([
                {
                    $match: {
                        seller_id: sellerId,
                        payment_status: constants.PAYMENT_STATUS.PAID
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Payment.countDocuments({ seller_id: sellerId }),
            Payment.countDocuments({
                seller_id: sellerId,
                payment_status: constants.PAYMENT_STATUS.PENDING
            }),
            Payment.aggregate([
                {
                    $match: {
                        seller_id: sellerId,
                        payment_status: constants.PAYMENT_STATUS.REFUNDED
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        // Monthly revenue trend
        const monthlyTrend = await Payment.aggregate([
            {
                $match: {
                    seller_id: sellerId,
                    payment_status: constants.PAYMENT_STATUS.PAID
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$created_at' },
                        year: { $year: '$created_at' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]);

        return {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalTransactions,
            pendingPayments,
            totalRefunds: totalRefunds[0]?.total || 0,
            monthlyTrend
        };
    }

    // ============ ADMIN ROUTES ============
    async adminGetAllPayments({
        page = 1,
        limit = 10,
        sellerId = null,
        userId = null,
        status = null,
        paymentMethod = null,
        startDate = null,
        endDate = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const query = {};

        if (sellerId) {
            query.seller_id = sellerId;
        }

        if (userId) {
            query.user_id = userId;
        }

        if (status) {
            query.payment_status = status;
        }

        if (paymentMethod) {
            query.payment_method = paymentMethod;
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

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .populate('user_id', 'first_name last_name email')
                .populate('seller_id', 'business_name')
                .populate('order_id', 'order_number total_amount')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Payment.countDocuments(query)
        ]);

        return {
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async adminGetAllTransactions({
        page = 1,
        limit = 10,
        sellerId = null,
        userId = null,
        type = null,
        status = null,
        startDate = null,
        endDate = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const query = {};

        if (sellerId) {
            query.seller_id = sellerId;
        }

        if (userId) {
            query.user_id = userId;
        }

        if (type) {
            query.transaction_type = type;
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

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('user_id', 'first_name last_name email')
                .populate('seller_id', 'business_name')
                .populate('order_id', 'order_number total_amount')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query)
        ]);

        return {
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async adminProcessRefund({ paymentId, amount, reason, processedBy }) {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw ApiError.notFound('Payment not found');
        }

        if (payment.payment_status !== constants.PAYMENT_STATUS.PAID) {
            throw ApiError.badRequest('Only paid payments can be refunded');
        }

        if (amount > payment.amount) {
            throw ApiError.badRequest('Refund amount cannot exceed payment amount');
        }

        // Create refund transaction
        const refund = new Transaction({
            payment_id: payment._id,
            order_id: payment.order_id,
            user_id: payment.user_id,
            seller_id: payment.seller_id,
            transaction_id: Helpers.generateTransactionId(),
            transaction_type: 'refund',
            amount: amount,
            status: 'success',
            gateway_name: payment.payment_gateway,
            transaction_date: new Date(),
            metadata: { reason, processed_by: processedBy }
        });

        await refund.save();

        // Update payment status
        if (amount === payment.amount) {
            payment.payment_status = constants.PAYMENT_STATUS.REFUNDED;
        } else {
            payment.payment_status = constants.PAYMENT_STATUS.PARTIALLY_REFUNDED;
        }
        await payment.save();

        // Notify user
        await Notification.create({
            user_id: payment.user_id,
            receiver_type: 'customer',
            title: 'Refund Processed',
            message: `Refund of ₹${amount} for order has been processed.`,
            notification_type: 'refund',
            reference_id: refund._id,
            reference_model: 'Transaction',
            channel: 'in_app'
        });

        // Notify seller
        await Notification.create({
            user_id: payment.seller_id,
            receiver_type: 'seller',
            title: 'Refund Processed',
            message: `Refund of ₹${amount} for payment #${paymentId} has been processed.`,
            notification_type: 'refund',
            reference_id: refund._id,
            reference_model: 'Transaction',
            channel: 'in_app'
        });

        logger.info(`Refund processed: ${paymentId}`, { processedBy, amount });

        return {
            refund_id: refund._id,
            amount: refund.amount,
            status: refund.status
        };
    }

    async getPaymentStatistics({ sellerId = null, startDate = null, endDate = null }) {
        const matchQuery = {};

        if (sellerId) {
            matchQuery.seller_id = sellerId;
        }

        if (startDate || endDate) {
            matchQuery.created_at = {};
            if (startDate) {
                matchQuery.created_at.$gte = new Date(startDate);
            }
            if (endDate) {
                matchQuery.created_at.$lte = new Date(endDate);
            }
        }

        const [
            totalPayments,
            totalRevenue,
            statusDistribution,
            methodDistribution,
            averagePaymentValue
        ] = await Promise.all([
            Payment.countDocuments(matchQuery),
            Payment.aggregate([
                {
                    $match: {
                        ...matchQuery,
                        payment_status: constants.PAYMENT_STATUS.PAID
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Payment.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$payment_status', count: { $sum: 1 } } }
            ]),
            Payment.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$payment_method', count: { $sum: 1 } } }
            ]),
            Payment.aggregate([
                {
                    $match: {
                        ...matchQuery,
                        payment_status: constants.PAYMENT_STATUS.PAID
                    }
                },
                { $group: { _id: null, avg: { $avg: '$amount' } } }
            ])
        ]);

        return {
            totalPayments,
            totalRevenue: totalRevenue[0]?.total || 0,
            statusDistribution,
            methodDistribution,
            averagePaymentValue: Math.round(averagePaymentValue[0]?.avg || 0)
        };
    }

    // ============ WEBHOOK ============
    async handleWebhook({ payload, signature }) {
        // Verify webhook signature
        // This will be implemented based on actual gateway

        const { event, data } = payload;

        logger.info('Webhook received', { event });

        switch (event) {
            case 'payment.success':
                await this.confirmPayment({
                    userId: data.user_id,
                    paymentId: data.payment_id,
                    paymentData: data
                });
                break;

            case 'payment.failed':
                const payment = await Payment.findById(data.payment_id);
                if (payment) {
                    payment.payment_status = constants.PAYMENT_STATUS.FAILED;
                    payment.gateway_response = data;
                    await payment.save();
                }
                break;

            default:
                logger.info('Unhandled webhook event', { event });
        }

        return { received: true };
    }
}

module.exports = new PaymentService();