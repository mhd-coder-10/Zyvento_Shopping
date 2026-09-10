// ============================================================
// PROFILE SLICE
// Description: Manages user profile data
// APIs Used:
//   - getProfile (GET /auth/profile) - Get user profile
//   - updateProfile (PUT /auth/profile) - Update profile
//   - uploadProfileImage (POST /auth/profile-image) - Upload image
//   - deleteProfileImage (DELETE /auth/profile-image) - Delete image
//   - changePassword (POST /auth/change-password) - Change password
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET PROFILE
// ============================================================
export const getProfile = createAsyncThunk(
    'profile/get',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.getProfile();
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch profile';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE PROFILE
// ============================================================
export const updateProfile = createAsyncThunk(
    'profile/update',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateProfile(data);
            toast.success(response.data.message || 'Profile updated successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPLOAD PROFILE IMAGE
// ============================================================
export const uploadProfileImage = createAsyncThunk(
    'profile/uploadImage',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await ApiService.uploadProfileImage(formData);
            toast.success(response.data.message || 'Profile image uploaded successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to upload image';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// DELETE PROFILE IMAGE
// ============================================================
export const deleteProfileImage = createAsyncThunk(
    'profile/deleteImage',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.deleteProfileImage();
            toast.success(response.data.message || 'Profile image deleted successfully');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete image';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// CHANGE PASSWORD
// ============================================================
export const changePassword = createAsyncThunk(
    'profile/changePassword',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.changePassword(data);
            toast.success(response.data.message || 'Password changed successfully');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to change password';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    user: null,
    loading: false,
    imageLoading: false,
    error: null,
};

// ============================================================
// SLICE
// ============================================================
const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        clearProfileError: (state) => {
            state.error = null;
        },
        clearProfile: (state) => {
            state.user = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET PROFILE =====
            .addCase(getProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE PROFILE =====
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = { ...state.user, ...action.payload };
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPLOAD PROFILE IMAGE =====
            .addCase(uploadProfileImage.pending, (state) => {
                state.imageLoading = true;
                state.error = null;
            })
            .addCase(uploadProfileImage.fulfilled, (state, action) => {
                state.imageLoading = false;
                if (state.user) {
                    state.user.profileImage = action.payload.profileImage;
                }
            })
            .addCase(uploadProfileImage.rejected, (state, action) => {
                state.imageLoading = false;
                state.error = action.payload;
            })

            // ===== DELETE PROFILE IMAGE =====
            .addCase(deleteProfileImage.pending, (state) => {
                state.imageLoading = true;
                state.error = null;
            })
            .addCase(deleteProfileImage.fulfilled, (state) => {
                state.imageLoading = false;
                if (state.user) {
                    state.user.profileImage = null;
                }
            })
            .addCase(deleteProfileImage.rejected, (state, action) => {
                state.imageLoading = false;
                state.error = action.payload;
            })

            // ===== CHANGE PASSWORD =====
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearProfileError, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;