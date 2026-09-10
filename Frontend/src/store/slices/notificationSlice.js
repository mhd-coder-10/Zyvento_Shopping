// ============================================================
// NOTIFICATION SLICE
// Description: Manages notification data state
// APIs Used:
//   - getNotifications (GET /notification) - Get user notifications
//   - getUnreadNotifications (GET /notification/unread) - Get unread notifications
//   - getNotificationById (GET /notification/:id) - Get notification by ID
//   - markNotificationAsRead (PUT /notification/:id/read) - Mark as read
//   - markAllNotificationsAsRead (PUT /notification/read-all) - Mark all as read
//   - deleteNotification (DELETE /notification/:id) - Delete notification
//   - clearAllNotifications (DELETE /notification/clear/all) - Clear all
//   - getNotificationPreferences (GET /notification/preferences) - Get preferences
//   - updateNotificationPreferences (PUT /notification/preferences) - Update preferences
//   - getNotificationStatistics (GET /notification/statistics) - Get statistics
//   - sendBroadcastNotification (POST /notification/admin/broadcast) - Send broadcast
//   - adminGetAllNotifications (GET /notification/admin/all) - Admin get all
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET NOTIFICATIONS
// ============================================================
export const getNotifications = createAsyncThunk(
    'notifications/getAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getNotifications(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch notifications';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET UNREAD NOTIFICATIONS
// ============================================================
export const getUnreadNotifications = createAsyncThunk(
    'notifications/getUnread',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getUnreadNotifications(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch unread notifications';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET NOTIFICATION BY ID
// ============================================================
export const getNotificationById = createAsyncThunk(
    'notifications/getById',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await ApiService.getNotificationById(notificationId);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch notification';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// MARK NOTIFICATION AS READ
// ============================================================
export const markNotificationAsRead = createAsyncThunk(
    'notifications/markRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await ApiService.markNotificationAsRead(notificationId);
            toast.success(response.data.message || 'Notification marked as read');
            return { notificationId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to mark notification as read';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================
export const markAllNotificationsAsRead = createAsyncThunk(
    'notifications/markAllRead',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.markAllNotificationsAsRead();
            toast.success(response.data.message || 'All notifications marked as read');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to mark all as read';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// DELETE NOTIFICATION
// ============================================================
export const deleteNotification = createAsyncThunk(
    'notifications/delete',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await ApiService.deleteNotification(notificationId);
            toast.success(response.data.message || 'Notification deleted');
            return notificationId;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete notification';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// CLEAR ALL NOTIFICATIONS
// ============================================================
export const clearAllNotifications = createAsyncThunk(
    'notifications/clearAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.clearAllNotifications();
            toast.success(response.data.message || 'All notifications cleared');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to clear notifications';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET NOTIFICATION PREFERENCES
// ============================================================
export const getNotificationPreferences = createAsyncThunk(
    'notifications/getPreferences',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.getNotificationPreferences();
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch preferences';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE NOTIFICATION PREFERENCES
// ============================================================
export const updateNotificationPreferences = createAsyncThunk(
    'notifications/updatePreferences',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateNotificationPreferences(data);
            toast.success(response.data.message || 'Preferences updated');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update preferences';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET NOTIFICATION STATISTICS
// ============================================================
export const getNotificationStatistics = createAsyncThunk(
    'notifications/getStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.getNotificationStatistics();
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch statistics';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// SEND BROADCAST NOTIFICATION
// ============================================================
export const sendBroadcastNotification = createAsyncThunk(
    'notifications/sendBroadcast',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.sendBroadcastNotification(data);
            toast.success(response.data.message || 'Broadcast sent successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send broadcast';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// ADMIN GET ALL NOTIFICATIONS
// ============================================================
export const adminGetAllNotifications = createAsyncThunk(
    'notifications/adminGetAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.adminGetAllNotifications(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch all notifications';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    notifications: [],
    unreadNotifications: [],
    currentNotification: null,
    preferences: null,
    statistics: null,
    broadcastHistory: [],
    total: 0,
    unreadCount: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
};

// ============================================================
// SLICE
// ============================================================
const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearNotificationError: (state) => {
            state.error = null;
        },
        clearCurrentNotification: (state) => {
            state.currentNotification = null;
        },
        setNotificationPage: (state, action) => {
            state.page = action.payload;
        },
        setNotificationLimit: (state, action) => {
            state.limit = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET NOTIFICATIONS =====
            .addCase(getNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications || action.payload || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.limit = action.payload.limit || 10;
            })
            .addCase(getNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET UNREAD NOTIFICATIONS =====
            .addCase(getUnreadNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUnreadNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.unreadNotifications = action.payload.notifications || action.payload || [];
                state.unreadCount = action.payload.total || 0;
            })
            .addCase(getUnreadNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET NOTIFICATION BY ID =====
            .addCase(getNotificationById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNotificationById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentNotification = action.payload;
            })
            .addCase(getNotificationById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== MARK NOTIFICATION AS READ =====
            .addCase(markNotificationAsRead.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.notifications.findIndex(n => n._id === action.payload.notificationId);
                if (index !== -1) {
                    state.notifications[index] = action.payload.data;
                }
                state.unreadCount = Math.max(0, state.unreadCount - 1);
                if (state.currentNotification?._id === action.payload.notificationId) {
                    state.currentNotification = action.payload.data;
                }
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== MARK ALL AS READ =====
            .addCase(markAllNotificationsAsRead.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.loading = false;
                state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
                state.unreadCount = 0;
            })
            .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== DELETE NOTIFICATION =====
            .addCase(deleteNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = state.notifications.filter(n => n._id !== action.payload);
                state.total = Math.max(0, state.total - 1);
                if (state.currentNotification?._id === action.payload) {
                    state.currentNotification = null;
                }
            })
            .addCase(deleteNotification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== CLEAR ALL NOTIFICATIONS =====
            .addCase(clearAllNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearAllNotifications.fulfilled, (state) => {
                state.loading = false;
                state.notifications = [];
                state.total = 0;
                state.unreadCount = 0;
            })
            .addCase(clearAllNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET PREFERENCES =====
            .addCase(getNotificationPreferences.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNotificationPreferences.fulfilled, (state, action) => {
                state.loading = false;
                state.preferences = action.payload;
            })
            .addCase(getNotificationPreferences.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE PREFERENCES =====
            .addCase(updateNotificationPreferences.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
                state.loading = false;
                state.preferences = action.payload;
            })
            .addCase(updateNotificationPreferences.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET STATISTICS =====
            .addCase(getNotificationStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNotificationStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload;
            })
            .addCase(getNotificationStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== SEND BROADCAST =====
            .addCase(sendBroadcastNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendBroadcastNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.broadcastHistory.unshift(action.payload);
            })
            .addCase(sendBroadcastNotification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== ADMIN GET ALL NOTIFICATIONS =====
            .addCase(adminGetAllNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminGetAllNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications || action.payload || [];
                state.total = action.payload.total || 0;
            })
            .addCase(adminGetAllNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearNotificationError,
    clearCurrentNotification,
    setNotificationPage,
    setNotificationLimit,
} = notificationSlice.actions;

export default notificationSlice.reducer;