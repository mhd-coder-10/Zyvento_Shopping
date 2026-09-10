
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiRefreshCw, FiMapPin, FiUser, FiShoppingBag, FiCreditCard, FiCalendar } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const OrderDetails = () => {
    const { orderCode } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // Inline Dropdown States
    const [orderStatus, setOrderStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [savingStatus, setSavingStatus] = useState(false);

    useEffect(() => {
        if (!orderCode || orderCode === 'undefined') {
            toast.error('Invalid order code in URL');
            navigate('/admin/orders');
            return;
        }
        fetchOrder();
    }, [orderCode]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await ApiService.getOrderByCode(orderCode);
            if (res.data.success) {
                const data = res.data.data;
                setOrder(data);
                setOrderStatus(data.order_status);
                setPaymentStatus(data.payment_status);
                setPaymentMethod(data.payment_method || 'online');
            } else {
                toast.error('Order not found');
                navigate('/admin/orders');
            }
        } catch (error) {
            toast.error('Failed to load order details');
            navigate('/admin/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusSave = async () => {
        setSavingStatus(true);
        try {
            await ApiService.updateOrderStatus(orderCode, {
                order_status: orderStatus,
                payment_status: paymentStatus,
                payment_method: paymentMethod
            });
            toast.success('Order status updated successfully');
            fetchOrder();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setSavingStatus(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
    if (!order) return <div className="text-center py-12 !text-gray-600">Order not found</div>;

    // Format Date Helper
    const formatDateTime = (date) => {
        if (!date) return 'Not Delivered Yet';
        return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            {/* FIX 1: Order Name in Subtitle */}
            <AdminTopbar
                title="Order Details"
                subtitle={`Order #${order.order_code}`}
                actions={
                    <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
                        <FiArrowLeft /> Back
                    </button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">

                {/* FIX 2: NEW ORDER SUMMARY CARD (Dates added) */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <FiShoppingBag className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold !text-black">Order #{order.order_code}</h2>
                                <p className="text-sm !text-gray-600">Code: {order.order_code}</p>
                            </div>
                        </div>

                        {/* Dates Section */}
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <FiCalendar className="!text-blue-500" />
                                <div>
                                    <p className="text-xs !text-gray-500">Order Date</p>
                                    <p className="font-semibold !text-black">{formatDateTime(order.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiMapPin className="!text-green-500" />
                                <div>
                                    <p className="text-xs !text-gray-500">Delivery Status</p>
                                    <p className="font-semibold !text-black">
                                        {order.delivered_at ? `Delivered on ${formatDateTime(order.delivered_at)}` : 'Not Delivered Yet'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== STATUS & PAYMENT MANAGEMENT ===== */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold !text-black mb-4">Status & Payment Management</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Order Status */}
                        <div>
                            <label className="text-sm font-medium !text-gray-700 mb-1 block">Order Status</label>
                            <select
                                value={orderStatus}
                                onChange={(e) => setOrderStatus(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white"
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="packed">Packed</option>
                                <option value="shipped">Shipped</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Payment Status */}
                        <div>
                            <label className="text-sm font-medium !text-gray-700 mb-1 block">Payment Status</label>
                            <select
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                                <option value="partially_refunded">Partially Refunded</option>
                            </select>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="text-sm font-medium !text-gray-700 mb-1 block">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white"
                            >
                                <option value="COD">COD</option>
                                <option value="UPI">UPI</option>
                                <option value="Wallet">Wallet</option>
                                <option value="Net_Banking">Net_Banking</option>
                                <option value="Debit_Card">Debit_Card</option>
                                <option value="Credit_Card">Credit_Card</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleStatusSave}
                            disabled={savingStatus}
                            className="px-6 py-2.5 bg-blue-600 !text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {savingStatus ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Main Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2"><FiUser className="!text-blue-600" /> Customer</h3>
                        <p className="text-sm !text-black font-semibold">{order.user_id?.first_name} {order.user_id?.last_name}</p>
                        <p className="text-xs !text-gray-600">{order.user_id?.email}</p>
                        <p className="text-xs !text-gray-600">{order.user_id?.mobile_number}</p>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2"><FiMapPin className="!text-blue-600" /> Shipping Address</h3>
                        <p className="text-sm !text-black">{order.shipping_address?.full_name}</p>
                        <p className="text-xs !text-gray-600">{order.shipping_address?.house_number}, {order.shipping_address?.street}</p>
                        <p className="text-xs !text-gray-600">{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2"><FiCreditCard className="!text-blue-600" /> Payment Summary</h3>
                        <p className="text-sm !text-gray-600">Method: <span className="font-bold !text-black uppercase">{order.payment_method || 'Online'}</span></p>
                        <p className="text-sm !text-gray-600">Total: <span className="font-bold !text-black">₹{order.total_amount}</span></p>
                        <p className="text-xs !text-gray-600">Subtotal: ₹{order.subtotal}</p>
                        <p className="text-xs !text-gray-600">Discount: ₹{order.discount_amount}</p>
                        <p className="text-xs !text-gray-600">Delivery: ₹{order.delivery_charge}</p>
                    </div>
                </div>

                {/* Order Items Table */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="font-semibold !text-black mb-4 flex items-center gap-2"><FiShoppingBag className="!text-blue-600" /> Order Items</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold !text-blue-900">Product</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold !text-blue-900">Brand / Company</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold !text-blue-900">Product Code</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold !text-blue-900">Quantity</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold !text-blue-900">Price</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold !text-blue-900">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {order.order_items?.length > 0 ? (
                                    order.order_items.map((item) => (
                                        <tr key={item._id}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {item.product_image ? <img src={item.product_image} alt="" className="w-12 h-12 rounded-lg object-cover" /> : item.product_id?.images?.[0] ? <img src={item.product_id.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">No Img</div>}
                                                    <div>
                                                        <p className="text-sm font-semibold !text-black">{item.product_name}</p>
                                                        <p className="text-xs !text-gray-500">{item.product_id?.category_id?.category_name || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm !text-gray-700">{item.product_id?.brand || 'N/A'}</td>
                                            <td className="px-4 py-3">
                                                {item.product_id?.product_code ? (
                                                    <button onClick={() => navigate(`/admin/products/${item.product_id.product_code}`)} className="text-xs font-bold !text-blue-600 hover:underline">{item.product_id.product_code}</button>
                                                ) : <span className="text-xs !text-gray-500">N/A</span>}
                                            </td>
                                            <td className="px-4 py-3 text-sm !text-gray-700">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm !text-gray-700">₹{item.price}</td>
                                            <td className="px-4 py-3 text-sm font-bold !text-black">₹{item.total_price}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="px-4 py-6 text-center !text-gray-500">No items in this order</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;