// ============================================================
// HOME PAGE
// Description: Public home page with featured products and categories
// Features: Hero section, Categories, Featured products, Banners
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/public/product/ProductCard'
import CategoryNav from '../../components/public/CategoryNav';
import {
    FiShoppingBag,
    FiTruck,
    FiHeadphones,
    FiShield,
    FiChevronRight,
    FiStar,
    FiClock,
    FiTrendingUp
} from 'react-icons/fi';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('');

    useEffect(() => {
        setLoading(false);
        setFeaturedProducts([
            {
                _id: '1',
                productName: 'Premium Wireless Headphones',
                brand: 'Sony',
                price: 2999,
                finalPrice: 2499,
                discount: 17,
                rating: 4.8,
                totalReviews: 120,
                images: [],
            },
            {
                _id: '2',
                productName: 'Smart Fitness Band',
                brand: 'Xiaomi',
                price: 3999,
                finalPrice: 2999,
                discount: 25,
                rating: 4.5,
                totalReviews: 89,
                images: [],
            },
            {
                _id: '3',
                productName: 'Noise Cancelling Earbuds',
                brand: 'Bose',
                price: 7999,
                finalPrice: 6499,
                discount: 19,
                rating: 4.9,
                totalReviews: 45,
                images: [],
            },
            {
                _id: '4',
                productName: 'Smart Watch Pro',
                brand: 'Apple',
                price: 24999,
                finalPrice: 19999,
                discount: 20,
                rating: 4.7,
                totalReviews: 230,
                images: [],
            },
        ]);
    }, []);

    const features = [
        { icon: FiShoppingBag, title: 'Free Shipping', description: 'On orders above ₹999' },
        { icon: FiTruck, title: 'Fast Delivery', description: 'Delivery within 3-5 days' },
        { icon: FiHeadphones, title: '24/7 Support', description: 'Dedicated customer care' },
        { icon: FiShield, title: 'Secure Payment', description: '100% secure transactions' },
    ];

    const categories = [
        { id: 'electronics', name: 'Electronics', icon: '📱', color: 'bg-blue-50 text-blue-600' },
        { id: 'fashion', name: 'Fashion', icon: '👕', color: 'bg-pink-50 text-pink-600' },
        { id: 'home', name: 'Home & Kitchen', icon: '🏠', color: 'bg-green-50 text-green-600' },
        { id: 'books', name: 'Books', icon: '📚', color: 'bg-purple-50 text-purple-600' },
        { id: 'beauty', name: 'Beauty', icon: '💄', color: 'bg-rose-50 text-rose-600' },
        { id: 'toys', name: 'Toys & Games', icon: '🎮', color: 'bg-yellow-50 text-yellow-600' },
    ];

    return (
        <div className="space-y-8 pb-8">

            {/* ============================================================
                HERO SECTION - Modern with Gradient
                ============================================================ */}
            <section className="relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"></div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                {/* Content */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

                        {/* Left Content */}
                        <div className="lg:w-1/2 text-center lg:text-left text-white">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
                                <span className="animate-pulse">⚡</span>
                                Summer Sale - Up to 50% Off
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                                Discover Amazing
                                <span className="block text-yellow-300">Products Today</span>
                            </h1>

                            <p className="text-lg text-white/80 mb-6 max-w-lg mx-auto lg:mx-0">
                                Shop the latest trends with unbeatable prices. Quality products delivered to your doorstep.
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/products"
                                    className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                                >
                                    Shop Now
                                    <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/about"
                                    className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/50 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
                                >
                                    Learn More
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-8 mt-8 justify-center lg:justify-start">
                                <div>
                                    <p className="text-2xl font-bold">10K+</p>
                                    <p className="text-sm text-white/70">Happy Customers</p>
                                </div>
                                <div className="w-px h-10 bg-white/20"></div>
                                <div>
                                    <p className="text-2xl font-bold">500+</p>
                                    <p className="text-sm text-white/70">Brands</p>
                                </div>
                                <div className="w-px h-10 bg-white/20"></div>
                                <div>
                                    <p className="text-2xl font-bold">4.8★</p>
                                    <p className="text-sm text-white/70">Average Rating</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Hero Image/Grid */}
                        <div className="lg:w-1/2">
                            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                                    <div className="text-4xl mb-2">🛍️</div>
                                    <p className="text-sm font-medium text-white">Electronics</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                                    <div className="text-4xl mb-2">👗</div>
                                    <p className="text-sm font-medium text-white">Fashion</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                                    <div className="text-4xl mb-2">🏠</div>
                                    <p className="text-sm font-medium text-white">Home</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                                    <div className="text-4xl mb-2">📚</div>
                                    <p className="text-sm font-medium text-white">Books</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                FEATURES SECTION
                ============================================================ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                            >
                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Icon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h4 className="text-sm font-semibold text-gray-900">{feature.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ============================================================
                CATEGORIES SECTION
                ============================================================ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                        <p className="text-sm text-gray-500">Browse by category</p>
                    </div>
                    <Link
                        to="/categories"
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                        View All
                        <FiChevronRight className="text-sm" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${activeCategory === category.id
                                    ? 'bg-indigo-100 border-2 border-indigo-500 shadow-md'
                                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                }`}
                        >
                            <span className={`text-2xl ${category.color.split(' ')[0]}`}>
                                {category.icon}
                            </span>
                            <span className="text-xs font-medium text-gray-700 text-center">
                                {category.name}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* ============================================================
                BANNER SECTION
                ============================================================ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Banner 1 */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white min-h-[120px] flex items-center">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Limited Offer</span>
                            <h3 className="text-lg font-bold">Summer Sale</h3>
                            <p className="text-sm opacity-90">Up to 50% off on electronics</p>
                        </div>
                        <span className="absolute -right-4 -bottom-4 text-7xl opacity-20">🔥</span>
                    </div>

                    {/* Banner 2 */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white min-h-[120px] flex items-center">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">New Arrival</span>
                            <h3 className="text-lg font-bold">Smart Watches</h3>
                            <p className="text-sm opacity-90">Starting at ₹9,999 only</p>
                        </div>
                        <span className="absolute -right-4 -bottom-4 text-7xl opacity-20">⌚</span>
                    </div>

                    {/* Banner 3 */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white min-h-[120px] flex items-center">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Member Deal</span>
                            <h3 className="text-lg font-bold">Extra 10% Off</h3>
                            <p className="text-sm opacity-90">For all registered users</p>
                        </div>
                        <span className="absolute -right-4 -bottom-4 text-7xl opacity-20">🎁</span>
                    </div>
                </div>
            </section>

            {/* ============================================================
                FEATURED PRODUCTS SECTION
                ============================================================ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                        <p className="text-sm text-gray-500">Handpicked just for you</p>
                    </div>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                        View All
                        <FiChevronRight className="text-sm" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 h-48 rounded-xl"></div>
                                <div className="mt-3 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onClick={() => { }}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;