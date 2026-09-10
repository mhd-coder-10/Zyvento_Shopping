
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//     FiArrowLeft, FiSave, FiRefreshCw,
// } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import ConfirmDialog from '../../../components/common/ConfirmDialog';

// const ProductEdit = () => {
//     const { productCode } = useParams();
//     const navigate = useNavigate();
//     const [product, setProduct] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [categories, setCategories] = useState([]);
//     const [sellers, setSellers] = useState([]);

//     // Form Data State
//     const [formData, setFormData] = useState({
//         product_name: '', description: '', price: '', mrp: '', discount_percent: '',
//         stock_quantity: '', sku: '', category_id: '', seller_id: '', brand: '',
//         images: [], status: 'pending', approval_status: 'pending', rejection_reason: ''
//     });

//     // Fetch Data on Mount
//     useEffect(() => {
//         fetchData();
//     }, [productCode]);

//     const fetchData = async () => {
//         try {
//             const [prodRes, catRes, sellerRes] = await Promise.all([
//                 ApiService.getProductByCode(productCode),
//                 ApiService.getProductCategories(),
//                 ApiService.getAllSellers({ limit: 100 }),
//             ]);

//             if (prodRes.data.success) {
//                 const data = prodRes.data.data || prodRes.data.product || prodRes.data;
//                 setProduct(data);

//                 setFormData({
//                     product_name: data.product_name || '',
//                     description: data.description || '',
//                     price: data.price || '',
//                     mrp: data.mrp || '',
//                     discount_percent: data.discount_percent || 0,
//                     stock_quantity: data.stock_quantity || '',
//                     sku: data.sku || '',
//                     category_id: data.category_id?._id || data.category_id || '',
//                     seller_id: data.seller_id?._id || data.seller_id || '',
//                     brand: data.brand || '',
//                     images: data.images || [],
//                     // Ensure approval_status is either 'pending' or 'approved'
//                     approval_status: data.approval_status || 'pending',
//                     // Ensure status is 'pending' if not approved
//                     status: data.approval_status === 'approved' ? (data.status || 'active') : 'pending',
//                     rejection_reason: data.rejection_reason || ''
//                 });
//             }

//             if (catRes.data.success) setCategories(catRes.data.data || []);
//             if (sellerRes.data.success) setSellers(sellerRes.data.data || []);

//         } catch (error) {
//             toast.error('Failed to load product data');
//             navigate('/admin/products');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handle Normal Input Changes
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     // Handle Submit / Save Changes
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSaving(true);
//         try {
//             let payload = { ...formData };

//             // LOGIC: Ensure only valid statuses are sent
//             if (payload.approval_status !== 'approved') {
//                 // Not approved -> Status MUST be pending
//                 payload.status = 'pending';
//             } else {
//                 // Approved -> Status must be one of the valid options (Active, Rejected, Suspended, Inactive)
//                 if (payload.status === 'pending' || payload.status === 'approved') {
//                     payload.status = 'active'; // Default fallback
//                 }
//             }

//             await ApiService.updateProduct(productCode, payload);
//             toast.success('Product updated successfully');
//             navigate(`/admin/products/${productCode}`);
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to update product');
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin text-blue-600 w-8 h-8" /></div>;
//     if (!product) return <div className="text-center py-12 text-gray-500">Product not found</div>;

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Edit Product"
//                 subtitle={`${product.product_name} (${product.product_code})`}
//                 actions={
//                     <button onClick={() => navigate(`/admin/products/${productCode}`)} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
//                         <FiArrowLeft className="w-4 h-4" /> Back to Details
//                     </button>
//                 }
//             />

//             <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">

//                 {/* ===== DYNAMIC STATUS MANAGEMENT ===== */}
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Status Management</h3>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
//                         {/* DROPDOWN 1: APPROVAL STATUS (Pending / Approved) */}
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">Approval Status</label>
//                             <select
//                                 name="approval_status"
//                                 value={formData.approval_status}
//                                 onChange={handleChange}
//                                 // LOCKED if approved (Admin cannot revert)
//                                 disabled={formData.approval_status === 'approved'}
//                                 className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
//                             >
//                                 <option value="pending">Pending</option>
//                                 <option value="approved">Approved</option>
//                             </select>
//                             {formData.approval_status === 'approved' ? (
//                                 <p className="text-xs text-green-600 mt-1">Approved. Status changes are now allowed below.</p>
//                             ) : (
//                                 <p className="text-xs text-gray-500 mt-1">Approve this product to enable status changes.</p>
//                             )}
//                         </div>

//                         {/* DROPDOWN 2: PRODUCT STATUS (Active, Rejected, etc.) - NO Pending/Approved */}
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">Product Status</label>
//                             <select
//                                 name="status"
//                                 value={formData.status}
//                                 onChange={handleChange}
//                                 // DISABLED if not approved yet
//                                 disabled={formData.approval_status !== 'approved'}
//                                 className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
//                             >
//                                 {/* These options only appear/act when approved */}
//                                 <option value="active">Active</option>
//                                 <option value="inactive">Inactive</option>
//                                 <option value="rejected">Rejected</option>
//                                 <option value="suspended">Suspended</option>
//                             </select>
//                             {formData.approval_status !== 'approved' && (
//                                 <p className="text-xs text-gray-500 mt-1">Approve the product first to change status.</p>
//                             )}
//                         </div>
//                     </div>

//                     {/* Dynamic Reason Field - appears if Rejected or Suspended */}
//                     {(formData.status === 'rejected' || formData.status === 'suspended') && (
//                         <div className="mt-4">
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">
//                                 {formData.status === 'rejected' ? 'Rejection' : 'Suspension'} Reason (Required)
//                             </label>
//                             <textarea
//                                 name="rejection_reason"
//                                 value={formData.rejection_reason}
//                                 onChange={handleChange}
//                                 rows={3}
//                                 className="w-full px-3 py-2 rounded-xl border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-sm resize-y"
//                                 placeholder={`Enter reason for ${formData.status} status...`}
//                             />
//                         </div>
//                     )}
//                 </div>

//                 {/* Standard Product Information Form */}
//                 <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Product Information</h3>
//                     {/* ... (Baaki Product Information Form ka code same hai, jaisa aapke paas hai) ... */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">Product Name *</label>
//                             <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm" />
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">Brand</label>
//                             <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm" />
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">SKU *</label>
//                             <input type="text" name="sku" value={formData.sku} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm" />
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
//                             <select name="category_id" value={formData.category_id} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm">
//                                 <option value="">Select Category</option>
//                                 {categories.map((cat) => (
//                                     <option key={cat._id} value={cat._id}>{cat.category_name}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">Seller</label>
//                             <select name="seller_id" value={formData.seller_id} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm">
//                                 <option value="">Select Seller</option>
//                                 {sellers.map((seller) => (
//                                     <option key={seller._id} value={seller._id}>{seller.business_name || seller.email}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">Price (₹) *</label>
//                             <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm" />
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">MRP (₹)</label>
//                             <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} min="0" className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm" />
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">Discount (%)</label>
//                             <input type="number" name="discount_percent" value={formData.discount_percent} onChange={handleChange} min="0" max="100" className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm" />
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 mb-1 block">Stock Quantity *</label>
//                             <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required min="0" className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm" />
//                         </div>
//                     </div>

//                     <div>
//                         <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
//                         <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm resize-y" />
//                     </div>

//                     <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
//                         <button type="button" onClick={() => navigate(`/admin/products/${productCode}`)} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
//                         <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
//                             <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default ProductEdit;







import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft, FiSave, FiRefreshCw,
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const ProductEdit = () => {
    const { productCode } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [sellers, setSellers] = useState([]);

    // Form Data State
    const [formData, setFormData] = useState({
        product_name: '', description: '', price: '', mrp: '', discount_percent: '',
        stock_quantity: '', sku: '', category_id: '', seller_id: '', brand: '',
        images: [], status: 'pending', approval_status: 'pending', rejection_reason: ''
    });

    // Fetch Data on Mount
    useEffect(() => {
        fetchData();
    }, [productCode]);

    const fetchData = async () => {
        try {
            const [prodRes, catRes, sellerRes] = await Promise.all([
                ApiService.getProductByCode(productCode),
                ApiService.getProductCategories(),
                ApiService.getAllSellers({ limit: 100 }),
            ]);

            if (prodRes.data.success) {
                const data = prodRes.data.data || prodRes.data.product || prodRes.data;
                setProduct(data);

                setFormData({
                    product_name: data.product_name || '',
                    description: data.description || '',
                    price: data.price || '',
                    mrp: data.mrp || '',
                    discount_percent: data.discount_percent || 0,
                    stock_quantity: data.stock_quantity || '',
                    sku: data.sku || '',
                    category_id: data.category_id?._id || data.category_id || '',
                    seller_id: data.seller_id?._id || data.seller_id || '',
                    brand: data.brand || '',
                    images: data.images || [],
                    approval_status: data.approval_status || 'pending',
                    status: data.approval_status === 'approved' ? (data.status || 'active') : 'pending',
                    rejection_reason: data.rejection_reason || ''
                });
            }

            if (catRes.data.success) setCategories(catRes.data.data || []);
            if (sellerRes.data.success) setSellers(sellerRes.data.data || []);

        } catch (error) {
            toast.error('Failed to load product data');
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    // Handle Normal Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Submit / Save Changes
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let payload = { ...formData };

            if (payload.approval_status !== 'approved') {
                payload.status = 'pending';
            } else {
                if (payload.status === 'pending' || payload.status === 'approved') {
                    payload.status = 'active';
                }
            }

            await ApiService.updateProduct(productCode, payload);
            toast.success('Product updated successfully');
            navigate(`/admin/products/${productCode}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin text-blue-600 w-8 h-8" /></div>;
    if (!product) return <div className="text-center py-12 text-gray-500">Product not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Edit Product"
                subtitle={`${product.product_name} (${product.product_code})`}
                actions={
                    <button onClick={() => navigate(`/admin/products/${productCode}`)} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                        <FiArrowLeft className="w-4 h-4" /> Back to Details
                    </button>
                }
            />

            <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">

                {/* Status Management */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Status Management</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Approval Status</label>
                            <select
                                name="approval_status"
                                value={formData.approval_status}
                                onChange={handleChange}
                                disabled={formData.approval_status === 'approved'}
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm !text-black !opacity-100 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                            </select>
                            {formData.approval_status === 'approved' ? (
                                <p className="text-xs text-green-600 mt-1">Approved. Status changes are now allowed below.</p>
                            ) : (
                                <p className="text-xs text-gray-500 mt-1">Approve this product to enable status changes.</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Product Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={formData.approval_status !== 'approved'}
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm !text-black !opacity-100 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="rejected">Rejected</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            {formData.approval_status !== 'approved' && (
                                <p className="text-xs text-gray-500 mt-1">Approve the product first to change status.</p>
                            )}
                        </div>
                    </div>

                    {(formData.status === 'rejected' || formData.status === 'suspended') && (
                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                {formData.status === 'rejected' ? 'Rejection' : 'Suspension'} Reason (Required)
                            </label>
                            <textarea
                                name="rejection_reason"
                                value={formData.rejection_reason}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 rounded-xl border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-sm resize-y !text-black !opacity-100"
                                placeholder={`Enter reason for ${formData.status} status...`}
                            />
                        </div>
                    )}
                </div>

                {/* Product Information Form */}
                <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Product Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Product Name *</label>
                            <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm !text-black !opacity-100 font-semibold" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Brand</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm !text-black !opacity-100" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">SKU *</label>
                            <input type="text" name="sku" value={formData.sku} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm !text-black !opacity-100" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
                            <select name="category_id" value={formData.category_id} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm !text-black !opacity-100">
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id} className="!text-black">{cat.category_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Seller</label>
                            <select name="seller_id" value={formData.seller_id} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm !text-black !opacity-100">
                                <option value="">Select Seller</option>
                                {sellers.map((seller) => (
                                    <option key={seller._id} value={seller._id} className="!text-black">{seller.business_name || seller.email}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Price (₹) *</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm !text-black !opacity-100 font-semibold" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">MRP (₹)</label>
                            <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} min="0" className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm !text-black !opacity-100" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Discount (%)</label>
                            <input type="number" name="discount_percent" value={formData.discount_percent} onChange={handleChange} min="0" max="100" className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm !text-black !opacity-100" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Stock Quantity *</label>
                            <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required min="0" className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm !text-black !opacity-100 font-semibold" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm resize-y !text-black !opacity-100" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => navigate(`/admin/products/${productCode}`)} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEdit;