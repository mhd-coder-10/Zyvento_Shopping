
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all'); // NEW STATE

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            // Pass paymentStatus to API
            const res = await ApiService.getAllOrders({ 
                search, 
                status: statusFilter, 
                paymentStatus: paymentFilter 
            });
            if (res.data.success) {
                setOrders(res.data.data || []);
                setStats(res.data.stats || {});
            }
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, paymentFilter]); // ADDED paymentFilter dependency

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleNavigate = (order) => {
        const orderCode = order?.order_code || order?.order_number || order?._id;
        if (orderCode) {
            navigate(`/admin/orders/${orderCode}`);
        } else {
            toast.error('Invalid order code');
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // FIX 1: Removed Icons from Status Badge
    const getStatusBadge = (status) => {
        const config = {
            pending: { color: 'bg-amber-50 text-amber-700' },
            confirmed: { color: 'bg-blue-50 text-blue-700' },
            packed: { color: 'bg-purple-50 text-purple-700' },
            shipped: { color: 'bg-indigo-50 text-indigo-700' },
            out_for_delivery: { color: 'bg-cyan-50 text-cyan-700' },
            delivered: { color: 'bg-emerald-50 text-emerald-700' },
            cancelled: { color: 'bg-red-50 text-red-700' }
        };
        const { color } = config[status] || config.pending;
        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    // FIX 2: Payment Status Badge
    const getPaymentStatusBadge = (status) => {
        const config = {
            pending: 'bg-yellow-50 text-yellow-700',
            paid: 'bg-emerald-50 text-emerald-700',
            failed: 'bg-red-50 text-red-700',
            refunded: 'bg-blue-50 text-blue-700',
            partially_refunded: 'bg-orange-50 text-orange-700'
        };
        const color = config[status] || 'bg-gray-50 text-gray-600';
        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${color}`}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Order Management" subtitle="Manage customer orders" />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-black">{stats.total}</p>
                        <p className="text-xs !text-gray-600">Total Orders</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-amber-600">{stats.pending}</p>
                        <p className="text-xs !text-gray-600">Pending</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-emerald-600">{stats.delivered}</p>
                        <p className="text-xs !text-gray-600">Delivered</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-red-600">{stats.cancelled}</p>
                        <p className="text-xs !text-gray-600">Cancelled</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col lg:flex-row gap-3">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order Code or Customer Email..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    {/* Order Status Dropdown */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white cursor-pointer"
                    >
                        <option value="all">All Order Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* FIX 3: New Payment Status Dropdown */}
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white cursor-pointer"
                    >
                        <option value="all">All Payment Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                        <option value="partially_refunded">Partially Refunded</option>
                    </select>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    {loading ? <div className="p-10 text-center">Loading...</div> : (
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Order Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Items</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Amount</th>
                                    {/* FIX 2: Added Payment Status Header */}
                                    <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Payment Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-blue-50/30 cursor-pointer" onClick={() => handleNavigate(order)}>
                                        <td className="px-4 py-3 text-sm font-bold !text-left !text-blue-600">{order.order_code || order.order_number}</td>
                                        <td className="px-4 py-3 text-sm !text-left !text-black">
                                            {order.user_id?.first_name} {order.user_id?.last_name}
                                            <p className="text-xs !text-gray-500">{order.user_id?.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm !text-center !text-gray-700">{order.order_items?.length || 0}</td>
                                        <td className="px-4 py-3 text-sm font-bold !text-right !text-black">₹{order.total_amount}</td>
                                        {/* FIX 2: Added Payment Status Cell */}
                                        <td className="px-4 py-3 text-sm !text-center">{getPaymentStatusBadge(order.payment_status)}</td>
                                        <td className="px-4 py-3 text-sm !text-left !text-gray-600">{formatDate(order.created_at)}</td>
                                        <td className="px-4 py-3 !text-left">{getStatusBadge(order.order_status)}</td>
                                        <td className="px-4 py-3 !text-right">
                                            <button onClick={(e) => { e.stopPropagation(); handleNavigate(order); }} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {loading ? <div className="p-10 text-center">Loading...</div> : (
                        orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold !text-blue-600">{order.order_code || order.order_number}</p>
                                    {getStatusBadge(order.order_status)}
                                </div>
                                <div className="mt-2 text-sm !text-black">
                                    <p>{order.user_id?.first_name} {order.user_id?.last_name}</p>
                                    <p className="text-xs !text-gray-500">{order.user_id?.email}</p>
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="!text-gray-600">Items: {order.order_items?.length || 0}</span>
                                    <span className="font-bold !text-black">₹{order.total_amount}</span>
                                </div>
                                {/* Mobile Payment Status */}
                                <div className="mt-2">
                                    {getPaymentStatusBadge(order.payment_status)}
                                </div>
                                <button onClick={() => handleNavigate(order)} className="mt-3 w-full py-2 bg-blue-50 !text-blue-600 rounded-lg">View Details</button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;