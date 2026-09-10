// ============================================================
// ORDER DETAILS PAGE
// Description: View complete order details with status, items, payment, delivery tracking
// APIs: getCustomerOrderDetails, cancelOrder, requestReturn
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiPackage,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiTruck,
    FiMapPin,
    FiCreditCard,
    FiCalendar,
    FiArrowLeft,
    FiPrinter,
    FiDownload,
    FiRefreshCw,
    FiShoppingBag,
    FiHome,
    FiAlertCircle,
    FiChevronRight,
    FiUser,
    FiPhone,
    FiMail,
    FiTag,
    FiDollarSign
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [returning, setReturning] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    // Load order details
    useEffect(() => {
        if (orderId) {
            loadOrderDetails();
        }
    }, [orderId]);

    const loadOrderDetails = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getCustomerOrderDetails(orderId);

            if (response.data.success) {
                setOrder(response.data.data);
            } else {
                toast.error('Order not found');
                navigate('/orders');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load order details');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    // Cancel order
    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        setCancelling(true);
        try {
            const response = await ApiService.cancelOrder(orderId, {
                reason: 'Customer requested cancellation'
            });

            if (response.data.success) {
                toast.success('Order cancelled successfully!');
                loadOrderDetails();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    // Request return
    const handleRequestReturn = async () => {
        if (!window.confirm('Are you sure you want to request a return for this order?')) return;

        setReturning(true);
        try {
            const response = await ApiService.requestReturn(orderId, {
                reason: 'Customer requested return'
            });

            if (response.data.success) {
                toast.success('Return request submitted successfully!');
                loadOrderDetails();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to request return');
        } finally {
            setReturning(false);
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            placed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
            returned: 'bg-purple-100 text-purple-800 border-purple-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            placed: <FiClock className="text-yellow-600" />,
            processing: <FiRefreshCw className="text-blue-600" />,
            shipped: <FiTruck className="text-indigo-600" />,
            delivered: <FiCheckCircle className="text-green-600" />,
            cancelled: <FiXCircle className="text-red-600" />,
            returned: <FiXCircle className="text-purple-600" />,
        };
        return icons[status] || <FiClock className="text-gray-600" />;
    };

    // Get status label
    const getStatusLabel = (status) => {
        return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get payment status color
    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-purple-100 text-purple-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-6 w-6 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded w-48"></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-64"></div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <FiAlertCircle className="text-6xl text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
                <p className="text-gray-500 mt-2">The order you're looking for doesn't exist</p>
                <Link to="/orders" className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Back to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* ============ BACK BUTTON ============ */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    to="/orders"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <FiArrowLeft />
                    Back to Orders
                </Link>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Print">
                        <FiPrinter className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Download">
                        <FiDownload className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* ============ ORDER HEADER ============ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Order #{order.order_number}
                            </h1>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(order.status)}`}>
                                <span className="flex items-center gap-1.5">
                                    {getStatusIcon(order.status)}
                                    {getStatusLabel(order.status)}
                                </span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Placed on {formatDate(order.created_at)}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {order.status === 'placed' && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}
                        {(order.status === 'delivered' || order.status === 'shipped') && (
                            <button
                                onClick={handleRequestReturn}
                                disabled={returning}
                                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {returning ? 'Requesting...' : 'Request Return'}
                            </button>
                        )}
                        <Link
                            to="/help"
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Need Help?
                        </Link>
                    </div>
                </div>
            </div>

            {/* ============ ORDER SUMMARY CARDS ============ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">₹{order.total_amount?.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1) || 'Pending'}
                    </span>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Items</p>
                    <p className="text-xl font-semibold text-gray-900">{order.items?.length || 0} items</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="text-lg font-semibold text-gray-900">
                        {order.estimated_delivery ? formatDate(order.estimated_delivery) : 'Not available'}
                    </p>
                </div>
            </div>

            {/* ============ TABS ============ */}
            <div className="flex border-b border-gray-200 mb-6">
                {['details', 'items', 'tracking'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* ============ TAB CONTENT ============ */}
            <div className="space-y-6">

                {/* ===== TAB 1: DETAILS ===== */}
                {activeTab === 'details' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Shipping Address */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <FiMapPin className="text-indigo-600" />
                                Shipping Address
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p className="font-medium text-gray-900">{order.shipping_address?.full_name}</p>
                                <p>{order.shipping_address?.address_line1}</p>
                                {order.shipping_address?.address_line2 && (
                                    <p>{order.shipping_address.address_line2}</p>
                                )}
                                <p>
                                    {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                                </p>
                                <p className="flex items-center gap-2">
                                    <FiPhone className="text-gray-400" />
                                    {order.shipping_address?.phone}
                                </p>
                                {order.shipping_address?.email && (
                                    <p className="flex items-center gap-2">
                                        <FiMail className="text-gray-400" />
                                        {order.shipping_address.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <FiCreditCard className="text-indigo-600" />
                                Payment Details
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Payment Method</span>
                                    <span className="font-medium text-gray-900">
                                        {order.payment_method || 'Not specified'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Payment Status</span>
                                    <span className={`font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                        {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1) || 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Transaction ID</span>
                                    <span className="font-medium text-gray-900">
                                        {order.transaction_id || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-500">Paid At</span>
                                    <span className="font-medium text-gray-900">
                                        {order.paid_at ? formatDate(order.paid_at) : 'Not paid yet'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <FiTag className="text-indigo-600" />
                                Order Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{order.subtotal?.toFixed(2)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                                        <span>Discount</span>
                                        <span>-₹{order.discount?.toFixed(2)}</span>
                                    </div>
                                )}
                                {order.coupon_code && (
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Coupon</span>
                                        <span className="font-medium text-gray-900">{order.coupon_code}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="font-medium text-gray-900">
                                        {order.shipping_charge > 0 ? `₹${order.shipping_charge?.toFixed(2)}` : 'Free'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-indigo-600">₹{order.total_amount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== TAB 2: ITEMS ===== */}
                {activeTab === 'items' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {order.items?.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        {item.productImage ? (
                                                            <img
                                                                src={item.productImage}
                                                                alt={item.productName}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <FiShoppingBag className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            to={`/products/${item.productId}`}
                                                            className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                                                        >
                                                            {item.productName}
                                                        </Link>
                                                        <p className="text-xs text-gray-500">{item.brand}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                ₹{item.price?.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                                                ₹{(item.price * item.quantity)?.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                                    {getStatusLabel(item.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ===== TAB 3: TRACKING ===== */}
                {activeTab === 'tracking' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-6 flex items-center gap-2">
                            <FiTruck className="text-indigo-600" />
                            Order Tracking
                        </h3>

                        {order.tracking?.length > 0 ? (
                            <div className="relative pl-8 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                {order.tracking.map((event, index) => (
                                    <div key={index} className="relative">
                                        <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-4 border-white shadow ${index === 0 ? 'bg-indigo-600' : 'bg-gray-300'
                                            }`}></div>
                                        <div>
                                            <p className="font-medium text-gray-900">{event.description}</p>
                                            <p className="text-sm text-gray-500">{event.location}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDate(event.created_at)}
                                            </p>
                                        </div>
                                        {index < order.tracking.length - 1 && (
                                            <div className="ml-6 mt-1 h-6 border-l-2 border-dashed border-gray-200"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FiTruck className="text-4xl text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No tracking information available</p>
                                <p className="text-sm text-gray-400 mt-1">Check back later for updates</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ============ HELP SECTION ============ */}
            <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                <h4 className="text-sm font-semibold text-gray-700">Need help with this order?</h4>
                <p className="text-sm text-gray-500 mt-1">Our support team is here to assist you</p>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                    <Link
                        to="/help"
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Visit Help Center
                    </Link>
                    <a
                        href="mailto:support@ecommerce.com"
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Email Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;