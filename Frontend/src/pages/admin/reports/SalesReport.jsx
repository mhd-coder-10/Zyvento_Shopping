
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiDollarSign, FiCheckCircle, FiXCircle, FiShoppingBag,
    FiRefreshCw, FiSearch, FiArrowUp, FiArrowDown, FiMoreHorizontal, FiCreditCard
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import MonthlySalesChart from '../../../components/admin/MonthlySalesChart';

// Rank-based bar colors for "Sales by Category" (1st → greenest, then blue, amber, ...)
const CATEGORY_BAR_COLORS = ['bg-green-500', 'bg-blue-500', 'bg-amber-400', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'];

const SalesReport = ({ dateRange }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await ApiService.getReportData('sales', dateRange);
            if (res.data.success) setData(res.data.data);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [dateRange]);

    // ==================== FORMATTERS ====================
    const formatCurrency = (value) => {
        if (!value) return '₹0';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    };
    const formatPercent = (value) => {
        if (value === null || value === undefined || isNaN(value)) return '0%';
        return `${value > 0 ? '+' : ''}${value}%`;
    };

    const GrowthBadge = ({ value, size = 'sm' }) => {
        const numeric = Number(value) || 0;
        const isPositive = numeric >= 0;
        const Icon = isPositive ? FiArrowUp : FiArrowDown;
        const colorClass = isPositive ? 'text-green-600' : 'text-red-500';
        return (
            <span className={`inline-flex items-center gap-1 font-medium ${size === 'sm' ? 'text-sm' : 'text-xs'} ${colorClass}`}>
                <Icon className="w-3 h-3 shrink-0" />
                {formatPercent(numeric)}
            </span>
        );
    };

    // ==================== RECENT ORDERS FILTERING ====================
    const filteredOrders = useMemo(() => {
        return (data?.recentOrders || []).filter((order) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                order.product_name?.toLowerCase().includes(term) ||
                order.order_code?.toLowerCase().includes(term) ||
                order.customer_name?.toLowerCase().includes(term);
            const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [data, searchTerm, statusFilter]);

    // ==================== GAUGE ====================
    const salesGrowth = Number(data?.salesGrowth) || 0;
    const gaugePercent = Math.min(100, Math.max(0, salesGrowth));
    const GAUGE_RADIUS = 80;
    const GAUGE_CIRCUMFERENCE = Math.PI * GAUGE_RADIUS;
    const gaugeDashOffset = GAUGE_CIRCUMFERENCE - (gaugePercent / 100) * GAUGE_CIRCUMFERENCE;

    // ==================== SALES BY CATEGORY ====================
    const categoryData = data?.categoryData || [];
    const maxCategoryRevenue = categoryData.length ? Math.max(...categoryData.map((c) => c.revenue || 0)) : 0;

    // ==================== PAYMENT METHODS ====================
    const paymentMethods = data?.paymentMethods || [];

    // ==================== TOP PRODUCTS BY SALES ====================
    const topProducts = data?.topProducts || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-64 bg-white rounded-2xl border border-blue-100 shadow-sm">
                <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* ==================== SUMMARY CARDS ==================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Sales */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-sm text-blue-100">Total Sales</p>
                            <p className="text-2xl sm:text-3xl font-bold mt-1 truncate">{formatCurrency(data?.totalSales)}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl shrink-0"><FiDollarSign className="w-6 h-6" /></div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm flex-wrap">
                        <FiArrowUp className={`w-3 h-3 ${salesGrowth < 0 ? 'rotate-180' : ''}`} />
                        <span>{formatPercent(data?.salesGrowth)}</span>
                        <span className="text-blue-200">vs last month</span>
                    </div>
                    <p className="text-xs text-blue-200 mt-1 truncate">Last month: {formatCurrency(data?.lastMonthSales)}</p>
                </div>

                {/* Number of Sales */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-sm text-gray-500">Number of Sales Products</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{data?.totalOrders || 0}</p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-xl shrink-0"><FiShoppingBag className="w-6 h-6 text-indigo-600" /></div>
                    </div>
                    <div className="mt-4"><GrowthBadge value={data?.orderGrowth} /></div>
                    <p className="text-xs text-gray-400 mt-1">Last month: {data?.lastMonthOrders || 0}</p>
                </div>

                {/* Successfully Sales */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-sm text-gray-500">Successfully Sales</p>
                            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{data?.successfulSalesCount || 0}</p>
                            <p className="text-xs text-gray-400 mt-1 truncate">Sales: {formatCurrency(data?.successfulSalesRevenue)}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl shrink-0"><FiCheckCircle className="w-6 h-6 text-green-600" /></div>
                    </div>
                    <div className="mt-4"><GrowthBadge value={data?.salesGrowth} /></div>
                    <p className="text-xs text-gray-400 mt-1">Delivered + Paid</p>
                </div>

                {/* Return/Cancel Sales */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-sm text-gray-500">Return/Cancel Sales</p>
                            <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{data?.returnCancelSalesCount || 0}</p>
                            <p className="text-xs text-gray-400 mt-1 truncate">Sales Lost: {formatCurrency(data?.returnCancelSalesRevenue)}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl shrink-0"><FiXCircle className="w-6 h-6 text-orange-600" /></div>
                    </div>
                    <div className="mt-4"><GrowthBadge value={data?.returnRate ? -Math.abs(data.returnRate) : 0} /></div>
                    <p className="text-xs text-gray-400 mt-1">Cancelled + Refunded</p>
                </div>
            </div>

            {/* ==================== CHARTS SECTION ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* ===== PERFORMANCE OVERVIEW (same fixed Jan–Dec chart as Revenue Report) ===== */}
                <div className="lg:col-span-2">
                    <MonthlySalesChart title="Performance Overview" />
                </div>

                {/* ===== SALES OVERVIEW ===== */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
                    </div>

                    <div className="flex justify-center mb-4">
                        <div className="relative w-full max-w-[220px] aspect-[2/1.15]">
                            <svg viewBox="0 0 200 115" className="w-full h-full">
                                <path
                                    d="M 20 100 A 80 80 0 0 1 180 100"
                                    fill="none"
                                    stroke="#e2e8f0"
                                    strokeWidth="16"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M 20 100 A 80 80 0 0 1 180 100"
                                    fill="none"
                                    stroke="url(#gaugeGradient)"
                                    strokeWidth="16"
                                    strokeLinecap="round"
                                    strokeDasharray={GAUGE_CIRCUMFERENCE}
                                    strokeDashoffset={gaugeDashOffset}
                                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                                />
                                <defs>
                                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#93c5fd" />
                                        <stop offset="100%" stopColor="#2563eb" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 sm:pb-2">
                                <span className="text-2xl sm:text-3xl font-bold text-gray-900">{Math.round(gaugePercent)}%</span>
                                <span className="text-xs text-gray-500">Sales Growth</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="bg-blue-50 rounded-xl p-3 relative overflow-hidden">
                            <p className="text-xs text-gray-500">Number of Sales</p>
                            <p className="text-lg sm:text-xl font-bold text-blue-700 mt-1">{data?.totalOrders || 0}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 relative overflow-hidden">
                            <p className="text-xs text-gray-500">Total Sales</p>
                            <p className="text-lg sm:text-xl font-bold text-green-700 mt-1 truncate">{formatCurrency(data?.totalSales)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== SALES BY CATEGORY + PAYMENT METHODS ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                {/* ===== SALES BY CATEGORY ===== */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-6">Sales by Category</h3>

                    {categoryData.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-8">No category data available</p>
                    ) : (
                        <div className="space-y-5">
                            {categoryData.map((cat, idx) => {
                                const widthPercent = maxCategoryRevenue > 0 ? (cat.revenue / maxCategoryRevenue) * 100 : 0;
                                const barColor = CATEGORY_BAR_COLORS[idx % CATEGORY_BAR_COLORS.length];
                                return (
                                    <div key={cat.category || idx}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-gray-800 truncate pr-2">{cat.category}</span>
                                            <span className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(cat.revenue)}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                                                style={{ width: `${Math.max(widthPercent, 2)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ===== PAYMENT METHODS ===== */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-6">Payment Methods</h3>

                    {paymentMethods.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-8">No payment data available</p>
                    ) : (
                        <div className="space-y-3">
                            {paymentMethods.map((pm, idx) => (
                                <div
                                    key={pm.method || idx}
                                    className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3.5"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FiCreditCard className="w-5 h-5 text-gray-500 shrink-0" />
                                        <span className="text-sm font-semibold text-gray-800 truncate">{pm.method}</span>
                                    </div>
                                    <span className="text-sm sm:text-base font-bold text-gray-900 shrink-0">{formatCurrency(pm.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ==================== TOP PRODUCTS BY SALES ==================== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-bold text-gray-900 text-center mb-6">Top Products by Sales</h3>

                {topProducts.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">No product data available</p>
                ) : (
                    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                        <table className="w-full min-w-[560px]">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Product</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Category</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Sold</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((p) => (
                                    <tr key={p.rank} className="border-b border-gray-50 hover:bg-blue-50/30">
                                        <td className="px-4 py-3 text-sm text-gray-400">{p.rank}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-gray-900">{p.productName}</p>
                                            {p.productCode && (
                                                <p className="text-xs text-gray-400 mt-0.5">{p.productCode}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-700">{p.sold}</td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-teal-600">{formatCurrency(p.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ==================== RECENT ORDERS TABLE ==================== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative w-full sm:w-auto">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products, code, customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Product Info</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Order ID</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Date</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Customer</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-blue-50/30 text-center">
                                        <td className="px-4 py-3 text-start text-sm font-medium text-gray-900">{order.product_name || 'Multiple Items'}</td>
                                        <td className="px-4 py-3 text-sm font-mono text-blue-600">{order.order_code}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{order.customer_name || 'Guest'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.order_status === 'delivered' ? 'bg-green-50 text-green-700' : order.order_status === 'pending' ? 'bg-amber-50 text-amber-700' : order.order_status === 'shipped' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {order.order_status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(order.total_amount)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No orders found matching your search</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {data?.recentOrders?.length > 10 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="px-6 py-2.5 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-all"
                        >
                            More Orders (View All {data?.recentOrders?.length} Orders)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesReport;