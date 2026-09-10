
import React from 'react';
import { FiPackage, FiTrendingUp, FiDollarSign, FiAward } from 'react-icons/fi';

const AdminTopSellingProducts = ({ products, loading }) => {
    if (loading) {
        return (
            <div className="animate-pulse rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
                <div className="mb-4 h-6 w-1/3 rounded-lg bg-sky-100" />
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-sky-100" />
                            <div className="flex-1">
                                <div className="h-4 w-3/4 rounded bg-sky-100" />
                                <div className="mt-1.5 h-3 w-1/2 rounded bg-slate-100" />
                            </div>
                            <div className="h-4 w-1/4 rounded bg-sky-100" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const defaultProducts = [
        { id: 1, name: 'Air Jordan 8', quantity: 752, revenue: 75200 },
        { id: 2, name: 'Air Jordan 5', quantity: 680, revenue: 68000 },
        { id: 3, name: 'Air Jordan 13', quantity: 540, revenue: 54000 },
        { id: 4, name: 'Nike Dunk Low', quantity: 420, revenue: 42000 },
    ];

    const items = products || defaultProducts;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const rankColors = [
        'from-sky-400 to-blue-600',
        'from-blue-400 to-indigo-500',
        'from-cyan-400 to-sky-500',
    ];

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-sky-100">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 to-blue-600" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-1 rounded-full bg-gradient-to-b from-sky-400 to-blue-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                        Top Selling Products
                    </h3>
                </div>
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200">
                    Last 30 days
                </span>
            </div>

            <div className="space-y-2.5">
                {items.map((product, index) => {
                    const isTop = index < 3;
                    return (
                        <div
                            key={product.id || index}
                            className={`flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 ${
                                isTop
                                    ? 'border border-sky-100 bg-gradient-to-r from-sky-50/80 to-blue-50/50 hover:shadow-sm hover:shadow-sky-100'
                                    : 'border border-transparent hover:border-sky-100 hover:bg-sky-50/50'
                            }`}
                        >
                            <div
                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                                    rankColors[index] || 'from-slate-300 to-slate-400'
                                } text-xs font-bold text-white shadow-sm ring-2 ring-white`}
                            >
                                {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                    {product.name}
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <FiPackage className="h-3 w-3 text-sky-500" />
                                        {product.quantity} Pcs
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiDollarSign className="h-3 w-3 text-blue-500" />
                                        {formatCurrency(product.revenue)}
                                    </span>
                                </div>
                            </div>
                            {isTop && (
                                <div className="flex-shrink-0 rounded-lg bg-white/70 p-1.5 ring-1 ring-sky-100">
                                    <FiAward className="h-4 w-4 text-blue-500" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 border-t border-sky-100 pt-3 text-center">
                <button className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:bg-sky-50 hover:text-blue-800">
                    View all products
                    <FiTrendingUp className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
};

export default AdminTopSellingProducts;
