// Handles all category related API requests
// Manages category CRUD, sub-categories, and category images
// Also handles category status and reordering

const categoryService = require('../../services/product/category.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');


const categoryController = {

    // ============ PUBLIC ROUTES ============
    getAllCategories: asyncHandler(async (req, res) => {
        const { status, include_inactive = false } = req.query;
        const categories = await categoryService.getAllCategories({
            status,
            includeInactive: include_inactive === 'true'
        });

        res.status(200).json(
            ApiResponse.success(categories, 'Categories fetched successfully')
        );
    }),

    getCategoryById: asyncHandler(async (req, res) => {
        const { categoryId } = req.params;
        const category = await categoryService.getCategoryById(categoryId);

        res.status(200).json(
            ApiResponse.success(category, 'Category details fetched successfully')
        );
    }),

    getSubCategoriesByCategory: asyncHandler(async (req, res) => {
        const { categoryId } = req.params;
        const { status } = req.query;

        const subCategories = await categoryService.getSubCategoriesByCategory({
            categoryId,
            status
        });

        res.status(200).json(
            ApiResponse.success(subCategories, 'Sub-categories fetched successfully')
        );
    }),

    getActiveCategories: asyncHandler(async (req, res) => {
        const categories = await categoryService.getActiveCategories();

        res.status(200).json(
            ApiResponse.success(categories, 'Active categories fetched successfully')
        );
    }),

    // ============ ADMIN ROUTES ============
    createCategory: asyncHandler(async (req, res) => {
        const categoryData = req.body;
        const category = await categoryService.createCategory(categoryData, req.userId);

        res.status(201).json(
            ApiResponse.created(category, 'Category created successfully')
        );
    }),

    updateCategory: asyncHandler(async (req, res) => {
        const { categoryId } = req.params;
        const updateData = req.body;

        const category = await categoryService.updateCategory({
            categoryId,
            updateData,
            userId: req.userId
        });

        res.status(200).json(
            ApiResponse.success(category, 'Category updated successfully')
        );
    }),

    deleteCategory: asyncHandler(async (req, res) => {
        const { categoryId } = req.params;

        await categoryService.deleteCategory(categoryId);

        res.status(200).json(
            ApiResponse.success(null, 'Category deleted successfully')
        );
    }),

    toggleCategoryStatus: asyncHandler(async (req, res) => {
        const { categoryId } = req.params;

        const category = await categoryService.toggleCategoryStatus(categoryId);

        res.status(200).json(
            ApiResponse.success(
                category,
                `Category ${category.status === 'active' ? 'activated' : 'deactivated'} successfully`
            )
        );
    }),

    uploadCategoryImage: asyncHandler(async (req, res) => {
        const { categoryId } = req.params;
        const file = req.file;

        if (!file) {
            throw ApiError.badRequest('No file uploaded');
        }

        const result = await categoryService.uploadCategoryImage({
            categoryId,
            file
        });

        res.status(200).json(
            ApiResponse.success(result, 'Category image uploaded successfully')
        );
    }),

    deleteCategoryImage: asyncHandler(async (req, res) => {
        const { categoryId } = req.params;

        const result = await categoryService.deleteCategoryImage(categoryId);

        res.status(200).json(
            ApiResponse.success(result, 'Category image deleted successfully')
        );
    }),

    reorderCategories: asyncHandler(async (req, res) => {
        const { categoryOrder } = req.body;

        const categories = await categoryService.reorderCategories(categoryOrder);

        res.status(200).json(
            ApiResponse.success(categories, 'Categories reordered successfully')
        );
    })
};

module.exports = categoryController;