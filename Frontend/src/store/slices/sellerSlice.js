// ============================================================
// SELLER SLICE
// Description: Manages seller data state (list, single seller, CRUD operations)
// APIs Used:
//   - getAllSellers (GET /admin/sellers) - Fetch all sellers
//   - getSellerById (GET /admin/sellers/:id) - Fetch single seller
//   - updateSellerStatus (PUT /admin/sellers/:id/status) - Update status
//   - verifySeller (PUT /admin/sellers/:id/verify) - KYC verification
//   - getPendingSellers (GET /seller/approval/pending) - Pending sellers
//   - approveSeller (PUT /seller/approval/:id/approve) - Approve seller
//   - rejectSeller (PUT /seller/approval/:id/reject) - Reject seller
//   - getApprovalStatistics (GET /seller/approval/statistics) - Stats
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET ALL SELLERS
// ============================================================
export const getAllSellers = createAsyncThunk(
    'sellers/getAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getAllSellers(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch sellers';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET SELLER BY ID
// ============================================================
export const getSellerById = createAsyncThunk(
    'sellers/getById',
    async (sellerId, { rejectWithValue }) => {
        try {
            const response = await ApiService.getSellerById(sellerId);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch seller';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE SELLER STATUS
// ============================================================
export const updateSellerStatus = createAsyncThunk(
    'sellers/updateStatus',
    async ({ sellerId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateSellerStatus(sellerId, data);
            toast.success(response.data.message || 'Seller status updated successfully');
            return { sellerId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update status';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// VERIFY SELLER (KYC)
// ============================================================
export const verifySeller = createAsyncThunk(
    'sellers/verify',
    async ({ sellerId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.verifySeller(sellerId, data);
            toast.success(response.data.message || 'Seller verified successfully');
            return { sellerId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to verify seller';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET PENDING SELLERS
// ============================================================
export const getPendingSellers = createAsyncThunk(
    'sellers/getPending',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getPendingSellers(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch pending sellers';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// APPROVE SELLER
// ============================================================
export const approveSeller = createAsyncThunk(
    'sellers/approve',
    async ({ sellerId, data = {} }, { rejectWithValue }) => {
        try {
            const response = await ApiService.approveSeller(sellerId, data);
            toast.success(response.data.message || 'Seller approved successfully');
            return { sellerId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to approve seller';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// REJECT SELLER
// ============================================================
export const rejectSeller = createAsyncThunk(
    'sellers/reject',
    async ({ sellerId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.rejectSeller(sellerId, data);
            toast.success(response.data.message || 'Seller rejected');
            return { sellerId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reject seller';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET APPROVAL STATISTICS
// ============================================================
export const getApprovalStatistics = createAsyncThunk(
    'sellers/getStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.getApprovalStatistics();
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
    sellers: [],
    currentSeller: null,
    pendingSellers: [],
    stats: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0,
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
const sellerSlice = createSlice({
    name: 'sellers',
    initialState,
    reducers: {
        clearSellerError: (state) => {
            state.error = null;
        },
        clearCurrentSeller: (state) => {
            state.currentSeller = null;
        },
        setSellerPage: (state, action) => {
            state.page = action.payload;
        },
        setSellerLimit: (state, action) => {
            state.limit = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET ALL SELLERS =====
            .addCase(getAllSellers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllSellers.fulfilled, (state, action) => {
                state.loading = false;
                state.sellers = action.payload.sellers || action.payload || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.limit = action.payload.limit || 10;
            })
            .addCase(getAllSellers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET SELLER BY ID =====
            .addCase(getSellerById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSellerById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSeller = action.payload;
            })
            .addCase(getSellerById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE SELLER STATUS =====
            .addCase(updateSellerStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSellerStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.sellers.findIndex(s => s._id === action.payload.sellerId);
                if (index !== -1) {
                    state.sellers[index] = action.payload.data;
                }
                if (state.currentSeller?._id === action.payload.sellerId) {
                    state.currentSeller = action.payload.data;
                }
            })
            .addCase(updateSellerStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== VERIFY SELLER =====
            .addCase(verifySeller.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifySeller.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.sellers.findIndex(s => s._id === action.payload.sellerId);
                if (index !== -1) {
                    state.sellers[index] = action.payload.data;
                }
                if (state.currentSeller?._id === action.payload.sellerId) {
                    state.currentSeller = action.payload.data;
                }
            })
            .addCase(verifySeller.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET PENDING SELLERS =====
            .addCase(getPendingSellers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPendingSellers.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingSellers = action.payload.sellers || action.payload || [];
            })
            .addCase(getPendingSellers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== APPROVE SELLER =====
            .addCase(approveSeller.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveSeller.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingSellers = state.pendingSellers.filter(s => s._id !== action.payload.sellerId);
                const index = state.sellers.findIndex(s => s._id === action.payload.sellerId);
                if (index !== -1) {
                    state.sellers[index] = action.payload.data;
                }
                if (state.currentSeller?._id === action.payload.sellerId) {
                    state.currentSeller = action.payload.data;
                }
            })
            .addCase(approveSeller.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== REJECT SELLER =====
            .addCase(rejectSeller.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectSeller.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingSellers = state.pendingSellers.filter(s => s._id !== action.payload.sellerId);
                const index = state.sellers.findIndex(s => s._id === action.payload.sellerId);
                if (index !== -1) {
                    state.sellers[index] = action.payload.data;
                }
                if (state.currentSeller?._id === action.payload.sellerId) {
                    state.currentSeller = action.payload.data;
                }
            })
            .addCase(rejectSeller.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET APPROVAL STATISTICS =====
            .addCase(getApprovalStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getApprovalStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload || {
                    total: 0,
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                    suspended: 0,
                };
            })
            .addCase(getApprovalStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearSellerError,
    clearCurrentSeller,
    setSellerPage,
    setSellerLimit,
} = sellerSlice.actions;

export default sellerSlice.reducer;