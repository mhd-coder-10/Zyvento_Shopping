// Handles all order related API requests
// Manages placing orders, fetching customer/seller orders, order tracking
// Also handles order status updates, cancellations, and order reports

const orderService = require('../../services/order/order.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service'); // ✅ ADDED


const orderController = {

    // ============ PUBLIC ROUTES ============
    trackOrder: asyncHandler(async (req, res) => {
        const { orderNumber } = req.params;
        const order = await orderService.trackOrder(orderNumber);
        res.status(200).json(
            ApiResponse.success(order, 'Order tracking details fetched successfully')
        );
    }),

    // ============ CUSTOMER ROUTES ============
    placeOrder: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const orderData = req.body;

        const order = await orderService.placeOrder({
            userId,
            ...orderData
        });

        // ✅ AUDIT LOG - Order Placed
        await auditService.logOrderCreation(
            userId,
            order._id,
            order,
            req.ip,
            req.get('user-agent')
        );

        res.status(201).json(
            ApiResponse.created(order, 'Order placed successfully')
        );
    }),

    getCustomerOrders: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const {
            page, limit, order_status, payment_status,
            start_date, end_date, sort_by, sort_order
        } = req.query;

        const result = await orderService.getCustomerOrders({
            userId,
            page,
            limit,
            orderStatus: order_status,
            paymentStatus: payment_status,
            startDate: start_date,
            endDate: end_date,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.orders,
                result.pagination,
                'Orders fetched successfully'
            )
        );
    }),

    getCustomerOrderDetails: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { orderId } = req.params;

        const order = await orderService.getCustomerOrderDetails({
            orderId,
            userId
        });

        res.status(200).json(
            ApiResponse.success(order, 'Order details fetched successfully')
        );
    }),

    cancelOrder: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { orderId } = req.params;
        const { reason } = req.body;

        const order = await orderService.cancelOrder({
            orderId,
            userId,
            reason,
            cancelledBy: userId
        });

        // ✅ AUDIT LOG - Order Cancelled
        await auditService.log({
            userId: req.userId,
            action: 'cancel',
            module: 'order',
            moduleId: orderId,
            description: `Order cancelled: ${order.order_number}`,
            newData: { reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(order, 'Order cancelled successfully')
        );
    }),

    requestReturn: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { orderId } = req.params;
        const returnData = req.body;

        const result = await orderService.requestReturn({
            userId,
            orderId,
            ...returnData
        });

        // ✅ AUDIT LOG - Return Requested
        await auditService.log({
            userId: req.userId,
            action: 'request_return',
            module: 'order',
            moduleId: orderId,
            description: `Return requested for order: ${orderId}`,
            newData: returnData,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(201).json(
            ApiResponse.created(result, 'Return request submitted successfully')
        );
    }),

    // ============ SELLER ROUTES ============
    getSellerOrders: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const {
            page, limit, order_status, payment_status,
            start_date, end_date, sort_by, sort_order
        } = req.query;

        const result = await orderService.getSellerOrders({
            sellerId,
            page,
            limit,
            orderStatus: order_status,
            paymentStatus: payment_status,
            startDate: start_date,
            endDate: end_date,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.orders,
                result.pagination,
                'Orders fetched successfully'
            )
        );
    }),

    getSellerOrderDetails: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { orderId } = req.params;

        const order = await orderService.getSellerOrderDetails({
            orderId,
            sellerId
        });

        res.status(200).json(
            ApiResponse.success(order, 'Order details fetched successfully')
        );
    }),

    updateOrderStatus: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { orderId } = req.params;
        const { status, notes, tracking_id, tracking_carrier, tracking_url } = req.body;

        // Get old order for audit
        const oldOrder = await orderService.getSellerOrderDetails({
            orderId,
            sellerId
        });

        const order = await orderService.updateOrderStatus({
            orderId,
            sellerId,
            status,
            notes,
            trackingId: tracking_id,
            trackingCarrier: tracking_carrier,
            trackingUrl: tracking_url,
            updatedBy: sellerId
        });

        // ✅ AUDIT LOG - Order Status Update
        await auditService.logOrderStatusUpdate(
            req.userId,
            order._id,
            oldOrder.order_status,
            status,
            req.ip,
            req.get('user-agent')
        );

        res.status(200).json(
            ApiResponse.success(order, 'Order status updated successfully')
        );
    }),

    // ============ ADMIN ROUTES ============
    adminGetAllOrders: asyncHandler(async (req, res) => {
        const {
            page, limit, seller_id, user_id, order_status,
            payment_status, order_number, start_date, end_date,
            min_amount, max_amount, sort_by, sort_order
        } = req.query;

        const result = await orderService.adminGetAllOrders({
            page,
            limit,
            sellerId: seller_id,
            userId: user_id,
            orderStatus: order_status,
            paymentStatus: payment_status,
            orderNumber: order_number,
            startDate: start_date,
            endDate: end_date,
            minAmount: min_amount,
            maxAmount: max_amount,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.orders,
                result.pagination,
                'All orders fetched successfully'
            )
        );
    }),

    adminGetOrderDetails: asyncHandler(async (req, res) => {
        const { orderId } = req.params;

        const order = await orderService.adminGetOrderDetails(orderId);

        res.status(200).json(
            ApiResponse.success(order, 'Order details fetched successfully')
        );
    }),

    adminUpdateOrderStatus: asyncHandler(async (req, res) => {
        const { orderId } = req.params;
        const { status, notes, tracking_id, tracking_carrier, tracking_url } = req.body;

        // Get old order for audit
        const oldOrder = await orderService.adminGetOrderDetails(orderId);

        const order = await orderService.adminUpdateOrderStatus({
            orderId,
            status,
            notes,
            trackingId: tracking_id,
            trackingCarrier: tracking_carrier,
            trackingUrl: tracking_url,
            updatedBy: req.userId
        });

        // ✅ AUDIT LOG - Admin Order Status Update
        await auditService.logOrderStatusUpdate(
            req.userId,
            order._id,
            oldOrder.order_status,
            status,
            req.ip,
            req.get('user-agent')
        );

        res.status(200).json(
            ApiResponse.success(order, 'Order status updated successfully')
        );
    }),

    adminCancelOrder: asyncHandler(async (req, res) => {
        const { orderId } = req.params;
        const { reason } = req.body;

        const order = await orderService.adminCancelOrder({
            orderId,
            reason,
            cancelledBy: req.userId
        });

        // ✅ AUDIT LOG - Admin Order Cancelled
        await auditService.log({
            userId: req.userId,
            action: 'cancel',
            module: 'order',
            moduleId: orderId,
            description: `Order cancelled by admin: ${order.order_number}`,
            newData: { reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(order, 'Order cancelled successfully')
        );
    }),

    getOrderStatistics: asyncHandler(async (req, res) => {
        const { seller_id, start_date, end_date } = req.query;

        const statistics = await orderService.getOrderStatistics({
            sellerId: seller_id,
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(statistics, 'Order statistics fetched successfully')
        );
    }),

    getOrderReport: asyncHandler(async (req, res) => {
        const { start_date, end_date, seller_id } = req.query;

        const report = await orderService.getOrderReport({
            startDate: start_date,
            endDate: end_date,
            sellerId: seller_id
        });

        res.status(200).json(
            ApiResponse.success(report, 'Order report generated successfully')
        );
    }),

    // ============ SUB-ADMIN ROUTES ============
    getOrdersBySeller: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const {
            page, limit, order_status, payment_status,
            start_date, end_date, sort_by, sort_order
        } = req.query;

        const result = await orderService.getOrdersBySeller({
            sellerId,
            page,
            limit,
            orderStatus: order_status,
            paymentStatus: payment_status,
            startDate: start_date,
            endDate: end_date,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.orders,
                result.pagination,
                'Orders fetched successfully'
            )
        );
    }),

    // ============ ORDER ITEM ROUTES ============
    getOrderItemDetails: asyncHandler(async (req, res) => {
        const { orderItemId } = req.params;

        const orderItem = await orderService.getOrderItemDetails(orderItemId);

        res.status(200).json(
            ApiResponse.success(orderItem, 'Order item details fetched successfully')
        );
    }),

    updateOrderItemStatus: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { orderItemId } = req.params;
        const { status, notes } = req.body;

        // Get old order item for audit
        const oldOrderItem = await orderService.getOrderItemDetails(orderItemId);

        const orderItem = await orderService.updateOrderItemStatus({
            orderItemId,
            sellerId,
            status,
            notes,
            updatedBy: sellerId
        });

        // ✅ AUDIT LOG - Order Item Status Update
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'order_item',
            moduleId: orderItemId,
            description: `Order item status updated to ${status}`,
            oldData: { item_status: oldOrderItem.item_status },
            newData: { item_status: status },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(orderItem, 'Order item status updated successfully')
        );
    })
};

module.exports = orderController;