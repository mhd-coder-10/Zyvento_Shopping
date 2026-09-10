// Create new category with name, description, image and status
// Admin can create categories that will be used for product classification

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//     FiArrowLeft,
//     FiGrid,
//     FiTag,
//     FiInfo,
//     FiCheck,
//     FiX,
//     FiUpload,
// } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import LoadingSpinner from '../../../components/common/LoadingSpinner';

// const CreateCategory = () => {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         name: '',
//         description: '',
//         image: '',
//         status: 'active',
//     });
//     const [errors, setErrors] = useState({});
//     const [imagePreview, setImagePreview] = useState(null);

//     // Validate form fields
//     const validate = () => {
//         const newErrors = {};
//         if (!formData.name.trim()) {
//             newErrors.name = 'Category name is required';
//         } else if (formData.name.length < 2) {
//             newErrors.name = 'Category name must be at least 2 characters';
//         }
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//         if (errors[name]) {
//             setErrors((prev) => ({ ...prev, [name]: '' }));
//         }
//     };

//     const handleImageUpload = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         // File size validation (2MB max)
//         if (file.size > 2 * 1024 * 1024) {
//             toast.error('Image size must be less than 2MB');
//             return;
//         }

//         // File type validation
//         if (!file.type.startsWith('image/')) {
//             toast.error('Please upload an image file');
//             return;
//         }

//         const reader = new FileReader();
//         reader.onloadend = () => {
//             setImagePreview(reader.result);
//             // Base64 image will be sent to server
//             setFormData((prev) => ({ ...prev, image: reader.result }));
//         };
//         reader.readAsDataURL(file);
//     };

//     // Submit new category
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validate()) return;

//         setLoading(true);
//         try {
//             await ApiService.createCategory(formData);
//             toast.success('Category created successfully');
//             navigate('/admin/categories');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to create category');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return <LoadingSpinner fullPage text="Creating category..." />;
//     }

//     return (
//         <div>
//             <AdminTopbar
//                 title="Create Category"
//                 subtitle="Add a new product category"
//                 actions={
//                     <button
//                         onClick={() => navigate('/admin/categories')}
//                         className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
//                     >
//                         <FiArrowLeft className="w-4 h-4" />
//                         Back to Categories
//                     </button>
//                 }
//             />

//             <div className="max-w-2xl">
//                 <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
//                     {/* Info Box */}
//                     <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
//                         <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                         <div>
//                             <p className="text-sm font-medium text-blue-800">About Categories</p>
//                             <p className="text-xs text-blue-600">
//                                 Categories help organize products for better browsing.
//                                 Products will be assigned to these categories.
//                             </p>
//                         </div>
//                     </div>

//                     <div className="space-y-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Category Name <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={formData.name}
//                                 onChange={handleChange}
//                                 placeholder="e.g. Electronics"
//                                 className={`w-full px-3 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-200'
//                                     } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all`}
//                             />
//                             {errors.name && (
//                                 <p className="text-sm text-red-500 mt-1">{errors.name}</p>
//                             )}
//                             <p className="text-xs text-gray-400 mt-1">
//                                 This will be displayed in the category list
//                             </p>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Description
//                             </label>
//                             <textarea
//                                 name="description"
//                                 value={formData.description}
//                                 onChange={handleChange}
//                                 rows={3}
//                                 placeholder="Describe what products belong in this category..."
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Category Image
//                             </label>
//                             <div className="flex items-center gap-4">
//                                 <div className="flex-1">
//                                     <div className="relative">
//                                         <input
//                                             type="file"
//                                             accept="image/*"
//                                             onChange={handleImageUpload}
//                                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                                         />
//                                         <div className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition-colors">
//                                             <FiUpload className="w-5 h-5 text-gray-400" />
//                                             <span className="text-sm text-gray-500">
//                                                 Click to upload image
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 {imagePreview && (
//                                     <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
//                                         <img
//                                             src={imagePreview}
//                                             alt="Preview"
//                                             className="w-full h-full object-cover"
//                                         />
//                                     </div>
//                                 )}
//                             </div>
//                             <p className="text-xs text-gray-400 mt-1">
//                                 Recommended size: 200x200px (Max 2MB)
//                             </p>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Status
//                             </label>
//                             <select
//                                 name="status"
//                                 value={formData.status}
//                                 onChange={handleChange}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             >
//                                 <option value="active">Active</option>
//                                 <option value="inactive">Inactive</option>
//                                 <option value="archived">Archived</option>
//                             </select>
//                             <p className="text-xs text-gray-400 mt-1">
//                                 Inactive categories won't be visible to customers
//                             </p>
//                         </div>

//                         <div className="pt-6 border-t border-gray-200 flex items-center gap-3">
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
//                             >
//                                 <FiCheck className="w-4 h-4" />
//                                 Create Category
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={() => navigate('/admin/categories')}
//                                 className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
//                             >
//                                 <FiX className="w-4 h-4" />
//                                 Cancel
//                             </button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default CreateCategory;






    // import React, { useState } from 'react';
    // import { useNavigate } from 'react-router-dom';
    // import { toast } from 'react-toastify';
    // import { FiSave, FiArrowLeft, FiUpload, FiLink } from 'react-icons/fi';
    // import ApiService from '../../../api/ApiService';
    // import AdminTopbar from '../../../components/admin/AdminTopbar';

    // const CreateCategory = () => {
    //     const navigate = useNavigate();
    //     const [saving, setSaving] = useState(false);

    //     // Main Category Form State
    //     const [formData, setFormData] = useState({
    //         category_name: '',
    //         description: '',
    //         banner_image: '',
    //         display_order: 0,
    //         status: 'active',
    //         is_featured: false,
    //         commission_rate: 0,
    //         meta_title: '',
    //         meta_description: '',
    //         meta_keywords: ''
    //     });

    //     // Image States
    //     const [categoryImageUrl, setCategoryImageUrl] = useState('');
    //     const [categoryImagePreview, setCategoryImagePreview] = useState('');
    //     const [bannerImageUrl, setBannerImageUrl] = useState('');
    //     const [bannerImagePreview, setBannerImagePreview] = useState('');

    //     // Handle input changes
    //     const handleChange = (e) => {
    //         const { name, value, type, checked } = e.target;
    //         setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    //     };

    //     // Upload Category Image (Local File)
    //     const handleCategoryImageUpload = async (e) => {
    //         const file = e.target.files[0];
    //         if (!file) return;
    //         if (file.size > 2 * 1024 * 1024) return toast.error('Image size should be less than 2MB');

    //         setCategoryImagePreview(URL.createObjectURL(file));
    //         const formDataObj = new FormData();
    //         formDataObj.append('image', file);
    //         try {
    //             const res = await ApiService.uploadCategoryImage(formDataObj);
    //             if (res.data.success) {
    //                 setCategoryImageUrl(res.data.data.url);
    //                 setFormData(prev => ({ ...prev, category_image: res.data.data.url }));
    //                 toast.success('Category image uploaded successfully');
    //             }
    //         } catch (error) {
    //             toast.error('Failed to upload image. Please paste URL instead.');
    //         }
    //     };

    //     // Paste Category Image URL
    //     const handleCategoryImageUrlChange = (e) => {
    //         const url = e.target.value;
    //         setCategoryImageUrl(url);
    //         setCategoryImagePreview(url);
    //         setFormData(prev => ({ ...prev, category_image: url }));
    //     };

    //     // Upload Banner Image (Local File)
    //     const handleBannerImageUpload = async (e) => {
    //         const file = e.target.files[0];
    //         if (!file) return;
    //         if (file.size > 2 * 1024 * 1024) return toast.error('Banner image size should be less than 2MB');

    //         setBannerImagePreview(URL.createObjectURL(file));
    //         const formDataObj = new FormData();
    //         formDataObj.append('image', file);
    //         try {
    //             const res = await ApiService.uploadCategoryImage(formDataObj);
    //             if (res.data.success) {
    //                 setBannerImageUrl(res.data.data.url);
    //                 setFormData(prev => ({ ...prev, banner_image: res.data.data.url }));
    //                 toast.success('Banner image uploaded successfully');
    //             }
    //         } catch (error) {
    //             toast.error('Failed to upload banner image. Please paste URL instead.');
    //         }
    //     };

    //     // Paste Banner Image URL
    //     const handleBannerImageUrlChange = (e) => {
    //         const url = e.target.value;
    //         setBannerImageUrl(url);
    //         setBannerImagePreview(url);
    //         setFormData(prev => ({ ...prev, banner_image: url }));
    //     };

    //     // Submit Form
    //     const handleSubmit = async (e) => {
    //         e.preventDefault();
    //         setSaving(true);
    //         try {
    //             const payload = {
    //                 ...formData,
    //                 meta_keywords: formData.meta_keywords.split(',').map(k => k.trim()).filter(Boolean)
    //             };

    //             if (!payload.category_image) {
    //                 toast.error('Please upload a category image or paste a URL');
    //                 setSaving(false);
    //                 return;
    //             }

    //             await ApiService.createCategory(payload);
    //             toast.success('Main category created successfully');
    //             navigate('/admin/categories');
    //         } catch (error) {
    //             toast.error(error.response?.data?.message || 'Failed to create category');
    //         } finally {
    //             setSaving(false);
    //         }
    //     };

    //     return (
    //         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
    //             <AdminTopbar
    //                 title="Create Main Category"
    //                 subtitle="Add a new root category"
    //                 actions={
    //                     <button onClick={() => navigate('/admin/categories')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm !opacity-100">
    //                         <FiArrowLeft /> Back
    //                     </button>
    //                 }
    //             />

    //             <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl border border-blue-100 shadow-sm !bg-white !opacity-100 !filter-none">
    //                 <form onSubmit={handleSubmit} className="space-y-6">
    //                     <h3 className="text-lg font-bold !text-black !opacity-100">Basic Information</h3>
    //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //                         <div>
    //                             <label className="text-sm font-medium !text-gray-800 !opacity-100">Category Name *</label>
    //                             <input type="text" name="category_name" required value={formData.category_name} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none !text-black !opacity-100" />
    //                         </div>
    //                         <div>
    //                             <label className="text-sm font-medium !text-gray-800 !opacity-100">Display Order</label>
    //                             <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none !text-black !opacity-100" />
    //                         </div>
    //                         <div>
    //                             <label className="text-sm font-medium !text-gray-800 !opacity-100">Commission Rate (%)</label>
    //                             <input type="number" name="commission_rate" min="0" max="100" value={formData.commission_rate} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none !text-black !opacity-100" />
    //                         </div>
    //                         <div>
    //                             <label className="text-sm font-medium !text-gray-800 !opacity-100">Status</label>
    //                             <select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none !text-black !opacity-100 bg-white">
    //                                 <option value="active">Active</option>
    //                                 <option value="inactive">Inactive</option>
    //                             </select>
    //                         </div>
    //                         <div className="md:col-span-2">
    //                             <label className="text-sm font-medium !text-gray-800 !opacity-100">Description</label>
    //                             <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none !text-black !opacity-100" />
    //                         </div>
    //                     </div>

    //                     <h3 className="text-lg font-bold !text-black !opacity-100 pt-4 border-t">Images & SEO</h3>
    //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //                         <div className="md:col-span-2">
    //                             <label className="text-sm font-medium !text-gray-800 !opacity-100 mb-2 block">Category Image *</label>
    //                             <div className="flex flex-col md:flex-row gap-4">
    //                                 <div className="flex-1 border-2 border-dashed border-blue-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-blue-50 transition-all cursor-pointer relative">
    //                                     <FiUpload className="w-6 h-6 !text-blue-600 mb-2" />
    //                                     <p className="text-sm !text-gray-700 mb-1">Click to Upload</p>
    //                                     <p className="text-xs !text-gray-500">(Max 2MB)</p>
    //                                     <input type="file" accept="image/*" onChange={handleCategoryImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
    //                                 </div>
    //                                 <div className="flex-1 border rounded-xl p-4 bg-gray-50">
    //                                     <label className="flex items-center gap-2 text-sm font-medium !text-gray-700 mb-2"><FiLink className="!text-blue-600" /> Or Paste URL</label>
    //                                     <input type="text" value={categoryImageUrl} onChange={handleCategoryImageUrlChange} placeholder="https://..." className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none !text-black !opacity-100 bg-white" />
    //                                 </div>
    //                             </div>
    //                             {categoryImagePreview && <img src={categoryImagePreview} alt="Preview" className="mt-3 w-24 h-24 object-cover rounded-lg border" />}
    //                         </div>

    //                         <div className="md:col-span-2">
    //                             <label className="text-sm font-medium !text-gray-800 !opacity-100 mb-2 block">Banner Image (Optional)</label>
    //                             <div className="flex flex-col md:flex-row gap-4">
    //                                 <div className="flex-1 border-2 border-dashed border-purple-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-purple-50 transition-all cursor-pointer relative">
    //                                     <FiUpload className="w-6 h-6 !text-purple-600 mb-2" />
    //                                     <p className="text-sm !text-gray-700 mb-1">Click to Upload Banner</p>
    //                                     <p className="text-xs !text-gray-500">(Max 2MB)</p>
    //                                     <input type="file" accept="image/*" onChange={handleBannerImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
    //                                 </div>
    //                                 <div className="flex-1 border rounded-xl p-4 bg-gray-50">
    //                                     <label className="flex items-center gap-2 text-sm font-medium !text-gray-700 mb-2"><FiLink className="!text-purple-600" /> Or Paste URL</label>
    //                                     <input type="text" value={bannerImageUrl} onChange={handleBannerImageUrlChange} placeholder="https://..." className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none !text-black !opacity-100 bg-white" />
    //                                 </div>
    //                             </div>
    //                             {bannerImagePreview && <img src={bannerImagePreview} alt="Banner Preview" className="mt-3 w-48 h-20 object-cover rounded-lg border" />}
    //                         </div>

    //                         <div>
    //                             <label className="text-sm font-medium !text-gray-800 !opacity-100">Meta Title (SEO)</label>
    //                             <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none !text-black !opacity-100" />
    //                         </div>
    //                         <div>
    //                             <label className="text-sm font-medium !text-gray-800 !opacity-100">Meta Description</label>
    //                             <input type="text" name="meta_description" value={formData.meta_description} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none !text-black !opacity-100" />
    //                         </div>
    //                     </div>

    //                     <div className="flex items-center justify-between pt-6 border-t">
    //                         <label className="flex items-center gap-2 text-sm font-medium !text-gray-800 !opacity-100">
    //                             <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
    //                             Featured Category
    //                         </label>
    //                         <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 !text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 !opacity-100">
    //                             <FiSave /> {saving ? 'Creating...' : 'Create Category'}
    //                         </button>
    //                     </div>
    //                 </form>
    //             </div>
    //         </div>
    //     );
    // };

    // export default CreateCategory;




    import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft, FiUpload, FiLink } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const CreateCategory = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ category_name: '', description: '', display_order: 0, status: 'active' });
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImagePreview(URL.createObjectURL(file));
        const fd = new FormData(); fd.append('image', file);
        const res = await ApiService.uploadCategoryImage(fd);
        if (res.data.success) { setImageUrl(res.data.data.url); setFormData(prev => ({ ...prev, category_image: res.data.data.url })); }
    };
    
    const handleUrlChange = (e) => { const url = e.target.value; setImageUrl(url); setImagePreview(url); setFormData(prev => ({ ...prev, category_image: url })); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try { await ApiService.createCategory(formData); toast.success('Created'); navigate('/admin/categories'); }
        catch (error) { toast.error('Failed'); } finally { setSaving(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Create Category" actions={<button onClick={() => navigate('/admin/categories')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm"><FiArrowLeft /> Back</button>} />
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl border border-blue-100 shadow-sm !bg-white !opacity-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="text-lg font-bold !text-black">Basic Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium !text-gray-800">Category Name *</label><input type="text" name="category_name" required value={formData.category_name} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" /></div>
                        <div><label className="text-sm font-medium !text-gray-800">Display Order</label><input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" /></div>
                        <div><label className="text-sm font-medium !text-gray-800">Status</label><select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black bg-white"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                        <div className="md:col-span-2"><label className="text-sm font-medium !text-gray-800">Description</label><textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" /></div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 border-2 border-dashed border-blue-200 rounded-xl p-4 text-center"><FiUpload className="mx-auto !text-blue-600" /><input type="file" onChange={handleUpload} className="hidden" /><p>Upload Image</p></div>
                        <div className="flex-1"><input type="text" value={imageUrl} onChange={handleUrlChange} placeholder="Or Paste URL" className="w-full px-4 py-2 border rounded-xl !text-black" /></div>
                    </div>
                    {imagePreview && <img src={imagePreview} className="mt-3 w-24 h-24 object-cover rounded-lg border" />}
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 !text-white font-semibold rounded-xl shadow-md"><FiSave /> {saving ? 'Creating...' : 'Create'}</button>
                </form>
            </div>
        </div>
    );
};
export default CreateCategory;