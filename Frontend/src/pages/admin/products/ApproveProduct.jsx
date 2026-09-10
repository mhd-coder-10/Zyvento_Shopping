import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft,
    FiCheckCircle,
    FiXCircle,
    FiPackage,
    FiDollarSign,
    FiTag,
    FiUser,
    FiGrid,
    FiClock,
    FiImage,
    FiInfo,
    FiEye,
} from 'react-icons/fi';

import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const ApproveProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [statusConfirm, setStatusConfirm] = useState({ open: false, action: 'approve' });

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getAllProducts({
                status: 'pending',
                limit: 100,
            });
            if (response.data.success) {
                setProducts(response.data.data || []);
                if (response.data.data?.length > 0) {
                    setSelectedProduct(response.data.data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch pending products:', error);
            toast.error(error.response?.data?.message || 'Failed to load pending products');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = () => {
        if (!selectedProduct) return;
        setStatusConfirm({ open: true, action: 'approve' });
    };

    const handleReject = () => {
        if (!selectedProduct) return;
        setStatusConfirm({ open: true, action: 'reject' });
    };

    const confirmStatusAction = async () => {
        if (!selectedProduct) return;
        setSubmitting(true);
        try {
            await ApiService.updateProductStatus(selectedProduct._id, {
                status: statusConfirm.action === 'approve' ? 'active' : 'inactive',
            });
            toast.success(`Product ${statusConfirm.action === 'approve' ? 'approved' : 'rejected'} successfully`);

            const updatedProducts = products.filter(p => p._id !== selectedProduct._id);
            setProducts(updatedProducts);
            setSelectedProduct(updatedProducts.length > 0 ? updatedProducts[0] : null);

            if (updatedProducts.length === 0) {
                toast.info('All pending products processed!');
                navigate('/admin/products');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process product');
        } finally {
            setSubmitting(false);
            setStatusConfirm({ open: false, action: 'approve' });
        }
    };

    const formatCurrency = (value) => {
        if (!value) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-red-100 text-red-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config[status] || 'bg-gray-100 text-gray-800'}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
            </span>
        );
    };

    if (loading) {
        return <LoadingSpinner fullPage text="Loading pending products..." />;
    }

    if (products.length === 0) {
        return (
            <div>
                <AdminTopbar
                    title="Approve Products"
                    subtitle="No pending products to approve"
                    actions={
                        <button
                            onClick={() => navigate('/admin/products')}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Back to Products
                        </button>
                    }
                />
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <FiCheckCircle className="w-12 h-12 text-green-500" />
                        <h3 className="text-lg font-semibold text-gray-900">All Caught Up!</h3>
                        <p className="text-gray-500">No pending product approvals at the moment.</p>
                        <button
                            onClick={() => navigate('/admin/products')}
                            className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            View all products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <AdminTopbar
                title="Approve Products"
                subtitle={`${products.length} pending product${products.length > 1 ? 's' : ''} to review`}
                actions={
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Products
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Products List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <p className="text-sm font-medium text-gray-700">
                                Pending ({products.length})
                            </p>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto">
                            {products.map((product) => (
                                <button
                                    key={product._id}
                                    onClick={() => setSelectedProduct(product)}
                                    className={`w-full text-left p-4 border-b border-gray-100 transition-colors ${selectedProduct?._id === product._id
                                            ? 'bg-indigo-50 border-indigo-200'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {product.images?.[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <FiPackage className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {product.name || 'N/A'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {formatCurrency(product.price)}
                                            </p>
                                        </div>
                                        {getStatusBadge(product.status)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="lg:col-span-2">
                    {selectedProduct ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {selectedProduct.name || 'N/A'}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm text-gray-500">
                                            SKU: {selectedProduct.sku || 'N/A'}
                                        </span>
                                        {getStatusBadge(selectedProduct.status)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/products/${selectedProduct._id}`)}
                                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        <FiEye className="w-4 h-4" />
                                        View
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        <FiCheckCircle className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        <FiXCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500">Description</p>
                                    <p className="text-sm text-gray-700">
                                        {selectedProduct.description || 'No description provided'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500">Category</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedProduct.category?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Price</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {formatCurrency(selectedProduct.price)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Stock</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedProduct.stock || 0} units
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Seller</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedProduct.seller?.business_name || selectedProduct.seller?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Added</p>
                                    <p className="text-sm text-gray-900">
                                        {new Date(selectedProduct.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>

                            {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 mb-2">Images</p>
                                    <div className="flex gap-2 overflow-x-auto">
                                        {selectedProduct.images.map((img, index) => (
                                            <div
                                                key={index}
                                                className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Product ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-start gap-3">
                                    <FiInfo className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">Review Required</p>
                                        <p className="text-xs text-yellow-600">
                                            Please review the product details and images before approval.
                                            Verify that the product complies with marketplace guidelines.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <p className="text-gray-500">Select a product to review</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Action Confirmation */}
            <ConfirmDialog
                isOpen={statusConfirm.open}
                onClose={() => setStatusConfirm({ open: false, action: 'approve' })}
                onConfirm={confirmStatusAction}
                title={statusConfirm.action === 'approve' ? 'Approve Product' : 'Reject Product'}
                message={statusConfirm.action === 'approve'
                    ? `Are you sure you want to approve "${selectedProduct?.name}"? It will become visible to customers.`
                    : `Are you sure you want to reject "${selectedProduct?.name}"? The seller will be notified.`
                }
                confirmText={statusConfirm.action === 'approve' ? 'Approve' : 'Reject'}
                confirmColor={statusConfirm.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            />
        </div>
    );
};

export default ApproveProduct;