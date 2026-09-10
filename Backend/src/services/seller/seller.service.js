// Handles all seller related business logic
// Manages seller profile, dashboard, documents, products, orders
// Also handles employees, reports, and settings

const Seller = require('../../models/seller.model');
const User = require('../../models/user.model');
const Product = require('../../models/product.model');
const Order = require('../../models/order.model');
const OrderItem = require('../../models/order_item.model');
const Employee = require('../../models/employee.model');
const EmployeeRoleHistory = require('../../models/employee_role_history.model');
const Review = require('../../models/review.model');
const Notification = require('../../models/notification.model');
const ApiError = require('../../utils/apiError');
const cloudinaryHelper = require('../../utils/cloudinary.helper');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');


class SellerService {

    // ============ PUBLIC PROFILE ============
    async getPublicProfile(sellerId) {
        const seller = await Seller.findById(sellerId)
            .select('business_name owner_name business_type business_address rating total_orders total_revenue')
            .populate('user_id', 'first_name last_name profile_image');

        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const productCount = await Product.countDocuments({
            seller_id: sellerId,
            status: 'active'
        });

        const reviewCount = await Review.countDocuments({
            seller_id: sellerId,
            review_status: 'approved'
        });

        return {
            ...seller.toObject(),
            productCount,
            reviewCount
        };
    }

    async getSellerProducts({ sellerId, page = 1, limit = 10, category = null, sortBy = 'created_at', sortOrder = 'desc' }) {
        const query = {
            seller_id: sellerId,
            status: 'active',
            approval_status: 'approved'
        };

        if (category) {
            query.category_id = category;
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category_id', 'category_name')
                .populate('sub_category_id', 'sub_category_name')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Product.countDocuments(query)
        ]);

        return {
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getSellerReviews({ sellerId, page = 1, limit = 10, rating = null }) {
        const query = {
            seller_id: sellerId,
            review_status: 'approved'
        };

        if (rating) {
            query.rating = parseInt(rating);
        }

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate('user_id', 'first_name last_name profile_image')
                .populate('product_id', 'product_name images')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Review.countDocuments(query)
        ]);

        return {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ============ SELLER PROFILE ============
    async getProfile(sellerId) {
        const seller = await Seller.findById(sellerId)
            .populate('user_id', 'first_name last_name email mobile_number profile_image')
            .populate('approved_by', 'first_name last_name email');

        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        return seller;
    }

    async updateProfile(sellerId, updateData) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const allowedFields = [
            'business_name', 'business_address', 'bank_details',
            'settings', 'business_type', 'owner_name'
        ];

        const filteredData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        Object.assign(seller, filteredData);
        await seller.save();

        return seller;
    }


    // ============ DASHBOARD ============
    async getDashboard(sellerId) {
        const [totalProducts, totalOrders, totalRevenue, pendingOrders, recentOrders, lowStock] = await Promise.all([
            Product.countDocuments({ seller_id: sellerId }),
            Order.countDocuments({ seller_id: sellerId }),
            Order.aggregate([
                { $match: { seller_id: sellerId, payment_status: constants.PAYMENT_STATUS.PAID } },
                { $group: { _id: null, total: { $sum: '$total_amount' } } }
            ]),
            Order.countDocuments({ seller_id: sellerId, order_status: constants.ORDER_STATUS.PENDING }),
            Order.find({ seller_id: sellerId })
                .populate('user_id', 'first_name last_name email')
                .sort({ created_at: -1 })
                .limit(5),
            Product.find({ seller_id: sellerId, quantity: { $lte: 10 }, status: 'active' })
                .select('product_name quantity sku')
        ]);

        return {
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingOrders,
            recentOrders,
            lowStock
        };
    }

    async getDashboardStatistics(sellerId, period = 'weekly') {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'monthly':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'yearly':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 7));
        }

        const [dailyOrders, dailyRevenue, topProducts] = await Promise.all([
            Order.aggregate([
                { $match: { seller_id: sellerId, created_at: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                { $match: { seller_id: sellerId, created_at: { $gte: startDate }, payment_status: constants.PAYMENT_STATUS.PAID } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        total: { $sum: '$total_amount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            OrderItem.aggregate([
                { $match: { seller_id: sellerId } },
                {
                    $group: {
                        _id: '$product_id',
                        totalSold: { $sum: '$quantity' },
                        totalRevenue: { $sum: '$total_price' }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $project: {
                        productId: '$_id',
                        productName: '$product.product_name',
                        totalSold: 1,
                        totalRevenue: 1
                    }
                }
            ])
        ]);

        return {
            period,
            dailyOrders,
            dailyRevenue,
            topProducts
        };
    }

    // ============ DOCUMENTS ============
    async uploadDocument({ sellerId, documentType, file }) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const result = await cloudinaryHelper.uploadFile(file.path, {
            folder: `sellers/${sellerId}/documents`,
            resource_type: 'auto'
        });

        const document = {
            document_type: documentType,
            document_url: result.url,
            uploaded_at: new Date(),
            verified: false
        };

        seller.documents.push(document);
        await seller.save();

        return document;
    }

    async deleteDocument(sellerId, documentId) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const documentIndex = seller.documents.findIndex(
            doc => doc._id.toString() === documentId
        );

        if (documentIndex === -1) {
            throw ApiError.notFound('Document not found');
        }

        const document = seller.documents[documentIndex];
        if (document.document_url) {
            const publicId = document.document_url.split('/').pop().split('.')[0];
            await cloudinaryHelper.deleteFile(publicId);
        }

        seller.documents.splice(documentIndex, 1);
        await seller.save();

        return { message: 'Document deleted successfully' };
    }

    async getDocuments(sellerId) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        return seller.documents;
    }

    // ============ PRODUCTS ============
    async getMyProducts({ sellerId, page = 1, limit = 10, status = null, category = null, search = null }) {
        const query = { seller_id: sellerId };

        if (status) {
            query.status = status;
        }

        if (category) {
            query.category_id = category;
        }

        if (search) {
            query.$or = [
                { product_name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category_id', 'category_name')
                .populate('sub_category_id', 'sub_category_name')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Product.countDocuments(query)
        ]);

        return {
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async createProduct(sellerId, productData) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        // Calculate final price
        let finalPrice = productData.price;
        if (productData.discount) {
            finalPrice = productData.price - (productData.price * productData.discount / 100);
        }

        const product = new Product({
            ...productData,
            seller_id: sellerId,
            final_price: finalPrice,
            status: 'draft',
            approval_status: 'pending'
        });

        await product.save();

        return product;
    }

    // ============ ORDERS ============
    async getOrders({ sellerId, page = 1, limit = 10, status = null, startDate = null, endDate = null, sortBy = 'created_at', sortOrder = 'desc' }) {
        const query = { seller_id: sellerId };

        if (status) {
            query.order_status = status;
        }

        if (startDate || endDate) {
            query.created_at = {};
            if (startDate) {
                query.created_at.$gte = new Date(startDate);
            }
            if (endDate) {
                query.created_at.$lte = new Date(endDate);
            }
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user_id', 'first_name last_name email mobile_number')
                .populate('order_items')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        return {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getOrderDetails(sellerId, orderId) {
        const order = await Order.findOne({
            _id: orderId,
            seller_id: sellerId
        })
            .populate('user_id', 'first_name last_name email mobile_number')
            .populate({
                path: 'order_items',
                populate: {
                    path: 'product_id',
                    select: 'product_name images sku price'
                }
            });

        if (!order) {
            throw ApiError.notFound('Order not found or unauthorized');
        }

        return order;
    }

    async updateOrderStatus({ sellerId, orderId, status, notes, trackingId, trackingCarrier, trackingUrl }) {
        const order = await Order.findOne({
            _id: orderId,
            seller_id: sellerId
        });

        if (!order) {
            throw ApiError.notFound('Order not found or unauthorized');
        }

        const oldStatus = order.order_status;
        order.order_status = status;

        if (notes) {
            order.admin_notes = notes;
        }

        if (trackingId) {
            order.tracking_id = trackingId;
        }

        if (trackingCarrier) {
            order.tracking_carrier = trackingCarrier;
        }

        if (trackingUrl) {
            order.tracking_url = trackingUrl;
        }

        // Add to status history
        order.status_history.push({
            status: status,
            updated_by: sellerId,
            notes: notes || '',
            timestamp: new Date()
        });

        if (status === constants.ORDER_STATUS.DELIVERED) {
            order.delivered_at = new Date();
        }

        await order.save();

        // Update order items status
        await OrderItem.updateMany(
            { order_id: orderId },
            { item_status: status }
        );

        // Create notification for customer
        await Notification.create({
            user_id: order.user_id,
            receiver_type: 'customer',
            title: `Order Status Updated - #${order.order_number}`,
            message: `Your order #${order.order_number} is now ${status}`,
            notification_type: 'order',
            reference_id: order._id,
            reference_model: 'Order',
            channel: 'in_app'
        });

        return order;
    }

    // ============ EMPLOYEES ============
    async getEmployees({ sellerId, page = 1, limit = 10, status = null, employeeType = null }) {
        const query = { seller_id: sellerId };

        if (status) {
            query.status = status;
        }

        if (employeeType) {
            query.employee_type = employeeType;
        }

        const [employees, total] = await Promise.all([
            Employee.find(query)
                .populate('user_id', 'first_name last_name email mobile_number profile_image')
                .populate('role_ids')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            Employee.countDocuments(query)
        ]);

        return {
            employees,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async createEmployee(sellerId, employeeData) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const { user_id, employee_type, role_ids, designation, department, joining_date } = employeeData;

        const user = await User.findById(user_id);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        // Check if user already an employee
        const existingEmployee = await Employee.findOne({ user_id });
        if (existingEmployee) {
            throw ApiError.conflict('User is already an employee');
        }

        // Check if user is already a seller
        if (user.user_type === constants.USER_TYPES.SELLER) {
            throw ApiError.badRequest('Seller cannot be added as employee');
        }

        const employee = new Employee({
            user_id,
            seller_id: sellerId,
            employee_type,
            role_ids: role_ids || [],
            designation,
            department,
            joining_date: joining_date || new Date(),
            created_by: seller.user_id,
            status: 'active'
        });

        await employee.save();

        // Update user
        user.user_type = constants.USER_TYPES.SELLER_EMPLOYEE;
        user.employee_id = employee._id;
        user.seller_id = sellerId;
        await user.save();

        // Create role history
        if (role_ids && role_ids.length > 0) {
            await EmployeeRoleHistory.create({
                employee_id: employee._id,
                old_role_ids: [],
                new_role_ids: role_ids,
                changed_by: seller.user_id,
                change_reason: 'Initial role assignment'
            });
        }

        // Create notification for employee
        await Notification.create({
            user_id: user_id,
            receiver_type: 'seller_employee',
            title: 'Welcome to the Team',
            message: `You have been added as ${employee_type} for ${seller.business_name}`,
            notification_type: 'employee',
            reference_id: employee._id,
            reference_model: 'Employee',
            channel: 'in_app',
            priority: 'high'
        });

        logger.info(`Employee created: ${user.email} for seller: ${seller.business_name}`, { employeeId: employee._id });

        return employee;
    }

    async updateEmployee(sellerId, employeeId, updateData) {
        const employee = await Employee.findOne({
            _id: employeeId,
            seller_id: sellerId
        });

        if (!employee) {
            throw ApiError.notFound('Employee not found or unauthorized');
        }

        const allowedFields = ['employee_type', 'designation', 'department', 'role_ids', 'status', 'notes'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        // Track role changes
        if (updateData.role_ids) {
            const oldRoleIds = employee.role_ids || [];
            const newRoleIds = updateData.role_ids;

            await EmployeeRoleHistory.create({
                employee_id: employee._id,
                old_role_ids: oldRoleIds,
                new_role_ids: newRoleIds,
                changed_by: sellerId,
                change_reason: updateData.reason || 'Role updated'
            });
        }

        Object.assign(employee, filteredData);
        await employee.save();

        // Update user status if changed
        if (updateData.status) {
            const userStatus = updateData.status === 'active' ? 'active' : 'inactive';
            await User.findByIdAndUpdate(employee.user_id, {
                account_status: userStatus
            });
        }

        return employee;
    }

    async deleteEmployee(sellerId, employeeId) {
        const employee = await Employee.findOne({
            _id: employeeId,
            seller_id: sellerId
        });

        if (!employee) {
            throw ApiError.notFound('Employee not found or unauthorized');
        }

        // Update user
        await User.findByIdAndUpdate(employee.user_id, {
            user_type: constants.USER_TYPES.CUSTOMER,
            employee_id: null,
            seller_id: null,
            account_status: constants.ACCOUNT_STATUS.ACTIVE
        });

        employee.status = 'inactive';
        await employee.save();

        logger.info(`Employee removed: ${employeeId} from seller: ${sellerId}`);

        return { message: 'Employee removed successfully' };
    }

    // ============ REPORTS ============
    async getPerformanceReport({ sellerId, startDate, endDate }) {
        const matchQuery = {
            seller_id: sellerId,
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const [orders, revenue, topProducts, orderStatusDistribution] = await Promise.all([
            Order.countDocuments(matchQuery),
            Order.aggregate([
                { $match: { ...matchQuery, payment_status: constants.PAYMENT_STATUS.PAID } },
                { $group: { _id: null, total: { $sum: '$total_amount' } } }
            ]),
            OrderItem.aggregate([
                { $match: { seller_id: sellerId } },
                {
                    $group: {
                        _id: '$product_id',
                        totalSold: { $sum: '$quantity' },
                        totalRevenue: { $sum: '$total_price' }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $project: {
                        productId: '$_id',
                        productName: '$product.product_name',
                        totalSold: 1,
                        totalRevenue: 1
                    }
                }
            ]),
            Order.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$order_status',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        return {
            period: { startDate, endDate },
            totalOrders: orders,
            totalRevenue: revenue[0]?.total || 0,
            topProducts,
            orderStatusDistribution
        };
    }

    async getSalesReport({ sellerId, startDate, endDate, period = 'daily' }) {
        const matchQuery = {
            seller_id: sellerId,
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        let dateFormat;
        switch (period) {
            case 'daily':
                dateFormat = '%Y-%m-%d';
                break;
            case 'weekly':
                dateFormat = '%Y-%W';
                break;
            case 'monthly':
                dateFormat = '%Y-%m';
                break;
            default:
                dateFormat = '%Y-%m-%d';
        }

        const salesData = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: '$created_at' } },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$total_amount' },
                    averageOrderValue: { $avg: '$total_amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return {
            period,
            salesData
        };
    }

    async getAnalytics(sellerId, period = 'monthly') {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'monthly':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'yearly':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setMonth(now.getMonth() - 1));
        }

        const [customerCount, repeatCustomerRate, averageRating] = await Promise.all([
            Order.distinct('user_id', { seller_id: sellerId }).then(users => users.length),
            Order.aggregate([
                { $match: { seller_id: sellerId } },
                { $group: { _id: '$user_id', count: { $sum: 1 } } },
                { $group: { _id: null, avg: { $avg: '$count' } } }
            ]),
            Review.aggregate([
                { $match: { seller_id: sellerId, review_status: 'approved' } },
                { $group: { _id: null, avg: { $avg: '$rating' } } }
            ])
        ]);

        return {
            period,
            customerCount,
            repeatCustomerRate: repeatCustomerRate[0]?.avg || 0,
            averageRating: averageRating[0]?.avg || 0
        };
    }

    // ============ SETTINGS ============
    async getSettings(sellerId) {
        const seller = await Seller.findById(sellerId).select('settings commission_rate');
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        return {
            settings: seller.settings || {},
            commission_rate: seller.commission_rate || 10
        };
    }

    async updateSettings(sellerId, settingsData) {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            throw ApiError.notFound('Seller not found');
        }

        const allowedFields = ['order_processing_time', 'return_policy', 'shipping_methods'];

        if (!seller.settings) {
            seller.settings = {};
        }

        for (const field of allowedFields) {
            if (settingsData[field] !== undefined) {
                seller.settings[field] = settingsData[field];
            }
        }

        if (settingsData.commission_rate !== undefined) {
            seller.commission_rate = settingsData.commission_rate;
        }

        await seller.save();

        return seller.settings;
    }
}

module.exports = new SellerService();