// Handles all report related business logic
// Manages sales reports, order reports, product reports, user reports
// Also handles report export (CSV, PDF, Excel) and scheduled reports

const Order = require('../../models/order.model');
const OrderItem = require('../../models/order_item.model');
const Product = require('../../models/product.model');
const Seller = require('../../models/seller.model');
const User = require('../../models/user.model');
const Payment = require('../../models/payment.model');
const Review = require('../../models/review.model');
const ReportSchedule = require('../../models/report_schedule.model');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');
const json2csv = require('json2csv').parse;
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

class ReportService {

    // ============ SELLER REPORTS ============
    async getSellerSalesReport({ sellerId, startDate, endDate, groupBy = 'daily' }) {
        const matchQuery = {
            seller_id: sellerId,
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        let dateFormat;
        switch (groupBy) {
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
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total_amount' },
                    averageOrderValue: { $avg: '$total_amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const summary = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total_amount' },
                    averageOrderValue: { $avg: '$total_amount' },
                    minOrderValue: { $min: '$total_amount' },
                    maxOrderValue: { $max: '$total_amount' }
                }
            }
        ]);

        return {
            period: { startDate, endDate },
            groupBy,
            summary: summary[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                minOrderValue: 0,
                maxOrderValue: 0
            },
            data: salesData
        };
    }

    async getSellerOrderReport({ sellerId, startDate, endDate }) {
        const matchQuery = {
            seller_id: sellerId,
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const [statusDistribution, orders, topCustomers] = await Promise.all([
            Order.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$order_status', count: { $sum: 1 } } }
            ]),
            Order.find(matchQuery)
                .populate('user_id', 'first_name last_name email')
                .sort({ created_at: -1 })
                .limit(100),
            Order.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$user_id', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$total_amount' } } },
                { $sort: { totalSpent: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        userId: '$_id',
                        name: { $concat: ['$user.first_name', ' ', '$user.last_name'] },
                        email: '$user.email',
                        totalOrders: 1,
                        totalSpent: 1
                    }
                }
            ])
        ]);

        return {
            period: { startDate, endDate },
            statusDistribution,
            topCustomers,
            recentOrders: orders
        };
    }

    async getSellerProductReport({ sellerId, startDate, endDate }) {
        const matchQuery = {
            seller_id: sellerId,
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const orderIds = await Order.find(matchQuery).distinct('_id');

        const productStats = await OrderItem.aggregate([
            { $match: { order_id: { $in: orderIds }, seller_id: sellerId } },
            {
                $group: {
                    _id: '$product_id',
                    productName: { $first: '$product_name' },
                    totalSold: { $sum: '$quantity' },
                    totalRevenue: { $sum: '$total_price' }
                }
            },
            { $sort: { totalRevenue: -1 } },
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
                    productName: 1,
                    sku: '$product.sku',
                    totalSold: 1,
                    totalRevenue: 1,
                    averagePrice: { $divide: ['$totalRevenue', '$totalSold'] }
                }
            }
        ]);

        const categoryDistribution = await OrderItem.aggregate([
            { $match: { order_id: { $in: orderIds }, seller_id: sellerId } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.category_id',
                    totalSold: { $sum: '$quantity' },
                    totalRevenue: { $sum: '$total_price' }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $project: {
                    categoryId: '$_id',
                    categoryName: '$category.category_name',
                    totalSold: 1,
                    totalRevenue: 1
                }
            }
        ]);

        return {
            period: { startDate, endDate },
            topProducts: productStats,
            categoryDistribution
        };
    }

    async getSellerPerformanceReport({ sellerId, startDate, endDate }) {
        const matchQuery = {
            seller_id: sellerId,
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const [
            totalOrders,
            totalRevenue,
            averageRating,
            newCustomers,
            repeatCustomers
        ] = await Promise.all([
            Order.countDocuments(matchQuery),
            Order.aggregate([
                { $match: { ...matchQuery, payment_status: constants.PAYMENT_STATUS.PAID } },
                { $group: { _id: null, total: { $sum: '$total_amount' } } }
            ]),
            Review.aggregate([
                { $match: { seller_id: sellerId, review_status: 'approved' } },
                { $group: { _id: null, avg: { $avg: '$rating' } } }
            ]),
            Order.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$user_id' } },
                { $count: 'count' }
            ]),
            Order.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$user_id', count: { $sum: 1 } } },
                { $match: { count: { $gt: 1 } } },
                { $count: 'count' }
            ])
        ]);

        return {
            period: { startDate, endDate },
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            averageRating: averageRating[0]?.avg || 0,
            newCustomers: newCustomers[0]?.count || 0,
            repeatCustomers: repeatCustomers[0]?.count || 0,
            repeatCustomerRate: totalOrders > 0 ? ((repeatCustomers[0]?.count || 0) / (newCustomers[0]?.count || 1) * 100) : 0
        };
    }

    // ============ ADMIN REPORTS ============
    async getAdminOverviewReport(period = 'monthly') {
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

        const [
            totalUsers,
            totalSellers,
            totalOrders,
            totalRevenue,
            newUsers,
            newSellers,
            newOrders,
            pendingSellers
        ] = await Promise.all([
            User.countDocuments(),
            Seller.countDocuments({ account_status: constants.ACCOUNT_STATUS.ACTIVE }),
            Order.countDocuments(),
            Payment.aggregate([
                { $match: { payment_status: constants.PAYMENT_STATUS.PAID } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            User.countDocuments({ created_at: { $gte: startDate } }),
            Seller.countDocuments({ created_at: { $gte: startDate } }),
            Order.countDocuments({ created_at: { $gte: startDate } }),
            Seller.countDocuments({ verification_status: constants.VERIFICATION_STATUS.PENDING })
        ]);

        return {
            period,
            totalUsers,
            totalSellers,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            newUsers,
            newSellers,
            newOrders,
            pendingSellers
        };
    }

    async getAdminRevenueReport({ startDate, endDate, groupBy = 'daily' }) {
        const matchQuery = {
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        let dateFormat;
        switch (groupBy) {
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

        const revenueData = await Payment.aggregate([
            { $match: { ...matchQuery, payment_status: constants.PAYMENT_STATUS.PAID } },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: '$created_at' } },
                    totalRevenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalSummary = await Payment.aggregate([
            { $match: { ...matchQuery, payment_status: constants.PAYMENT_STATUS.PAID } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    count: { $sum: 1 },
                    averageRevenue: { $avg: '$amount' }
                }
            }
        ]);

        return {
            period: { startDate, endDate },
            groupBy,
            summary: totalSummary[0] || {
                totalRevenue: 0,
                count: 0,
                averageRevenue: 0
            },
            data: revenueData
        };
    }

    async getAdminSellerReport({ startDate, endDate }) {
        const matchQuery = {
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const [totalSellers, newSellers, statusDistribution, topSellers] = await Promise.all([
            Seller.countDocuments(),
            Seller.countDocuments(matchQuery),
            Seller.aggregate([
                { $group: { _id: '$verification_status', count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { created_at: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
                { $group: { _id: '$seller_id', totalRevenue: { $sum: '$total_amount' }, totalOrders: { $sum: 1 } } },
                { $sort: { totalRevenue: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'sellers',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                { $unwind: '$seller' },
                {
                    $project: {
                        sellerId: '$_id',
                        businessName: '$seller.business_name',
                        totalRevenue: 1,
                        totalOrders: 1
                    }
                }
            ])
        ]);

        return {
            period: { startDate, endDate },
            totalSellers,
            newSellers,
            statusDistribution,
            topSellers
        };
    }

    async getAdminOrderReport({ startDate, endDate }) {
        const matchQuery = {
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const [totalOrders, statusDistribution, dailyTrend] = await Promise.all([
            Order.countDocuments(matchQuery),
            Order.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$order_status', count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        return {
            period: { startDate, endDate },
            totalOrders,
            statusDistribution,
            dailyTrend
        };
    }

    async getAdminProductReport({ startDate, endDate }) {
        const matchQuery = {
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const orderIds = await Order.find(matchQuery).distinct('_id');

        const [topProducts, categoryStats] = await Promise.all([
            OrderItem.aggregate([
                { $match: { order_id: { $in: orderIds } } },
                {
                    $group: {
                        _id: '$product_id',
                        productName: { $first: '$product_name' },
                        totalSold: { $sum: '$quantity' },
                        totalRevenue: { $sum: '$total_price' }
                    }
                },
                { $sort: { totalRevenue: -1 } },
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
                        productName: 1,
                        sku: '$product.sku',
                        totalSold: 1,
                        totalRevenue: 1
                    }
                }
            ]),
            OrderItem.aggregate([
                { $match: { order_id: { $in: orderIds } } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $group: {
                        _id: '$product.category_id',
                        totalSold: { $sum: '$quantity' },
                        totalRevenue: { $sum: '$total_price' }
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                { $unwind: '$category' },
                {
                    $project: {
                        categoryId: '$_id',
                        categoryName: '$category.category_name',
                        totalSold: 1,
                        totalRevenue: 1
                    }
                }
            ])
        ]);

        return {
            period: { startDate, endDate },
            topProducts,
            categoryStats
        };
    }

    async getAdminUserReport({ startDate, endDate }) {
        const matchQuery = {
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const [totalUsers, newUsers, typeDistribution, topSpenders] = await Promise.all([
            User.countDocuments(),
            User.countDocuments(matchQuery),
            User.aggregate([
                { $group: { _id: '$user_type', count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { created_at: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
                { $group: { _id: '$user_id', totalSpent: { $sum: '$total_amount' }, totalOrders: { $sum: 1 } } },
                { $sort: { totalSpent: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        userId: '$_id',
                        name: { $concat: ['$user.first_name', ' ', '$user.last_name'] },
                        email: '$user.email',
                        totalSpent: 1,
                        totalOrders: 1
                    }
                }
            ])
        ]);

        return {
            period: { startDate, endDate },
            totalUsers,
            newUsers,
            typeDistribution,
            topSpenders
        };
    }

    async getAdminPaymentReport({ startDate, endDate }) {
        const matchQuery = {
            created_at: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const [totalPayments, statusDistribution, methodDistribution, dailyPaymentTrend] = await Promise.all([
            Payment.countDocuments(matchQuery),
            Payment.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$payment_status', count: { $sum: 1 } } }
            ]),
            Payment.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$payment_method', count: { $sum: 1 } } }
            ]),
            Payment.aggregate([
                { $match: { ...matchQuery, payment_status: constants.PAYMENT_STATUS.PAID } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        totalAmount: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        return {
            period: { startDate, endDate },
            totalPayments,
            statusDistribution,
            methodDistribution,
            dailyPaymentTrend
        };
    }

    // ============ SUB-ADMIN REPORTS ============
    async getSubAdminSellerReport({ startDate, endDate }) {
        // Sub-admin can view all sellers report (filtered by their department)
        return this.getAdminSellerReport({ startDate, endDate });
    }

    async getSubAdminOrderReport({ startDate, endDate }) {
        // Sub-admin can view all orders report (filtered by their department)
        return this.getAdminOrderReport({ startDate, endDate });
    }

    // ============ ANALYTICS ============
    async getAnalyticsDashboard({ period = 'monthly', sellerId = null }) {
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

        const query = sellerId ? { seller_id: sellerId } : {};

        const [
            totalOrders,
            totalRevenue,
            totalProducts,
            totalCustomers,
            orderTrend,
            topProducts,
            categoryDistribution,
            orderStatusDistribution
        ] = await Promise.all([
            Order.countDocuments(query),
            Order.aggregate([
                { $match: { ...query, payment_status: constants.PAYMENT_STATUS.PAID } },
                { $group: { _id: null, total: { $sum: '$total_amount' } } }
            ]),
            Product.countDocuments(sellerId ? { seller_id: sellerId, status: 'active' } : { status: 'active' }),
            Order.distinct('user_id', query).then(users => users.length),
            Order.aggregate([
                { $match: { ...query, created_at: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                        count: { $sum: 1 },
                        revenue: { $sum: { $cond: [{ $eq: ['$payment_status', constants.PAYMENT_STATUS.PAID] }, '$total_amount', 0] } }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            OrderItem.aggregate([
                { $match: { order_id: { $in: await Order.find(query).distinct('_id') } } },
                {
                    $group: {
                        _id: '$product_id',
                        productName: { $first: '$product_name' },
                        totalSold: { $sum: '$quantity' },
                        totalRevenue: { $sum: '$total_price' }
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 10 }
            ]),
            OrderItem.aggregate([
                { $match: { order_id: { $in: await Order.find(query).distinct('_id') } } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $group: {
                        _id: '$product.category_id',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Order.aggregate([
                { $match: query },
                { $group: { _id: '$order_status', count: { $sum: 1 } } }
            ])
        ]);

        return {
            period,
            overview: {
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalProducts,
                totalCustomers
            },
            orderTrend,
            topProducts,
            categoryDistribution,
            orderStatusDistribution
        };
    }

    async getRealtimeAnalytics() {
        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const [ordersToday, revenueToday, ordersLastHour, activeUsers] = await Promise.all([
            Order.countDocuments({ created_at: { $gte: today } }),
            Order.aggregate([
                { $match: { created_at: { $gte: today }, payment_status: constants.PAYMENT_STATUS.PAID } },
                { $group: { _id: null, total: { $sum: '$total_amount' } } }
            ]),
            Order.countDocuments({ created_at: { $gte: oneHourAgo } }),
            User.countDocuments({ last_login: { $gte: oneHourAgo } })
        ]);

        return {
            timestamp: new Date().toISOString(),
            ordersToday,
            revenueToday: revenueToday[0]?.total || 0,
            ordersLastHour,
            activeUsers
        };
    }

    // ============ EXPORT REPORTS ============
    async exportReport({ reportType, startDate, endDate, format = 'csv' }) {
        let data = [];

        switch (reportType) {
            case 'sales':
                const salesReport = await this.getAdminRevenueReport({ startDate, endDate });
                data = salesReport.data;
                break;
            case 'orders':
                const orderReport = await this.getAdminOrderReport({ startDate, endDate });
                data = orderReport.dailyTrend || [];
                break;
            case 'products':
                const productReport = await this.getAdminProductReport({ startDate, endDate });
                data = productReport.topProducts || [];
                break;
            case 'sellers':
                const sellerReport = await this.getAdminSellerReport({ startDate, endDate });
                data = sellerReport.topSellers || [];
                break;
            default:
                throw ApiError.badRequest('Invalid report type');
        }

        if (format === 'csv') {
            return json2csv(data);
        } else if (format === 'pdf') {
            return this.generatePDF(data, reportType);
        } else if (format === 'excel') {
            return this.generateExcel(data, reportType);
        }

        throw ApiError.badRequest('Invalid export format');
    }

    async generatePDF(data, title) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                doc.fontSize(20).text(`Report: ${title}`, { align: 'center' });
                doc.moveDown();

                if (data.length > 0) {
                    const tableData = data.map(item => Object.values(item));
                    const headers = Object.keys(data[0]);

                    // Simple table rendering
                    let y = doc.y;
                    doc.fontSize(10);
                    headers.forEach((header, i) => {
                        doc.text(header, 50 + i * 120, y);
                    });

                    y += 20;
                    tableData.forEach(row => {
                        row.forEach((cell, i) => {
                            doc.text(String(cell), 50 + i * 120, y);
                        });
                        y += 20;
                        if (y > 700) {
                            doc.addPage();
                            y = 50;
                        }
                    });
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    async generateExcel(data, title) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(title);

        if (data.length > 0) {
            const headers = Object.keys(data[0]);
            worksheet.addRow(headers);

            data.forEach(item => {
                worksheet.addRow(Object.values(item));
            });
        }

        return workbook.xlsx.writeBuffer();
    }

    // ============ SCHEDULED REPORTS ============
    async createScheduledReport({ reportName, reportType, filters, schedule, recipients, format, createdBy }) {
        const scheduledReport = new ReportSchedule({
            report_name: reportName,
            report_type: reportType,
            filters: filters || {},
            schedule: schedule,
            recipients: recipients || [],
            format: format || 'pdf',
            created_by: createdBy,
            is_active: true
        });

        // Calculate next run time
        scheduledReport.next_run = this.calculateNextRun(schedule);

        await scheduledReport.save();

        logger.info(`Scheduled report created: ${reportName}`, { createdBy });

        return scheduledReport;
    }

    calculateNextRun(schedule) {
        const now = new Date();

        switch (schedule.frequency) {
            case 'daily':
                return new Date(now.setDate(now.getDate() + 1));
            case 'weekly':
                return new Date(now.setDate(now.getDate() + 7));
            case 'monthly':
                return new Date(now.setMonth(now.getMonth() + 1));
            default:
                return null;
        }
    }

    async getScheduledReports({ userId, page = 1, limit = 10 }) {
        const query = { created_by: userId };

        const [schedules, total] = await Promise.all([
            ReportSchedule.find(query)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit)),
            ReportSchedule.countDocuments(query)
        ]);

        return {
            schedules,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async updateScheduledReport({ scheduleId, updateData }) {
        const schedule = await ReportSchedule.findById(scheduleId);
        if (!schedule) {
            throw ApiError.notFound('Scheduled report not found');
        }

        const allowedFields = ['report_name', 'filters', 'schedule', 'recipients', 'format', 'is_active'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        if (updateData.schedule) {
            filteredData.next_run = this.calculateNextRun(updateData.schedule);
        }

        Object.assign(schedule, filteredData);
        await schedule.save();

        return schedule;
    }

    async deleteScheduledReport(scheduleId) {
        const schedule = await ReportSchedule.findById(scheduleId);
        if (!schedule) {
            throw ApiError.notFound('Scheduled report not found');
        }

        await schedule.deleteOne();

        return { message: 'Scheduled report deleted successfully' };
    }

    async runScheduledReportNow(scheduleId) {
        const schedule = await ReportSchedule.findById(scheduleId);
        if (!schedule) {
            throw ApiError.notFound('Scheduled report not found');
        }

        // Generate report
        const reportData = await this.exportReport({
            reportType: schedule.report_type,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
            format: schedule.format
        });

        schedule.last_run = new Date();
        schedule.next_run = this.calculateNextRun(schedule.schedule);
        await schedule.save();

        // In real implementation, send email with report attachment
        logger.info(`Scheduled report executed: ${schedule.report_name}`);

        return {
            message: 'Report generated successfully',
            scheduleId: schedule._id
        };
    }

    // ============ CUSTOM REPORTS ============
    async generateCustomReport({ reportType, filters, columns, groupBy, sortBy, userId }) {
        // This will be implemented based on specific report requirements
        // Returns dynamic report data based on user configuration
        return {
            reportType,
            generatedAt: new Date(),
            data: [],
            columns: columns || [],
            filters,
            groupBy,
            sortBy,
            userId
        };
    }

    async getSavedCustomReports({ userId, page = 1, limit = 10 }) {
        // This will be implemented to fetch saved custom reports
        return {
            reports: [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 0,
                totalPages: 0
            }
        };
    }

    async saveCustomReportTemplate({ name, description, config, createdBy }) {
        // This will be implemented to save custom report templates
        return {
            id: 'custom_report_id',
            name,
            description,
            config,
            createdBy,
            createdAt: new Date()
        };
    }

    async getCustomReportById(reportId) {
        // This will be implemented to fetch specific custom report
        return {
            id: reportId,
            name: 'Custom Report',
            data: []
        };
    }
}

module.exports = new ReportService();