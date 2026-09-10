// Handles all report related API requests
// Manages sales reports, order reports, product reports, user reports
// Also handles report export (CSV, PDF, Excel) and scheduled reports

const reportService = require('../../services/report/report.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');

const reportController = {

    // ============ SELLER REPORTS ============
    getSellerSalesReport: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { start_date, end_date, group_by = 'daily' } = req.query;

        const report = await reportService.getSellerSalesReport({
            sellerId,
            startDate: start_date,
            endDate: end_date,
            groupBy: group_by
        });

        res.status(200).json(
            ApiResponse.success(report, 'Sales report generated successfully')
        );
    }),

    getSellerOrderReport: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { start_date, end_date } = req.query;

        const report = await reportService.getSellerOrderReport({
            sellerId,
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(report, 'Order report generated successfully')
        );
    }),

    getSellerProductReport: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { start_date, end_date } = req.query;

        const report = await reportService.getSellerProductReport({
            sellerId,
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(report, 'Product report generated successfully')
        );
    }),

    getSellerPerformanceReport: asyncHandler(async (req, res) => {
        const sellerId = req.sellerId;
        const { start_date, end_date } = req.query;

        const report = await reportService.getSellerPerformanceReport({
            sellerId,
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(report, 'Performance report generated successfully')
        );
    }),

    // ============ ADMIN REPORTS ============
    getAdminOverviewReport: asyncHandler(async (req, res) => {
        const { period = 'monthly' } = req.query;

        const report = await reportService.getAdminOverviewReport(period);

        res.status(200).json(
            ApiResponse.success(report, 'Overview report generated successfully')
        );
    }),

    getAdminRevenueReport: asyncHandler(async (req, res) => {
        const { start_date, end_date, group_by = 'daily' } = req.query;

        const report = await reportService.getAdminRevenueReport({
            startDate: start_date,
            endDate: end_date,
            groupBy: group_by
        });

        res.status(200).json(
            ApiResponse.success(report, 'Revenue report generated successfully')
        );
    }),

    getAdminSellerReport: asyncHandler(async (req, res) => {
        const { start_date, end_date } = req.query;

        const report = await reportService.getAdminSellerReport({
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(report, 'Seller report generated successfully')
        );
    }),

    getAdminOrderReport: asyncHandler(async (req, res) => {
        const { start_date, end_date } = req.query;

        const report = await reportService.getAdminOrderReport({
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(report, 'Order report generated successfully')
        );
    }),

    getAdminProductReport: asyncHandler(async (req, res) => {
        const { start_date, end_date } = req.query;

        const report = await reportService.getAdminProductReport({
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(report, 'Product report generated successfully')
        );
    }),

    getAdminUserReport: asyncHandler(async (req, res) => {
        const { start_date, end_date } = req.query;

        const report = await reportService.getAdminUserReport({
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(report, 'User report generated successfully')
        );
    }),

    getAdminPaymentReport: asyncHandler(async (req, res) => {
        const { start_date, end_date } = req.query;

        const report = await reportService.getAdminPaymentReport({
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(report, 'Payment report generated successfully')
        );
    }),

    // ============ SUB-ADMIN REPORTS ============
    getSubAdminSellerReport: asyncHandler(async (req, res) => {
        const { start_date, end_date } = req.query;

        const report = await reportService.getSubAdminSellerReport({
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(report, 'Seller report generated successfully')
        );
    }),

    getSubAdminOrderReport: asyncHandler(async (req, res) => {
        const { start_date, end_date } = req.query;

        const report = await reportService.getSubAdminOrderReport({
            startDate: start_date,
            endDate: end_date
        });

        res.status(200).json(
            ApiResponse.success(report, 'Order report generated successfully')
        );
    }),

    // ============ ANALYTICS ============
    getAnalyticsDashboard: asyncHandler(async (req, res) => {
        const { period = 'monthly', seller_id } = req.query;

        const analytics = await reportService.getAnalyticsDashboard({
            period,
            sellerId: seller_id
        });

        res.status(200).json(
            ApiResponse.success(analytics, 'Analytics dashboard data fetched successfully')
        );
    }),

    getRealtimeAnalytics: asyncHandler(async (req, res) => {
        const analytics = await reportService.getRealtimeAnalytics();

        res.status(200).json(
            ApiResponse.success(analytics, 'Real-time analytics fetched successfully')
        );
    }),

    // ============ EXPORT REPORTS ============
    exportCSV: asyncHandler(async (req, res) => {
        const { report_type, start_date, end_date, format = 'csv' } = req.query;

        const result = await reportService.exportReport({
            reportType: report_type,
            startDate: start_date,
            endDate: end_date,
            format
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.csv`);
        res.send(result);
    }),

    exportPDF: asyncHandler(async (req, res) => {
        const { report_type, start_date, end_date, format = 'pdf' } = req.query;

        const result = await reportService.exportReport({
            reportType: report_type,
            startDate: start_date,
            endDate: end_date,
            format
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.pdf`);
        res.send(result);
    }),

    exportExcel: asyncHandler(async (req, res) => {
        const { report_type, start_date, end_date, format = 'excel' } = req.query;

        const result = await reportService.exportReport({
            reportType: report_type,
            startDate: start_date,
            endDate: end_date,
            format
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.xlsx`);
        res.send(result);
    }),

    // ============ SCHEDULED REPORTS ============
    createScheduledReport: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const scheduleData = req.body;

        const schedule = await reportService.createScheduledReport({
            ...scheduleData,
            createdBy: userId
        });

        res.status(201).json(
            ApiResponse.created(schedule, 'Scheduled report created successfully')
        );
    }),

    getScheduledReports: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { page, limit } = req.query;

        const result = await reportService.getScheduledReports({
            userId,
            page,
            limit
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.schedules,
                result.pagination,
                'Scheduled reports fetched successfully'
            )
        );
    }),

    updateScheduledReport: asyncHandler(async (req, res) => {
        const { scheduleId } = req.params;
        const updateData = req.body;

        const schedule = await reportService.updateScheduledReport({
            scheduleId,
            updateData
        });

        res.status(200).json(
            ApiResponse.success(schedule, 'Scheduled report updated successfully')
        );
    }),

    deleteScheduledReport: asyncHandler(async (req, res) => {
        const { scheduleId } = req.params;

        await reportService.deleteScheduledReport(scheduleId);

        res.status(200).json(
            ApiResponse.success(null, 'Scheduled report deleted successfully')
        );
    }),

    runScheduledReportNow: asyncHandler(async (req, res) => {
        const { scheduleId } = req.params;

        const result = await reportService.runScheduledReportNow(scheduleId);

        res.status(200).json(
            ApiResponse.success(result, 'Report generation started successfully')
        );
    }),

    // ============ CUSTOM REPORTS ============
    generateCustomReport: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const reportConfig = req.body;

        const report = await reportService.generateCustomReport({
            ...reportConfig,
            userId
        });

        res.status(200).json(
            ApiResponse.success(report, 'Custom report generated successfully')
        );
    }),

    getSavedCustomReports: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { page, limit } = req.query;

        const result = await reportService.getSavedCustomReports({
            userId,
            page,
            limit
        });

        res.status(200).json(
            ApiResponse.paginated(
                result.reports,
                result.pagination,
                'Saved custom reports fetched successfully'
            )
        );
    }),

    saveCustomReportTemplate: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const templateData = req.body;

        const template = await reportService.saveCustomReportTemplate({
            ...templateData,
            createdBy: userId
        });

        res.status(201).json(
            ApiResponse.created(template, 'Custom report template saved successfully')
        );
    }),

    getCustomReportById: asyncHandler(async (req, res) => {
        const { reportId } = req.params;

        const report = await reportService.getCustomReportById(reportId);

        res.status(200).json(
            ApiResponse.success(report, 'Custom report fetched successfully')
        );
    })
};

module.exports = reportController;