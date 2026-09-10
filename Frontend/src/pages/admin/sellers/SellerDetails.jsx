

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase,
    FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiEdit2, FiTrash2,
    FiUserCheck, FiUserX, FiPackage, FiShoppingBag, FiDollarSign,
    FiStar, FiRefreshCw, FiTrendingUp, FiFileText, FiEye, FiDownload,
} from 'react-icons/fi';

import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const SellerDetails = () => {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, rating: 0 });
    const [transactions, setTransactions] = useState([]);
    const [performance, setPerformance] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false });

    useEffect(() => {
        fetchSellerDetails();
    }, [sellerId]);

    const fetchSellerDetails = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getSellerById(sellerId);
            if (response.data.success) {
                const data = response.data.data;
                setSeller(data);
                setStats({
                    products: data.productCount || 0,
                    orders: data.orderCount || 0,
                    revenue: data.revenue || 0,
                    rating: data.rating || 0,
                });
                if (data.account_status === 'active') {
                    fetchSellerTransactions();
                    fetchSellerPerformance();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load seller details');
            navigate('/admin/sellers');
        } finally {
            setLoading(false);
        }
    };

    const fetchSellerTransactions = async () => {
        try {
            const response = await ApiService.getSellerTransactions(sellerId, { page: 1, limit: 10 });
            if (response.data.success) setTransactions(response.data.data || []);
        } catch (error) { console.error('Failed to fetch transactions:', error); }
    };

    const fetchSellerPerformance = async () => {
        try {
            const response = await ApiService.getSellerPerformance(sellerId, { period: 'monthly' });
            if (response.data.success) setPerformance(response.data.data);
        } catch (error) { console.error('Failed to fetch performance:', error); }
    };

    const handleDelete = async () => {
        try {
            await ApiService.deleteUserByAdmin(sellerId);
            toast.success('Seller deleted successfully');
            navigate('/admin/sellers');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete seller');
        } finally {
            setDeleteConfirm({ open: false });
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { color: 'bg-amber-50 text-amber-800 border border-amber-300', icon: FiClock, label: 'Pending' },
            approved: { color: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: FiCheckCircle, label: 'Approved' },
            rejected: { color: 'bg-rose-50 text-rose-800 border border-rose-300', icon: FiXCircle, label: 'Rejected' },
            suspended: { color: 'bg-orange-50 text-orange-800 border border-orange-300', icon: FiXCircle, label: 'Suspended' },
            active: { color: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: FiCheckCircle, label: 'Active' },
            inactive: { color: 'bg-gray-50 text-gray-700 border border-gray-300', icon: FiXCircle, label: 'Inactive' },
        };
        const { color, icon: Icon, label } = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${color} !opacity-100 !filter-none`}>
                <Icon className="w-3 h-3" /> {label}
            </span>
        );
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin text-blue-600 w-8 h-8" /></div>;
    if (!seller) return <div className="text-center py-12 !text-gray-600">Seller not found</div>;

    const isActive = seller.account_status === 'active';
    const isDocumentVerified = seller.verification_status === 'verified' || seller.verification_status === 'approved';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Seller Details"
                subtitle={seller.business_name || 'Seller'}
                actions={
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/sellers/${sellerId}/edit`)} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                            <FiEdit2 className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => navigate('/admin/sellers')} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                            <FiArrowLeft className="w-4 h-4" /> Back to Sellers
                        </button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Profile Header */}
                <div className="bg-white !bg-white !opacity-100 !filter-none !mix-blend-normal rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                {(seller.business_name?.[0] || 'S').toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold !text-black !opacity-100 !filter-none">{seller.business_name || 'N/A'}</h2>
                                    {getStatusBadge(seller.account_status)}
                                </div>
                                <p className="text-gray-600 mt-1 !text-gray-800 !opacity-100 !filter-none">
                                    {seller.business_type || 'Individual'} Seller • Joined {seller.created_at ? new Date(seller.created_at).toLocaleDateString('en-IN') : 'N/A'}
                                </p>
                                {isDocumentVerified && (
                                    <div className="mt-2 flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl !text-emerald-800 !opacity-100 text-sm">
                                        <FiCheckCircle className="w-4 h-4" /> Documents Verified
                                    </div>
                                )}
                                {seller.updated_by && (
                                    <div className="mt-2 text-xs !text-gray-600 !opacity-100">
                                        Last status updated by: <span className="font-semibold !text-black !opacity-100">{seller.updated_by}</span> on {seller.updated_at ? new Date(seller.updated_at).toLocaleString('en-IN') : 'N/A'}
                                    </div>
                                )}
                                {isActive && (
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1.5 text-sm !text-gray-800 !opacity-100 !filter-none"><FiStar className="w-4 h-4 text-yellow-500" />{stats.rating.toFixed(1)} Rating</span>
                                        <span className="flex items-center gap-1.5 text-sm !text-gray-800 !opacity-100 !filter-none"><FiPackage className="w-4 h-4 text-blue-500" />{stats.products} Products</span>
                                        <span className="flex items-center gap-1.5 text-sm !text-gray-800 !opacity-100 !filter-none"><FiShoppingBag className="w-4 h-4 text-purple-500" />{stats.orders} Orders</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={() => setDeleteConfirm({ open: true })} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                            <FiTrash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>

                {/* Documents Section (Active hone par bhi dikhega) */}
                {isDocumentVerified && (
                    <div className="bg-white !bg-white !opacity-100 !filter-none !mix-blend-normal rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black !opacity-100 mb-4 flex items-center gap-2"><FiFileText className="w-5 h-5 text-blue-600" /> Uploaded Documents</h3>
                        {seller.documents?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {seller.documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl bg-gray-50 !bg-gray-50 !opacity-100">
                                        <div className="p-2 bg-blue-50 rounded-lg"><FiFileText className="w-5 h-5 text-blue-600" /></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium !text-black !opacity-100 capitalize">{doc.document_type || 'Document'}</p>
                                            <p className="text-xs !text-gray-600 !opacity-100">Uploaded {new Date(doc.uploaded_at || Date.now()).toLocaleDateString('en-IN')}</p>
                                        </div>
                                        <button onClick={() => window.open(doc.document_url, '_blank')} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"><FiEye className="w-4 h-4" /></button>
                                        <button onClick={() => window.open(doc.document_url, '_download')} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"><FiDownload className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        ) : <div className="text-center py-4 !text-gray-600 !opacity-100">No documents</div>}
                    </div>
                )}

                {/* Contact & Business Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white !bg-white !opacity-100 !filter-none !mix-blend-normal rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black !opacity-100 mb-4 flex items-center gap-2"><FiUser className="w-5 h-5 text-blue-600" /> Contact Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm !text-gray-800 !opacity-100"><FiMail className="w-4 h-4 text-gray-400" /> {seller.email}</div>
                            <div className="flex items-center gap-2 text-sm !text-gray-800 !opacity-100"><FiPhone className="w-4 h-4 text-gray-400" /> {seller.mobile_number || seller.phone || 'N/A'}</div>
                            <div className="flex items-center gap-2 text-sm !text-gray-800 !opacity-100"><FiMapPin className="w-4 h-4 text-gray-400" /> {seller.business_address?.street || 'N/A'}</div>
                        </div>
                    </div>
                    <div className="bg-white !bg-white !opacity-100 !filter-none !mix-blend-normal rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black !opacity-100 mb-4 flex items-center gap-2"><FiBriefcase className="w-5 h-5 text-blue-600" /> Business Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-xs !text-gray-600 !opacity-100">Business Name</p><p className="text-sm font-medium !text-black !opacity-100">{seller.business_name || 'N/A'}</p></div>
                            <div><p className="text-xs !text-gray-600 !opacity-100">Business Type</p><p className="text-sm font-medium !text-black !opacity-100 capitalize">{seller.business_type || 'N/A'}</p></div>
                            <div><p className="text-xs !text-gray-600 !opacity-100">GST Number</p><p className="text-sm font-medium !text-black !opacity-100">{seller.gst_number || 'N/A'}</p></div>
                            <div><p className="text-xs !text-gray-600 !opacity-100">PAN Number</p><p className="text-sm font-medium !text-black !opacity-100">{seller.pan_number || 'N/A'}</p></div>
                        </div>
                    </div>
                </div>

                {/* Only show performance & transactions if active */}
                {isActive && (
                    <>
                        <div className="bg-white !bg-white !opacity-100 !filter-none !mix-blend-normal rounded-2xl border border-blue-100 shadow-sm p-6">
                            <h3 className="font-semibold !text-black !opacity-100 mb-4 flex items-center gap-2"><FiTrendingUp className="w-5 h-5 text-blue-600" /> Performance Overview (Monthly)</h3>
                            {performance ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-xl !bg-blue-50 !opacity-100"><p className="text-sm !text-gray-600 !opacity-100">Total Orders</p><p className="text-2xl font-bold !text-black !opacity-100">{performance.total_orders || 0}</p></div>
                                    <div className="p-4 bg-emerald-50 rounded-xl !bg-emerald-50 !opacity-100"><p className="text-sm !text-gray-600 !opacity-100">Total Revenue</p><p className="text-2xl font-bold !text-black !opacity-100">₹{(performance.total_revenue || 0).toLocaleString()}</p></div>
                                    <div className="p-4 bg-yellow-50 rounded-xl !bg-yellow-50 !opacity-100"><p className="text-sm !text-gray-600 !opacity-100">Avg Rating</p><p className="text-2xl font-bold !text-black !opacity-100">{performance.avg_rating || 0}</p></div>
                                    <div className="p-4 bg-purple-50 rounded-xl !bg-purple-50 !opacity-100"><p className="text-sm !text-gray-600 !opacity-100">Period</p><p className="text-2xl font-bold !text-black !opacity-100 capitalize">{performance.period || 'N/A'}</p></div>
                                </div>
                            ) : <div className="text-center py-6 !text-gray-600 !opacity-100">No performance data available</div>}
                        </div>

                        <div className="bg-white !bg-white !opacity-100 !filter-none !mix-blend-normal rounded-2xl border border-blue-100 shadow-sm p-6">
                            <h3 className="font-semibold !text-black !opacity-100 mb-4 flex items-center gap-2"><FiShoppingBag className="w-5 h-5 text-blue-600" /> Recent Transactions</h3>
                            {transactions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-4 py-2 text-left text-xs font-semibold !text-gray-700 !opacity-100 uppercase">Transaction ID</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold !text-gray-700 !opacity-100 uppercase">Amount</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold !text-gray-700 !opacity-100 uppercase">Status</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold !text-gray-700 !opacity-100 uppercase">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {transactions.map((txn, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 text-sm font-medium !text-black !opacity-100">{txn.transaction_id || `TXN-${idx + 1}`}</td>
                                                    <td className="px-4 py-3 text-sm !text-gray-800 !opacity-100">₹{(txn.amount || 0).toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${txn.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : txn.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                            {txn.status || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm !text-gray-600 !opacity-100">{txn.created_at ? new Date(txn.created_at).toLocaleDateString('en-IN') : 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <div className="text-center py-6 !text-gray-600 !opacity-100">No transactions available</div>}
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false })} onConfirm={handleDelete} title="Delete Seller" message="Are you sure? This cannot be undone." confirmText="Delete" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
        </div>
    );
};

export default SellerDetails;