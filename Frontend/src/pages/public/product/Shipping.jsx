// SHIPPING PAGE
// Description: Shipping policy, methods, charges, and tracking
// Features: Shipping methods, charges table, tracking info


import React from 'react';
import { Link } from 'react-router-dom';
import {
    FiTruck,
    FiClock,
    FiMapPin,
    FiBox,
    FiDollarSign,
    FiCheckCircle,
    FiChevronRight
} from 'react-icons/fi';

const Shipping = () => {
    const shippingMethods = [
        {
            id: 'standard',
            icon: <FiTruck />,
            name: 'Standard Delivery',
            duration: '3-5 Business Days',
            charge: 'Free on orders above ₹999',
            description: 'Reliable delivery with real-time tracking.',
        },
        {
            id: 'express',
            icon: <FiClock />,
            name: 'Express Delivery',
            duration: '1-2 Business Days',
            charge: '₹99 - ₹199',
            description: 'Available in select cities. Faster delivery at your doorstep.',
        },
        {
            id: 'same-day',
            icon: <FiBox />,
            name: 'Same Day Delivery',
            duration: 'Same Day',
            charge: '₹299 - ₹499',
            description: 'Order before 12 PM for same-day delivery in select areas.',
        },
    ];

    const shippingCharges = [
        { orderValue: 'Below ₹499', charge: '₹50', delivery: '3-5 Business Days' },
        { orderValue: '₹499 - ₹999', charge: '₹30', delivery: '3-5 Business Days' },
        { orderValue: 'Above ₹999', charge: 'Free', delivery: '3-5 Business Days' },
        { orderValue: 'Any (Express)', charge: '₹99 - ₹199', delivery: '1-2 Business Days' },
    ];

    return (
        <div className="space-y-10 pb-12">

            {/* ============ HERO SECTION ============ */}
            <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 text-sm text-white/70 mb-4">
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            <FiChevronRight className="text-xs" />
                            <span className="text-white">Shipping Policy</span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <FiTruck className="text-3xl" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold">
                                    Shipping Information
                                </h1>
                            </div>
                        </div>
                        <p className="text-lg text-white/80">
                            We deliver to every corner of the country. Choose the shipping method that works for you.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============ SHIPPING METHODS ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Methods</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {shippingMethods.map((method) => (
                        <div key={method.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-2xl mb-4">
                                {method.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium mt-1">
                                <FiClock className="text-sm" />
                                {method.duration}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{method.description}</p>
                            <p className="text-sm font-semibold text-gray-900 mt-3">{method.charge}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============ SHIPPING CHARGES ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Charges</h2>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipping Charge</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {shippingCharges.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 text-sm text-gray-900">{item.orderValue}</td>
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.charge}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{item.delivery}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ============ SHIPPING FEATURES ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                        <FiCheckCircle className="text-indigo-600 text-xl mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Free Shipping</h4>
                            <p className="text-xs text-gray-500">On orders above ₹999</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                        <FiMapPin className="text-indigo-600 text-xl mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Pan India Delivery</h4>
                            <p className="text-xs text-gray-500">20,000+ pin codes covered</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                        <FiClock className="text-indigo-600 text-xl mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Real-Time Tracking</h4>
                            <p className="text-xs text-gray-500">Track your order anytime</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                        <FiDollarSign className="text-indigo-600 text-xl mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Secure Packaging</h4>
                            <p className="text-xs text-gray-500">Items delivered safely</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Shipping;