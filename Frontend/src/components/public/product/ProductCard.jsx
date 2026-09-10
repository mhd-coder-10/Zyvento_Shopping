// ============================================================
// PRODUCT CARD COMPONENT
// Description: Reusable product card for listing pages
// Features: Image, name, price, rating, discount badge, quick actions
// APIs: addToCart, addToWishlist, removeFromWishlist, checkWishlist
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FiHeart,
    FiShoppingCart,
    FiStar,
    FiEye,
    FiCheck,
    FiX
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';

const ProductCard = ({ product, viewMode = 'grid', onUpdate }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [inWishlist, setInWishlist] = useState(false);

    // Check wishlist status on mount
    useEffect(() => {
        if (isAuthenticated && product?._id) {
            checkWishlistStatus();
        }
    }, [isAuthenticated, product?._id]);

    const checkWishlistStatus = async () => {
        try {
            const response = await ApiService.checkWishlist(product._id);
            if (response.data.success) {
                setInWishlist(response.data.data.inWishlist);
            }
        } catch (error) {
            console.error('Failed to check wishlist:', error);
        }
    };

    // Handle add to cart
    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/products/${product._id}` } });
            return;
        }

        setLoading(true);
        try {
            const response = await ApiService.addToCart({
                productId: product._id,
                quantity: 1,
            });

            if (response.data.success) {
                toast.success('Added to cart!');
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setLoading(false);
        }
    };

    // Handle toggle wishlist
    const handleToggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/products/${product._id}` } });
            return;
        }

        setLoading(true);
        try {
            if (inWishlist) {
                await ApiService.removeFromWishlist(product._id);
                setInWishlist(false);
                toast.success('Removed from wishlist');
            } else {
                await ApiService.addToWishlist({ productId: product._id });
                setInWishlist(true);
                toast.success('Added to wishlist');
            }
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update wishlist');
        } finally {
            setLoading(false);
        }
    };

    // Render stars
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating || 0);
        const hasHalfStar = (rating || 0) % 1 >= 0.5;

        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                    <FiStar
                        key={i}
                        className={`w-3.5 h-3.5 ${i < fullStars
                                ? 'fill-yellow-400 text-yellow-400'
                                : i === fullStars && hasHalfStar
                                    ? 'fill-yellow-400 text-yellow-400 opacity-50'
                                    : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    // Grid view
    if (viewMode === 'grid') {
        return (
            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                <Link to={`/products/${product._id}`} className="block relative">
                    {/* Image */}
                    <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <FiShoppingCart className="w-12 h-12" />
                                <span className="text-xs mt-2">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.discount > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                                {product.discount}% OFF
                            </span>
                        )}
                        {product.isNew && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">
                                NEW
                            </span>
                        )}
                        {product.stock <= 0 && (
                            <span className="px-2 py-0.5 bg-gray-700 text-white text-xs font-bold rounded">
                                OUT OF STOCK
                            </span>
                        )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleToggleWishlist}
                        disabled={loading}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <FiHeart
                            className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                }`}
                        />
                    </button>

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="px-4 py-2 bg-white text-gray-900 font-medium rounded-lg shadow-lg flex items-center gap-2">
                            <FiEye className="w-4 h-4" />
                            Quick View
                        </span>
                    </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                    {/* Brand */}
                    {product.brand && (
                        <p className="text-xs text-indigo-600 font-medium">{product.brand}</p>
                    )}

                    {/* Name */}
                    <Link to={`/products/${product._id}`}>
                        <h3 className="font-medium text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 min-h-[48px] text-sm">
                            {product.name}
                        </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-1">
                        {renderStars(product.rating || 0)}
                        <span className="text-xs text-gray-500">
                            ({product.totalReviews || 0})
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-lg font-bold text-gray-900">
                            ₹{product.finalPrice?.toFixed(2)}
                        </span>
                        {product.price > product.finalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                ₹{product.price?.toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={loading || product.stock <= 0}
                        className="w-full mt-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'Adding...'
                        ) : product.stock <= 0 ? (
                            'Out of Stock'
                        ) : (
                            <>
                                <FiShoppingCart className="w-4 h-4" />
                                Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <Link to={`/products/${product._id}`} className="sm:w-48 md:w-56 lg:w-64 flex-shrink-0">
                    <div className="aspect-square sm:aspect-auto sm:h-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <FiShoppingCart className="w-12 h-12" />
                                <span className="text-xs mt-2">No Image</span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-6">
                    <div className="flex flex-col h-full">
                        {/* Top Row */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                {product.brand && (
                                    <p className="text-sm text-indigo-600 font-medium">{product.brand}</p>
                                )}
                                <Link to={`/products/${product._id}`}>
                                    <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                                        {product.name}
                                    </h3>
                                </Link>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {product.discount > 0 && (
                                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                                        {product.discount}% OFF
                                    </span>
                                )}
                                {product.stock <= 0 && (
                                    <span className="px-2 py-0.5 bg-gray-700 text-white text-xs font-bold rounded">
                                        OUT OF STOCK
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mt-1">
                            {renderStars(product.rating || 0)}
                            <span className="text-sm font-medium text-gray-700">
                                {product.rating?.toFixed(1) || 'No ratings'}
                            </span>
                            <span className="text-sm text-gray-400">
                                ({product.totalReviews || 0} reviews)
                            </span>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {product.description}
                            </p>
                        )}

                        {/* Price & Actions */}
                        <div className="flex flex-wrap items-end justify-between mt-4 pt-4 border-t border-gray-100">
                            <div>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{product.finalPrice?.toFixed(2)}
                                    </span>
                                    {product.price > product.finalPrice && (
                                        <span className="text-sm text-gray-400 line-through">
                                            ₹{product.price?.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                {product.discount > 0 && (
                                    <p className="text-sm text-green-600">
                                        Save ₹{(product.price - product.finalPrice)?.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 mt-3 sm:mt-0">
                                <button
                                    onClick={handleToggleWishlist}
                                    disabled={loading}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <FiHeart
                                        className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                            }`}
                                    />
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={loading || product.stock <= 0}
                                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? (
                                        'Adding...'
                                    ) : product.stock <= 0 ? (
                                        'Out of Stock'
                                    ) : (
                                        <>
                                            <FiShoppingCart className="w-4 h-4" />
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                                <Link
                                    to={`/products/${product._id}`}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;