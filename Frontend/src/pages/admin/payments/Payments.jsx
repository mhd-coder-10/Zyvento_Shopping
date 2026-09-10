
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiDownload, FiTrendingUp, FiTrendingDown, FiDollarSign, FiClock } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const Payments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState({ income: { total: 0 }, refunds: { total: 0 }, pending: { total: 0 }, net_profit: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const [payRes, summaryRes] = await Promise.all([
                ApiService.getAllPayments({ search, status: statusFilter }),
                ApiService.getPaymentSummary()
            ]);
            
            if (payRes.data.success) setPayments(payRes.data.data || []);
            if (summaryRes.data.success) setSummary(summaryRes.data.data || {});
        } catch (error) {
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    const handleNavigate = (payment) => {
        const code = payment?.payment_code || payment?._id;
        if (code) navigate(`/admin/payments/${code}`);
    };

    const handleExportPDF = async () => {
        try {
            const res = await ApiService.exportAccountingPDF();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url; a.download = 'accounting-report.pdf'; a.click();
            window.URL.revokeObjectURL(url);
            toast.success('PDF downloaded successfully');
        } catch (error) { toast.error('Failed to export PDF'); }
    };

    const getBadge = (status) => {
        const config = { success: 'bg-emerald-50 text-emerald-700', pending: 'bg-amber-50 text-amber-700', failed: 'bg-red-50 text-red-700', refunded: 'bg-blue-50 text-blue-700' };
        return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${config[status] || 'bg-gray-100 text-gray-600'}`}>{status.replace(/_/g, ' ')}</span>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Payment Management" subtitle="Manage all payment transactions"
                actions={
                    <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 !text-white rounded-xl font-semibold hover:bg-blue-700">
                        <FiDownload /> Export PDF
                    </button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                
                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                        <p className="text-xs !text-gray-600">Total Income</p>
                        <p className="text-2xl font-bold !text-emerald-600">₹{summary.income.total.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                        <p className="text-xs !text-gray-600">Total Refunds</p>
                        <p className="text-2xl font-bold !text-red-600">₹{summary.refunds.total.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
                        <p className="text-xs !text-gray-600">Pending</p>
                        <p className="text-2xl font-bold !text-amber-600">₹{summary.pending.total.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                        <p className="text-xs !text-gray-600">Net Profit</p>
                        <p className="text-2xl font-bold !text-blue-600">₹{summary.net_profit.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
                        <input type="text" placeholder="Search by Payment Code or Order Code..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black" onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white cursor-pointer">
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                        <option value="partially_refunded">Partially Refunded</option>
                    </select>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    {loading ? <div className="p-10 text-center">Loading...</div> : (
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Payment Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Order Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Method</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {payments.map((pay) => (
                                    <tr key={pay._id} className="hover:bg-blue-50/30 cursor-pointer" onClick={() => handleNavigate(pay)}>
                                        <td className="px-4 py-3 text-sm font-bold !text-left !text-blue-600">{pay.payment_code}</td>
                                        <td className="px-4 py-3 text-sm !text-left !text-black">{pay.order_code}</td>
                                        <td className="px-4 py-3 text-sm !text-left !text-black">
                                            {pay.user_id?.first_name} {pay.user_id?.last_name}
                                            <p className="text-xs !text-gray-500">{pay.user_id?.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold !text-right !text-black">₹{pay.amount}</td>
                                        <td className="px-4 py-3 text-sm !text-left !text-gray-700">{pay.payment_method}</td>
                                        <td className="px-4 py-3 !text-left">{getBadge(pay.payment_status)}</td>
                                        <td className="px-4 py-3 !text-right">
                                            <button onClick={(e) => { e.stopPropagation(); handleNavigate(pay); }} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {loading ? <div className="p-10 text-center">Loading...</div> : (
                        payments.map((pay) => (
                            <div key={pay._id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold !text-blue-600">{pay.payment_code}</p>
                                    {getBadge(pay.payment_status)}
                                </div>
                                <div className="mt-2 text-sm !text-black">
                                    <p>{pay.user_id?.first_name} {pay.user_id?.last_name}</p>
                                    <p className="text-xs !text-gray-500">{pay.user_id?.email}</p>
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="!text-gray-600">Order: {pay.order_code}</span>
                                    <span className="font-bold !text-black">₹{pay.amount}</span>
                                </div>
                                <button onClick={() => handleNavigate(pay)} className="mt-3 w-full py-2 bg-blue-50 !text-blue-600 rounded-lg">View Details</button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payments;