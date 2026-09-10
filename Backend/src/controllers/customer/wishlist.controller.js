// Handles all wishlist related API requests
// Manages add to wishlist, remove from wishlist, clear wishlist
// Also handles moving items from wishlist to cart

const wishlistService = require('../../services/customer/wishlist.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');

const wishlistController = {

    // ============ GET WISHLIST ============
    getWishlist: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;

        const result = await wishlistService.getWishlist({
            userId,
            page,
            limit
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'Wishlist fetched successfully'
            )
        );
    }),

    // ============ ADD TO WISHLIST ============
    addToWishlist: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { product_id } = req.body;

        const wishlist = await wishlistService.addToWishlist({
            userId,
            productId: product_id
        });

        res.status(200).json(
            ApiResponse.success(wishlist, 'Item added to wishlist successfully')
        );
    }),

    // ============ REMOVE FROM WISHLIST ============
    removeFromWishlist: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { productId } = req.params;

        const wishlist = await wishlistService.removeFromWishlist({
            userId,
            productId
        });

        res.status(200).json(
            ApiResponse.success(wishlist, 'Item removed from wishlist successfully')
        );
    }),

    // ============ CLEAR WISHLIST ============
    clearWishlist: asyncHandler(async (req, res) => {
        const userId = req.userId;

        const wishlist = await wishlistService.clearWishlist(userId);

        res.status(200).json(
            ApiResponse.success(wishlist, 'Wishlist cleared successfully')
        );
    }),

    // ============ CHECK WISHLIST ============
    checkWishlist: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { productId } = req.params;

        const isInWishlist = await wishlistService.checkWishlist({
            userId,
            productId
        });

        res.status(200).json(
            ApiResponse.success({ is_in_wishlist: isInWishlist }, 'Wishlist check successful')
        );
    }),

    // ============ MOVE TO CART ============
    moveToCart: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { productId } = req.params;
        const { quantity = 1 } = req.body;

        const result = await wishlistService.moveToCart({
            userId,
            productId,
            quantity
        });

        res.status(200).json(
            ApiResponse.success(result, 'Item moved to cart successfully')
        );
    }),

    // ============ MOVE ALL TO CART ============
    moveAllToCart: asyncHandler(async (req, res) => {
        const userId = req.userId;

        const result = await wishlistService.moveAllToCart(userId);

        res.status(200).json(
            ApiResponse.success(result, 'All items moved to cart successfully')
        );
    })
};

module.exports = wishlistController;