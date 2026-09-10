// ============================================================
// ORDER SLICE
// Description: Manages order data state (list, single order, status updates)
// APIs Used:
//   - adminGetAllOrders (GET /order/admin/all) - Fetch all orders
//   - adminGetOrderDetails (GET /order/admin/:orderId) - Fetch single order
//   - adminUpdateOrderStatus (PUT /order/admin/:orderId/status) - Update status
//   - adminCancelOrder (POST /order/admin/:orderId/cancel) - Cancel order
//   - getOrderStatistics (GET /order/admin/statistics) - Order stats
//   - getOrderReport (GET /order/admin/report) - Order report
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET ALL ORDERS (Admin)
// ============================================================
export const adminGetAllOrders = createAsyncThunk(
    'orders/adminGetAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.adminGetAllOrders(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch orders';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET ORDER DETAILS (Admin)
// ============================================================
export const adminGetOrderDetails = createAsyncThunk(
    'orders/adminGetDetails',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await ApiService.adminGetOrderDetails(orderId);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch order details';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE ORDER STATUS (Admin)
// ============================================================
export const adminUpdateOrderStatus = createAsyncThunk(
    'orders/adminUpdateStatus',
    async ({ orderId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.adminUpdateOrderStatus(orderId, data);
            toast.success(response.data.message || 'Order status updated successfully');
            return { orderId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update order status';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// CANCEL ORDER (Admin)
// ============================================================
export const adminCancelOrder = createAsyncThunk(
    'orders/adminCancel',
    async ({ orderId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.adminCancelOrder(orderId, data);
            toast.success(response.data.message || 'Order cancelled successfully');
            return { orderId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to cancel order';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET ORDER STATISTICS
// ============================================================
export const getOrderStatistics = createAsyncThunk(
    'orders/getStatistics',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getOrderStatistics(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch statistics';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET ORDER REPORT
// ============================================================
export const getOrderReport = createAsyncThunk(
    'orders/getReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getOrderReport(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch report';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    orders: [],
    currentOrder: null,
    stats: {
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
    },
    report: null,
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
};

// ============================================================
// SLICE
// ============================================================
const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearOrderError: (state) => {
            state.error = null;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        setOrderPage: (state, action) => {
            state.page = action.payload;
        },
        setOrderLimit: (state, action) => {
            state.limit = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET ALL ORDERS =====
            .addCase(adminGetAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminGetAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders || action.payload || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.limit = action.payload.limit || 10;
            })
            .addCase(adminGetAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET ORDER DETAILS =====
            .addCase(adminGetOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminGetOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(adminGetOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE ORDER STATUS =====
            .addCase(adminUpdateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.orders.findIndex(o => o._id === action.payload.orderId);
                if (index !== -1) {
                    state.orders[index] = action.payload.data;
                }
                if (state.currentOrder?._id === action.payload.orderId) {
                    state.currentOrder = action.payload.data;
                }
                // Update stats if needed
                if (state.stats) {
                    // Recalculate stats or refresh
                }
            })
            .addCase(adminUpdateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== CANCEL ORDER =====
            .addCase(adminCancelOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminCancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.orders.findIndex(o => o._id === action.payload.orderId);
                if (index !== -1) {
                    state.orders[index] = action.payload.data;
                }
                if (state.currentOrder?._id === action.payload.orderId) {
                    state.currentOrder = action.payload.data;
                }
            })
            .addCase(adminCancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET ORDER STATISTICS =====
            .addCase(getOrderStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrderStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload || initialState.stats;
            })
            .addCase(getOrderStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET ORDER REPORT =====
            .addCase(getOrderReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrderReport.fulfilled, (state, action) => {
                state.loading = false;
                state.report = action.payload;
            })
            .addCase(getOrderReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearOrderError,
    clearCurrentOrder,
    setOrderPage,
    setOrderLimit,
} = orderSlice.actions;

export default orderSlice.reducer;