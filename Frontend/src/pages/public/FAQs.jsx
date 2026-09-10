// FAQS PAGE
// Description: Frequently Asked Questions with categories
// Features: Categories, accordion, search, expand all/collapse all

import React, { useState } from 'react';
import { FiSearch, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const FAQs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openQuestions, setOpenQuestions] = useState([]);

    const categories = [
        { id: 'all', name: 'All Questions' },
        { id: 'ordering', name: 'Ordering' },
        { id: 'shipping', name: 'Shipping' },
        { id: 'returns', name: 'Returns & Refunds' },
        { id: 'payments', name: 'Payments' },
        { id: 'account', name: 'Account' },
    ];

    const faqs = [
        {
            id: 1,
            category: 'ordering',
            question: 'How do I place an order?',
            answer: 'Browse products, add to cart, proceed to checkout, enter shipping details, and complete payment. You will receive a confirmation email with order details.'
        },
        {
            id: 2,
            category: 'ordering',
            question: 'Can I cancel my order?',
            answer: 'Yes, you can cancel your order before it ships. Go to "My Orders" in your account and select "Cancel Order". Cancellations after shipping may incur fees.'
        },
        {
            id: 3,
            category: 'shipping',
            question: 'What are the shipping charges?',
            answer: 'We offer free shipping on orders above ₹999. For orders below ₹999, shipping charges apply based on your location and delivery speed selected.'
        },
        {
            id: 4,
            category: 'shipping',
            question: 'How long does delivery take?',
            answer: 'Standard delivery takes 3-5 business days. Express delivery is available in select cities with 1-2 business days delivery.'
        },
        {
            id: 5,
            category: 'returns',
            question: 'What is your return policy?',
            answer: 'We offer a 7-day return policy. Items must be unused, in original packaging, and with all tags attached. Return shipping is free for eligible orders.'
        },
        {
            id: 6,
            category: 'returns',
            question: 'How long does refund processing take?',
            answer: 'Once we receive and inspect your return, refunds are processed within 3-5 business days. Credit card refunds may take an additional 2-3 days to reflect.'
        },
        {
            id: 7,
            category: 'payments',
            question: 'What payment methods do you accept?',
            answer: 'We accept Credit/Debit Cards, UPI, Net Banking, and digital wallets. All payments are processed securely through encrypted payment gateways.'
        },
        {
            id: 8,
            category: 'payments',
            question: 'Is my payment information secure?',
            answer: 'Yes! We use industry-standard SSL encryption and PCI-compliant payment gateways to ensure your data is fully protected.'
        },
        {
            id: 9,
            category: 'account',
            question: 'How do I create an account?',
            answer: 'Click on "Login" → "Sign Up" and enter your details. You can also sign up using Google or social media accounts for faster registration.'
        },
        {
            id: 10,
            category: 'account',
            question: 'How do I reset my password?',
            answer: 'Go to "Login" → "Forgot Password" and enter your email. You will receive a password reset link to create a new password.'
        },
    ];

    const toggleQuestion = (id) => {
        setOpenQuestions((prev) =>
            prev.includes(id)
                ? prev.filter((q) => q !== id)
                : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (openQuestions.length === filteredFaqs.length) {
            setOpenQuestions([]);
        } else {
            setOpenQuestions(filteredFaqs.map((faq) => faq.id));
        }
    };

    const filteredFaqs = faqs.filter((faq) => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
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
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto">
                        Find answers to the most commonly asked questions about our platform and services.
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto mt-6">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* ============ CATEGORIES ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category.id
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={toggleAll}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                        {openQuestions.length === filteredFaqs.length ? 'Collapse All' : 'Expand All'}
                    </button>
                </div>
            </section>

            {/* ============ FAQS LIST ============ */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {filteredFaqs.length > 0 ? (
                    <div className="space-y-3">
                        {filteredFaqs.map((faq) => (
                            <div
                                key={faq.id}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-indigo-200 transition-all"
                            >
                                <button
                                    onClick={() => toggleQuestion(faq.id)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-medium text-gray-900">{faq.question}</span>
                                    <span className={`text-gray-400 transition-transform ${openQuestions.includes(faq.id) ? 'rotate-180' : ''}`}>
                                        <FiChevronDown />
                                    </span>
                                </button>

                                {openQuestions.includes(faq.id) && (
                                    <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-900">No FAQs found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default FAQs;