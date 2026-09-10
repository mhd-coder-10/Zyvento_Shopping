// Handles seller approval related API requests
// Manages pending sellers, approval/rejection, and bulk actions
// Also handles approval statistics and history

const sellerApprovalService = require('../../services/seller/sellerApproval.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service'); // ✅ ADDED

const sellerApprovalController = {

    // ============ GET PENDING SELLERS ============
    getPendingSellers: asyncHandler(async (req, res) => {
        const { page, limit, search } = req.query;
        const result = await sellerApprovalService.getPendingSellers({
            page,
            limit,
            search
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.sellers,
                result.pagination,
                'Pending sellers fetched successfully'
            )
        );
    }),

    // ============ GET ALL SELLERS WITH FILTERS ============
    getAllSellers: asyncHandler(async (req, res) => {
        const {
            page, limit, search, verification_status,
            account_status, business_type, sort_by, sort_order
        } = req.query;
        const result = await sellerApprovalService.getAllSellers({
            page,
            limit,
            search,
            verificationStatus: verification_status,
            accountStatus: account_status,
            businessType: business_type,
            sortBy: sort_by,
            sortOrder: sort_order
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.sellers,
                result.pagination,
                'Sellers fetched successfully'
            )
        );
    }),

    // ============ GET SELLER FOR APPROVAL ============
    getSellerForApproval: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const seller = await sellerApprovalService.getSellerForApproval(sellerId);
        res.status(200).json(
            ApiResponse.success(seller, 'Seller details fetched successfully for approval')
        );
    }),

    // ============ APPROVE SELLER ============
    approveSeller: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { notes } = req.body;
        const seller = await sellerApprovalService.approveSeller({
            sellerId,
            adminId: req.userId,
            notes
        });

        // ✅ AUDIT LOG - Seller Approved
        await auditService.log({
            userId: req.userId,
            action: 'approve',
            module: 'seller',
            moduleId: sellerId,
            description: `Seller ${seller.business_name} approved by admin`,
            newData: { business_name: seller.business_name, notes },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(seller, 'Seller approved successfully')
        );
    }),

    // ============ REJECT SELLER ============
    rejectSeller: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { rejection_reason } = req.body;
        const seller = await sellerApprovalService.rejectSeller({
            sellerId,
            rejectionReason: rejection_reason
        });

        // ✅ AUDIT LOG - Seller Rejected
        await auditService.log({
            userId: req.userId,
            action: 'reject',
            module: 'seller',
            moduleId: sellerId,
            description: `Seller ${seller.business_name} rejected by admin`,
            newData: { business_name: seller.business_name, rejection_reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(seller, 'Seller rejected successfully')
        );
    }),

    // ============ BULK APPROVE SELLERS ============
    bulkApproveSellers: asyncHandler(async (req, res) => {
        const { seller_ids, notes } = req.body;
        const result = await sellerApprovalService.bulkApproveSellers({
            sellerIds: seller_ids,
            adminId: req.userId,
            notes
        });

        // ✅ AUDIT LOG - Bulk Sellers Approved
        await auditService.log({
            userId: req.userId,
            action: 'bulk_approve',
            module: 'seller',
            description: `${seller_ids.length} sellers approved by admin`,
            newData: { seller_ids, notes },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Sellers approved successfully')
        );
    }),

    // ============ BULK REJECT SELLERS ============
    bulkRejectSellers: asyncHandler(async (req, res) => {
        const { seller_ids, rejection_reason } = req.body;
        const result = await sellerApprovalService.bulkRejectSellers({
            sellerIds: seller_ids,
            rejectionReason: rejection_reason
        });

        // ✅ AUDIT LOG - Bulk Sellers Rejected
        await auditService.log({
            userId: req.userId,
            action: 'bulk_reject',
            module: 'seller',
            description: `${seller_ids.length} sellers rejected by admin`,
            newData: { seller_ids, rejection_reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Sellers rejected successfully')
        );
    }),

    // ============ GET APPROVAL STATISTICS ============
    getApprovalStatistics: asyncHandler(async (req, res) => {
        const statistics = await sellerApprovalService.getApprovalStatistics();
        res.status(200).json(
            ApiResponse.success(statistics, 'Approval statistics fetched successfully')
        );
    }),

    // ============ GET APPROVAL HISTORY ============
    getApprovalHistory: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { page, limit } = req.query;
        const result = await sellerApprovalService.getApprovalHistory({
            sellerId,
            page,
            limit
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.history,
                result.pagination,
                'Approval history fetched successfully'
            )
        );
    })
};

module.exports = sellerApprovalController;