// Review route definitions
// Create, update, delete reviews, mark helpful, get product/seller reviews
// Mixed public, customer, seller, and admin routes with role-based access

const express = require('express');
const router = express.Router();

const reviewController = require('../../controllers/review/review.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const reviewValidation = require('../../validations/review/review.validation');

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Review management endpoints
 */

// ============ PUBLIC ROUTES ============

/**
 * @swagger
 * /review/product/{productId}:
 *   get:
 *     summary: Get product reviews
 *     description: Get all reviews for a specific product (Public)
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
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
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, rating, helpful_count]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: with_images
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Product reviews fetched successfully
 *       404:
 *         description: Product not found
 */
router.get(
    '/product/:productId',
    validate(reviewValidation.getProductReviews),
    reviewController.getProductReviews
);

/**
 * @swagger
 * /review/seller/{sellerId}:
 *   get:
 *     summary: Get seller reviews
 *     description: Get all reviews for a specific seller (Public)
 *     tags: [Review]
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
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: review_status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, rating, helpful_count]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Seller reviews fetched successfully
 *       404:
 *         description: Seller not found
 */
router.get(
    '/seller/:sellerId',
    validate(reviewValidation.getSellerReviews),
    reviewController.getSellerReviews
);

/**
 * @swagger
 * /review/statistics:
 *   get:
 *     summary: Get review statistics
 *     description: Get review statistics for a product or seller (Public)
 *     tags: [Review]
 *     parameters:
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review statistics fetched successfully
 *       404:
 *         description: Product or seller not found
 */
router.get(
    '/statistics',
    validate(reviewValidation.reviewStatistics),
    reviewController.getReviewStatistics
);

// ============ CUSTOMER ROUTES ============

/**
 * @swagger
 * /review:
 *   post:
 *     summary: Create review (Customer only)
 *     description: Create a new product review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - order_id
 *               - rating
 *             properties:
 *               product_id:
 *                 type: string
 *               order_id:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               comment:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 1000
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 5
 *     responses:
 *       201:
 *         description: Review created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Product or order not found
 *       409:
 *         description: Already reviewed this product
 *       422:
 *         description: Validation error
 */
router.post(
    '/',
    auth,
    authorize('customer'),
    validate(reviewValidation.createReview),
    reviewController.createReview
);

/**
 * @swagger
 * /review/{reviewId}:
 *   put:
 *     summary: Update own review (Customer only)
 *     description: Update your own review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               comment:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Review not found
 *       409:
 *         description: Cannot update approved/rejected review
 *       422:
 *         description: Validation error
 */
router.put(
    '/:reviewId',
    auth,
    authorize('customer'),
    validate(reviewValidation.updateReview),
    reviewController.updateReview
);

/**
 * @swagger
 * /review/{reviewId}:
 *   delete:
 *     summary: Delete own review (Customer only)
 *     description: Delete your own review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Review not found
 */
router.delete(
    '/:reviewId',
    auth,
    authorize('customer'),
    validate(reviewValidation.deleteReview),
    reviewController.deleteReview
);

/**
 * @swagger
 * /review/my-reviews:
 *   get:
 *     summary: Get user's own reviews (Customer only)
 *     description: Get all reviews written by the authenticated user
 *     tags: [Review]
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
 *         description: Your reviews fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 */
router.get(
    '/my-reviews',
    auth,
    authorize('customer'),
    validate(reviewValidation.getUserReviews),
    reviewController.getUserReviews
);

/**
 * @swagger
 * /review/{reviewId}/helpful:
 *   post:
 *     summary: Mark review as helpful (Customer only)
 *     description: Mark a review as helpful
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review marked as helpful
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer role required
 *       404:
 *         description: Review not found
 *       409:
 *         description: Already marked as helpful
 */
router.post(
    '/:reviewId/helpful',
    auth,
    authorize('customer'),
    validate(reviewValidation.markHelpful),
    reviewController.markHelpful
);

// ============ SELLER ROUTES ============

/**
 * @swagger
 * /review/seller-products:
 *   get:
 *     summary: Get seller's product reviews (Seller only)
 *     description: Get all reviews for the authenticated seller's products
 *     tags: [Review]
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
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: review_status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, rating, helpful_count]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Seller product reviews fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 */
router.get(
    '/seller-products',
    auth,
    authorize('seller', 'seller_employee'),
    reviewController.getSellerProductReviews
);

// ============ ADMIN ROUTES ============

/**
 * @swagger
 * /review/{reviewId}/approve:
 *   put:
 *     summary: Approve/reject review (Admin only)
 *     description: Approve or reject a review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
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
 *                 enum: [approved, rejected]
 *               admin_comment:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Review approved/rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Review not found
 *       409:
 *         description: Review already processed
 *       422:
 *         description: Validation error
 */
router.put(
    '/:reviewId/approve',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_reviews'),
    validate(reviewValidation.approveReview),
    reviewController.approveReview
);

/**
 * @swagger
 * /review/admin/all:
 *   get:
 *     summary: Get all reviews (Admin only)
 *     description: Get all reviews with filters
 *     tags: [Review]
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
 *         name: review_status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
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
 *           enum: [created_at, rating, helpful_count]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: All reviews fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/all',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reviews'),
    validate(reviewValidation.adminGetAllReviews),
    reviewController.adminGetAllReviews
);

/**
 * @swagger
 * /review/admin/report:
 *   get:
 *     summary: Get review report (Admin only)
 *     description: Generate review report
 *     tags: [Review]
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
 *         description: Review report generated successfully
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
    validate(reviewValidation.reviewReport),
    reviewController.getReviewReport
);

/**
 * @swagger
 * /review/admin/{reviewId}:
 *   delete:
 *     summary: Admin delete review (Admin only)
 *     description: Delete any review by admin
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Review not found
 */
router.delete(
    '/admin/:reviewId',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_reviews'),
    validate(reviewValidation.deleteReview),
    reviewController.adminDeleteReview
);

// ============ SUB-ADMIN ROUTES ============

/**
 * @swagger
 * /review/sub-admin/seller/{sellerId}:
 *   get:
 *     summary: Get seller reviews (Sub-Admin)
 *     description: Get reviews of a specific seller (Sub-Admin access)
 *     tags: [Review]
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
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: review_status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, rating, helpful_count]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Seller reviews fetched successfully
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
    checkPermission('view_reviews'),
    validate(reviewValidation.getSellerReviews),
    reviewController.getSellerReviews
);

module.exports = router;