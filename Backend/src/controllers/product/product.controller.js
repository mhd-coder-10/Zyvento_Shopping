// Handles all product related API requests
// Manages product CRUD, search, filtering, and product reviews
// Also handles product images, approval, and featured products

const productService = require('../../services/product/product.service');
const reviewService = require('../../services/review/review.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service'); // ✅ ADDED


const productController = {

    // ============ PUBLIC ROUTES ============
    getAllProducts: asyncHandler(async (req, res) => {
        const {
            page, limit, search, category_id, sub_category_id,
            min_price, max_price, brand, rating, sort_by, sort_order
        } = req.query;

        const result = await productService.getAllProducts({
            page,
            limit,
            search,
            categoryId: category_id,
            subCategoryId: sub_category_id,
            minPrice: min_price,
            maxPrice: max_price,
            brand,
            rating,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'Products fetched successfully'
            )
        );
    }),

    getProductById: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const product = await productService.getProductById(productId);
        res.status(200).json(
            ApiResponse.success(product, 'Product details fetched successfully')
        );
    }),

    getProductsByCategory: asyncHandler(async (req, res) => {
        const { categoryId } = req.params;
        const { page, limit, sort_by, sort_order } = req.query;

        const result = await productService.getProductsByCategory({
            categoryId,
            page,
            limit,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'Products fetched successfully'
            )
        );
    }),

    getProductsBySubCategory: asyncHandler(async (req, res) => {
        const { subCategoryId } = req.params;
        const { page, limit, sort_by, sort_order } = req.query;

        const result = await productService.getProductsBySubCategory({
            subCategoryId,
            page,
            limit,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'Products fetched successfully'
            )
        );
    }),

    searchProducts: asyncHandler(async (req, res) => {
        const { q, page, limit, category_id, min_price, max_price, sort_by, sort_order } = req.query;

        const result = await productService.searchProducts({
            query: q,
            page,
            limit,
            categoryId: category_id,
            minPrice: min_price,
            maxPrice: max_price,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'Search results fetched successfully'
            )
        );
    }),

    getFeaturedProducts: asyncHandler(async (req, res) => {
        const { limit = 10 } = req.query;
        const products = await productService.getFeaturedProducts(limit);
        res.status(200).json(
            ApiResponse.success(products, 'Featured products fetched successfully')
        );
    }),

    getProductReviews: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const { page, limit, rating, sort_by, sort_order } = req.query;

        const result = await reviewService.getProductReviews(productId, {
            page,
            limit,
            rating,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.reviews,
                result.pagination,
                'Product reviews fetched successfully'
            )
        );
    }),

    // ============ SELLER ROUTES ============
    getSellerProducts: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const {
            page, limit, status, category, search,
            sort_by, sort_order
        } = req.query;

        const result = await productService.getSellerProducts({
            sellerId,
            page,
            limit,
            status,
            category,
            search,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'Seller products fetched successfully'
            )
        );
    }),

    createProduct: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const productData = req.body;

        const product = await productService.createProduct(sellerId, productData);

        // ✅ AUDIT LOG - Product Creation
        await auditService.logProductCreation(
            req.userId,
            product._id,
            product,
            req.ip,
            req.get('user-agent')
        );

        res.status(201).json(
            ApiResponse.created(product, 'Product created successfully')
        );
    }),

    updateProduct: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { productId } = req.params;
        const updateData = req.body;

        // Get old product data for audit
        const oldProduct = await productService.getProductById(productId);

        const product = await productService.updateProduct({
            productId,
            sellerId,
            updateData
        });

        // ✅ AUDIT LOG - Product Update
        await auditService.logProductUpdate(
            req.userId,
            product._id,
            oldProduct,
            product,
            req.ip,
            req.get('user-agent')
        );

        res.status(200).json(
            ApiResponse.success(product, 'Product updated successfully')
        );
    }),

    deleteProduct: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { productId } = req.params;

        // Get product data for audit
        const product = await productService.getProductById(productId);

        await productService.deleteProduct({ productId, sellerId });

        // ✅ AUDIT LOG - Product Delete
        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'product',
            moduleId: productId,
            description: `Product deleted: ${product.product_name}`,
            oldData: { product_name: product.product_name, sku: product.sku },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(null, 'Product deleted successfully')
        );
    }),

    updateProductStatus: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { productId } = req.params;
        const { status } = req.body;

        // Get old product data for audit
        const oldProduct = await productService.getProductById(productId);

        const product = await productService.updateProductStatus({
            productId,
            sellerId,
            status
        });

        // ✅ AUDIT LOG - Product Status Update
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'product',
            moduleId: productId,
            description: `Product status updated from ${oldProduct.status} to ${status}`,
            oldData: { status: oldProduct.status },
            newData: { status },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(product, `Product status updated to ${status}`)
        );
    }),

    uploadProductImages: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { productId } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            throw ApiError.badRequest('No files uploaded');
        }

        const result = await productService.uploadProductImages({
            productId,
            sellerId,
            files
        });

        // ✅ AUDIT LOG - Product Images Upload
        await auditService.log({
            userId: req.userId,
            action: 'upload',
            module: 'product',
            moduleId: productId,
            description: `Product images uploaded: ${files.length} images`,
            newData: { imageCount: files.length },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Product images uploaded successfully')
        );
    }),

    deleteProductImage: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { productId, publicId } = req.params;

        const result = await productService.deleteProductImage({
            productId,
            sellerId,
            publicId
        });

        // ✅ AUDIT LOG - Product Image Delete
        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'product',
            moduleId: productId,
            description: `Product image deleted: ${publicId}`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Product image deleted successfully')
        );
    }),

    reorderProductImages: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { productId } = req.params;
        const { imageOrder } = req.body;

        const product = await productService.reorderProductImages({
            productId,
            sellerId,
            imageOrder
        });

        // ✅ AUDIT LOG - Product Images Reordered
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'product',
            moduleId: productId,
            description: 'Product images reordered',
            newData: { imageOrder },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(product, 'Product images reordered successfully')
        );
    }),

    // ============ ADMIN ROUTES ============
    approveProduct: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const { admin_comment } = req.body;

        const product = await productService.approveProduct({
            productId,
            adminId: req.userId,
            adminComment: admin_comment
        });

        // ✅ AUDIT LOG - Product Approval
        await auditService.log({
            userId: req.userId,
            action: 'approve',
            module: 'product',
            moduleId: productId,
            description: `Product approved: ${product.product_name}`,
            newData: { admin_comment },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(product, 'Product approved successfully')
        );
    }),

    rejectProduct: asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const { admin_comment } = req.body;

        if (!admin_comment) {
            throw ApiError.badRequest('Rejection reason is required');
        }

        const product = await productService.rejectProduct({
            productId,
            adminId: req.userId,
            adminComment: admin_comment
        });

        // ✅ AUDIT LOG - Product Rejection
        await auditService.log({
            userId: req.userId,
            action: 'reject',
            module: 'product',
            moduleId: productId,
            description: `Product rejected: ${product.product_name}`,
            newData: { admin_comment },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(product, 'Product rejected')
        );
    }),

    toggleFeatureProduct: asyncHandler(async (req, res) => {
        const { productId } = req.params;

        const product = await productService.toggleFeatureProduct(productId);

        // ✅ AUDIT LOG - Product Feature Toggle
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'product',
            moduleId: productId,
            description: `Product ${product.is_featured ? 'featured' : 'unfeatured'}`,
            newData: { is_featured: product.is_featured },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(
                product,
                `Product ${product.is_featured ? 'featured' : 'unfeatured'} successfully`
            )
        );
    }),

    toggleBlockProduct: asyncHandler(async (req, res) => {
        const { productId } = req.params;

        const product = await productService.toggleBlockProduct(productId);

        // ✅ AUDIT LOG - Product Block Toggle
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'product',
            moduleId: productId,
            description: `Product ${product.status === 'blocked' ? 'blocked' : 'unblocked'}`,
            newData: { status: product.status },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(
                product,
                `Product ${product.status === 'blocked' ? 'blocked' : 'unblocked'} successfully`
            )
        );
    }),

    adminGetAllProducts: asyncHandler(async (req, res) => {
        const {
            page, limit, search, seller_id, category_id,
            status, approval_status, sort_by, sort_order
        } = req.query;

        const result = await productService.adminGetAllProducts({
            page,
            limit,
            search,
            sellerId: seller_id,
            categoryId: category_id,
            status,
            approvalStatus: approval_status,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'All products fetched successfully'
            )
        );
    }),

    adminDeleteProduct: asyncHandler(async (req, res) => {
        const { productId } = req.params;

        // Get product data for audit
        const product = await productService.getProductById(productId);

        await productService.adminDeleteProduct(productId);

        // ✅ AUDIT LOG - Admin Product Delete
        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'product',
            moduleId: productId,
            description: `Product deleted by admin: ${product.product_name}`,
            oldData: { product_name: product.product_name, sku: product.sku },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(null, 'Product deleted successfully by admin')
        );
    }),

    // ============ SUB-ADMIN ROUTES ============
    getProductsBySeller: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { page, limit, status, sort_by, sort_order } = req.query;

        const result = await productService.getProductsBySeller({
            sellerId,
            page,
            limit,
            status,
            sortBy: sort_by,
            sortOrder: sort_order
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'Seller products fetched successfully'
            )
        );
    })
};

module.exports = productController;