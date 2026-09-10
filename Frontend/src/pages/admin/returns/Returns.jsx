
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiDownload } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const Returns = () => {
    const navigate = useNavigate();
    const [returns, setReturns] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, refunded: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all'); // cancelled, returned, all
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all'); // pending, paid, refunded, all

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiService.getAllReturns({ 
                search, 
                orderStatus: orderStatusFilter, 
                paymentStatus: paymentStatusFilter 
            });
            if (res.data.success) {
                setReturns(res.data.data || []);
                setStats(res.data.stats || {});
            }
        } catch (error) { toast.error('Failed to load returns'); }
        finally { setLoading(false); }
    }, [search, orderStatusFilter, paymentStatusFilter]);

    useEffect(() => { fetchReturns(); }, [fetchReturns]);

    const handleExportPDF = async () => {
        try {
            const res = await ApiService.exportReturnsPDF();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url; a.download = 'returns-report.pdf'; a.click();
            window.URL.revokeObjectURL(url);
            toast.success('PDF downloaded successfully');
        } catch (error) { toast.error('Failed to export PDF'); }
    };

    // Badge helper for Order Status
    const getOrderBadge = (status) => {
        if (status === 'cancelled') return <span className="px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs">Cancelled</span>;
        if (status === 'returned') return <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs">Returned</span>;
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs capitalize">{status}</span>;
    };

    // Badge helper for Payment Status
    const getPaymentBadge = (status) => {
        const config = {
            pending: 'bg-amber-50 text-amber-700',
            paid: 'bg-emerald-50 text-emerald-700',
            refunded: 'bg-blue-50 text-blue-700',
            failed: 'bg-red-50 text-red-700',
            partially_refunded: 'bg-orange-50 text-orange-700'
        };
        return <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${config[status] || 'bg-gray-100 text-gray-600'}`}>{status.replace(/_/g, ' ')}</span>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Returns Management" subtitle="Manage cancelled/returned orders"
                actions={<button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 !text-white rounded-xl font-semibold"><FiDownload /> Export PDF</button>}
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Stats Cards - Now based on Payment Status */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                        <p className="text-2xl font-bold !text-black">{stats.total}</p>
                        <p className="text-xs !text-gray-600">Total Returns</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
                        <p className="text-2xl font-bold !text-amber-600">{stats.pending}</p>
                        <p className="text-xs !text-gray-600">Pending Payment</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                        <p className="text-2xl font-bold !text-emerald-600">{stats.paid}</p>
                        <p className="text-xs !text-gray-600">Paid</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                        <p className="text-2xl font-bold !text-blue-600">{stats.refunded}</p>
                        <p className="text-xs !text-gray-600">Refunded</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
                        <input type="text" placeholder="Search by Order Code..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black" onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white">
                        <option value="all">All Order Status</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                    </select>
                    <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white">
                        <option value="all">All Payment Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                        <option value="partially_refunded">Partially Refunded</option>
                    </select>
                </div>

                {/* Desktop Table - Fully Aligned */}
                <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    {loading ? <div className="p-10 text-center">Loading...</div> : (
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Order Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Order Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Payment Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {returns.map((item) => (
                                    <tr key={item._id} onClick={() => navigate(`/admin/returns/${item.order_code}`)} className="hover:bg-blue-50/30 cursor-pointer">
                                        <td className="px-4 py-3 text-sm font-bold !text-left !text-blue-600">{item.order_code}</td>
                                        <td className="px-4 py-3 text-sm !text-left !text-black">{item.user_id?.first_name} {item.user_id?.last_name}</td>
                                        <td className="px-4 py-3 text-sm font-bold !text-right !text-black">₹{item.total_amount}</td>
                                        <td className="px-4 py-3 text-sm !text-left">{getOrderBadge(item.order_status)}</td>
                                        <td className="px-4 py-3 text-sm !text-left">{getPaymentBadge(item.payment_status)}</td>
                                        <td className="px-4 py-3 text-right"><FiEye className="inline-block" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Returns;