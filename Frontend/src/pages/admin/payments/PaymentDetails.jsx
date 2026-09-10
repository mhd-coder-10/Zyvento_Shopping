
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiRefreshCw, FiCreditCard, FiUser, FiShoppingBag } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const PaymentDetails = () => {
    const { paymentCode } = useParams();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!paymentCode || paymentCode === 'undefined') {
            toast.error('Invalid payment code');
            navigate('/admin/payments');
            return;
        }
        fetchPayment();
    }, [paymentCode]);

    const fetchPayment = async () => {
        try {
            setLoading(true);
            const res = await ApiService.getPaymentByCode(paymentCode);
            if (res.data.success) {
                setPayment(res.data.data);
                setPaymentStatus(res.data.data.payment_status);
            } else {
                toast.error('Payment not found');
                navigate('/admin/payments');
            }
        } catch (error) {
            toast.error('Failed to load payment details');
            navigate('/admin/payments');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusSave = async () => {
        setSaving(true);
        try {
            await ApiService.updatePaymentStatus(paymentCode, { payment_status: paymentStatus });
            toast.success('Payment status updated');
            fetchPayment();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
    if (!payment) return <div className="text-center py-12 !text-gray-600">Payment not found</div>;

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Payment Details" subtitle={`Payment #${payment.payment_code}`}
                actions={
                    <button onClick={() => navigate('/admin/payments')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
                        <FiArrowLeft /> Back
                    </button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Payment Summary Card */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center !text-blue-600">
                                <FiCreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold !text-black">Payment #{payment.payment_code}</h2>
                                <p className="text-sm !text-gray-600">Order: {payment.order_code}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold !text-black">₹{payment.amount}</p>
                            <p className="text-xs !text-gray-500">{payment.payment_method}</p>
                        </div>
                    </div>
                </div>

                {/* Status Management */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold !text-black mb-4">Payment Status</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl !text-black bg-white">
                            <option value="pending">Pending</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                            <option value="partially_refunded">Partially Refunded</option>
                        </select>
                        <button onClick={handleStatusSave} disabled={saving} className="px-6 py-2 bg-blue-600 !text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2"><FiUser className="!text-blue-600" /> Customer</h3>
                        <p className="text-sm !text-black font-semibold">{payment.user_id?.first_name} {payment.user_id?.last_name}</p>
                        <p className="text-xs !text-gray-600">{payment.user_id?.email}</p>
                        <p className="text-xs !text-gray-600">{payment.user_id?.mobile_number}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2"><FiShoppingBag className="!text-blue-600" /> Order</h3>
                        <p className="text-sm !text-black font-semibold">{payment.order_code}</p>
                        <p className="text-xs !text-gray-600">Paid via: {payment.payment_gateway}</p>
                        <p className="text-xs !text-gray-600">Date: {formatDate(payment.payment_date)}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2"><FiCreditCard className="!text-blue-600" /> Payment Info</h3>
                        <p className="text-sm !text-gray-600">Method: <span className="font-bold !text-black uppercase">{payment.payment_method}</span></p>
                        <p className="text-sm !text-gray-600">Status: <span className="font-bold !text-black">{payment.payment_status}</span></p>
                        <p className="text-xs !text-gray-600">Transaction ID: {payment.transaction_id || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetails;