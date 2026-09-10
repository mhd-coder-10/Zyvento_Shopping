// ============================================================
// USER SLICE
// Description: Manages user data state (list, single user, CRUD operations)
// APIs Used:
//   - getAllUsers (GET /admin/users) - Fetch all users
//   - getUserById (GET /admin/users/:id) - Fetch single user
//   - updateUserByAdmin (PUT /admin/users/:id) - Update user
//   - deleteUserByAdmin (DELETE /admin/users/:id) - Delete user
//   - updateUserStatus (PUT /admin/users/:id/status) - Update status
//   - updateUserRole (PUT /admin/users/:id/role) - Update role
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET ALL USERS
// ============================================================
export const getAllUsers = createAsyncThunk(
    'users/getAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getAllUsers(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch users';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET USER BY ID
// ============================================================
export const getUserById = createAsyncThunk(
    'users/getById',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await ApiService.getUserById(userId);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch user';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE USER
// ============================================================
export const updateUser = createAsyncThunk(
    'users/update',
    async ({ userId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateUserByAdmin(userId, data);
            toast.success(response.data.message || 'User updated successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update user';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// DELETE USER
// ============================================================
export const deleteUser = createAsyncThunk(
    'users/delete',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await ApiService.deleteUserByAdmin(userId);
            toast.success(response.data.message || 'User deleted successfully');
            return userId;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete user';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE USER STATUS
// ============================================================
export const updateUserStatus = createAsyncThunk(
    'users/updateStatus',
    async ({ userId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateUserStatus(userId, data);
            toast.success(response.data.message || 'User status updated successfully');
            return { userId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update status';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE USER ROLE
// ============================================================
export const updateUserRole = createAsyncThunk(
    'users/updateRole',
    async ({ userId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateUserRole(userId, data);
            toast.success(response.data.message || 'User role updated successfully');
            return { userId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update role';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    users: [],
    currentUser: null,
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
};

// ============================================================
// SLICE
// ============================================================
const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearUserError: (state) => {
            state.error = null;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        },
        setUserPage: (state, action) => {
            state.page = action.payload;
        },
        setUserLimit: (state, action) => {
            state.limit = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET ALL USERS =====
            .addCase(getAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users || action.payload || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.limit = action.payload.limit || 10;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET USER BY ID =====
            .addCase(getUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload;
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE USER =====
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.users.findIndex(u => u._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                state.currentUser = action.payload;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== DELETE USER =====
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter(u => u._id !== action.payload);
                state.total -= 1;
                if (state.currentUser?._id === action.payload) {
                    state.currentUser = null;
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE USER STATUS =====
            .addCase(updateUserStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.users.findIndex(u => u._id === action.payload.userId);
                if (index !== -1) {
                    state.users[index] = action.payload.data;
                }
                if (state.currentUser?._id === action.payload.userId) {
                    state.currentUser = action.payload.data;
                }
            })
            .addCase(updateUserStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE USER ROLE =====
            .addCase(updateUserRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.users.findIndex(u => u._id === action.payload.userId);
                if (index !== -1) {
                    state.users[index] = action.payload.data;
                }
                if (state.currentUser?._id === action.payload.userId) {
                    state.currentUser = action.payload.data;
                }
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearUserError, clearCurrentUser, setUserPage, setUserLimit } = userSlice.actions;
export default userSlice.reducer;