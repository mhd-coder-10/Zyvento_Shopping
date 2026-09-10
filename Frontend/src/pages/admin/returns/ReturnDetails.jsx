
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const ReturnDetails = () => {
    const { orderCode } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State for dropdowns
    const [orderStatus, setOrderStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchReturn();
    }, [orderCode]);

    const fetchReturn = async () => {
        try {
            const res = await ApiService.getReturnByOrderCode(orderCode);
            if (res.data.success) {
                setOrder(res.data.data);
                setOrderStatus(res.data.data.order_status);
                setPaymentStatus(res.data.data.payment_status);
            }
        } catch (error) {
            toast.error('Failed to load return details');
            navigate('/admin/returns');
        } finally {
            setLoading(false);
        }
    };

    // Update Order + Payment Status
    const handleUpdateStatus = async () => {
        setSaving(true);
        try {
            await ApiService.updateReturnStatus(orderCode, { order_status: orderStatus, payment_status: paymentStatus });
            toast.success('Status updated successfully. Reflected in Order Module.');
            fetchReturn();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
    if (!order) return <div className="text-center py-12 !text-gray-600">Order not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Return Details" subtitle={order.order_code}
                actions={<button onClick={() => navigate('/admin/returns')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm"><FiArrowLeft /> Back</button>}
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Status Update Section */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold !text-black mb-4">Update Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Order Status Dropdown - Same as Order Module */}
                        <div>
                            <label className="text-sm font-medium !text-gray-700 mb-1 block">Order Status</label>
                            <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl !text-black bg-white">
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="packed">Packed</option>
                                <option value="shipped">Shipped</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="returned">Returned</option>
                            </select>
                        </div>

                        {/* Payment Status Dropdown - Same as Order Module */}
                        <div>
                            <label className="text-sm font-medium !text-gray-700 mb-1 block">Payment Status</label>
                            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl !text-black bg-white">
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                                <option value="partially_refunded">Partially Refunded</option>
                            </select>
                        </div>
                    </div>

                    <button onClick={handleUpdateStatus} disabled={saving} className="mt-4 px-6 py-2 bg-blue-600 !text-white rounded-xl font-semibold disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3">Order Information</h3>
                        <p className="text-sm !text-gray-600"><strong>Order Code:</strong> {order.order_code}</p>
                        <p className="text-sm !text-gray-600"><strong>Total Amount:</strong> ₹{order.total_amount}</p>
                        <p className="text-sm !text-gray-600"><strong>Current Order Status:</strong> {order.order_status}</p>
                        <p className="text-sm !text-gray-600"><strong>Current Payment Status:</strong> {order.payment_status}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3">Customer Details</h3>
                        <p className="text-sm !text-black font-semibold">{order.user_id?.first_name} {order.user_id?.last_name}</p>
                        <p className="text-xs !text-gray-600">{order.user_id?.email}</p>
                        <p className="text-xs !text-gray-600">{order.user_id?.mobile_number}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnDetails;