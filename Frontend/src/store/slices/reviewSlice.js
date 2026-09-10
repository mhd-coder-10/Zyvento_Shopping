// ============================================================
// REVIEW SLICE
// Description: Manages review data state (list, moderation)
// APIs Used:
//   - adminGetAllReviews (GET /admin/reviews) - Fetch all reviews
//   - approveReview (PUT /review/:reviewId/approve) - Approve/Reject review
//   - adminDeleteReview (DELETE /review/admin/:reviewId) - Delete review
//   - getReviewReport (GET /review/admin/report) - Review report
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET ALL REVIEWS (Admin)
// ============================================================
export const adminGetAllReviews = createAsyncThunk(
    'reviews/adminGetAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.adminGetAllReviews(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch reviews';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// APPROVE/REJECT REVIEW
// ============================================================
export const approveReview = createAsyncThunk(
    'reviews/approve',
    async ({ reviewId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.approveReview(reviewId, data);
            toast.success(response.data.message || 'Review moderated successfully');
            return { reviewId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to moderate review';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// DELETE REVIEW (Admin)
// ============================================================
export const adminDeleteReview = createAsyncThunk(
    'reviews/adminDelete',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await ApiService.adminDeleteReview(reviewId);
            toast.success(response.data.message || 'Review deleted successfully');
            return reviewId;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete review';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET REVIEW REPORT
// ============================================================
export const getReviewReport = createAsyncThunk(
    'reviews/getReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getReviewReport(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch review report';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    reviews: [],
    stats: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        averageRating: 0,
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
const reviewSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        clearReviewError: (state) => {
            state.error = null;
        },
        setReviewPage: (state, action) => {
            state.page = action.payload;
        },
        setReviewLimit: (state, action) => {
            state.limit = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET ALL REVIEWS =====
            .addCase(adminGetAllReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminGetAllReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload.reviews || action.payload || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.limit = action.payload.limit || 10;
            })
            .addCase(adminGetAllReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== APPROVE/REJECT REVIEW =====
            .addCase(approveReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveReview.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.reviews.findIndex(r => r._id === action.payload.reviewId);
                if (index !== -1) {
                    state.reviews[index] = action.payload.data;
                }
                // Update stats if needed
            })
            .addCase(approveReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== DELETE REVIEW =====
            .addCase(adminDeleteReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminDeleteReview.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = state.reviews.filter(r => r._id !== action.payload);
                state.total -= 1;
            })
            .addCase(adminDeleteReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET REVIEW REPORT =====
            .addCase(getReviewReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getReviewReport.fulfilled, (state, action) => {
                state.loading = false;
                state.report = action.payload;
                state.stats = action.payload.stats || state.stats;
            })
            .addCase(getReviewReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearReviewError, setReviewPage, setReviewLimit } = reviewSlice.actions;
export default reviewSlice.reducer;