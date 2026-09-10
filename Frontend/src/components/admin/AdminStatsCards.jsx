
import React from 'react';
import {
    FiUsers,
    FiShoppingBag,
    FiDollarSign,
    FiPackage,
    FiTrendingUp,
    FiTrendingDown,
} from 'react-icons/fi';

const AdminStatsCards = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl border border-sky-100 p-5 animate-pulse shadow-sm"
                    >
                        <div className="h-4 bg-sky-100 rounded-full w-1/2 mb-3" />
                        <div className="h-8 bg-sky-100/80 rounded-lg w-3/4 mb-2" />
                        <div className="h-3 bg-sky-50 rounded-full w-1/3" />
                    </div>
                ))}
            </div>
        );
    }

    const defaultStats = [
        {
            label: 'Total Users',
            value: stats?.totalUsers || 0,
            change: stats?.userChange || 12.5,
            icon: FiUsers,
            gradient: 'from-sky-400 to-blue-600',
            bg: 'bg-sky-50',
            textColor: 'text-sky-600',
        },
        {
            label: 'Total Orders',
            value: stats?.totalOrders || 0,
            change: stats?.orderChange || 8.2,
            icon: FiShoppingBag,
            gradient: 'from-blue-500 to-blue-700',
            bg: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            label: 'Total Revenue',
            value: stats?.totalRevenue || 0,
            change: stats?.revenueChange || 11.0,
            icon: FiDollarSign,
            gradient: 'from-cyan-400 to-sky-600',
            bg: 'bg-cyan-50',
            textColor: 'text-cyan-600',
        },
        {
            label: 'Total Products',
            value: stats?.totalProducts || 0,
            change: stats?.productChange || 5.4,
            icon: FiPackage,
            gradient: 'from-sky-500 to-indigo-600',
            bg: 'bg-indigo-50',
            textColor: 'text-indigo-600',
        },
    ];

    const formatCurrency = (value) => {
        if (!value) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
            {defaultStats.map((stat, index) => {
                const Icon = stat.icon;
                const isPositive = stat.change >= 0;
                const changeColor = isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
                const ChangeIcon = isPositive ? FiTrendingUp : FiTrendingDown;

                return (
                    <div
                        key={index}
                        className="group relative overflow-hidden bg-white rounded-2xl border border-sky-100 p-5 shadow-sm hover:shadow-xl hover:shadow-sky-100 hover:-translate-y-1 transition-all duration-300"
                    >
                        <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                        <span className="pointer-events-none absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-sky-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    {stat.label}
                                </p>
                                <p className="text-2xl sm:text-[1.7rem] font-extrabold text-slate-800 mt-1.5 tracking-tight truncate">
                                    {stat.label === 'Total Revenue'
                                        ? formatCurrency(stat.value)
                                        : stat.value?.toLocaleString() || 0}
                                </p>
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${changeColor}`}>
                                        <ChangeIcon className="w-3 h-3" />
                                        {isPositive ? '+' : ''}{stat.change}%
                                    </span>
                                    <span className="text-[11px] text-slate-400">vs last month</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-2xl ${stat.bg} ring-1 ring-white group-hover:scale-110 transition-transform duration-300 shadow-sm flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${stat.textColor}`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AdminStatsCards;
