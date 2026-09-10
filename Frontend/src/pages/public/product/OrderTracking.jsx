// ORDER TRACKING PAGE
// Description: Track your order status with order ID
// Features: Form to enter order ID, status display, timeline

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiSearch,
    FiCheckCircle,
    FiClock,
    FiPackage,
    FiTruck,
    FiCheck,
    FiAlertCircle,
    FiChevronRight,
    FiMail
} from 'react-icons/fi';

const OrderTracking = () => {
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderStatus, setOrderStatus] = useState(null);
    const [error, setError] = useState('');

    // Simulate API call
    const handleTrackOrder = (e) => {
        e.preventDefault();

        if (!orderId.trim()) {
            setError('Please enter your order ID');
            return;
        }

        setLoading(true);
        setError('');
        setOrderStatus(null);

        // Simulate API delay
        setTimeout(() => {
            // Demo status data
            const demoStatus = {
                orderId: orderId,
                status: 'shipped', // placed, processing, shipped, delivered
                placedDate: '2024-08-10',
                estimatedDelivery: '2024-08-15',
                items: [
                    { name: 'Product 1', quantity: 1 },
                    { name: 'Product 2', quantity: 2 },
                ],
                tracking: [
                    { date: '2024-08-10', time: '10:30 AM', location: 'Order Placed', description: 'Your order has been confirmed.' },
                    { date: '2024-08-11', time: '02:15 PM', location: 'Warehouse, Mumbai', description: 'Order packed and ready for shipment.' },
                    { date: '2024-08-12', time: '09:00 AM', location: 'Transit Facility, Delhi', description: 'Order dispatched from Mumbai facility.' },
                    { date: '2024-08-13', time: '11:30 AM', location: 'Transit Facility, Delhi', description: 'Order in transit to your location.' },
                ],
                deliveryAddress: '123 Main Street, Mumbai, Maharashtra - 400001'
            };

            setOrderStatus(demoStatus);
            setLoading(false);
        }, 1500);
    };

    // Get status icon and color
    const getStatusInfo = (status) => {
        const statusMap = {
            placed: { icon: <FiClock className="text-lg" />, color: 'bg-yellow-500', text: 'Order Placed' },
            processing: { icon: <FiPackage className="text-lg" />, color: 'bg-blue-500', text: 'Processing' },
            shipped: { icon: <FiTruck className="text-lg" />, color: 'bg-indigo-500', text: 'Shipped' },
            delivered: { icon: <FiCheckCircle className="text-lg" />, color: 'bg-green-500', text: 'Delivered' },
        };
        return statusMap[status] || statusMap.placed;
    };

    return (
        <div className="space-y-10 pb-12">

            {/* ============ HERO SECTION ============ */}
            <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Track Your Order
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto">
                        Enter your order ID to get real-time status and delivery updates.
                    </p>
                </div>
            </section>

            {/* ============ TRACKING FORM ============ */}
            <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                    <form onSubmit={handleTrackOrder} className="space-y-4">
                        <div>
                            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Order ID
                            </label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        id="orderId"
                                        placeholder="Enter your order ID (e.g., ORD-123456)"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                    />
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                    {loading ? 'Tracking...' : 'Track'}
                                </button>
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                    <FiAlertCircle />
                                    {error}
                                </p>
                            )}
                        </div>
                    </form>

                    {/* Tips */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-500">
                            <span className="font-medium">Where to find your order ID?</span>
                            <br />
                            Check your order confirmation email or go to "My Orders" in your account.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============ ORDER STATUS ============ */}
            {orderStatus && (
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">

                    {/* Status Summary */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Order ID</p>
                                <p className="text-xl font-bold text-gray-900">{orderStatus.orderId}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`${getStatusInfo(orderStatus.status).color} p-2 rounded-full text-white`}>
                                    {getStatusInfo(orderStatus.status).icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {getStatusInfo(orderStatus.status).text}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-sm text-gray-500">Estimated Delivery</p>
                                <p className="text-lg font-semibold text-gray-900">{orderStatus.estimatedDelivery}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tracking Timeline */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tracking History</h3>

                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                            {orderStatus.tracking.map((event, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute -left-6 top-0.5 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow"></div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{event.description}</p>
                                            <p className="text-sm text-gray-500">{event.location}</p>
                                        </div>
                                        <p className="text-sm text-gray-400 whitespace-nowrap">
                                            {event.date} • {event.time}
                                        </p>
                                    </div>
                                    {index < orderStatus.tracking.length - 1 && (
                                        <div className="ml-6 mt-1 hidden sm:block h-6 border-l-2 border-dashed border-gray-200"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mt-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Delivery Address</h4>
                        <p className="text-gray-600">{orderStatus.deliveryAddress}</p>
                    </div>
                </section>
            )}

            {/* ============ NEED HELP ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Need Help Tracking Your Order?</h2>
                    <p className="text-gray-600 mt-2">Contact our support team for assistance</p>

                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        <a
                            href="mailto:support@ecommerce.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <FiMail />
                            Email Support
                        </a>
                        <Link
                            to="/help-center"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            Help Center
                            <FiChevronRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OrderTracking;