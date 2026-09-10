
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiEye, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiClock,
    FiUserCheck, FiUserX, FiMail, FiPhone, FiCalendar, FiSearch,
    FiAlertCircle, FiChevronLeft, FiChevronRight, FiRefreshCw, FiDownload,
} from 'react-icons/fi';

import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const Sellers = () => {
    const navigate = useNavigate();
    const [sellers, setSellers] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, sellerId: null });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [stats, setStats] = useState({ totalSellers: 0, pendingSellers: 0, activeSellers: 0, suspendedSellers: 0 });

    const isFirstLoad = useRef(true);

    const fetchSellers = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            };
            const response = await ApiService.getAllSellers(params);
            if (response.data.success) {
                setSellers(response.data.data || []);
                setPagination({ ...pagination, total: response.data.total || 0, totalPages: response.data.totalPages || 1 });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load sellers');
        } finally {
            setIsRefreshing(false);
            isFirstLoad.current = false;
        }
    }, [pagination.page, pagination.limit, searchQuery, statusFilter]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await ApiService.getSellerStats();
            if (response.data.success) setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch seller stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchSellers();
        fetchStats();
    }, [fetchSellers, fetchStats]);

    useEffect(() => {
        const timer = setTimeout(() => setPagination(prev => ({ ...prev, page: 1 })), 300);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter]);

    const confirmDelete = async () => {
        if (!deleteConfirm.sellerId) return;
        setSellers(prev => prev.filter(s => s._id !== deleteConfirm.sellerId));
        try {
            await ApiService.deleteUserByAdmin(deleteConfirm.sellerId);
            toast.success('Seller deleted successfully');
            fetchStats();
            fetchSellers();
        } catch (error) {
            fetchSellers();
            toast.error(error.response?.data?.message || 'Failed to delete seller');
        } finally {
            setDeleteConfirm({ open: false, sellerId: null });
        }
    };

    const handleExport = async () => {
        try {
            const response = await ApiService.exportSellers({ search: searchQuery });
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sellers_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Sellers exported successfully');
        } catch (error) {
            toast.error('Failed to export sellers');
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { color: 'bg-amber-50 text-amber-800 border border-amber-300', icon: FiClock, label: 'Pending' },
            approved: { color: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: FiCheckCircle, label: 'Approved' },
            rejected: { color: 'bg-rose-50 text-rose-800 border border-rose-300', icon: FiXCircle, label: 'Rejected' },
            suspended: { color: 'bg-orange-50 text-orange-800 border border-orange-300', icon: FiAlertCircle, label: 'Suspended' },
            active: { color: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: FiCheckCircle, label: 'Active' },
            inactive: { color: 'bg-gray-50 text-gray-700 border border-gray-300', icon: FiUserX, label: 'Inactive' },
        };
        const { color, icon: Icon, label } = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${color}`}>
                <Icon className="w-3 h-3" /> {label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Seller Management"
                subtitle="Manage all registered sellers on the platform"
                actions={
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                        <FiDownload className="w-4 h-4" /> Export
                    </button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                        <p className="text-sm text-gray-600 font-medium">Total Sellers</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalSellers || 0}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                        <p className="text-sm text-gray-600 font-medium">Active Sellers</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeSellers || 0}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                        <p className="text-sm text-gray-600 font-medium">Pending</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingSellers || 0}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                        <p className="text-sm text-gray-600 font-medium">Suspended</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.suspendedSellers || 0}</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search sellers by name, email, or business..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                        </div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    <div className="relative">
                        {isRefreshing && (
                            <div className="absolute top-0 left-0 right-0 bg-blue-50/50 z-10 flex justify-center py-2">
                                <FiRefreshCw className="animate-spin text-blue-600 w-5 h-5" />
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Seller</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Contact</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Business</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Joined</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {sellers.map((seller) => (
                                        <tr key={seller._id} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/sellers/${seller._id}`)}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">{(seller.business_name?.[0] || 'S').toUpperCase()}</div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{seller.business_name || 'N/A'}</p>
                                                        <p className="text-xs text-gray-500">{seller.full_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-700"><FiMail className="w-3 h-3 text-gray-400" />{seller.email}</div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-700"><FiPhone className="w-3 h-3 text-gray-400" />{seller.mobile_number || seller.phone || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg capitalize">{seller.business_type || 'Individual'}</span>
                                            </td>
                                            <td className="px-4 py-3">{getStatusBadge(seller.account_status)}</td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1.5 text-xs text-gray-700">
                                                    <FiCalendar className="w-3 h-3 text-gray-400" />
                                                    {seller.created_at ? new Date(seller.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => navigate(`/admin/sellers/${seller._id}`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><FiEye className="w-4 h-4" /></button>
                                                    <button onClick={() => navigate(`/admin/sellers/${seller._id}/edit`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(seller._id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {sellers.length === 0 && !isRefreshing && (
                            <div className="text-center py-10 text-gray-500">No sellers found</div>
                        )}
                        {pagination.totalPages > 1 && (
                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> sellers
                                </p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><FiChevronLeft className="w-4 h-4" /></button>
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><FiChevronRight className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, sellerId: null })} onConfirm={confirmDelete} title="Delete Seller" message="Are you sure? This action cannot be undone." confirmText="Delete" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
        </div>
    );
};

export default Sellers;