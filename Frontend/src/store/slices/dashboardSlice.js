
// DASHBOARD SLICE
// Description: Manages dashboard data state (stats, charts, activities)
// APIs Used:
//   - getAdminDashboard (GET /admin/dashboard) - Fetch dashboard stats
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// FETCH DASHBOARD DATA
// ============================================================
export const getDashboardData = createAsyncThunk(
    'dashboard/getData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.getAdminDashboard();
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch dashboard data';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    stats: {
        totalUsers: 0,
        totalSellers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        pendingOrders: 0,
        pendingSellers: 0,
        totalReviews: 0,
    },
    recentOrders: [],
    recentUsers: [],
    chartData: {
        revenue: [],
        orders: [],
        labels: [],
    },
    loading: false,
    error: null,
};

// ============================================================
// SLICE
// ============================================================
const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = null;
        },
        resetDashboard: (state) => {
            state.stats = initialState.stats;
            state.recentOrders = [];
            state.recentUsers = [];
            state.chartData = { revenue: [], orders: [], labels: [] };
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload;
                state.stats = {
                    totalUsers: data.totalUsers || 0,
                    totalSellers: data.totalSellers || 0,
                    totalOrders: data.totalOrders || 0,
                    totalRevenue: data.totalRevenue || 0,
                    totalProducts: data.totalProducts || 0,
                    pendingOrders: data.pendingOrders || 0,
                    pendingSellers: data.pendingSellers || 0,
                    totalReviews: data.totalReviews || 0,
                };
                state.recentOrders = data.recentOrders || [];
                state.recentUsers = data.recentUsers || [];
                state.chartData = {
                    revenue: data.revenueChart || [],
                    orders: data.ordersChart || [],
                    labels: data.chartLabels || [],
                };
            })
            .addCase(getDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearDashboardError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;