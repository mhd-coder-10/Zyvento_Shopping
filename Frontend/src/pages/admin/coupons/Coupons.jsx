
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiTag, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const Coupons = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, disabled: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, code: null });

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search,
                ...(statusFilter !== 'all' && { status: statusFilter })
            };
            const res = await ApiService.getAllCoupons(params);
            if (res.data.success) {
                setCoupons(res.data.data || []);
                setStats(res.data.stats || {});
                setPagination(res.data.pagination || {});
            }
        } catch (error) {
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, statusFilter]);

    useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

    // Handle row click (Desktop & Mobile)
    const handleRowClick = (code) => {
        navigate(`/admin/coupons/${code}`);
    };

    // Handle action buttons (stop propagation to avoid double navigation)
    const handleActionClick = (e, action, code) => {
        e.stopPropagation();
        if (action === 'view') navigate(`/admin/coupons/${code}`);
        else if (action === 'edit') navigate(`/admin/coupons/edit/${code}`);
        else if (action === 'delete') setDeleteConfirm({ open: true, code });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.code) return;
        try {
            await ApiService.deleteCoupon(deleteConfirm.code);
            toast.success('Coupon deleted successfully');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to delete coupon');
        } finally {
            setDeleteConfirm({ open: false, code: null });
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            active: 'bg-emerald-50 text-emerald-700',
            pending: 'bg-amber-50 text-amber-700',
            expired: 'bg-red-50 text-red-700',
            disabled: 'bg-gray-100 text-gray-600'
        };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const isExpired = (date) => new Date(date) < new Date();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Coupon Management"
                subtitle="Manage discount coupons and offers"
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/admin/coupons/create')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 !text-white rounded-lg">
                            <FiPlus /> Create Coupon
                        </button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                        <p className="text-2xl font-bold !text-black">{stats.total}</p>
                        <p className="text-xs !text-gray-600">Total Coupons</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                        <p className="text-2xl font-bold !text-emerald-600">{stats.active}</p>
                        <p className="text-xs !text-gray-600">Active</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                        <p className="text-2xl font-bold !text-red-600">{stats.expired}</p>
                        <p className="text-xs !text-gray-600">Expired</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-2xl font-bold !text-gray-600">{stats.disabled}</p>
                        <p className="text-xs !text-gray-600">Disabled</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
                        <input type="text" placeholder="Search by code or description..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl !text-black" onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border rounded-xl !text-black bg-white">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="expired">Expired</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>

                {/* Desktop Table - Perfect Alignment + Row Click */}
                <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    {loading ? <div className="p-10 text-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8 inline-block" /></div> : (
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Discount</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Expiry</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {coupons.map(coupon => (
                                    <tr
                                        key={coupon._id}
                                        onClick={() => handleRowClick(coupon.code)}
                                        className="hover:bg-blue-50/30 cursor-pointer"
                                    >
                                        <td className="px-4 py-3 text-left">
                                            <p className="font-mono font-bold !text-blue-600">{coupon.code}</p>
                                            <p className="text-xs !text-gray-600 mt-1">{coupon.description || 'No description'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-left">
                                            <p className="font-bold !text-black">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</p>
                                            <p className="text-xs !text-gray-500">Min Order: ₹{coupon.minOrderAmount || 0}</p>
                                        </td>
                                        <td className="px-4 py-3 text-left">
                                            <span className={isExpired(coupon.expiryDate) ? 'text-red-600 font-medium' : '!text-gray-700'}>
                                                {formatDate(coupon.expiryDate)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-left">{getStatusBadge(isExpired(coupon.expiryDate) ? 'expired' : coupon.status)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* View */}
                                                <button onClick={(e) => handleActionClick(e, 'view', coupon.code)} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>
                                                {/* Edit */}
                                                <button onClick={(e) => handleActionClick(e, 'edit', coupon.code)} className="p-2 bg-yellow-50 !text-yellow-600 rounded-lg"><FiEdit2 /></button>
                                                {/* Delete */}
                                                <button onClick={(e) => handleActionClick(e, 'delete', coupon.code)} className="p-2 bg-red-50 !text-red-600 rounded-lg"><FiTrash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile Cards - Row Click */}
                <div className="md:hidden space-y-4">
                    {loading ? <div className="p-10 text-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8 inline-block" /></div> : (
                        coupons.map(coupon => (
                            <div
                                key={coupon._id}
                                onClick={() => handleRowClick(coupon.code)}
                                className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 cursor-pointer"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-mono font-bold !text-blue-600">{coupon.code}</p>
                                        <p className="text-xs !text-gray-600 mt-1">{coupon.description || 'No description'}</p>
                                    </div>
                                    {getStatusBadge(isExpired(coupon.expiryDate) ? 'expired' : coupon.status)}
                                </div>
                                <div className="mt-3 flex justify-between text-sm">
                                    <span className="!text-gray-700">Discount: {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</span>
                                    <span className="!text-gray-500">Expiry: {formatDate(coupon.expiryDate)}</span>
                                </div>
                                <div className="mt-3 flex justify-end gap-2">
                                    {/* View */}
                                    <button onClick={(e) => handleActionClick(e, 'view', coupon.code)} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>
                                    {/* Edit */}
                                    <button onClick={(e) => handleActionClick(e, 'edit', coupon.code)} className="p-2 bg-yellow-50 !text-yellow-600 rounded-lg"><FiEdit2 /></button>
                                    {/* Delete */}
                                    <button onClick={(e) => handleActionClick(e, 'delete', coupon.code)} className="p-2 bg-red-50 !text-red-600 rounded-lg"><FiTrash2 /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center">
                        <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} className="px-4 py-2 border rounded-lg !text-black disabled:opacity-50">Previous</button>
                        <span className="text-sm !text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
                        <button disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} className="px-4 py-2 border rounded-lg !text-black disabled:opacity-50">Next</button>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, code: null })}
                onConfirm={handleDelete}
                title="Delete Coupon"
                message="Are you sure you want to delete this coupon?"
                confirmColor="bg-gradient-to-r from-red-500 to-rose-600"
            />
        </div>
    );
};

export default Coupons;