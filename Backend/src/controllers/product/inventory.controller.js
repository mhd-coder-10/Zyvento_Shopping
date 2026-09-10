// Handles all inventory related API requests
// Manages stock updates, bulk inventory, low stock alerts
// Also handles inventory history and availability checks

const inventoryService = require('../../services/product/inventory.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');


const inventoryController = {

    // ============ PUBLIC ROUTES ============
    checkAvailability: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const { quantity = 1 } = req.query;

        const result = await inventoryService.checkAvailability({
            productId,
            quantity: parseInt(quantity)
        });

        res.status(200).json(
            ApiResponse.success(result, 'Availability checked successfully')
        );
    }),

    // ============ SELLER ROUTES ============
    getSellerInventory: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { page, limit, status, search, sort_by, sort_order } = req.query;

        const result = await inventoryService.getSellerInventory({
            sellerId,
            page,
            limit,
            status,
            search,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.inventory,
                result.pagination,
                'Seller inventory fetched successfully'
            )
        );
    }),

    getProductInventory: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { productId } = req.params;

        const inventory = await inventoryService.getProductInventory({
            productId,
            sellerId
        });

        res.status(200).json(
            ApiResponse.success(inventory, 'Product inventory fetched successfully')
        );
    }),

    updateInventory: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { productId } = req.params;
        const { stock_quantity, low_stock_limit, warehouse_location, supplier_info } = req.body;

        const inventory = await inventoryService.updateInventory({
            productId,
            sellerId,
            stockQuantity: stock_quantity,
            lowStockLimit: low_stock_limit,
            warehouseLocation: warehouse_location,
            supplierInfo: supplier_info
        });

        res.status(200).json(
            ApiResponse.success(inventory, 'Inventory updated successfully')
        );
    }),

    bulkUpdateInventory: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { updates } = req.body;

        const result = await inventoryService.bulkUpdateInventory({
            sellerId,
            updates
        });

        res.status(200).json(
            ApiResponse.success(result, 'Bulk inventory update completed')
        );
    }),

    addStock: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { productId } = req.params;
        const { quantity, reason = 'Manual restock' } = req.body;

        if (!quantity || quantity <= 0) {
            throw ApiError.badRequest('Quantity must be greater than 0');
        }

        const inventory = await inventoryService.addStock({
            productId,
            sellerId,
            quantity,
            reason,
            performedBy: req.userId
        });

        res.status(200).json(
            ApiResponse.success(inventory, 'Stock added successfully')
        );
    }),

    removeStock: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { productId } = req.params;
        const { quantity, reason = 'Manual removal' } = req.body;

        if (!quantity || quantity <= 0) {
            throw ApiError.badRequest('Quantity must be greater than 0');
        }

        const inventory = await inventoryService.removeStock({
            productId,
            sellerId,
            quantity,
            reason,
            performedBy: req.userId
        });

        res.status(200).json(
            ApiResponse.success(inventory, 'Stock removed successfully')
        );
    }),

    getLowStockProducts: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { page, limit } = req.query;

        const result = await inventoryService.getLowStockProducts({
            sellerId,
            page,
            limit
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'Low stock products fetched successfully'
            )
        );
    }),

    getInventoryHistory: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { productId } = req.params;
        const { page, limit } = req.query;

        const result = await inventoryService.getInventoryHistory({
            productId,
            sellerId,
            page,
            limit
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.history,
                result.pagination,
                'Inventory history fetched successfully'
            )
        );
    }),

    // ============ ADMIN ROUTES ============
    adminGetAllInventory: asyncHandler(async (req, res) => {
        const { page, limit, seller_id, status, search, sort_by, sort_order } = req.query;

        const result = await inventoryService.adminGetAllInventory({
            page,
            limit,
            sellerId: seller_id,
            status,
            search,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.inventory,
                result.pagination,
                'All inventory fetched successfully'
            )
        );
    }),

    adminGetSellerInventory: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { page, limit, status, search } = req.query;

        const result = await inventoryService.getSellerInventory({
            sellerId,
            page,
            limit,
            status,
            search
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.inventory,
                result.pagination,
                'Seller inventory fetched successfully'
            )
        );
    }),

    adminUpdateInventory: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const { stock_quantity, low_stock_limit } = req.body;

        const inventory = await inventoryService.adminUpdateInventory({
            productId,
            stockQuantity: stock_quantity,
            lowStockLimit: low_stock_limit,
            performedBy: req.userId
        });

        res.status(200).json(
            ApiResponse.success(inventory, 'Inventory updated successfully by admin')
        );
    }),

    getInventoryStatistics: asyncHandler(async (req, res) => {
        const { seller_id } = req.query;

        const statistics = await inventoryService.getInventoryStatistics({
            sellerId: seller_id
        });

        res.status(200).json(
            ApiResponse.success(statistics, 'Inventory statistics fetched successfully')
        );
    }),

    getLowStockReport: asyncHandler(async (req, res) => {
        const { seller_id, page, limit } = req.query;

        const result = await inventoryService.getLowStockReport({
            sellerId: seller_id,
            page,
            limit
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'Low stock report fetched successfully'
            )
        );
    })
};

module.exports = inventoryController;