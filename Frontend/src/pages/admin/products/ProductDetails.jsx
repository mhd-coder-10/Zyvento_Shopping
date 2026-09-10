
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//     FiArrowLeft, FiEdit2, FiTrash2, FiRefreshCw, FiCheckCircle, FiXCircle,
//     FiClock, FiTrendingUp, FiShoppingBag, FiStar, FiPackage,
//     FiUser, FiFileText, FiAlertCircle,
// } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import ConfirmDialog from '../../../components/common/ConfirmDialog';

// const ProductDetails = () => {
//     const { productCode } = useParams(); // CHANGE: productCode instead of productId
//     const navigate = useNavigate();
//     const [product, setProduct] = useState(null);
//     const [reviews, setReviews] = useState([]);
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [deleteConfirm, setDeleteConfirm] = useState({ open: false });

//     useEffect(() => {
//         fetchProductDetails();
//     }, [productCode]);

//     // const fetchProductDetails = async () => {
//     //     setLoading(true);
//     //     try {
//     //         const [prodRes, reviewRes, orderRes] = await Promise.all([
//     //             ApiService.getProductByCode(productCode), // productCode
//     //             ApiService.getProductReviews(productCode, { page: 1, limit: 10 }),
//     //             ApiService.getProductOrders(productCode, { page: 1, limit: 10 }),
//     //         ]);
//     //         if (prodRes.data.success) setProduct(prodRes.data.data);
//     //         if (reviewRes.data.success) setReviews(reviewRes.data.data || []);
//     //         if (orderRes.data.success) setOrders(orderRes.data.data || []);
//     //     } catch (error) {
//     //         toast.error('Failed to load product details');
//     //         navigate('/admin/products');
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };

//     const fetchProductDetails = async () => {
//         setLoading(true);
//         try {
//             const prodRes = await ApiService.getProductByCode(productCode);
//             if (!prodRes.data.success) throw new Error(prodRes.data.message);
//             setProduct(prodRes.data.data);
//         } catch (error) {
//             console.error("Product details error:", error.response?.data || error.message);
//             toast.error('Failed to load product details');
//             navigate('/admin/products');
//             return;
//         }

//         try {
//             const reviewRes = await ApiService.getProductReviews(productCode, { page: 1, limit: 10 });
//             if (reviewRes.data.success) setReviews(reviewRes.data.data || []);
//         } catch (error) {
//             console.error("Reviews error:", error.response?.data || error.message);
//         }

//         try {
//             const orderRes = await ApiService.getProductOrders(productCode, { page: 1, limit: 10 });
//             if (orderRes.data.success) setOrders(orderRes.data.data || []);
//         } catch (error) {
//             console.error("Orders error:", error.response?.data || error.message);
//         }

//         setLoading(false);
//     };



//     const handleDelete = async () => {
//         try {
//             await ApiService.deleteProduct(productCode);
//             toast.success('Product deleted successfully');
//             navigate('/admin/products');
//         } catch (error) {
//             toast.error('Failed to delete product');
//         } finally {
//             setDeleteConfirm({ open: false });
//         }
//     };

//     const getStatusBadge = (status, approvalStatus) => {
//         if (approvalStatus === 'pending') {
//             return (
//                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-300">
//                     <FiClock className="w-3 h-3" /> Pending
//                 </span>
//             );
//         }
//         if (approvalStatus === 'rejected') {
//             return (
//                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-rose-50 text-rose-800 border-rose-300">
//                     <FiXCircle className="w-3 h-3" /> Rejected
//                 </span>
//             );
//         }
//         const config = {
//             active: { color: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: FiCheckCircle, label: 'Active' },
//             inactive: { color: 'bg-gray-50 text-gray-700 border border-gray-300', icon: FiXCircle, label: 'Inactive' },
//             suspended: { color: 'bg-orange-50 text-orange-800 border border-orange-300', icon: FiAlertCircle, label: 'Suspended' },
//         };
//         const { color, icon: Icon, label } = config[status] || config.inactive;
//         return (
//             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${color}`}>
//                 <Icon className="w-3 h-3" /> {label}
//             </span>
//         );
//     };

//     if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin text-blue-600 w-8 h-8" /></div>;
//     if (!product) return <div className="text-center py-12 text-gray-500">Product not found</div>;

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Product Details"
//                 subtitle={`${product.product_name} (${product.product_code})`}
//                 actions={
//                     <div className="flex items-center gap-2">
//                         <button onClick={() => navigate(`/admin/products/${productCode}/edit`)} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
//                             <FiEdit2 className="w-4 h-4" /> Edit
//                         </button>
//                         <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
//                             <FiArrowLeft className="w-4 h-4" /> Back to Products
//                         </button>
//                     </div>
//                 }
//             />

//             <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
//                         <div className="flex items-center gap-4">
//                             {product.images?.[0] ? (
//                                 <img src={product.images[0]} alt={product.product_name} className="w-24 h-24 rounded-2xl object-cover border border-gray-200 shadow-md" />
//                             ) : (
//                                 <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
//                                     {(product.product_name?.[0] || 'P').toUpperCase()}
//                                 </div>
//                             )}
//                             <div>
//                                 <div className="flex items-center gap-3">
//                                     <h2 className="text-2xl font-bold text-gray-900">{product.product_name}</h2>
//                                     {getStatusBadge(product.status, product.approval_status)}
//                                 </div>
//                                 <p className="text-gray-600 mt-1">{product.brand || 'N/A'}</p>
//                                 <p className="text-sm text-blue-600 font-semibold mt-1">Product Code: {product.product_code}</p>
//                                 <div className="flex items-center gap-4 mt-2">
//                                     <span className="flex items-center gap-1.5 text-sm text-gray-700">
//                                         <FiStar className="w-4 h-4 text-yellow-500" />
//                                         {product.stats?.average_rating?.toFixed(1) || '0.0'} Rating
//                                     </span>
//                                     <span className="flex items-center gap-1.5 text-sm text-gray-700">
//                                         <FiShoppingBag className="w-4 h-4 text-purple-500" />
//                                         {product.stats?.total_orders || 0} Orders
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                         <button onClick={() => setDeleteConfirm({ open: true })} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
//                             <FiTrash2 className="w-4 h-4" /> Delete
//                         </button>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
//                         <div className="flex items-center gap-3">
//                             <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><FiPackage className="w-5 h-5" /></div>
//                             <div>
//                                 <p className="text-xl font-bold text-gray-900">{product.stock_quantity || 0}</p>
//                                 <p className="text-xs text-gray-500">Stock</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
//                         <div className="flex items-center gap-3">
//                             <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600"><FiShoppingBag className="w-5 h-5" /></div>
//                             <div>
//                                 <p className="text-xl font-bold text-gray-900">{product.stats?.total_orders || 0}</p>
//                                 <p className="text-xs text-gray-500">Orders</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
//                         <div className="flex items-center gap-3">
//                             <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><FiTrendingUp className="w-5 h-5" /></div>
//                             <div>
//                                 <p className="text-xl font-bold text-gray-900">₹{product.final_price || product.price || 0}</p>
//                                 <p className="text-xs text-gray-500">Final Price</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
//                         <div className="flex items-center gap-3">
//                             <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600"><FiStar className="w-5 h-5" /></div>
//                             <div>
//                                 <p className="text-xl font-bold text-gray-900">{product.stats?.average_rating?.toFixed(1) || '0.0'}</p>
//                                 <p className="text-xs text-gray-500">Rating</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                         <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiFileText className="w-5 h-5 text-blue-600" /> Product Information</h3>
//                         <div className="space-y-3">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div><p className="text-xs text-gray-500">Product Name</p><p className="text-sm font-medium text-gray-900">{product.product_name}</p></div>
//                                 <div><p className="text-xs text-gray-500">Brand</p><p className="text-sm font-medium text-gray-900">{product.brand || 'N/A'}</p></div>
//                                 <div><p className="text-xs text-gray-500">SKU</p><p className="text-sm font-medium text-gray-900">{product.sku || 'N/A'}</p></div>
//                                 <div><p className="text-xs text-gray-500">Category</p><p className="text-sm font-medium text-gray-900">{product.category_id?.category_name || 'N/A'}</p></div>
//                                 <div><p className="text-xs text-gray-500">Price</p><p className="text-sm font-medium text-gray-900">₹{product.price}</p></div>
//                                 <div><p className="text-xs text-gray-500">MRP</p><p className="text-sm font-medium text-gray-900">₹{product.mrp || product.price}</p></div>
//                                 <div><p className="text-xs text-gray-500">Discount</p><p className="text-sm font-medium text-gray-900">{product.discount_percent || 0}%</p></div>
//                                 <div><p className="text-xs text-gray-500">Stock</p><p className="text-sm font-medium text-gray-900">{product.stock_quantity || 0}</p></div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                         <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiUser className="w-5 h-5 text-blue-600" /> Seller Information</h3>
//                         <div className="space-y-3">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
//                                     {(product.seller_id?.business_name?.[0] || 'S').toUpperCase()}
//                                 </div>
//                                 <div>
//                                     <p className="text-sm font-medium text-gray-900">{product.seller_id?.business_name || 'N/A'}</p>
//                                     <p className="text-xs text-gray-500">{product.seller_id?.owner_name || 'N/A'}</p>
//                                 </div>
//                             </div>
//                             <div><p className="text-xs text-gray-500">Seller Email</p><p className="text-sm font-medium text-gray-900">{product.seller_id?.email || 'N/A'}</p></div>
//                             <div><p className="text-xs text-gray-500">Seller Phone</p><p className="text-sm font-medium text-gray-900">{product.seller_id?.mobile_number || 'N/A'}</p></div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
//                     <p className="text-sm text-gray-600 whitespace-pre-line">{product.description || 'No description provided'}</p>
//                 </div>

//                 {product.images?.length > 0 && (
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                         <h3 className="font-semibold text-gray-900 mb-4">Product Images</h3>
//                         <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
//                             {product.images.map((img, idx) => (
//                                 <img key={idx} src={img} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
//                             ))}
//                         </div>
//                     </div>
//                 )}

//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <h3 className="font-semibold text-gray-900 mb-4">Recent Reviews</h3>
//                     {reviews.length > 0 ? (
//                         <div className="space-y-4">
//                             {reviews.map((review, idx) => (
//                                 <div key={idx} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
//                                     <div className="flex items-center gap-2 mb-2">
//                                         <span className="font-semibold text-gray-900 text-sm">{review.user_id?.first_name} {review.user_id?.last_name}</span>
//                                         <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString('en-IN')}</span>
//                                     </div>
//                                     <div className="flex items-center gap-1 mb-2">
//                                         {[...Array(5)].map((_, i) => (
//                                             <FiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} />
//                                         ))}
//                                     </div>
//                                     <p className="text-sm text-gray-600">{review.review || 'No review text'}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : <div className="text-center py-4 text-gray-500">No reviews found</div>}
//                 </div>

//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
//                     {orders.length > 0 ? (
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead>
//                                     <tr className="bg-gray-50 border-b border-gray-100">
//                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
//                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
//                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
//                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-50">
//                                     {orders.map((order, idx) => (
//                                         <tr key={idx}>
//                                             <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.order_number || `#${order._id?.slice(-6)}`}</td>
//                                             <td className="px-4 py-3 text-sm text-gray-700">{order.user_id?.first_name} {order.user_id?.last_name}</td>
//                                             <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
//                                             <td className="px-4 py-3">
//                                                 <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${order.order_status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
//                                                         order.order_status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
//                                                             'bg-gray-50 text-gray-700 border border-gray-200'
//                                                     }`}>
//                                                     {order.order_status}
//                                                 </span>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     ) : <div className="text-center py-4 text-gray-500">No orders found</div>}
//                 </div>
//             </div>

//             <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false })} onConfirm={handleDelete} title="Delete Product" message="Are you sure you want to delete this product? This action cannot be undone." confirmText="Delete" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
//         </div>
//     );
// };

// export default ProductDetails;



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft, FiEdit2, FiTrash2, FiRefreshCw, FiCheckCircle, FiXCircle,
    FiClock, FiTrendingUp, FiShoppingBag, FiStar, FiPackage,
    FiUser, FiFileText, FiAlertCircle,
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const ProductDetails = () => {
    const { productCode } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false });

    useEffect(() => {
        fetchProductDetails();
    }, [productCode]);

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const prodRes = await ApiService.getProductByCode(productCode);
            if (!prodRes.data.success) throw new Error(prodRes.data.message);
            setProduct(prodRes.data.data);
        } catch (error) {
            console.error("Product details error:", error.response?.data || error.message);
            toast.error('Failed to load product details');
            navigate('/admin/products');
            return;
        }

        try {
            const reviewRes = await ApiService.getProductReviews(productCode, { page: 1, limit: 10 });
            if (reviewRes.data.success) setReviews(reviewRes.data.data || []);
        } catch (error) {
            console.error("Reviews error:", error.response?.data || error.message);
        }

        try {
            const orderRes = await ApiService.getProductOrders(productCode, { page: 1, limit: 10 });
            if (orderRes.data.success) setOrders(orderRes.data.data || []);
        } catch (error) {
            console.error("Orders error:", error.response?.data || error.message);
        }

        setLoading(false);
    };

    const handleDelete = async () => {
        try {
            await ApiService.deleteProduct(productCode);
            toast.success('Product deleted successfully');
            navigate('/admin/products');
        } catch (error) {
            toast.error('Failed to delete product');
        } finally {
            setDeleteConfirm({ open: false });
        }
    };

    const getStatusBadge = (status, approvalStatus) => {
        if (approvalStatus === 'pending' || status === 'pending') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-300">
                    <FiClock className="w-3 h-3" /> Pending
                </span>
            );
        }
        if (approvalStatus === 'rejected' || status === 'rejected') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-rose-50 text-rose-800 border-rose-300">
                    <FiXCircle className="w-3 h-3" /> Rejected
                </span>
            );
        }
        if (status === 'suspended') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-orange-50 text-orange-800 border-orange-300">
                    <FiAlertCircle className="w-3 h-3" /> Suspended
                </span>
            );
        }
        if (status === 'inactive') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-gray-50 text-gray-700 border-gray-300">
                    <FiXCircle className="w-3 h-3" /> Inactive
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-300">
                <FiCheckCircle className="w-3 h-3" /> Active
            </span>
        );
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin text-blue-600 w-8 h-8" /></div>;
    if (!product) return <div className="text-center py-12 text-gray-500">Product not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Product Details"
                subtitle={`${product.product_name} (${product.product_code})`}
                actions={
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/products/${productCode}/edit`)} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                            <FiEdit2 className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                            <FiArrowLeft className="w-4 h-4" /> Back to Products
                        </button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">

                {/* ====== 1. PRODUCT INFO CARD ====== */}
                <div className="bg-white !bg-white !opacity-100 !filter-none !mix-blend-normal rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.product_name} className="w-24 h-24 rounded-2xl object-cover border border-gray-200 shadow-md" />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                                    {(product.product_name?.[0] || 'P').toUpperCase()}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold !text-black !opacity-100 !filter-none">{product.product_name}</h2>
                                    {getStatusBadge(product.status, product.approval_status)}
                                </div>
                                <p className="mt-1 !text-gray-800 !opacity-100 !filter-none">{product.brand || 'N/A'}</p>
                                <p className="text-sm font-semibold mt-1 !text-blue-600 !opacity-100 !filter-none">Product Code: {product.product_code}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1.5 text-sm !text-gray-800 !opacity-100 !filter-none">
                                        <FiStar className="w-4 h-4 text-yellow-500" />
                                        {product.stats?.average_rating?.toFixed(1) || '0.0'} Rating
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm !text-gray-800 !opacity-100 !filter-none">
                                        <FiShoppingBag className="w-4 h-4 text-purple-500" />
                                        {product.stats?.total_orders || 0} Orders
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setDeleteConfirm({ open: true })} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                            <FiTrash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>

                {/* ====== 2. STATS CARDS ====== */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white !bg-white !opacity-100 rounded-2xl border border-blue-100 shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><FiPackage className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xl font-bold !text-black !opacity-100">{product.stock_quantity || 0}</p>
                                <p className="text-xs !text-gray-700 !opacity-100">Stock</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white !bg-white !opacity-100 rounded-2xl border border-blue-100 shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600"><FiShoppingBag className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xl font-bold !text-black !opacity-100">{product.stats?.total_orders || 0}</p>
                                <p className="text-xs !text-gray-700 !opacity-100">Orders</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white !bg-white !opacity-100 rounded-2xl border border-blue-100 shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><FiTrendingUp className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xl font-bold !text-black !opacity-100">₹{product.final_price || product.price || 0}</p>
                                <p className="text-xs !text-gray-700 !opacity-100">Final Price</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white !bg-white !opacity-100 rounded-2xl border border-blue-100 shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600"><FiStar className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xl font-bold !text-black !opacity-100">{product.stats?.average_rating?.toFixed(1) || '0.0'}</p>
                                <p className="text-xs !text-gray-700 !opacity-100">Rating</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ====== 3. PRODUCT INFORMATION & SELLER INFO ====== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white !bg-white !opacity-100 rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black !opacity-100 mb-4 flex items-center gap-2"><FiFileText className="w-5 h-5 text-blue-600" /> Product Information</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs !text-gray-600 !opacity-100">Product Name</p><p className="text-sm font-medium !text-black !opacity-100">{product.product_name}</p></div>
                                <div><p className="text-xs !text-gray-600 !opacity-100">Brand</p><p className="text-sm font-medium !text-black !opacity-100">{product.brand || 'N/A'}</p></div>
                                <div><p className="text-xs !text-gray-600 !opacity-100">SKU</p><p className="text-sm font-medium !text-black !opacity-100">{product.sku || 'N/A'}</p></div>
                                <div><p className="text-xs !text-gray-600 !opacity-100">Category</p><p className="text-sm font-medium !text-black !opacity-100">{product.category_id?.category_name || 'N/A'}</p></div>
                                <div><p className="text-xs !text-gray-600 !opacity-100">Price</p><p className="text-sm font-medium !text-black !opacity-100">₹{product.price}</p></div>
                                <div><p className="text-xs !text-gray-600 !opacity-100">MRP</p><p className="text-sm font-medium !text-black !opacity-100">₹{product.mrp || product.price}</p></div>
                                <div><p className="text-xs !text-gray-600 !opacity-100">Discount</p><p className="text-sm font-medium !text-black !opacity-100">{product.discount_percent || 0}%</p></div>
                                <div><p className="text-xs !text-gray-600 !opacity-100">Stock</p><p className="text-sm font-medium !text-black !opacity-100">{product.stock_quantity || 0}</p></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white !bg-white !opacity-100 rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black !opacity-100 mb-4 flex items-center gap-2"><FiUser className="w-5 h-5 text-blue-600" /> Seller Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {(product.seller_id?.business_name?.[0] || 'S').toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium !text-black !opacity-100">{product.seller_id?.business_name || 'N/A'}</p>
                                    <p className="text-xs !text-gray-600 !opacity-100">{product.seller_id?.owner_name || 'N/A'}</p>
                                </div>
                            </div>
                            <div><p className="text-xs !text-gray-600 !opacity-100">Seller Email</p><p className="text-sm font-medium !text-black !opacity-100">{product.seller_id?.email || 'N/A'}</p></div>
                            <div><p className="text-xs !text-gray-600 !opacity-100">Seller Phone</p><p className="text-sm font-medium !text-black !opacity-100">{product.seller_id?.mobile_number || 'N/A'}</p></div>
                        </div>
                    </div>
                </div>

                {/* ====== 4. DESCRIPTION ====== */}
                <div className="bg-white !bg-white !opacity-100 rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="font-semibold !text-black !opacity-100 mb-3">Description</h3>
                    <p className="text-sm !text-gray-800 !opacity-100 whitespace-pre-line">{product.description || 'No description provided'}</p>
                </div>

                {/* ====== 5. PRODUCT IMAGES ====== */}
                {product.images?.length > 0 && (
                    <div className="bg-white !bg-white !opacity-100 rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black !opacity-100 mb-4">Product Images</h3>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {product.images.map((img, idx) => (
                                <img key={idx} src={img} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                            ))}
                        </div>
                    </div>
                )}

                {/* ====== 6. RECENT REVIEWS ====== */}
                <div className="bg-white !bg-white !opacity-100 rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="font-semibold !text-black !opacity-100 mb-4">Recent Reviews</h3>
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review, idx) => (
                                <div key={idx} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold !text-black !opacity-100 text-sm">{review.user_id?.first_name} {review.user_id?.last_name}</span>
                                        <span className="text-xs !text-gray-600 !opacity-100">{new Date(review.created_at).toLocaleDateString('en-IN')}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500' : '!text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <p className="text-sm !text-gray-800 !opacity-100">{review.review || 'No review text'}</p>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-center py-4 !text-gray-600 !opacity-100">No reviews found</div>}
                </div>

                {/* ====== 7. RECENT ORDERS ====== */}
                <div className="bg-white !bg-white !opacity-100 rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="font-semibold !text-black !opacity-100 mb-4">Recent Orders</h3>
                    {orders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-4 py-2 text-left text-xs font-semibold !text-gray-700 !opacity-100 uppercase">Order ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold !text-gray-700 !opacity-100 uppercase">Customer</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold !text-gray-700 !opacity-100 uppercase">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold !text-gray-700 !opacity-100 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.map((order, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 text-sm font-medium !text-black !opacity-100">{order.order_number || `#${order._id?.slice(-6)}`}</td>
                                            <td className="px-4 py-3 text-sm !text-gray-800 !opacity-100">{order.user_id?.first_name} {order.user_id?.last_name}</td>
                                            <td className="px-4 py-3 text-sm !text-gray-600 !opacity-100">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${
                                                    order.order_status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    order.order_status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                    'bg-gray-50 text-gray-700 border border-gray-200'
                                                }`}>
                                                    {order.order_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <div className="text-center py-4 !text-gray-600 !opacity-100">No orders found</div>}
                </div>

            </div>

            <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false })} onConfirm={handleDelete} title="Delete Product" message="Are you sure you want to delete this product? This action cannot be undone." confirmText="Delete" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
        </div>
    );
};

export default ProductDetails;