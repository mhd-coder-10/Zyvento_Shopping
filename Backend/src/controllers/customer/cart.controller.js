// Handles all cart related API requests
// Manages add to cart, update quantity, remove items, clear cart
// Also handles coupon application and cart count

const cartService = require('../../services/customer/cart.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');

const cartController = {

    // ============ GET CART ============
    getCart: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const cart = await cartService.getCart(userId);

        res.status(200).json(
            ApiResponse.success(cart, 'Cart fetched successfully')
        );
    }),

    // ============ ADD TO CART ============
    addToCart: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { product_id, quantity = 1, variant } = req.body;

        const cart = await cartService.addToCart({
            userId,
            productId: product_id,
            quantity,
            variant
        });

        res.status(200).json(
            ApiResponse.success(cart, 'Item added to cart successfully')
        );
    }),

    // ============ UPDATE CART ITEM ============
    updateCartItem: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { productId } = req.params;
        const { quantity, variant } = req.body;

        const cart = await cartService.updateCartItem({
            userId,
            productId,
            quantity,
            variant
        });

        res.status(200).json(
            ApiResponse.success(cart, 'Cart item updated successfully')
        );
    }),

    // ============ REMOVE FROM CART ============
    removeFromCart: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { productId } = req.params;

        const cart = await cartService.removeFromCart({
            userId,
            productId
        });

        res.status(200).json(
            ApiResponse.success(cart, 'Item removed from cart successfully')
        );
    }),

    // ============ CLEAR CART ============
    clearCart: asyncHandler(async (req, res) => {
        const userId = req.userId;

        const cart = await cartService.clearCart(userId);

        res.status(200).json(
            ApiResponse.success(cart, 'Cart cleared successfully')
        );
    }),

    // ============ GET CART COUNT ============
    getCartCount: asyncHandler(async (req, res) => {
        const userId = req.userId;

        const count = await cartService.getCartCount(userId);

        res.status(200).json(
            ApiResponse.success({ total_items: count }, 'Cart count fetched successfully')
        );
    }),

    // ============ APPLY COUPON ============
    applyCoupon: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { coupon_code } = req.body;

        const cart = await cartService.applyCoupon({
            userId,
            couponCode: coupon_code
        });

        res.status(200).json(
            ApiResponse.success(cart, 'Coupon applied successfully')
        );
    }),

    // ============ REMOVE COUPON ============
    removeCoupon: asyncHandler(async (req, res) => {
        const userId = req.userId;

        const cart = await cartService.removeCoupon(userId);

        res.status(200).json(
            ApiResponse.success(cart, 'Coupon removed successfully')
        );
    })
};

module.exports = cartController;