// RETURNS & REFUNDS PAGE
// Description: Return policy, refund process, conditions
// Features: Return steps, refund timeline, conditions table


import React from 'react';
import { Link } from 'react-router-dom';
import {
    FiRefreshCw,
    FiClock,
    FiShield,
    FiCheckCircle,
    FiXCircle,
    FiArrowRight,
    FiChevronRight,
    FiMail,
    FiPhone
} from 'react-icons/fi';

const ReturnsRefunds = () => {
    const returnSteps = [
        { step: 1, title: 'Initiate Return', description: 'Go to "My Orders" and select the item you want to return.' },
        { step: 2, title: 'Print Return Label', description: 'Download and print the return shipping label provided.' },
        { step: 3, title: 'Pack and Ship', description: 'Pack the item securely and ship it back to us using the provided label.' },
        { step: 4, title: 'Refund Processed', description: 'Once we receive and inspect the item, your refund will be processed.' },
    ];

    const returnConditions = [
        { condition: 'Return Period', detail: '7 days from delivery date' },
        { condition: 'Item Condition', detail: 'Unused, original packaging, all tags attached' },
        { condition: 'Return Shipping', detail: 'Free for eligible items' },
        { condition: 'Refund Timeline', detail: '3-5 business days after inspection' },
    ];

    const refundMethods = [
        { method: 'Original Payment Method', description: 'Refund to credit card, debit card, or bank account' },
        { method: 'Store Credit', description: 'Refund as store credit for future purchases' },
        { method: 'Exchange', description: 'Exchange for a different size or color' },
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
                            <span className="text-white">Returns & Refunds</span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <FiRefreshCw className="text-3xl" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold">
                                    Returns & Refunds
                                </h1>
                            </div>
                        </div>
                        <p className="text-lg text-white/80">
                            We want you to be completely satisfied with your purchase. Here's our return policy.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============ RETURN POLICY ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left: Key Points */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Return Policy</h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                                <FiCheckCircle className="text-green-600 text-xl mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">7-Day Easy Returns</h4>
                                    <p className="text-sm text-gray-600">You have 7 days from delivery to initiate a return.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <FiShield className="text-blue-600 text-xl mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">Free Return Shipping</h4>
                                    <p className="text-sm text-gray-600">We cover return shipping costs for eligible items.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <FiClock className="text-purple-600 text-xl mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">Quick Refund Processing</h4>
                                    <p className="text-sm text-gray-600">Refunds processed within 3-5 business days.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Conditions */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Conditions</h2>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            {returnConditions.map((item, index) => (
                                <div key={index} className={`flex items-center justify-between p-4 ${index < returnConditions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <span className="text-gray-600">{item.condition}</span>
                                    <span className="font-medium text-gray-900">{item.detail}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ RETURN STEPS ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How to Return an Item</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {returnSteps.map((step) => (
                        <div key={step.step} className="relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-full font-bold text-sm mb-4">
                                {step.step}
                            </div>
                            <h3 className="font-semibold text-gray-900">{step.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============ REFUND METHODS ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Methods</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {refundMethods.map((method, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-4">
                                <FiRefreshCw />
                            </div>
                            <h3 className="font-semibold text-gray-900">{method.method}</h3>
                            <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============ CONTACT ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Need Help with Your Return?</h2>
                    <p className="text-gray-600 mt-2">Our support team is here to assist you</p>

                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        <a
                            href="mailto:returns@ecommerce.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <FiMail />
                            Email Returns Team
                        </a>
                        <a
                            href="tel:+12345678900"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            <FiPhone />
                            Call Support
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReturnsRefunds;