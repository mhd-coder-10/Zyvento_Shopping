// ============================================================
// SETTINGS SLICE
// Description: Manages system settings data
// APIs Used:
//   - getSystemSettings (GET /admin/settings) - Get all settings
//   - updateSystemSettings (PUT /admin/settings) - Update settings
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET SYSTEM SETTINGS
// ============================================================
export const getSystemSettings = createAsyncThunk(
    'settings/getSystem',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.getSystemSettings();
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch settings';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE SYSTEM SETTINGS
// ============================================================
export const updateSystemSettings = createAsyncThunk(
    'settings/updateSystem',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateSystemSettings(data);
            toast.success(response.data.message || 'Settings updated successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update settings';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    settings: null,
    general: null,
    email: null,
    payment: null,
    security: null,
    loading: false,
    error: null,
};

// ============================================================
// SLICE
// ============================================================
const settingSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        clearSettingError: (state) => {
            state.error = null;
        },
        clearSettings: (state) => {
            state.settings = null;
            state.general = null;
            state.email = null;
            state.payment = null;
            state.security = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET SYSTEM SETTINGS =====
            .addCase(getSystemSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSystemSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                // Split settings into categories
                state.general = action.payload?.general || null;
                state.email = action.payload?.email || null;
                state.payment = action.payload?.payment || null;
                state.security = action.payload?.security || null;
            })
            .addCase(getSystemSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE SYSTEM SETTINGS =====
            .addCase(updateSystemSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSystemSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = { ...state.settings, ...action.payload };
                state.general = action.payload?.general || state.general;
                state.email = action.payload?.email || state.email;
                state.payment = action.payload?.payment || state.payment;
                state.security = action.payload?.security || state.security;
            })
            .addCase(updateSystemSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSettingError, clearSettings } = settingSlice.actions;
export default settingSlice.reducer;