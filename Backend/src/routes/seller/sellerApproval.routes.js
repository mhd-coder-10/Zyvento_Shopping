// Seller approval route definitions
// Pending sellers, approval/rejection, bulk actions
// All approval routes require admin authentication

const express = require('express');
const router = express.Router();

const sellerApprovalController = require('../../controllers/seller/sellerApproval.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const adminValidation = require('../../validations/admin.validation');

/**
 * @swagger
 * tags:
 *   name: Seller Approval
 *   description: Seller approval management endpoints
 */

// ============ ALL APPROVAL ROUTES REQUIRE ADMIN AUTH ============
router.use(auth);
router.use(authorize('super_admin', 'sub_admin'));

// ============ SELLER APPROVAL MANAGEMENT ============

/**
 * @swagger
 * /seller/approval/pending:
 *   get:
 *     summary: Get pending sellers
 *     description: Get all sellers pending for approval
 *     tags: [Seller Approval]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by business name, email, owner name
 *     responses:
 *       200:
 *         description: Pending sellers fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/pending',
    checkPermission('approve_sellers'),
    sellerApprovalController.getPendingSellers
);

/**
 * @swagger
 * /seller/approval:
 *   get:
 *     summary: Get all sellers with filters
 *     description: Get paginated list of all sellers with filters
 *     tags: [Seller Approval]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: verification_status
 *         schema:
 *           type: string
 *           enum: [pending, under_review, approved, rejected, suspended]
 *       - in: query
 *         name: account_status
 *         schema:
 *           type: string
 *           enum: [active, blocked, inactive, suspended]
 *       - in: query
 *         name: business_type
 *         schema:
 *           type: string
 *           enum: [individual, company, brand, partnership]
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
 *         description: Sellers fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/',
    checkPermission('manage_sellers'),
    validate(adminValidation.getSellers),
    sellerApprovalController.getAllSellers
);

/**
 * @swagger
 * /seller/approval/{sellerId}:
 *   get:
 *     summary: Get seller details for approval
 *     description: Get detailed information of a seller for approval
 *     tags: [Seller Approval]
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
 *         description: Seller details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Seller not found
 */
router.get(
    '/:sellerId',
    checkPermission('manage_sellers'),
    validate(adminValidation.sellerIdParam),
    sellerApprovalController.getSellerForApproval
);

/**
 * @swagger
 * /seller/approval/{sellerId}/approve:
 *   put:
 *     summary: Approve seller
 *     description: Approve a pending seller account
 *     tags: [Seller Approval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seller approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Seller not found
 *       409:
 *         description: Seller not in pending state
 */
router.put(
    '/:sellerId/approve',
    checkPermission('approve_sellers'),
    validate(adminValidation.approveSeller),
    sellerApprovalController.approveSeller
);

/**
 * @swagger
 * /seller/approval/{sellerId}/reject:
 *   put:
 *     summary: Reject seller
 *     description: Reject a seller account with reason
 *     tags: [Seller Approval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejection_reason
 *             properties:
 *               rejection_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seller rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Seller not found
 *       409:
 *         description: Seller not in pending state
 *       422:
 *         description: Validation error
 */
router.put(
    '/:sellerId/reject',
    checkPermission('approve_sellers'),
    validate(adminValidation.rejectSeller),
    sellerApprovalController.rejectSeller
);

/**
 * @swagger
 * /seller/approval/bulk-approve:
 *   post:
 *     summary: Bulk approve sellers
 *     description: Approve multiple sellers at once
 *     tags: [Seller Approval]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seller_ids
 *             properties:
 *               seller_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sellers approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.post(
    '/bulk-approve',
    checkPermission('approve_sellers'),
    validate(adminValidation.bulkApproveSellers),
    sellerApprovalController.bulkApproveSellers
);

/**
 * @swagger
 * /seller/approval/bulk-reject:
 *   post:
 *     summary: Bulk reject sellers
 *     description: Reject multiple sellers at once
 *     tags: [Seller Approval]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seller_ids
 *               - rejection_reason
 *             properties:
 *               seller_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               rejection_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sellers rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       422:
 *         description: Validation error
 */
router.post(
    '/bulk-reject',
    checkPermission('approve_sellers'),
    validate(adminValidation.bulkRejectSellers),
    sellerApprovalController.bulkRejectSellers
);

/**
 * @swagger
 * /seller/approval/statistics:
 *   get:
 *     summary: Get approval statistics
 *     description: Get statistics about seller approvals
 *     tags: [Seller Approval]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approval statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/statistics',
    checkPermission('manage_sellers'),
    sellerApprovalController.getApprovalStatistics
);

/**
 * @swagger
 * /seller/approval/history/{sellerId}:
 *   get:
 *     summary: Get approval history
 *     description: Get approval history of a specific seller
 *     tags: [Seller Approval]
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
 *     responses:
 *       200:
 *         description: Approval history fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Seller not found
 */
router.get(
    '/history/:sellerId',
    checkPermission('manage_sellers'),
    validate(adminValidation.sellerIdParam),
    sellerApprovalController.getApprovalHistory
);

module.exports = router;