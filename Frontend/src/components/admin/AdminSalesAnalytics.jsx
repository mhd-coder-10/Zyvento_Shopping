
import React from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const AdminSalesAnalytics = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-sky-100 p-5 animate-pulse shadow-sm">
                        <div className="h-4 bg-sky-100 rounded-full w-1/3 mb-3" />
                        <div className="h-8 bg-sky-100/80 rounded-lg w-3/4 mb-2" />
                        <div className="h-3 bg-sky-50 rounded-full w-1/4" />
                    </div>
                ))}
            </div>
        );
    }

    const defaultData = {
        income: 23262,
        expenses: 11135,
        balance: 48135,
        incomeTrend: 0.05,
        expensesTrend: 0.05,
        balanceTrend: 0.05,
    };

    const stats = data || defaultData;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(value);
    };

    const items = [
        {
            label: 'Income',
            value: stats.income,
            trend: stats.incomeTrend,
            icon: FiTrendingUp,
            gradient: 'from-sky-400 to-blue-600',
            bg: 'bg-sky-50',
            color: 'text-sky-600',
            border: 'border-l-4 border-sky-400',
        },
        {
            label: 'Expenses',
            value: stats.expenses,
            trend: stats.expensesTrend,
            icon: FiTrendingDown,
            gradient: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50',
            color: 'text-blue-600',
            border: 'border-l-4 border-blue-500',
        },
        {
            label: 'Balance',
            value: stats.balance,
            trend: stats.balanceTrend,
            icon: FiTrendingUp,
            gradient: 'from-cyan-400 to-sky-600',
            bg: 'bg-cyan-50',
            color: 'text-cyan-600',
            border: 'border-l-4 border-cyan-400',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={`group relative overflow-hidden bg-white rounded-2xl border border-sky-100 p-5 shadow-sm hover:shadow-xl hover:shadow-sky-100 transition-all duration-300 hover:-translate-y-1 ${item.border}`}
                >
                    <span className="pointer-events-none absolute -right-8 -top-8 w-24 h-24 rounded-full bg-sky-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                            <p className="text-2xl font-extrabold text-slate-800 mt-1.5 tracking-tight truncate">
                                {formatCurrency(item.value)}
                            </p>
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${item.trend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                    <item.icon className="w-3 h-3" />
                                    {item.trend >= 0 ? '+' : ''}{item.trend}%
                                </span>
                                <span className="text-[11px] text-slate-400">vs last month</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-2xl ${item.bg} ring-1 ring-white group-hover:scale-110 transition-transform duration-300 shadow-sm flex-shrink-0`}>
                            <FiDollarSign className={`w-5 h-5 ${item.color}`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminSalesAnalytics;
