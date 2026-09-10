
import React, { useState, useEffect, useMemo } from 'react';
import {
    FiPackage, FiCheckCircle, FiXCircle, FiAlertTriangle, FiRefreshCw,
    FiSearch, FiMoreHorizontal
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import MonthlyProductsChart from '../../../components/admin/MonthlyProductsChart';

const ProductReport = ({ dateRange }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        if (!data) setLoading(true);
        try {
            const res = await ApiService.getReportData('products', dateRange);
            if (res.data.success) setData(res.data.data);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [dateRange]);

    const formatCurrency = (value) => {
        if (!value) return '₹0';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    };

    const filteredProducts = useMemo(() => {
        return (data?.recentProducts || []).filter(product => {
            const term = searchTerm.toLowerCase();
            return product.product_name?.toLowerCase().includes(term) ||
                product.product_code?.toLowerCase().includes(term) ||
                product.category_name?.toLowerCase().includes(term);
        });
    }, [data, searchTerm]);

    if (loading) {
        return <div className="flex items-center justify-center w-full h-64 bg-white rounded-2xl border border-blue-100 shadow-sm"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-100">Total Products</p>
                            <p className="text-3xl font-bold mt-1">{data?.totalProducts || 0}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl"><FiPackage className="w-6 h-6" /></div>
                    </div>
                    <p className="text-xs text-purple-200 mt-4">All products in catalog</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Products</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{data?.activeProducts || 0}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl"><FiCheckCircle className="w-6 h-6 text-green-600" /></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Currently live</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Out of Stock</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{data?.outOfStock || 0}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl"><FiXCircle className="w-6 h-6 text-red-600" /></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Need restocking</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Low Stock</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">{data?.lowStock || 0}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl"><FiAlertTriangle className="w-6 h-6 text-orange-600" /></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Below threshold</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MonthlyProductsChart title="Product Performance" />
                </div>

                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Top Selling</h3>
                    </div>
                    <div className="space-y-4">
                        {data?.topSellingProducts?.length > 0 ? (
                            data.topSellingProducts.map((product, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                            <FiPackage className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 truncate w-32">{product.product_name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">{product.totalSold || 0} units sold</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{formatCurrency(product.totalRevenue)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">No selling data available</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Products by Category</h3>
                <div className="space-y-4">
                    {data?.categories?.length > 0 ? (
                        data.categories.map((cat, idx) => {
                            const total = data.totalProducts || 1;
                            const percent = (cat.count / total) * 100;
                            return (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="!text-gray-700 font-medium">{cat.name}</span>
                                        <span className="font-semibold !text-gray-900">{cat.count} products</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-500">No category data available</div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Recent Products</h3>
                    <div className="relative w-full sm:w-auto">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none w-full"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Product Info</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Code</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Category</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Price</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Stock</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-purple-50/30 text-center">
                                        <td className="px-4 py-3 text-start text-sm font-medium text-gray-900">{product.product_name || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm font-mono text-purple-600">{product.product_code || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{product.category_name || 'Uncategorized'}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(product.price)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{product.stock_quantity || 0}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.status === 'active' ? 'bg-green-50 text-green-700' : product.status === 'pending' ? 'bg-amber-50 text-amber-700' : product.status === 'out_of_stock' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {product.status || 'N/A'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No products found matching your search</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductReport;