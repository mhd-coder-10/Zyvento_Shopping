// ============================================================
// WISHLIST PAGE
// Description: View and manage wishlist items
// APIs: getWishlist, removeFromWishlist, moveToCart
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiHeart,
    FiShoppingCart,
    FiX,
    FiTrash2,
    FiStar,
    FiShoppingBag
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0,
    });

    // Load wishlist
    useEffect(() => {
        loadWishlist();
    }, [pagination.page]);

    const loadWishlist = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getWishlist({
                page: pagination.page,
                limit: pagination.limit,
            });

            if (response.data.success) {
                setWishlist(response.data.data.wishlist || []);
                setPagination({
                    ...pagination,
                    total: response.data.data.total || 0,
                    pages: response.data.data.pages || 0,
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    // Remove from wishlist
    const handleRemoveFromWishlist = async (productId) => {
        try {
            const response = await ApiService.removeFromWishlist(productId);

            if (response.data.success) {
                toast.success('Removed from wishlist');
                setWishlist(wishlist.filter((item) => item.productId !== productId));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove item');
        }
    };

    // Move to cart
    const handleMoveToCart = async (productId) => {
        try {
            const response = await ApiService.moveToCart(productId, { quantity: 1 });

            if (response.data.success) {
                toast.success('Added to cart!');
                setWishlist(wishlist.filter((item) => item.productId !== productId));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-500">Products you've saved for later</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="h-48 bg-gray-200 rounded-lg"></div>
                            <div className="mt-3 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : wishlist.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <FiHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">Your wishlist is empty</h3>
                    <p className="text-gray-500 mt-1">Start exploring products and save your favorites</p>
                    <Link to="/products" className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        Explore Products
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlist.map((item) => (
                            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                                <Link to={`/products/${item.productId}`} className="block relative">
                                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                                        {item.productImage ? (
                                            <img
                                                src={item.productImage}
                                                alt={item.productName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FiShoppingBag className="text-4xl text-gray-300" />
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleRemoveFromWishlist(item.productId);
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
                                    >
                                        <FiX className="text-gray-500 hover:text-red-500" />
                                    </button>
                                    {item.discount > 0 && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                            {item.discount}% OFF
                                        </div>
                                    )}
                                </Link>

                                <div className="p-4">
                                    <Link to={`/products/${item.productId}`} className="block">
                                        <h3 className="font-medium text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                                            {item.productName}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 mt-1">{item.brand}</p>

                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-lg font-bold text-gray-900">
                                            ₹{item.finalPrice?.toFixed(2)}
                                        </span>
                                        {item.price > item.finalPrice && (
                                            <span className="text-sm text-gray-400 line-through">
                                                ₹{item.price?.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {item.rating > 0 && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <FiStar className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                                            <span className="text-sm text-gray-400">({item.totalReviews})</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleMoveToCart(item.productId)}
                                        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        <FiShoppingCart />
                                        Move to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Wishlist;