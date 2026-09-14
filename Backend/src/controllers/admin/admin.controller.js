// Handles all admin related API requests
// Manages dashboard, user management, seller management, sub-admin management
// Also handles audit logs, system settings, and admin reports

// const adminService = require('../../services/admin/admin.service');
// const sellerService = require('../../services/seller/seller.service');
// const ApiResponse = require('../../utils/apiResponse');
// const ApiError = require('../../utils/apiError');
// const asyncHandler = require('../../utils/asyncHandler');
// const constants = require('../../config/constants');
// const auditService = require('../../services/audit.service'); // ✅ ADDED

// const adminController = {

//     // ============ DASHBOARD ============
//     getDashboardOverview: asyncHandler(async (req, res) => {
//         const data = await adminService.getDashboardOverview();
//         res.status(200).json(
//             ApiResponse.success(data, 'Dashboard overview fetched successfully')
//         );
//     }),

//     getDashboardStatistics: asyncHandler(async (req, res) => {
//         const data = await adminService.getDashboardStatistics();
//         res.status(200).json(
//             ApiResponse.success(data, 'Dashboard statistics fetched successfully')
//         );
//     }),

//     getRecentActivity: asyncHandler(async (req, res) => {
//         const { limit = 10 } = req.query;
//         const data = await adminService.getRecentActivity(limit);
//         res.status(200).json(
//             ApiResponse.success(data, 'Recent activity fetched successfully')
//         );
//     }),

//     getChartsData: asyncHandler(async (req, res) => {
//         const { period = 'weekly' } = req.query;
//         const data = await adminService.getChartsData(period);
//         res.status(200).json(
//             ApiResponse.success(data, 'Charts data fetched successfully')
//         );
//     }),

//     // ============ USER MANAGEMENT ============
//     getAllUsers: asyncHandler(async (req, res) => {
//         const {
//             page, limit, search, user_type, account_status,
//             sub_admin_type, sort_by, sort_order, start_date, end_date
//         } = req.query;

//         const result = await adminService.getAllUsers({
//             page, limit, search, userType: user_type,
//             accountStatus: account_status, subAdminType: sub_admin_type,
//             sortBy: sort_by, sortOrder: sort_order,
//             startDate: start_date, endDate: end_date
//         });

//         res.status(200).json(
//             ApiResponse.paginated(
//                 result.users,
//                 result.pagination,
//                 'Users fetched successfully'
//             )
//         );
//     }),

//     getUserById: asyncHandler(async (req, res) => {
//         const { userId } = req.params;
//         const user = await adminService.getUserById(userId);
//         res.status(200).json(
//             ApiResponse.success(user, 'User details fetched successfully')
//         );
//     }),

//     updateUser: asyncHandler(async (req, res) => {
//         const { userId } = req.params;
//         const updateData = req.body;

//         // Get old user data for audit
//         const oldUser = await adminService.getUserById(userId);

//         const user = await adminService.updateUser(userId, updateData, req.userId);

//         // ✅ AUDIT LOG - User Update
//         await auditService.log({
//             userId: req.userId,
//             action: 'update',
//             module: 'user',
//             moduleId: userId,
//             description: `User ${oldUser.user.email} updated by admin`,
//             oldData: { email: oldUser.user.email, userType: oldUser.user.user_type },
//             newData: updateData,
//             ip: req.ip,
//             userAgent: req.get('user-agent'),
//             status: 'success'
//         });

//         res.status(200).json(
//             ApiResponse.success(user, 'User updated successfully')
//         );
//     }),

//     updateUserStatus: asyncHandler(async (req, res) => {
//         const { userId } = req.params;
//         const { account_status, reason } = req.body;

//         // Get old user data for audit
//         const oldUser = await adminService.getUserById(userId);

//         const user = await adminService.updateUserStatus(userId, account_status, reason, req.userId);

//         // ✅ AUDIT LOG - User Status Update
//         await auditService.log({
//             userId: req.userId,
//             action: 'status_change',
//             module: 'user',
//             moduleId: userId,
//             description: `User ${oldUser.user.email} status changed to ${account_status}`,
//             oldData: { status: oldUser.user.account_status },
//             newData: { status: account_status, reason },
//             ip: req.ip,
//             userAgent: req.get('user-agent'),
//             status: 'success'
//         });

//         res.status(200).json(
//             ApiResponse.success(user, `User status updated to ${account_status}`)
//         );
//     }),

//     deleteUser: asyncHandler(async (req, res) => {
//         const { userId } = req.params;

//         // Get old user data for audit
//         const oldUser = await adminService.getUserById(userId);

//         await adminService.deleteUser(userId, req.userId);

//         // ✅ AUDIT LOG - User Delete
//         await auditService.log({
//             userId: req.userId,
//             action: 'delete',
//             module: 'user',
//             moduleId: userId,
//             description: `User ${oldUser.user.email} deleted by admin`,
//             oldData: { email: oldUser.user.email, userType: oldUser.user.user_type },
//             ip: req.ip,
//             userAgent: req.get('user-agent'),
//             status: 'success'
//         });

//         res.status(200).json(
//             ApiResponse.success(null, 'User deleted successfully')
//         );
//     }),

//     // ============ SELLER MANAGEMENT ============
//     // getAllSellers: asyncHandler(async (req, res) => {
//     //     const {
//     //         page, limit, search, verification_status,
//     //         account_status, business_type, sort_by, sort_order
//     //     } = req.query;

//     //     const result = await sellerService.getAllSellers({
//     //         page, limit, search,
//     //         verificationStatus: verification_status,
//     //         accountStatus: account_status,
//     //         businessType: business_type,
//     //         sortBy: sort_by, sortOrder: sort_order
//     //     });

//     //     res.status(200).json(
//     //         ApiResponse.paginated(
//     //             result.sellers,
//     //             result.pagination,
//     //             'Sellers fetched successfully'
//     //         )
//     //     );
//     // }),


//     // GET /api/admin/sellers
//     getAllSellers : async (req, res) => {
//         try {
//             const { search, status, verification_status, page = 1, limit = 10 } = req.query;
//             const query = {};

//             if (status) query.account_status = status;
//             if (verification_status) query.verification_status = verification_status;
//             if (search) {
//                 query.$or = [
//                     { business_name: new RegExp(search, 'i') },
//                     { email: new RegExp(search, 'i') },
//                     { owner_name: new RegExp(search, 'i') }
//                 ];
//             }

//             const skip = (page - 1) * limit;
//             const sellers = await Seller.find(query)
//                 .skip(skip)
//                 .limit(parseInt(limit))
//                 .populate('user_id', 'full_name email'); // User details bhi dikhao

//             const total = await Seller.countDocuments(query);

//             res.json({
//                 success: true,
//                 data: sellers,
//                 total,
//                 totalPages: Math.ceil(total / limit)
//             });
//         } catch (error) {
//             console.error("Error fetching sellers:", error); // Pura error log karo
//             res.status(500).json({ success: false, message: error.message });
//         }
//     },

//     // GET /api/admin/sellers/stats (Stats ke liye)
//     getSellerStats : async (req, res) => {
//         try {
//             const totalSellers = await Seller.countDocuments();
//             const activeSellers = await Seller.countDocuments({ account_status: 'active' });
//             const pendingSellers = await Seller.countDocuments({ verification_status: 'pending' });
//             const suspendedSellers = await Seller.countDocuments({ account_status: 'suspended' });

//             res.json({
//                 success: true,
//                 data: {
//                     totalSellers,
//                     activeSellers,
//                     pendingSellers,
//                     suspendedSellers,
//                     totalRevenue: 0, // Agar revenue chahiye to aggregation lagegi
//                     avgRating: 0
//                 }
//             });
//         } catch (error) {
//             console.error("Error fetching stats:", error);
//             res.status(500).json({ success: false, message: error.message });
//         }
//     },


//     getSellerDetails: asyncHandler(async (req, res) => {
//         const { sellerId } = req.params;
//         const seller = await sellerService.getSellerById(sellerId);
//         res.status(200).json(
//             ApiResponse.success(seller, 'Seller details fetched successfully')
//         );
//     }),

//     approveSeller: asyncHandler(async (req, res) => {
//         const { sellerId } = req.params;
//         const { notes } = req.body;

//         // Get old seller data for audit
//         const oldSeller = await sellerService.getSellerById(sellerId);

//         const seller = await sellerService.approveSeller(sellerId, req.userId, notes);

//         // ✅ AUDIT LOG - Seller Approval
//         await auditService.logSellerApproval(
//             req.userId,
//             seller._id,
//             seller,
//             req.ip,
//             req.get('user-agent')
//         );

//         res.status(200).json(
//             ApiResponse.success(seller, 'Seller approved successfully')
//         );
//     }),

//     rejectSeller: asyncHandler(async (req, res) => {
//         const { sellerId } = req.params;
//         const { rejection_reason } = req.body;

//         const seller = await sellerService.rejectSeller(sellerId, rejection_reason);

//         // ✅ AUDIT LOG - Seller Rejection
//         await auditService.log({
//             userId: req.userId,
//             action: 'reject',
//             module: 'seller',
//             moduleId: sellerId,
//             description: `Seller ${seller.business_name} rejected`,
//             newData: { rejection_reason },
//             ip: req.ip,
//             userAgent: req.get('user-agent'),
//             status: 'success'
//         });

//         res.status(200).json(
//             ApiResponse.success(seller, 'Seller rejected')
//         );
//     }),

//     suspendSeller: asyncHandler(async (req, res) => {
//         const { sellerId } = req.params;
//         const { reason } = req.body;

//         const seller = await sellerService.suspendSeller(sellerId, reason);

//         // ✅ AUDIT LOG - Seller Suspension
//         await auditService.log({
//             userId: req.userId,
//             action: 'suspend',
//             module: 'seller',
//             moduleId: sellerId,
//             description: `Seller ${seller.business_name} suspended`,
//             newData: { reason },
//             ip: req.ip,
//             userAgent: req.get('user-agent'),
//             status: 'success'
//         });

//         res.status(200).json(
//             ApiResponse.success(seller, 'Seller suspended successfully')
//         );
//     }),

//     activateSeller: asyncHandler(async (req, res) => {
//         const { sellerId } = req.params;
//         const seller = await sellerService.activateSeller(sellerId);

//         // ✅ AUDIT LOG - Seller Activation
//         await auditService.log({
//             userId: req.userId,
//             action: 'activate',
//             module: 'seller',
//             moduleId: sellerId,
//             description: `Seller ${seller.business_name} activated`,
//             ip: req.ip,
//             userAgent: req.get('user-agent'),
//             status: 'success'
//         });

//         res.status(200).json(
//             ApiResponse.success(seller, 'Seller activated successfully')
//         );
//     }),

//     getSellerTransactions: asyncHandler(async (req, res) => {
//         const { sellerId } = req.params;
//         const { page, limit } = req.query;
//         const result = await sellerService.getSellerTransactions(sellerId, { page, limit });
//         res.status(200).json(
//             ApiResponse.paginated(
//                 result.transactions,
//                 result.pagination,
//                 'Seller transactions fetched successfully'
//             )
//         );
//     }),

//     getSellerPerformance: asyncHandler(async (req, res) => {
//         const { sellerId } = req.params;
//         const { period = 'monthly' } = req.query;
//         const data = await sellerService.getSellerPerformance(sellerId, period);
//         res.status(200).json(
//             ApiResponse.success(data, 'Seller performance fetched successfully')
//         );
//     }),

//     // ============ SUB-ADMIN MANAGEMENT ============
//     createSubAdmin: asyncHandler(async (req, res) => {
//         const subAdminData = req.body;
//         const result = await adminService.createSubAdmin(subAdminData, req.userId);

//         // ✅ AUDIT LOG - Sub-Admin Creation
//         await auditService.log({
//             userId: req.userId,
//             action: 'create',
//             module: 'sub_admin',
//             moduleId: result._id,
//             description: `Sub-admin created: ${subAdminData.sub_admin_type}`,
//             newData: subAdminData,
//             ip: req.ip,
//             userAgent: req.get('user-agent'),
//             status: 'success'
//         });

//         res.status(201).json(
//             ApiResponse.created(result, 'Sub-admin created successfully')
//         );
//     }),

//     getAllSubAdmins: asyncHandler(async (req, res) => {
//         const { page, limit, status, sub_admin_type } = req.query;
//         const result = await adminService.getAllSubAdmins({
//             page, limit, status, subAdminType: sub_admin_type
//         });
//         res.status(200).json(
//             ApiResponse.paginated(
//                 result.subAdmins,
//                 result.pagination,
//                 'Sub-admins fetched successfully'
//             )
//         );
//     }),

//     getSubAdminById: asyncHandler(async (req, res) => {
//         const { subAdminId } = req.params;
//         const subAdmin = await adminService.getSubAdminById(subAdminId);
//         res.status(200).json(
//             ApiResponse.success(subAdmin, 'Sub-admin details fetched successfully')
//         );
//     }),

//     updateSubAdmin: asyncHandler(async (req, res) => {
//         const { subAdminId } = req.params;
//         const updateData = req.body;

//         // Get old sub-admin data for audit
//         const oldSubAdmin = await adminService.getSubAdminById(subAdminId);

//         const subAdmin = await adminService.updateSubAdmin(subAdminId, updateData, req.userId);

//         // ✅ AUDIT LOG - Sub-Admin Update
//         await auditService.log({
//             userId: req.userId,
//             action: 'update',
//             module: 'sub_admin',
//             moduleId: subAdminId,
//             description: `Sub-admin updated: ${oldSubAdmin.sub_admin_type}`,
//             oldData: { sub_admin_type: oldSubAdmin.sub_admin_type, status: oldSubAdmin.status },
//             newData: updateData,
//             ip: req.ip,
//             userAgent: req.get('user-agent'),
//             status: 'success'
//         });

//         res.status(200).json(
//             ApiResponse.success(subAdmin, 'Sub-admin updated successfully')
//         );
//     }),

//     updateSubAdminStatus: asyncHandler(async (req, res) => {
//         const { subAdminId } = req.params;
//         const { status, suspended_reason } = req.body;

//         // Get old sub-admin data for audit
//         const oldSubAdmin = await adminService.getSubAdminById(subAdminId);

//         const subAdmin = await adminService.updateSubAdminStatus(
//             subAdminId, status, suspended_reason, req.userId
//         );

//         // ✅ AUDIT LOG - Sub-Admin Status Update
//         await auditService.log({
//             userId: req.userId,
//             action: 'status_change',
//             module: 'sub_admin',
//             moduleId: subAdminId,
//             description: `Sub-admin status changed to ${status}`,
//             oldData: { status: oldSubAdmin.status },
//             newData: { status, reason: suspended_reason },
//             ip: req.ip,
//             userAgent: req.get('user-agent'),
//             status: 'success'
//         });

//         res.status(200).json(
//             ApiResponse.success(subAdmin, `Sub-admin status updated to ${status}`)
//         );
//     }),

//     deleteSubAdmin: asyncHandler(async (req, res) => {
//         const { subAdminId } = req.params;

//         // Get old sub-admin data for audit
//         const oldSubAdmin = await adminService.getSubAdminById(subAdminId);

//         await adminService.deleteSubAdmin(subAdminId, req.userId);

//         // ✅ AUDIT LOG - Sub-Admin Delete
//         await auditService.log({
//             userId: req.userId,
//             action: 'delete',
//             module: 'sub_admin',
//             moduleId: subAdminId,
//             description: `Sub-admin deleted: ${oldSubAdmin.sub_admin_type}`,
//             oldData: { sub_admin_type: oldSubAdmin.sub_admin_type, status: oldSubAdmin.status },
//             ip: req.ip,
//             userAgent: req.get('user-agent'),
//             status: 'success'
//         });

//         res.status(200).json(
//             ApiResponse.success(null, 'Sub-admin deleted successfully')
//         );
//     }),

//     // ============ AUDIT LOGS ============
//     getAuditLogs: asyncHandler(async (req, res) => {
//         const {
//             page, limit, module, action, user_type, start_date, end_date
//         } = req.query;

//         const result = await adminService.getAuditLogs({
//             page, limit, module, action,
//             userType: user_type,
//             startDate: start_date,
//             endDate: end_date
//         });

//         res.status(200).json(
//             ApiResponse.paginated(
//                 result.logs,
//                 result.pagination,
//                 'Audit logs fetched successfully'
//             )
//         );
//     }),

//     getAuditLogById: asyncHandler(async (req, res) => {
//         const { logId } = req.params;
//         const log = await adminService.getAuditLogById(logId);
//         res.status(200).json(
//             ApiResponse.success(log, 'Audit log details fetched successfully')
//         );
//     }),

//     // ============ SYSTEM SETTINGS ============
//     getSystemSettings: asyncHandler(async (req, res) => {
//         const { group } = req.query;
//         const settings = await adminService.getSystemSettings(group);
//         res.status(200).json(
//             ApiResponse.success(settings, 'System settings fetched successfully')
//         );
//     }),

//     updateSystemSetting: asyncHandler(async (req, res) => {
//         const { key } = req.params;
//         const { value } = req.body;
//         const setting = await adminService.updateSystemSetting(key, value, req.userId);

//         // ✅ AUDIT LOG - System Setting Update
//         await auditService.log({
//             userId: req.userId,
//             action: 'update',
//             module: 'settings',
//             moduleId: setting._id,
//             description: `System setting ${key} updated`,
//             newData: { key, value },
//             ip: req.ip,
//             userAgent: req.get('user-agent'),
//             status: 'success'
//         });

//         res.status(200).json(
//             ApiResponse.success(setting, 'Setting updated successfully')
//         );
//     }),

//     getSettingsByGroup: asyncHandler(async (req, res) => {
//         const { group } = req.params;
//         const settings = await adminService.getSettingsByGroup(group);
//         res.status(200).json(
//             ApiResponse.success(settings, `Settings for group ${group} fetched successfully`)
//         );
//     })
// };

// module.exports = adminController;







const adminService = require('../../services/admin/admin.service');
const sellerService = require('../../services/seller/seller.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const constants = require('../../config/constants');
const auditService = require('../../services/audit.service');


// IMPORT MODELS
const Seller = require('../../models/seller.model');
const User = require('../../models/user.model');

const adminController = {







    // ============ SUB-ADMIN MANAGEMENT ============
    // createSubAdmin: asyncHandler(async (req, res) => {
    //     const subAdminData = req.body;
    //     const result = await adminService.createSubAdmin(subAdminData, req.userId);

    //     await auditService.log({
    //         userId: req.userId,
    //         action: 'create',
    //         module: 'sub_admin',
    //         moduleId: result._id,
    //         description: `Sub-admin created: ${subAdminData.sub_admin_type}`,
    //         newData: subAdminData,
    //         ip: req.ip,
    //         userAgent: req.get('user-agent'),
    //         status: 'success'
    //     });

    //     res.status(201).json(
    //         ApiResponse.created(result, 'Sub-admin created successfully')
    //     );
    // }),

    // getAllSubAdmins: asyncHandler(async (req, res) => {
    //     const { page, limit, status, sub_admin_type } = req.query;
    //     const result = await adminService.getAllSubAdmins({
    //         page, limit, status, subAdminType: sub_admin_type
    //     });
    //     res.status(200).json(
    //         ApiResponse.paginated(
    //             result.subAdmins,
    //             result.pagination,
    //             'Sub-admins fetched successfully'
    //         )
    //     );
    // }),

    // getSubAdminById: asyncHandler(async (req, res) => {
    //     const { subAdminId } = req.params;
    //     const subAdmin = await adminService.getSubAdminById(subAdminId);
    //     res.status(200).json(
    //         ApiResponse.success(subAdmin, 'Sub-admin details fetched successfully')
    //     );
    // }),

    // updateSubAdmin: asyncHandler(async (req, res) => {
    //     const { subAdminId } = req.params;
    //     const updateData = req.body;

    //     const oldSubAdmin = await adminService.getSubAdminById(subAdminId);
    //     const subAdmin = await adminService.updateSubAdmin(subAdminId, updateData, req.userId);

    //     await auditService.log({
    //         userId: req.userId,
    //         action: 'update',
    //         module: 'sub_admin',
    //         moduleId: subAdminId,
    //         description: `Sub-admin updated: ${oldSubAdmin.sub_admin_type}`,
    //         oldData: { sub_admin_type: oldSubAdmin.sub_admin_type, status: oldSubAdmin.status },
    //         newData: updateData,
    //         ip: req.ip,
    //         userAgent: req.get('user-agent'),
    //         status: 'success'
    //     });

    //     res.status(200).json(
    //         ApiResponse.success(subAdmin, 'Sub-admin updated successfully')
    //     );
    // }),

    // updateSubAdminStatus: asyncHandler(async (req, res) => {
    //     const { subAdminId } = req.params;
    //     const { status, suspended_reason } = req.body;

    //     const oldSubAdmin = await adminService.getSubAdminById(subAdminId);
    //     const subAdmin = await adminService.updateSubAdminStatus(
    //         subAdminId, status, suspended_reason, req.userId
    //     );

    //     await auditService.log({
    //         userId: req.userId,
    //         action: 'status_change',
    //         module: 'sub_admin',
    //         moduleId: subAdminId,
    //         description: `Sub-admin status changed to ${status}`,
    //         oldData: { status: oldSubAdmin.status },
    //         newData: { status, reason: suspended_reason },
    //         ip: req.ip,
    //         userAgent: req.get('user-agent'),
    //         status: 'success'
    //     });

    //     res.status(200).json(
    //         ApiResponse.success(subAdmin, `Sub-admin status updated to ${status}`)
    //     );
    // }),

    // deleteSubAdmin: asyncHandler(async (req, res) => {
    //     const { subAdminId } = req.params;

    //     const oldSubAdmin = await adminService.getSubAdminById(subAdminId);
    //     await adminService.deleteSubAdmin(subAdminId, req.userId);

    //     await auditService.log({
    //         userId: req.userId,
    //         action: 'delete',
    //         module: 'sub_admin',
    //         moduleId: subAdminId,
    //         description: `Sub-admin deleted: ${oldSubAdmin.sub_admin_type}`,
    //         oldData: { sub_admin_type: oldSubAdmin.sub_admin_type, status: oldSubAdmin.status },
    //         ip: req.ip,
    //         userAgent: req.get('user-agent'),
    //         status: 'success'
    //     });

    //     res.status(200).json(
    //         ApiResponse.success(null, 'Sub-admin deleted successfully')
    //     );
    // }),

    // ========== SUB-ADMIN CONTROLLERS ==========
    createSubAdmin: asyncHandler(async (req, res) => {
        const data = req.body;
        const assignedBy = req.userId;
        const result = await subAdminService.createSubAdmin(data, assignedBy);
        res.status(201).json(ApiResponse.success(result, 'Sub-admin created successfully'));
    }),

    egetAllSubAdmins: asyncHandler(async (req, res) => {
        const filters = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            status: req.query.status,
            sub_admin_type: req.query.sub_admin_type,
            search: req.query.search,
        };
        const result = await subAdminService.getAllSubAdmins(filters);
        res.status(200).json(ApiResponse.success(result, 'Sub-admins fetched successfully'));
    }),

    getSubAdminById: asyncHandler(async (req, res) => {
        const { subAdminId } = req.params;
        const result = await subAdminService.getSubAdminById(subAdminId);
        res.status(200).json(ApiResponse.success(result, 'Sub-admin details fetched successfully'));
    }),

    updateSubAdmin: asyncHandler(async (req, res) => {
        const { subAdminId } = req.params;
        const data = { ...req.body, updated_by: req.userId };
        const result = await subAdminService.updateSubAdmin(subAdminId, data);
        res.status(200).json(ApiResponse.success(result, 'Sub-admin updated successfully'));
    }),

    updateSubAdminStatus: asyncHandler(async (req, res) => {
        const { subAdminId } = req.params;
        const { status, suspended_reason } = req.body;
        const result = await subAdminService.updateSubAdminStatus(subAdminId, status, suspended_reason, req.userId);
        res.status(200).json(ApiResponse.success(result, 'Sub-admin status updated successfully'));
    }),

    deleteSubAdmin: asyncHandler(async (req, res) => {
        const { subAdminId } = req.params;
        await subAdminService.deleteSubAdmin(subAdminId, req.userId);
        res.status(200).json(ApiResponse.success(null, 'Sub-admin deleted successfully'));
    }),


    // ============ DASHBOARD CONTROLLER  ============
    getDashboardOverview: asyncHandler(async (req, res) => {
        const data = await adminService.getDashboardOverview();
        res.status(200).json(
            ApiResponse.success(data, 'Dashboard overview fetched successfully')
        );
    }),

    getDashboardStatistics: asyncHandler(async (req, res) => {
        const data = await adminService.getDashboardStatistics();
        res.status(200).json(
            ApiResponse.success(data, 'Dashboard statistics fetched successfully')
        );
    }),

    getRecentActivity: asyncHandler(async (req, res) => {
        const { limit = 10 } = req.query;
        const data = await adminService.getRecentActivity(limit);
        res.status(200).json(
            ApiResponse.success(data, 'Recent activity fetched successfully')
        );
    }),

    getChartsData: asyncHandler(async (req, res) => {
        const { period = 'weekly' } = req.query;
        const data = await adminService.getChartsData(period);
        res.status(200).json(
            ApiResponse.success(data, 'Charts data fetched successfully')
        );
    }),

    // ============ USER MANAGEMENT CONTROLLER ============

    // Get Users
    getAllUsers: asyncHandler(async (req, res) => {
        const {
            page, limit, search, user_type, account_status,
            sub_admin_type, employee_type, sort_by, sort_order,
            start_date, end_date
        } = req.query;

        const result = await adminService.getAllUsers({
            page: page || 1,
            limit: limit || 10,
            search: search || null,
            userType: user_type || null,
            subAdminType: sub_admin_type || null,
            employeeType: employee_type || null,
            accountStatus: account_status || null,
            sortBy: sort_by || 'created_at',
            sortOrder: sort_order || 'desc',
            startDate: start_date || null,
            endDate: end_date || null
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.users,
                result.pagination,
                'Users fetched successfully'
            )
        );
    }),

    // get user's Stats
    getUserStats: asyncHandler(async (req, res) => {
        const stats = await adminService.getUserStats();
        res.status(200).json(
            ApiResponse.success(stats, 'User stats fetched successfully')
        );
    }),

    // Get Sinle User
    getUserById: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const user = await adminService.getUserById(userId);
        res.status(200).json(
            ApiResponse.success(user, 'User details fetched successfully')
        );
    }),

    // Create Users
    createUser: asyncHandler(async (req, res) => {
        const user = await adminService.createUser(req.body, req.userId);

        await auditService.log({
            userId: req.userId,
            action: 'create',
            module: 'user',
            moduleId: user._id,
            description: `User ${user.email} created by admin`,
            newData: { email: user.email, user_type: user.user_type },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(201).json(
            ApiResponse.success(user, 'User created successfully')
        );
    }),

    // Update Users
    updateUser: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const updateData = req.body;

        const oldUser = await adminService.getUserById(userId);
        const user = await adminService.updateUser(userId, updateData);

        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'user',
            moduleId: user._id,
            description: `User ${oldUser.user.email} updated by admin`,
            oldData: { email: oldUser.user.email, userType: oldUser.user.user_type },
            newData: updateData,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(user, 'User updated successfully')
        );
    }),

    // Update User Status
    updateUserStatus: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const { account_status, reason } = req.body;

        const oldUser = await adminService.getUserById(userId);
        const user = await adminService.updateUserStatus(userId, account_status, reason);

        await auditService.log({
            userId: req.userId,
            action: 'status_change',
            module: 'user',
            moduleId: user._id,
            description: `User ${oldUser.user.email} status changed to ${account_status}`,
            oldData: { status: oldUser.user.account_status },
            newData: { status: account_status, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(user, `User status updated to ${account_status}`)
        );
    }),

    // Delete Users
    deleteUser: asyncHandler(async (req, res) => {
        const { userId } = req.params;

        const oldUser = await adminService.getUserById(userId);
        await adminService.deleteUser(userId);

        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'user',
            moduleId: oldUser.user._id,
            description: `User ${oldUser.user.email} deleted by admin`,
            oldData: { email: oldUser.user.email, userType: oldUser.user.user_type },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(null, 'User deleted successfully')
        );
    }),


    // ============ SELLER MANAGEMENT CONTROLLER ============

    // Get Seller Stats
    getSellerStats: asyncHandler(async (req, res) => {
        const stats = await adminService.getSellerStats();
        res.status(200).json(ApiResponse.success(stats, 'Seller stats fetched'));
    }),

    // Get All Sellers
    getAllSellers: asyncHandler(async (req, res) => {
        const {
            page,
            limit,
            search,
            account_status,
            verification_status,
            business_type,
            sort_by,
            sort_order,
        } = req.query;

        const result = await adminService.getAllSellers({
            page,
            limit,
            search: search || null,
            accountStatus: account_status || null,
            verificationStatus: verification_status || null,
            businessType: business_type || null,
            sortBy: sort_by || 'created_at',
            sortOrder: sort_order || 'desc',
        });

        res.status(200).json(
            ApiResponse.paginated(result.sellers, result.pagination, 'Sellers fetched')
        );
    }),

    // Get Seller Details (accepts both _id and seller_code)
    getSellerDetails: asyncHandler(async (req, res) => {
        const { sellerCode } = req.params;
        const data = await adminService.getSellerById(sellerCode);
        res.status(200).json(ApiResponse.success(data, 'Seller details fetched'));
    }),

    // Update Seller Details (accepts both _id and seller_code)
    updateSellerDetails: asyncHandler(async (req, res) => {
        const { sellerCode } = req.params;
        const seller = await adminService.updateSellerDetails(sellerCode, req.body);

        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'seller',
            moduleId: seller._id,
            description: `Seller ${seller.business_name} details updated`,
            newData: req.body,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success',
        });

        res.status(200).json(ApiResponse.success(seller, 'Seller details updated'));
    }),

    // Update Seller Status (accepts both _id and seller_code)
    updateSellerStatus: asyncHandler(async (req, res) => {
        const { sellerCode } = req.params;
        const { status, reason, notes } = req.body;

        const seller = await adminService.updateSellerStatus(
            sellerCode,
            status,
            reason,
            notes,
            req.userId
        );

        await auditService.log({
            userId: req.userId,
            action: 'status_change',
            module: 'seller',
            moduleId: seller._id,
            description: `Seller ${seller.business_name} status changed to ${status}`,
            newData: { status, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success',
        });

        res.status(200).json(
            ApiResponse.success(seller, `Seller status updated to ${status}`)
        );
    }),

    // Delete Seller (Cascade - Removes all related data)
    deleteSeller: asyncHandler(async (req, res) => {
        const { sellerCode } = req.params;

        // Fetch seller first for audit log
        const sellerData = await adminService.getSellerById(sellerCode);
        const seller = sellerData?.seller;

        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        // Perform cascade delete
        const result = await adminService.deleteSeller(sellerCode);

        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'seller',
            moduleId: seller._id,
            description: `Seller ${seller.business_name} permanently deleted with all related data`,
            oldData: {
                business_name: seller.business_name,
                email: seller.email,
                seller_code: seller.seller_code,
            },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success',
        });

        res.status(200).json(
            ApiResponse.success(result, 'Seller and all related data permanently deleted')
        );
    }),

    // Export Sellers to CSV
    exportSellers: asyncHandler(async (req, res) => {
        const { search, status } = req.query;
        const csv = await adminService.exportSellers({ search, status });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="sellers.csv"');
        res.status(200).send(csv);
    }),


    // =================== SUB-ADMIN mANAGEMENT CONTROLLERS ======================

    // Get All Sub-Admins
    getAllSubAdmins: asyncHandler(async (req, res) => {
        const result = await adminService.getAllSubAdmins(req.query);
        res.status(200).json(
            ApiResponse.success(result, 'Sub-Admins fetched successfully')
        );
    }),

    // Get Sub-Admin Stats
    getSubAdminStats: asyncHandler(async (req, res) => {
        const result = await adminService.getSubAdminStats();
        res.status(200).json(
            ApiResponse.success(result, 'Sub-Admin stats fetched successfully')
        );
    }),

    // Get Sub-Admin By Code
    getSubAdminByCode: asyncHandler(async (req, res) => {
        const { subAdminCode } = req.params;
        const result = await adminService.getSubAdminByCode(subAdminCode);
        res.status(200).json(
            ApiResponse.success(result, 'Sub-Admin fetched successfully')
        );
    }),

    // Create Sub-Admin
    createSubAdmin: asyncHandler(async (req, res) => {
        const result = await adminService.createSubAdmin(req.body, req.userId);

        await auditService.log({
            userId: req.userId,
            action: 'create',
            module: 'sub_admin',
            moduleId: result.subAdmin._id,
            description: `Sub-Admin ${result.subAdmin.sub_admin_code} created`,
            newData: {
                sub_admin_code: result.subAdmin.sub_admin_code,
                sub_admin_type: result.subAdmin.sub_admin_type,
                department: result.subAdmin.department
            },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(201).json(
            ApiResponse.success(result, 'Sub-Admin created successfully')
        );
    }),

    // Update Sub-Admin Details
    updateSubAdmin: asyncHandler(async (req, res) => {
        const { subAdminCode } = req.params;

        const oldData = await adminService.getSubAdminByCode(subAdminCode);
        const result = await adminService.updateSubAdmin(subAdminCode, req.body, req.userId);

        await auditService.log({
            userId: req.userId,
            action: 'update',
            module: 'sub_admin',
            moduleId: result.subAdmin._id,
            description: `Sub-Admin ${subAdminCode} updated`,
            oldData: oldData.subAdmin,
            newData: req.body,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Sub-Admin updated successfully')
        );
    }),

    // Update Sub-Admin Status
    updateSubAdminStatus: asyncHandler(async (req, res) => {
        const { subAdminCode } = req.params;
        const result = await adminService.updateSubAdminStatus(subAdminCode, req.body, req.userId);

        await auditService.log({
            userId: req.userId,
            action: 'status_change',
            module: 'sub_admin',
            moduleId: result.subAdmin._id,
            description: `Sub-Admin ${subAdminCode} status changed to ${req.body.status}`,
            newData: { status: req.body.status, reason: req.body.reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, `Status updated to ${req.body.status}`)
        );
    }),

    // Delete Sub-Admin (Soft Delete)
    deleteSubAdmin: asyncHandler(async (req, res) => {
        const { subAdminCode } = req.params;

        const oldData = await adminService.getSubAdminByCode(subAdminCode);
        await adminService.deleteSubAdmin(subAdminCode, req.userId);

        await auditService.log({
            userId: req.userId,
            action: 'delete',
            module: 'sub_admin',
            moduleId: oldData.subAdmin._id,
            description: `Sub-Admin ${subAdminCode} deleted`,
            oldData: {
                sub_admin_code: oldData.subAdmin.sub_admin_code,
                sub_admin_type: oldData.subAdmin.sub_admin_type
            },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(null, 'Sub-Admin deleted successfully')
        );
    }),

    // Get Sub-Admin History
    getSubAdminHistory: asyncHandler(async (req, res) => {
        const { subAdminCode } = req.params;
        const result = await adminService.getSubAdminHistory(subAdminCode);
        res.status(200).json(
            ApiResponse.success(result, 'Sub-Admin history fetched successfully')
        );
    }),

    // Get Deleted Sub-Admins(for Deleted tab)
    getDeletedSubAdmins: asyncHandler(async (req, res) => {
        const result = await adminService.getDeletedSubAdmins(req.query);
        res.status(200).json(
            ApiResponse.success(result, 'Deleted Sub-Admins fetched successfully')
        );
    }),

    // Restore Sub-Admin
    restoreSubAdmin: asyncHandler(async (req, res) => {
        const { subAdminCode } = req.params;
        const result = await adminService.restoreSubAdmin(subAdminCode, req.userId);

        await auditService.log({
            userId: req.userId,
            action: 'restore',
            module: 'sub_admin',
            moduleId: result.subAdmin._id,
            description: `Sub-Admin ${subAdminCode} restored`,
            newData: { status: result.subAdmin.status },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(result, 'Sub-Admin restored successfully. Please activate the account.')
        );
    }),




    
    // ============ REVIEW MANAGEMENT CONTROLLER ============

    // Get All Reviews
    getAllReviews: asyncHandler(async (req, res) => {
        const {
            page,
            limit,
            search,
            status,
            rating,
            seller_id,
            product_id,
            report_count_min,
            sort_by,
            sort_order,
        } = req.query;

        const result = await adminService.getAllReviews({
            page,
            limit,
            search: search || null,
            status: status || null,
            rating: rating || null,
            sellerId: seller_id || null,
            productId: product_id || null,
            reportCountMin: report_count_min ? parseInt(report_count_min) : null,
            sortBy: sort_by || 'created_at',
            sortOrder: sort_order || 'desc',
        });

        res.status(200).json(
            ApiResponse.paginated(result.reviews, result.pagination, 'Reviews fetched')
        );
    }),

    // Get Review Stats
    getReviewStats: asyncHandler(async (req, res) => {
        const stats = await adminService.getReviewStats();
        res.status(200).json(ApiResponse.success(stats, 'Review stats fetched'));
    }),

    // Get Review By ID
    getReviewById: asyncHandler(async (req, res) => {
        const { reviewId } = req.params;
        const review = await adminService.getReviewById(reviewId);
        res.status(200).json(ApiResponse.success(review, 'Review fetched'));
    }),

    // Moderate Review
    moderateReview: asyncHandler(async (req, res) => {
        const { reviewId } = req.params;
        const { action, reason, admin_comment } = req.body;

        const review = await adminService.moderateReview(
            reviewId,
            action,
            reason,
            admin_comment,
            req.userId
        );

        await auditService.log({
            userId: req.userId,
            action: 'moderate',
            module: 'review',
            moduleId: review._id,
            description: `Review ${review.review_code} ${action}ed by admin`,
            newData: { action, reason },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success',
        });

        res.status(200).json(ApiResponse.success(review, `Review ${action}ed successfully`));
    }),




    // ============ EMPLOYEE MANAGEMENT ============

    // Get Employee Stats
    getEmployeeStats: asyncHandler(async (req, res) => {
        const stats = await adminService.getEmployeeStats();
        res.status(200).json(ApiResponse.success(stats, 'Employee stats fetched'));
    }),

    // Get All Employees
    getAllEmployees: asyncHandler(async (req, res) => {
        const { page, limit, search, status, sort_by, sort_order } = req.query;

        const result = await adminService.getAllEmployees({
            page, limit, search, status,
            sortBy: sort_by, sortOrder: sort_order
        });

        res.status(200).json({
            success: true,
            data: result.employees,       // Direct array
            total: result.pagination.total,
            totalPages: result.pagination.totalPages,
            page: result.pagination.page,
            limit: result.pagination.limit
        });
    }),

    // Create Employee
    createEmployee: asyncHandler(async (req, res) => {
        const employeeData = req.body;
        const employee = await adminService.createEmployee(employeeData, req.userId);
        res.status(201).json(ApiResponse.created(employee, 'Employee created successfully'));
    }),

    // Get Employee by ID
    getEmployeeById: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const employee = await adminService.getEmployeeById(employeeId);
        res.status(200).json(ApiResponse.success(employee, 'Employee details fetched'));
    }),

    // Update Employee
    updateEmployee: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const updateData = req.body;
        const employee = await adminService.updateEmployee(employeeId, updateData, req.userId);
        res.status(200).json(ApiResponse.success(employee, 'Employee updated successfully'));
    }),

    // Delete Employee
    deleteEmployee: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        await adminService.deleteEmployee(employeeId, req.userId);
        res.status(200).json(ApiResponse.success(null, 'Employee deleted successfully'));
    }),

    // Update Employee Status
    updateEmployeeStatus: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { status, reason } = req.body;
        const employee = await adminService.updateEmployeeStatus(employeeId, status, reason, req.userId);
        res.status(200).json(ApiResponse.success(employee, `Employee status updated to ${status}`));
    }),

    // Transfer Employee to Another Seller
    transferEmployeeToSeller: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { newSellerId, newRoleId, newPermissionIds } = req.body;
        const employee = await adminService.transferEmployeeToSeller(employeeId, newSellerId, newRoleId, newPermissionIds, req.userId);
        res.status(200).json(ApiResponse.success(employee, 'Employee transferred successfully'));
    }),

    // Export Employees
    exportEmployees: asyncHandler(async (req, res) => {
        const { search, status } = req.query;
        const csv = await adminService.exportEmployees({ search, status });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
        res.status(200).send(csv);
    }),

    // Upload Profile Image
    uploadEmployeeProfileImage: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const employee = await adminService.uploadEmployeeProfileImage(employeeId, req.file);
        res.status(200).json(ApiResponse.success(employee, 'Profile image uploaded'));
    }),

    // Get Employee Performance
    getEmployeePerformance: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { period = 'monthly' } = req.query;
        const data = await adminService.getEmployeePerformance(employeeId, period);
        res.status(200).json(ApiResponse.success(data, 'Employee performance fetched'));
    }),

    // Get Employee Transactions
    getEmployeeTransactions: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { page, limit } = req.query;
        const result = await adminService.getEmployeeTransactions(employeeId, { page, limit });
        res.status(200).json(ApiResponse.paginated(result.transactions, result.pagination, 'Employee transactions fetched'));
    }),

    // Get Employee Sellers (Current & Past)
    getEmployeeSellers: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const data = await adminService.getEmployeeSellers(employeeId);
        res.status(200).json(ApiResponse.success(data, 'Employee sellers fetched'));
    }),

    // Get Employee Career History
    getEmployeeCareerHistory: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { page, limit } = req.query;
        const result = await adminService.getEmployeeCareerHistory(employeeId, { page, limit });
        res.status(200).json(ApiResponse.paginated(result.history, result.pagination, 'Career history fetched'));
    }),

    // Get Employee Reports (Filter by Month/Year)
    getEmployeeReports: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { month, year, type } = req.query;
        const data = await adminService.getEmployeeReports(employeeId, { month, year, type });
        res.status(200).json(ApiResponse.success(data, 'Employee reports fetched'));
    }),

    // Get Employee Roles
    getEmployeeRoles: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const roles = await adminService.getEmployeeRoles(employeeId);
        res.status(200).json(ApiResponse.success(roles, 'Employee roles fetched'));
    }),

    // Assign Role to Employee
    assignEmployeeRole: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { roleIds } = req.body;
        const employee = await adminService.assignEmployeeRole(employeeId, roleIds, req.userId);
        res.status(200).json(ApiResponse.success(employee, 'Roles assigned successfully'));
    }),

    // Remove Role from Employee
    removeEmployeeRole: asyncHandler(async (req, res) => {
        const { employeeId, roleId } = req.params;
        const employee = await adminService.removeEmployeeRole(employeeId, roleId, req.userId);
        res.status(200).json(ApiResponse.success(employee, 'Role removed successfully'));
    }),

    // Get Employee Activity Logs
    getEmployeeActivityLogs: asyncHandler(async (req, res) => {
        const { employeeId } = req.params;
        const { page, limit } = req.query;
        const result = await adminService.getEmployeeActivityLogs(employeeId, { page, limit });
        res.status(200).json(ApiResponse.paginated(result.logs, result.pagination, 'Activity logs fetched'));
    }),

    // ============ PRODUCT MANAGEMENT ============

    getProductStats: asyncHandler(async (req, res) => {
        const stats = await adminService.getProductStats();
        res.status(200).json(ApiResponse.success(stats, 'Product stats fetched'));
    }),

    getAllProducts: asyncHandler(async (req, res) => {
        const { page, limit, search, status, category, seller_id, sort_by, sort_order } = req.query;
        const result = await adminService.getAllProducts({
            page, limit, search, status, category, sellerId: seller_id,
            sortBy: sort_by, sortOrder: sort_order
        });
        res.status(200).json(ApiResponse.paginated(result.products, result.pagination, 'Products fetched successfully'));
    }),

    getProductCategories: asyncHandler(async (req, res) => {
        const categories = await adminService.getProductCategories();
        res.status(200).json(ApiResponse.success(categories, 'Product categories fetched'));
    }),

    createProduct: asyncHandler(async (req, res) => {
        const productData = req.body;
        const product = await adminService.createProduct(productData, req.userId);
        res.status(201).json(ApiResponse.created(product, 'Product created successfully'));
    }),

    getProductByCode: asyncHandler(async (req, res) => {
        const { productCode } = req.params;
        const product = await adminService.getProductByCode(productCode);
        res.status(200).json(ApiResponse.success(product, 'Product details fetched'));
    }),

    updateProductByCode: asyncHandler(async (req, res) => {
        const { productCode } = req.params;
        const updateData = req.body;
        const product = await adminService.updateProductByCode(productCode, updateData, req.userId);
        res.status(200).json(ApiResponse.success(product, 'Product updated successfully'));
    }),

    deleteProductByCode: asyncHandler(async (req, res) => {
        const { productCode } = req.params;
        await adminService.deleteProductByCode(productCode, req.userId);
        res.status(200).json(ApiResponse.success(null, 'Product deleted successfully'));
    }),

    approveProductByCode: asyncHandler(async (req, res) => {
        const { productCode } = req.params;
        const product = await adminService.approveProductByCode(productCode, req.userId);
        res.status(200).json(ApiResponse.success(product, 'Product approved successfully'));
    }),

    rejectProductByCode: asyncHandler(async (req, res) => {
        const { productCode } = req.params;
        const { rejection_reason } = req.body;
        const product = await adminService.rejectProductByCode(productCode, rejection_reason, req.userId);
        res.status(200).json(ApiResponse.success(product, 'Product rejected successfully'));
    }),

    suspendProductByCode: asyncHandler(async (req, res) => {
        const { productCode } = req.params;
        const { reason } = req.body;
        const product = await adminService.suspendProductByCode(productCode, reason, req.userId);
        res.status(200).json(ApiResponse.success(product, 'Product suspended successfully'));
    }),

    activateProductByCode: asyncHandler(async (req, res) => {
        const { productCode } = req.params;
        const product = await adminService.activateProductByCode(productCode, req.userId);
        res.status(200).json(ApiResponse.success(product, 'Product activated successfully'));
    }),

    getProductReviewsByCode: asyncHandler(async (req, res) => {
        const { productCode } = req.params;
        const { page, limit } = req.query;
        const result = await adminService.getProductReviewsByCode(productCode, { page, limit });
        res.status(200).json(ApiResponse.paginated(result.reviews, result.pagination, 'Product reviews fetched'));
    }),

    getProductOrdersByCode: asyncHandler(async (req, res) => {
        const { productCode } = req.params;
        const { page, limit } = req.query;
        const result = await adminService.getProductOrdersByCode(productCode, { page, limit });
        res.status(200).json(ApiResponse.paginated(result.orders, result.pagination, 'Product orders fetched'));
    }),

    exportProducts: asyncHandler(async (req, res) => {
        const { search, status, category } = req.query;
        const csv = await adminService.exportProducts({ search, status, category });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
        res.status(200).send(csv);
    }),

    // =============== CATEGORY CONTROLLER ===============
    // get All category 
    getAllCategories: asyncHandler(async (req, res) => {
        const { page, limit, search, status } = req.query;
        const result = await adminService.getAllCategories({ page, limit, search, status });

        // Return stats separately so frontend can read easily
        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            data: result.categories,
            stats: result.stats,
            pagination: result.pagination
        });
    }),

    // get category details
    getCategoryDetails: asyncHandler(async (req, res) => {
        const { idOrCode } = req.params;
        const category = await adminService.getCategoryDetails(idOrCode);
        res.status(200).json(ApiResponse.success(category, 'Category details fetched'));
    }),

    // Get Categpry by Code
    getCategoryByCode: asyncHandler(async (req, res) => {
        const { idOrCode } = req.params;
        const category = await adminService.getCategoryByCode(idOrCode);
        res.status(200).json(ApiResponse.success(category, 'Category fetched'));
    }),

    // Create Category
    createCategory: asyncHandler(async (req, res) => {
        const category = await adminService.createCategory(req.body, req.userId);
        res.status(201).json(ApiResponse.created(category, 'Category created successfully'));
    }),

    // Update Category
    updateCategory: asyncHandler(async (req, res) => {
        const { idOrCode } = req.params;
        const category = await adminService.updateCategory(idOrCode, req.body, req.userId);
        res.status(200).json(ApiResponse.success(category, 'Category updated successfully'));
    }),

    // Delete Catgegory
    deleteCategory: asyncHandler(async (req, res) => {
        const { idOrCode } = req.params;
        await adminService.deleteCategory(idOrCode, req.userId);
        res.status(200).json(ApiResponse.success(null, 'Category deleted successfully'));
    }),

    // ============ SUB-CATEGORY CONTROLLER ============

    // Get Top Categories for Dropdown
    getTopCategoriesForDropdown: asyncHandler(async (req, res) => {
        const categories = await adminService.getTopCategoriesForDropdown();
        res.status(200).json(ApiResponse.success(categories, 'Top categories fetched'));
    }),

    // Get All Sub-Categories (Updated with filters)
    getAllSubCategories: asyncHandler(async (req, res) => {
        const { page, limit, search, status, categoryFilter } = req.query;
        const result = await adminService.getAllSubCategories({ page, limit, search, status, categoryFilter });

        res.status(200).json({
            success: true,
            message: 'Sub-categories fetched successfully',
            data: result.subCategories,
            stats: result.stats,
            pagination: result.pagination
        });
    }),

    // Get Sub category Details
    getSubCategoryDetails: asyncHandler(async (req, res) => {
        const { code } = req.params;
        const subCategory = await adminService.getSubCategoryDetails(code);
        res.status(200).json(ApiResponse.success(subCategory, 'Sub-category details fetched'));
    }),

    // Create Sub Category
    createSubCategory: asyncHandler(async (req, res) => {
        const subCategory = await adminService.createSubCategory(req.body, req.userId);
        res.status(201).json(ApiResponse.created(subCategory, 'Sub-category created successfully'));
    }),

    // Update Sub - Category
    updateSubCategory: asyncHandler(async (req, res) => {
        const { code } = req.params;
        const subCategory = await adminService.updateSubCategory(code, req.body, req.userId);
        res.status(200).json(ApiResponse.success(subCategory, 'Sub-category updated successfully'));
    }),

    // Delete Sub - Category
    deleteSubCategory: asyncHandler(async (req, res) => {
        const { code } = req.params;
        await adminService.deleteSubCategory(code, req.userId);
        res.status(200).json(ApiResponse.success(null, 'Sub-category deleted successfully'));
    }),

    // ============ INVENTORY CONTROLLER ============

    getAllInventory: asyncHandler(async (req, res) => {
        const { page, limit, search, stockStatus } = req.query;
        const result = await adminService.getAllInventory({ page, limit, search, stockStatus });
        res.status(200).json({
            success: true,
            message: 'Inventory fetched successfully',
            data: result.inventory,
            stats: result.stats,
            pagination: result.pagination
        });
    }),

    updateInventoryStock: asyncHandler(async (req, res) => {
        const { inventoryId } = req.params;
        const inventory = await adminService.updateInventoryStock(inventoryId, req.body, req.userId);
        res.status(200).json(ApiResponse.success(inventory, 'Stock updated successfully'));
    }),

    // ============ ORDERS CONTROLLER ============

    // All Orders
    getAllOrders: asyncHandler(async (req, res) => {
        const { page, limit, search, status } = req.query;
        const result = await adminService.getAllOrders({ page, limit, search, status });
        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: result.orders,
            stats: result.stats,
            pagination: result.pagination
        });
    }),

    // Order Details
    getOrderDetails: asyncHandler(async (req, res) => {
        const { orderCode } = req.params;
        const order = await adminService.getOrderDetails(orderCode);
        res.status(200).json(ApiResponse.success(order, 'Order details fetched'));
    }),

    // Update Order status
    updateOrderStatus: asyncHandler(async (req, res) => {
        const { orderCode } = req.params;
        const order = await adminService.updateOrderStatus(orderCode, req.body, req.userId);
        res.status(200).json(ApiResponse.success(order, 'Order status updated successfully'));
    }),

    // ============ ORDERS - RETURN CONTROLLER ===========

    // Get all returns (cancelled/returned orders)
    getAllReturns: asyncHandler(async (req, res) => {
        const result = await adminService.getAllReturns(req.query);
        res.status(200).json({
            success: true,
            data: result.returns,
            stats: result.stats,
            pagination: result.pagination
        });
    }),

    // Get return details by order code
    getReturnByOrderCode: asyncHandler(async (req, res) => {
        const order = await adminService.getReturnByOrderCode(req.params.orderCode);
        res.status(200).json(ApiResponse.success(order, 'Return details fetched'));
    }),

    // Update return status (Order + Payment Status)
    updateReturnStatus: asyncHandler(async (req, res) => {
        const order = await adminService.updateReturnStatus(req.params.orderCode, req.body, req.userId);
        res.status(200).json(ApiResponse.success(order, 'Return status updated successfully'));
    }),

    // Export Returns PDF
    exportReturnsPDF: asyncHandler(async (req, res) => {
        const { doc, content } = await adminService.exportReturnsPDF();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="returns-report.pdf"');
        doc.pipe(res);
        content();
    }),

    // ============ REVIEW CONTROLLER ============

    // getReviewDashboard: asyncHandler(async (req, res) => {
    //     const data = await adminService.getReviewDashboard();
    //     res.status(200).json(ApiResponse.success(data, 'Review dashboard stats fetched'));
    // }),

    // getAllReviews: asyncHandler(async (req, res) => {
    //     const result = await adminService.getAllReviews(req.query);
    //     res.status(200).json(ApiResponse.paginated(result.reviews, result.pagination, 'Reviews fetched successfully'));
    // }),

    // getReviewDetails: asyncHandler(async (req, res) => {
    //     const review = await adminService.getReviewDetails(req.params.reviewCode);
    //     res.status(200).json(ApiResponse.success(review, 'Review details fetched'));
    // }),

    // moderateReview: asyncHandler(async (req, res) => {
    //     const review = await adminService.moderateReview(req.params.reviewCode, req.body, req.userId);
    //     res.status(200).json(ApiResponse.success(review, 'Review moderated successfully'));
    // }),

    // getAllReviewReports: asyncHandler(async (req, res) => {
    //     const result = await adminService.getAllReviewReports(req.query);
    //     res.status(200).json(ApiResponse.paginated(result.reports, result.pagination, 'Reports fetched successfully'));
    // }),

    // updateReviewReport: asyncHandler(async (req, res) => {
    //     const report = await adminService.updateReviewReport(req.params.reportId, req.body, req.userId);
    //     res.status(200).json(ApiResponse.success(report, 'Report updated successfully'));
    // }),

    // getReviewAnalytics: asyncHandler(async (req, res) => {
    //     const data = await adminService.getReviewAnalytics();
    //     res.status(200).json(ApiResponse.success(data, 'Review analytics fetched'));
    // }),

    // ============ PAYMENT CONTROLLER ============

    // All Payments
    getAllPayments: asyncHandler(async (req, res) => {
        const { page, limit, search, status } = req.query;
        const result = await adminService.getAllPayments({ page, limit, search, status });
        res.status(200).json({ success: true, data: result.payments, stats: result.stats, pagination: result.pagination });
    }),

    // Payment Details
    getPaymentDetails: asyncHandler(async (req, res) => {
        const { paymentCode } = req.params;
        const payment = await adminService.getPaymentDetails(paymentCode);
        res.status(200).json(ApiResponse.success(payment, 'Payment details fetched'));
    }),

    // update paayment status
    updatePaymentStatus: asyncHandler(async (req, res) => {
        const { paymentCode } = req.params;
        const payment = await adminService.updatePaymentStatus(paymentCode, req.body, req.userId);
        res.status(200).json(ApiResponse.success(payment, 'Payment status updated'));
    }),

    // Get Financial Summary
    getFinancialSummary: asyncHandler(async (req, res) => {
        const { startDate, endDate } = req.query;
        const summary = await adminService.getFinancialSummary({ startDate, endDate });
        res.status(200).json(ApiResponse.success(summary, 'Financial summary fetched'));
    }),

    // Export Accounting PDF
    exportAccountingPDF: asyncHandler(async (req, res) => {
        const { startDate, endDate } = req.query;
        const filePath = await adminService.exportAccountingPDF(startDate, endDate);
        res.download(filePath, 'accounting-report.pdf');
    }),

    // ============ COMPNAY GENERAL FINANCE CONTROLLER ============ 

    // All Entries
    getFinanceEntries: asyncHandler(async (req, res) => {
        const result = await adminService.getFinanceEntries(req.query);
        res.status(200).json({
            success: true,
            data: result.entries,
            totalIncome: result.totalIncome,
            totalExpense: result.totalExpense,
            pagination: result.pagination
        });
    }),

    // Add Entry
    addFinanceEntry: asyncHandler(async (req, res) => {
        const entry = await adminService.addFinanceEntry(req.body, req.userId);
        res.status(201).json(ApiResponse.created(entry, 'Entry added successfully'));
    }),

    // Update Entry 
    updateFinanceEntry: asyncHandler(async (req, res) => {
        const entry = await adminService.updateFinanceEntry(req.params.entryId, req.body, req.userId);
        res.status(200).json(ApiResponse.success(entry, 'Entry updated successfully'));
    }),

    // Delete Entry 
    deleteFinanceEntry: asyncHandler(async (req, res) => {
        await adminService.deleteFinanceEntry(req.params.entryId);
        res.status(200).json(ApiResponse.success(null, 'Entry deleted successfully'));
    }),

    // Exports Reports
    exportFinancePDF: asyncHandler(async (req, res) => {
        const filePath = await adminService.exportFinancePDF();
        res.download(filePath, 'finance-report.pdf');
    }),

    // Export transaction reports
    exportTransactionsPDF: asyncHandler(async (req, res) => {
        const filePath = await adminService.exportTransactionsPDF();
        res.download(filePath, 'transactions-report.pdf');
    }),


    // ============ TRANSACTION CONTROLLER ============

    // Get All Transaction
    getAllTransactions: asyncHandler(async (req, res) => {
        const { page, limit, search, status } = req.query;
        const result = await adminService.getAllTransactions({ page, limit, search, status });
        res.status(200).json({ success: true, data: result.transactions, stats: result.stats, pagination: result.pagination });
    }),

    // Transaction Details
    getTransactionDetails: asyncHandler(async (req, res) => {
        const { transactionCode } = req.params;
        const transaction = await adminService.getTransactionDetails(transactionCode);
        res.status(200).json(ApiResponse.success(transaction, 'Transaction details fetched'));
    }),


    // ============  CONTROLLER ============

    // Get all returns
    getAllReturns: asyncHandler(async (req, res) => {
        const result = await adminService.getAllReturns(req.query);
        res.status(200).json({
            success: true,
            data: result.returns,
            stats: result.stats,
            pagination: result.pagination
        });
    }),

    // Get single return by order code
    getReturnByOrderCode: asyncHandler(async (req, res) => {
        const returnRequest = await adminService.getReturnByOrderCode(req.params.orderCode);
        res.status(200).json(ApiResponse.success(returnRequest, 'Return details fetched'));
    }),

    // Update return status
    updateReturnStatus: asyncHandler(async (req, res) => {
        const returnRequest = await adminService.updateReturnStatus(req.params.orderCode, req.body, req.userId);
        res.status(200).json(ApiResponse.success(returnRequest, 'Return status updated successfully'));
    }),

    // Export returns PDF
    exportReturnsPDF: asyncHandler(async (req, res) => {
        const { doc, content } = await adminService.exportReturnsPDF();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="returns-report.pdf"');
        doc.pipe(res);
        content();
    }),

    // ============ NOTIFICATION CONTROLLER  ============

    // Get All Notification
    getAllNotifications: asyncHandler(async (req, res) => {
        const result = await adminService.getAllNotifications(req.query);
        res.status(200).json({
            success: true,
            data: result.notifications,
            stats: result.stats,
            pagination: result.pagination
        });
    }),

    // Get Notificaion by ID 
    getNotificationByCode: asyncHandler(async (req, res) => {
        const notification = await adminService.getNotificationByCode(req.params.notificationCode);
        res.status(200).json(ApiResponse.success(notification, 'Notification details fetched'));
    }),

    // Mark As Read
    markNotificationAsRead: asyncHandler(async (req, res) => {
        const notification = await adminService.markNotificationAsRead(req.params.notificationCode);
        res.status(200).json(ApiResponse.success(notification, 'Notification marked as read'));
    }),

    // Mark All As Read
    markAllNotificationsAsRead: asyncHandler(async (req, res) => {
        const result = await adminService.markAllNotificationsAsRead();
        res.status(200).json(ApiResponse.success(result, 'All notifications marked as read'));
    }),

    // Delete Notification
    deleteNotification: asyncHandler(async (req, res) => {
        const result = await adminService.deleteNotification(req.params.notificationCode);
        res.status(200).json(ApiResponse.success(result, 'Notification deleted successfully'));
    }),

    // Sent/Create Notification
    sendBroadcastNotification: asyncHandler(async (req, res) => {
        const notification = await adminService.sendBroadcastNotification(req.body, req.userId);
        res.status(201).json(ApiResponse.created(notification, 'Notification sent successfully'));
    }),

    // ============ COUPONS CONTROLLER  ============

    // Gel All Coupon
    getAllCoupons: asyncHandler(async (req, res) => {
        const result = await adminService.getAllCoupons(req.query);
        res.status(200).json({
            success: true,
            data: result.coupons,
            stats: result.stats,
            pagination: result.pagination
        });
    }),

    // Get Coupon Details
    getCouponByCode: asyncHandler(async (req, res) => {
        const coupon = await adminService.getCouponByCode(req.params.code);
        res.status(200).json(ApiResponse.success(coupon, 'Coupon details fetched'));
    }),

    // Create Coupon
    createCoupon: asyncHandler(async (req, res) => {
        const coupon = await adminService.createCoupon(req.body, req.userId);
        res.status(201).json(ApiResponse.created(coupon, 'Coupon created successfully'));
    }),

    // Update coupon
    updateCoupon: asyncHandler(async (req, res) => {
        const coupon = await adminService.updateCoupon(req.params.code, req.body, req.userId);
        res.status(200).json(ApiResponse.success(coupon, 'Coupon updated successfully'));
    }),

    // Delete Coupon
    deleteCoupon: asyncHandler(async (req, res) => {
        await adminService.deleteCoupon(req.params.code);
        res.status(200).json(ApiResponse.success(null, 'Coupon deleted successfully'));
    }),


    // ==================== REPORTS CONTROLLER ====================

    getReportData: asyncHandler(async (req, res) => {
        const result = await adminService.getReportData(req.params.reportType, req.query);
        res.status(200).json({ success: true, data: result.data });
    }),

    exportReportPDF: asyncHandler(async (req, res) => {
        const { reportType } = req.params;
        const { doc, content } = await adminService.exportReportPDF(reportType, req.query);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.pdf"`);
        doc.pipe(res);
        content();
    }),


    // ============ SYSTEM SETTINGS ============
    getSystemSettings: asyncHandler(async (req, res) => {
        const { group } = req.query;
        const settings = await adminService.getSystemSettings(group);
        res.status(200).json(
            ApiResponse.success(settings, 'System settings fetched successfully')
        );
    }),

    // updateSystemSetting: asyncHandler(async (req, res) => {

    //     const { key } = req.params;
    //     const { value } = req.body;
    //     const setting = await adminService.updateSystemSetting(key, value, req.userId);

    //     await auditService.log({
    //         userId: req.userId,
    //         action: 'update',
    //         module: 'settings',
    //         moduleId: setting._id,
    //         description: `System setting ${key} updated`,
    //         newData: { key, value },
    //         ip: req.ip,
    //         userAgent: req.get('user-agent'),
    //         status: 'success'
    //     });

    //     res.status(200).json(
    //         ApiResponse.success(setting, 'Setting updated successfully')
    //     );
    // }),

    getSettingsByGroup: asyncHandler(async (req, res) => {
        const { group } = req.params;
        const settings = await adminService.getSettingsByGroup(group);
        res.status(200).json(
            ApiResponse.success(settings, `Settings for group ${group} fetched successfully`)
        );
    }),

    // Bulk update settings by group
    updateSettingsByGroup: asyncHandler(async (req, res) => {
        const { group } = req.params;
        const { settings } = req.body; // { key1: value1, key2: value2 }
        const userId = req.userId;

        // Call service method (make sure it exists)
        const updated = await adminService.updateSettingsByGroup(group, settings, userId);

        // Log audit (optional)
        await auditService.log({
            userId,
            action: 'update',
            module: 'settings',
            description: `Bulk update for group ${group}`,
            newData: settings,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            status: 'success'
        });

        res.status(200).json(
            ApiResponse.success(updated, 'Settings updated successfully')
        );
    }),


    // ============ AUDIT LOGS ============
    getAuditLogs: asyncHandler(async (req, res) => {
        const {
            page, limit, module, action, user_type, start_date, end_date
        } = req.query;

        const result = await adminService.getAuditLogs({
            page, limit, module, action,
            userType: user_type,
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.logs,
                result.pagination,
                'Audit logs fetched successfully'
            )
        );
    }),

    getAuditLogById: asyncHandler(async (req, res) => {
        const { logId } = req.params;
        const log = await adminService.getAuditLogById(logId);
        res.status(200).json(
            ApiResponse.success(log, 'Audit log details fetched successfully')
        );
    }),




};

module.exports = adminController;