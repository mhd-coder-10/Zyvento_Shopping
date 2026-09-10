// PRODUCT DETAIL PAGE
// Description: Single product view with images, details, actions
// APIs: getProductById, getRelatedProducts, addToCart, addToWishlist


import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FiStar,
    FiHeart,
    FiShoppingCart,
    FiTruck,
    FiRefreshCw,
    FiShield,
    FiMinus,
    FiPlus,
    FiCheck,
    FiShare2,
    FiX
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import ProductCard from '../../../components/public/product/ProductCard';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [addingToCart, setAddingToCart] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [inWishlist, setInWishlist] = useState(false);

    // Load product
    useEffect(() => {
        if (productId) {
            loadProduct();
        }
    }, [productId]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getProductById(productId);

            if (response.data.success) {
                setProduct(response.data.data);
                setRelatedProducts(response.data.data.relatedProducts || []);
                if (isAuthenticated) {
                    checkWishlist(response.data.data._id);
                }
            } else {
                toast.error('Product not found');
                navigate('/products');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load product');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const checkWishlist = async (id) => {
        try {
            const response = await ApiService.checkWishlist(id);
            if (response.data.success) {
                setInWishlist(response.data.data.inWishlist);
            }
        } catch (error) {
            console.error('Failed to check wishlist:', error);
        }
    };

    // Add to cart
    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/products/${productId}` } });
            return;
        }

        setAddingToCart(true);
        try {
            const response = await ApiService.addToCart({
                productId: product._id,
                quantity: quantity,
            });

            if (response.data.success) {
                toast.success('Added to cart!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    // Buy now
    const handleBuyNow = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/products/${productId}` } });
            return;
        }
        navigate('/checkout', { state: { productId: product._id, quantity } });
    };

    // Toggle wishlist
    const toggleWishlist = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/products/${productId}` } });
            return;
        }

        setWishlistLoading(true);
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
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    // Share product
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    // Get stars
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating || 0);
        const hasHalfStar = (rating || 0) % 1 >= 0.5;

        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                    <FiStar
                        key={i}
                        className={`w-5 h-5 ${i < fullStars
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

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-gray-200 h-96 rounded-xl"></div>
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
                <p className="text-gray-500 mt-2">The product you're looking for doesn't exist</p>
                <Link to="/products" className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* ============ BREADCRUMB ============ */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link to="/" className="hover:text-indigo-600">Home</Link>
                <span>/</span>
                <Link to="/products" className="hover:text-indigo-600">Products</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium truncate">{product.name}</span>
            </div>

            {/* ============ PRODUCT MAIN ============ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* ===== LEFT: IMAGES ===== */}
                <div>
                    {/* Main Image */}
                    <div className="bg-gray-50 rounded-xl overflow-hidden aspect-square relative">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                                No Image
                            </div>
                        )}
                        {product.discount > 0 && (
                            <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                                {product.discount}% OFF
                            </div>
                        )}
                        {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">Out of Stock</span>
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === index ? 'border-indigo-600' : 'border-transparent'
                                        }`}
                                >
                                    <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ===== RIGHT: DETAILS ===== */}
                <div>
                    {/* Brand */}
                    {product.brand && (
                        <p className="text-sm text-indigo-600 font-medium mb-1">{product.brand}</p>
                    )}

                    {/* Name */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-0.5">
                            {renderStars(product.rating || 0)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            {product.rating?.toFixed(1) || 'No ratings'}
                        </span>
                        <span className="text-sm text-gray-400">
                            ({product.totalReviews || 0} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="mt-4">
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-bold text-gray-900">
                                ₹{product.finalPrice?.toFixed(2)}
                            </span>
                            {product.price > product.finalPrice && (
                                <>
                                    <span className="text-lg text-gray-400 line-through">
                                        ₹{product.price?.toFixed(2)}
                                    </span>
                                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                        Save ₹{(product.price - product.finalPrice)?.toFixed(2)}
                                    </span>
                                </>
                            )}
                        </div>
                        {product.discount > 0 && (
                            <p className="text-sm text-green-600 mt-1">
                                {product.discount}% discount applied
                            </p>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="mt-3 flex items-center gap-2">
                        {product.stock > 0 ? (
                            <>
                                <FiCheck className="text-green-600" />
                                <span className="text-sm text-green-600 font-medium">In Stock</span>
                                <span className="text-sm text-gray-400">({product.stock} units available)</span>
                            </>
                        ) : (
                            <>
                                <FiX className="text-red-600" />
                                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                            </>
                        )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Quantity:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <FiMinus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-1.5 text-sm font-medium text-gray-900 min-w-[40px] text-center">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                disabled={product.stock > 0 && quantity >= product.stock}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <FiPlus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        <button
                            onClick={handleAddToCart}
                            disabled={addingToCart || product.stock <= 0}
                            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {addingToCart ? (
                                'Adding...'
                            ) : (
                                <>
                                    <FiShoppingCart />
                                    Add to Cart
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleBuyNow}
                            disabled={product.stock <= 0}
                            className="flex-1 min-w-[140px] px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            Buy Now
                        </button>

                        <button
                            onClick={toggleWishlist}
                            disabled={wishlistLoading}
                            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FiHeart
                                className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                    }`}
                            />
                        </button>

                        <button
                            onClick={handleShare}
                            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FiShare2 className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Delivery Info */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <FiTruck className="text-indigo-600" />
                            <div>
                                <p className="text-xs font-medium text-gray-900">Free Shipping</p>
                                <p className="text-xs text-gray-500">On orders above ₹999</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <FiRefreshCw className="text-indigo-600" />
                            <div>
                                <p className="text-xs font-medium text-gray-900">Easy Returns</p>
                                <p className="text-xs text-gray-500">7-day return policy</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <FiShield className="text-indigo-600" />
                            <div>
                                <p className="text-xs font-medium text-gray-900">Secure Payment</p>
                                <p className="text-xs text-gray-500">100% secure transactions</p>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {product.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ============ TABS ============ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {['description', 'specifications', 'reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'description' && (
                        <div className="prose max-w-none">
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            {product.features && product.features.length > 0 && (
                                <ul className="mt-4 space-y-2">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-600">
                                            <FiCheck className="text-indigo-600 mt-1 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {activeTab === 'specifications' && product.specifications && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(product.specifications).map(([key, value]) => (
                                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">{key}</span>
                                    <span className="text-sm font-medium text-gray-900">{value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            <div className="flex items-center gap-6 mb-6">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-gray-900">{product.rating?.toFixed(1) || '0'}</p>
                                    <div className="flex items-center gap-0.5 justify-center mt-1">
                                        {renderStars(product.rating || 0)}
                                    </div>
                                    <p className="text-sm text-gray-500">{product.totalReviews || 0} reviews</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-center">No reviews yet. Be the first to review!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ============ RELATED PRODUCTS ============ */}
            {relatedProducts.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Products</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                        {relatedProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;