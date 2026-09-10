// ============================================================
// CART PAGE
// Description: View and manage cart items
// APIs: getCart, updateCartItem, removeFromCart, clearCart, applyCoupon
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiShoppingCart,
    FiPlus,
    FiMinus,
    FiX,
    FiTrash2,
    FiTag,
    FiArrowLeft,
    FiShoppingBag
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [couponCode, setCouponCode] = useState('');

    // Load cart
    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getCart();

            if (response.data.success) {
                setCart(response.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    // Update quantity
    const handleUpdateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;
        setUpdating(true);

        try {
            const response = await ApiService.updateCartItem(productId, { quantity });

            if (response.data.success) {
                setCart(response.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update quantity');
        } finally {
            setUpdating(false);
        }
    };

    // Remove from cart
    const handleRemoveItem = async (productId) => {
        if (!window.confirm('Remove this item from cart?')) return;

        try {
            const response = await ApiService.removeFromCart(productId);

            if (response.data.success) {
                toast.success('Item removed from cart');
                setCart(response.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove item');
        }
    };

    // Clear cart
    const handleClearCart = async () => {
        if (!window.confirm('Clear your entire cart?')) return;

        try {
            const response = await ApiService.clearCart();

            if (response.data.success) {
                toast.success('Cart cleared');
                setCart(response.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to clear cart');
        }
    };

    // Apply coupon
    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        try {
            const response = await ApiService.applyCoupon({ code: couponCode });

            if (response.data.success) {
                toast.success('Coupon applied successfully!');
                setCart(response.data.data);
                setCouponCode('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid coupon code');
        }
    };

    // Remove coupon
    const handleRemoveCoupon = async () => {
        try {
            const response = await ApiService.removeCoupon();

            if (response.data.success) {
                toast.success('Coupon removed');
                setCart(response.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove coupon');
        }
    };

    // Proceed to checkout
    const handleCheckout = () => {
        if (cart?.items?.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
                            ))}
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
                <FiShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
                <p className="text-gray-500 mt-2">Looks like you haven't added any items yet</p>
                <Link to="/products" className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-sm text-gray-500">{cart.items?.length || 0} items in your cart</p>
                </div>
                <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    Clear Cart
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.items?.map((item) => (
                        <div key={item.productId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Product Image */}
                                <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {item.productImage ? (
                                        <img
                                            src={item.productImage}
                                            alt={item.productName}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <FiShoppingBag className="text-3xl text-gray-300" />
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <Link to={`/products/${item.productId}`} className="block">
                                        <h3 className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                                            {item.productName}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-500">{item.brand}</p>

                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <span className="text-lg font-bold text-gray-900">
                                            ₹{item.finalPrice?.toFixed(2)}
                                        </span>
                                        {item.price > item.finalPrice && (
                                            <span className="text-sm text-gray-400 line-through">
                                                ₹{item.price?.toFixed(2)}
                                            </span>
                                        )}
                                        {item.discount > 0 && (
                                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                {item.discount}% OFF
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Quantity + Remove */}
                                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                            disabled={updating || item.quantity <= 1}
                                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <FiMinus className="w-4 h-4" />
                                        </button>
                                        <span className="px-3 py-1.5 text-sm font-medium text-gray-900 min-w-[40px] text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                            disabled={updating}
                                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                                        >
                                            <FiPlus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveItem(item.productId)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Continue Shopping */}
                    <Link to="/products" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        <FiArrowLeft />
                        Continue Shopping
                    </Link>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal ({cart.items?.length || 0} items)</span>
                                <span className="font-medium text-gray-900">₹{cart.subtotal?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium text-gray-900">
                                    {cart.shipping_charge > 0 ? `₹${cart.shipping_charge?.toFixed(2)}` : 'Free'}
                                </span>
                            </div>
                            {cart.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{cart.discount?.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between text-base font-bold">
                                    <span>Total</span>
                                    <span className="text-indigo-600">₹{cart.total_amount?.toFixed(2) || '0.00'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Coupon */}
                        <form onSubmit={handleApplyCoupon} className="mt-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Coupon code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        </form>

                        {cart.coupon_code && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                                <FiTag />
                                <span>Coupon "{cart.coupon_code}" applied</span>
                                <button
                                    onClick={handleRemoveCoupon}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            className="w-full mt-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;