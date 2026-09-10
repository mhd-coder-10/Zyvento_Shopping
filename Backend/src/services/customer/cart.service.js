// Handles all cart related business logic
// Manages add to cart, update quantity, remove items, clear cart
// Also handles coupon application and cart calculations

const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');
const Inventory = require('../../models/inventory.model');
const Coupon = require('../../models/coupon.model');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');

class CartService {

    // ============ GET CART ============
    async getCart(userId) {
        let cart = await Cart.findOne({ user_id: userId })
            .populate('products.product_id', 'product_name sku price discount final_price images');

        if (!cart) {
            cart = new Cart({
                user_id: userId,
                products: [],
                total_items: 0,
                total_amount: 0
            });
            await cart.save();
        }

        // Calculate cart totals
        return this.calculateCartTotals(cart);
    }

    // ============ ADD TO CART ============
    async addToCart({ userId, productId, quantity = 1, variant = null }) {
        // Check product exists and is active
        const product = await Product.findOne({
            _id: productId,
            status: 'active',
            approval_status: 'approved'
        });

        if (!product) {
            throw ApiError.notFound('Product not found or not available');
        }

        // Check inventory
        const inventory = await Inventory.findOne({ product_id: productId });
        if (!inventory || inventory.available_quantity < quantity) {
            throw ApiError.badRequest('Insufficient stock available');
        }

        // Get or create cart
        let cart = await Cart.findOne({ user_id: userId });

        if (!cart) {
            cart = new Cart({
                user_id: userId,
                products: [],
                total_items: 0,
                total_amount: 0
            });
        }

        // Check if product already in cart
        const existingItemIndex = cart.products.findIndex(
            item => item.product_id.toString() === productId &&
                   JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        const price = product.final_price || product.price;
        const finalPrice = price;

        if (existingItemIndex > -1) {
            // Update existing item quantity
            const newQuantity = cart.products[existingItemIndex].quantity + quantity;
            
            // Check inventory again
            if (inventory.available_quantity < newQuantity) {
                throw ApiError.badRequest('Insufficient stock available');
            }

            cart.products[existingItemIndex].quantity = newQuantity;
            cart.products[existingItemIndex].price = price;
            cart.products[existingItemIndex].final_price = finalPrice;
            cart.products[existingItemIndex].discount = product.discount || 0;
        } else {
            // Add new item
            cart.products.push({
                product_id: productId,
                seller_id: product.seller_id,
                quantity: quantity,
                price: price,
                discount: product.discount || 0,
                final_price: finalPrice,
                product_name: product.product_name,
                product_image: product.images && product.images.length > 0 ? product.images[0] : null,
                variant: variant,
                added_at: new Date()
            });
        }

        // Calculate totals
        cart = await this.calculateCartTotals(cart);
        await cart.save();

        logger.info(`Item added to cart: ${productId}`, { userId, quantity });

        return cart;
    }

    // ============ UPDATE CART ITEM ============
    async updateCartItem({ userId, productId, quantity, variant = null }) {
        if (quantity < 1) {
            throw ApiError.badRequest('Quantity must be at least 1');
        }

        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            throw ApiError.notFound('Cart not found');
        }

        const itemIndex = cart.products.findIndex(
            item => item.product_id.toString() === productId &&
                   JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (itemIndex === -1) {
            throw ApiError.notFound('Item not found in cart');
        }

        // Check inventory
        const inventory = await Inventory.findOne({ product_id: productId });
        if (!inventory || inventory.available_quantity < quantity) {
            throw ApiError.badRequest('Insufficient stock available');
        }

        cart.products[itemIndex].quantity = quantity;

        // Calculate totals
        cart = await this.calculateCartTotals(cart);
        await cart.save();

        return cart;
    }

    // ============ REMOVE FROM CART ============
    async removeFromCart({ userId, productId }) {
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            throw ApiError.notFound('Cart not found');
        }

        cart.products = cart.products.filter(
            item => item.product_id.toString() !== productId
        );

        // Calculate totals
        cart = await this.calculateCartTotals(cart);
        await cart.save();

        return cart;
    }

    // ============ CLEAR CART ============
    async clearCart(userId) {
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            throw ApiError.notFound('Cart not found');
        }

        cart.products = [];
        cart.total_items = 0;
        cart.total_amount = 0;
        cart.coupon_code = null;
        cart.coupon_discount = 0;
        await cart.save();

        return cart;
    }

    // ============ GET CART COUNT ============
    async getCartCount(userId) {
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            return 0;
        }

        return cart.products.reduce((sum, item) => sum + item.quantity, 0);
    }

    // ============ APPLY COUPON ============
    async applyCoupon({ userId, couponCode }) {
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart || cart.products.length === 0) {
            throw ApiError.badRequest('Cart is empty');
        }

        // Validate coupon
        const coupon = await Coupon.findOne({
            coupon_code: couponCode.toUpperCase(),
            status: 'active',
            start_date: { $lte: new Date() },
            expiry_date: { $gte: new Date() }
        });

        if (!coupon) {
            throw ApiError.badRequest('Invalid or expired coupon');
        }

        // Check usage limit
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            throw ApiError.badRequest('Coupon usage limit exceeded');
        }

        // Calculate subtotal
        let subtotal = 0;
        for (const item of cart.products) {
            subtotal += item.price * item.quantity;
        }

        // Check minimum order amount
        if (coupon.minimum_order_amount && subtotal < coupon.minimum_order_amount) {
            throw ApiError.badRequest(`Minimum order amount of ${coupon.minimum_order_amount} required`);
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discount_type === 'percentage') {
            discountAmount = (subtotal * coupon.discount_value) / 100;
            if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
                discountAmount = coupon.maximum_discount;
            }
        } else {
            discountAmount = coupon.discount_value;
        }

        cart.coupon_code = coupon.coupon_code;
        cart.coupon_discount = discountAmount;
        cart.coupon_id = coupon._id;

        // Recalculate total
        cart.total_amount = subtotal - discountAmount;

        await cart.save();

        return cart;
    }

    // ============ REMOVE COUPON ============
    async removeCoupon(userId) {
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            throw ApiError.notFound('Cart not found');
        }

        cart.coupon_code = null;
        cart.coupon_discount = 0;
        cart.coupon_id = null;

        // Recalculate total
        let subtotal = 0;
        for (const item of cart.products) {
            subtotal += item.price * item.quantity;
        }
        cart.total_amount = subtotal;

        await cart.save();

        return cart;
    }

    // ============ CALCULATE CART TOTALS ============
    async calculateCartTotals(cart) {
        let totalItems = 0;
        let subtotal = 0;

        for (const item of cart.products) {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            totalItems += item.quantity;
        }

        cart.total_items = totalItems;

        // Apply coupon discount if any
        if (cart.coupon_discount > 0) {
            cart.total_amount = subtotal - cart.coupon_discount;
        } else {
            cart.total_amount = subtotal;
        }

        return cart;
    }
}

module.exports = new CartService();