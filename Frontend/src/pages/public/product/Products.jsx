// PRODUCTS PAGE
// Description: All products listing with filters, search, pagination
// APIs: getProducts, getCategories

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiSearch,
    FiFilter,
    FiGrid,
    FiList,
    FiShoppingBag,
    FiX
} from 'react-icons/fi';

import ApiService from '../../../api/ApiService';
import ProductCard from '../../../components/public/product/ProductCard';
import ProductFilter from '../../../components/public/product/ProductFilter';
import ProductSort from '../../../components/public/product/ProductSort';
import ProductSkeleton from '../../../components/public/product/ProductSkeleton';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });

    // Filter states
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
        minPrice: '',
        maxPrice: '',
        rating: '',
        sortBy: 'newest',
    });

    // Load products
    useEffect(() => {
        loadProducts();
    }, [filters, pagination.page]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                category: filters.category || undefined,
                search: filters.search || undefined,
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice || undefined,
                rating: filters.rating || undefined,
                sortBy: filters.sortBy || 'newest',
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
            toast.error(error.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    // Handle filter change
    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, page: 1 });
        if (key === 'category' || key === 'search') {
            setSearchParams({ ...searchParams, [key]: value });
        }
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            category: '',
            search: '',
            minPrice: '',
            maxPrice: '',
            rating: '',
            sortBy: 'newest',
        });
        setSearchParams({});
        setPagination({ ...pagination, page: 1 });
    };

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        const form = e.target;
        const searchValue = form.search.value;
        handleFilterChange('search', searchValue);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* ============ PAGE HEADER ============ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500">
                        {pagination.total > 0 ? `${pagination.total} products found` : 'No products found'}
                    </p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <FiGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <FiList className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* ============ SEARCH BAR ============ */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            name="search"
                            type="text"
                            placeholder="Search products..."
                            defaultValue={filters.search}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors lg:hidden"
                    >
                        <FiFilter className="w-5 h-5" />
                    </button>
                </div>
            </form>

            {/* ============ MAIN CONTENT ============ */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* ===== SIDEBAR FILTERS ===== */}
                <div
                    className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'
                        }`}
                >
                    <ProductFilter
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={clearFilters}
                        onClose={() => setShowFilters(false)}
                        isMobile={showFilters}
                    />
                </div>

                {/* ===== PRODUCTS GRID ===== */}
                <div className="flex-1">
                    {/* Sort Bar */}
                    <div className="flex items-center justify-between mb-4">
                        <ProductSort
                            sortBy={filters.sortBy}
                            onSortChange={(value) => handleFilterChange('sortBy', value)}
                        />
                        <span className="text-sm text-gray-500 hidden sm:block">
                            Showing {products.length} of {pagination.total} products
                        </span>
                    </div>

                    {loading ? (
                        <ProductSkeleton count={8} viewMode={viewMode} />
                    ) : products.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                            <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900">No products found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your filters or search</p>
                            <button
                                onClick={clearFilters}
                                className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div
                                className={`grid gap-4 md:gap-6 ${viewMode === 'grid'
                                        ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3'
                                        : 'grid-cols-1'
                                    }`}
                            >
                                {products.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        viewMode={viewMode}
                                        onUpdate={loadProducts}
                                    />
                                ))}
                            </div>

                            {/* ===== PAGINATION ===== */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <button
                                        onClick={() =>
                                            setPagination({ ...pagination, page: pagination.page - 1 })
                                        }
                                        disabled={pagination.page === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setPagination({ ...pagination, page: pagination.page + 1 })
                                        }
                                        disabled={pagination.page === pagination.pages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;