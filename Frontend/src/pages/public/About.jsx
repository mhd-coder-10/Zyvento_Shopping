// ============================================================
// ABOUT PAGE
// Description: Public about page with company information
// Features: Company story, Team, Mission, Values
// ============================================================

import React from 'react';

const About = () => {
    const values = [
        { title: 'Quality First', description: 'We never compromise on quality' },
        { title: 'Customer Centric', description: 'Our customers are our priority' },
        { title: 'Innovation', description: 'Always looking for better solutions' },
        { title: 'Integrity', description: 'Honest and transparent dealings' },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
                    <p className="text-lg text-indigo-100">
                        We are passionate about connecting customers with amazing products
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Founded in 2024, we started with a simple mission: to make online shopping
                                easy, affordable, and enjoyable for everyone.
                            </p>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                Today, we are proud to serve thousands of happy customers across the country
                                with our wide range of products and exceptional customer service.
                            </p>
                        </div>
                        <div className="bg-indigo-50 rounded-2xl p-8 text-center">
                            <div className="text-6xl mb-4">🚀</div>
                            <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
                            <p className="text-gray-600 mt-2">
                                To provide the best shopping experience with quality products and
                                reliable service.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-12 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Values</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">⭐</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900">{value.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Team</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="text-center">
                                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center">
                                    <span className="text-3xl">👤</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900">Team Member {i}</h4>
                                <p className="text-sm text-gray-500">Position</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;