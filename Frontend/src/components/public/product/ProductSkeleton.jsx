
// PRODUCT SKELETON COMPONENT
// Description: Loading skeleton for product cards


import React from 'react';

const ProductSkeleton = ({ count = 8, viewMode = 'grid' }) => {
    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="bg-gray-200 aspect-square rounded-xl"></div>
                        <div className="mt-3 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-10 bg-gray-200 rounded w-full mt-3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {Array.from({ length: Math.ceil(count / 2) }).map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-48 h-48 bg-gray-200 rounded-xl flex-shrink-0"></div>
                        <div className="flex-1 space-y-3">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="flex flex-wrap items-end justify-between mt-4 gap-3">
                                <div className="h-8 bg-gray-200 rounded w-24"></div>
                                <div className="flex gap-2">
                                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductSkeleton;