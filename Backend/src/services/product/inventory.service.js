// Handles all inventory related business logic
// Manages stock updates, bulk inventory, low stock alerts
// Also handles inventory history and availability checks

const Inventory = require('../../models/inventory.model');
const Product = require('../../models/product.model');
const Seller = require('../../models/seller.model');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');

class InventoryService {

    // ============ PUBLIC ROUTES ============
    async checkAvailability({ productId, quantity = 1 }) {
        const product = await Product.findById(productId);
        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        const inventory = await Inventory.findOne({ product_id: productId });

        if (!inventory) {
            return {
                available: false,
                message: 'Inventory not found for this product'
            };
        }

        const available = inventory.available_quantity >= quantity;

        return {
            available,
            available_quantity: inventory.available_quantity,
            stock_status: inventory.stock_status,
            message: available ? 'Product available' : 'Product not available in requested quantity'
        };
    }

    // ============ SELLER ROUTES ============
    async getSellerInventory({
        sellerId,
        page = 1,
        limit = 10,
        status = null,
        search = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const query = { seller_id: sellerId };

        if (status) {
            query.stock_status = status;
        }

        let productIds = [];
        if (search) {
            const products = await Product.find({
                seller_id: sellerId,
                $or: [
                    { product_name: { $regex: search, $options: 'i' } },
                    { sku: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            productIds = products.map(p => p._id);
            query.product_id = { $in: productIds };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [inventory, total] = await Promise.all([
            Inventory.find(query)
                .populate('product_id', 'product_name sku price images final_price')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Inventory.countDocuments(query)
        ]);

        return {
            inventory,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getProductInventory({ productId, sellerId }) {
        const product = await Product.findOne({
            _id: productId,
            seller_id: sellerId
        });

        if (!product) {
            throw ApiError.notFound('Product not found or unauthorized');
        }

        const inventory = await Inventory.findOne({ product_id: productId });

        if (!inventory) {
            throw ApiError.notFound('Inventory not found for this product');
        }

        return inventory;
    }

    async updateInventory({
        productId,
        sellerId,
        stockQuantity,
        lowStockLimit,
        warehouseLocation,
        supplierInfo
    }) {
        const product = await Product.findOne({
            _id: productId,
            seller_id: sellerId
        });

        if (!product) {
            throw ApiError.notFound('Product not found or unauthorized');
        }

        let inventory = await Inventory.findOne({ product_id: productId });

        if (!inventory) {
            // Create new inventory if not exists
            inventory = new Inventory({
                product_id: productId,
                seller_id: sellerId,
                stock_quantity: stockQuantity || 0,
                sold_quantity: 0,
                reserved_quantity: 0,
                available_quantity: stockQuantity || 0,
                low_stock_limit: lowStockLimit || 5,
                stock_status: (stockQuantity || 0) > 10 ? 'available' :
                            (stockQuantity || 0) > 0 ? 'low_stock' : 'out_of_stock',
                warehouse_location: warehouseLocation || {},
                supplier_info: supplierInfo || {}
            });

            await inventory.save();

            // Add initial stock movement
            inventory.stock_movements.push({
                type: 'add',
                quantity: stockQuantity || 0,
                reason: 'Initial inventory setup',
                performed_by: sellerId,
                timestamp: new Date()
            });
            await inventory.save();

        } else {
            // Update existing inventory
            const oldStock = inventory.stock_quantity;

            if (stockQuantity !== undefined) {
                inventory.stock_quantity = stockQuantity;
                inventory.available_quantity = stockQuantity - inventory.reserved_quantity;
                inventory.stock_status = stockQuantity > 10 ? 'available' :
                                        stockQuantity > 0 ? 'low_stock' : 'out_of_stock';

                // Add stock movement
                if (stockQuantity !== oldStock) {
                    const difference = stockQuantity - oldStock;
                    inventory.stock_movements.push({
                        type: difference > 0 ? 'add' : 'remove',
                        quantity: Math.abs(difference),
                        reason: 'Inventory updated',
                        performed_by: sellerId,
                        timestamp: new Date()
                    });
                }
            }

            if (lowStockLimit !== undefined) {
                inventory.low_stock_limit = lowStockLimit;
            }

            if (warehouseLocation) {
                inventory.warehouse_location = warehouseLocation;
            }

            if (supplierInfo) {
                inventory.supplier_info = supplierInfo;
            }

            inventory.last_stock_update = new Date();
            await inventory.save();
        }

        logger.info(`Inventory updated for product: ${productId}`, { sellerId });

        return inventory;
    }

    async bulkUpdateInventory({ sellerId, updates }) {
        const results = [];
        const errors = [];

        for (const update of updates) {
            try {
                const inventory = await this.updateInventory({
                    productId: update.product_id,
                    sellerId,
                    stockQuantity: update.stock_quantity,
                    lowStockLimit: update.low_stock_limit
                });
                results.push({
                    product_id: update.product_id,
                    status: 'success',
                    inventory
                });
            } catch (error) {
                errors.push({
                    product_id: update.product_id,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return { success: results, errors };
    }

    async addStock({ productId, sellerId, quantity, reason, performedBy }) {
        const product = await Product.findOne({
            _id: productId,
            seller_id: sellerId
        });

        if (!product) {
            throw ApiError.notFound('Product not found or unauthorized');
        }

        const inventory = await Inventory.findOne({ product_id: productId });

        if (!inventory) {
            throw ApiError.notFound('Inventory not found for this product');
        }

        const oldStock = inventory.stock_quantity;
        inventory.stock_quantity += quantity;
        inventory.available_quantity += quantity;
        inventory.stock_status = inventory.stock_quantity > 10 ? 'available' :
                                inventory.stock_quantity > 0 ? 'low_stock' : 'out_of_stock';
        inventory.last_restocked_at = new Date();

        inventory.stock_movements.push({
            type: 'add',
            quantity: quantity,
            reason: reason || 'Stock added',
            performed_by: performedBy,
            timestamp: new Date()
        });

        await inventory.save();

        logger.info(`Stock added: ${quantity} for product ${productId}`, { sellerId, performedBy });

        return inventory;
    }

    async removeStock({ productId, sellerId, quantity, reason, performedBy }) {
        const product = await Product.findOne({
            _id: productId,
            seller_id: sellerId
        });

        if (!product) {
            throw ApiError.notFound('Product not found or unauthorized');
        }

        const inventory = await Inventory.findOne({ product_id: productId });

        if (!inventory) {
            throw ApiError.notFound('Inventory not found for this product');
        }

        if (inventory.stock_quantity < quantity) {
            throw ApiError.badRequest('Insufficient stock available');
        }

        inventory.stock_quantity -= quantity;
        inventory.available_quantity -= quantity;
        inventory.stock_status = inventory.stock_quantity > 10 ? 'available' :
                                inventory.stock_quantity > 0 ? 'low_stock' : 'out_of_stock';

        inventory.stock_movements.push({
            type: 'remove',
            quantity: quantity,
            reason: reason || 'Stock removed',
            performed_by: performedBy,
            timestamp: new Date()
        });

        await inventory.save();

        logger.info(`Stock removed: ${quantity} for product ${productId}`, { sellerId, performedBy });

        return inventory;
    }

    async getLowStockProducts({ sellerId, page = 1, limit = 10 }) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const inventory = await Inventory.find({
            seller_id: sellerId,
            $expr: {
                $lte: ['$stock_quantity', '$low_stock_limit']
            }
        })
            .populate('product_id', 'product_name sku price images final_price status')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Inventory.countDocuments({
            seller_id: sellerId,
            $expr: {
                $lte: ['$stock_quantity', '$low_stock_limit']
            }
        });

        return {
            products: inventory,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getInventoryHistory({ productId, sellerId, page = 1, limit = 10 }) {
        const product = await Product.findOne({
            _id: productId,
            seller_id: sellerId
        });

        if (!product) {
            throw ApiError.notFound('Product not found or unauthorized');
        }

        const inventory = await Inventory.findOne({ product_id: productId });

        if (!inventory) {
            throw ApiError.notFound('Inventory not found for this product');
        }

        const movements = inventory.stock_movements || [];
        const total = movements.length;

        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginatedMovements = movements.slice(start, end).reverse();

        return {
            history: paginatedMovements,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ ADMIN ROUTES ============
    async adminGetAllInventory({
        page = 1,
        limit = 10,
        sellerId = null,
        status = null,
        search = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const query = {};

        if (sellerId) {
            query.seller_id = sellerId;
        }

        if (status) {
            query.stock_status = status;
        }

        let productIds = [];
        if (search) {
            const products = await Product.find({
                $or: [
                    { product_name: { $regex: search, $options: 'i' } },
                    { sku: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            productIds = products.map(p => p._id);
            query.product_id = { $in: productIds };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [inventory, total] = await Promise.all([
            Inventory.find(query)
                .populate('product_id', 'product_name sku price images final_price')
                .populate('seller_id', 'business_name')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Inventory.countDocuments(query)
        ]);

        return {
            inventory,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async adminUpdateInventory({
        productId,
        stockQuantity,
        lowStockLimit,
        performedBy
    }) {
        const product = await Product.findById(productId);
        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        let inventory = await Inventory.findOne({ product_id: productId });

        if (!inventory) {
            inventory = new Inventory({
                product_id: productId,
                seller_id: product.seller_id,
                stock_quantity: stockQuantity || 0,
                sold_quantity: 0,
                reserved_quantity: 0,
                available_quantity: stockQuantity || 0,
                low_stock_limit: lowStockLimit || 5,
                stock_status: (stockQuantity || 0) > 10 ? 'available' :
                            (stockQuantity || 0) > 0 ? 'low_stock' : 'out_of_stock'
            });

            await inventory.save();

            inventory.stock_movements.push({
                type: 'add',
                quantity: stockQuantity || 0,
                reason: 'Admin initial inventory setup',
                performed_by: performedBy,
                timestamp: new Date()
            });
            await inventory.save();

        } else {
            const oldStock = inventory.stock_quantity;

            if (stockQuantity !== undefined) {
                inventory.stock_quantity = stockQuantity;
                inventory.available_quantity = stockQuantity - inventory.reserved_quantity;
                inventory.stock_status = stockQuantity > 10 ? 'available' :
                                        stockQuantity > 0 ? 'low_stock' : 'out_of_stock';

                if (stockQuantity !== oldStock) {
                    const difference = stockQuantity - oldStock;
                    inventory.stock_movements.push({
                        type: difference > 0 ? 'add' : 'remove',
                        quantity: Math.abs(difference),
                        reason: 'Admin inventory update',
                        performed_by: performedBy,
                        timestamp: new Date()
                    });
                }
            }

            if (lowStockLimit !== undefined) {
                inventory.low_stock_limit = lowStockLimit;
            }

            inventory.last_stock_update = new Date();
            await inventory.save();
        }

        logger.info(`Inventory updated by admin for product: ${productId}`);

        return inventory;
    }

    async getInventoryStatistics({ sellerId = null }) {
        const query = {};
        if (sellerId) {
            query.seller_id = sellerId;
        }

        const [
            totalProducts,
            totalStock,
            lowStockCount,
            outOfStockCount,
            averageStock
        ] = await Promise.all([
            Inventory.countDocuments(query),
            Inventory.aggregate([
                { $match: query },
                { $group: { _id: null, total: { $sum: '$stock_quantity' } } }
            ]),
            Inventory.countDocuments({
                ...query,
                $expr: {
                    $and: [
                        { $lte: ['$stock_quantity', '$low_stock_limit'] },
                        { $gt: ['$stock_quantity', 0] }
                    ]
                }
            }),
            Inventory.countDocuments({
                ...query,
                stock_quantity: 0
            }),
            Inventory.aggregate([
                { $match: query },
                { $group: { _id: null, avg: { $avg: '$stock_quantity' } } }
            ])
        ]);

        return {
            totalProducts,
            totalStock: totalStock[0]?.total || 0,
            lowStockCount,
            outOfStockCount,
            averageStock: Math.round(averageStock[0]?.avg || 0)
        };
    }

    async getLowStockReport({ sellerId = null, page = 1, limit = 10 }) {
        const query = {
            $expr: {
                $and: [
                    { $lte: ['$stock_quantity', '$low_stock_limit'] },
                    { $gt: ['$stock_quantity', 0] }
                ]
            }
        };

        if (sellerId) {
            query.seller_id = sellerId;
        }

        const [products, total] = await Promise.all([
            Inventory.find(query)
                .populate('product_id', 'product_name sku price images final_price')
                .populate('seller_id', 'business_name')
                .sort({ stock_quantity: 1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Inventory.countDocuments(query)
        ]);

        return {
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = new InventoryService();