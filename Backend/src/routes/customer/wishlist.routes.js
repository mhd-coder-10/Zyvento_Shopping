const express = require('express');
const router = express.Router();

const wishlistController = require('../../controllers/customer/wishlist.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const wishlistValidation = require('../../validations/wishlist.validation');

/**
 * @swagger
 * tags:
 *   name: Customer Wishlist
 *   description: Customer wishlist management endpoints
 */

// ============ ALL WISHLIST ROUTES REQUIRE AUTH ============
router.use(auth);
router.use(authorize('customer'));

// ============ GET WISHLIST ============

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get wishlist
 *     description: Get all products in the user's wishlist with pagination
 *     tags: [Customer Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Wishlist fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/',
    validate(wishlistValidation.getWishlist),
    wishlistController.getWishlist
);

// ============ ADD TO WISHLIST ============

/**
 * @swagger
 * /wishlist/add:
 *   post:
 *     summary: Add to wishlist
 *     description: Add a product to the user's wishlist
 *     tags: [Customer Wishlist]
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
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Item added to wishlist successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product already in wishlist
 *       422:
 *         description: Validation error
 */
router.post(
    '/add',
    validate(wishlistValidation.addToWishlist),
    wishlistController.addToWishlist
);

// ============ REMOVE FROM WISHLIST ============

/**
 * @swagger
 * /wishlist/remove/{productId}:
 *   delete:
 *     summary: Remove from wishlist
 *     description: Remove a product from the user's wishlist
 *     tags: [Customer Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Item removed from wishlist successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in wishlist
 */
router.delete(
    '/remove/:productId',
    validate(wishlistValidation.productIdParam),
    wishlistController.removeFromWishlist
);

// ============ CLEAR WISHLIST ============

/**
 * @swagger
 * /wishlist/clear:
 *   delete:
 *     summary: Clear wishlist
 *     description: Remove all products from the user's wishlist
 *     tags: [Customer Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete(
    '/clear',
    wishlistController.clearWishlist
);

// ============ CHECK WISHLIST ============

/**
 * @swagger
 * /wishlist/check/{productId}:
 *   get:
 *     summary: Check if product is in wishlist
 *     description: Check if a specific product is in the user's wishlist
 *     tags: [Customer Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Wishlist check successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     is_in_wishlist:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.get(
    '/check/:productId',
    validate(wishlistValidation.productIdParam),
    wishlistController.checkWishlist
);

// ============ MOVE TO CART ============

/**
 * @swagger
 * /wishlist/move-to-cart/{productId}:
 *   post:
 *     summary: Move item to cart
 *     description: Move a product from wishlist to cart
 *     tags: [Customer Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Item moved to cart successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in wishlist
 *       409:
 *         description: Insufficient stock available
 */
router.post(
    '/move-to-cart/:productId',
    validate(wishlistValidation.moveToCart),
    wishlistController.moveToCart
);

// ============ MOVE ALL TO CART ============

/**
 * @swagger
 * /wishlist/move-all-to-cart:
 *   post:
 *     summary: Move all items to cart
 *     description: Move all products from wishlist to cart
 *     tags: [Customer Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All items moved to cart successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wishlist is empty
 */
router.post(
    '/move-all-to-cart',
    wishlistController.moveAllToCart
);

module.exports = router;