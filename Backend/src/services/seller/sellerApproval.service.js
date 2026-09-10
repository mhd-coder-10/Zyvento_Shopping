// Handles seller approval business logic
// Manages pending sellers, approval/rejection, bulk actions
// Also handles approval statistics and history

const Seller = require('../../models/seller.model');
const User = require('../../models/user.model');
const Product = require('../../models/product.model');
const AuditLog = require('../../models/audit_log.model');
const Notification = require('../../models/notification.model');
const ApiError = require('../../utils/apiError');
const emailHelper = require('../../utils/emailHelper');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');

class SellerApprovalService {

    // ============ GET PENDING SELLERS ============
    async getPendingSellers({ page = 1, limit = 10, search = null }) {
        const query = {
            verification_status: constants.VERIFICATION_STATUS.PENDING
        };

        if (search) {
            query.$or = [
                { business_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { owner_name: { $regex: search, $options: 'i' } },
                { business_registration_number: { $regex: search, $options: 'i' } }
            ];
        }

        const [sellers, total] = await Promise.all([
            Seller.find(query)
                .populate('user_id', 'first_name last_name email mobile_number')
                .sort({ created_at: 1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Seller.countDocuments(query)
        ]);

        return {
            sellers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ GET ALL SELLERS WITH FILTERS ============
    async getAllSellers({
        page = 1,
        limit = 10,
        search = null,
        verificationStatus = null,
        accountStatus = null,
        businessType = null,
        sortBy = 'created_at',
        sortOrder = 'desc'
    }) {
        const query = {};

        if (verificationStatus) {
            query.verification_status = verificationStatus;
        }

        if (accountStatus) {
            query.account_status = accountStatus;
        }

        if (businessType) {
            query.business_type = businessType;
        }

        if (search) {
            query.$or = [
                { business_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { owner_name: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [sellers, total] = await Promise.all([
            Seller.find(query)
                .populate('user_id', 'first_name last_name email mobile_number profile_image')
                .populate('approved_by', 'first_name last_name email')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Seller.countDocuments(query)
        ]);

        return {
            sellers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ GET SELLER FOR APPROVAL ============
    async getSellerForApproval(sellerId) {
        const seller = await Seller.findById(sellerId)
            .populate('user_id', 'first_name last_name email mobile_number profile_image')
            .populate('approved_by', 'first_name last_name email');

        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        return seller;
    }

    // ============ APPROVE SELLER ============
    async approveSeller({ sellerId, adminId, notes = '' }) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        if (seller.verification_status !== constants.VERIFICATION_STATUS.PENDING) {
            throw ApiError.badRequest('Seller is not in pending state');
        }

        // Update seller
        seller.verification_status = constants.VERIFICATION_STATUS.APPROVED;
        seller.account_status = constants.ACCOUNT_STATUS.ACTIVE;
        seller.approved_by = adminId;
        seller.approved_at = new Date();
        await seller.save();

        // Update user
        await User.findByIdAndUpdate(seller.user_id, {
            account_status: constants.ACCOUNT_STATUS.ACTIVE
        });

        // Create notification for seller
        await Notification.create({
            user_id: seller.user_id,
            receiver_type: 'seller',
            title: 'Seller Account Approved',
            message: `Your seller account "${seller.business_name}" has been approved. You can now start selling.`,
            notification_type: 'seller',
            reference_id: seller._id,
            reference_model: 'Seller',
            channel: 'in_app',
            priority: 'high'
        });

        // Send email
        await emailHelper.sendSellerApprovalEmail(
            seller.email,
            seller.business_name,
            'approved'
        );

        // Log audit
        await AuditLog.create({
            user_id: adminId,
            action: 'approve',
            module: 'seller',
            description: `Seller ${seller.business_name} approved`,
            new_data: { sellerId: seller._id, notes }
        });

        // Log important event - Seller approved
        logger.important('Seller approved', {
            sellerId: seller._id,
            businessName: seller.business_name,
            email: seller.email,
            approvedBy: adminId
        });

        logger.info(`Seller approved: ${seller.email}`, { sellerId: seller._id, adminId });

        return seller;
    }

    // ============ REJECT SELLER ============
    async rejectSeller({ sellerId, rejectionReason }) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        if (seller.verification_status !== constants.VERIFICATION_STATUS.PENDING) {
            throw ApiError.badRequest('Seller is not in pending state');
        }

        // Update seller
        seller.verification_status = constants.VERIFICATION_STATUS.REJECTED;
        seller.rejection_reason = rejectionReason;
        seller.account_status = constants.ACCOUNT_STATUS.INACTIVE;
        await seller.save();

        // Update user
        await User.findByIdAndUpdate(seller.user_id, {
            account_status: constants.ACCOUNT_STATUS.INACTIVE
        });

        // Create notification for seller
        await Notification.create({
            user_id: seller.user_id,
            receiver_type: 'seller',
            title: 'Seller Account Rejected',
            message: `Your seller account "${seller.business_name}" has been rejected. Reason: ${rejectionReason}`,
            notification_type: 'seller',
            reference_id: seller._id,
            reference_model: 'Seller',
            channel: 'in_app',
            priority: 'high'
        });

        // Send email
        await emailHelper.sendSellerApprovalEmail(
            seller.email,
            seller.business_name,
            'rejected',
            rejectionReason
        );

        // Log audit
        await AuditLog.create({
            user_id: adminId,
            action: 'reject',
            module: 'seller',
            description: `Seller ${seller.business_name} rejected`,
            new_data: { sellerId: seller._id, rejectionReason }
        });

        // Log important event - Seller rejected
        logger.important('Seller rejected', {
            sellerId: seller._id,
            businessName: seller.business_name,
            email: seller.email,
            reason: rejectionReason
        });

        logger.info(`Seller rejected: ${seller.email}`, { sellerId: seller._id });

        return seller;
    }

    // ============ BULK APPROVE SELLERS ============
    async bulkApproveSellers({ sellerIds, adminId, notes = '' }) {
        const results = [];
        const errors = [];

        for (const sellerId of sellerIds) {
            try {
                const seller = await this.approveSeller({ sellerId, adminId, notes });
                results.push({
                    sellerId: seller._id,
                    businessName: seller.business_name,
                    status: 'approved'
                });

                // Log important event - Bulk approve individual
                logger.important('Seller bulk approved', {
                    sellerId: seller._id,
                    businessName: seller.business_name,
                    approvedBy: adminId
                });

            } catch (error) {
                errors.push({
                    sellerId,
                    error: error.message
                });
            }
        }

        // Log important event - Bulk approve summary
        logger.important('Bulk seller approval completed', {
            totalProcessed: sellerIds.length,
            approved: results.length,
            failed: errors.length
        });

        return { success: results, errors };
    }

    // ============ BULK REJECT SELLERS ============
    async bulkRejectSellers({ sellerIds, rejectionReason }) {
        const results = [];
        const errors = [];

        for (const sellerId of sellerIds) {
            try {
                const seller = await this.rejectSeller({ sellerId, rejectionReason });
                results.push({
                    sellerId: seller._id,
                    businessName: seller.business_name,
                    status: 'rejected'
                });

                // Log important event - Bulk reject individual
                logger.important('Seller bulk rejected', {
                    sellerId: seller._id,
                    businessName: seller.business_name,
                    reason: rejectionReason
                });

            } catch (error) {
                errors.push({
                    sellerId,
                    error: error.message
                });
            }
        }

        // Log important event - Bulk reject summary
        logger.important('Bulk seller rejection completed', {
            totalProcessed: sellerIds.length,
            rejected: results.length,
            failed: errors.length
        });

        return { success: results, errors };
    }

    // ============ GET APPROVAL STATISTICS ============
    async getApprovalStatistics() {
        const [total, pending, approved, rejected, suspended] = await Promise.all([
            Seller.countDocuments(),
            Seller.countDocuments({ verification_status: constants.VERIFICATION_STATUS.PENDING }),
            Seller.countDocuments({ verification_status: constants.VERIFICATION_STATUS.APPROVED }),
            Seller.countDocuments({ verification_status: constants.VERIFICATION_STATUS.REJECTED }),
            Seller.countDocuments({ verification_status: constants.VERIFICATION_STATUS.SUSPENDED })
        ]);

        // Monthly approval trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrend = await Seller.aggregate([
            {
                $match: {
                    approved_at: { $gte: sixMonthsAgo },
                    verification_status: constants.VERIFICATION_STATUS.APPROVED
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$approved_at' },
                        year: { $year: '$approved_at' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return {
            total,
            pending,
            approved,
            rejected,
            suspended,
            monthlyTrend
        };
    }

    // ============ GET APPROVAL HISTORY ============
    async getApprovalHistory({ sellerId, page = 1, limit = 10 }) {
        // Get seller first to verify existence
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        // Get audit logs related to this seller
        const [history, total] = await Promise.all([
            AuditLog.find({
                module: 'seller',
                'new_data.sellerId': sellerId
            })
                .populate('user_id', 'first_name last_name email')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            AuditLog.countDocuments({
                module: 'seller',
                'new_data.sellerId': sellerId
            })
        ]);

        return {
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = new SellerApprovalService();