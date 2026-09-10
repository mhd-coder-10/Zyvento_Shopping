// Handles all category related business logic
// Manages category CRUD, sub-categories, and category images
// Also handles category status and reordering

const Category = require('../../models/category.model');
const SubCategory = require('../../models/sub_category.model');
const Product = require('../../models/product.model');
const ApiError = require('../../utils/apiError');
const cloudinaryHelper = require('../../utils/cloudinary.helper');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');

class CategoryService {

    // ============ PUBLIC ROUTES ============
    async getAllCategories({ status = null, includeInactive = false }) {
        const query = {};
        if (status) {
            query.status = status;
        } else if (!includeInactive) {
            query.status = 'active';
        }

        const categories = await Category.find(query)
            .sort({ display_order: 1, category_name: 1 });

        // Get sub-category count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const subCategoryCount = await SubCategory.countDocuments({
                    category_id: category._id,
                    status: 'active'
                });

                const productCount = await Product.countDocuments({
                    category_id: category._id,
                    status: 'active',
                    approval_status: 'approved'
                });

                return {
                    ...category.toObject(),
                    subCategoryCount,
                    productCount
                };
            })
        );

        return categoriesWithCount;
    }

    async getCategoryById(categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw ApiError.notFound('Category not found');
        }

        // Get sub-categories
        const subCategories = await SubCategory.find({
            category_id: categoryId,
            status: 'active'
        }).sort({ display_order: 1, sub_category_name: 1 });

        // Get product count
        const productCount = await Product.countDocuments({
            category_id: categoryId,
            status: 'active',
            approval_status: 'approved'
        });

        return {
            ...category.toObject(),
            subCategories,
            productCount
        };
    }

    async getSubCategoriesByCategory({ categoryId, status = 'active' }) {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw ApiError.notFound('Category not found');
        }

        const query = { category_id: categoryId };
        if (status) {
            query.status = status;
        }

        const subCategories = await SubCategory.find(query)
            .sort({ display_order: 1, sub_category_name: 1 });

        return subCategories;
    }

    async getActiveCategories() {
        const categories = await Category.find({ status: 'active' })
            .sort({ display_order: 1, category_name: 1 });

        return categories;
    }

    // ============ ADMIN ROUTES ============
    async createCategory(categoryData, userId) {
        const { category_name, description, parent_category_id, display_order, status } = categoryData;

        // Check if category already exists
        const existingCategory = await Category.findOne({ category_name });
        if (existingCategory) {
            throw ApiError.conflict('Category with this name already exists');
        }

        // If parent category provided, check if exists
        if (parent_category_id) {
            const parentCategory = await Category.findById(parent_category_id);
            if (!parentCategory) {
                throw ApiError.notFound('Parent category not found');
            }
        }

        const category = new Category({
            category_name,
            description,
            parent_category_id: parent_category_id || null,
            display_order: display_order || 0,
            status: status || 'active',
            created_by: userId,
            updated_by: userId
        });

        await category.save();

        logger.info(`Category created: ${category_name}`, { categoryId: category._id, userId });

        return category;
    }

    async updateCategory({ categoryId, updateData, userId }) {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw ApiError.notFound('Category not found');
        }

        const allowedFields = ['category_name', 'description', 'display_order', 'status'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        // Check if category name is being changed and if it already exists
        if (updateData.category_name) {
            const existingCategory = await Category.findOne({
                category_name: updateData.category_name,
                _id: { $ne: categoryId }
            });
            if (existingCategory) {
                throw ApiError.conflict('Category with this name already exists');
            }
        }

        filteredData.updated_by = userId;
        Object.assign(category, filteredData);
        await category.save();

        logger.info(`Category updated: ${category.category_name}`, { categoryId, userId });

        return category;
    }

    async deleteCategory(categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw ApiError.notFound('Category not found');
        }

        // Check if any products are using this category
        const productCount = await Product.countDocuments({
            category_id: categoryId,
            status: { $ne: 'deleted' }
        });

        if (productCount > 0) {
            throw ApiError.badRequest('Cannot delete category. It has products associated with it.');
        }

        // Check if any sub-categories exist
        const subCategoryCount = await SubCategory.countDocuments({ category_id: categoryId });
        if (subCategoryCount > 0) {
            throw ApiError.badRequest('Cannot delete category. It has sub-categories associated with it.');
        }

        // Delete category image from cloudinary
        if (category.category_image) {
            try {
                const publicId = category.category_image.split('/').pop().split('.')[0];
                await cloudinaryHelper.deleteFile(publicId);
            } catch (error) {
                logger.error('Error deleting category image:', error);
            }
        }

        await category.deleteOne();

        logger.info(`Category deleted: ${category.category_name}`, { categoryId });

        return { message: 'Category deleted successfully' };
    }

    async toggleCategoryStatus(categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw ApiError.notFound('Category not found');
        }

        category.status = category.status === 'active' ? 'inactive' : 'active';
        await category.save();

        // Also update all sub-categories status
        await SubCategory.updateMany(
            { category_id: categoryId },
            { status: category.status }
        );

        return category;
    }

    async uploadCategoryImage({ categoryId, file }) {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw ApiError.notFound('Category not found');
        }

        // Delete old image if exists
        if (category.category_image) {
            try {
                const oldPublicId = category.category_image.split('/').pop().split('.')[0];
                await cloudinaryHelper.deleteFile(oldPublicId);
            } catch (error) {
                logger.error('Error deleting old category image:', error);
            }
        }

        // Upload new image
        const result = await cloudinaryHelper.uploadFile(file.path, {
            folder: `categories/${categoryId}`,
            width: 500,
            height: 500,
            crop: 'fill',
            quality: 'auto',
            format: 'webp'
        });

        category.category_image = result.url;
        await category.save();

        return {
            url: result.url,
            public_id: result.public_id
        };
    }

    async deleteCategoryImage(categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw ApiError.notFound('Category not found');
        }

        if (!category.category_image) {
            throw ApiError.badRequest('Category has no image to delete');
        }

        // Delete from cloudinary
        try {
            const publicId = category.category_image.split('/').pop().split('.')[0];
            await cloudinaryHelper.deleteFile(publicId);
        } catch (error) {
            logger.error('Error deleting category image:', error);
        }

        category.category_image = null;
        await category.save();

        return { message: 'Category image deleted successfully' };
    }

    async reorderCategories(categoryOrder) {
        const categories = [];

        for (const item of categoryOrder) {
            const category = await Category.findById(item.category_id);
            if (!category) {
                throw ApiError.notFound(`Category not found: ${item.category_id}`);
            }

            category.display_order = item.order;
            await category.save();
            categories.push(category);
        }

        return categories;
    }
}

module.exports = new CategoryService();