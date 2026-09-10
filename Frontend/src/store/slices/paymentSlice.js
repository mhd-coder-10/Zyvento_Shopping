// ============================================================
// PAYMENT SLICE
// Description: Manages payment data state (list, single payment, refunds)
// APIs Used:
//   - adminGetAllPayments (GET /payment/admin/all) - Fetch all payments
//   - getPaymentById (GET /admin/payments/:paymentId) - Fetch single payment
//   - adminProcessRefund (POST /payment/admin/:paymentId/refund) - Process refund
//   - getPaymentStatistics (GET /payment/admin/statistics) - Payment stats
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET ALL PAYMENTS (Admin)
// ============================================================
export const adminGetAllPayments = createAsyncThunk(
    'payments/adminGetAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.adminGetAllPayments(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch payments';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET PAYMENT BY ID
// ============================================================
export const getPaymentById = createAsyncThunk(
    'payments/getById',
    async (paymentId, { rejectWithValue }) => {
        try {
            const response = await ApiService.getPaymentById(paymentId);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch payment details';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// PROCESS REFUND (Admin)
// ============================================================
export const adminProcessRefund = createAsyncThunk(
    'payments/adminProcessRefund',
    async ({ paymentId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.adminProcessRefund(paymentId, data);
            toast.success(response.data.message || 'Refund processed successfully');
            return { paymentId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to process refund';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET PAYMENT STATISTICS
// ============================================================
export const getPaymentStatistics = createAsyncThunk(
    'payments/getStatistics',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getPaymentStatistics(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch statistics';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    payments: [],
    currentPayment: null,
    stats: {
        totalPayments: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        totalRefunds: 0,
    },
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
};

// ============================================================
// SLICE
// ============================================================
const paymentSlice = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        clearPaymentError: (state) => {
            state.error = null;
        },
        clearCurrentPayment: (state) => {
            state.currentPayment = null;
        },
        setPaymentPage: (state, action) => {
            state.page = action.payload;
        },
        setPaymentLimit: (state, action) => {
            state.limit = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET ALL PAYMENTS =====
            .addCase(adminGetAllPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminGetAllPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload.payments || action.payload || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.limit = action.payload.limit || 10;
            })
            .addCase(adminGetAllPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET PAYMENT BY ID =====
            .addCase(getPaymentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPaymentById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPayment = action.payload;
            })
            .addCase(getPaymentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== PROCESS REFUND =====
            .addCase(adminProcessRefund.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminProcessRefund.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.payments.findIndex(p => p._id === action.payload.paymentId);
                if (index !== -1) {
                    state.payments[index] = action.payload.data;
                }
                if (state.currentPayment?._id === action.payload.paymentId) {
                    state.currentPayment = action.payload.data;
                }
                // Update stats
                if (state.stats) {
                    state.stats.totalPayments = (state.stats.totalPayments || 0);
                }
            })
            .addCase(adminProcessRefund.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET PAYMENT STATISTICS =====
            .addCase(getPaymentStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPaymentStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload || initialState.stats;
            })
            .addCase(getPaymentStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearPaymentError,
    clearCurrentPayment,
    setPaymentPage,
    setPaymentLimit,
} = paymentSlice.actions;

export default paymentSlice.reducer;