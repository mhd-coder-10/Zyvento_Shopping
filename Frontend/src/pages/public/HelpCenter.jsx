// HELP CENTER PAGE
// Description: Help center with categories, search, and articles
// Features: Search, categories, articles list, contact options


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiSearch,
    FiChevronRight,
    FiMail,
    FiPhone,
    FiMessageCircle,
    FiBookOpen,
    FiTruck,
    FiRefreshCw,
    FiShield,
    FiCreditCard,
    FiUser,
    FiPackage,
    FiHelpCircle,
    FiArrowRight
} from 'react-icons/fi';

const HelpCenter = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'All Topics', icon: <FiHelpCircle /> },
        { id: 'orders', name: 'Orders', icon: <FiPackage /> },
        { id: 'shipping', name: 'Shipping', icon: <FiTruck /> },
        { id: 'returns', name: 'Returns', icon: <FiRefreshCw /> },
        { id: 'payments', name: 'Payments', icon: <FiCreditCard /> },
        { id: 'account', name: 'Account', icon: <FiUser /> },
    ];

    const articles = [
        {
            id: 1,
            category: 'orders',
            title: 'How to track your order',
            description: 'Learn how to track your order status and get delivery updates.',
            icon: <FiPackage />,
        },
        {
            id: 2,
            category: 'shipping',
            title: 'Shipping policies and delivery times',
            description: 'Understand our shipping methods, costs, and estimated delivery times.',
            icon: <FiTruck />,
        },
        {
            id: 3,
            category: 'returns',
            title: 'Return policy and refund process',
            description: 'Know our return policy, conditions, and how to initiate a return.',
            icon: <FiRefreshCw />,
        },
        {
            id: 4,
            category: 'payments',
            title: 'Payment methods and security',
            description: 'Learn about accepted payment methods and our secure payment process.',
            icon: <FiCreditCard />,
        },
        {
            id: 5,
            category: 'account',
            title: 'How to manage your account',
            description: 'Update profile, change password, and manage account settings.',
            icon: <FiUser />,
        },
        {
            id: 6,
            category: 'orders',
            title: 'Cancel or modify your order',
            description: 'Learn how to cancel or modify your order before it ships.',
            icon: <FiPackage />,
        },
    ];

    const filteredArticles = articles.filter((article) => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

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
                        How Can We Help You?
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto">
                        Find answers to your questions or contact our support team for assistance.
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto mt-6">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search for help articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* ============ CATEGORIES ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap gap-2 justify-center">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {category.icon}
                            {category.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* ============ ARTICLES GRID ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Help Articles</h2>
                        <p className="text-sm text-gray-500">{filteredArticles.length} articles found</p>
                    </div>
                </div>

                {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.map((article) => (
                            <Link
                                key={article.id}
                                to={`/help/${article.id}`}
                                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
                            >
                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-2xl mb-4 group-hover:bg-indigo-100 transition-colors">
                                    {article.icon}
                                </div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{article.description}</p>
                                <div className="flex items-center gap-1 mt-3 text-sm font-medium text-indigo-600">
                                    Read More
                                    <FiChevronRight className="text-xs" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-900">No articles found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search</p>
                    </div>
                )}
            </section>

            {/* ============ CONTACT OPTIONS ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Still Need Help?</h2>
                    <p className="text-gray-600 mt-2">Our support team is here to assist you</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 max-w-3xl mx-auto">
                        <a
                            href="mailto:support@ecommerce.com"
                            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                        >
                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-2xl">
                                <FiMail />
                            </div>
                            <span className="font-semibold text-gray-900">Email Us</span>
                            <span className="text-xs text-gray-500">24/7 Support</span>
                        </a>

                        <a
                            href="tel:+12345678900"
                            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                        >
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-2xl">
                                <FiPhone />
                            </div>
                            <span className="font-semibold text-gray-900">Call Us</span>
                            <span className="text-xs text-gray-500">9 AM - 9 PM</span>
                        </a>

                        <Link
                            to="/contact"
                            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                        >
                            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 text-2xl">
                                <FiMessageCircle />
                            </div>
                            <span className="font-semibold text-gray-900">Live Chat</span>
                            <span className="text-xs text-gray-500">Available Now</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HelpCenter;