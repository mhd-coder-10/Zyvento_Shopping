// Handles all review related business logic
// Manages review creation, update, delete, and helpful votes
// Also handles product reviews, seller reviews, and review approval

const Review = require('../../models/review.model');
const Product = require('../../models/product.model');
const Seller = require('../../models/seller.model');
const Order = require('../../models/order.model');
const User = require('../../models/user.model');
const notificationService = require('../notification/notification.service');
const ApiError = require('../../utils/apiError');
const constants = require('../../config/constants');

class ReviewService {

    // ============ CREATE REVIEW ============
    async createReview({ userId, productId, orderId, rating, title, comment, images = [] }) {
        // Check if user already reviewed this product for this order
        const existingReview = await Review.findOne({
            user_id: userId,
            product_id: productId,
            order_id: orderId
        });

        if (existingReview) {
            throw ApiError.conflict('You have already reviewed this product for this order');
        }

        // Check if order exists and user has purchased this product
        const order = await Order.findOne({
            _id: orderId,
            user_id: userId,
            order_status: 'delivered'
        });

        if (!order) {
            throw ApiError.badRequest('Order not found or not delivered');
        }

        // Check if product exists in order
        const orderItem = await order.order_items.find(async (item) => {
            const orderItemData = await OrderItem.findById(item);
            return orderItemData && orderItemData.product_id.toString() === productId;
        });

        if (!orderItem) {
            throw ApiError.badRequest('Product not found in this order');
        }

        // Get product and seller details
        const product = await Product.findById(productId);
        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        // Create review
        const review = await Review.create({
            user_id: userId,
            product_id: productId,
            order_id: orderId,
            seller_id: product.seller_id,
            rating,
            title: title || '',
            comment: comment || '',
            images,
            review_status: 'pending'
        });

        // Populate user details
        await review.populate('user_id', 'first_name last_name profile_image');

        // Update product rating (async - don't wait)
        await this.updateProductRating(productId);

        // Update seller rating (async - don't wait)
        await this.updateSellerRating(product.seller_id);

        // Send notification to seller
        await notificationService.createNotification({
            userId: product.seller_id,
            receiverType: 'seller',
            title: 'New Product Review',
            message: `${rating}⭐ review received on "${product.product_name}"`,
            notificationType: 'product',
            referenceId: productId,
            referenceModel: 'Product',
            channel: 'in_app',
            priority: 'medium',
            metadata: {
                reviewId: review._id,
                rating: rating,
                productName: product.product_name
            }
        });

        return review;
    }

    // ============ UPDATE REVIEW ============
    async updateReview({ reviewId, userId, rating, title, comment }) {
        const review = await Review.findOne({
            _id: reviewId,
            user_id: userId
        });

        if (!review) {
            throw ApiError.notFound('Review not found or you are not authorized');
        }

        // Cannot update approved/rejected reviews
        if (review.review_status !== 'pending') {
            throw ApiError.badRequest('Cannot update a review that is already approved or rejected');
        }

        // Update fields
        if (rating) review.rating = rating;
        if (title) review.title = title;
        if (comment) review.comment = comment;

        await review.save();

        // Recalculate product rating
        await this.updateProductRating(review.product_id);
        await this.updateSellerRating(review.seller_id);

        return review;
    }

    // ============ DELETE REVIEW ============
    async deleteReview({ reviewId, userId }) {
        const review = await Review.findOne({
            _id: reviewId,
            user_id: userId
        });

        if (!review) {
            throw ApiError.notFound('Review not found or you are not authorized');
        }

        const productId = review.product_id;
        const sellerId = review.seller_id;

        await review.deleteOne();

        // Recalculate ratings
        await this.updateProductRating(productId);
        await this.updateSellerRating(sellerId);

        return { message: 'Review deleted successfully' };
    }

    // ============ UPDATE PRODUCT RATING ============
    async updateProductRating(productId) {
        const result = await Review.aggregate([
            {
                $match: {
                    product_id: productId,
                    review_status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$product_id',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (result.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                rating: Math.round(result[0].averageRating * 10) / 10,
                total_reviews: result[0].totalReviews
            });
        } else {
            await Product.findByIdAndUpdate(productId, {
                rating: 0,
                total_reviews: 0
            });
        }
    }

    // ============ UPDATE SELLER RATING ============
    async updateSellerRating(sellerId) {
        const result = await Review.aggregate([
            {
                $match: {
                    seller_id: sellerId,
                    review_status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$seller_id',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (result.length > 0) {
            await Seller.findByIdAndUpdate(sellerId, {
                rating: Math.round(result[0].averageRating * 10) / 10
            });
        }
    }

    // ============ GET PRODUCT REVIEWS ============
    async getProductReviews({
        productId,
        page = 1,
        limit = 10,
        rating = null,
        sortBy = 'created_at',
        sortOrder = 'desc',
        withImages = false
    }) {
        // Check product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        const query = {
            product_id: productId,
            review_status: 'approved'
        };

        if (rating) {
            query.rating = { $eq: parseInt(rating) };
        }

        if (withImages) {
            query.images = { $ne: [] };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate('user_id', 'first_name last_name profile_image')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Review.countDocuments(query)
        ]);

        // Get rating distribution
        const distribution = await Review.aggregate([
            {
                $match: {
                    product_id: productId,
                    review_status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const ratingDistribution = {};
        for (let i = 1; i <= 5; i++) {
            const found = distribution.find(d => d._id === i);
            ratingDistribution[i] = found ? found.count : 0;
        }

        return {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            },
            ratingDistribution,
            averageRating: product.rating || 0,
            totalReviews: product.total_reviews || 0
        };
    }

    // ============ GET SELLER REVIEWS ============
    async getSellerReviews({
        sellerId,
        page = 1,
        limit = 10,
        rating = null,
        reviewStatus = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        // Check seller exists
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const query = { seller_id: sellerId };

        if (rating) {
            query.rating = { $eq: parseInt(rating) };
        }

        if (reviewStatus) {
            query.review_status = reviewStatus;
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate('user_id', 'first_name last_name profile_image')
                .populate('product_id', 'product_name images sku')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Review.countDocuments(query)
        ]);

        // Get rating distribution
        const distribution = await Review.aggregate([
            {
                $match: {
                    seller_id: sellerId,
                    review_status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const ratingDistribution = {};
        for (let i = 1; i <= 5; i++) {
            const found = distribution.find(d => d._id === i);
            ratingDistribution[i] = found ? found.count : 0;
        }

        // Get review statistics
        const stats = await Review.aggregate([
            {
                $match: {
                    seller_id: sellerId,
                    review_status: 'approved'
                }
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    withImagesCount: {
                        $sum: { $cond: [{ $gt: [{ $size: '$images' }, 0] }, 1, 0] }
                    }
                }
            }
        ]);

        return {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            },
            ratingDistribution,
            statistics: {
                averageRating: stats[0]?.avgRating || 0,
                totalReviews: stats[0]?.totalReviews || 0,
                withImagesCount: stats[0]?.withImagesCount || 0
            },
            seller: {
                id: seller._id,
                businessName: seller.business_name,
                rating: seller.rating || 0
            }
        };
    }

    // ============ GET USER REVIEWS ============
    async getUserReviews({ userId, page = 1, limit = 10 }) {
        const [reviews, total] = await Promise.all([
            Review.find({ user_id: userId })
                .populate('product_id', 'product_name images price sku')
                .populate('seller_id', 'business_name')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Review.countDocuments({ user_id: userId })
        ]);

        return {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ MARK REVIEW HELPFUL ============
    async markHelpful({ reviewId, userId }) {
        const review = await Review.findById(reviewId);
        if (!review) {
            throw ApiError.notFound('Review not found');
        }

        // Check if user already marked as helpful
        if (review.helpful_users.includes(userId)) {
            throw ApiError.conflict('You already marked this review as helpful');
        }

        review.helpful_users.push(userId);
        review.helpful_count += 1;
        await review.save();

        return { helpful_count: review.helpful_count };
    }

    // ============ ADMIN APPROVE REVIEW ============
    async approveReview({ reviewId, status, adminComment, adminId }) {
        const review = await Review.findById(reviewId);
        if (!review) {
            throw ApiError.notFound('Review not found');
        }

        review.review_status = status;
        if (adminComment) {
            review.admin_comment = adminComment;
        }
        await review.save();

        // Update product and seller ratings if approved
        if (status === 'approved') {
            await this.updateProductRating(review.product_id);
            await this.updateSellerRating(review.seller_id);

            // Send notification to user
            await notificationService.createNotification({
                userId: review.user_id,
                receiverType: 'customer',
                title: 'Your Review is Approved',
                message: `Your review for "${review.product_id.product_name}" has been approved`,
                notificationType: 'product',
                referenceId: review._id,
                referenceModel: 'Review',
                channel: 'in_app'
            });
        }

        return review;
    }

    // ============ ADMIN GET ALL REVIEWS ============
    async adminGetAllReviews({
        page = 1,
        limit = 10,
        reviewStatus = null,
        sellerId = null,
        productId = null,
        rating = null,
        startDate = null,
        endDate = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const query = {};

        if (reviewStatus) {
            query.review_status = reviewStatus;
        }

        if (sellerId) {
            query.seller_id = sellerId;
        }

        if (productId) {
            query.product_id = productId;
        }

        if (rating) {
            query.rating = { $eq: parseInt(rating) };
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

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate('user_id', 'first_name last_name email')
                .populate('product_id', 'product_name sku')
                .populate('seller_id', 'business_name')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Review.countDocuments(query)
        ]);

        // Get summary statistics
        const summary = await Review.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    pendingReviews: {
                        $sum: { $cond: [{ $eq: ['$review_status', 'pending'] }, 1, 0] }
                    },
                    approvedReviews: {
                        $sum: { $cond: [{ $eq: ['$review_status', 'approved'] }, 1, 0] }
                    },
                    rejectedReviews: {
                        $sum: { $cond: [{ $eq: ['$review_status', 'rejected'] }, 1, 0] }
                    }
                }
            }
        ]);

        return {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            },
            summary: summary[0] || {
                totalReviews: 0,
                averageRating: 0,
                pendingReviews: 0,
                approvedReviews: 0,
                rejectedReviews: 0
            }
        };
    }

    // ============ ADMIN DELETE REVIEW ============
    async adminDeleteReview({ reviewId }) {
        const review = await Review.findById(reviewId);
        if (!review) {
            throw ApiError.notFound('Review not found');
        }

        const productId = review.product_id;
        const sellerId = review.seller_id;

        await review.deleteOne();

        // Recalculate ratings
        await this.updateProductRating(productId);
        await this.updateSellerRating(sellerId);

        return { message: 'Review deleted successfully' };
    }

    // ============ GET REVIEW REPORT ============
    async getReviewReport({ startDate, endDate, sellerId = null }) {
        const matchQuery = {
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        if (sellerId) {
            matchQuery.seller_id = sellerId;
        }

        // Daily review trends
        const dailyTrends = await Review.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
                    },
                    total: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                    approved: {
                        $sum: { $cond: [{ $eq: ['$review_status', 'approved'] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$review_status', 'pending'] }, 1, 0] }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ['$review_status', 'rejected'] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Rating distribution
        const ratingDistribution = await Review.aggregate([
            {
                $match: {
                    ...matchQuery,
                    review_status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top products by rating
        const topProducts = await Review.aggregate([
            {
                $match: {
                    ...matchQuery,
                    review_status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$product_id',
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            { $sort: { avgRating: -1 } },
            { $limit: 10 },
            {
                $project: {
                    productId: '$_id',
                    productName: '$product.product_name',
                    avgRating: 1,
                    totalReviews: 1
                }
            }
        ]);

        // Overall summary
        const summary = await Review.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    withImages: {
                        $sum: { $cond: [{ $gt: [{ $size: '$images' }, 0] }, 1, 0] }
                    },
                    withoutImages: {
                        $sum: { $cond: [{ $eq: [{ $size: '$images' }, 0] }, 1, 0] }
                    }
                }
            }
        ]);

        return {
            period: {
                startDate,
                endDate
            },
            summary: summary[0] || {
                totalReviews: 0,
                averageRating: 0,
                withImages: 0,
                withoutImages: 0
            },
            dailyTrends,
            ratingDistribution,
            topProducts
        };
    }

    // ============ GET REVIEW STATISTICS ============
    async getReviewStatistics({ sellerId = null, productId = null }) {
        const matchQuery = { review_status: 'approved' };

        if (sellerId) {
            matchQuery.seller_id = sellerId;
        }

        if (productId) {
            matchQuery.product_id = productId;
        }

        const statistics = await Review.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    minRating: { $min: '$rating' },
                    maxRating: { $max: '$rating' },
                    withImages: {
                        $sum: { $cond: [{ $gt: [{ $size: '$images' }, 0] }, 1, 0] }
                    },
                    totalHelpful: { $sum: '$helpful_count' }
                }
            }
        ]);

        // Rating distribution
        const distribution = await Review.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const ratingDistribution = {};
        for (let i = 1; i <= 5; i++) {
            const found = distribution.find(d => d._id === i);
            ratingDistribution[i] = found ? found.count : 0;
        }

        return {
            statistics: statistics[0] || {
                totalReviews: 0,
                averageRating: 0,
                minRating: 0,
                maxRating: 0,
                withImages: 0,
                totalHelpful: 0
            },
            ratingDistribution
        };
    }
}

module.exports = new ReviewService();