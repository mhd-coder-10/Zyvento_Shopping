
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiEye, FiEdit2, FiTrash2, FiRefreshCw, FiPlus, FiDownload,
    FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle, FiXCircle,
    FiClock, FiPackage, FiAlertCircle, FiStar, FiShoppingBag, FiUserX,
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, productCode: null });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, rejected: 0, suspended: 0, inactive: 0 });

    const fetchProducts = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
            };
            const response = await ApiService.getAllProducts(params);
            if (response.data.success) {
                const prodData = response.data.data?.products || response.data.data || [];
                setProducts(Array.isArray(prodData) ? prodData : []);
                setPagination({
                    ...pagination,
                    total: response.data.total || 0,
                    totalPages: response.data.totalPages || 1
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load products');
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, statusFilter, categoryFilter]);

    useEffect(() => {
        fetchProducts();
        fetchStats();
        fetchCategories();
    }, [fetchProducts]);

    const fetchStats = async () => {
        try {
            const response = await ApiService.getProductStats();
            if (response.data.success) {
                const data = response.data.data || {};
                setStats({
                    total: data.total || 0,
                    active: data.active || 0,
                    pending: data.pending || 0,
                    rejected: data.rejected || 0,
                    suspended: data.suspended || 0,
                    inactive: data.inactive || 0,
                });
            }
        } catch (error) { console.error('Failed to fetch stats:', error); }
    };

    const fetchCategories = async () => {
        try {
            const response = await ApiService.getProductCategories();
            if (response.data.success) setCategories(response.data.data || []);
        } catch (error) { console.error('Failed to fetch categories:', error); }
    };

    const handleSearch = (e) => { setSearchQuery(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); };
    const handleStatusFilter = (e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); };
    const handleCategoryFilter = (e) => { setCategoryFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); };

    const handleDelete = (productCode) => setDeleteConfirm({ open: true, productCode });

    const confirmDelete = async () => {
        if (!deleteConfirm.productCode) return;
        setProducts(prev => prev.filter(p => p.product_code !== deleteConfirm.productCode));
        try {
            await ApiService.deleteProduct(deleteConfirm.productCode);
            toast.success('Product deleted successfully');
            fetchStats();
        } catch (error) {
            fetchProducts();
            toast.error(error.response?.data?.message || 'Failed to delete product');
        } finally {
            setDeleteConfirm({ open: false, productCode: null });
        }
    };

    const handleExport = async () => {
        try {
            const response = await ApiService.exportProducts({ search: searchQuery });
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Products exported successfully');
        } catch (error) { toast.error('Failed to export products'); }
    };

    // const getStatusBadge = (status, approvalStatus) => {
    //     if (approvalStatus === 'pending') {
    //         return (
    //             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-300">
    //                 <FiClock className="w-3 h-3" /> Pending
    //             </span>
    //         );
    //     }
    //     if (approvalStatus === 'rejected') {
    //         return (
    //             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-rose-50 text-rose-800 border-rose-300">
    //                 <FiXCircle className="w-3 h-3" /> Rejected
    //             </span>
    //         );
    //     }
    //     if (status === 'suspended') {
    //         return (
    //             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-orange-50 text-orange-800 border-orange-300">
    //                 <FiAlertCircle className="w-3 h-3" /> Suspended
    //             </span>
    //         );
    //     }
    //     if (status === 'inactive') {
    //         return (
    //             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-gray-50 text-gray-700 border-gray-300">
    //                 <FiUserX className="w-3 h-3" /> Inactive
    //             </span>
    //         );
    //     }
    //     return (
    //         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-300">
    //             <FiCheckCircle className="w-3 h-3" /> Active
    //         </span>
    //     );
    // };

    const getStatusBadge = (status, approvalStatus) => {
        if (approvalStatus === 'pending' || status === 'pending') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-300">
                    <FiClock className="w-3 h-3" /> Pending
                </span>
            );
        }
        if (approvalStatus === 'rejected' || status === 'rejected') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-rose-50 text-rose-800 border-rose-300">
                    <FiXCircle className="w-3 h-3" /> Rejected
                </span>
            );
        }
        if (status === 'suspended') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-orange-50 text-orange-800 border-orange-300">
                    <FiAlertCircle className="w-3 h-3" /> Suspended
                </span>
            );
        }
        if (status === 'inactive') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-gray-50 text-gray-700 border-gray-300">
                    <FiUserX className="w-3 h-3" /> Inactive
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-300">
                <FiCheckCircle className="w-3 h-3" /> Active
            </span>
        );
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin text-blue-600 w-8 h-8" /></div>;

    const statCards = [
        { label: 'Total Products', value: stats.total, icon: <FiPackage className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
        { label: 'Active', value: stats.active, icon: <FiCheckCircle className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Pending', value: stats.pending, icon: <FiClock className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
        { label: 'Rejected', value: stats.rejected, icon: <FiXCircle className="w-5 h-5" />, color: 'bg-rose-50 text-rose-600' },
        { label: 'Suspended', value: stats.suspended, icon: <FiAlertCircle className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
        { label: 'Inactive', value: stats.inactive, icon: <FiUserX className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Product Management"
                subtitle="Manage all products across sellers"
                actions={
                    <div className="flex items-center gap-2">
                        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                            <FiDownload className="w-4 h-4" /> Export
                        </button>
                        <button onClick={() => navigate('/admin/products/create')} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                            <FiPlus className="w-5 h-5" /> Add Product
                        </button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {statCards.map((card, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                            <div className={`p-2.5 rounded-xl ${card.color}`}>{card.icon}</div>
                            <p className="text-xl font-bold text-gray-900 mt-2">{card.value || 0}</p>
                            <p className="text-xs text-gray-500">{card.label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Search products by name, SKU, or code..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                        </div>
                        <select value={categoryFilter} onChange={handleCategoryFilter} className="px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.category_name}</option>
                            ))}
                        </select>
                        <select value={statusFilter} onChange={handleStatusFilter} className="px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                            <option value="suspended">Suspended</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    <div className="relative">
                        {isRefreshing && <div className="absolute top-0 left-0 right-0 bg-blue-50/50 z-10 flex justify-center py-2"><FiRefreshCw className="animate-spin text-blue-600 w-5 h-5" /></div>}

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Product Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Stock</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Seller</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/products/${product.product_code}`)}>
                                            <td className="px-4 py-3">
                                                <span className="text-xs bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg font-semibold">{product.product_code || 'N/A'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt={product.product_name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                            {(product.product_name?.[0] || 'P').toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{product.product_name}</p>
                                                        <p className="text-xs text-gray-500">{product.brand || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{product.category_id?.category_name || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">₹{product.price || 0}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{product.stock_quantity || 0}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{product.seller_id?.business_name || 'N/A'}</td>
                                            <td className="px-4 py-3">{getStatusBadge(product.status, product.approval_status)}</td>
                                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => navigate(`/admin/products/${product.product_code}`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><FiEye className="w-4 h-4" /></button>
                                                    <button onClick={() => navigate(`/admin/products/${product.product_code}/edit`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(product.product_code)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden space-y-4 p-4">
                            {products.map((product) => (
                                <div key={product._id} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-start gap-3">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.product_name} className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {(product.product_name?.[0] || 'P').toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 text-sm">{product.product_name}</p>
                                            <p className="text-xs text-gray-500">{product.brand || 'N/A'}</p>
                                            <p className="text-xs text-blue-600 font-semibold mt-1">{product.product_code || 'N/A'}</p>
                                        </div>
                                        {getStatusBadge(product.status, product.approval_status)}
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                        <div><p className="text-gray-500">Category</p><p className="font-semibold text-gray-900">{product.category_id?.category_name || 'N/A'}</p></div>
                                        <div><p className="text-gray-500">Price</p><p className="font-semibold text-gray-900">₹{product.price || 0}</p></div>
                                        <div><p className="text-gray-500">Stock</p><p className="font-semibold text-gray-900">{product.stock_quantity || 0}</p></div>
                                        <div><p className="text-gray-500">Seller</p><p className="font-semibold text-gray-900">{product.seller_id?.business_name || 'N/A'}</p></div>
                                    </div>
                                    <div className="mt-3 flex justify-end gap-2">
                                        <button onClick={() => navigate(`/admin/products/${product.product_code}`)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><FiEye className="w-4 h-4" /></button>
                                        <button onClick={() => navigate(`/admin/products/${product.product_code}/edit`)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(product.product_code)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && !isRefreshing && <div className="text-center py-10 text-gray-500">No products found</div>}

                        {pagination.totalPages > 1 && (
                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-sm text-gray-600">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products</p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"><FiChevronLeft className="w-4 h-4" /></button>
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"><FiChevronRight className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, productCode: null })} onConfirm={confirmDelete} title="Delete Product" message="Are you sure you want to delete this product? This action cannot be undone." confirmText="Delete" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
        </div>
    );
};

export default Products;