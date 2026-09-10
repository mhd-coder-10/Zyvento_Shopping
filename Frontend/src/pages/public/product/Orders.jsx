// MY ORDERS PAGE
// Description: View all orders with status and details
// APIs: getCustomerOrders, getCustomerOrderDetails, cancelOrder


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiPackage,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiTruck,
    FiEye,
    FiChevronDown,
    FiChevronUp,
    FiSearch,
    FiFilter
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    });

    const statusColors = {
        placed: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-indigo-100 text-indigo-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        returned: 'bg-purple-100 text-purple-800',
    };

    const statusIcons = {
        placed: <FiClock className="text-yellow-600" />,
        processing: <FiClock className="text-blue-600" />,
        shipped: <FiTruck className="text-indigo-600" />,
        delivered: <FiCheckCircle className="text-green-600" />,
        cancelled: <FiXCircle className="text-red-600" />,
        returned: <FiXCircle className="text-purple-600" />,
    };

    // Load orders
    useEffect(() => {
        loadOrders();
    }, [pagination.page, filter]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getCustomerOrders({
                page: pagination.page,
                limit: pagination.limit,
                status: filter !== 'all' ? filter : undefined,
            });

            if (response.data.success) {
                setOrders(response.data.data.orders || []);
                setPagination({
                    ...pagination,
                    total: response.data.data.total || 0,
                    pages: response.data.data.pages || 0,
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // Handle order cancellation
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            const response = await ApiService.cancelOrder(orderId, { reason: 'Customer requested cancellation' });

            if (response.data.success) {
                toast.success('Order cancelled successfully!');
                loadOrders();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    // Toggle order details
    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    // Filtered orders
    const filteredOrders = orders.filter((order) => {
        if (!searchTerm) return true;
        return order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items?.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-500">Track and manage your orders</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    {['all', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${filter === status
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 max-w-xs ml-auto">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-24"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">No orders found</h3>
                    <p className="text-gray-500 mt-1">Start shopping to see your orders here</p>
                    <Link to="/products" className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Order Header */}
                            <div className="p-4 sm:p-6 cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="hidden sm:block">
                                            <FiPackage className="text-2xl text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{order.order_number}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {order.items?.length || 0} items • ₹{order.total_amount?.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {statusIcons[order.status]}
                                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                                        </span>
                                        {expandedOrder === order._id ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                                    </div>
                                </div>
                            </div>

                            {/* Order Details (Expanded) */}
                            {expandedOrder === order._id && (
                                <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                                    {/* Order Items */}
                                    <div className="space-y-3 mb-4">
                                        <h4 className="text-sm font-semibold text-gray-700">Items</h4>
                                        {order.items?.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    {item.productImage ? (
                                                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <FiPackage className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{item.productName}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price?.toFixed(2)}</p>
                                                </div>
                                                <p className="font-semibold text-gray-900">₹{(item.price * item.quantity)?.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-white p-4 rounded-lg">
                                            <p className="text-sm text-gray-500">Subtotal</p>
                                            <p className="font-semibold text-gray-900">₹{order.subtotal?.toFixed(2) || '0.00'}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg">
                                            <p className="text-sm text-gray-500">Shipping</p>
                                            <p className="font-semibold text-gray-900">₹{order.shipping_charge?.toFixed(2) || '0.00'}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg">
                                            <p className="text-sm text-gray-500">Total</p>
                                            <p className="font-semibold text-indigo-600 text-lg">₹{order.total_amount?.toFixed(2) || '0.00'}</p>
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    <div className="bg-white p-4 rounded-lg mb-4">
                                        <p className="text-sm font-semibold text-gray-700">Delivery Address</p>
                                        <p className="text-sm text-gray-600">{order.shipping_address}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-3">
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                                        >
                                            <FiEye />
                                            View Details
                                        </Link>
                                        {order.status === 'placed' && (
                                            <button
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                <FiXCircle />
                                                Cancel Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Orders;