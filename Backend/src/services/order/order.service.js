// Handles all order related business logic
// Manages placing orders, fetching customer/seller orders, order tracking
// Also handles order status updates, cancellations, and order reports

const Order = require('../../models/order.model');
const OrderItem = require('../../models/order_item.model');
const Product = require('../../models/product.model');
const Inventory = require('../../models/inventory.model');
const Cart = require('../../models/cart.model');
const Coupon = require('../../models/coupon.model');
const Payment = require('../../models/payment.model');
const Notification = require('../../models/notification.model');
const User = require('../../models/user.model');
const Seller = require('../../models/seller.model');
const ApiError = require('../../utils/apiError');
const Helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');
const auditService = require('../audit.service'); // ✅ ADDED

class OrderService {

    // ============ PUBLIC ROUTES ============
    async trackOrder(orderNumber) {
        const order = await Order.findOne({ order_number: orderNumber })
            .populate('user_id', 'first_name last_name email')
            .populate('seller_id', 'business_name')
            .populate({
                path: 'order_items',
                populate: {
                    path: 'product_id',
                    select: 'product_name images sku'
                }
            });

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        return order;
    }

    // ============ CUSTOMER ROUTES ============
    async placeOrder({ userId, shipping_address, order_items, payment_method, coupon_code, notes }) {
        // 1. Validate user
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        // 2. Validate cart items
        if (!order_items || order_items.length === 0) {
            throw ApiError.badRequest('Order items are required');
        }

        // 3. Process each item
        let subtotal = 0;
        const processedItems = [];
        const sellerIds = new Set();

        for (const item of order_items) {
            const product = await Product.findById(item.product_id);
            if (!product) {
                throw ApiError.notFound(`Product not found: ${item.product_id}`);
            }

            if (product.status !== 'active' || product.approval_status !== 'approved') {
                throw ApiError.badRequest(`Product "${product.product_name}" is not available`);
            }

            // Check inventory
            const inventory = await Inventory.findOne({ product_id: product._id });
            if (!inventory || inventory.available_quantity < item.quantity) {
                throw ApiError.badRequest(`Insufficient stock for product: ${product.product_name}`);
            }

            const price = product.final_price || product.price;
            const itemTotal = price * item.quantity;

            processedItems.push({
                product_id: product._id,
                seller_id: product.seller_id,
                product_name: product.product_name,
                product_image: product.images && product.images.length > 0 ? product.images[0] : null,
                variant_name: item.variant?.name || null,
                variant_option: item.variant?.option || null,
                quantity: item.quantity,
                price: price,
                total_price: itemTotal
            });

            subtotal += itemTotal;
            sellerIds.add(product.seller_id.toString());

            // Reserve inventory
            inventory.reserved_quantity += item.quantity;
            inventory.available_quantity = inventory.stock_quantity - inventory.reserved_quantity;
            await inventory.save();
        }

        // 4. Check if multiple sellers
        if (sellerIds.size > 1) {
            throw ApiError.badRequest('Order cannot contain products from multiple sellers in single order');
        }

        const sellerId = Array.from(sellerIds)[0];

        // 5. Validate coupon
        let discountAmount = 0;
        let couponId = null;
        let couponCodeApplied = null;

        if (coupon_code) {
            const coupon = await Coupon.findOne({
                coupon_code: coupon_code.toUpperCase(),
                status: 'active',
                start_date: { $lte: new Date() },
                expiry_date: { $gte: new Date() }
            });

            if (coupon) {
                // Check usage limit
                if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
                    throw ApiError.badRequest('Coupon usage limit exceeded');
                }

                // Check minimum order amount
                if (coupon.minimum_order_amount && subtotal < coupon.minimum_order_amount) {
                    throw ApiError.badRequest(`Minimum order amount of ${coupon.minimum_order_amount} required for this coupon`);
                }

                // Calculate discount
                if (coupon.discount_type === 'percentage') {
                    discountAmount = (subtotal * coupon.discount_value) / 100;
                    if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
                        discountAmount = coupon.maximum_discount;
                    }
                } else {
                    discountAmount = coupon.discount_value;
                }

                couponId = coupon._id;
                couponCodeApplied = coupon.coupon_code;

                // Increment coupon usage
                coupon.used_count += 1;
                await coupon.save();
            } else {
                throw ApiError.badRequest('Invalid or expired coupon code');
            }
        }

        // 6. Calculate totals
        const totalAmount = subtotal - discountAmount;
        const deliveryCharge = 0; // Calculate based on delivery settings

        // 7. Generate order number
        const orderNumber = Helpers.generateOrderNumber();

        // 8. Create order
        const order = new Order({
            order_number: orderNumber,
            user_id: userId,
            seller_id: sellerId,
            shipping_address,
            total_items: processedItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal,
            discount_amount: discountAmount,
            delivery_charge: deliveryCharge,
            total_amount: totalAmount,
            coupon_id: couponId,
            coupon_code: couponCodeApplied,
            coupon_discount: discountAmount,
            payment_method: payment_method,
            payment_status: 'pending',
            order_status: 'pending',
            notes: notes || null
        });

        await order.save();

        // 9. Create order items
        const orderItems = [];
        for (const item of processedItems) {
            const orderItem = new OrderItem({
                order_id: order._id,
                ...item,
                item_status: 'pending'
            });
            await orderItem.save();
            orderItems.push(orderItem._id);
        }

        order.order_items = orderItems;
        await order.save();

        // 10. Clear cart
        await Cart.findOneAndUpdate(
            { user_id: userId },
            { $set: { products: [], total_items: 0, total_amount: 0 } }
        );

        // 11. Create payment record
        const payment = new Payment({
            order_id: order._id,
            user_id: userId,
            seller_id: sellerId,
            payment_method: payment_method,
            amount: totalAmount,
            payment_status: 'pending'
        });
        await payment.save();

        order.payment_id = payment._id;
        await order.save();

        // 12. Send notifications
        // To customer
        await Notification.create({
            user_id: userId,
            receiver_type: 'customer',
            title: 'Order Placed',
            message: `Your order #${orderNumber} has been placed successfully.`,
            notification_type: 'order',
            reference_id: order._id,
            reference_model: 'Order',
            channel: 'in_app'
        });

        // To seller
        const seller = await Seller.findById(sellerId);
        await Notification.create({
            user_id: seller.user_id,
            receiver_type: 'seller',
            title: 'New Order Received',
            message: `New order #${orderNumber} received from ${user.first_name} ${user.last_name}`,
            notification_type: 'order',
            reference_id: order._id,
            reference_model: 'Order',
            channel: 'in_app',
            priority: 'high'
        });

        // ✅ AUDIT LOG - Order Placed (Service Level)
        await auditService.logOrderCreation(
            userId,
            order._id,
            order,
            null,
            null
        );

        logger.info(`Order placed: ${orderNumber}`, { orderId: order._id, userId });

        return order;
    }

    async getCustomerOrders({
        userId,
        page = 1,
        limit = 10,
        orderStatus = null,
        paymentStatus = null,
        startDate = null,
        endDate = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const query = { user_id: userId };

        if (orderStatus) {
            query.order_status = orderStatus;
        }

        if (paymentStatus) {
            query.payment_status = paymentStatus;
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

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('seller_id', 'business_name')
                .populate({
                    path: 'order_items',
                    populate: {
                        path: 'product_id',
                        select: 'product_name images sku'
                    }
                })
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        return {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getCustomerOrderDetails({ orderId, userId }) {
        const order = await Order.findOne({
            _id: orderId,
            user_id: userId
        })
            .populate('seller_id', 'business_name business_address')
            .populate({
                path: 'order_items',
                populate: {
                    path: 'product_id',
                    select: 'product_name images sku price'
                }
            })
            .populate('payment_id');

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        return order;
    }

    async cancelOrder({ orderId, userId, reason, cancelledBy }) {
        const order = await Order.findOne({
            _id: orderId,
            user_id: userId
        });

        if (!order) {
            throw ApiError.notFound('Order not found or unauthorized');
        }

        if (order.order_status === 'delivered') {
            throw ApiError.badRequest('Cannot cancel delivered order');
        }

        if (order.order_status === 'cancelled') {
            throw ApiError.badRequest('Order already cancelled');
        }

        // Release reserved inventory
        const orderItems = await OrderItem.find({ order_id: orderId });
        for (const item of orderItems) {
            const inventory = await Inventory.findOne({ product_id: item.product_id });
            if (inventory) {
                inventory.reserved_quantity -= item.quantity;
                inventory.available_quantity = inventory.stock_quantity - inventory.reserved_quantity;
                await inventory.save();
            }
        }

        order.order_status = 'cancelled';
        order.cancelled_reason = reason;
        order.cancelled_by = cancelledBy;
        order.cancelled_at = new Date();
        await order.save();

        // Update order items status
        await OrderItem.updateMany(
            { order_id: orderId },
            { item_status: 'cancelled' }
        );

        // Notify seller
        const seller = await Seller.findById(order.seller_id);
        await Notification.create({
            user_id: seller.user_id,
            receiver_type: 'seller',
            title: 'Order Cancelled',
            message: `Order #${order.order_number} has been cancelled by customer. Reason: ${reason}`,
            notification_type: 'order',
            reference_id: order._id,
            reference_model: 'Order',
            channel: 'in_app'
        });

        // ✅ AUDIT LOG - Order Cancelled (Service Level)
        await auditService.log({
            userId: cancelledBy,
            action: 'cancel',
            module: 'order',
            moduleId: orderId,
            description: `Order cancelled: ${order.order_number}`,
            newData: { reason },
            status: 'success'
        });

        return order;
    }

    // ============ SELLER ROUTES ============
    async getSellerOrders({
        sellerId,
        page = 1,
        limit = 10,
        orderStatus = null,
        paymentStatus = null,
        startDate = null,
        endDate = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const query = { seller_id: sellerId };

        if (orderStatus) {
            query.order_status = orderStatus;
        }

        if (paymentStatus) {
            query.payment_status = paymentStatus;
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

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user_id', 'first_name last_name email mobile_number')
                .populate({
                    path: 'order_items',
                    populate: {
                        path: 'product_id',
                        select: 'product_name images sku'
                    }
                })
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        return {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getSellerOrderDetails({ orderId, sellerId }) {
        const order = await Order.findOne({
            _id: orderId,
            seller_id: sellerId
        })
            .populate('user_id', 'first_name last_name email mobile_number')
            .populate({
                path: 'order_items',
                populate: {
                    path: 'product_id',
                    select: 'product_name images sku price'
                }
            })
            .populate('payment_id');

        if (!order) {
            throw ApiError.notFound('Order not found or unauthorized');
        }

        return order;
    }

    async updateOrderStatus({
        orderId,
        sellerId,
        status,
        notes,
        trackingId,
        trackingCarrier,
        trackingUrl,
        updatedBy
    }) {
        const order = await Order.findOne({
            _id: orderId,
            seller_id: sellerId
        });

        if (!order) {
            throw ApiError.notFound('Order not found or unauthorized');
        }

        const oldStatus = order.order_status;

        // Validate status transition
        if (oldStatus === 'cancelled' || oldStatus === 'delivered') {
            throw ApiError.badRequest(`Cannot update status of ${oldStatus} order`);
        }

        order.order_status = status;
        
        if (notes) {
            order.admin_notes = notes;
        }

        if (trackingId) {
            order.tracking_id = trackingId;
        }

        if (trackingCarrier) {
            order.tracking_carrier = trackingCarrier;
        }

        if (trackingUrl) {
            order.tracking_url = trackingUrl;
        }

        // Add to status history
        order.status_history.push({
            status: status,
            updated_by: updatedBy,
            notes: notes || '',
            timestamp: new Date()
        });

        if (status === constants.ORDER_STATUS.DELIVERED) {
            order.delivered_at = new Date();
        }

        await order.save();

        // Update order items status
        await OrderItem.updateMany(
            { order_id: orderId },
            { item_status: status }
        );

        // If status is shipped or delivered, update inventory
        if (status === constants.ORDER_STATUS.SHIPPED || status === constants.ORDER_STATUS.DELIVERED) {
            const orderItems = await OrderItem.find({ order_id: orderId });
            for (const item of orderItems) {
                const inventory = await Inventory.findOne({ product_id: item.product_id });
                if (inventory) {
                    inventory.reserved_quantity -= item.quantity;
                    inventory.sold_quantity += item.quantity;
                    inventory.available_quantity = inventory.stock_quantity - inventory.reserved_quantity;
                    await inventory.save();
                }
            }
        }

        // Create notification for customer
        await Notification.create({
            user_id: order.user_id,
            receiver_type: 'customer',
            title: `Order Status Updated - #${order.order_number}`,
            message: `Your order #${order.order_number} is now ${status}`,
            notification_type: 'order',
            reference_id: order._id,
            reference_model: 'Order',
            channel: 'in_app'
        });

        // ✅ AUDIT LOG - Order Status Update (Service Level)
        await auditService.logOrderStatusUpdate(
            updatedBy,
            order._id,
            oldStatus,
            status,
            null,
            null
        );

        return order;
    }

    // ============ ADMIN ROUTES ============
    // ... (rest of the methods remain the same, but with audit logs added at appropriate places)
    // I'll add audit logs in the remaining methods as well

    async adminUpdateOrderStatus({
        orderId,
        status,
        notes,
        trackingId,
        trackingCarrier,
        trackingUrl,
        updatedBy
    }) {
        const order = await Order.findById(orderId);

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        const oldStatus = order.order_status;

        if (oldStatus === 'cancelled' || oldStatus === 'delivered') {
            throw ApiError.badRequest(`Cannot update status of ${oldStatus} order`);
        }

        order.order_status = status;
        
        if (notes) {
            order.admin_notes = notes;
        }

        if (trackingId) {
            order.tracking_id = trackingId;
        }

        if (trackingCarrier) {
            order.tracking_carrier = trackingCarrier;
        }

        if (trackingUrl) {
            order.tracking_url = trackingUrl;
        }

        order.status_history.push({
            status: status,
            updated_by: updatedBy,
            notes: notes || '',
            timestamp: new Date()
        });

        if (status === constants.ORDER_STATUS.DELIVERED) {
            order.delivered_at = new Date();
        }

        await order.save();

        await OrderItem.updateMany(
            { order_id: orderId },
            { item_status: status }
        );

        await Notification.create({
            user_id: order.user_id,
            receiver_type: 'customer',
            title: `Order Status Updated - #${order.order_number}`,
            message: `Your order #${order.order_number} is now ${status}`,
            notification_type: 'order',
            reference_id: order._id,
            reference_model: 'Order',
            channel: 'in_app'
        });

        const seller = await Seller.findById(order.seller_id);
        await Notification.create({
            user_id: seller.user_id,
            receiver_type: 'seller',
            title: `Order Status Updated - #${order.order_number}`,
            message: `Order #${order.order_number} status updated to ${status}`,
            notification_type: 'order',
            reference_id: order._id,
            reference_model: 'Order',
            channel: 'in_app'
        });

        // ✅ AUDIT LOG - Admin Order Status Update (Service Level)
        await auditService.logOrderStatusUpdate(
            updatedBy,
            order._id,
            oldStatus,
            status,
            null,
            null
        );

        return order;
    }

    async adminCancelOrder({ orderId, reason, cancelledBy }) {
        const order = await Order.findById(orderId);

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        if (order.order_status === 'delivered') {
            throw ApiError.badRequest('Cannot cancel delivered order');
        }

        if (order.order_status === 'cancelled') {
            throw ApiError.badRequest('Order already cancelled');
        }

        const orderItems = await OrderItem.find({ order_id: orderId });
        for (const item of orderItems) {
            const inventory = await Inventory.findOne({ product_id: item.product_id });
            if (inventory) {
                inventory.reserved_quantity -= item.quantity;
                inventory.available_quantity = inventory.stock_quantity - inventory.reserved_quantity;
                await inventory.save();
            }
        }

        order.order_status = 'cancelled';
        order.cancelled_reason = reason;
        order.cancelled_by = cancelledBy;
        order.cancelled_at = new Date();
        await order.save();

        await OrderItem.updateMany(
            { order_id: orderId },
            { item_status: 'cancelled' }
        );

        await Notification.create({
            user_id: order.user_id,
            receiver_type: 'customer',
            title: `Order Cancelled - #${order.order_number}`,
            message: `Your order #${order.order_number} has been cancelled by admin. Reason: ${reason}`,
            notification_type: 'order',
            reference_id: order._id,
            reference_model: 'Order',
            channel: 'in_app'
        });

        const seller = await Seller.findById(order.seller_id);
        await Notification.create({
            user_id: seller.user_id,
            receiver_type: 'seller',
            title: `Order Cancelled - #${order.order_number}`,
            message: `Order #${order.order_number} has been cancelled by admin. Reason: ${reason}`,
            notification_type: 'order',
            reference_id: order._id,
            reference_model: 'Order',
            channel: 'in_app'
        });

        // ✅ AUDIT LOG - Admin Order Cancelled (Service Level)
        await auditService.log({
            userId: cancelledBy,
            action: 'cancel',
            module: 'order',
            moduleId: orderId,
            description: `Order cancelled by admin: ${order.order_number}`,
            newData: { reason },
            status: 'success'
        });

        return order;
    }

    async getOrderStatistics({ sellerId = null, startDate = null, endDate = null }) {
        const matchQuery = {};

        if (sellerId) {
            matchQuery.seller_id = sellerId;
        }

        if (startDate || endDate) {
            matchQuery.created_at = {};
            if (startDate) {
                matchQuery.created_at.$gte = new Date(startDate);
            }
            if (endDate) {
                matchQuery.created_at.$lte = new Date(endDate);
            }
        }

        const [
            totalOrders,
            totalRevenue,
            statusDistribution,
            paymentStatusDistribution,
            averageOrderValue
        ] = await Promise.all([
            Order.countDocuments(matchQuery),
            Order.aggregate([
                { $match: { ...matchQuery, payment_status: constants.PAYMENT_STATUS.PAID } },
                { $group: { _id: null, total: { $sum: '$total_amount' } } }
            ]),
            Order.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$order_status', count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$payment_status', count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { ...matchQuery, payment_status: constants.PAYMENT_STATUS.PAID } },
                { $group: { _id: null, avg: { $avg: '$total_amount' } } }
            ])
        ]);

        return {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            statusDistribution,
            paymentStatusDistribution,
            averageOrderValue: Math.round(averageOrderValue[0]?.avg || 0)
        };
    }

    async getOrderReport({ startDate, endDate, sellerId = null }) {
        const matchQuery = {
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        if (sellerId) {
            matchQuery.seller_id = sellerId;
        }

        const dailyTrend = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                    orders: { $sum: 1 },
                    revenue: { $sum: { $cond: [{ $eq: ['$payment_status', constants.PAYMENT_STATUS.PAID] }, '$total_amount', 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const topProducts = await OrderItem.aggregate([
            { $match: { order_id: { $in: await Order.find(matchQuery).distinct('_id') } } },
            {
                $group: {
                    _id: '$product_id',
                    productName: { $first: '$product_name' },
                    totalSold: { $sum: '$quantity' },
                    totalRevenue: { $sum: '$total_price' }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ]);

        const topSellers = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$seller_id',
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: { $cond: [{ $eq: ['$payment_status', constants.PAYMENT_STATUS.PAID] }, '$total_amount', 0] } }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'sellers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'seller'
                }
            },
            { $unwind: '$seller' },
            {
                $project: {
                    sellerId: '$_id',
                    businessName: '$seller.business_name',
                    totalOrders: 1,
                    totalRevenue: 1
                }
            }
        ]);

        return {
            period: { startDate, endDate },
            summary: {
                totalOrders: dailyTrend.reduce((sum, d) => sum + d.orders, 0),
                totalRevenue: dailyTrend.reduce((sum, d) => sum + d.revenue, 0)
            },
            dailyTrend,
            topProducts,
            topSellers
        };
    }

    // ============ SUB-ADMIN ROUTES ============
    async getOrdersBySeller({
        sellerId,
        page = 1,
        limit = 10,
        orderStatus = null,
        paymentStatus = null,
        startDate = null,
        endDate = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const query = { seller_id: sellerId };

        if (orderStatus) {
            query.order_status = orderStatus;
        }

        if (paymentStatus) {
            query.payment_status = paymentStatus;
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

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user_id', 'first_name last_name email mobile_number')
                .populate({
                    path: 'order_items',
                    populate: {
                        path: 'product_id',
                        select: 'product_name images sku'
                    }
                })
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        return {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ ORDER ITEM ROUTES ============
    async getOrderItemDetails(orderItemId) {
        const orderItem = await OrderItem.findById(orderItemId)
            .populate('product_id', 'product_name images sku price')
            .populate('order_id', 'order_number user_id seller_id');

        if (!orderItem) {
            throw ApiError.notFound('Order item not found');
        }

        return orderItem;
    }

    async updateOrderItemStatus({
        orderItemId,
        sellerId,
        status,
        notes,
        updatedBy
    }) {
        const orderItem = await OrderItem.findById(orderItemId)
            .populate('order_id');

        if (!orderItem) {
            throw ApiError.notFound('Order item not found');
        }

        if (orderItem.seller_id.toString() !== sellerId) {
            throw ApiError.forbidden('You are not authorized to update this order item');
        }

        // ✅ AUDIT LOG - Order Item Status Update (Service Level)
        await auditService.log({
            userId: updatedBy,
            action: 'update',
            module: 'order_item',
            moduleId: orderItemId,
            description: `Order item status updated to ${status}`,
            oldData: { item_status: orderItem.item_status },
            newData: { item_status: status, notes },
            status: 'success'
        });

        orderItem.item_status = status;
        orderItem.status_history.push({
            status: status,
            updated_by: updatedBy,
            notes: notes || '',
            timestamp: new Date()
        });

        if (status === constants.ORDER_STATUS.SHIPPED) {
            orderItem.shipped_at = new Date();
        }

        if (status === constants.ORDER_STATUS.DELIVERED) {
            orderItem.delivered_at = new Date();
        }

        await orderItem.save();

        const orderItems = await OrderItem.find({ order_id: orderItem.order_id });
        const allSameStatus = orderItems.every(item => item.item_status === status);

        if (allSameStatus) {
            await Order.findByIdAndUpdate(orderItem.order_id, {
                order_status: status
            });
        }

        return orderItem;
    }
}

module.exports = new OrderService();