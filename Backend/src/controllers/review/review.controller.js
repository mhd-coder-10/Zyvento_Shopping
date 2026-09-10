// Handles all review related API requests
// Manages review creation, update, delete, and helpful votes
// Also handles product reviews, seller reviews, and review approval

const reviewService = require('../../services/review/review.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');


const reviewController = {

    // ============ CREATE REVIEW ============
    createReview: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { product_id, order_id, rating, title, comment, images } = req.body;

        const review = await reviewService.createReview({
            userId,
            productId: product_id,
            orderId: order_id,
            rating,
            title,
            comment,
            images
        });

        res.status(201).json(
            ApiResponse.created(review, 'Review created successfully')
        );
    }),

    // ============ UPDATE REVIEW ============
    updateReview: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { reviewId } = req.params;
        const { rating, title, comment } = req.body;

        const review = await reviewService.updateReview({
            reviewId,
            userId,
            rating,
            title,
            comment
        });

        res.status(200).json(
            ApiResponse.success(review, 'Review updated successfully')
        );
    }),

    // ============ DELETE REVIEW ============
    deleteReview: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { reviewId } = req.params;

        await reviewService.deleteReview({ reviewId, userId });

        res.status(200).json(
            ApiResponse.success(null, 'Review deleted successfully')
        );
    }),

    // ============ GET PRODUCT REVIEWS ============
    getProductReviews: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const { page, limit, rating, sort_by, sort_order, with_images } = req.query;

        const result = await reviewService.getProductReviews({
            productId,
            page,
            limit,
            rating,
            sortBy: sort_by,
            sortOrder: sort_order,
            withImages: with_images
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.reviews,
                result.pagination,
                'Product reviews fetched successfully'
            )
        );
    }),

    // ============ GET SELLER REVIEWS ============
    getSellerReviews: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { page, limit, rating, review_status, sort_by, sort_order } = req.query;

        // Check access for seller_employee
        if (req.userType === 'seller_employee') {
            const userSellerId = req.sellerId?.toString();
            if (userSellerId !== sellerId) {
                throw ApiError.forbidden('You can only view your own seller reviews');
            }
        }

        const result = await reviewService.getSellerReviews({
            sellerId,
            page,
            limit,
            rating,
            reviewStatus: review_status,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.reviews,
                result.pagination,
                'Seller reviews fetched successfully'
            )
        );
    }),

    // ============ GET USER'S OWN REVIEWS ============
    getUserReviews: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { page, limit } = req.query;

        const result = await reviewService.getUserReviews({
            userId,
            page,
            limit
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.reviews,
                result.pagination,
                'Your reviews fetched successfully'
            )
        );
    }),

    // ============ GET SELLER PRODUCT REVIEWS ============
    getSellerProductReviews: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { page, limit, rating, review_status, sort_by, sort_order } = req.query;

        const result = await reviewService.getSellerReviews({
            sellerId,
            page,
            limit,
            rating,
            reviewStatus: review_status,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.reviews,
                result.pagination,
                'Seller product reviews fetched successfully'
            )
        );
    }),

    // ============ MARK REVIEW HELPFUL ============
    markHelpful: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { reviewId } = req.params;

        const result = await reviewService.markHelpful({ reviewId, userId });

        res.status(200).json(
            ApiResponse.success(result, 'Review marked as helpful')
        );
    }),

    // ============ ADMIN APPROVE REVIEW ============
    approveReview: asyncHandler(async (req, res) => {
        const adminId = req.userId;
        const { reviewId } = req.params;
        const { status, admin_comment } = req.body;

        const review = await reviewService.approveReview({
            reviewId,
            status,
            adminComment: admin_comment,
            adminId
        });

        res.status(200).json(
            ApiResponse.success(review, `Review ${status} successfully`)
        );
    }),

    // ============ ADMIN GET ALL REVIEWS ============
    adminGetAllReviews: asyncHandler(async (req, res) => {
        const {
            page,
            limit,
            review_status,
            seller_id,
            product_id,
            rating,
            start_date,
            end_date,
            sort_by,
            sort_order
        } = req.query;

        const result = await reviewService.adminGetAllReviews({
            page,
            limit,
            reviewStatus: review_status,
            sellerId: seller_id,
            productId: product_id,
            rating,
            startDate: start_date,
            endDate: end_date,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.reviews,
                result.pagination,
                'All reviews fetched successfully'
            )
        );
    }),

    // ============ ADMIN DELETE REVIEW ============
    adminDeleteReview: asyncHandler(async (req, res) => {
        const { reviewId } = req.params;

        await reviewService.adminDeleteReview({ reviewId });

        res.status(200).json(
            ApiResponse.success(null, 'Review deleted successfully by admin')
        );
    }),

    // ============ GET REVIEW REPORT ============
    getReviewReport: asyncHandler(async (req, res) => {
        const { start_date, end_date, seller_id } = req.query;

        const report = await reviewService.getReviewReport({
            startDate: start_date,
            endDate: end_date,
            sellerId: seller_id
        });

        res.status(200).json(
            ApiResponse.success(report, 'Review report generated successfully')
        );
    }),

    // ============ GET REVIEW STATISTICS ============
    getReviewStatistics: asyncHandler(async (req, res) => {
        const { seller_id, product_id } = req.query;

        const statistics = await reviewService.getReviewStatistics({
            sellerId: seller_id,
            productId: product_id
        });

        res.status(200).json(
            ApiResponse.success(statistics, 'Review statistics fetched successfully')
        );
    })
};

module.exports = reviewController;