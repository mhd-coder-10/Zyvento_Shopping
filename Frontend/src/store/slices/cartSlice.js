// ============================================================
// CART SLICE
// Description: Manages cart data state
// APIs Used:
//   - getCart (GET /cart) - Get cart
//   - addToCart (POST /cart/add) - Add item
//   - updateCartItem (PUT /cart/update/:productId) - Update quantity
//   - removeFromCart (DELETE /cart/remove/:productId) - Remove item
//   - clearCart (DELETE /cart/clear) - Clear cart
//   - getCartCount (GET /cart/count) - Get cart count
//   - applyCoupon (POST /cart/apply-coupon) - Apply coupon
//   - removeCoupon (DELETE /cart/remove-coupon) - Remove coupon
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET CART
// ============================================================
export const getCart = createAsyncThunk(
    'cart/get',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.getCart();
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch cart';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// ADD TO CART
// ============================================================
export const addToCart = createAsyncThunk(
    'cart/add',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.addToCart(data);
            toast.success(response.data.message || 'Item added to cart');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add item to cart';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE CART ITEM
// ============================================================
export const updateCartItem = createAsyncThunk(
    'cart/update',
    async ({ productId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateCartItem(productId, data);
            toast.success(response.data.message || 'Cart updated');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update cart';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// REMOVE FROM CART
// ============================================================
export const removeFromCart = createAsyncThunk(
    'cart/remove',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await ApiService.removeFromCart(productId);
            toast.success(response.data.message || 'Item removed from cart');
            return { productId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to remove item';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// CLEAR CART
// ============================================================
export const clearCart = createAsyncThunk(
    'cart/clear',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.clearCart();
            toast.success(response.data.message || 'Cart cleared');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to clear cart';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET CART COUNT
// ============================================================
export const getCartCount = createAsyncThunk(
    'cart/getCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.getCartCount();
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch cart count';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// APPLY COUPON
// ============================================================
export const applyCoupon = createAsyncThunk(
    'cart/applyCoupon',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.applyCoupon(data);
            toast.success(response.data.message || 'Coupon applied successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to apply coupon';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// REMOVE COUPON
// ============================================================
export const removeCoupon = createAsyncThunk(
    'cart/removeCoupon',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.removeCoupon();
            toast.success(response.data.message || 'Coupon removed');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to remove coupon';
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
    totalItems: 0,
    totalAmount: 0,
    subtotal: 0,
    discount: 0,
    coupon: null,
    loading: false,
    error: null,
};

// ============================================================
// SLICE
// ============================================================
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCartError: (state) => {
            state.error = null;
        },
        resetCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.totalAmount = 0;
            state.subtotal = 0;
            state.discount = 0;
            state.coupon = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET CART =====
            .addCase(getCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.totalItems = action.payload.totalItems || 0;
                state.totalAmount = action.payload.totalAmount || 0;
                state.subtotal = action.payload.subtotal || 0;
                state.discount = action.payload.discount || 0;
                state.coupon = action.payload.coupon || null;
            })
            .addCase(getCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== ADD TO CART =====
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.totalItems = action.payload.totalItems || 0;
                state.totalAmount = action.payload.totalAmount || 0;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE CART ITEM =====
            .addCase(updateCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.totalItems = action.payload.totalItems || 0;
                state.totalAmount = action.payload.totalAmount || 0;
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== REMOVE FROM CART =====
            .addCase(removeFromCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data.items || [];
                state.totalItems = action.payload.data.totalItems || 0;
                state.totalAmount = action.payload.data.totalAmount || 0;
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== CLEAR CART =====
            .addCase(clearCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.loading = false;
                state.items = [];
                state.totalItems = 0;
                state.totalAmount = 0;
                state.subtotal = 0;
                state.discount = 0;
                state.coupon = null;
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET CART COUNT =====
            .addCase(getCartCount.fulfilled, (state, action) => {
                state.totalItems = action.payload.totalItems || 0;
            })

            // ===== APPLY COUPON =====
            .addCase(applyCoupon.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(applyCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.coupon = action.payload.coupon;
                state.discount = action.payload.discount || 0;
                state.totalAmount = action.payload.totalAmount || 0;
            })
            .addCase(applyCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== REMOVE COUPON =====
            .addCase(removeCoupon.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.coupon = null;
                state.discount = 0;
                state.totalAmount = action.payload.totalAmount || 0;
            })
            .addCase(removeCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCartError, resetCart } = cartSlice.actions;
export default cartSlice.reducer;