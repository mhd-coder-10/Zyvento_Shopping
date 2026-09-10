
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import MonthlyRevenueChart from '../../../components/admin/MonthlyRevenueChart';

const RevenueReport = ({ dateRange }) => {
    // ========== STATE ==========
    // initialLoading: true only for the very first fetch (shows full-page spinner)
    // tableLoading: true for every subsequent fetch caused by filters/pagination
    //               (keeps summary cards, chart, and filter bar visible — only the
    //               table area shows a loading state, so the page no longer "reloads")
    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const hasLoadedOnce = useRef(false);

    const [summary, setSummary] = useState(null);
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

    
    const [monthlyRevenue, setMonthlyRevenue] = useState({ labels: [], values: [] });
    const [monthlyRevenueLoading, setMonthlyRevenueLoading] = useState(true);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        seller_id: '',
        startDate: '',
        endDate: '',
    });

    // ========== FETCH 1: SUMMARY + CHART ==========
    const fetchSummaryAndChart = useCallback(async () => {
        if (!hasLoadedOnce.current) {
            setInitialLoading(true);
        } else {
            setMonthlyRevenueLoading(true);
        }
        try {
            const dateParams = {};
            if (dateRange?.startDate) dateParams.startDate = dateRange.startDate;
            if (dateRange?.endDate) dateParams.endDate = dateRange.endDate;

            const [revenueRes, monthlyRes] = await Promise.all([
                ApiService.getReportData('revenue', dateParams),
                ApiService.getReportData('monthly-revenue', dateParams),
            ]);

            if (revenueRes.data.success) {
                setSummary(revenueRes.data.data.summary);
            }

            if (monthlyRes.data.success) {
                const raw = monthlyRes.data.data; // backend shape: { labels, revenue }
                // MonthlyRevenueChart expects { labels, values } — map here so the
                // chart component itself stays untouched.
                setMonthlyRevenue({ labels: raw.labels || [], values: raw.revenue || [] });
            }
        } catch (error) {
            console.error('Failed to fetch revenue summary/chart:', error);
            toast.error('Failed to load revenue summary');
        } finally {
            setMonthlyRevenueLoading(false);
        }
    }, [dateRange]);

    // ========== FETCH 2: RECORDS TABLE ==========
    
    const fetchRecords = useCallback(async (page = 1) => {
        if (!hasLoadedOnce.current) {
            setInitialLoading(true);
        } else {
            setTableLoading(true);
        }
        try {
            const params = {
                page,
                limit: pagination.limit,
                ...filters,
            };
            // Clean empty filters
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            // Add dateRange if provided from parent (takes priority over the local filter panel)
            if (dateRange?.startDate) params.startDate = dateRange.startDate;
            if (dateRange?.endDate) params.endDate = dateRange.endDate;

            const res = await ApiService.getReportData('revenue', params);
            if (res.data.success) {
                const data = res.data.data;
                setRecords(data.records || []);
                setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
            }
        } catch (error) {
            console.error('Failed to fetch revenue records:', error);
            toast.error('Failed to load revenue records');
        } finally {
            setInitialLoading(false);
            setTableLoading(false);
            hasLoadedOnce.current = true;
        }
    }, [filters, pagination.limit, dateRange]);

    useEffect(() => {
        fetchSummaryAndChart();
    }, [fetchSummaryAndChart]);

    useEffect(() => {
        fetchRecords(1);
    }, [fetchRecords]);

    // ========== HANDLERS ==========
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handlePageChange = (page) => {
        fetchRecords(page);
    };

    // ========== UTILITY ==========
    const formatCurrency = (value) => {
        if (!value) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const getStatusBadge = (status) => {
        const styles = {
            Earned: 'bg-emerald-100 text-emerald-700',
            'Partially Refunded': 'bg-amber-100 text-amber-700',
            Pending: 'bg-blue-100 text-blue-700',
            Refunded: 'bg-rose-100 text-rose-700',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status || 'Earned'}
            </span>
        );
    };

    const formatRevenueId = (id) => {
        if (!id) return '—';
        return `REV-${id.slice(-6).toUpperCase()}`;
    };

    // ========== RENDER ==========
   
    if (initialLoading) {
        return (
            <div className="flex items-center justify-center w-full h-64 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <FiRefreshCw className="animate-spin text-emerald-600 w-8 h-8" />
            </div>
        );
    }

    // Summary defaults
    const s = summary || {};

    return (
        <div className="space-y-6 px-4 sm:px-0">
            {/* ========== SUMMARY CARDS ========== */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-emerald-600 to-green-500 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <p className="text-xs text-emerald-100">Total Revenue</p>
                    <p className="text-xl font-bold mt-1 truncate">{formatCurrency(s.totalRevenue)}</p>
                    <p className="text-[10px] text-emerald-200 mt-1">Commission: {s.commissionRate || 10}%</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
                    <p className="text-xs text-gray-500">Today</p>
                    <p className="text-lg font-bold text-emerald-600 truncate">{formatCurrency(s.todayRevenue)}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
                    <p className="text-xs text-gray-500">This Month</p>
                    <p className="text-lg font-bold text-blue-600 truncate">{formatCurrency(s.thisMonthRevenue)}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
                    <p className="text-xs text-gray-500">Last Month</p>
                    <p className="text-lg font-bold text-purple-600 truncate">{formatCurrency(s.lastMonthRevenue)}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-lg font-bold text-amber-600 truncate">{formatCurrency(s.pendingRevenue)}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm">
                    <p className="text-xs text-gray-500">Refunded</p>
                    <p className="text-lg font-bold text-rose-600 truncate">{formatCurrency(s.refundedRevenue)}</p>
                </div>
            </div>

            {/* ========== TREND CHART (Jan – Dec layout, values follow the selected date filter) ========== */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <MonthlyRevenueChart data={monthlyRevenue} loading={monthlyRevenueLoading} title="Performance Overview" />
            </div>

            {/* ========== FILTERS BAR ========== */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Revenue ID..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="Earned">Earned</option>
                            <option value="Partially Refunded">Partially Refunded</option>
                            <option value="Pending">Pending</option>
                            <option value="Refunded">Refunded</option>
                        </select>
                    </div>

                    <button
                        onClick={() => fetchRecords(pagination.page)}
                        disabled={tableLoading}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Refresh"
                    >
                        <FiRefreshCw className={`w-4 h-4 ${tableLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ========== REVENUE RECORDS TABLE ========== */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto relative">
                    {/* Table-only loading overlay — summary/chart/filters stay visible behind it */}
                    {tableLoading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <FiRefreshCw className="animate-spin text-emerald-600 w-6 h-6" />
                        </div>
                    )}
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Revenue ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Order ID</th>
                                <th className="px-4 py-3 text-CENTER text-xs font-bold text-gray-600 uppercase">Seller</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Order Amount</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Product Amount</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Commission</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Net Revenue</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length > 0 ? (
                                records.map((record) => (
                                    <tr key={record.order_id} className="border-b border-gray-50 hover:bg-emerald-50/20 transition-colors">
                                        <td className="px-4 py-3 text-sm font-mono font-bold text-emerald-600">
                                            {formatRevenueId(record.order_id)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-mono text-gray-700">
                                            {record.order_code || record.order_number || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {record.seller_name || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                            {formatCurrency(record.total_amount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                            {formatCurrency(record.product_amount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center">
                                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">
                                                {record.commission_rate || summary?.commissionRate || 10}%
                                            </span>
                                            <div className="text-xs text-gray-500">
                                                {formatCurrency(record.commission_amount)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-bold text-emerald-600">
                                            {formatCurrency(record.net_revenue)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {getStatusBadge(record.status)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-gray-500">
                                            {record.created_at ? new Date(record.created_at).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-4 py-12 text-center text-gray-500">
                                        No revenue records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1 || tableLoading}
                                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages || tableLoading}
                                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueReport;