// ============================================================
// REPORT SLICE
// Description: Manages report data state for all reports
// APIs Used:
//   - getSalesReport (GET /admin/reports/sales) - Sales report
//   - getRevenueReport (GET /admin/reports/revenue) - Revenue report
//   - getProductReport (GET /admin/reports/products) - Product report
//   - getUserReport (GET /admin/reports/users) - User report
//   - exportCSV (GET /report/export/csv) - Export CSV
//   - exportPDF (GET /report/export/pdf) - Export PDF
//   - exportExcel (GET /report/export/excel) - Export Excel
//   - getAnalyticsDashboard (GET /report/analytics) - Analytics dashboard
//   - getRealtimeAnalytics (GET /report/analytics/realtime) - Real-time analytics
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET SALES REPORT
// ============================================================
export const getSalesReport = createAsyncThunk(
    'reports/getSales',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getSalesReport(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch sales report';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET REVENUE REPORT
// ============================================================
export const getRevenueReport = createAsyncThunk(
    'reports/getRevenue',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getRevenueReport(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch revenue report';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET PRODUCT REPORT
// ============================================================
export const getProductReport = createAsyncThunk(
    'reports/getProduct',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getProductReport(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch product report';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET USER REPORT
// ============================================================
export const getUserReport = createAsyncThunk(
    'reports/getUser',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getUserReport(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch user report';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// EXPORT CSV
// ============================================================
export const exportCSV = createAsyncThunk(
    'reports/exportCSV',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.exportCSV(params);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to export CSV';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// EXPORT PDF
// ============================================================
export const exportPDF = createAsyncThunk(
    'reports/exportPDF',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.exportPDF(params);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to export PDF';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// EXPORT EXCEL
// ============================================================
export const exportExcel = createAsyncThunk(
    'reports/exportExcel',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.exportExcel(params);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to export Excel';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET ANALYTICS DASHBOARD
// ============================================================
export const getAnalyticsDashboard = createAsyncThunk(
    'reports/getAnalytics',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getAnalyticsDashboard(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch analytics';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET REALTIME ANALYTICS
// ============================================================
export const getRealtimeAnalytics = createAsyncThunk(
    'reports/getRealtime',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.getRealtimeAnalytics();
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch real-time analytics';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    salesReport: null,
    revenueReport: null,
    productReport: null,
    userReport: null,
    analytics: null,
    realtimeData: null,
    exportData: null,
    loading: false,
    error: null,
    filters: {
        start_date: '',
        end_date: '',
        seller_id: '',
        group_by: 'daily',
    },
};

// ============================================================
// SLICE
// ============================================================
const reportSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        clearReportError: (state) => {
            state.error = null;
        },
        setReportFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearReports: (state) => {
            state.salesReport = null;
            state.revenueReport = null;
            state.productReport = null;
            state.userReport = null;
            state.analytics = null;
            state.realtimeData = null;
        },
        clearExportData: (state) => {
            state.exportData = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== SALES REPORT =====
            .addCase(getSalesReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSalesReport.fulfilled, (state, action) => {
                state.loading = false;
                state.salesReport = action.payload;
            })
            .addCase(getSalesReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== REVENUE REPORT =====
            .addCase(getRevenueReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRevenueReport.fulfilled, (state, action) => {
                state.loading = false;
                state.revenueReport = action.payload;
            })
            .addCase(getRevenueReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== PRODUCT REPORT =====
            .addCase(getProductReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProductReport.fulfilled, (state, action) => {
                state.loading = false;
                state.productReport = action.payload;
            })
            .addCase(getProductReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== USER REPORT =====
            .addCase(getUserReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserReport.fulfilled, (state, action) => {
                state.loading = false;
                state.userReport = action.payload;
            })
            .addCase(getUserReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== ANALYTICS =====
            .addCase(getAnalyticsDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAnalyticsDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
            })
            .addCase(getAnalyticsDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== REALTIME ANALYTICS =====
            .addCase(getRealtimeAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRealtimeAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.realtimeData = action.payload;
            })
            .addCase(getRealtimeAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== EXPORT CSV =====
            .addCase(exportCSV.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(exportCSV.fulfilled, (state, action) => {
                state.loading = false;
                state.exportData = action.payload;
            })
            .addCase(exportCSV.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== EXPORT PDF =====
            .addCase(exportPDF.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(exportPDF.fulfilled, (state, action) => {
                state.loading = false;
                state.exportData = action.payload;
            })
            .addCase(exportPDF.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== EXPORT EXCEL =====
            .addCase(exportExcel.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(exportExcel.fulfilled, (state, action) => {
                state.loading = false;
                state.exportData = action.payload;
            })
            .addCase(exportExcel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearReportError,
    setReportFilters,
    clearReports,
    clearExportData,
} = reportSlice.actions;

export default reportSlice.reducer;