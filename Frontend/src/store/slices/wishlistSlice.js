// ============================================================
// WISHLIST SLICE
// Description: Manages wishlist data state
// APIs Used:
//   - getWishlist (GET /wishlist) - Get wishlist
//   - addToWishlist (POST /wishlist/add) - Add item
//   - removeFromWishlist (DELETE /wishlist/remove/:productId) - Remove item
//   - clearWishlist (DELETE /wishlist/clear) - Clear wishlist
//   - checkWishlist (GET /wishlist/check/:productId) - Check item
//   - moveToCart (POST /wishlist/move-to-cart/:productId) - Move to cart
//   - moveAllToCart (POST /wishlist/move-all-to-cart) - Move all to cart
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET WISHLIST
// ============================================================
export const getWishlist = createAsyncThunk(
    'wishlist/get',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getWishlist(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch wishlist';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// ADD TO WISHLIST
// ============================================================
export const addToWishlist = createAsyncThunk(
    'wishlist/add',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.addToWishlist(data);
            toast.success(response.data.message || 'Added to wishlist');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add to wishlist';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// REMOVE FROM WISHLIST
// ============================================================
export const removeFromWishlist = createAsyncThunk(
    'wishlist/remove',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await ApiService.removeFromWishlist(productId);
            toast.success(response.data.message || 'Removed from wishlist');
            return { productId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to remove from wishlist';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// CLEAR WISHLIST
// ============================================================
export const clearWishlist = createAsyncThunk(
    'wishlist/clear',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.clearWishlist();
            toast.success(response.data.message || 'Wishlist cleared');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to clear wishlist';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// CHECK WISHLIST
// ============================================================
export const checkWishlist = createAsyncThunk(
    'wishlist/check',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await ApiService.checkWishlist(productId);
            return { productId, inWishlist: response.data.data?.isInWishlist || false };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to check wishlist';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// MOVE TO CART
// ============================================================
export const moveToCart = createAsyncThunk(
    'wishlist/moveToCart',
    async ({ productId, data = {} }, { rejectWithValue }) => {
        try {
            const response = await ApiService.moveToCart(productId, data);
            toast.success(response.data.message || 'Moved to cart');
            return { productId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to move to cart';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// MOVE ALL TO CART
// ============================================================
export const moveAllToCart = createAsyncThunk(
    'wishlist/moveAllToCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.moveAllToCart();
            toast.success(response.data.message || 'All items moved to cart');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to move all to cart';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
};

// ============================================================
// SLICE
// ============================================================
const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearWishlistError: (state) => {
            state.error = null;
        },
        resetWishlist: (state) => {
            state.items = [];
            state.total = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET WISHLIST =====
            .addCase(getWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || action.payload || [];
                state.total = action.payload.total || 0;
            })
            .addCase(getWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== ADD TO WISHLIST =====
            .addCase(addToWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.total = action.payload.total || 0;
            })
            .addCase(addToWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== REMOVE FROM WISHLIST =====
            .addCase(removeFromWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data.items || [];
                state.total = action.payload.data.total || 0;
            })
            .addCase(removeFromWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== CLEAR WISHLIST =====
            .addCase(clearWishlist.fulfilled, (state) => {
                state.loading = false;
                state.items = [];
                state.total = 0;
            })

            // ===== MOVE TO CART =====
            .addCase(moveToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(moveToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data.items || [];
                state.total = action.payload.data.total || 0;
            })
            .addCase(moveToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== MOVE ALL TO CART =====
            .addCase(moveAllToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(moveAllToCart.fulfilled, (state) => {
                state.loading = false;
                state.items = [];
                state.total = 0;
            })
            .addCase(moveAllToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearWishlistError, resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;