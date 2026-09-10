// Validation schemas for product routes
// Validates create, update, review, category, inventory
// Used in product.routes.js for request validation

const Joi = require('joi');

const productValidation = {
    // ============ CREATE PRODUCT ============
    createProduct: Joi.object({
        product_name: Joi.string()
            .min(2)
            .max(200)
            .required()
            .messages({
                'string.empty': 'Product name is required',
                'string.min': 'Product name must be at least 2 characters',
                'string.max': 'Product name cannot exceed 200 characters',
            }),

        category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid category ID',
                'string.empty': 'Category is required',
            }),

        sub_category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid sub-category ID',
                'string.empty': 'Sub-category is required',
            }),

        brand: Joi.string()
            .max(100)
            .optional(),

        description: Joi.string()
            .max(5000)
            .optional(),

        price: Joi.number()
            .min(0)
            .required()
            .messages({
                'number.min': 'Price cannot be negative',
                'any.required': 'Price is required',
            }),

        compare_at_price: Joi.number()
            .min(0)
            .optional(),

        cost_per_item: Joi.number()
            .min(0)
            .optional(),

        discount: Joi.number()
            .min(0)
            .max(100)
            .default(0),

        sku: Joi.string()
            .required()
            .messages({
                'string.empty': 'SKU is required',
            }),

        weight: Joi.number()
            .min(0)
            .default(0),

        dimensions: Joi.object({
            length: Joi.number().min(0).default(0),
            width: Joi.number().min(0).default(0),
            height: Joi.number().min(0).default(0),
            unit: Joi.string()
                .valid('cm', 'in', 'mm')
                .default('cm'),
        }).optional(),

        variants: Joi.array()
            .items(
                Joi.object({
                    name: Joi.string().required(),
                    options: Joi.array()
                        .items(
                            Joi.object({
                                value: Joi.string().required(),
                                price: Joi.number().min(0).default(0),
                                quantity: Joi.number().integer().min(0).default(0),
                                sku: Joi.string().optional(),
                            })
                        )
                        .min(1)
                        .required(),
                })
            )
            .optional(),

        specifications: Joi.object()
            .optional(),

        is_featured: Joi.boolean()
            .default(false),

        tags: Joi.array()
            .items(Joi.string())
            .optional(),

        seo: Joi.object({
            title: Joi.string().max(60).optional(),
            description: Joi.string().max(160).optional(),
            keywords: Joi.array().items(Joi.string()).optional(),
        }).optional(),

        return_policy: Joi.string()
            .optional(),

        status: Joi.string()
            .valid('active', 'inactive', 'draft')
            .default('draft'),
    }),

    // ============ UPDATE PRODUCT ============
    updateProduct: Joi.object({
        product_name: Joi.string()
            .min(2)
            .max(200)
            .optional(),

        category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        sub_category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        brand: Joi.string()
            .max(100)
            .optional(),

        description: Joi.string()
            .max(5000)
            .optional(),

        price: Joi.number()
            .min(0)
            .optional(),

        compare_at_price: Joi.number()
            .min(0)
            .optional(),

        cost_per_item: Joi.number()
            .min(0)
            .optional(),

        discount: Joi.number()
            .min(0)
            .max(100)
            .optional(),

        sku: Joi.string()
            .optional(),

        weight: Joi.number()
            .min(0)
            .optional(),

        dimensions: Joi.object({
            length: Joi.number().min(0).default(0),
            width: Joi.number().min(0).default(0),
            height: Joi.number().min(0).default(0),
            unit: Joi.string()
                .valid('cm', 'in', 'mm')
                .default('cm'),
        }).optional(),

        variants: Joi.array()
            .items(
                Joi.object({
                    name: Joi.string().required(),
                    options: Joi.array()
                        .items(
                            Joi.object({
                                value: Joi.string().required(),
                                price: Joi.number().min(0).default(0),
                                quantity: Joi.number().integer().min(0).default(0),
                                sku: Joi.string().optional(),
                            })
                        )
                        .min(1)
                        .required(),
                })
            )
            .optional(),

        specifications: Joi.object()
            .optional(),

        is_featured: Joi.boolean()
            .optional(),

        tags: Joi.array()
            .items(Joi.string())
            .optional(),

        seo: Joi.object({
            title: Joi.string().max(60).optional(),
            description: Joi.string().max(160).optional(),
            keywords: Joi.array().items(Joi.string()).optional(),
        }).optional(),

        return_policy: Joi.string()
            .optional(),

        status: Joi.string()
            .valid('active', 'inactive', 'draft', 'blocked')
            .optional(),
    }),

    // ============ GET PRODUCTS (With Filters) ============
    getProducts: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(10),

        search: Joi.string()
            .optional(),

        category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        sub_category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        seller_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        min_price: Joi.number()
            .min(0)
            .optional(),

        max_price: Joi.number()
            .min(0)
            .optional(),

        brand: Joi.string()
            .optional(),

        status: Joi.string()
            .valid('active', 'inactive', 'draft', 'blocked')
            .optional(),

        approval_status: Joi.string()
            .valid('pending', 'approved', 'rejected')
            .optional(),

        is_featured: Joi.boolean()
            .optional(),

        rating: Joi.number()
            .min(0)
            .max(5)
            .optional(),

        sort_by: Joi.string()
            .valid(
                'created_at',
                'price',
                'final_price',
                'rating',
                'sales_count',
                'views',
                'product_name'
            )
            .default('created_at'),

        sort_order: Joi.string()
            .valid('asc', 'desc')
            .default('desc'),

        in_stock: Joi.boolean()
            .optional(),
    }),

    // ============ PRODUCT REVIEW ============
    addReview: Joi.object({
        rating: Joi.number()
            .min(1)
            .max(5)
            .required()
            .messages({
                'number.min': 'Rating must be at least 1',
                'number.max': 'Rating cannot exceed 5',
                'any.required': 'Rating is required',
            }),

        title: Joi.string()
            .max(100)
            .optional(),

        comment: Joi.string()
            .max(1000)
            .optional(),

        images: Joi.array()
            .items(Joi.string())
            .max(5)
            .optional(),
    }),

    // ============ UPDATE REVIEW ============
    updateReview: Joi.object({
        rating: Joi.number()
            .min(1)
            .max(5)
            .optional(),

        title: Joi.string()
            .max(100)
            .optional(),

        comment: Joi.string()
            .max(1000)
            .optional(),
    }),

    // ============ CREATE CATEGORY ============
    createCategory: Joi.object({
        category_name: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Category name is required',
                'string.min': 'Category name must be at least 2 characters',
                'string.max': 'Category name cannot exceed 50 characters',
            }),

        description: Joi.string()
            .max(500)
            .optional(),

        parent_category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        display_order: Joi.number()
            .integer()
            .min(0)
            .default(0),

        status: Joi.string()
            .valid('active', 'inactive')
            .default('active'),
    }),

    // ============ UPDATE CATEGORY ============
    updateCategory: Joi.object({
        category_name: Joi.string()
            .min(2)
            .max(50)
            .optional(),

        description: Joi.string()
            .max(500)
            .optional(),

        parent_category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),

        display_order: Joi.number()
            .integer()
            .min(0)
            .optional(),

        status: Joi.string()
            .valid('active', 'inactive')
            .optional(),
    }),

    // ============ CREATE SUB-CATEGORY ============
    createSubCategory: Joi.object({
        category_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid category ID',
                'string.empty': 'Category ID is required',
            }),

        sub_category_name: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Sub-category name is required',
                'string.min': 'Sub-category name must be at least 2 characters',
                'string.max': 'Sub-category name cannot exceed 50 characters',
            }),

        description: Joi.string()
            .max(500)
            .optional(),

        display_order: Joi.number()
            .integer()
            .min(0)
            .default(0),

        status: Joi.string()
            .valid('active', 'inactive')
            .default('active'),
    }),

    // ============ UPDATE SUB-CATEGORY ============
    updateSubCategory: Joi.object({
        sub_category_name: Joi.string()
            .min(2)
            .max(50)
            .optional(),

        description: Joi.string()
            .max(500)
            .optional(),

        display_order: Joi.number()
            .integer()
            .min(0)
            .optional(),

        status: Joi.string()
            .valid('active', 'inactive')
            .optional(),
    }),

    // ============ UPDATE INVENTORY ============
    updateInventory: Joi.object({
        product_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid product ID',
                'string.empty': 'Product ID is required',
            }),

        stock_quantity: Joi.number()
            .integer()
            .min(0)
            .required()
            .messages({
                'number.min': 'Stock quantity cannot be negative',
                'any.required': 'Stock quantity is required',
            }),

        low_stock_limit: Joi.number()
            .integer()
            .min(0)
            .default(5),

        warehouse_location: Joi.object({
            name: Joi.string().optional(),
            address: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            country: Joi.string().optional(),
            contact: Joi.string().optional(),
        }).optional(),

        supplier_info: Joi.object({
            name: Joi.string().optional(),
            contact: Joi.string().optional(),
            email: Joi.string().email().optional(),
            lead_time: Joi.number().integer().min(0).optional(),
        }).optional(),
    }),

    // ============ BULK UPDATE INVENTORY ============
    bulkUpdateInventory: Joi.object({
        updates: Joi.array()
            .items(
                Joi.object({
                    product_id: Joi.string()
                        .pattern(/^[0-9a-fA-F]{24}$/)
                        .required(),
                    stock_quantity: Joi.number()
                        .integer()
                        .min(0)
                        .required(),
                    low_stock_limit: Joi.number()
                        .integer()
                        .min(0)
                        .optional(),
                })
            )
            .min(1)
            .required()
            .messages({
                'array.min': 'At least one product update is required',
            }),
    }),
};

module.exports = productValidation;