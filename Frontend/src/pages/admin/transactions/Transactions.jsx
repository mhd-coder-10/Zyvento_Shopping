
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiRefreshCw } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const Transactions = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ total: 0, success: 0, pending: 0, failed: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiService.getAllTransactions({ search, status: statusFilter });
            if (res.data.success) {
                setTransactions(res.data.data || []);
                setStats(res.data.stats || {});
            }
        } catch (error) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    const handleNavigate = (txn) => {
        const code = txn?.transaction_code || txn?._id;
        if (code) navigate(`/admin/transactions/${code}`);
    };

    const getBadge = (status) => {
        const config = { success: 'bg-emerald-50 text-emerald-700', pending: 'bg-amber-50 text-amber-700', failed: 'bg-red-50 text-red-700', processing: 'bg-blue-50 text-blue-700' };
        return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${config[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Transaction Management" subtitle="Track all financial transactions" />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-black">{stats.total}</p>
                        <p className="text-xs !text-gray-600">Total Transactions</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-emerald-600">{stats.success}</p>
                        <p className="text-xs !text-gray-600">Success</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-amber-600">{stats.pending}</p>
                        <p className="text-xs !text-gray-600">Pending</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-red-600">{stats.failed}</p>
                        <p className="text-xs !text-gray-600">Failed</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
                        <input type="text" placeholder="Search by Transaction Code or Order Code..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black" onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white cursor-pointer">
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="processing">Processing</option>
                    </select>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    {loading ? <div className="p-10 text-center"><FiRefreshCw className="animate-spin !text-blue-600 w-6 h-6 inline" /></div> : (
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Transaction Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Order Code</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map((txn) => (
                                    <tr key={txn._id} className="hover:bg-blue-50/30 cursor-pointer" onClick={() => handleNavigate(txn)}>
                                        <td className="px-4 py-3 text-sm font-bold !text-left !text-blue-600">{txn.transaction_code}</td>
                                        <td className="px-4 py-3 text-sm !text-left !text-black capitalize">{txn.transaction_type}</td>
                                        <td className="px-4 py-3 text-sm !text-left !text-black">{txn.order_code}</td>
                                        <td className="px-4 py-3 text-sm font-bold !text-right !text-black">₹{txn.amount}</td>
                                        <td className="px-4 py-3 !text-left">{getBadge(txn.status)}</td>
                                        <td className="px-4 py-3 text-sm !text-left !text-gray-600">{formatDate(txn.transaction_date)}</td>
                                        <td className="px-4 py-3 !text-right">
                                            <button onClick={(e) => { e.stopPropagation(); handleNavigate(txn); }} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>
                                        </td>
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

export default Transactions;