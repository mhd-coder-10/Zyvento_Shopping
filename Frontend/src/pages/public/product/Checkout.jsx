
// CHECKOUT PAGE
// Description: Complete checkout process with address, payment, order summary
// APIs: getAddresses, createAddress, placeOrder, initiatePayment

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FiMapPin,
    FiPlus,
    FiCheck,
    FiX,
    FiCreditCard,
    FiTruck,
    FiShoppingBag,
    FiArrowLeft,
    FiEdit2,
    FiTrash2,
    FiDollarSign,
    FiShield,
    FiHome,
    FiBriefcase,
    FiRadio,
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';

const Checkout = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [cart, setCart] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [editingAddress, setEditingAddress] = useState(null);

    const [addressForm, setAddressForm] = useState({
        full_name: user?.first_name + ' ' + user?.last_name || '',
        phone: user?.mobile_number || '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        address_type: 'home',
        is_default: false,
    });

    // Load cart and addresses
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }
        loadCheckoutData();
    }, [isAuthenticated]);

    const loadCheckoutData = async () => {
        setLoading(true);
        try {
            // Load cart
            const cartResponse = await ApiService.getCart();
            if (cartResponse.data.success) {
                setCart(cartResponse.data.data);
                if (cartResponse.data.data.items?.length === 0) {
                    toast.warning('Your cart is empty');
                    navigate('/cart');
                    return;
                }
            }

            // Load addresses
            const addressResponse = await ApiService.getAddresses();
            if (addressResponse.data.success) {
                const addrList = addressResponse.data.data || [];
                setAddresses(addrList);
                const defaultAddr = addrList.find((a) => a.is_default);
                if (defaultAddr) {
                    setSelectedAddress(defaultAddr);
                } else if (addrList.length > 0) {
                    setSelectedAddress(addrList[0]);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load checkout data');
        } finally {
            setLoading(false);
        }
    };

    // Handle address form submit
    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let response;
            if (editingAddress) {
                response = await ApiService.updateAddress(editingAddress._id, addressForm);
                toast.success('Address updated!');
            } else {
                response = await ApiService.createAddress(addressForm);
                toast.success('Address added!');
            }

            if (response.data.success) {
                loadCheckoutData();
                resetAddressForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    // Edit address
    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setAddressForm({
            full_name: address.full_name || '',
            phone: address.phone || '',
            address_line1: address.address_line1 || '',
            address_line2: address.address_line2 || '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || '',
            country: address.country || 'India',
            address_type: address.address_type || 'home',
            is_default: address.is_default || false,
        });
        setShowAddressForm(true);
    };

    // Delete address
    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Delete this address?')) return;

        try {
            const response = await ApiService.deleteAddress(addressId);
            if (response.data.success) {
                toast.success('Address deleted');
                loadCheckoutData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete address');
        }
    };

    // Reset address form
    const resetAddressForm = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({
            full_name: user?.first_name + ' ' + user?.last_name || '',
            phone: user?.mobile_number || '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            address_type: 'home',
            is_default: false,
        });
    };

    // Place order
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            return;
        }

        setPlacingOrder(true);
        try {
            const orderData = {
                address_id: selectedAddress._id,
                payment_method: paymentMethod,
            };

            const response = await ApiService.placeOrder(orderData);

            if (response.data.success) {
                const orderId = response.data.data._id;
                toast.success('Order placed successfully!');

                // If payment method is COD, go to order success
                if (paymentMethod === 'cod') {
                    navigate(`/order-success/${orderId}`);
                } else {
                    // Initiate payment
                    const paymentResponse = await ApiService.initiatePayment({
                        orderId: orderId,
                        amount: cart.total_amount,
                        payment_method: paymentMethod,
                    });

                    if (paymentResponse.data.success) {
                        // Redirect to payment gateway
                        if (paymentResponse.data.data.redirect_url) {
                            window.location.href = paymentResponse.data.data.redirect_url;
                        }
                    }
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacingOrder(false);
        }
    };

    // Address type icon
    const getAddressIcon = (type) => {
        if (type === 'home') return <FiHome className="w-4 h-4" />;
        if (type === 'work') return <FiBriefcase className="w-4 h-4" />;
        return <FiMapPin className="w-4 h-4" />;
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="h-32 bg-gray-200 rounded-xl"></div>
                            <div className="h-32 bg-gray-200 rounded-xl"></div>
                        </div>
                        <div className="h-64 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!cart || cart.items?.length === 0) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
                <p className="text-gray-500 mt-2">Add some items to proceed to checkout</p>
                <Link to="/products" className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Page Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/cart')}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-sm text-gray-500">Complete your order</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ===== LEFT: Address & Payment ===== */}
                <div className="lg:col-span-2 space-y-6">

                    {/* ===== ADDRESS SECTION ===== */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FiMapPin className="text-indigo-600" />
                                <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                            </div>
                            <button
                                onClick={() => {
                                    resetAddressForm();
                                    setShowAddressForm(true);
                                }}
                                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                <FiPlus className="w-4 h-4" />
                                Add New
                            </button>
                        </div>

                        {addresses.length === 0 && !showAddressForm ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No addresses saved</p>
                                <button
                                    onClick={() => setShowAddressForm(true)}
                                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Add your first address
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map((address) => (
                                    <div
                                        key={address._id}
                                        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAddress?._id === address._id
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setSelectedAddress(address)}
                                    >
                                        <div className="mt-1">
                                            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                                                {selectedAddress?._id === address._id && (
                                                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900">{address.full_name}</p>
                                                {address.is_default && (
                                                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{address.phone}</p>
                                            <p className="text-sm text-gray-600">
                                                {address.address_line1}
                                                {address.address_line2 && `, ${address.address_line2}`}
                                                <br />
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                {getAddressIcon(address.address_type)}
                                                <span className="text-xs text-gray-400 capitalize">{address.address_type}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditAddress(address);
                                                }}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            {!address.is_default && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteAddress(address._id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Address Form */}
                        {showAddressForm && (
                            <div className="mt-4 p-4 border border-gray-200 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-gray-900">
                                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                                    </h4>
                                    <button
                                        onClick={resetAddressForm}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleAddressSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.full_name}
                                                onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={addressForm.phone}
                                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address Line 1
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.address_line1}
                                            onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address Line 2 (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={addressForm.address_line2}
                                            onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.state}
                                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pincode
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.pincode}
                                                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Address Type
                                            </label>
                                            <select
                                                value={addressForm.address_type}
                                                onChange={(e) => setAddressForm({ ...addressForm, address_type: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            >
                                                <option value="home">Home</option>
                                                <option value="work">Work</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 pt-6">
                                            <input
                                                type="checkbox"
                                                id="isDefaultCheck"
                                                checked={addressForm.is_default}
                                                onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <label htmlFor="isDefaultCheck" className="text-sm text-gray-700">
                                                Set as default address
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetAddressForm}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* ===== PAYMENT SECTION ===== */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FiCreditCard className="text-indigo-600" />
                            <h3 className="font-semibold text-gray-900">Payment Method</h3>
                        </div>

                        <div className="space-y-3">
                            {[
                                { value: 'cod', label: 'Cash on Delivery', icon: <FiDollarSign /> },
                                { value: 'card', label: 'Credit/Debit Card', icon: <FiCreditCard /> },
                                { value: 'upi', label: 'UPI (Google Pay, PhonePe, Paytm)', icon: <FiRadio /> },
                            ].map((method) => (
                                <div
                                    key={method.value}
                                    onClick={() => setPaymentMethod(method.value)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === method.value
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0">
                                        {paymentMethod === method.value && (
                                            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                        )}
                                    </div>
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        {method.icon}
                                        {method.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== RIGHT: ORDER SUMMARY ===== */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {cart.items?.map((item) => (
                                <div key={item.productId} className="flex items-center gap-3 py-2 border-b border-gray-100">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {item.productImage ? (
                                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <FiShoppingBag className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">₹{(item.finalPrice * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal ({cart.items?.length || 0} items)</span>
                                <span className="font-medium text-gray-900">₹{cart.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium text-gray-900">
                                    {cart.shipping_charge > 0 ? `₹${cart.shipping_charge.toFixed(2)}` : 'Free'}
                                </span>
                            </div>
                            {cart.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{cart.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span className="text-indigo-600">₹{cart.total_amount?.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiTruck className="text-indigo-600" />
                                <span>Estimated delivery: 3-5 business days</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <FiShield className="text-indigo-600" />
                                <span>Secure checkout with encryption</span>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={placingOrder || !selectedAddress}
                            className="w-full mt-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {placingOrder ? 'Placing Order...' : `Place Order • ₹${cart.total_amount?.toFixed(2)}`}
                        </button>

                        {!selectedAddress && (
                            <p className="text-xs text-red-500 mt-2 text-center">
                                Please select a delivery address
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;