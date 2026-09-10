

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiShoppingBag, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw,
    FiSearch, FiMoreHorizontal
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import MonthlyOrdersChart from '../../../components/admin/MonthlyOrdersChart';

const OrderReport = ({ dateRange }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await ApiService.getReportData('orders', dateRange);
            if (res.data.success) setData(res.data.data);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [dateRange]);

    const formatCurrency = (value) => {
        if (!value) return '₹0';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    };

    const filteredOrders = useMemo(() => {
        return (data?.recentOrders || []).filter(order => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                order.product_name?.toLowerCase().includes(term) ||
                order.order_code?.toLowerCase().includes(term) ||
                order.customer_name?.toLowerCase().includes(term);
            const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [data, searchTerm, statusFilter]);

    if (loading) {
        return <div className="flex items-center justify-center w-full h-64 bg-white rounded-2xl border border-blue-100 shadow-sm"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-indigo-100">Total Orders</p>
                            <p className="text-3xl font-bold mt-1">{data?.totalOrders || 0}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl"><FiShoppingBag className="w-6 h-6" /></div>
                    </div>
                    <p className="text-xs text-indigo-200 mt-4">All orders in selected period</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">In Progress</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">{data?.inProgressOrders || 0}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-xl"><FiClock className="w-6 h-6 text-yellow-600" /></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Pending + Confirmed + Shipped</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Delivered</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{data?.deliveredOrders || 0}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl"><FiCheckCircle className="w-6 h-6 text-green-600" /></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Successfully delivered</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Cancelled/Returned</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{(data?.cancelledOrders || 0) + (data?.returnedOrders || 0)}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl"><FiXCircle className="w-6 h-6 text-red-600" /></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Cancelled or returned orders</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MonthlyOrdersChart title="Order Trend" />
                </div>

                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Status Breakdown</h3>
                        <button className="text-gray-400 hover:text-gray-600"><FiMoreHorizontal /></button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Pending', value: data?.pendingOrders || 0, color: 'bg-yellow-500' },
                            { label: 'Confirmed', value: data?.confirmedOrders || 0, color: 'bg-blue-500' },
                            { label: 'Shipped', value: data?.shippedOrders || 0, color: 'bg-purple-500' },
                            { label: 'Delivered', value: data?.deliveredOrders || 0, color: 'bg-green-500' },
                            { label: 'Cancelled', value: data?.cancelledOrders || 0, color: 'bg-red-500' },
                        ].map((status) => {
                            const total = data?.totalOrders || 1;
                            const percent = (status.value / total) * 100;
                            return (
                                <div key={status.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="!text-gray-700">{status.label}</span>
                                        <span className="font-semibold !text-gray-900">{status.value}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div className={`${status.color} h-2.5 rounded-full`} style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 min-w-[200px] w-full sm:w-auto">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products, code, customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full sm:w-auto"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
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
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.order_status === 'delivered' ? 'bg-green-50 text-green-700' : order.order_status === 'pending' ? 'bg-amber-50 text-amber-700' : order.order_status === 'shipped' ? 'bg-blue-50 text-blue-700' : order.order_status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
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
                            className="px-6 py-2.5 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition-all"
                        >
                            More Orders (View All {data?.recentOrders?.length} Orders)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderReport;