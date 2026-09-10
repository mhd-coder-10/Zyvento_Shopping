// ============================================================
// TERMS & CONDITIONS PAGE
// Description: Terms and conditions page with detailed information
// Features: Terms sections, last updated date, navigation
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
    FiChevronRight,
    FiShield,
    FiFileText,
    FiCreditCard,
    FiTruck,
    FiRefreshCw,
    FiLock,
    FiAlertCircle,
    FiMail
} from 'react-icons/fi';

const TermsConditions = () => {
    const sections = [
        { id: 'acceptance', title: 'Acceptance of Terms' },
        { id: 'account', title: 'Account Registration' },
        { id: 'purchases', title: 'Purchases & Payments' },
        { id: 'shipping', title: 'Shipping & Delivery' },
        { id: 'returns', title: 'Returns & Refunds' },
        { id: 'intellectual', title: 'Intellectual Property' },
        { id: 'liability', title: 'Limitation of Liability' },
        { id: 'contact', title: 'Contact Us' },
    ];

    return (
        <div className="space-y-8 pb-12">

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
                            <span className="text-white">Terms & Conditions</span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <FiFileText className="text-3xl" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold">
                                    Terms & Conditions
                                </h1>
                            </div>
                        </div>
                        <p className="text-lg text-white/80">
                            Please read these terms carefully before using our platform.
                        </p>
                        <p className="text-sm text-white/60 mt-4">
                            Last updated: August 10, 2024
                        </p>
                    </div>
                </div>
            </section>

            {/* ============ CONTENT ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-3">On This Page</h3>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className="block px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        {section.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">

                        {/* Section 1 */}
                        <div id="acceptance" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiShield className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    By using our e-commerce platform, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please do not use our platform.
                                </p>
                                <p>
                                    We reserve the right to update or modify these terms at any time. Your continued use of the platform constitutes acceptance of the updated terms.
                                </p>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div id="account" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiLock className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">2. Account Registration</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    To access certain features, you must create an account. You agree to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Provide accurate and complete information</li>
                                    <li>Maintain the security of your account credentials</li>
                                    <li>Notify us immediately of any unauthorized use</li>
                                    <li>Be responsible for all activities under your account</li>
                                </ul>
                                <p>
                                    We reserve the right to suspend or terminate accounts that violate these terms.
                                </p>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div id="purchases" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiCreditCard className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">3. Purchases & Payments</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>All purchases are subject to the following conditions:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Prices are in Indian Rupees (₹) and include applicable taxes</li>
                                    <li>Payment must be completed at the time of purchase</li>
                                    <li>We accept major credit cards, debit cards, and UPI</li>
                                    <li>Orders are subject to availability and confirmation</li>
                                    <li>We reserve the right to refuse or cancel orders</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div id="shipping" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiTruck className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">4. Shipping & Delivery</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>Our shipping policies include:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Free shipping on orders above ₹999</li>
                                    <li>Estimated delivery time: 3-5 business days</li>
                                    <li>Tracking information provided via email</li>
                                    <li>International shipping options available</li>
                                    <li>Delays may occur due to unforeseen circumstances</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div id="returns" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiRefreshCw className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">5. Returns & Refunds</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>Our return policy includes:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>7-day easy return policy</li>
                                    <li>Refund processed within 3-5 business days</li>
                                    <li>Items must be unused and in original packaging</li>
                                    <li>Return shipping fees may apply</li>
                                    <li>Contact support for return initiation</li>
                                </ul>
                                <p className="mt-4">
                                    <span className="font-semibold">Note:</span> Some items may have specific return conditions. Please check the product page for details.
                                </p>
                            </div>
                        </div>

                        {/* Section 6 */}
                        <div id="intellectual" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiAlertCircle className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">6. Intellectual Property</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    All content on our platform, including text, images, logos, and software, is the property of E-Commerce and is protected by copyright laws.
                                </p>
                                <p>
                                    You may not:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Reproduce or distribute our content without permission</li>
                                    <li>Use our trademarks or branding without authorization</li>
                                    <li>Reverse engineer or modify our software</li>
                                    <li>Use our content for commercial purposes without consent</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 7 */}
                        <div id="liability" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiShield className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">7. Limitation of Liability</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    E-Commerce is not liable for:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Indirect or consequential damages</li>
                                    <li>Loss of profits or data</li>
                                    <li>Delays or interruptions in service</li>
                                    <li>Third-party claims or actions</li>
                                </ul>
                                <p>
                                    Our maximum liability is limited to the total amount paid for your purchase.
                                </p>
                            </div>
                        </div>

                        {/* Section 8 */}
                        <div id="contact" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiMail className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">8. Contact Us</h2>
                            </div>
                            <div className="space-y-3 text-gray-600 leading-relaxed">
                                <p>If you have any questions about these Terms & Conditions, please contact us:</p>
                                <ul className="space-y-2">
                                    <li><strong>Email:</strong> legal@ecommerce.com</li>
                                    <li><strong>Phone:</strong> +1 234 567 8900</li>
                                    <li><strong>Address:</strong> 123 E-Commerce St, Digital City, 12345</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsConditions;