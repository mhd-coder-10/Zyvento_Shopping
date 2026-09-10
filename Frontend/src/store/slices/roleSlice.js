// ============================================================
// ROLE SLICE
// Description: Manages role and permission data state
// APIs Used:
//   - getAllRoles (GET /admin/roles) - Fetch all roles
//   - createRole (POST /admin/roles) - Create role
//   - updateRole (PUT /admin/roles/:id) - Update role
//   - deleteRole (DELETE /admin/roles/:id) - Delete role
//   - toggleRoleStatus (PATCH /admin/roles/:id/status) - Toggle status
//   - assignPermissionsToRole (POST /admin/roles/:id/permissions) - Assign permissions
//   - getRolePermissions (GET /admin/roles/:id/permissions) - Get role permissions
//   - assignRoleToUser (POST /admin/roles/assign) - Assign role to user
//   - revokeRoleFromUser (POST /admin/roles/revoke) - Revoke role from user
//   - getUserRoles (GET /admin/roles/user/:userId) - Get user roles
//   - getRoleHistory (GET /admin/roles/history/:userId) - Get role history
//   - getAllPermissions (GET /admin/permissions) - Get all permissions
// ============================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// GET ALL ROLES
// ============================================================
export const getAllRoles = createAsyncThunk(
    'roles/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.getAllRoles();
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch roles';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// CREATE ROLE
// ============================================================
export const createRole = createAsyncThunk(
    'roles/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.createRole(data);
            toast.success(response.data.message || 'Role created successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create role';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// UPDATE ROLE
// ============================================================
export const updateRole = createAsyncThunk(
    'roles/update',
    async ({ roleId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.updateRole(roleId, data);
            toast.success(response.data.message || 'Role updated successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update role';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// DELETE ROLE
// ============================================================
export const deleteRole = createAsyncThunk(
    'roles/delete',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await ApiService.deleteRole(roleId);
            toast.success(response.data.message || 'Role deleted successfully');
            return roleId;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete role';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// TOGGLE ROLE STATUS
// ============================================================
export const toggleRoleStatus = createAsyncThunk(
    'roles/toggleStatus',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await ApiService.toggleRoleStatus(roleId);
            toast.success(response.data.message || 'Role status toggled successfully');
            return { roleId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to toggle role status';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// ASSIGN PERMISSIONS TO ROLE
// ============================================================
export const assignPermissionsToRole = createAsyncThunk(
    'roles/assignPermissions',
    async ({ roleId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.assignPermissionsToRole(roleId, data);
            toast.success(response.data.message || 'Permissions assigned successfully');
            return { roleId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to assign permissions';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET ROLE PERMISSIONS
// ============================================================
export const getRolePermissions = createAsyncThunk(
    'roles/getPermissions',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await ApiService.getRolePermissions(roleId);
            return { roleId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch role permissions';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// ASSIGN ROLE TO USER
// ============================================================
export const assignRoleToUser = createAsyncThunk(
    'roles/assignToUser',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.assignRoleToUser(data);
            toast.success(response.data.message || 'Role assigned to user successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to assign role to user';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// REVOKE ROLE FROM USER
// ============================================================
export const revokeRoleFromUser = createAsyncThunk(
    'roles/revokeFromUser',
    async (data, { rejectWithValue }) => {
        try {
            const response = await ApiService.revokeRoleFromUser(data);
            toast.success(response.data.message || 'Role revoked from user successfully');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to revoke role from user';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET USER ROLES
// ============================================================
export const getUserRoles = createAsyncThunk(
    'roles/getUserRoles',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await ApiService.getUserRoles(userId);
            return { userId, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch user roles';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET ROLE HISTORY
// ============================================================
export const getRoleHistory = createAsyncThunk(
    'roles/getHistory',
    async ({ userId, params }, { rejectWithValue }) => {
        try {
            const response = await ApiService.getRoleHistory(userId, params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch role history';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// GET ALL PERMISSIONS
// ============================================================
export const getAllPermissions = createAsyncThunk(
    'roles/getAllPermissions',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ApiService.getAllPermissions(params);
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch permissions';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
    roles: [],
    currentRole: null,
    permissions: [],
    rolePermissions: [],
    userRoles: [],
    roleHistory: [],
    loading: false,
    error: null,
    total: 0,
};

// ============================================================
// SLICE
// ============================================================
const roleSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {
        clearRoleError: (state) => {
            state.error = null;
        },
        clearCurrentRole: (state) => {
            state.currentRole = null;
        },
        clearRolePermissions: (state) => {
            state.rolePermissions = [];
        },
        clearUserRoles: (state) => {
            state.userRoles = [];
        },
        clearRoleHistory: (state) => {
            state.roleHistory = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET ALL ROLES =====
            .addCase(getAllRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = action.payload || [];
                state.total = action.payload.length || 0;
            })
            .addCase(getAllRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== CREATE ROLE =====
            .addCase(createRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createRole.fulfilled, (state, action) => {
                state.loading = false;
                state.roles.unshift(action.payload);
                state.total += 1;
            })
            .addCase(createRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== UPDATE ROLE =====
            .addCase(updateRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.roles.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.roles[index] = action.payload;
                }
                state.currentRole = action.payload;
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== DELETE ROLE =====
            .addCase(deleteRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = state.roles.filter(r => r._id !== action.payload);
                state.total -= 1;
                if (state.currentRole?._id === action.payload) {
                    state.currentRole = null;
                }
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== TOGGLE ROLE STATUS =====
            .addCase(toggleRoleStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleRoleStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.roles.findIndex(r => r._id === action.payload.roleId);
                if (index !== -1) {
                    state.roles[index] = action.payload.data;
                }
                if (state.currentRole?._id === action.payload.roleId) {
                    state.currentRole = action.payload.data;
                }
            })
            .addCase(toggleRoleStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== ASSIGN PERMISSIONS TO ROLE =====
            .addCase(assignPermissionsToRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignPermissionsToRole.fulfilled, (state, action) => {
                state.loading = false;
                state.rolePermissions = action.payload.data || [];
                const index = state.roles.findIndex(r => r._id === action.payload.roleId);
                if (index !== -1) {
                    state.roles[index].permissions = action.payload.data;
                }
                if (state.currentRole?._id === action.payload.roleId) {
                    state.currentRole.permissions = action.payload.data;
                }
            })
            .addCase(assignPermissionsToRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET ROLE PERMISSIONS =====
            .addCase(getRolePermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRolePermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.rolePermissions = action.payload.data || [];
            })
            .addCase(getRolePermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== ASSIGN ROLE TO USER =====
            .addCase(assignRoleToUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignRoleToUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userRoles = action.payload || [];
            })
            .addCase(assignRoleToUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== REVOKE ROLE FROM USER =====
            .addCase(revokeRoleFromUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(revokeRoleFromUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userRoles = action.payload || [];
            })
            .addCase(revokeRoleFromUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET USER ROLES =====
            .addCase(getUserRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.userRoles = action.payload.data || [];
            })
            .addCase(getUserRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET ROLE HISTORY =====
            .addCase(getRoleHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRoleHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.roleHistory = action.payload || [];
            })
            .addCase(getRoleHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== GET ALL PERMISSIONS =====
            .addCase(getAllPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.permissions = action.payload || [];
            })
            .addCase(getAllPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearRoleError,
    clearCurrentRole,
    clearRolePermissions,
    clearUserRoles,
    clearRoleHistory,
} = roleSlice.actions;

export default roleSlice.reducer;