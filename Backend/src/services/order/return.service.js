// Handles all return related business logic
// Manages return requests, processing returns, and return status updates
// Also handles return statistics and return history

const Return = require('../../models/return.model');
const Order = require('../../models/order.model');
const OrderItem = require('../../models/order_item.model');
const Product = require('../../models/product.model');
const Seller = require('../../models/seller.model');
const Notification = require('../../models/notification.model');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');

class ReturnService {

    // ============ CUSTOMER ROUTES ============
    async getCustomerReturns({ userId, page = 1, limit = 10, status = null }) {
        const query = { user_id: userId };

        if (status) {
            query.return_status = status;
        }

        const [returns, total] = await Promise.all([
            Return.find(query)
                .populate('product_id', 'product_name images')
                .populate('seller_id', 'business_name')
                .populate('order_id', 'order_number')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Return.countDocuments(query)
        ]);

        return {
            returns,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getReturnDetails({ returnId, userId }) {
        const returnData = await Return.findOne({
            _id: returnId,
            user_id: userId
        })
            .populate('product_id', 'product_name images sku price')
            .populate('seller_id', 'business_name')
            .populate('order_id', 'order_number')
            .populate('approved_by', 'first_name last_name email');

        if (!returnData) {
            throw ApiError.notFound('Return not found');
        }

        return returnData;
    }

    async cancelReturn({ returnId, userId }) {
        const returnData = await Return.findOne({
            _id: returnId,
            user_id: userId
        });

        if (!returnData) {
            throw ApiError.notFound('Return not found');
        }

        if (returnData.return_status !== 'requested') {
            throw ApiError.badRequest('Cannot cancel return that is already processed');
        }

        returnData.return_status = 'rejected';
        returnData.admin_comment = 'Cancelled by customer';
        await returnData.save();

        // Update order item status back to delivered
        await OrderItem.findByIdAndUpdate(returnData.order_item_id, {
            item_status: 'delivered'
        });

        return { message: 'Return cancelled successfully' };
    }

    // ============ SELLER ROUTES ============
    async getSellerReturns({ sellerId, page = 1, limit = 10, status = null }) {
        const query = { seller_id: sellerId };

        if (status) {
            query.return_status = status;
        }

        const [returns, total] = await Promise.all([
            Return.find(query)
                .populate('user_id', 'first_name last_name email mobile_number')
                .populate('product_id', 'product_name images')
                .populate('order_id', 'order_number')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Return.countDocuments(query)
        ]);

        return {
            returns,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async processReturn({ returnId, sellerId, status, adminComment, refundAmount }) {
        const returnData = await Return.findOne({
            _id: returnId,
            seller_id: sellerId
        }).populate('product_id', 'product_name');

        if (!returnData) {
            throw ApiError.notFound('Return not found');
        }

        if (returnData.return_status !== 'requested') {
            throw ApiError.badRequest('Return already processed');
        }

        returnData.return_status = status;
        returnData.admin_comment = adminComment;

        if (status === 'approved' || status === 'completed') {
            returnData.approved_by = sellerId;
            returnData.approved_at = new Date();

            if (refundAmount) {
                returnData.refund_amount = refundAmount;
                returnData.refund_status = 'processed';
            }

            // Update order item status
            await OrderItem.findByIdAndUpdate(returnData.order_item_id, {
                item_status: 'returned'
            });
        }

        if (status === 'rejected') {
            returnData.refund_status = 'pending';
        }

        await returnData.save();

        // Notify customer
        await Notification.create({
            user_id: returnData.user_id,
            receiver_type: 'customer',
            title: `Return ${status}`,
            message: `Your return request for "${returnData.product_id?.product_name || 'product'}" has been ${status}`,
            notification_type: 'return',
            reference_id: returnData._id,
            reference_model: 'Return',
            channel: 'in_app'
        });

        logger.info(`Return processed: ${returnId}`, { sellerId, status });

        return returnData;
    }

    // ============ ADMIN ROUTES ============
    async adminGetAllReturns({
        page = 1,
        limit = 10,
        sellerId = null,
        userId = null,
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

        if (status) {
            query.return_status = status;
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

        const [returns, total] = await Promise.all([
            Return.find(query)
                .populate('user_id', 'first_name last_name email mobile_number')
                .populate('seller_id', 'business_name')
                .populate('product_id', 'product_name images sku')
                .populate('order_id', 'order_number')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Return.countDocuments(query)
        ]);

        return {
            returns,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async adminProcessReturn({
        returnId,
        status,
        adminComment,
        refundAmount,
        processedBy
    }) {
        const returnData = await Return.findById(returnId)
            .populate('product_id', 'product_name');

        if (!returnData) {
            throw ApiError.notFound('Return not found');
        }

        if (returnData.return_status !== 'requested') {
            throw ApiError.badRequest('Return already processed');
        }

        returnData.return_status = status;
        returnData.admin_comment = adminComment;

        if (status === 'approved' || status === 'completed') {
            returnData.approved_by = processedBy;
            returnData.approved_at = new Date();

            if (refundAmount) {
                returnData.refund_amount = refundAmount;
                returnData.refund_status = 'processed';
            }

            // Update order item status
            await OrderItem.findByIdAndUpdate(returnData.order_item_id, {
                item_status: 'returned'
            });
        }

        if (status === 'rejected') {
            returnData.refund_status = 'pending';
        }

        await returnData.save();

        // Notify customer
        await Notification.create({
            user_id: returnData.user_id,
            receiver_type: 'customer',
            title: `Return ${status}`,
            message: `Your return request for "${returnData.product_id?.product_name || 'product'}" has been ${status} by admin`,
            notification_type: 'return',
            reference_id: returnData._id,
            reference_model: 'Return',
            channel: 'in_app'
        });

        // Notify seller
        await Notification.create({
            user_id: returnData.seller_id,
            receiver_type: 'seller',
            title: `Return ${status}`,
            message: `Return request has been ${status} by admin`,
            notification_type: 'return',
            reference_id: returnData._id,
            reference_model: 'Return',
            channel: 'in_app'
        });

        logger.info(`Return processed by admin: ${returnId}`, { processedBy, status });

        return returnData;
    }

    async getReturnStatistics({ sellerId = null, startDate = null, endDate = null }) {
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
            totalReturns,
            statusDistribution,
            totalRefundAmount,
            averageProcessingTime
        ] = await Promise.all([
            Return.countDocuments(matchQuery),
            Return.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$return_status', count: { $sum: 1 } } }
            ]),
            Return.aggregate([
                { $match: { ...matchQuery, refund_status: 'processed' } },
                { $group: { _id: null, total: { $sum: '$refund_amount' } } }
            ]),
            Return.aggregate([
                {
                    $match: {
                        ...matchQuery,
                        return_status: { $in: ['completed', 'approved'] },
                        approved_at: { $ne: null }
                    }
                },
                {
                    $project: {
                        processingTime: {
                            $divide: [
                                { $subtract: ['$approved_at', '$created_at'] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                },
                { $group: { _id: null, avg: { $avg: '$processingTime' } } }
            ])
        ]);

        // Get monthly return trend
        const monthlyTrend = await Return.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        month: { $month: '$created_at' },
                        year: { $year: '$created_at' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]);

        return {
            totalReturns,
            statusDistribution,
            totalRefundAmount: totalRefundAmount[0]?.total || 0,
            averageProcessingTime: Math.round(averageProcessingTime[0]?.avg || 0),
            monthlyTrend
        };
    }

    // ============ SUB-ADMIN ROUTES ============
    async getReturnsBySeller({ sellerId, page = 1, limit = 10, status = null }) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const query = { seller_id: sellerId };

        if (status) {
            query.return_status = status;
        }

        const [returns, total] = await Promise.all([
            Return.find(query)
                .populate('user_id', 'first_name last_name email mobile_number')
                .populate('product_id', 'product_name images')
                .populate('order_id', 'order_number')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Return.countDocuments(query)
        ]);

        return {
            returns,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ RETURN ITEM ROUTES ============
    async getReturnByOrderItem(orderItemId) {
        const returnData = await Return.findOne({ order_item_id: orderItemId })
            .populate('user_id', 'first_name last_name email mobile_number')
            .populate('product_id', 'product_name images sku price')
            .populate('seller_id', 'business_name')
            .populate('order_id', 'order_number')
            .populate('approved_by', 'first_name last_name email');

        if (!returnData) {
            throw ApiError.notFound('Return not found for this order item');
        }

        return returnData;
    }
}

module.exports = new ReturnService();