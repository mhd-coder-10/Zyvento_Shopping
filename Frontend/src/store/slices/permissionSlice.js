import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';

// ============================================================
// 1. CREATE PERMISSION - POST /admin/permissions
// ============================================================
export const createPermission = createAsyncThunk(
  'permission/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ApiService.createPermission(data);
      toast.success(response.data.message || 'Permission created successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create permission';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ============================================================
// 2. GET ALL PERMISSIONS - GET /admin/permissions
// ============================================================
export const getAllPermissions = createAsyncThunk(
  'permission/getAll',
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
// 3. GET PERMISSION BY ID - GET /admin/permissions/:id
// ============================================================
export const getPermissionById = createAsyncThunk(
  'permission/getById',
  async (permissionId, { rejectWithValue }) => {
    try {
      const response = await ApiService.getPermissionById(permissionId);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch permission';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ============================================================
// 4. UPDATE PERMISSION - PUT /admin/permissions/:id
// ============================================================
export const updatePermission = createAsyncThunk(
  'permission/update',
  async ({ permissionId, data }, { rejectWithValue }) => {
    try {
      const response = await ApiService.updatePermission(permissionId, data);
      toast.success(response.data.message || 'Permission updated successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update permission';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ============================================================
// 5. DELETE PERMISSION - DELETE /admin/permissions/:id
// ============================================================
export const deletePermission = createAsyncThunk(
  'permission/delete',
  async (permissionId, { rejectWithValue }) => {
    try {
      const response = await ApiService.deletePermission(permissionId);
      toast.success(response.data.message || 'Permission deleted successfully');
      return permissionId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete permission';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ============================================================
// 6. TOGGLE PERMISSION STATUS - PATCH /admin/permissions/:id/status
// ============================================================
export const togglePermissionStatus = createAsyncThunk(
  'permission/toggleStatus',
  async (permissionId, { rejectWithValue }) => {
    try {
      const response = await ApiService.togglePermissionStatus(permissionId);
      toast.success(response.data.message || 'Permission status toggled successfully');
      return { permissionId, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to toggle permission status';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ============================================================
// 7. GET PERMISSION MODULES - GET /admin/permissions/modules
// ============================================================
export const getPermissionModules = createAsyncThunk(
  'permission/getModules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getPermissionModules();
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch permission modules';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ============================================================
// 8. GET PERMISSIONS BY MODULE - GET /admin/permissions/module/:name
// ============================================================
export const getPermissionsByModule = createAsyncThunk(
  'permission/getByModule',
  async (moduleName, { rejectWithValue }) => {
    try {
      const response = await ApiService.getPermissionsByModule(moduleName);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch permissions by module';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ============================================================
// 9. GET PERMISSION ACTIONS - GET /admin/permissions/actions
// ============================================================
export const getPermissionActions = createAsyncThunk(
  'permission/getActions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getPermissionActions();
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch permission actions';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ============================================================
// 10. GET PERMISSION AUDIT LOGS - GET /admin/permissions/audit
// ============================================================
export const getPermissionAuditLogs = createAsyncThunk(
  'permission/getAuditLogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ApiService.getPermissionAuditLogs(params);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch audit logs';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ============================================================
// 11. GET PERMISSION AUDIT BY ID - GET /admin/permissions/audit/:id
// ============================================================
export const getPermissionAuditById = createAsyncThunk(
  'permission/getAuditById',
  async (auditId, { rejectWithValue }) => {
    try {
      const response = await ApiService.getPermissionAuditById(auditId);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch audit log';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
  permissions: [],
  currentPermission: null,
  modules: [],
  actions: [],
  auditLogs: [],
  currentAudit: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
};

// ============================================================
// SLICE
// ============================================================
const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    clearPermissionError: (state) => {
      state.error = null;
    },
    clearCurrentPermission: (state) => {
      state.currentPermission = null;
    },
    setPermissionPage: (state, action) => {
      state.page = action.payload;
    },
    setPermissionLimit: (state, action) => {
      state.limit = action.payload;
    },
    clearAuditLogs: (state) => {
      state.auditLogs = [];
      state.currentAudit = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== CREATE PERMISSION =====
      .addCase(createPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createPermission.rejected, (state, action) => {
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
        state.permissions = action.payload.permissions || action.payload || [];
        state.total = action.payload.total || 0;
      })
      .addCase(getAllPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== GET PERMISSION BY ID =====
      .addCase(getPermissionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPermission = action.payload;
      })
      .addCase(getPermissionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE PERMISSION =====
      .addCase(updatePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.permissions.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.permissions[index] = action.payload;
        }
        state.currentPermission = action.payload;
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== DELETE PERMISSION =====
      .addCase(deletePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = state.permissions.filter(p => p._id !== action.payload);
        state.total -= 1;
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== TOGGLE PERMISSION STATUS =====
      .addCase(togglePermissionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePermissionStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.permissions.findIndex(p => p._id === action.payload.permissionId);
        if (index !== -1) {
          state.permissions[index] = action.payload.data;
        }
        if (state.currentPermission?._id === action.payload.permissionId) {
          state.currentPermission = action.payload.data;
        }
      })
      .addCase(togglePermissionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== GET PERMISSION MODULES =====
      .addCase(getPermissionModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissionModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload || [];
      })
      .addCase(getPermissionModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== GET PERMISSIONS BY MODULE =====
      .addCase(getPermissionsByModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissionsByModule.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload || [];
      })
      .addCase(getPermissionsByModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== GET PERMISSION ACTIONS =====
      .addCase(getPermissionActions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissionActions.fulfilled, (state, action) => {
        state.loading = false;
        state.actions = action.payload || [];
      })
      .addCase(getPermissionActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== GET PERMISSION AUDIT LOGS =====
      .addCase(getPermissionAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissionAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.auditLogs = action.payload.auditLogs || action.payload || [];
        state.total = action.payload.total || 0;
      })
      .addCase(getPermissionAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== GET PERMISSION AUDIT BY ID =====
      .addCase(getPermissionAuditById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissionAuditById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAudit = action.payload;
      })
      .addCase(getPermissionAuditById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPermissionError,
  clearCurrentPermission,
  setPermissionPage,
  setPermissionLimit,
  clearAuditLogs,
} = permissionSlice.actions;

export default permissionSlice.reducer;