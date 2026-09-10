// Inventory route definitions
// Stock management, low stock alerts, inventory history
// All inventory routes require seller or admin authentication

const express = require('express');
const router = express.Router();

const inventoryController = require('../../controllers/product/inventory.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission, checkSellerAccess } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const productValidation = require('../../validations/product.validation');

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management endpoints
 */

// ============ PUBLIC ROUTES (Limited) ============

/**
 * @swagger
 * /inventory/check/{productId}:
 *   get:
 *     summary: Check product availability
 *     description: Check if a product is available in stock (Public)
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Quantity to check
 *     responses:
 *       200:
 *         description: Availability checked successfully
 *       404:
 *         description: Product not found
 */
router.get(
    '/check/:productId',
    validate(productValidation.productIdParam),
    inventoryController.checkAvailability
);

// ============ SELLER ROUTES ============
router.use(auth);

/**
 * @swagger
 * /inventory/seller:
 *   get:
 *     summary: Get seller inventory
 *     description: Get all inventory items of the authenticated seller
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, low_stock, out_of_stock]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Seller inventory fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 */
router.get(
    '/seller',
    authorize('seller'),
    inventoryController.getSellerInventory
);

/**
 * @swagger
 * /inventory/seller/{productId}:
 *   get:
 *     summary: Get product inventory (Seller)
 *     description: Get inventory details of a specific product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product inventory fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Product or inventory not found
 */
router.get(
    '/seller/:productId',
    authorize('seller'),
    checkSellerAccess(),
    validate(productValidation.productIdParam),
    inventoryController.getProductInventory
);

/**
 * @swagger
 * /inventory/{productId}:
 *   put:
 *     summary: Update inventory quantity (Seller)
 *     description: Update stock quantity of a product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock_quantity:
 *                 type: integer
 *                 minimum: 0
 *               low_stock_limit:
 *                 type: integer
 *                 minimum: 0
 *               warehouse_location:
 *                 type: object
 *               supplier_info:
 *                 type: object
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Product not found
 *       422:
 *         description: Validation error
 */
router.put(
    '/:productId',
    authorize('seller'),
    checkSellerAccess(),
    validate(productValidation.updateInventory),
    inventoryController.updateInventory
);

/**
 * @swagger
 * /inventory/bulk:
 *   post:
 *     summary: Bulk update inventory (Seller)
 *     description: Update inventory for multiple products
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - stock_quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     stock_quantity:
 *                       type: integer
 *                       minimum: 0
 *                     low_stock_limit:
 *                       type: integer
 *                       minimum: 0
 *     responses:
 *       200:
 *         description: Bulk inventory update completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       422:
 *         description: Validation error
 */
router.post(
    '/bulk',
    authorize('seller'),
    validate(productValidation.bulkUpdateInventory),
    inventoryController.bulkUpdateInventory
);

/**
 * @swagger
 * /inventory/{productId}/add-stock:
 *   post:
 *     summary: Add stock (Seller)
 *     description: Add stock to a product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Product not found
 *       422:
 *         description: Validation error
 */
router.post(
    '/:productId/add-stock',
    authorize('seller'),
    checkSellerAccess(),
    validate(productValidation.addStock),
    inventoryController.addStock
);

/**
 * @swagger
 * /inventory/{productId}/remove-stock:
 *   post:
 *     summary: Remove stock (Seller)
 *     description: Remove stock from a product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Product not found
 *       409:
 *         description: Insufficient stock
 *       422:
 *         description: Validation error
 */
router.post(
    '/:productId/remove-stock',
    authorize('seller'),
    checkSellerAccess(),
    validate(productValidation.removeStock),
    inventoryController.removeStock
);

/**
 * @swagger
 * /inventory/seller/low-stock:
 *   get:
 *     summary: Get low stock products (Seller)
 *     description: Get all low stock products of the seller
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Low stock products fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 */
router.get(
    '/seller/low-stock',
    authorize('seller'),
    inventoryController.getLowStockProducts
);

/**
 * @swagger
 * /inventory/{productId}/history:
 *   get:
 *     summary: Get inventory history (Seller)
 *     description: Get stock movement history of a product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Inventory history fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Product not found
 */
router.get(
    '/:productId/history',
    authorize('seller'),
    checkSellerAccess(),
    validate(productValidation.productIdParam),
    inventoryController.getInventoryHistory
);

// ============ ADMIN ROUTES ============

/**
 * @swagger
 * /inventory/admin/all:
 *   get:
 *     summary: Get all inventory (Admin)
 *     description: Get all inventory items across all sellers
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, low_stock, out_of_stock]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: All inventory fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/all',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_inventory'),
    inventoryController.adminGetAllInventory
);

/**
 * @swagger
 * /inventory/admin/seller/{sellerId}:
 *   get:
 *     summary: Get inventory by seller (Admin)
 *     description: Get inventory of a specific seller
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, low_stock, out_of_stock]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller inventory fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Seller not found
 */
router.get(
    '/admin/seller/:sellerId',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_inventory'),
    validate(productValidation.sellerIdParam),
    inventoryController.adminGetSellerInventory
);

/**
 * @swagger
 * /inventory/admin/{productId}:
 *   put:
 *     summary: Admin update inventory
 *     description: Update inventory by admin
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock_quantity:
 *                 type: integer
 *                 minimum: 0
 *               low_stock_limit:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Product not found
 *       422:
 *         description: Validation error
 */
router.put(
    '/admin/:productId',
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_inventory'),
    validate(productValidation.updateInventory),
    inventoryController.adminUpdateInventory
);

/**
 * @swagger
 * /inventory/admin/statistics:
 *   get:
 *     summary: Get inventory statistics (Admin)
 *     description: Get inventory statistics for admin dashboard
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/statistics',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_inventory'),
    inventoryController.getInventoryStatistics
);

/**
 * @swagger
 * /inventory/admin/low-stock-report:
 *   get:
 *     summary: Get low stock report (Admin)
 *     description: Get low stock report across all sellers
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Low stock report fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/low-stock-report',
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_reports'),
    inventoryController.getLowStockReport
);

// ============ SUB-ADMIN ROUTES ============

/**
 * @swagger
 * /inventory/sub-admin/all:
 *   get:
 *     summary: Get all inventory (Sub-Admin)
 *     description: Get all inventory items across all sellers
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, low_stock, out_of_stock]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All inventory fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.get(
    '/sub-admin/all',
    authorize('sub_admin'),
    checkPermission('view_inventory'),
    inventoryController.adminGetAllInventory
);

/**
 * @swagger
 * /inventory/sub-admin/seller/{sellerId}:
 *   get:
 *     summary: Get inventory by seller (Sub-Admin)
 *     description: Get inventory of a specific seller
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, low_stock, out_of_stock]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller inventory fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       404:
 *         description: Seller not found
 */
router.get(
    '/sub-admin/seller/:sellerId',
    authorize('sub_admin'),
    checkPermission('view_inventory'),
    validate(productValidation.sellerIdParam),
    inventoryController.adminGetSellerInventory
);

module.exports = router;