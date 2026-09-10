// BLOG PAGE
// Description: Blog listing page with articles and categories
// Features: Blog cards, categories, search, pagination

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiSearch,
    FiUser,
    FiCalendar,
    FiClock,
    FiTag,
    FiChevronRight,
    FiBookmark,
    FiShare2
} from 'react-icons/fi';

const Blog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'All Posts' },
        { id: 'trending', name: 'Trending' },
        { id: 'technology', name: 'Technology' },
        { id: 'fashion', name: 'Fashion' },
        { id: 'lifestyle', name: 'Lifestyle' },
        { id: 'reviews', name: 'Reviews' },
    ];

    const posts = [
        {
            id: 1,
            title: 'Top 10 Smartphones Under ₹20,000 in 2024',
            category: 'Technology',
            author: 'John Doe',
            date: 'Aug 10, 2024',
            readTime: '5 min read',
            excerpt: 'Discover the best budget smartphones that offer premium features without breaking the bank.',
            image: '📱',
        },
        {
            id: 2,
            title: 'Sustainable Fashion: How to Build an Eco-Friendly Wardrobe',
            category: 'Fashion',
            author: 'Jane Smith',
            date: 'Aug 8, 2024',
            readTime: '7 min read',
            excerpt: 'Learn how to make sustainable fashion choices and reduce your environmental impact.',
            image: '👗',
        },
        {
            id: 3,
            title: 'The Future of E-Commerce: AI and Personalization',
            category: 'Technology',
            author: 'Mike Johnson',
            date: 'Aug 5, 2024',
            readTime: '4 min read',
            excerpt: 'How artificial intelligence is transforming the online shopping experience.',
            image: '🤖',
        },
        {
            id: 4,
            title: '5 Morning Routines of Successful Entrepreneurs',
            category: 'Lifestyle',
            author: 'Sarah Wilson',
            date: 'Aug 3, 2024',
            readTime: '6 min read',
            excerpt: 'Start your day right with these proven morning routines from successful entrepreneurs.',
            image: '🌅',
        },
        {
            id: 5,
            title: 'Noise Cancelling Headphones: Which One to Buy?',
            category: 'Reviews',
            author: 'Alex Brown',
            date: 'Aug 1, 2024',
            readTime: '8 min read',
            excerpt: 'A comprehensive review of the best noise cancelling headphones available today.',
            image: '🎧',
        },
        {
            id: 6,
            title: 'Minimalist Living: Declutter Your Home in 30 Days',
            category: 'Lifestyle',
            author: 'Emma Davis',
            date: 'Jul 28, 2024',
            readTime: '4 min read',
            excerpt: 'Transform your living space with this simple 30-day decluttering challenge.',
            image: '🏠',
        },
    ];

    const filteredPosts = posts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || post.category.toLowerCase() === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-10 pb-12">

            {/* ============ HERO SECTION ============ */}
            <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Insights & Stories
                        <span className="block text-yellow-300">From Our Experts</span>
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto">
                        Stay updated with the latest trends, tips, and insights from industry experts.
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto mt-6">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search articles..."
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
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* ============ BLOG GRID ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
                        <p className="text-sm text-gray-500">{filteredPosts.length} articles found</p>
                    </div>
                </div>

                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post) => (
                            <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Image Placeholder */}
                                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-6xl">
                                    {post.image}
                                </div>

                                <div className="p-6">
                                    {/* Category Badge */}
                                    <span className="inline-block px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full">
                                        {post.category}
                                    </span>

                                    <h3 className="text-xl font-semibold text-gray-900 mt-2 hover:text-indigo-600 transition-colors">
                                        <Link to={`/blog/${post.id}`}>{post.title}</Link>
                                    </h3>

                                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{post.excerpt}</p>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <FiUser className="text-xs" />
                                            {post.author}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiCalendar className="text-xs" />
                                            {post.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiClock className="text-xs" />
                                            {post.readTime}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <Link
                                            to={`/blog/${post.id}`}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                        >
                                            Read More
                                            <FiChevronRight />
                                        </Link>
                                        <div className="flex gap-3">
                                            <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                                <FiBookmark />
                                            </button>
                                            <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                                <FiShare2 />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-900">No articles found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or filter</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Blog;