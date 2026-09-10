// Handles all return related API requests
// Manages return requests, processing returns, and return status updates
// Also handles return statistics and return history

const returnService = require('../../services/order/return.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service'); // ✅ ADDED


const returnController = {

    // ============ CUSTOMER ROUTES ============
    getCustomerReturns: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { page, limit, status } = req.query;

        const result = await returnService.getCustomerReturns({
            userId,
            page,
            limit,
            status
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.returns,
                result.pagination,
                'Returns fetched successfully'
            )
        );
    }),

    getReturnDetails: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { returnId } = req.params;

        const returnData = await returnService.getReturnDetails({
            returnId,
            userId
        });

        res.status(200).json(
            ApiResponse.success(returnData, 'Return details fetched successfully')
        );
    }),

    cancelReturn: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { returnId } = req.params;

        const result = await returnService.cancelReturn({
            returnId,
            userId
        });

        // ✅ AUDIT LOG - Return Cancelled
        await auditService.log({
            userId: req.userId,
            action: 'cancel',
            module: 'return',
            moduleId: returnId,
            description: `Return cancelled by customer`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Return cancelled successfully')
        );
    }),

    // ============ SELLER ROUTES ============
    getSellerReturns: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { page, limit, status } = req.query;

        const result = await returnService.getSellerReturns({
            sellerId,
            page,
            limit,
            status
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.returns,
                result.pagination,
                'Returns fetched successfully'
            )
        );
    }),

    processReturn: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { returnId } = req.params;
        const { status, admin_comment, refund_amount } = req.body;

        // Get old return data for audit
        const oldReturn = await returnService.getReturnDetails({
            returnId,
            userId: req.userId
        });

        const result = await returnService.processReturn({
            returnId,
            sellerId,
            status,
            adminComment: admin_comment,
            refundAmount: refund_amount
        });

        // ✅ AUDIT LOG - Return Processed by Seller
        await auditService.log({
            userId: req.userId,
            action: 'process_return',
            module: 'return',
            moduleId: returnId,
            description: `Return ${status} by seller`,
            oldData: { return_status: oldReturn.return_status },
            newData: { return_status: status, admin_comment, refund_amount },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, `Return ${status} successfully`)
        );
    }),

    // ============ ADMIN ROUTES ============
    adminGetAllReturns: asyncHandler(async (req, res) => {
        const {
            page, limit, seller_id, user_id, status,
            start_date, end_date, sort_by, sort_order
        } = req.query;

        const result = await returnService.adminGetAllReturns({
            page,
            limit,
            sellerId: seller_id,
            userId: user_id,
            status,
            startDate: start_date,
            endDate: end_date,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.returns,
                result.pagination,
                'All returns fetched successfully'
            )
        );
    }),

    adminProcessReturn: asyncHandler(async (req, res) => {
        const { returnId } = req.params;
        const { status, admin_comment, refund_amount } = req.body;

        // Get old return data for audit
        const oldReturn = await returnService.getReturnDetails({
            returnId,
            userId: req.userId
        });

        const result = await returnService.adminProcessReturn({
            returnId,
            status,
            adminComment: admin_comment,
            refundAmount: refund_amount,
            processedBy: req.userId
        });

        // ✅ AUDIT LOG - Return Processed by Admin
        await auditService.log({
            userId: req.userId,
            action: 'admin_process_return',
            module: 'return',
            moduleId: returnId,
            description: `Return ${status} by admin`,
            oldData: { return_status: oldReturn.return_status },
            newData: { return_status: status, admin_comment, refund_amount },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, `Return ${status} successfully`)
        );
    }),

    getReturnStatistics: asyncHandler(async (req, res) => {
        const { seller_id, start_date, end_date } = req.query;

        const statistics = await returnService.getReturnStatistics({
            sellerId: seller_id,
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(statistics, 'Return statistics fetched successfully')
        );
    }),

    // ============ SUB-ADMIN ROUTES ============
    getReturnsBySeller: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { page, limit, status } = req.query;

        const result = await returnService.getReturnsBySeller({
            sellerId,
            page,
            limit,
            status
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.returns,
                result.pagination,
                'Returns fetched successfully'
            )
        );
    }),

    // ============ RETURN ITEM ROUTES ============
    getReturnByOrderItem: asyncHandler(async (req, res) => {
        const { orderItemId } = req.params;

        const returnData = await returnService.getReturnByOrderItem(orderItemId);

        res.status(200).json(
            ApiResponse.success(returnData, 'Return details fetched successfully')
        );
    })
};

module.exports = returnController;