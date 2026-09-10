
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave, FiX, FiUpload } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const CreateProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        product_name: '', description: '', price: '', mrp: '', discount_percent: 0,
        stock_quantity: '', sku: '', category_id: '', seller_id: '', brand: '',
        status: 'pending', approval_status: 'pending',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchFormData();
    }, []);

    const fetchFormData = async () => {
        try {
            const [catRes, sellerRes] = await Promise.all([
                ApiService.getProductCategories(),
                ApiService.getAllSellers({ limit: 100 }),
            ]);
            if (catRes.data.success) setCategories(catRes.data.data || []);
            if (sellerRes.data.success) setSellers(sellerRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load form data');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 10) {
            toast.error('Maximum 10 images allowed');
            return;
        }
        const formDataObj = new FormData();
        files.forEach((file) => formDataObj.append('images', file));
        try {
            const response = await ApiService.uploadProductImages(formDataObj);
            if (response.data.success) {
                setImages(prev => [...prev, ...response.data.data]);
                toast.success('Images uploaded successfully');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload images');
        }
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.product_name.trim()) newErrors.product_name = 'Product name is required';
        if (!formData.price) newErrors.price = 'Price is required';
        if (!formData.stock_quantity) newErrors.stock_quantity = 'Stock quantity is required';
        if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
        if (!formData.category_id) newErrors.category_id = 'Category is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await ApiService.createProduct({ ...formData, images });
            toast.success('Product created successfully');
            navigate('/admin/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Create Product"
                subtitle="Add a new product"
                actions={
                    <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                        <FiArrowLeft className="w-4 h-4" /> Back to Products
                    </button>
                }
            />

            <div className="max-w-5xl mx-auto p-4 md:p-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Product Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Product Name *</label>
                            <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${errors.product_name ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm`} placeholder="e.g. Wooden Table" />
                            {errors.product_name && <p className="text-sm text-red-500 mt-1">{errors.product_name}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Brand</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm" placeholder="e.g. UrbanWood" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">SKU *</label>
                            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${errors.sku ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm`} placeholder="e.g. WT-001" />
                            {errors.sku && <p className="text-sm text-red-500 mt-1">{errors.sku}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
                            <select name="category_id" value={formData.category_id} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${errors.category_id ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm`}>
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.category_name}</option>
                                ))}
                            </select>
                            {errors.category_id && <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Seller</label>
                            <select name="seller_id" value={formData.seller_id} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm">
                                <option value="">Select Seller</option>
                                {sellers.map((seller) => (
                                    <option key={seller._id} value={seller._id}>{seller.business_name || seller.email}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Price (₹) *</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm`} placeholder="1999" />
                            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">MRP (₹)</label>
                            <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm" placeholder="2499" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Discount (%)</label>
                            <input type="number" name="discount_percent" value={formData.discount_percent} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm" placeholder="20" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Stock Quantity *</label>
                            <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className={`w-full px-3 py-2 rounded-xl border ${errors.stock_quantity ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm`} placeholder="100" />
                            {errors.stock_quantity && <p className="text-sm text-red-500 mt-1">{errors.stock_quantity}</p>}
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="mt-6">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Product Images (Max 10)</label>
                        <div className="flex flex-wrap gap-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative">
                                    <img src={img} alt={`Product ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                                    <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {images.length < 10 && (
                                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                    <FiUpload className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Supported: JPG, PNG, WebP. Max 10 images.</p>
                    </div>

                    <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm resize-y" placeholder="Product description..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                            <FiSave className="w-4 h-4" /> {submitting ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;
