// CATEGORY NAVIGATION COMPONENT
// Description: Displays category navigation on public pages
// Props: categories, activeCategory, onCategorySelect

import React from 'react';

const CategoryNav = ({ categories = [], activeCategory, onCategorySelect }) => {
    const defaultCategories = [
        { _id: 'all', categoryName: 'All Products' },
        ...categories,
    ];

    const handleSelect = (categoryId) => {
        if (onCategorySelect) {
            onCategorySelect(categoryId === activeCategory ? '' : categoryId);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2 py-4 border-b border-gray-200">
            {defaultCategories.map((category) => (
                <button
                    key={category._id}
                    onClick={() => handleSelect(category._id)}
                    className={`px-4 py-2 text-sm rounded-full transition-colors ${activeCategory === category._id || (activeCategory === '' && category._id === 'all')
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {category.categoryName}
                </button>
            ))}
        </div>
    );
};

export default CategoryNav;