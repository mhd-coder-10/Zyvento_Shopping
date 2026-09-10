
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiEye,
    FiRefreshCw,
    FiDownload,
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiPackage,
    FiTruck,
    FiArrowRight,
} from 'react-icons/fi';

import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import AdminStatsCards from '../../../components/admin/AdminStatsCards';
import AdminSalesAnalytics from '../../../components/admin/AdminSalesAnalytics';
import AdminCharts from '../../../components/admin/AdminCharts';
import AdminOrderStatus from '../../../components/admin/AdminOrderStatus';
import AdminTopSellingProducts from '../../../components/admin/AdminTopSellingProducts';
import AdminSearchBar from '../../../components/admin/AdminSearchBar';
import AdminFilters from '../../../components/admin/AdminFilters';
import AdminTable from '../../../components/admin/AdminTable';

// 🔒 Global cache – persists across mounts
const cache = {
    data: null,
    fetched: false,
    loading: false,
};

const STATUS_META = {
    pending: { color: '#0EA5E9', icon: FiClock },
    confirmed: { color: '#3B82F6', icon: FiCheckCircle },
    processing: { color: '#6366F1', icon: FiPackage },
    shipped: { color: '#10B981', icon: FiTruck },
    delivered: { color: '#10B981', icon: FiCheckCircle },
    cancelled: { color: '#F43F5E', icon: FiXCircle },
};

const mapChartData = (data) => {
    if (!data) return null;
    return {
        labels: data.orders?.map((d) => d._id) || [],
        datasets: [
            { label: 'Orders', data: data.orders?.map((d) => d.count) || [], borderColor: '#3B82F6' },
            { label: 'Revenue', data: data.revenue?.map((d) => d.total) || [], borderColor: '#10B981' },
            { label: 'Users', data: data.users?.map((d) => d.count) || [], borderColor: '#8B5CF6' },
        ],
    };
};

const Dashboard = () => {
    const navigate = useNavigate();

    // ⬇️ Section-wise loading (no more full-page spinner)
    const [statsLoading, setStatsLoading] = useState(!cache.fetched);
    const [statisticsLoading, setStatisticsLoading] = useState(!cache.fetched);
    const [ordersLoading, setOrdersLoading] = useState(!cache.fetched);
    const [chartLoading, setChartLoading] = useState(!cache.fetched);

    const [stats, setStats] = useState(cache.data?.stats || null);
    const [recentOrders, setRecentOrders] = useState(cache.data?.recentOrders || []);
    const [pagination, setPagination] = useState(
        cache.data?.pagination || { page: 1, limit: 5, total: 0, totalPages: 1 }
    );
    const [query, setQuery] = useState({ search: '', status: '', from: '', to: '' });

    const [chartType, setChartType] = useState('revenue');
    const [chartPeriod, setChartPeriod] = useState('monthly');
    const [chartData, setChartData] = useState(cache.data?.chartData || null);

    const [salesAnalytic, setSalesAnalytic] = useState(
        cache.data?.salesAnalytic || { income: 0, expenses: 0, balance: 0 }
    );
    const [orderStatusData, setOrderStatusData] = useState(cache.data?.orderStatusData || []);
    const [topProducts, setTopProducts] = useState(cache.data?.topProducts || []);

    const mounted = useRef(true);
    const firstRun = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    // ========== INITIAL LOAD ==========
    useEffect(() => {
        if (cache.fetched && cache.data) {
            setStats(cache.data.stats);
            setSalesAnalytic(cache.data.salesAnalytic);
            setOrderStatusData(cache.data.orderStatusData);
            setTopProducts(cache.data.topProducts);
            setChartData(cache.data.chartData);
            setRecentOrders(cache.data.recentOrders);
            setPagination(cache.data.pagination);
            setStatsLoading(false);
            setStatisticsLoading(false);
            setOrdersLoading(false);
            setChartLoading(false);
        } else if (!cache.loading) {
            fetchDashboardData();
        }
        // eslint-disable-next-line
    }, []);

    // ========== FETCH ALL (PARALLEL) ==========
    const fetchDashboardData = async () => {
        cache.loading = true;
        setStatsLoading(true);
        setStatisticsLoading(true);
        setOrdersLoading(true);
        setChartLoading(true);

        const [overviewRes, statsRes, ordersRes, chartRes] = await Promise.allSettled([
            ApiService.getDashboardOverview(),
            ApiService.getDashboardStatistics(),
            ApiService.adminGetAllOrders({ page: 1, limit: 5, sort: '-createdAt' }),
            ApiService.getDashboardCharts('monthly'),
        ]);

        if (!mounted.current) {
            cache.loading = false;
            return;
        }

        const nextCache = { ...(cache.data || {}) };

        // ---- Overview (stats cards) ----
        if (overviewRes.status === 'fulfilled') {
            const statsData = overviewRes.value?.data?.data || null;
            setStats(statsData);
            nextCache.stats = statsData;
        } else {
            console.error('Overview error:', overviewRes.reason);
        }
        setStatsLoading(false);

        // ---- Statistics (sales analytics / order status / top products) ----
        if (statsRes.status === 'fulfilled') {
            const s = statsRes.value?.data?.data || {};
            const totalIncome = s.dailyRevenue?.reduce((sum, d) => sum + (d.total || 0), 0) || 0;
            const salesAnalyticData = { income: totalIncome, expenses: 0, balance: totalIncome };

            const orderStatusDataMapped = (s.orderStatusCounts || []).map((item) => ({
                status: item._id || 'pending',
                count: item.count,
                color: STATUS_META[item._id]?.color || '#6B7280',
                icon: STATUS_META[item._id]?.icon || FiClock,
            }));

            const topProductsData = (s.topProducts || []).map((p) => ({
                productId: p.productId,
                productName: p.productName,
                totalSold: p.views || 0,
            }));

            setSalesAnalytic(salesAnalyticData);
            setOrderStatusData(orderStatusDataMapped);
            setTopProducts(topProductsData);

            nextCache.salesAnalytic = salesAnalyticData;
            nextCache.orderStatusData = orderStatusDataMapped;
            nextCache.topProducts = topProductsData;
        } else {
            console.error('Statistics error:', statsRes.reason);
        }
        setStatisticsLoading(false);

        // ---- Recent orders ----
        if (ordersRes.status === 'fulfilled') {
            const ordersData = ordersRes.value?.data?.data || [];
            const paginationData = {
                page: 1,
                limit: 5,
                total: ordersRes.value?.data?.total || ordersData.length,
                totalPages: ordersRes.value?.data?.totalPages || 1,
            };
            setRecentOrders(ordersData);
            setPagination(paginationData);
            nextCache.recentOrders = ordersData;
            nextCache.pagination = paginationData;
        } else {
            console.error('Orders error:', ordersRes.reason);
        }
        setOrdersLoading(false);

        // ---- Chart ----
        if (chartRes.status === 'fulfilled') {
            const mapped = mapChartData(chartRes.value?.data?.data);
            setChartData(mapped);
            nextCache.chartData = mapped;
        } else {
            console.error('Chart error:', chartRes.reason);
        }
        setChartLoading(false);

        cache.data = nextCache;
        cache.fetched = true;
        cache.loading = false;

        const failed = [overviewRes, statsRes, ordersRes, chartRes].filter(
            (r) => r.status === 'rejected'
        );
        if (failed.length === 4) {
            toast.error('Failed to load dashboard');
        } else if (failed.length) {
            toast.warn('Some dashboard sections could not load');
        }
    };

    // ========== ORDERS FETCH ==========
    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await ApiService.adminGetAllOrders({
                page: pagination.page,
                limit: pagination.limit,
                sort: '-createdAt',
                search: query.search || undefined,
                status: query.status || undefined,
                from: query.from || undefined,
                to: query.to || undefined,
            });
            if (!mounted.current) return;
            if (res.data.success) {
                setRecentOrders(res.data.data || []);
                setPagination((prev) => ({
                    ...prev,
                    total: res.data.total || (res.data.data || []).length,
                    totalPages: res.data.totalPages || 1,
                }));
            }
        } catch (error) {
            console.error('Orders fetch error:', error);
            toast.error('Failed to load orders');
        } finally {
            if (mounted.current) setOrdersLoading(false);
        }
    };

    // ========== CHARTS FETCH ==========
    const fetchChartData = async (period) => {
        setChartLoading(true);
        try {
            const res = await ApiService.getDashboardCharts(period);
            if (!mounted.current) return;
            if (res.data.success) {
                const mapped = mapChartData(res.data.data);
                setChartData(mapped);
                if (cache.data) cache.data.chartData = mapped;
            }
        } catch (error) {
            console.error('Chart fetch error:', error);
            toast.error('Failed to load chart');
            setChartData(null);
        } finally {
            if (mounted.current) setChartLoading(false);
        }
    };

    // ========== EFFECTS (skip first run – initial load already covers it) ==========
    useEffect(() => {
        if (firstRun.current) return;
        fetchOrders();
        // eslint-disable-next-line
    }, [pagination.page, query]);

    useEffect(() => {
        if (firstRun.current) return;
        fetchChartData(chartPeriod);
        // eslint-disable-next-line
    }, [chartPeriod]);

    useEffect(() => {
        firstRun.current = false;
    }, []);

    // ========== HANDLERS ==========
    const handleSearch = (value) => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setQuery((prev) => ({ ...prev, search: value }));
    };

    const handleApplyFilters = (values) => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setQuery((prev) => ({ ...prev, ...values }));
    };

    const handleClearFilters = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setQuery({ search: '', status: '', from: '', to: '' });
    };

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const handleRefresh = () => {
        cache.fetched = false;
        cache.data = null;
        cache.loading = false;
        fetchDashboardData();
    };

    // ========== UTILITIES ==========
    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
            confirmed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
            processing: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
            shipped: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
            delivered: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
            cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
            returned: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
        };
        return colors[status?.toLowerCase()] || 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: FiClock,
            confirmed: FiCheckCircle,
            processing: FiClock,
            shipped: FiPackage,
            delivered: FiCheckCircle,
            cancelled: FiXCircle,
            returned: FiXCircle,
        };
        return icons[status?.toLowerCase()] || FiClock;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    // ========== FILTERS ==========
    const filterConfig = [
        {
            key: 'status',
            label: 'Order Status',
            type: 'select',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
            ],
        },
        { key: 'from', label: 'From Date', type: 'date' },
        { key: 'to', label: 'To Date', type: 'date' },
    ];

    // ========== TABLE COLUMNS ==========
    const orderColumns = [
        {
            key: 'orderNumber',
            label: 'Order',
            render: (value, row) => (
                <span className="font-semibold text-slate-800">
                    #{value || row._id?.slice(-6)?.toUpperCase() || '—'}
                </span>
            ),
        },
        {
            key: 'user',
            label: 'Customer',
            render: (value, row) => (
                <div className="min-w-0">
                    <p className="truncate font-medium text-slate-700">
                        {value?.name || row.customerName || 'Guest'}
                    </p>
                    <p className="truncate text-xs text-slate-400">{value?.email || '—'}</p>
                </div>
            ),
        },
        {
            key: 'totalAmount',
            label: 'Amount',
            render: (value) => (
                <span className="font-bold text-blue-700">{formatCurrency(value)}</span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => {
                const Icon = getStatusIcon(value);
                return (
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${getStatusColor(value)}`}
                    >
                        <Icon className="h-3 w-3" />
                        {value || 'pending'}
                    </span>
                );
            },
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (value) => (
                <span className="text-xs font-medium text-slate-500">
                    {value ? new Date(value).toLocaleDateString('en-IN') : '—'}
                </span>
            ),
        },
    ];

    const orderActions = [
        {
            label: 'View',
            icon: <FiEye className="h-4 w-4 text-blue-600" />,
            className: 'hover:bg-sky-50',
            onClick: (row) => navigate(`/admin/orders/${row._id || row.id}`),
        },
    ];

    const isRefreshing =
        statsLoading || statisticsLoading || ordersLoading || chartLoading;

    // ========== RENDER (never blocks the whole page) ==========
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
                <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-blue-200/25 blur-3xl" />
            </div>

            <div className="relative p-4 sm:p-6 lg:p-8">
                <AdminTopbar
                    title="Dashboard"
                    subtitle="Welcome back! Here's what's happening with your store today."
                    actions={
                        <>
                            <div className="relative z-50 w-full sm:w-72">
                                <AdminSearchBar
                                    onSearch={handleSearch}
                                    placeholder="Search orders, customers..."
                                    recentSearches={['Air Jordan', 'pending orders']}
                                    suggestions={['Delivered orders', 'Cancelled orders', 'Top customers']}
                                />
                            </div>
                            <div className="relative z-50">
                                <AdminFilters
                                    filters={filterConfig}
                                    onApply={handleApplyFilters}
                                    onClear={handleClearFilters}
                                    loading={ordersLoading}
                                />
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700 shadow-sm transition-all hover:bg-sky-50 hover:shadow disabled:opacity-60"
                            >
                                <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={() => navigate('/admin/reports')}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:from-sky-600 hover:to-blue-700 hover:shadow-lg"
                            >
                                <FiDownload className="h-4 w-4" />
                                <span className="hidden sm:inline">Reports</span>
                            </button>
                        </>
                    }
                />

                <div className="relative z-0 isolate">
                    <AdminStatsCards stats={stats} loading={statsLoading} />
                    <AdminSalesAnalytics data={salesAnalytic} loading={statisticsLoading} />

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-3">
                        <div className="min-w-0 xl:col-span-2">
                            <div className="rounded-2xl border border-sky-100 bg-white/80 p-1 shadow-sm backdrop-blur-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                                        Performance Overview
                                    </h3>
                                    <div className="inline-flex rounded-xl bg-sky-50 p-1 ring-1 ring-sky-100">
                                        {['revenue', 'orders'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setChartType(type)}
                                                className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all ${chartType === type
                                                    ? 'bg-white text-blue-700 shadow-sm'
                                                    : 'text-sky-600 hover:text-blue-700'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-2 sm:p-3">
                                    <AdminCharts
                                        data={chartData}
                                        loading={chartLoading}
                                        type={chartType}
                                        period={chartPeriod}
                                        onPeriodChange={setChartPeriod}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="min-w-0">
                            <AdminOrderStatus data={orderStatusData} loading={statisticsLoading} />
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
                        <div className="min-w-0 lg:col-span-2">
                            <AdminTopSellingProducts products={topProducts} loading={statisticsLoading} />
                        </div>

                        <div className="relative min-w-0 overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
                            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
                                Quick Actions
                            </h3>
                            <div className="space-y-2.5">
                                {[
                                    { label: 'Manage Products', path: '/admin/products' },
                                    { label: 'Manage Orders', path: '/admin/orders' },
                                    { label: 'Manage Users', path: '/admin/users' },
                                    { label: 'Manage Sellers', path: '/admin/sellers' },
                                    { label: 'Settings', path: '/admin/settings' },
                                ].map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className="group flex w-full items-center justify-between rounded-xl border border-sky-100 bg-sky-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:bg-white hover:text-blue-700 hover:shadow-sm"
                                    >
                                        <span className="truncate">{item.label}</span>
                                        <FiArrowRight className="h-4 w-4 shrink-0 text-sky-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                            Recent Orders
                        </h3>
                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:bg-sky-50 hover:text-blue-800"
                        >
                            View all
                            <FiArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <AdminTable
                        columns={orderColumns}
                        data={recentOrders}
                        loading={ordersLoading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onSearch={handleSearch}
                        actions={orderActions}
                        emptyMessage="No orders found"
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
