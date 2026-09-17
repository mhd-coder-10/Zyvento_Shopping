import axios from "axios";

const API_URL = import.meta.env.VITE_HOST_API_URL || 'http://localhost:5000/api';


// AXIOS INTERCEPTORS - Auto handle token 
// Request Interceptor - Attach token to every request
axios.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


let headers = {
    "Content-Type": "application/json",
};

let formDataHeaders = {
    "Content-Type": "multipart/form-data",
};

const getToken = () => {
    return localStorage.getItem("accessToken") || null;
};

const setAuthHeaders = () => {
    const token = getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    } else {
        delete headers["Authorization"];
    }
};


const ApiService = {

    // ============ AUTH MODULE ============

    // Register new user
    register: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/auth/register`, data, {
            headers: headers,
        });
    },

    // Login user
    login: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/auth/login`, data, {
            headers: headers,
        });
    },

    // Logout user
    logout: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/auth/logout`, data, {
            headers: headers,
        });
    },

    // Refresh access token
    refreshToken: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/auth/refresh-token`, data, {
            headers: headers,
        });
    },

    // Send OTP to email
    sendOtp: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/auth/send-otp`, data, {
            headers: headers,
        });
    },

    // Verify OTP
    verifyOtp: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/auth/verify-otp`, data, {
            headers: headers,
        });
    },

    // Reset password using token (POST method)
    resetPassword: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/auth/reset-password`, data, {
            headers: headers,
        });
    },

    // Change password (logged in user)
    changePassword: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/auth/change-password`, data, {
            headers: headers,
        });
    },

    // Forgot password (sends reset link to email)
    forgotPassword: (data) => {
        return axios.post(`${API_URL}/auth/forgot-password`, data);
    },

    // Get current user profile
    getProfile: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/auth/profile`, {
            headers: headers,
        });
    },

    // Update current user profile
    updateProfile: (data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/auth/profile`, data, {
            headers: headers,
        });
    },

    // Upload profile image
    uploadProfileImage: (formData) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/auth/profile-image`, formData, {
            headers: formDataHeaders,
        });
    },

    // Delete profile image
    deleteProfileImage: () => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/auth/profile-image`, {
            headers: headers,
        });
    },

    // Verify email using OTP
    verifyEmail: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/auth/verify-email`, data, {
            headers: headers,
        });
    },

    // Resend email verification
    resendVerification: () => {
        setAuthHeaders();
        return axios.post(`${API_URL}/auth/resend-verification`, {}, {
            headers: headers,
        });
    },


    // =========== ROLE MODULE ==============

    // Get all roles (Admin only)
    getAllRoles: (params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles`, { params, headers });
    },

    // Create role (Admin only)
    createRole: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles`, data, { headers });
    },

    // Get role by ID (Admin only)
    getRoleById: (roleId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles/${roleId}`, { headers });
    },

    // Get users assigned to a specific role
    getUsersByRole: (roleId, params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles/${roleId}/users`, { params, headers });
    },

    // Update role (Admin only)
    updateRole: (roleId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/roles/${roleId}`, data, { headers });
    },

    // Delete role (Admin only)
    deleteRole: (roleId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/roles/${roleId}`, { headers });
    },

    // Toggle role status (Admin only)
    toggleRoleStatus: (roleId) => {
        setAuthHeaders();
        return axios.patch(`${API_URL}/admin/roles/${roleId}/status`, {}, { headers });
    },

    // Assign permissions to role (Admin only)
    assignPermissionsToRole: (roleId, data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles/${roleId}/permissions`, data, { headers });
    },

    // Remove permission from role (Admin only)
    removePermissionFromRole: (roleId, permissionId) => {
        setAuthHeaders();
        return axios.delete(
            `${API_URL}/admin/roles/${roleId}/permissions/${permissionId}`,
            { headers }
        );
    },

    // Get role permissions (Admin only)
    getRolePermissions: (roleId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles/${roleId}/permissions`, { headers });
    },

    // Assign role to user (Admin only)
    assignRoleToUser: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles/assign`, data, { headers });
    },

    // Revoke role from user (Admin only)
    revokeRoleFromUser: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles/revoke`, data, { headers });
    },

    // Bulk assign roles to users (Admin only)
    bulkAssignRoles: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles/bulk-assign`, data, { headers });
    },

    // Get user roles (Admin only)
    getUserRoles: (userId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles/user/${userId}`, { headers });
    },

    // Get user permissions (Admin only)
    getUserPermissions: (userId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles/user/${userId}/permissions`, { headers });
    },

    // Get role history (Admin only)
    getRoleHistory: (userId, params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles/history/${userId}`, { params, headers });
    },

    // =============== PERMISSION MODULE ================

    // Create permission (Admin only)
    createPermission: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/permissions`, data, { headers });
    },

    // Get all permissions (Admin only)
    getAllPermissions: (params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions`, { params, headers });
    },

    // Get permission by ID (Admin only)
    getPermissionById: (permissionId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/${permissionId}`, { headers });
    },

    // Update permission (Admin only)
    updatePermission: (permissionId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/permissions/${permissionId}`, data, { headers });
    },

    // Delete permission (Admin only)
    deletePermission: (permissionId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/permissions/${permissionId}`, { headers });
    },

    // Toggle permission status (Admin only)
    togglePermissionStatus: (permissionId) => {
        setAuthHeaders();
        return axios.patch(
            `${API_URL}/admin/permissions/${permissionId}/status`,
            {},
            { headers }
        );
    },

    // Get all permission modules (Admin only)
    getPermissionModules: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/modules`, { headers });
    },

    // Get permissions by module (Admin only)
    getPermissionsByModule: (moduleName) => {
        setAuthHeaders();
        return axios.get(
            `${API_URL}/admin/permissions/module/${moduleName}`,
            { headers }
        );
    },

    // Get all permission actions (Admin only)
    getPermissionActions: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/actions`, { headers });
    },

    // Get permission audit logs (Admin only)
    getPermissionAuditLogs: (params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/audit`, { params, headers });
    },

    // Get permission audit log by ID (Admin only)
    getPermissionAuditById: (auditId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/audit/${auditId}`, { headers });
    },

    // Get roles that use a specific permission
    getRolesByPermission: (permissionId, params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/${permissionId}/roles`, { params, headers });
    },


    // ============= ADMIN MODULE ===================

    // 1 DASHBORAD APIs ------------

    adminGetAllOrders: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/orders`, {
            headers: headers,
            params: params,
        });
    },

    getDashboardOverview: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/dashboard/overview`, { headers });
    },

    getDashboardStatistics: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/dashboard/statistics`, { headers });
    },

    getDashboardCharts: (period = 'weekly') => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/dashboard/charts?period=${period}`, { headers });
    },

    getRecentActivity: (limit = 10) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/dashboard/recent-activity?limit=${limit}`, { headers });
    },


    // 2  USER MANAGEMENT APIs ----------------

    // Get all users (with filters, pagination)
    getAllUsers: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/users`, {
            headers: headers,
            params: params,
        });
    },

    // Get user stats (for summary cards)
    getUserStats: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/users/stats`, {
            headers: headers,
        });
    },

    // Get user by ID or user_code
    getUserById: (identifier) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/users/${identifier}`, {
            headers: headers,
        });
    },

    // Create user (admin)
    createUserByAdmin: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/users`, data, {
            headers: headers,
        });
    },

    // Update user (admin)
    updateUserByAdmin: (identifier, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/users/${identifier}`, data, {
            headers: headers,
        });
    },

    // Delete user (admin)
    deleteUserByAdmin: (identifier) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/users/${identifier}`, {
            headers: headers,
        });
    },

    // Update user status
    updateUserStatus: (identifier, data) => {
        setAuthHeaders();
        return axios.patch(`${API_URL}/admin/users/${identifier}/status`, data, {
            headers: headers,
        });
    },

    // ROLES API
    // Get user's assigned roles
    getUserRoles: (userId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles/user/${userId}`, {
            headers: headers,
        });
    },

    // Assign roles to user
    assignRoleToUser: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles/assign`, data, {
            headers: headers,
        });
    },

    // Revoke roles from user
    revokeRoleFromUser: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles/revoke`, data, {
            headers: headers,
        });
    },


    // 3 SUB-ADMIN APIs ----------------

    // Get available users for Sub-Admin creation
    getAvailableUsersForSubAdmin: (params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/sub-admins/available-users`, { params, headers });
    },

    // Get all sub-admins (paginated + filters)
    getAllSubAdmins: (params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/sub-admins`, { params, headers });
    },

    // Get sub-admin stats (for home page cards)
    getSubAdminStats: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/sub-admins/stats`, { headers });
    },

    // Get deleted sub-admins (for Deleted tab)
    getDeletedSubAdmins: (params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/sub-admins/deleted`, { params, headers });
    },

    // Get sub-admin by code (details + edit page)
    getSubAdminByCode: (subAdminCode) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/sub-admins/${subAdminCode}`, { headers });
    },

    // Get sub-admin history (status + role)
    getSubAdminHistory: (subAdminCode) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/sub-admins/${subAdminCode}/history`, { headers });
    },

    // Create sub-admin
    createSubAdmin: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/sub-admins`, data, { headers });
    },

    // Update sub-admin details
    updateSubAdminDetails: (subAdminCode, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/sub-admins/${subAdminCode}`, data, { headers });
    },

    // Update sub-admin status (single route - handles all transitions)
    updateSubAdminStatus: (subAdminCode, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/sub-admins/${subAdminCode}/status`, data, { headers });
    },

    // Restore deleted sub-admin (sets status to inactive for safety)
    restoreSubAdmin: (subAdminCode) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/sub-admins/${subAdminCode}/restore`, {}, { headers });
    },

    // Delete sub-admin (soft delete - blocks user account)
    deleteSubAdmin: (subAdminCode) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/sub-admins/${subAdminCode}`, { headers });
    },


    // 4 SELLER MANAGEMENT APIs -------------

    // Get seller stats
    getSellerStats: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/sellers/stats`, { headers });
    },

    // Export sellers to CSV
    exportSellers: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/sellers/export`, {
            headers,
            params,
            responseType: 'blob',
        });
    },

    // Get all sellers (with filters)
    getAllSellers: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/sellers`, { headers, params });
    },

    // Get seller details (accepts both _id and seller_code)
    getSellerByCode: (sellerIdentifier) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/sellers/${sellerIdentifier}`, { headers });
    },

    // Update seller details (accepts both _id and seller_code)
    updateSellerDetails: (sellerCode, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/sellers/${sellerCode}`, data, { headers });
    },

    // Update seller status (single route - handles all transitions)
    updateSellerStatus: (sellerIdentifier, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/sellers/${sellerIdentifier}/status`, data, { headers });
    },

    // Delete seller (cascade - removes seller + user + products + employees + reviews)
    deleteSeller: (sellerIdentifier) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/sellers/${sellerIdentifier}`, { headers });
    },


    // ============ EMPLOYEE MANAGEMENT APIs ============

    // Get all employees (paginated + filters)
    getAllEmployees: (params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees`, { params, headers });
    },

    // Get employee stats
    getEmployeeStats: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/stats`, { headers });
    },

    // Get available users for employee creation (searchable email dropdown)
    getAvailableUsersForEmployee: (params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/available-users`, { params, headers });
    },

    // Get deleted employees (Deleted tab)
    getDeletedEmployees: (params = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/deleted`, { params, headers });
    },

    // Get employee by code
    getEmployeeByCode: (employeeCode) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/${employeeCode}`, { headers });
    },

    // Create employee
    createEmployee: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/employees`, data, { headers });
    },

    // Update employee details
    updateEmployeeDetails: (employeeCode, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/employees/${employeeCode}`, data, { headers });
    },

    // Update employee status
    updateEmployeeStatus: (employeeCode, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/employees/${employeeCode}/status`, data, { headers });
    },

    // Restore deleted employee
    restoreEmployee: (employeeCode) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/employees/${employeeCode}/restore`, {}, { headers });
    },

    // Delete employee (soft)
    deleteEmployee: (employeeCode) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/employees/${employeeCode}`, { headers });
    },


    // ============ REVIEW MANAGEMENT APIs ============

    // Get review stats
    getReviewStats: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/reviews/stats`, { headers });
    },

    // Get all reviews (with filters)
    getAllReviews: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/reviews`, { headers, params });
    },

    // Get review by ID
    getReviewById: (reviewId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/reviews/${reviewId}`, { headers });
    },

    // Moderate review (publish/hide/reject/flag/unflag)
    moderateReview: (reviewId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/reviews/${reviewId}/moderate`, data, { headers });
    },




    // 4 PRODUCT MANAGEMENT APIs -------------------

    product: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/products`, data);
    },

    // Get Product by Code 
    getProductByCode: (productCode) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/products/${productCode}`);
    },


    // Get Product Stats
    getProductStats: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/products/stats`);
    },

    // Get All Products
    getAllProducts: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/products`, { params });
    },

    // Get Categories for Dropdown
    getProductCategories: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/products/categories`);
    },

    // Create Product createProd
    // Update Product by Code
    updateProduct: (productCode, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/products/${productCode}`, data);
    },

    // Delete Product by Code
    deleteProduct: (productCode) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/products/${productCode}`);
    },

    // Approve Product by Code
    approveProduct: (productCode) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/products/${productCode}/approve`);
    },

    // Reject Product by Code
    rejectProduct: (productCode, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/products/${productCode}/reject`, data);
    },

    // Suspend Product by Code
    suspendProduct: (productCode, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/products/${productCode}/suspend`, data);
    },

    // Activate Product by Code
    activateProduct: (productCode) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/products/${productCode}/activate`);
    },

    // Get Product Reviews by Code (FIXED URL - yeh maine change kiya hai)
    getProductReviews: (productCode, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/products/${productCode}/reviews`, { params });
    },

    // Get Product Orders by Code
    getProductOrders: (productCode, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/products/${productCode}/orders`, { params });
    },

    // Export Products
    exportProducts: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/products/export`, { params, responseType: 'blob' });
    },

    // CATEGORY MANAGEMENT APIS -----------

    // All Category
    getAllCategories: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/categories`, { headers, params });
    },

    // Category Details
    getCategoryByCode: (categoryCode) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/categories/${categoryCode}`, { headers });
    },

    // Create category
    createCategory: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/categories`, data, { headers });
    },

    // Update category
    updateCategory: (categoryCode, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/categories/${categoryCode}`, data, { headers });
    },

    // Delete Category
    deleteCategory: (categoryCode) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/categories/${categoryCode}`, { headers });
    },

    // SUB-CATEGORY MSNAGEMENT APIs ----------------

    // All Sybub-categopry
    getAllSubCategories: (params) => {
        return axios.get(`${API_URL}/admin/sub-categories`, { params });
    },

    // Sub-Category Details
    getSubCategoryByCode: (code) => {
        return axios.get(`${API_URL}/admin/sub-categories/${code}`);
    },

    // Creatre Sub-Category
    createSubCategory: (data) => {
        return axios.post(`${API_URL}/admin/sub-categories`, data);
    },

    // update Sub-Category
    updateSubCategory: (code, data) => {
        return axios.put(`${API_URL}/admin/sub-categories/${code}`, data);
    },

    // Delete Sub-Category
    deleteSubCategory: (code) => {
        return axios.delete(`${API_URL}/admin/sub-categories/${code}`);
    },

    // INVENTORY MANAGEMENT APIs ---------

    // All Inventory
    getAllInventory: (params) => {
        return axios.get(`${API_URL}/admin/inventory`, { params });
    },

    // Update Inventory
    updateInventoryStock: (inventoryId, data) => {
        return axios.put(`${API_URL}/admin/inventory/${inventoryId}/stock`, data);
    },

    // ORDERS MANAGEMENT APIs ---------
    // All Orders
    getAllOrders: (params) => {
        return axios.get(`${API_URL}/admin/orders`, { params });
    },

    // Order Detaials
    getOrderByCode: (orderCode) => {
        return axios.get(`${API_URL}/admin/orders/${orderCode}`);
    },

    // Update Order & payment Status
    updateOrderStatus: (orderCode, data) => {
        return axios.put(`${API_URL}/admin/orders/${orderCode}/status`, data);
    },

    //  ORDERS-RETURNS APIs ----------

    // All Returns
    getAllReturns: (params) => {
        return axios.get(`${API_URL}/admin/returns`, { params });
    },

    // Reutn Order details
    getReturnByOrderCode: (orderCode) => {
        return axios.get(`${API_URL}/admin/returns/${orderCode}`);
    },

    // Update Order return status
    updateReturnStatus: (orderCode, data) => {
        return axios.put(`${API_URL}/admin/returns/${orderCode}/status`, data);
    },

    // Export Return PDF
    exportReturnsPDF: () => {
        return axios.get(`${API_URL}/admin/returns/export/pdf`, { responseType: 'blob' });
    },


    // REVIEW APIs ---------------
    // getReviewDashboard: () => {
    //     return axios.get(`${API_URL}/admin/reviews/dashboard`);
    // },

    // getAllReviews: (params) => {
    //     return axios.get(`${API_URL}/admin/reviews`, { params });
    // },

    // getReviewDetails: (reviewCode) => {
    //     return axios.get(`${API_URL}/admin/reviews/${reviewCode}`);
    // },

    // moderateReview: (reviewCode, data) => {
    //     return axios.patch(`${API_URL}/admin/reviews/${reviewCode}/status`, data);
    // },

    // getAllReviewReports: (params) => {
    //     return axios.get(`${API_URL}/admin/reviews/reports`, { params });
    // },

    // updateReviewReport: (reportId, data) => {
    //     return axios.patch(`${API_URL}/admin/reviews/reports/${reportId}`, data);
    // },

    // getReviewAnalytics: () => {
    //     return axios.get(`${API_URL}/admin/reviews/analytics`);
    // },


    // PAYMENTS MANAGEMENT APIs ---------

    // Payment Summary (Accounting)
    getPaymentSummary: (params) => {
        return axios.get(`${API_URL}/admin/payments/summary`, { params });
    },

    // Export Accounting PDF
    exportAccountingPDF: (params) => {
        return axios.get(`${API_URL}/admin/payments/export/pdf`, { params, responseType: 'blob' });
    },

    // All Payments
    getAllPayments: (params) => {
        return axios.get(`${API_URL}/admin/payments`, { params });
    },

    // Payment Details 
    getPaymentByCode: (paymentCode) => {
        return axios.get(`${API_URL}/admin/payments/${paymentCode}`);
    },

    // Update Payment Status
    updatePaymentStatus: (paymentCode, data) => {
        return axios.put(`${API_URL}/admin/payments/${paymentCode}/status`, data);
    },

    // COMPANY FINANCE APIS -------------

    // All Entries
    getFinanceEntries: (params) => {
        return axios.get(`${API_URL}/admin/finance`, { params });
    },

    // Add Entry
    addFinanceEntry: (data) => {
        return axios.post(`${API_URL}/admin/finance`, data);
    },

    // Update Entry
    updateFinanceEntry: (entryId, data) => {
        return axios.put(`${API_URL}/admin/finance/${entryId}`, data);
    },

    // Delete Entry
    deleteFinanceEntry: (entryId) => {
        return axios.delete(`${API_URL}/admin/finance/${entryId}`);
    },

    // Export Report
    exportFinancePDF: () => {
        return axios.get(`${API_URL}/admin/finance/export/pdf`, { responseType: 'blob' });
    },

    // Export Transaction Report
    exportTransactionsPDF: () => {
        return axios.get(`${API_URL}/admin/transactions/export/pdf`, { responseType: 'blob' });
    },

    // TRANSACTION MANAGEMENT APIs ---------

    // All Transacions
    getAllTransactions: (params) => {
        return axios.get(`${API_URL}/admin/transactions`, { params });
    },

    // Transaction Details
    getTransactionByCode: (transactionCode) => {
        return axios.get(`${API_URL}/admin/transactions/${transactionCode}`);
    },

    // NOTIFICATION MANAGEMENT APIs ----------

    // All Notifications
    getAllNotifications: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/notifications`, { params });
    },

    // Get Notification by Code
    getNotificationByCode: (notificationCode) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/notifications/${notificationCode}`);
    },

    // Mark Notification as a read
    markNotificationAsRead: (notificationCode) => {
        setAuthHeaders();
        return axios.patch(`${API_URL}/admin/notifications/${notificationCode}/read`);
    },

    // Mark all Notification as a read
    markAllNotificationsAsRead: () => {
        setAuthHeaders();
        return axios.patch(`${API_URL}/admin/notifications/read-all`);
    },

    // Delele Notifications
    deleteNotification: (notificationCode) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/notifications/${notificationCode}`);
    },

    // Sent / create Notification
    sendBroadcastNotification: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/notifications/send`, data);
    },

    // COUPON APIs -----------

    // Get All Coupns
    getAllCoupons: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/coupons`, { params });
    },

    // Coupon Details
    getCouponByCode: (code) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/coupons/${code}`);
    },

    // Create ACoupon
    createCoupon: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/coupons`, data);
    },

    // Update Coupon
    updateCoupon: (code, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/coupons/${code}`, data);
    },

    // Delete Coupon
    deleteCoupon: (code) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/coupons/${code}`);
    },


    // REPORTS ----------------------------

    getReportData: (reportType, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/reports/${reportType}`, { params });
    },

    exportReportPDF: (reportType, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/reports/${reportType}/export/pdf`, { params, responseType: 'blob' });
    },

    // ===== SETTINGS APIs  =========

    get: (url, config = {}) => {
        setAuthHeaders();
        return axios.get(`${API_URL}${url}`, { ...config, headers });
    },
    post: (url, data, config = {}) => {
        setAuthHeaders();
        return axios.post(`${API_URL}${url}`, data, { ...config, headers });
    },
    put: (url, data, config = {}) => {
        setAuthHeaders();
        return axios.put(`${API_URL}${url}`, data, { ...config, headers });
    },
    delete: (url, config = {}) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}${url}`, { ...config, headers });
    },


    // ===== PUBLIC APIs  =========

    // All Active Categories
    getActiveCategories: () => {
        return axios.get(`${API_URL}/public/active`)
    },

    // Get unread notifications
    getUnreadNotifications: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/notification/unread`, {
            headers: headers,
            params: params,
        });
    },



    // ============ CUSTOMER ADDRESS MODULE ============

    // Create address
    createAddress: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/address`, data, {
            headers: headers,
        });
    },

    // Get all addresses
    getAddresses: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/address`, {
            headers: headers,
        });
    },

    // Get address by ID
    getAddressById: (addressId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/address/${addressId}`, {
            headers: headers,
        });
    },

    // Update address
    updateAddress: (addressId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/address/${addressId}`, data, {
            headers: headers,
        });
    },

    // Delete address
    deleteAddress: (addressId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/address/${addressId}`, {
            headers: headers,
        });
    },

    // Set default address
    setDefaultAddress: (addressId) => {
        setAuthHeaders();
        return axios.patch(`${API_URL}/address/${addressId}/default`, {}, {
            headers: headers,
        });
    },

    // Get default address
    getDefaultAddress: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/address/default`, {
            headers: headers,
        });
    },

    // ============ CUSTOMER CART MODULE ============

    // Get cart
    getCart: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/cart`, {
            headers: headers,
        });
    },

    // Add item to cart
    addToCart: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/cart/add`, data, {
            headers: headers,
        });
    },

    // Update cart item quantity
    updateCartItem: (productId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/cart/update/${productId}`, data, {
            headers: headers,
        });
    },

    // Remove item from cart
    removeFromCart: (productId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/cart/remove/${productId}`, {
            headers: headers,
        });
    },

    // Clear cart
    clearCart: () => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/cart/clear`, {
            headers: headers,
        });
    },

    // Get cart count
    getCartCount: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/cart/count`, {
            headers: headers,
        });
    },

    // Apply coupon to cart
    applyCoupon: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/cart/apply-coupon`, data, {
            headers: headers,
        });
    },

    // Remove coupon from cart
    removeCoupon: () => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/cart/remove-coupon`, {
            headers: headers,
        });
    },

    // ============ CUSTOMER WISHLIST MODULE ============

    // Get wishlist
    getWishlist: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/wishlist`, {
            headers: headers,
            params: params,
        });
    },

    // Add to wishlist
    addToWishlist: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/wishlist/add`, data, {
            headers: headers,
        });
    },

    // Remove from wishlist
    removeFromWishlist: (productId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/wishlist/remove/${productId}`, {
            headers: headers,
        });
    },

    // Clear wishlist
    clearWishlist: () => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/wishlist/clear`, {
            headers: headers,
        });
    },

    // Check if product is in wishlist
    checkWishlist: (productId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/wishlist/check/${productId}`, {
            headers: headers,
        });
    },

    // Move item to cart
    moveToCart: (productId, data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/wishlist/move-to-cart/${productId}`, data, {
            headers: headers,
        });
    },

    // Move all items to cart
    moveAllToCart: () => {
        setAuthHeaders();
        return axios.post(`${API_URL}/wishlist/move-all-to-cart`, {}, {
            headers: headers,
        });
    },



    // ============ PAYMENT MODULE ============

    // Initiate payment
    initiatePayment: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/payment/initiate`, data, {
            headers: headers,
        });
    },

    // Confirm payment
    confirmPayment: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/payment/confirm`, data, {
            headers: headers,
        });
    },

    // Get payment status
    getPaymentStatus: (paymentId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/payment/${paymentId}/status`, {
            headers: headers,
        });
    },

    // Get user payments
    getUserPayments: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/payment/user/payments`, {
            headers: headers,
            params: params,
        });
    },

    // Get user transactions
    getUserTransactions: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/payment/user/transactions`, {
            headers: headers,
            params: params,
        });
    },

    // Request refund
    requestRefund: (paymentId, data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/payment/${paymentId}/refund`, data, {
            headers: headers,
        });
    },

    // Get refund status
    getRefundStatus: (refundId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/payment/refund/${refundId}/status`, {
            headers: headers,
        });
    },

    // Get seller payments
    getSellerPayments: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/payment/seller/payments`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller transactions
    getSellerTransactions: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/payment/seller/transactions`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller payment summary
    getSellerPaymentSummary: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/payment/seller/summary`, {
            headers: headers,
        });
    },

    // Get all payments (Admin)
    adminGetAllPayments: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/payment/admin/all`, {
            headers: headers,
            params: params,
        });
    },

    // Get all transactions (Admin)
    adminGetAllTransactions: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/payment/admin/transactions`, {
            headers: headers,
            params: params,
        });
    },

    // Admin process refund
    adminProcessRefund: (paymentId, data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/payment/admin/${paymentId}/refund`, data, {
            headers: headers,
        });
    },

    // Get payment statistics (Admin)
    getPaymentStatistics: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/payment/admin/statistics`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller payment summary (Admin)
    adminGetSellerPaymentSummary: (sellerId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/payment/admin/seller/${sellerId}/summary`, {
            headers: headers,
        });
    },

    // Payment webhook (Public)
    paymentWebhook: (data) => {
        return axios.post(`${API_URL}/payment/webhook`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    },

    // ============ REPORT MODULE ============

    // Get seller sales report
    getSellerSalesReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/seller/sales`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller order report
    getSellerOrderReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/seller/orders`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller product report
    getSellerProductReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/seller/products`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller performance report
    getSellerPerformanceReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/seller/performance`, {
            headers: headers,
            params: params,
        });
    },

    // Get admin overview report
    getAdminOverviewReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/admin/overview`, {
            headers: headers,
            params: params,
        });
    },

    // Get admin revenue report
    getAdminRevenueReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/admin/revenue`, {
            headers: headers,
            params: params,
        });
    },

    // Get admin seller report
    getAdminSellerReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/admin/sellers`, {
            headers: headers,
            params: params,
        });
    },

    // Get admin order report
    getAdminOrderReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/admin/orders`, {
            headers: headers,
            params: params,
        });
    },

    // Get admin product report
    getAdminProductReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/admin/products`, {
            headers: headers,
            params: params,
        });
    },

    // Get admin user report
    getAdminUserReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/admin/users`, {
            headers: headers,
            params: params,
        });
    },

    // Get admin payment report
    getAdminPaymentReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/admin/payments`, {
            headers: headers,
            params: params,
        });
    },

    // Get sub-admin seller report
    getSubAdminSellerReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/sub-admin/sellers`, {
            headers: headers,
            params: params,
        });
    },

    // Get sub-admin order report
    getSubAdminOrderReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/sub-admin/orders`, {
            headers: headers,
            params: params,
        });
    },

    // Get analytics dashboard
    getAnalyticsDashboard: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/analytics`, {
            headers: headers,
            params: params,
        });
    },

    // Get real-time analytics
    getRealtimeAnalytics: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/analytics/realtime`, {
            headers: headers,
        });
    },

    // Export report to CSV
    exportCSV: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/export/csv`, {
            headers: headers,
            params: params,
            responseType: 'blob',
        });
    },

    // Export report to PDF
    exportPDF: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/export/pdf`, {
            headers: headers,
            params: params,
            responseType: 'blob',
        });
    },

    // Export report to Excel
    exportExcel: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/export/excel`, {
            headers: headers,
            params: params,
            responseType: 'blob',
        });
    },

    // Create scheduled report (Admin only)
    createScheduledReport: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/report/schedule`, data, {
            headers: headers,
        });
    },

    // Get scheduled reports (Admin only)
    getScheduledReports: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/schedule`, {
            headers: headers,
            params: params,
        });
    },

    // Update scheduled report (Admin only)
    updateScheduledReport: (scheduleId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/report/schedule/${scheduleId}`, data, {
            headers: headers,
        });
    },

    // Delete scheduled report (Admin only)
    deleteScheduledReport: (scheduleId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/report/schedule/${scheduleId}`, {
            headers: headers,
        });
    },

    // Run scheduled report now (Admin only)
    runScheduledReportNow: (scheduleId) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/report/schedule/${scheduleId}/run`, {}, {
            headers: headers,
        });
    },

    // Generate custom report (Admin only)
    generateCustomReport: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/report/custom`, data, {
            headers: headers,
        });
    },

    // Get saved custom reports (Admin only)
    getSavedCustomReports: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/custom/saved`, {
            headers: headers,
            params: params,
        });
    },

    // Save custom report template (Admin only)
    saveCustomReportTemplate: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/report/custom/save`, data, {
            headers: headers,
        });
    },

    // Get custom report by ID (Admin only)
    getCustomReportById: (reportId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/report/custom/${reportId}`, {
            headers: headers,
        });
    },

    // ============ REVIEW MODULE ============

    // Get product reviews (Public)
    getProductReviews: (productId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/review/product/${productId}`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller reviews (Public)
    getSellerReviews: (sellerId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/review/seller/${sellerId}`, {
            headers: headers,
            params: params,
        });
    },

    // Get review statistics (Public)
    getReviewStatistics: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/review/statistics`, {
            headers: headers,
            params: params,
        });
    },

    // Create review (Customer only)
    createReview: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/review`, data, {
            headers: headers,
        });
    },

    // Update own review (Customer only)
    updateReview: (reviewId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/review/${reviewId}`, data, {
            headers: headers,
        });
    },

    // Delete own review (Customer only)
    deleteOwnReview: (reviewId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/review/${reviewId}`, {
            headers: headers,
        });
    },

    // Get user's own reviews (Customer only)
    getUserReviews: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/review/my-reviews`, {
            headers: headers,
            params: params,
        });
    },

    // Mark review as helpful (Customer only)
    markReviewHelpful: (reviewId) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/review/${reviewId}/helpful`, {}, {
            headers: headers,
        });
    },

    // Get seller's product reviews (Seller only)
    getSellerProductReviews: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/review/seller-products`, {
            headers: headers,
            params: params,
        });
    },

    // Approve/reject review (Admin only)
    approveReview: (reviewId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/review/${reviewId}/approve`, data, {
            headers: headers,
        });
    },

    // Get all reviews (Admin only)
    adminGetAllReviews: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/review/admin/all`, {
            headers: headers,
            params: params,
        });
    },

    // Get review report (Admin only)
    getReviewReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/review/admin/report`, {
            headers: headers,
            params: params,
        });
    },

    // Admin delete review (Admin only)
    adminDeleteReview: (reviewId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/review/admin/${reviewId}`, {
            headers: headers,
        });
    },

    // ============ SUB-ADMIN MODULE ============

    // Get sub-admin dashboard
    getSubAdminDashboard: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/dashboard`, {
            headers: headers,
        });
    },

    // Get sub-admin dashboard statistics
    getSubAdminDashboardStats: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/dashboard/statistics`, {
            headers: headers,
        });
    },

    // Get sub-admin profile
    getSubAdminProfile: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/profile`, {
            headers: headers,
        });
    },

    // Update sub-admin profile
    updateSubAdminProfile: (data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/sub-admin/profile`, data, {
            headers: headers,
        });
    },

    // Get sellers (Sub-Admin)
    getSubAdminSellers: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/sellers`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller details (Sub-Admin)
    getSubAdminSellerDetails: (sellerId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/sellers/${sellerId}`, {
            headers: headers,
        });
    },

    // Approve seller (Sub-Admin)
    approveSellerBySubAdmin: (sellerId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/sub-admin/sellers/${sellerId}/approve`, data, {
            headers: headers,
        });
    },

    // Reject seller (Sub-Admin)
    rejectSellerBySubAdmin: (sellerId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/sub-admin/sellers/${sellerId}/reject`, data, {
            headers: headers,
        });
    },

    // Suspend seller (Sub-Admin)
    suspendSellerBySubAdmin: (sellerId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/sub-admin/sellers/${sellerId}/suspend`, data, {
            headers: headers,
        });
    },

    // Get employees (Sub-Admin)
    getSubAdminEmployees: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/employees`, {
            headers: headers,
            params: params,
        });
    },

    // Get employee details (Sub-Admin)
    getSubAdminEmployeeDetails: (employeeId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/employees/${employeeId}`, {
            headers: headers,
        });
    },

    // Get orders (Sub-Admin)
    getSubAdminOrders: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/orders`, {
            headers: headers,
            params: params,
        });
    },

    // Get order details (Sub-Admin)
    getSubAdminOrderDetails: (orderId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/orders/${orderId}`, {
            headers: headers,
        });
    },

    // Get overview report (Sub-Admin)
    getSubAdminOverviewReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/reports/overview`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller performance report (Sub-Admin)
    getSubAdminSellerPerformanceReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/reports/seller-performance`, {
            headers: headers,
            params: params,
        });
    },

    // Get order analytics report (Sub-Admin)
    getSubAdminOrderAnalyticsReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/reports/order-analytics`, {
            headers: headers,
            params: params,
        });
    },

    // Get sub-admin notifications
    getSubAdminNotifications: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/notifications`, {
            headers: headers,
            params: params,
        });
    },

    // Mark sub-admin notification as read
    markSubAdminNotificationRead: (notificationId) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/sub-admin/notifications/${notificationId}/read`, {}, {
            headers: headers,
        });
    },

    // Mark all sub-admin notifications as read
    markAllSubAdminNotificationsRead: () => {
        setAuthHeaders();
        return axios.put(`${API_URL}/sub-admin/notifications/read-all`, {}, {
            headers: headers,
        });
    },

    // Get sub-admin activity logs
    getSubAdminActivityLogs: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/sub-admin/activity-logs`, {
            headers: headers,
            params: params,
        });
    },

    // ============ SELLER MODULE ============

    // Get seller public profile (Public)
    getSellerPublicProfile: (sellerId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/public/${sellerId}`, {
            headers: headers,
        });
    },

    // Get seller products (Public)
    getSellerPublicProducts: (sellerId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/${sellerId}/products`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller reviews (Public)
    getSellerPublicReviews: (sellerId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/${sellerId}/reviews`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller profile
    getSellerProfile: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/profile`, {
            headers: headers,
        });
    },

    // Update seller profile
    updateSellerProfile: (data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/seller/profile`, data, {
            headers: headers,
        });
    },

    // Get seller dashboard
    getSellerDashboard: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/dashboard`, {
            headers: headers,
        });
    },

    // Get seller dashboard statistics
    getSellerDashboardStats: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/dashboard/statistics`, {
            headers: headers,
            params: params,
        });
    },

    // Upload seller document
    uploadSellerDocument: (formData) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/seller/documents`, formData, {
            headers: formDataHeaders,
        });
    },

    // Delete seller document
    deleteSellerDocument: (documentId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/seller/documents/${documentId}`, {
            headers: headers,
        });
    },

    // Get seller documents
    getSellerDocuments: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/documents`, {
            headers: headers,
        });
    },

    // Get seller's products
    getSellerMyProducts: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/products`, {
            headers: headers,
            params: params,
        });
    },

    // Create product (Seller)
    createProductBySeller: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/seller/products`, data, {
            headers: headers,
        });
    },

    // Get seller orders
    getSellerMyOrders: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/orders`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller order details
    getSellerMyOrderDetails: (orderId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/orders/${orderId}`, {
            headers: headers,
        });
    },

    // Update order status (Seller)
    updateOrderStatusBySeller: (orderId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/seller/orders/${orderId}/status`, data, {
            headers: headers,
        });
    },

    // Get seller employees
    getSellerEmployees: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/employees`, {
            headers: headers,
            params: params,
        });
    },

    // Create employee (Seller)
    createEmployeeBySeller: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/seller/employees`, data, {
            headers: headers,
        });
    },

    // Update employee (Seller)
    updateEmployeeBySeller: (employeeId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/seller/employees/${employeeId}`, data, {
            headers: headers,
        });
    },

    // Delete employee (Seller)
    deleteEmployeeBySeller: (employeeId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/seller/employees/${employeeId}`, {
            headers: headers,
        });
    },

    // Get seller performance report
    getSellerPerformanceReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/reports/performance`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller sales report
    getSellerSalesReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/reports/sales`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller analytics
    getSellerAnalytics: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/reports/analytics`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller settings
    getSellerSettings: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/settings`, {
            headers: headers,
        });
    },

    // Update seller settings
    updateSellerSettings: (data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/seller/settings`, data, {
            headers: headers,
        });
    },

    // ============ SELLER APPROVAL MODULE ============

    // Get pending sellers (Admin only)
    getPendingSellers: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/approval/pending`, {
            headers: headers,
            params: params,
        });
    },

    // Get all sellers with filters (Admin only)
    getApprovalSellers: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/approval`, {
            headers: headers,
            params: params,
        });
    },

    // Get seller details for approval (Admin only)
    getSellerForApproval: (sellerId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/approval/${sellerId}`, {
            headers: headers,
        });
    },

    // Approve seller (Admin only)
    approveSeller: (sellerId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/seller/approval/${sellerId}/approve`, data, {
            headers: headers,
        });
    },

    // Reject seller (Admin only)
    rejectSeller: (sellerId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/seller/approval/${sellerId}/reject`, data, {
            headers: headers,
        });
    },

    // Bulk approve sellers (Admin only)
    bulkApproveSellers: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/seller/approval/bulk-approve`, data, {
            headers: headers,
        });
    },

    // Bulk reject sellers (Admin only)
    bulkRejectSellers: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/seller/approval/bulk-reject`, data, {
            headers: headers,
        });
    },

    // Get approval statistics (Admin only)
    getApprovalStatistics: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/approval/statistics`, {
            headers: headers,
        });
    },

    // Get approval history (Admin only)
    getApprovalHistory: (sellerId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/seller/approval/history/${sellerId}`, {
            headers: headers,
            params: params,
        });
    },

    // ============ SELLER REGISTRATION MODULE ============

    // Send OTP for seller registration (Public)
    sendSellerRegistrationOtp: (data) => {
        return axios.post(`${API_URL}/seller/registration/send-otp`, data, {
            headers: headers,
        });
    },

    // Verify OTP for seller registration (Public)
    verifySellerRegistrationOtp: (data) => {
        return axios.post(`${API_URL}/seller/registration/verify-otp`, data, {
            headers: headers,
        });
    },

    // Submit seller registration (Public)
    submitSellerRegistration: (data) => {
        return axios.post(`${API_URL}/seller/registration/submit`, data, {
            headers: headers,
        });
    },

    // Check registration status (Public)
    getRegistrationStatus: (params) => {
        return axios.get(`${API_URL}/seller/registration/status`, {
            headers: headers,
            params: params,
        });
    },

    // Resend OTP for seller registration (Public)
    resendSellerRegistrationOtp: (data) => {
        return axios.post(`${API_URL}/seller/registration/resend-otp`, data, {
            headers: headers,
        });
    },
};

export default ApiService;