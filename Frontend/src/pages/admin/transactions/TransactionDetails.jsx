import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiRefreshCw, FiUser, FiShoppingBag, FiCreditCard } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const TransactionDetails = () => {
    const { transactionCode } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!transactionCode || transactionCode === 'undefined') {
            toast.error('Invalid transaction code');
            navigate('/admin/transactions');
            return;
        }
        fetchTransaction();
    }, [transactionCode]);

    const fetchTransaction = async () => {
        try {
            setLoading(true);
            const res = await ApiService.getTransactionByCode(transactionCode);
            if (res.data.success) {
                setTransaction(res.data.data);
            } else {
                toast.error('Transaction not found');
                navigate('/admin/transactions');
            }
        } catch (error) {
            toast.error('Failed to load transaction details');
            navigate('/admin/transactions');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
    if (!transaction) return <div className="text-center py-12 !text-gray-600">Transaction not found</div>;

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Transaction Details" subtitle={`Transaction #${transaction.transaction_code}`}
                actions={
                    <button onClick={() => navigate('/admin/transactions')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
                        <FiArrowLeft /> Back
                    </button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Transaction Summary Card */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center !text-blue-600">
                                <FiCreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold !text-black">Transaction #{transaction.transaction_code}</h2>
                                <p className="text-sm !text-gray-600">Type: {transaction.transaction_type}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold !text-black">₹{transaction.amount}</p>
                            <p className="text-xs !text-gray-500">{transaction.status}</p>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2"><FiUser className="!text-blue-600" /> Customer</h3>
                        <p className="text-sm !text-black font-semibold">{transaction.user_id?.first_name} {transaction.user_id?.last_name}</p>
                        <p className="text-xs !text-gray-600">{transaction.user_id?.email}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2"><FiShoppingBag className="!text-blue-600" /> Order & Payment</h3>
                        <p className="text-sm !text-black font-semibold">Order: {transaction.order_code}</p>
                        <p className="text-xs !text-gray-600">Payment: {transaction.payment_code}</p>
                        <p className="text-xs !text-gray-600">Gateway: {transaction.gateway_name || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2"><FiCreditCard className="!text-blue-600" /> Transaction Info</h3>
                        <p className="text-sm !text-gray-600">Status: <span className="font-bold !text-black">{transaction.status}</span></p>
                        <p className="text-xs !text-gray-600">Date: {formatDate(transaction.transaction_date)}</p>
                        <p className="text-xs !text-gray-600">Settled: {formatDate(transaction.settled_date)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetails;