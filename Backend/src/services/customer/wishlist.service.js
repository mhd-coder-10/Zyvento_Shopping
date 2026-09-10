// Handles all wishlist related business logic
// Manages add to wishlist, remove from wishlist, clear wishlist
// Also handles moving items from wishlist to cart

const Wishlist = require('../../models/wishlist.model');
const Product = require('../../models/product.model');
const cartService = require('./cart.service');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');

class WishlistService {

    // ============ GET WISHLIST ============
    async getWishlist({ userId, page = 1, limit = 10 }) {
        let wishlist = await Wishlist.findOne({ user_id: userId })
            .populate({
                path: 'products.product_id',
                select: 'product_name sku price final_price discount images brand rating seller_id',
                populate: {
                    path: 'seller_id',
                    select: 'business_name rating'
                }
            });

        if (!wishlist) {
            wishlist = new Wishlist({
                user_id: userId,
                products: []
            });
            await wishlist.save();
        }

        // Paginate products
        const products = wishlist.products || [];
        const total = products.length;
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedProducts = products.slice(start, end);

        return {
            products: paginatedProducts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ ADD TO WISHLIST ============
    async addToWishlist({ userId, productId }) {
        // Check product exists and is active
        const product = await Product.findOne({
            _id: productId,
            status: 'active',
            approval_status: 'approved'
        });

        if (!product) {
            throw ApiError.notFound('Product not found or not available');
        }

        let wishlist = await Wishlist.findOne({ user_id: userId });

        if (!wishlist) {
            wishlist = new Wishlist({
                user_id: userId,
                products: []
            });
        }

        // Check if product already in wishlist
        const existingItem = wishlist.products.find(
            item => item.product_id.toString() === productId
        );

        if (existingItem) {
            throw ApiError.conflict('Product already in wishlist');
        }

        wishlist.products.push({
            product_id: productId,
            added_at: new Date()
        });

        await wishlist.save();

        logger.info(`Item added to wishlist: ${productId}`, { userId });

        return wishlist;
    }

    // ============ REMOVE FROM WISHLIST ============
    async removeFromWishlist({ userId, productId }) {
        const wishlist = await Wishlist.findOne({ user_id: userId });
        if (!wishlist) {
            throw ApiError.notFound('Wishlist not found');
        }

        const initialLength = wishlist.products.length;
        wishlist.products = wishlist.products.filter(
            item => item.product_id.toString() !== productId
        );

        if (initialLength === wishlist.products.length) {
            throw ApiError.notFound('Product not found in wishlist');
        }

        await wishlist.save();

        return wishlist;
    }

    // ============ CLEAR WISHLIST ============
    async clearWishlist(userId) {
        const wishlist = await Wishlist.findOne({ user_id: userId });
        if (!wishlist) {
            throw ApiError.notFound('Wishlist not found');
        }

        wishlist.products = [];
        await wishlist.save();

        return wishlist;
    }

    // ============ CHECK WISHLIST ============
    async checkWishlist({ userId, productId }) {
        const wishlist = await Wishlist.findOne({ user_id: userId });
        if (!wishlist) {
            return false;
        }

        return wishlist.products.some(
            item => item.product_id.toString() === productId
        );
    }

    // ============ MOVE TO CART ============
    async moveToCart({ userId, productId, quantity = 1 }) {
        // Check if product is in wishlist
        const wishlist = await Wishlist.findOne({ user_id: userId });
        if (!wishlist) {
            throw ApiError.notFound('Wishlist not found');
        }

        const itemIndex = wishlist.products.findIndex(
            item => item.product_id.toString() === productId
        );

        if (itemIndex === -1) {
            throw ApiError.notFound('Product not found in wishlist');
        }

        // Add to cart
        await cartService.addToCart({
            userId,
            productId,
            quantity
        });

        // Remove from wishlist
        wishlist.products.splice(itemIndex, 1);
        await wishlist.save();

        return { message: 'Item moved to cart successfully' };
    }

    // ============ MOVE ALL TO CART ============
    async moveAllToCart(userId) {
        const wishlist = await Wishlist.findOne({ user_id: userId });
        if (!wishlist || wishlist.products.length === 0) {
            throw ApiError.badRequest('Wishlist is empty');
        }

        let movedCount = 0;
        const errors = [];

        for (const item of wishlist.products) {
            try {
                await cartService.addToCart({
                    userId,
                    productId: item.product_id.toString(),
                    quantity: 1
                });
                movedCount++;
            } catch (error) {
                errors.push({
                    product_id: item.product_id,
                    error: error.message
                });
            }
        }

        // Clear wishlist
        wishlist.products = [];
        await wishlist.save();

        return {
            moved_count: movedCount,
            errors
        };
    }
}

module.exports = new WishlistService();