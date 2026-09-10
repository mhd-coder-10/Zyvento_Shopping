// ============================================================
// PRODUCT SLICE
// Description: Manages product data state (list, single product, CRUD operations)
// APIs Used:
//   - getAllProducts (GET /admin/products) - Fetch all products
//   - getProductById (GET /admin/products/:id) - Fetch single product
//   - createProduct (POST /admin/products) - Create product
//   - updateProduct (PUT /admin/products/:id) - Update product
//   - deleteProduct (DELETE /admin/products/:id) - Delete product
//   - updateProductStatus (PUT /admin/products/:id/status) - Update status
//   - getAllCategories (GET /admin/categories) - Fetch categories
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET ALL PRODUCTS
// ============================================================
export const getAllProducts = createAsyncThunk(
    'products/getAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getAllProducts(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch products';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET PRODUCT BY ID
// ============================================================
export const getProductById = createAsyncThunk(
    'products/getById',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await ApiService.getProductById(productId);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch product';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// CREATE PRODUCT
// ============================================================
export const createProduct = createAsyncThunk(
    'products/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.createProduct(data);
            toast.success(response.data.message || 'Product created successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create product';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE PRODUCT
// ============================================================
export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ productId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateProduct(productId, data);
            toast.success(response.data.message || 'Product updated successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update product';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// DELETE PRODUCT
// ============================================================
export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await ApiService.deleteProduct(productId);
            toast.success(response.data.message || 'Product deleted successfully');
            return productId;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete product';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE PRODUCT STATUS
// ============================================================
export const updateProductStatus = createAsyncThunk(
    'products/updateStatus',
    async ({ productId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateProductStatus(productId, data);
            toast.success(response.data.message || 'Product status updated successfully');
            return { productId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update status';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET ALL CATEGORIES (for dropdown)
// ============================================================
export const getAllCategories = createAsyncThunk(
    'products/getCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.getAllCategories();
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch categories';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    products: [],
    currentProduct: null,
    categories: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
};

// ============================================================
// SLICE
// ============================================================
const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearProductError: (state) => {
            state.error = null;
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        },
        setProductPage: (state, action) => {
            state.page = action.payload;
        },
        setProductLimit: (state, action) => {
            state.limit = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET ALL PRODUCTS =====
            .addCase(getAllProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.products || action.payload || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.limit = action.payload.limit || 10;
            })
            .addCase(getAllProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET PRODUCT BY ID =====
            .addCase(getProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(getProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== CREATE PRODUCT =====
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products.unshift(action.payload);
                state.total += 1;
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE PRODUCT =====
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.currentProduct = action.payload;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== DELETE PRODUCT =====
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter(p => p._id !== action.payload);
                state.total -= 1;
                if (state.currentProduct?._id === action.payload) {
                    state.currentProduct = null;
                }
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE PRODUCT STATUS =====
            .addCase(updateProductStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProductStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.products.findIndex(p => p._id === action.payload.productId);
                if (index !== -1) {
                    state.products[index] = action.payload.data;
                }
                if (state.currentProduct?._id === action.payload.productId) {
                    state.currentProduct = action.payload.data;
                }
            })
            .addCase(updateProductStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET CATEGORIES =====
            .addCase(getAllCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload || [];
            })
            .addCase(getAllCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearProductError,
    clearCurrentProduct,
    setProductPage,
    setProductLimit,
} = productSlice.actions;

export default productSlice.reducer;