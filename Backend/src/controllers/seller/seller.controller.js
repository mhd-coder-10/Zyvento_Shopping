// Handles all seller related API requests
// Manages seller profile, dashboard, documents, and products
// Also handles seller orders, employees, reports, and settings

const sellerService = require('../../services/seller/seller.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('../../services/audit.service'); // ✅ ADDED

const sellerController = {
    // ============ PUBLIC PROFILE ============
    getPublicProfile: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const profile = await sellerService.getPublicProfile(sellerId);
        res.status(200).json(
            ApiResponse.success(profile, 'Seller profile fetched successfully')
        );
    }),

    getSellerProducts: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { page, limit, category, sort_by, sort_order } = req.query;
        const result = await sellerService.getSellerProducts({
            sellerId,
            page,
            limit,
            category,
            sortBy: sort_by,
            sortOrder: sort_order
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'Seller products fetched successfully'
            )
        );
    }),

    getSellerReviews: asyncHandler(async (req, res) => {
        const { sellerId } = req.params;
        const { page, limit, rating } = req.query;
        const result = await sellerService.getSellerReviews({
            sellerId,
            page,
            limit,
            rating
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.reviews,
                result.pagination,
                'Seller reviews fetched successfully'
            )
        );
    }),

    // ============ SELLER PROFILE ============
    getProfile: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const profile = await sellerService.getProfile(sellerId);
        res.status(200).json(
            ApiResponse.success(profile, 'Profile fetched successfully')
        );
    }),

    updateProfile: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const updateData = req.body;
        
        // Get old profile for audit
        const oldProfile = await sellerService.getProfile(sellerId);
        
        const profile = await sellerService.updateProfile(sellerId, updateData);
        
        // ✅ AUDIT LOG - Seller Profile Update
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'seller',
            moduleId: sellerId,
            description: `Seller profile updated: ${oldProfile.business_name}`,
            oldData: { business_name: oldProfile.business_name },
            newData: updateData,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(profile, 'Profile updated successfully')
        );
    }),

    // ============ DASHBOARD ============
    getDashboard: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const dashboard = await sellerService.getDashboard(sellerId);
        res.status(200).json(
            ApiResponse.success(dashboard, 'Dashboard fetched successfully')
        );
    }),

    getDashboardStatistics: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { period = 'weekly' } = req.query;
        const statistics = await sellerService.getDashboardStatistics(sellerId, period);
        res.status(200).json(
            ApiResponse.success(statistics, 'Dashboard statistics fetched successfully')
        );
    }),

    // ============ DOCUMENTS ============
    uploadDocument: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { document_type } = req.body;
        const file = req.file;

        if (!file) {
            throw ApiError.badRequest('No file uploaded');
        }

        const document = await sellerService.uploadDocument({
            sellerId,
            documentType: document_type,
            file
        });

        // ✅ AUDIT LOG - Document Upload
        await auditService.log({
            userId: req.userId,
            action: 'upload',
            module: 'seller',
            moduleId: sellerId,
            description: `Document uploaded: ${document_type}`,
            newData: { document_type, document_url: document.document_url },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(201).json(
            ApiResponse.created(document, 'Document uploaded successfully')
        );
    }),

    deleteDocument: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { documentId } = req.params;
        await sellerService.deleteDocument(sellerId, documentId);
        
        // ✅ AUDIT LOG - Document Delete
        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'seller',
            moduleId: sellerId,
            description: `Document deleted: ${documentId}`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(null, 'Document deleted successfully')
        );
    }),

    getDocuments: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const documents = await sellerService.getDocuments(sellerId);
        res.status(200).json(
            ApiResponse.success(documents, 'Documents fetched successfully')
        );
    }),

    // ============ PRODUCTS ============
    getMyProducts: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { page, limit, status, category, search } = req.query;
        const result = await sellerService.getMyProducts({
            sellerId,
            page,
            limit,
            status,
            category,
            search
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.products,
                result.pagination,
                'Products fetched successfully'
            )
        );
    }),

    createProduct: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const productData = req.body;
        const product = await sellerService.createProduct(sellerId, productData);
        
        // ✅ AUDIT LOG - Product Creation
        await auditService.log({
            userId: req.userId,
            action: 'create',
            module: 'product',
            moduleId: product._id,
            description: `Product created: ${product.product_name}`,
            newData: { product_name: product.product_name, sku: product.sku },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(201).json(
            ApiResponse.created(product, 'Product created successfully')
        );
    }),

    // ============ ORDERS ============
    getOrders: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { page, limit, status, start_date, end_date, sort_by, sort_order } = req.query;
        const result = await sellerService.getOrders({
            sellerId,
            page,
            limit,
            status,
            startDate: start_date,
            endDate: end_date,
            sortBy: sort_by,
            sortOrder: sort_order
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.orders,
                result.pagination,
                'Orders fetched successfully'
            )
        );
    }),

    getOrderDetails: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { orderId } = req.params;
        const order = await sellerService.getOrderDetails(sellerId, orderId);
        res.status(200).json(
            ApiResponse.success(order, 'Order details fetched successfully')
        );
    }),

    updateOrderStatus: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { orderId } = req.params;
        const { status, notes, tracking_id, tracking_carrier, tracking_url } = req.body;
        
        // Get old order status for audit
        const oldOrder = await sellerService.getOrderDetails(sellerId, orderId);
        
        const order = await sellerService.updateOrderStatus({
            sellerId,
            orderId,
            status,
            notes,
            trackingId: tracking_id,
            trackingCarrier: tracking_carrier,
            trackingUrl: tracking_url
        });
        
        // ✅ AUDIT LOG - Order Status Update
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'order',
            moduleId: orderId,
            description: `Order status updated from ${oldOrder.order_status} to ${status}`,
            oldData: { order_status: oldOrder.order_status },
            newData: { order_status: status, notes },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(order, 'Order status updated successfully')
        );
    }),

    // ============ EMPLOYEES ============
    getEmployees: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { page, limit, status, employee_type } = req.query;
        const result = await sellerService.getEmployees({
            sellerId,
            page,
            limit,
            status,
            employeeType: employee_type
        });
        res.status(200).json(
            ApiResponse.paginated(
                result.employees,
                result.pagination,
                'Employees fetched successfully'
            )
        );
    }),

    createEmployee: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const employeeData = req.body;
        const employee = await sellerService.createEmployee(sellerId, employeeData);
        
        // ✅ AUDIT LOG - Employee Created
        await auditService.log({
            userId: req.userId,
            action: 'create',
            module: 'employee',
            moduleId: employee._id,
            description: `Employee created: ${employee.employee_type}`,
            newData: { employee_type: employee.employee_type, user_id: employee.user_id },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(201).json(
            ApiResponse.created(employee, 'Employee created successfully')
        );
    }),

    updateEmployee: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { employeeId } = req.params;
        const updateData = req.body;
        const employee = await sellerService.updateEmployee(sellerId, employeeId, updateData);
        
        // ✅ AUDIT LOG - Employee Updated
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'employee',
            moduleId: employeeId,
            description: `Employee updated: ${employee.employee_type}`,
            newData: updateData,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(employee, 'Employee updated successfully')
        );
    }),

    deleteEmployee: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { employeeId } = req.params;
        await sellerService.deleteEmployee(sellerId, employeeId);
        
        // ✅ AUDIT LOG - Employee Deleted
        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'employee',
            moduleId: employeeId,
            description: `Employee deleted`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(null, 'Employee deleted successfully')
        );
    }),

    // ============ REPORTS ============
    getPerformanceReport: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { start_date, end_date } = req.query;
        const report = await sellerService.getPerformanceReport({
            sellerId,
            startDate: start_date,
            endDate: end_date
        });
        res.status(200).json(
            ApiResponse.success(report, 'Performance report generated successfully')
        );
    }),

    getSalesReport: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { start_date, end_date, period = 'daily' } = req.query;
        const report = await sellerService.getSalesReport({
            sellerId,
            startDate: start_date,
            endDate: end_date,
            period
        });
        res.status(200).json(
            ApiResponse.success(report, 'Sales report generated successfully')
        );
    }),

    getAnalytics: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { period = 'monthly' } = req.query;
        const analytics = await sellerService.getAnalytics(sellerId, period);
        res.status(200).json(
            ApiResponse.success(analytics, 'Analytics fetched successfully')
        );
    }),

    // ============ SETTINGS ============
    getSettings: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const settings = await sellerService.getSettings(sellerId);
        res.status(200).json(
            ApiResponse.success(settings, 'Settings fetched successfully')
        );
    }),

    updateSettings: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const settingsData = req.body;
        const settings = await sellerService.updateSettings(sellerId, settingsData);
        
        // ✅ AUDIT LOG - Settings Update
        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'settings',
            moduleId: sellerId,
            description: 'Seller settings updated',
            newData: settingsData,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(settings, 'Settings updated successfully')
        );
    })
};

module.exports = sellerController;