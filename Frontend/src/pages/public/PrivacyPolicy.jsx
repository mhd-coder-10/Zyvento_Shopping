// PRIVACY POLICY PAGE
// Description: Privacy policy page with detailed information
// Features: Policy sections, last updated date, navigation

import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiShield, FiLock, FiEye, FiMail, FiShare2 } from 'react-icons/fi';

const PrivacyPolicy = () => {
    const sections = [
        { id: 'information', title: 'Information We Collect' },
        { id: 'usage', title: 'How We Use Your Information' },
        { id: 'sharing', title: 'Information Sharing' },
        { id: 'security', title: 'Data Security' },
        { id: 'cookies', title: 'Cookies & Tracking' },
        { id: 'rights', title: 'Your Rights' },
        { id: 'contact', title: 'Contact Us' },
    ];

    return (
        <div className="space-y-8 pb-12">

            {/* ============ HERO SECTION ============ */}
            <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 text-sm text-white/70 mb-4">
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            <FiChevronRight className="text-xs" />
                            <span className="text-white">Privacy Policy</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-lg text-white/80">
                            Your privacy matters to us. Learn how we collect, use, and protect your information.
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
                        <div id="information" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiEye className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    We collect information you provide directly, such as when you create an account, make a purchase, or contact us. This may include:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
                                    <li><strong>Payment Information:</strong> Payment method, billing address, and transaction history</li>
                                    <li><strong>Usage Data:</strong> Products viewed, search queries, and interactions with our platform</li>
                                    <li><strong>Device Information:</strong> IP address, browser type, and device identifiers</li>
                                    <li><strong>Location Data:</strong> Approximate location based on IP address</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div id="usage" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiLock className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>We use your information to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Process orders and manage your account</li>
                                    <li>Personalize your shopping experience</li>
                                    <li>Send order confirmations and updates</li>
                                    <li>Improve our products and services</li>
                                    <li>Prevent fraud and ensure security</li>
                                    <li>Send marketing communications (with your consent)</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div id="sharing" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiShare2 className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    We do not sell your personal information. We may share your information with:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Service Providers:</strong> Payment processors, shipping companies, and analytics providers</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div id="security" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiShield className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    We implement industry-standard security measures to protect your data:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Encryption for data in transit (SSL/TLS)</li>
                                    <li>Secure storage of sensitive information</li>
                                    <li>Regular security audits and vulnerability assessments</li>
                                    <li>Access controls and authentication protocols</li>
                                </ul>
                                <p className="mt-4">
                                    While we take reasonable precautions, no method of transmission over the internet is 100% secure. Please keep your account credentials confidential.
                                </p>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div id="cookies" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiEye className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Cookies & Tracking</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    We use cookies and similar technologies to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Remember your preferences and login status</li>
                                    <li>Analyze how you use our website</li>
                                    <li>Personalize content and advertisements</li>
                                    <li>Provide social media features</li>
                                </ul>
                                <p className="mt-4">
                                    You can control cookie preferences through your browser settings. However, disabling cookies may affect some features of our website.
                                </p>
                            </div>
                        </div>

                        {/* Section 6 */}
                        <div id="rights" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiLock className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>You have the right to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Access your personal data</li>
                                    <li>Correct inaccurate data</li>
                                    <li>Request deletion of your data</li>
                                    <li>Object to data processing</li>
                                    <li>Request data portability</li>
                                    <li>Withdraw consent at any time</li>
                                </ul>
                                <p className="mt-4">
                                    To exercise any of these rights, please contact us using the information below.
                                </p>
                            </div>
                        </div>

                        {/* Section 7 */}
                        <div id="contact" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiMail className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                            </div>
                            <div className="space-y-3 text-gray-600 leading-relaxed">
                                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                                <ul className="space-y-2">
                                    <li><strong>Email:</strong> privacy@ecommerce.com</li>
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

export default PrivacyPolicy;