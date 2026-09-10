// COOKIES PAGE
// Description: Cookies policy page with detailed information
// Features: Cookie types, preferences, policy sections

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiChevronRight,
    FiShield,
    FiSettings,
    FiLock,
    FiAlertCircle,
    FiCheckCircle,
    FiXCircle,
    FiRefreshCw,
    FiMail,
    FiEye,
    FiTarget,
    FiUser
} from 'react-icons/fi';

const Cookies = () => {
    const [cookiePreferences, setCookiePreferences] = useState({
        necessary: true,
        functional: true,
        analytics: false,
        marketing: false,
    });

    const sections = [
        { id: 'what-are-cookies', title: 'What Are Cookies' },
        { id: 'how-we-use', title: 'How We Use Cookies' },
        { id: 'types', title: 'Types of Cookies' },
        { id: 'manage', title: 'Manage Your Preferences' },
        { id: 'third-party', title: 'Third-Party Cookies' },
        { id: 'contact', title: 'Contact Us' },
    ];

    const cookieTypes = [
        {
            id: 'necessary',
            icon: <FiLock className="text-lg" />,
            name: 'Necessary Cookies',
            description: 'Essential for the website to function properly. These cookies are always enabled.',
            required: true,
        },
        {
            id: 'functional',
            icon: <FiSettings className="text-lg" />,
            name: 'Functional Cookies',
            description: 'Enhance functionality and personalization, such as remembering your preferences.',
            required: false,
        },
        {
            id: 'analytics',
            icon: <FiTarget className="text-lg" />,
            name: 'Analytics Cookies',
            description: 'Help us understand how visitors interact with our website by collecting anonymous data.',
            required: false,
        },
        {
            id: 'marketing',
            icon: <FiUser className="text-lg" />,
            name: 'Marketing Cookies',
            description: 'Used to deliver relevant advertisements and track marketing campaign performance.',
            required: false,
        },
    ];

    const handlePreferenceChange = (type) => {
        if (type === 'necessary') return; // Can't disable necessary cookies
        setCookiePreferences((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const handleSavePreferences = () => {
        // In real app, save to backend or localStorage
        alert('Cookie preferences saved successfully!');
    };

    const handleAcceptAll = () => {
        setCookiePreferences({
            necessary: true,
            functional: true,
            analytics: true,
            marketing: true,
        });
    };

    const handleRejectAll = () => {
        setCookiePreferences({
            necessary: true,
            functional: false,
            analytics: false,
            marketing: false,
        });
    };

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
                            <span className="text-white">Cookies Policy</span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <FiShield className="text-3xl" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold">
                                    Cookies Policy
                                </h1>
                            </div>
                        </div>
                        <p className="text-lg text-white/80">
                            We use cookies to enhance your browsing experience and personalize content.
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

                        {/* Cookie Preferences - Quick Actions */}
                        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Cookie Preferences</h3>
                                    <p className="text-sm text-gray-500">Manage your cookie settings</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={handleAcceptAll}
                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Accept All
                                    </button>
                                    <button
                                        onClick={handleRejectAll}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Reject All
                                    </button>
                                    <button
                                        onClick={handleSavePreferences}
                                        className="px-4 py-2 border-2 border-indigo-600 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors"
                                    >
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Section 1 */}
                        <div id="what-are-cookies" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiAlertCircle className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">What Are Cookies?</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Cookies are small text files that are stored on your device when you visit a website. They help us:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Remember your preferences and login status</li>
                                    <li>Analyze how you use our website</li>
                                    <li>Personalize your shopping experience</li>
                                    <li>Show relevant advertisements</li>
                                </ul>
                                <p>
                                    Cookies do not contain personal information like your name, email, or credit card details. They are simply used to make your browsing experience better.
                                </p>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div id="how-we-use" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiEye className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">How We Use Cookies</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>We use cookies for the following purposes:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Authentication:</strong> To verify your identity and keep you logged in</li>
                                    <li><strong>Preferences:</strong> To remember your language, currency, and region settings</li>
                                    <li><strong>Analytics:</strong> To understand how you navigate and interact with our website</li>
                                    <li><strong>Marketing:</strong> To show you relevant offers and advertisements</li>
                                    <li><strong>Security:</strong> To protect against fraud and unauthorized access</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 3 - Types of Cookies with Preferences */}
                        <div id="types" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiSettings className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Types of Cookies</h2>
                            </div>

                            <div className="space-y-4 mt-4">
                                {cookieTypes.map((cookie) => (
                                    <div key={cookie.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="p-2 bg-white rounded-lg text-indigo-600 mt-1">
                                            {cookie.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{cookie.name}</h4>
                                                    <p className="text-sm text-gray-500">{cookie.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {cookie.required ? (
                                                        <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                                            <FiLock className="text-xs" />
                                                            Required
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handlePreferenceChange(cookie.id)}
                                                            className={`relative w-11 h-6 rounded-full transition-colors ${cookiePreferences[cookie.id] ? 'bg-indigo-600' : 'bg-gray-300'
                                                                }`}
                                                        >
                                                            <span
                                                                className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${cookiePreferences[cookie.id] ? 'translate-x-5' : ''
                                                                    }`}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-700 flex items-center gap-2">
                                    <FiCheckCircle className="text-lg" />
                                    You can change your cookie preferences at any time through your browser settings.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 - Manage Preferences */}
                        <div id="manage" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiRefreshCw className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Manage Your Preferences</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    You can manage your cookie preferences through your browser settings. Here's how:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                                    <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                                    <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                                    <li><strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</li>
                                </ul>
                                <p className="mt-4">
                                    <span className="font-semibold">Note:</span> Disabling certain cookies may affect your browsing experience and some features may not work properly.
                                </p>
                            </div>
                        </div>

                        {/* Section 5 - Third-Party Cookies */}
                        <div id="third-party" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiTarget className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Third-Party Cookies</h2>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    We use third-party services that may place cookies on your device:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Google Analytics:</strong> For website analytics and usage tracking</li>
                                    <li><strong>Facebook Pixel:</strong> For targeted advertising and retargeting</li>
                                    <li><strong>Payment Gateways:</strong> For secure payment processing</li>
                                    <li><strong>Social Media:</strong> For sharing content and social media integration</li>
                                </ul>
                                <p>
                                    These third-party services have their own privacy policies and cookie practices.
                                </p>
                            </div>
                        </div>

                        {/* Section 6 */}
                        <div id="contact" className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FiMail className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                            </div>
                            <div className="space-y-3 text-gray-600 leading-relaxed">
                                <p>If you have any questions about our Cookie Policy, please contact us:</p>
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

export default Cookies;