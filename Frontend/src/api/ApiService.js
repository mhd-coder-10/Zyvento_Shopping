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

// ============ AUTH MODULE ============

const ApiService = {
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

    // =========================== ADMIN MODULE =============================

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
    // // Get all users (Admin only)
    // getAllUsers: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/admin/users`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get user by ID (Admin only)
    // getUserById: (userId) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/admin/users/${userId}`, {
    //         headers: headers,
    //     });
    // },

    // // Update user (Admin only)
    // updateUserByAdmin: (userId, data) => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/admin/users/${userId}`, data, {
    //         headers: headers,
    //     });
    // },

    // // Delete user (Admin only)
    // deleteUserByAdmin: (userId) => {
    //     setAuthHeaders();
    //     return axios.delete(`${API_URL}/admin/users/${userId}`, {
    //         headers: headers,
    //     });
    // },

    // // Update user status (Activate/Deactivate)
    // updateUserStatus: (userId, data) => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/admin/users/${userId}/status`, data, {
    //         headers: headers,
    //     });
    // },

    // // Update user role
    // updateUserRole: (userId, data) => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/admin/users/${userId}/role`, data, {
    //         headers: headers,
    //     });
    // },



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

    // 3 SELLER MANAGEMENT APIs -------------

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








    // 4  EMPLOYEE MANAGEMENT APIs  ----------- 

    // Get All Employees
    getAllEmployees: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees`, { headers, params });
    },

    // Get Employee Stats
    getEmployeeStats: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/stats`, { headers });
    },

    // Create Employee
    createEmployee: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/employees`, data, { headers });
    },

    // Get Employee by ID
    getEmployeeById: (employeeId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/${employeeId}`, { headers });
    },

    // Update Employee
    updateEmployee: (employeeId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/employees/${employeeId}`, data, { headers });
    },

    // Delete Employee
    deleteEmployee: (employeeId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/employees/${employeeId}`, { headers });
    },

    // Update Employee Status
    updateEmployeeStatus: (employeeId, data) => {
        setAuthHeaders();
        return axios.patch(`${API_URL}/admin/employees/${employeeId}/status`, data, { headers });
    },

    // Transfer Employee to Another Seller
    transferEmployee: (employeeId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/employees/${employeeId}/transfer`, data, { headers });
    },

    // Export Employees
    exportEmployees: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/export`, { headers, params, responseType: 'blob' });
    },

    // Get Employee Performance
    getEmployeePerformance: (employeeId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/${employeeId}/performance`, { headers, params });
    },

    // Get Employee Transactions
    getEmployeeTransactions: (employeeId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/${employeeId}/transactions`, { headers, params });
    },

    // Get Employee Sellers (Current & Past)
    getEmployeeSellers: (employeeId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/${employeeId}/sellers`, { headers });
    },

    // Get Employee Career History
    getEmployeeCareerHistory: (employeeId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/${employeeId}/career-history`, { headers, params });
    },

    // Get Employee Reports (Filter by Month/Year)
    getEmployeeReports: (employeeId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/${employeeId}/reports`, { headers, params });
    },

    // Get Employee Roles
    getEmployeeRoles: (employeeId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/${employeeId}/roles`, { headers });
    },

    // Assign Role to Employee
    assignEmployeeRole: (employeeId, data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/employees/${employeeId}/roles`, data, { headers });
    },

    // Remove Role from Employee
    removeEmployeeRole: (employeeId, roleId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/employees/${employeeId}/roles/${roleId}`, { headers });
    },

    // Upload Profile Image
    uploadEmployeeProfileImage: (employeeId, formData) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/employees/${employeeId}/profile-image`, formData, { headers: formDataHeaders });
    },

    // Get Employee Activity Logs -------------
    getEmployeeActivityLogs: (employeeId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/employees/${employeeId}/activity-logs`, { headers, params });
    },

    uct: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/products`, data);
    },

    // Get Product by Code 
    getProductByCode: (productCode) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/products/${productCode}`);
    },

    // 4 PRODUCT MANAGEMENT APIs -------------------

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

































    // OLD 
    // ORDER MANAGEMENT APIs -------------------
    // Get all orders (Admin only)
    // getAllOrders: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/admin/orders`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get order by ID (Admin only)
    // getOrderById: (orderId) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/admin/orders/${orderId}`, {
    //         headers: headers,
    //     });
    // },

    // // Update order status (Admin only)
    // updateOrderStatus: (orderId, data) => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/admin/orders/${orderId}/status`, data, {
    //         headers: headers,
    //     });
    // },

    // // Cancel order (Admin only)
    // cancelOrderByAdmin: (orderId, data) => {
    //     setAuthHeaders();
    //     return axios.post(`${API_URL}/admin/orders/${orderId}/cancel`, data, {
    //         headers: headers,
    //     });
    // },


    // // Get categories   ----------------------
    // getAllCategories: () => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/category`, {
    //         headers: headers,
    //     });
    // },

    // // Get active categories (Public)
    // getActiveCategories: () => {
    //     return axios.get(`${API_URL}/category/active`)
    // },

    // // Get category by ID (Public)
    // getCategoryById: (categoryId) => {
    //     return axios.get(`${API_URL}/category/${categoryId}`);
    // },

    // // Get sub-categories by category ID (Public)
    // getSubCategoriesByCategory: (categoryId) => {
    //     return axios.get(`${API_URL}/category/${categoryId}/sub-categories`);
    // },

    // // Create category (Admin only)
    // createCategory: (data) => {
    //     setAuthHeaders();
    //     return axios.post(`${API_URL}/admin/categories`, data, {
    //         headers: headers,
    //     });
    // },

    // // Update category (Admin only)
    // updateCategory: (categoryId, data) => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/admin/categories/${categoryId}`, data, {
    //         headers: headers,
    //     });
    // },

    // // Delete category (Admin only)
    // deleteCategory: (categoryId) => {
    //     setAuthHeaders();
    //     return axios.delete(`${API_URL}/admin/categories/${categoryId}`, {
    //         headers: headers,
    //     });
    // },

    // // Get all payments (Admin only)
    // getAllPayments: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/admin/payments`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get payment by ID (Admin only)
    // getPaymentById: (paymentId) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/admin/payments/${paymentId}`, {
    //         headers: headers,
    //     });
    // },

    // // Refund payment (Admin only)
    // refundPayment: (data) => {
    //     setAuthHeaders();
    //     return axios.post(`${API_URL}/admin/payments/refund`, data, {
    //         headers: headers,
    //     });
    // },

    // // Get all reviews (Admin only)
    // getAllReviews: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/admin/reviews`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Delete review (Admin only)
    // deleteReview: (reviewId) => {
    //     setAuthHeaders();
    //     return axios.delete(`${API_URL}/admin/reviews/${reviewId}`, {
    //         headers: headers,
    //     });
    // },

    // Get all coupons (Admin only)
    getAllCoupons: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/coupons`, {
            headers: headers,
            params: params,
        });
    },

    // Create coupon (Admin only)
    createCoupon: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/coupons`, data, {
            headers: headers,
        });
    },

    // Update coupon (Admin only)
    updateCoupon: (couponId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/coupons/${couponId}`, data, {
            headers: headers,
        });
    },

    // Delete coupon (Admin only)
    deleteCoupon: (couponId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/coupons/${couponId}`, {
            headers: headers,
        });
    },

    // Get all roles (Admin only)
    getAllRoles: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles`, {
            headers: headers,
        });
    },

    // Create role (Admin only)
    createRole: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles`, data, {
            headers: headers,
        });
    },

    // Update role (Admin only)
    updateRole: (roleId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/roles/${roleId}`, data, {
            headers: headers,
        });
    },

    // Delete role (Admin only)
    deleteRole: (roleId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/roles/${roleId}`, {
            headers: headers,
        });
    },

    // Toggle role status (Admin only)
    toggleRoleStatus: (roleId) => {
        setAuthHeaders();
        return axios.patch(`${API_URL}/admin/roles/${roleId}/status`, {}, {
            headers: headers,
        });
    },

    // Assign permissions to role (Admin only)
    assignPermissionsToRole: (roleId, data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles/${roleId}/permissions`, data, {
            headers: headers,
        });
    },

    // Remove permission from role (Admin only)
    removePermissionFromRole: (roleId, permissionId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/roles/${roleId}/permissions/${permissionId}`, {
            headers: headers,
        });
    },

    // Get role permissions (Admin only)
    getRolePermissions: (roleId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles/${roleId}/permissions`, {
            headers: headers,
        });
    },

    // Assign role to user (Admin only)
    assignRoleToUser: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles/assign`, data, {
            headers: headers,
        });
    },

    // Revoke role from user (Admin only)
    revokeRoleFromUser: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles/revoke`, data, {
            headers: headers,
        });
    },

    // Bulk assign roles to users (Admin only)
    bulkAssignRoles: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/roles/bulk-assign`, data, {
            headers: headers,
        });
    },

    // Get user roles (Admin only)
    getUserRoles: (userId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles/user/${userId}`, {
            headers: headers,
        });
    },

    // Get user permissions (Admin only)
    getUserPermissions: (userId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles/user/${userId}/permissions`, {
            headers: headers,
        });
    },

    // Get role history (Admin only)
    getRoleHistory: (userId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/roles/history/${userId}`, {
            headers: headers,
            params: params,
        });
    },

    // ============ PERMISSION MODULE ============

    // Create permission (Admin only)
    createPermission: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/permissions`, data, {
            headers: headers,
        });
    },

    // Get all permissions (Admin only)
    getAllPermissions: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions`, {
            headers: headers,
            params: params,
        });
    },

    // Get permission by ID (Admin only)
    getPermissionById: (permissionId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/${permissionId}`, {
            headers: headers,
        });
    },

    // Update permission (Admin only)
    updatePermission: (permissionId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/permissions/${permissionId}`, data, {
            headers: headers,
        });
    },

    // Delete permission (Admin only)
    deletePermission: (permissionId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/admin/permissions/${permissionId}`, {
            headers: headers,
        });
    },

    // Toggle permission status (Admin only)
    togglePermissionStatus: (permissionId) => {
        setAuthHeaders();
        return axios.patch(`${API_URL}/admin/permissions/${permissionId}/status`, {}, {
            headers: headers,
        });
    },

    // Get all permission modules (Admin only)
    getPermissionModules: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/modules`, {
            headers: headers,
        });
    },

    // Get permissions by module (Admin only)
    getPermissionsByModule: (moduleName) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/module/${moduleName}`, {
            headers: headers,
        });
    },

    // Get all permission actions (Admin only)
    getPermissionActions: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/actions`, {
            headers: headers,
        });
    },

    // Get permission audit logs (Admin only)
    getPermissionAuditLogs: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/audit`, {
            headers: headers,
            params: params,
        });
    },

    // Get permission audit log by ID (Admin only)
    getPermissionAuditById: (auditId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/permissions/audit/${auditId}`, {
            headers: headers,
        });
    },

    // Get system settings (Admin only)
    getSystemSettings: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/settings`, {
            headers: headers,
        });
    },

    // Update system settings (Admin only)
    updateSystemSettings: (data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/admin/settings`, data, {
            headers: headers,
        });
    },

    // Get audit logs (Admin only)
    getAuditLogs: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/audit-logs`, {
            headers: headers,
            params: params,
        });
    },

    // Get sales report (Admin only)
    getSalesReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/reports/sales`, {
            headers: headers,
            params: params,
        });
    },

    // Get revenue report (Admin only)
    getRevenueReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/reports/revenue`, {
            headers: headers,
            params: params,
        });
    },

    // Get product report (Admin only)
    getProductReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/reports/products`, {
            headers: headers,
            params: params,
        });
    },

    // Get order report (Admin only)
    getOrderReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/reports/orders`, {
            headers: headers,
            params: params,
        });
    },

    // Get user report (Admin only)
    getUserReport: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/reports/users`, {
            headers: headers,
            params: params,
        });
    },

    // Export data (Admin only)
    exportData: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/admin/export`, {
            headers: headers,
            params: params,
            responseType: 'blob',
        });
    },

    // Bulk upload products (Admin only)
    bulkUploadProducts: (formData) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/bulk-upload/products`, formData, {
            headers: formDataHeaders,
        });
    },

    // Bulk delete products (Admin only)
    bulkDeleteProducts: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/bulk-delete/products`, data, {
            headers: headers,
        });
    },

    // Bulk update product status (Admin only)
    bulkUpdateProductStatus: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/bulk-update/product-status`, data, {
            headers: headers,
        });
    },

    // Send notification to all users (Admin only)
    sendBulkNotification: (data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/notifications/bulk`, data, {
            headers: headers,
        });
    },

    // Send notification to specific user (Admin only)
    sendUserNotification: (userId, data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/admin/notifications/user/${userId}`, data, {
            headers: headers,
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

    // ============ EMPLOYEE MODULE ============

    // Get employee profile (Self)
    getEmployeeProfile: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/profile`, {
            headers: headers,
        });
    },

    // Update employee profile (Self)
    updateEmployeeProfile: (data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/employee/profile`, data, {
            headers: headers,
        });
    },

    // Get employee dashboard
    getEmployeeDashboard: () => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/dashboard`, {
            headers: headers,
        });
    },

    // Get employee dashboard statistics
    getEmployeeDashboardStats: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/dashboard/statistics`, {
            headers: headers,
            params: params,
        });
    },

    // Get my activities (Self)
    getMyActivities: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/activities`, {
            headers: headers,
            params: params,
        });
    },

    // Get employee notifications
    getEmployeeNotifications: (params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/notifications`, {
            headers: headers,
            params: params,
        });
    },

    // Mark employee notification as read
    markEmployeeNotificationRead: (notificationId) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/employee/notifications/${notificationId}/read`, {}, {
            headers: headers,
        });
    },

    // Get employees by seller (Admin/Seller)
    getEmployeesBySeller: (sellerId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/seller/${sellerId}`, {
            headers: headers,
            params: params,
        });
    },

    // Get employee by ID
    getEmployeeById: (employeeId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/${employeeId}`, {
            headers: headers,
        });
    },

    // Update employee (Admin/Seller)
    updateEmployee: (employeeId, data) => {
        setAuthHeaders();
        return axios.put(`${API_URL}/employee/${employeeId}`, data, {
            headers: headers,
        });
    },

    // Update employee status
    updateEmployeeStatus: (employeeId, data) => {
        setAuthHeaders();
        return axios.patch(`${API_URL}/employee/${employeeId}/status`, data, {
            headers: headers,
        });
    },

    // Delete employee
    deleteEmployee: (employeeId) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/employee/${employeeId}`, {
            headers: headers,
        });
    },

    // Assign role to employee
    assignEmployeeRole: (employeeId, data) => {
        setAuthHeaders();
        return axios.post(`${API_URL}/employee/${employeeId}/roles`, data, {
            headers: headers,
        });
    },

    // Remove role from employee
    removeEmployeeRole: (employeeId, roleId, data) => {
        setAuthHeaders();
        return axios.delete(`${API_URL}/employee/${employeeId}/roles/${roleId}`, {
            headers: headers,
            data: data,
        });
    },

    // Get employee roles
    getEmployeeRoles: (employeeId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/${employeeId}/roles`, {
            headers: headers,
        });
    },

    // Get employee permissions
    getEmployeePermissions: (employeeId) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/${employeeId}/permissions`, {
            headers: headers,
        });
    },

    // Get employee role history
    getEmployeeRoleHistory: (employeeId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/${employeeId}/role-history`, {
            headers: headers,
            params: params,
        });
    },

    // Get employee activities (Admin/Seller)
    getEmployeeActivities: (employeeId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/${employeeId}/activities`, {
            headers: headers,
            params: params,
        });
    },

    // Get employee performance
    getEmployeePerformance: (employeeId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/${employeeId}/performance`, {
            headers: headers,
            params: params,
        });
    },

    // Get employee reports
    getEmployeeReports: (employeeId, params) => {
        setAuthHeaders();
        return axios.get(`${API_URL}/employee/${employeeId}/reports`, {
            headers: headers,
            params: params,
        });
    },

    // ============================================================
    // NOTIFICATION MODULE - FIXED WITH ERROR HANDLING
    // ============================================================

    // // Get all notifications
    // getNotifications: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/notification`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get unread notifications
    // getUnreadNotifications: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/notification/unread`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get notification by ID
    // getNotificationById: (notificationId) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/notification/${notificationId}`, {
    //         headers: headers,
    //     });
    // },

    // // Mark notification as read
    // markNotificationAsRead: (notificationId) => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/notification/${notificationId}/read`, {}, {
    //         headers: headers,
    //     });
    // },

    // // Mark all notifications as read
    // markAllNotificationsAsRead: () => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/notification/read-all`, {}, {
    //         headers: headers,
    //     });
    // },

    // // Delete notification
    // deleteNotification: (notificationId) => {
    //     setAuthHeaders();
    //     return axios.delete(`${API_URL}/notification/${notificationId}`, {
    //         headers: headers,
    //     });
    // },

    // // Clear all notifications
    // clearAllNotifications: () => {
    //     setAuthHeaders();
    //     return axios.delete(`${API_URL}/notification/clear/all`, {
    //         headers: headers,
    //     });
    // },

    // // ✅ Get notification preferences - WITH TOKEN CHECK & ERROR HANDLING
    // getNotificationPreferences: () => {
    //     const token = getToken();
    //     if (!token) {
    //         return Promise.reject({
    //             response: {
    //                 status: 401,
    //                 data: { message: 'No authentication token found' }
    //             }
    //         });
    //     }
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/notification/preferences`, {
    //         headers: headers,
    //     });
    // },

    // // ✅ Update notification preferences - WITH TOKEN CHECK & ERROR HANDLING
    // updateNotificationPreferences: (data) => {
    //     const token = getToken();
    //     if (!token) {
    //         return Promise.reject({
    //             response: {
    //                 status: 401,
    //                 data: { message: 'No authentication token found' }
    //             }
    //         });
    //     }

    //     // ✅ Ensure data has all required fields with defaults
    //     const payload = {
    //         notifications: {
    //             email: data.notifications?.email ?? true,
    //             push: data.notifications?.push ?? true,
    //             sms: data.notifications?.sms ?? false,
    //         },
    //         notification_types: {
    //             order_updates: data.notification_types?.order_updates ?? true,
    //             promotions: data.notification_types?.promotions ?? false,
    //             reminders: data.notification_types?.reminders ?? true,
    //             seller_messages: data.notification_types?.seller_messages ?? true,
    //             review_requests: data.notification_types?.review_requests ?? true,
    //         },
    //         language: data.language || 'en',
    //         timezone: data.timezone || 'UTC',
    //         theme: data.theme || 'light',
    //     };

    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/notification/preferences`, payload, {
    //         headers: headers,
    //     });
    // },

    // // Get notification statistics
    // getNotificationStatistics: () => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/notification/statistics`, {
    //         headers: headers,
    //     });
    // },

    // // Send broadcast notification (Admin)
    // sendBroadcastNotification: (data) => {
    //     setAuthHeaders();
    //     return axios.post(`${API_URL}/notification/admin/broadcast`, data, {
    //         headers: headers,
    //     });
    // },

    // // Get all notifications (Admin)
    // adminGetAllNotifications: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/notification/admin/all`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // ============ ORDER MODULE ============

    // // Track order by order number (Public)
    // trackOrder: (orderNumber) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/order/track/${orderNumber}`, {
    //         headers: headers,
    //     });
    // },

    // // Place order (Customer only)
    // placeOrder: (data) => {
    //     setAuthHeaders();
    //     return axios.post(`${API_URL}/order`, data, {
    //         headers: headers,
    //     });
    // },

    // // Get customer orders
    // getCustomerOrders: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/order/customer/orders`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get customer order details
    // getCustomerOrderDetails: (orderId) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/order/customer/${orderId}`, {
    //         headers: headers,
    //     });
    // },

    // // Cancel order (Customer only)
    // cancelOrder: (orderId, data) => {
    //     setAuthHeaders();
    //     return axios.post(`${API_URL}/order/${orderId}/cancel`, data, {
    //         headers: headers,
    //     });
    // },

    // // Request return (Customer only)
    // requestReturn: (orderId, data) => {
    //     setAuthHeaders();
    //     return axios.post(`${API_URL}/order/${orderId}/return`, data, {
    //         headers: headers,
    //     });
    // },

    // // Get seller orders
    // getSellerOrders: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/order/seller/orders`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get seller order details
    // getSellerOrderDetails: (orderId) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/order/seller/${orderId}`, {
    //         headers: headers,
    //     });
    // },

    // // Update order status (Seller only)
    // updateOrderStatusBySeller: (orderId, data) => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/order/seller/${orderId}/status`, data, {
    //         headers: headers,
    //     });
    // },

    // // Get all orders (Admin only)
    // adminGetAllOrders: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/order/admin/all`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get order details (Admin only)
    // adminGetOrderDetails: (orderId) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/order/admin/${orderId}`, {
    //         headers: headers,
    //     });
    // },

    // // Admin update order status
    // adminUpdateOrderStatus: (orderId, data) => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/order/admin/${orderId}/status`, data, {
    //         headers: headers,
    //     });
    // },

    // // Admin cancel order
    // adminCancelOrder: (orderId, data) => {
    //     setAuthHeaders();
    //     return axios.post(`${API_URL}/order/admin/${orderId}/cancel`, data, {
    //         headers: headers,
    //     });
    // },

    // // Get order statistics (Admin only)
    // getOrderStatistics: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/order/admin/statistics`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get order report (Admin only)
    // getOrderReport: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/order/admin/report`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get orders by seller (Sub-Admin)
    // getOrdersBySeller: (sellerId, params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/order/sub-admin/seller/${sellerId}`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get order item details
    // getOrderItemDetails: (orderItemId) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/order/items/${orderItemId}`, {
    //         headers: headers,
    //     });
    // },

    // // Update order item status (Seller only)
    // updateOrderItemStatus: (orderItemId, data) => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/order/items/${orderItemId}/status`, data, {
    //         headers: headers,
    //     });
    // },

    // ============ RETURN MODULE ============

    // Get customer returns
    // getCustomerReturns: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/return/customer/returns`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get return details
    // getReturnDetails: (returnId) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/return/customer/${returnId}`, {
    //         headers: headers,
    //     });
    // },

    // // Cancel return request (Customer only)
    // cancelReturn: (returnId) => {
    //     setAuthHeaders();
    //     return axios.delete(`${API_URL}/return/customer/${returnId}/cancel`, {
    //         headers: headers,
    //     });
    // },

    // // Get seller returns
    // getSellerReturns: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/return/seller/returns`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Process return (Seller only)
    // processReturn: (returnId, data) => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/return/seller/${returnId}/process`, data, {
    //         headers: headers,
    //     });
    // },

    // // Get all returns (Admin only)
    // adminGetAllReturns: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/return/admin/all`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Admin process return
    // adminProcessReturn: (returnId, data) => {
    //     setAuthHeaders();
    //     return axios.put(`${API_URL}/return/admin/${returnId}/process`, data, {
    //         headers: headers,
    //     });
    // },

    // // Get return statistics (Admin only)
    // getReturnStatistics: (params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/return/admin/statistics`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get returns by seller (Sub-Admin)
    // getReturnsBySeller: (sellerId, params) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/return/sub-admin/seller/${sellerId}`, {
    //         headers: headers,
    //         params: params,
    //     });
    // },

    // // Get return by order item
    // getReturnByOrderItem: (orderItemId) => {
    //     setAuthHeaders();
    //     return axios.get(`${API_URL}/return/order-item/${orderItemId}`, {
    //         headers: headers,
    //     });
    // },

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