// PRODUCT FILTER COMPONENT
// Description: Filter sidebar for products page
// Features: Categories, price range, rating, brand filters
// APIs: getCategories

import React, { useState, useEffect } from 'react';
import {
    FiChevronDown,
    FiChevronUp,
    FiStar,
    FiX,
    FiSliders
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';

const ProductFilter = ({
    filters,
    onFilterChange,
    onClearFilters,
    onClose,
    isMobile = false,
}) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        rating: true,
    });

    // Load categories
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getCategories();
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section],
        });
    };

    const ratingOptions = [4, 3, 2, 1];

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${isMobile ? 'h-full' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FiSliders className="text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                        Clear All
                    </button>
                    {isMobile && (
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* ===== CATEGORIES ===== */}
            <div className="mb-6">
                <button
                    onClick={() => toggleSection('categories')}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h4 className="text-sm font-medium text-gray-700">Category</h4>
                    {expandedSections.categories ? (
                        <FiChevronUp className="text-gray-400" />
                    ) : (
                        <FiChevronDown className="text-gray-400" />
                    )}
                </button>

                {expandedSections.categories && (
                    <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                        <button
                            onClick={() => onFilterChange('category', '')}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${filters.category === '' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            All Categories
                        </button>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            categories.map((category) => (
                                <button
                                    key={category._id}
                                    onClick={() => onFilterChange('category', category._id)}
                                    className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${filters.category === category._id
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {category.name}
                                    {category.count !== undefined && (
                                        <span className="ml-2 text-xs text-gray-400">({category.count})</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* ===== PRICE RANGE ===== */}
            <div className="mb-6">
                <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h4 className="text-sm font-medium text-gray-700">Price Range</h4>
                    {expandedSections.price ? (
                        <FiChevronUp className="text-gray-400" />
                    ) : (
                        <FiChevronDown className="text-gray-400" />
                    )}
                </button>

                {expandedSections.price && (
                    <div className="mt-2 flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) => onFilterChange('minPrice', e.target.value)}
                            className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                            className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                )}
            </div>

            {/* ===== RATING ===== */}
            <div className="mb-6">
                <button
                    onClick={() => toggleSection('rating')}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h4 className="text-sm font-medium text-gray-700">Rating</h4>
                    {expandedSections.rating ? (
                        <FiChevronUp className="text-gray-400" />
                    ) : (
                        <FiChevronDown className="text-gray-400" />
                    )}
                </button>

                {expandedSections.rating && (
                    <div className="mt-2 space-y-1.5">
                        <button
                            onClick={() => onFilterChange('rating', '')}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${filters.rating === '' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            All Ratings
                        </button>
                        {ratingOptions.map((rating) => (
                            <button
                                key={rating}
                                onClick={() => onFilterChange('rating', rating.toString())}
                                className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${filters.rating === rating.toString()
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="flex items-center gap-1">
                                    {rating}+ <FiStar className="fill-yellow-400 text-yellow-400" /> & up
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ===== APPLY FILTERS (Mobile) ===== */}
            {isMobile && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductFilter;