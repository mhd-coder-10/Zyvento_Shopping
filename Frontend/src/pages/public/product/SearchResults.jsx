
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiSearch,
    FiShoppingBag,
    FiGrid,
    FiList,
    FiX,
    FiArrowLeft,
} from 'react-icons/fi';

import ApiService from '../../../api/ApiService';
import ProductCard from '../../../components/public/product/ProductCard';
import ProductSort from '../../../components/public/product/ProductSort';
import ProductSkeleton from '../../../components/public/product/ProductSkeleton';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });
    const [sortBy, setSortBy] = useState('relevance');

    // Load search results
    useEffect(() => {
        if (query) {
            loadSearchResults();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [query, sortBy, pagination.page]);

    const loadSearchResults = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: query,
                sortBy: sortBy === 'relevance' ? undefined : sortBy,
            };

            const response = await ApiService.getProducts(params);

            if (response.data.success) {
                setProducts(response.data.data.products || []);
                setPagination({
                    ...pagination,
                    total: response.data.data.total || 0,
                    pages: response.data.data.pages || 0,
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load search results');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Search Results</h1>
                        <p className="text-sm text-gray-500">
                            {query ? `Showing results for "${query}"` : 'Enter a search term'}
                        </p>
                    </div>
                </div>

                {query && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-500">
                            {pagination.total > 0 ? `${pagination.total} products found` : 'No products found'}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <FiGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <FiList className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* SEARCH BAR */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const searchQuery = e.target.search.value.trim();
                    if (searchQuery) {
                        navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
                    }
                }}
                className="mb-4 sm:mb-6"
            >
                <div className="flex gap-2 sm:gap-3">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            name="search"
                            type="text"
                            placeholder="Search products..."
                            defaultValue={query}
                            className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white text-sm sm:text-base font-medium rounded-lg sm:rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                        Search
                    </button>
                    {query && (
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1 sm:gap-2 text-gray-600 text-sm sm:text-base"
                        >
                            <FiX className="w-4 h-4" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    )}
                </div>
            </form>

            {/* RESULTS */}
            {query ? (
                <>
                    {/* Sort Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                        <ProductSort
                            sortBy={sortBy}
                            onSortChange={(value) => setSortBy(value)}
                        />
                        <span className="text-sm text-gray-500">
                            Showing {products.length} of {pagination.total} results
                        </span>
                    </div>

                    {loading ? (
                        <ProductSkeleton count={8} viewMode={viewMode} />
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200">
                            <FiSearch className="text-5xl sm:text-6xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">No products found</h3>
                            <p className="text-sm sm:text-base text-gray-500 mt-1">
                                We couldn't find any products matching "{query}"
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                Try adjusting your search terms or browse all products
                            </p>
                            <Link
                                to="/products"
                                className="inline-block mt-4 sm:mt-6 px-5 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Browse All Products
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div
                                className={`grid gap-3 sm:gap-4 md:gap-6 ${viewMode === 'grid'
                                        ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                                        : 'grid-cols-1'
                                    }`}
                            >
                                {products.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        viewMode={viewMode}
                                        onUpdate={loadSearchResults}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                                    <button
                                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                        disabled={pagination.page === 1}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                        disabled={pagination.page === pagination.pages}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200">
                    <FiSearch className="text-5xl sm:text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Search for products</h3>
                    <p className="text-sm sm:text-base text-gray-500 mt-1">Enter a search term above to find products</p>
                    <Link
                        to="/products"
                        className="inline-block mt-4 sm:mt-6 px-5 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Browse All Products
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SearchResults;