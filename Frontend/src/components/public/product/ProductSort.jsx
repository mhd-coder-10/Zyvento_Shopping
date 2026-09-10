import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiArrowUp, FiArrowDown } from 'react-icons/fi';  // ✅ Change

const ProductSort = ({ sortBy, onSortChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'discount', label: 'Biggest Discount' },
    ];

    const currentOption = sortOptions.find((opt) => opt.value === sortBy) || sortOptions[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
                {/* ✅ Use FiArrowUp + FiArrowDown instead */}
                <div className="flex flex-col -space-y-1 text-gray-400">
                    <FiArrowUp className="w-3 h-3" />
                    <FiArrowDown className="w-3 h-3" />
                </div>
                <span className="text-sm text-gray-700">Sort: {currentOption.label}</span>
                <FiChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onSortChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === option.value
                                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {option.label}
                            {sortBy === option.value && (
                                <span className="ml-2 text-indigo-600">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductSort;