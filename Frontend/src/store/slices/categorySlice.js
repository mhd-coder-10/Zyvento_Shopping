// CATEGORY SLICE
// Description: Manages category data state (list, CRUD operations)
// APIs Used:
//   - getAllCategories (GET /admin/categories) - Fetch all categories
//   - createCategory (POST /admin/categories) - Create category
//   - updateCategory (PUT /admin/categories/:id) - Update category
//   - deleteCategory (DELETE /admin/categories/:id) - Delete category


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET ALL CATEGORIES
// ============================================================
export const getAllCategories = createAsyncThunk(
    'categories/getAll',
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
// CREATE CATEGORY
// ============================================================
export const createCategory = createAsyncThunk(
    'categories/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.createCategory(data);
            toast.success(response.data.message || 'Category created successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create category';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE CATEGORY
// ============================================================
export const updateCategory = createAsyncThunk(
    'categories/update',
    async ({ categoryId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateCategory(categoryId, data);
            toast.success(response.data.message || 'Category updated successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update category';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// DELETE CATEGORY
// ============================================================
export const deleteCategory = createAsyncThunk(
    'categories/delete',
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await ApiService.deleteCategory(categoryId);
            toast.success(response.data.message || 'Category deleted successfully');
            return categoryId;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete category';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    categories: [],
    loading: false,
    error: null,
};

// ============================================================
// SLICE
// ============================================================
const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearCategoryError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET ALL CATEGORIES =====
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
            })

            // ===== CREATE CATEGORY =====
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories.unshift(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE CATEGORY =====
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.categories.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== DELETE CATEGORY =====
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = state.categories.filter(c => c._id !== action.payload);
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
