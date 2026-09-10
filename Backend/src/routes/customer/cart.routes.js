// Cart route definitions
// Add to cart, update, remove, clear, coupon apply
// All cart routes require customer authentication

const express = require('express');
const router = express.Router();

const cartController = require('../../controllers/customer/cart.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const cartValidation = require('../../validations/cart.validation');

/**
 * @swagger
 * tags:
 *   name: Customer Cart
 *   description: Customer cart management endpoints
 */

// ============ ALL CART ROUTES REQUIRE AUTH ============
router.use(auth);
router.use(authorize('customer'));

// ============ CART CRUD ============

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get cart
 *     description: Get the current user's cart with all items
 *     tags: [Customer Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/',
    cartController.getCart
);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product to the user's cart
 *     tags: [Customer Cart]
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
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 minimum: 1
 *               variant:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   option:
 *                     type: string
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       409:
 *         description: Insufficient stock available
 *       422:
 *         description: Validation error
 */
router.post(
    '/add',
    validate(cartValidation.addToCart),
    cartController.addToCart
);

/**
 * @swagger
 * /cart/update/{productId}:
 *   put:
 *     summary: Update cart item quantity
 *     description: Update quantity of a specific product in the cart
 *     tags: [Customer Cart]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               variant:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   option:
 *                     type: string
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found in cart
 *       409:
 *         description: Insufficient stock available
 *       422:
 *         description: Validation error
 */
router.put(
    '/update/:productId',
    validate(cartValidation.updateCartItem),
    cartController.updateCartItem
);

/**
 * @swagger
 * /cart/remove/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a specific product from the cart
 *     tags: [Customer Cart]
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
 *         description: Item removed from cart successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found in cart
 */
router.delete(
    '/remove/:productId',
    validate(cartValidation.productIdParam),
    cartController.removeFromCart
);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear cart
 *     description: Remove all items from the cart
 *     tags: [Customer Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete(
    '/clear',
    cartController.clearCart
);

/**
 * @swagger
 * /cart/count:
 *   get:
 *     summary: Get cart count
 *     description: Get total number of items in the cart
 *     tags: [Customer Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart count fetched successfully
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
 *                     total_items:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/count',
    cartController.getCartCount
);

/**
 * @swagger
 * /cart/apply-coupon:
 *   post:
 *     summary: Apply coupon to cart
 *     description: Apply a discount coupon to the cart
 *     tags: [Customer Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coupon_code
 *             properties:
 *               coupon_code:
 *                 type: string
 *                 example: "SAVE20"
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coupon not found
 *       409:
 *         description: Coupon expired or usage limit exceeded
 *       422:
 *         description: Validation error
 */
router.post(
    '/apply-coupon',
    validate(cartValidation.applyCoupon),
    cartController.applyCoupon
);

/**
 * @swagger
 * /cart/remove-coupon:
 *   delete:
 *     summary: Remove coupon from cart
 *     description: Remove applied coupon from the cart
 *     tags: [Customer Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon removed successfully
 *       401:
 *         description: Unauthorized
 */
router.delete(
    '/remove-coupon',
    cartController.removeCoupon
);

module.exports = router;