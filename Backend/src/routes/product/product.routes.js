// Product main route definitions
// Product CRUD, search, filtering, reviews, images
// Mixed public and authenticated routes

const express = require('express');
const router = express.Router();

const productController = require('../../controllers/product/product.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission, checkSellerAccess } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { uploadMultiple } = require('../../middleware/upload.middleware');
const productValidation = require('../../validations/product.validation');

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management endpoints
 */

// ============ PUBLIC ROUTES (No Auth Required) ============

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get all products
 *     description: Get paginated list of products with filters
 *     tags: [Product]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name, brand, description
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: sub_category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, price, rating, sales_count]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
router.get(
    '/',
    validate(productValidation.getProducts),
    productController.getAllProducts
);

/**
 * @swagger
 * /product/{productId}:
 *   get:
 *     summary: Get product by ID
 *     description: Get detailed information of a specific product
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details fetched successfully
 *       404:
 *         description: Product not found
 */
router.get(
    '/:productId',
    validate(productValidation.productIdParam),
    productController.getProductById
);

/**
 * @swagger
 * /product/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     description: Get all products in a specific category
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
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
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, price, rating, sales_count]
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       404:
 *         description: Category not found
 */
router.get(
    '/category/:categoryId',
    validate(productValidation.categoryIdParam),
    productController.getProductsByCategory
);

/**
 * @swagger
 * /product/sub-category/{subCategoryId}:
 *   get:
 *     summary: Get products by sub-category
 *     description: Get all products in a specific sub-category
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: subCategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sub-category ID
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
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, price, rating, sales_count]
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       404:
 *         description: Sub-category not found
 */
router.get(
    '/sub-category/:subCategoryId',
    validate(productValidation.subCategoryIdParam),
    productController.getProductsBySubCategory
);

/**
 * @swagger
 * /product/search:
 *   get:
 *     summary: Search products
 *     description: Search products by keyword with filters
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
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
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [relevance, price, rating]
 *           default: relevance
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Search results fetched successfully
 *       400:
 *         description: Search query is required
 */
router.get(
    '/search',
    validate(productValidation.searchProducts),
    productController.searchProducts
);

/**
 * @swagger
 * /product/featured:
 *   get:
 *     summary: Get featured products
 *     description: Get list of featured products
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of featured products
 *     responses:
 *       200:
 *         description: Featured products fetched successfully
 */
router.get(
    '/featured',
    productController.getFeaturedProducts
);

/**
 * @swagger
 * /product/{productId}/reviews:
 *   get:
 *     summary: Get product reviews
 *     description: Get all reviews for a specific product
 *     tags: [Product]
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
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, rating, helpful_count]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Product reviews fetched successfully
 *       404:
 *         description: Product not found
 */
router.get(
    '/:productId/reviews',
    validate(productValidation.productIdParam),
    productController.getProductReviews
);

// ============ SELLER ROUTES (Auth Required) ============

/**
 * @swagger
 * /product/seller/products:
 *   get:
 *     summary: Get seller's products
 *     description: Get all products of the authenticated seller
 *     tags: [Product]
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
 *           enum: [draft, pending, active, inactive, blocked]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
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
 *         description: Seller products fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 */
router.get(
    '/seller/products',
    auth,
    authorize('seller', 'seller_employee'),
    validate(productValidation.getProducts),
    productController.getSellerProducts
);

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create product (Seller only)
 *     description: Create a new product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_name
 *               - price
 *               - category_id
 *               - sub_category_id
 *               - sku
 *             properties:
 *               product_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *               brand:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *               category_id:
 *                 type: string
 *               sub_category_id:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               compare_at_price:
 *                 type: number
 *                 minimum: 0
 *               cost_per_item:
 *                 type: number
 *                 minimum: 0
 *               discount:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               sku:
 *                 type: string
 *               weight:
 *                 type: number
 *                 minimum: 0
 *               dimensions:
 *                 type: object
 *                 properties:
 *                   length:
 *                     type: number
 *                   width:
 *                     type: number
 *                   height:
 *                     type: number
 *                   unit:
 *                     type: string
 *                     enum: [cm, in, mm]
 *               variants:
 *                 type: array
 *               specifications:
 *                 type: object
 *               is_featured:
 *                 type: boolean
 *                 default: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               seo:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *               return_policy:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *                 default: draft
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       409:
 *         description: SKU already exists
 *       422:
 *         description: Validation error
 */
router.post(
    '/',
    auth,
    authorize('seller'),
    validate(productValidation.createProduct),
    productController.createProduct
);

/**
 * @swagger
 * /product/{productId}:
 *   put:
 *     summary: Update product (Seller only)
 *     description: Update an existing product
 *     tags: [Product]
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
 *               product_name:
 *                 type: string
 *               brand:
 *                 type: string
 *               description:
 *                 type: string
 *               category_id:
 *                 type: string
 *               sub_category_id:
 *                 type: string
 *               price:
 *                 type: number
 *               compare_at_price:
 *                 type: number
 *               cost_per_item:
 *                 type: number
 *               discount:
 *                 type: number
 *               sku:
 *                 type: string
 *               weight:
 *                 type: number
 *               dimensions:
 *                 type: object
 *               variants:
 *                 type: array
 *               specifications:
 *                 type: object
 *               is_featured:
 *                 type: boolean
 *               tags:
 *                 type: array
 *               seo:
 *                 type: object
 *               return_policy:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Product not found
 *       409:
 *         description: SKU already exists
 *       422:
 *         description: Validation error
 */
router.put(
    '/:productId',
    auth,
    authorize('seller'),
    checkSellerAccess(),
    validate(productValidation.updateProduct),
    productController.updateProduct
);

/**
 * @swagger
 * /product/{productId}:
 *   delete:
 *     summary: Delete product (Seller only)
 *     description: Delete a product
 *     tags: [Product]
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
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Product not found
 */
router.delete(
    '/:productId',
    auth,
    authorize('seller'),
    checkSellerAccess(),
    validate(productValidation.productIdParam),
    productController.deleteProduct
);

/**
 * @swagger
 * /product/{productId}/status:
 *   patch:
 *     summary: Update product status (Seller only)
 *     description: Update the status of a product
 *     tags: [Product]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *     responses:
 *       200:
 *         description: Product status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Product not found
 *       422:
 *         description: Validation error
 */
router.patch(
    '/:productId/status',
    auth,
    authorize('seller'),
    checkSellerAccess(),
    validate(productValidation.updateProductStatus),
    productController.updateProductStatus
);

/**
 * @swagger
 * /product/{productId}/images:
 *   post:
 *     summary: Upload product images (Seller only)
 *     description: Upload images for a product
 *     tags: [Product]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product images uploaded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Product not found
 *       413:
 *         description: File too large
 */
router.post(
    '/:productId/images',
    auth,
    authorize('seller'),
    checkSellerAccess(),
    uploadMultiple('images', 10),
    productController.uploadProductImages
);

/**
 * @swagger
 * /product/{productId}/images/{publicId}:
 *   delete:
 *     summary: Delete product image (Seller only)
 *     description: Delete a specific image from a product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID
 *     responses:
 *       200:
 *         description: Product image deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller role required
 *       404:
 *         description: Product or image not found
 */
router.delete(
    '/:productId/images/:publicId',
    auth,
    authorize('seller'),
    checkSellerAccess(),
    productController.deleteProductImage
);

/**
 * @swagger
 * /product/{productId}/images/reorder:
 *   put:
 *     summary: Reorder product images (Seller only)
 *     description: Reorder the images of a product
 *     tags: [Product]
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
 *               - imageOrder
 *             properties:
 *               imageOrder:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs in new order
 *     responses:
 *       200:
 *         description: Product images reordered successfully
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
    '/:productId/images/reorder',
    auth,
    authorize('seller'),
    checkSellerAccess(),
    validate(productValidation.reorderImages),
    productController.reorderProductImages
);

// ============ ADMIN ROUTES ============

/**
 * @swagger
 * /product/{productId}/approve:
 *   put:
 *     summary: Approve product (Admin only)
 *     description: Approve a product for listing
 *     tags: [Product]
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admin_comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Product not found
 */
router.put(
    '/:productId/approve',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('approve_products'),
    validate(productValidation.approveProduct),
    productController.approveProduct
);

/**
 * @swagger
 * /product/{productId}/reject:
 *   put:
 *     summary: Reject product (Admin only)
 *     description: Reject a product with reason
 *     tags: [Product]
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
 *               - admin_comment
 *             properties:
 *               admin_comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product rejected successfully
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
    '/:productId/reject',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('approve_products'),
    validate(productValidation.rejectProduct),
    productController.rejectProduct
);

/**
 * @swagger
 * /product/{productId}/feature:
 *   patch:
 *     summary: Toggle product featured (Admin only)
 *     description: Feature or unfeature a product
 *     tags: [Product]
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
 *         description: Product featured status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Product not found
 */
router.patch(
    '/:productId/feature',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_products'),
    validate(productValidation.productIdParam),
    productController.toggleFeatureProduct
);

/**
 * @swagger
 * /product/{productId}/block:
 *   patch:
 *     summary: Toggle product block (Admin only)
 *     description: Block or unblock a product
 *     tags: [Product]
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
 *         description: Product block status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Product not found
 */
router.patch(
    '/:productId/block',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('manage_products'),
    validate(productValidation.productIdParam),
    productController.toggleBlockProduct
);

/**
 * @swagger
 * /product/admin/all:
 *   get:
 *     summary: Get all products (Admin only)
 *     description: Get all products with filters for admin
 *     tags: [Product]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending, active, inactive, blocked]
 *       - in: query
 *         name: approval_status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
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
 *         description: All products fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/admin/all',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('view_products'),
    validate(productValidation.getProducts),
    productController.adminGetAllProducts
);

/**
 * @swagger
 * /product/admin/{productId}:
 *   delete:
 *     summary: Admin delete product
 *     description: Delete a product by admin
 *     tags: [Product]
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
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Product not found
 */
router.delete(
    '/admin/:productId',
    auth,
    authorize('super_admin', 'sub_admin'),
    checkPermission('delete_products'),
    validate(productValidation.productIdParam),
    productController.adminDeleteProduct
);

// ============ SUB-ADMIN ROUTES ============

/**
 * @swagger
 * /product/sub-admin/seller/{sellerId}:
 *   get:
 *     summary: Get products by seller (Sub-Admin)
 *     description: Get all products of a specific seller
 *     tags: [Product]
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
 *           enum: [draft, pending, active, inactive, blocked]
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
 *         description: Seller products fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 *       404:
 *         description: Seller not found
 */
router.get(
    '/sub-admin/seller/:sellerId',
    auth,
    authorize('sub_admin'),
    checkPermission('view_products'),
    validate(productValidation.sellerIdParam),
    productController.getProductsBySeller
);

module.exports = router;