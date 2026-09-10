// Category route definitions
// Category CRUD, sub-categories, images, reordering
// Mixed public and admin routes

const express = require('express');
const router = express.Router();

const categoryController = require('../../controllers/product/category.controller');
const auth = require('../../middleware/auth.middleware');
const { authorize, checkPermission } = require('../../middleware/authorization.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { uploadSingle } = require('../../middleware/upload.middleware');
const productValidation = require('../../validations/product.validation');

/**
 * @swagger
 * 
 * tags:
 *   name: Category
 *   description: Category management endpoints
 */

// ============ PUBLIC ROUTES ============

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories
 *     description: Get all categories with optional filters
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive categories
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 */
router.get(
    '/',
    categoryController.getAllCategories
);

/**
 * @swagger
 * /category/active:
 *   get:
 *     summary: Get active categories
 *     description: Get all active categories for frontend display
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Active categories fetched successfully
 */
router.get(
    '/active',
    categoryController.getActiveCategories
);

/**
 * @swagger
 * /category/{categoryId}:
 *   get:
 *     summary: Get category by ID
 *     description: Get detailed information of a specific category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details fetched successfully
 *       404:
 *         description: Category not found
 */
router.get(
    '/:categoryId',
    validate(productValidation.categoryIdParam),
    categoryController.getCategoryById
);

/**
 * @swagger
 * /category/{categoryId}/sub-categories:
 *   get:
 *     summary: Get sub-categories by category
 *     description: Get all sub-categories of a specific category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Sub-categories fetched successfully
 *       404:
 *         description: Category not found
 */
router.get(
    '/:categoryId/sub-categories',
    validate(productValidation.categoryIdParam),
    categoryController.getSubCategoriesByCategory
);



// ============ ADMIN ROUTES ============
router.use(auth);
router.use(authorize('super_admin', 'sub_admin'));

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create category (Admin only)
 *     description: Create a new category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *             properties:
 *               category_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               parent_category_id:
 *                 type: string
 *               display_order:
 *                 type: integer
 *                 default: 0
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       409:
 *         description: Category already exists
 *       422:
 *         description: Validation error
 */
router.post(
    '/',
    checkPermission('create_category'),
    validate(productValidation.createCategory),
    categoryController.createCategory
);

/**
 * @swagger
 * /category/{categoryId}:
 *   put:
 *     summary: Update category (Admin only)
 *     description: Update an existing category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               parent_category_id:
 *                 type: string
 *               display_order:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 *       422:
 *         description: Validation error
 */
router.put(
    '/:categoryId',
    checkPermission('update_category'),
    validate(productValidation.updateCategory),
    categoryController.updateCategory
);

/**
 * @swagger
 * /category/{categoryId}:
 *   delete:
 *     summary: Delete category (Admin only)
 *     description: Delete a category (only if no products/sub-categories)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category has products or sub-categories
 */
router.delete(
    '/:categoryId',
    checkPermission('delete_category'),
    validate(productValidation.categoryIdParam),
    categoryController.deleteCategory
);

/**
 * @swagger
 * /category/{categoryId}/status:
 *   patch:
 *     summary: Toggle category status (Admin only)
 *     description: Activate or deactivate a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Category not found
 */
router.patch(
    '/:categoryId/status',
    checkPermission('update_category'),
    validate(productValidation.categoryIdParam),
    categoryController.toggleCategoryStatus
);

/**
 * @swagger
 * /category/{categoryId}/image:
 *   post:
 *     summary: Upload category image (Admin only)
 *     description: Upload an image for a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category image uploaded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Category not found
 *       413:
 *         description: File too large
 */
router.post(
    '/:categoryId/image',
    checkPermission('update_category'),
    uploadSingle('image'),
    categoryController.uploadCategoryImage
);

/**
 * @swagger
 * /category/{categoryId}/image:
 *   delete:
 *     summary: Delete category image (Admin only)
 *     description: Delete the image of a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category image deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Category not found
 *       400:
 *         description: No image to delete
 */
router.delete(
    '/:categoryId/image',
    checkPermission('update_category'),
    validate(productValidation.categoryIdParam),
    categoryController.deleteCategoryImage
);

/**
 * @swagger
 * /category/reorder:
 *   put:
 *     summary: Reorder categories (Admin only)
 *     description: Update display order of multiple categories
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - category_id
 *                 - order
 *               properties:
 *                 category_id:
 *                   type: string
 *                 order:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Categories reordered successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Category not found
 *       422:
 *         description: Validation error
 */
router.put(
    '/reorder',
    checkPermission('update_category'),
    validate(productValidation.reorderCategories),
    categoryController.reorderCategories
);

// ============ SUB-ADMIN ROUTES ============

/**
 * @swagger
 * /category/sub-admin/all:
 *   get:
 *     summary: Get all categories (Sub-Admin)
 *     description: Get all categories with optional filters
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive categories
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sub-Admin role required
 */
router.get(
    '/sub-admin/all',
    auth,
    authorize('sub_admin'),
    checkPermission('view_categories'),
    categoryController.getAllCategories
);

module.exports = router;