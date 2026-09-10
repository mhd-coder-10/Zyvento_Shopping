
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FiSave, FiArrowLeft, FiRefreshCw, FiUpload, FiLink } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';

// const EditCategory = () => {
//     const navigate = useNavigate();
//     const { categoryCode } = useParams(); // Ab URL se categoryCode milega
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [formData, setFormData] = useState({
//         category_name: '', description: '', display_order: 0, status: 'active'
//     });
//     const [imageUrl, setImageUrl] = useState('');
//     const [imagePreview, setImagePreview] = useState('');

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const res = await ApiService.getCategoryByCode(categoryCode);
//                 if (res.data.success) {
//                     const data = res.data.data;
//                     setFormData({
//                         category_name: data.category_name || '',
//                         description: data.description || '',
//                         display_order: data.display_order || 0,
//                         status: data.status || 'active'
//                     });
//                     if (data.category_image) {
//                         setImageUrl(data.category_image);
//                         setImagePreview(data.category_image);
//                     }
//                 }
//             } catch (error) {
//                 toast.error('Failed to load category data');
//                 navigate('/admin/categories');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [categoryCode, navigate]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleImageUpload = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;
//         setImagePreview(URL.createObjectURL(file));
//         const fd = new FormData();
//         fd.append('image', file);
//         try {
//             const res = await ApiService.uploadCategoryImage(fd);
//             if (res.data.success) {
//                 setImageUrl(res.data.data.url);
//                 setFormData(prev => ({ ...prev, category_image: res.data.data.url }));
//                 toast.success('Image uploaded');
//             }
//         } catch (error) {
//             toast.error('Failed to upload image. Paste URL instead.');
//         }
//     };

//     const handleUrlChange = (e) => {
//         const url = e.target.value;
//         setImageUrl(url);
//         setImagePreview(url);
//         setFormData(prev => ({ ...prev, category_image: url }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSaving(true);
//         try {
//             await ApiService.updateCategory(categoryCode, formData);
//             toast.success('Category updated successfully. Products linked will also be updated.');
//             navigate('/admin/categories');
//         } catch (error) {
//             toast.error('Failed to update category');
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) {
//         return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Edit Category"
//                 subtitle={formData.category_name ? `Editing: ${formData.category_name}` : 'Category Edit'}
//                 actions={
//                     <button onClick={() => navigate('/admin/categories')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
//                         <FiArrowLeft /> Back
//                     </button>
//                 }
//             />

//             <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl border border-blue-100 shadow-sm !bg-white !opacity-100">
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-sm font-medium !text-gray-800">Category Name *</label>
//                             <input type="text" name="category_name" required value={formData.category_name} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" />
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium !text-gray-800">Display Order</label>
//                             <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" />
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium !text-gray-800">Status</label>
//                             <select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black bg-white">
//                                 <option value="active">Active</option>
//                                 <option value="inactive">Inactive</option>
//                             </select>
//                         </div>
//                         <div className="md:col-span-2">
//                             <label className="text-sm font-medium !text-gray-800">Description</label>
//                             <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" />
//                         </div>
//                     </div>

//                     <div className="flex gap-4">
//                         <div className="flex-1 border-2 border-dashed border-blue-200 rounded-xl p-4 text-center cursor-pointer">
//                             <FiUpload className="mx-auto !text-blue-600" />
//                             <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
//                             <p className="text-sm !text-gray-600">Upload Image</p>
//                         </div>
//                         <div className="flex-1">
//                             <input type="text" value={imageUrl} onChange={handleUrlChange} placeholder="Or Paste URL" className="w-full px-4 py-2 border rounded-xl !text-black" />
//                         </div>
//                     </div>
//                     {imagePreview && <img src={imagePreview} className="mt-3 w-24 h-24 object-cover rounded-lg border" />}

//                     <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 !text-white font-semibold rounded-xl shadow-md">
//                         <FiSave /> {saving ? 'Updating...' : 'Update Category'}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default EditCategory;


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft, FiRefreshCw, FiUpload, FiLink } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const EditCategory = () => {
    const navigate = useNavigate();
    const { categoryCode } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        category_name: '',
        description: '',
        display_order: 0,
        status: 'active'
    });
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await ApiService.getCategoryByCode(categoryCode);
                if (res.data.success) {
                    const data = res.data.data;
                    setFormData({
                        category_name: data.category_name || '',
                        description: data.description || '',
                        display_order: data.display_order || 0,
                        status: data.status || 'active'
                    });
                    if (data.category_image) {
                        setImageUrl(data.category_image);
                        setImagePreview(data.category_image);
                    }
                }
            } catch (error) {
                toast.error('Failed to load category data');
                navigate('/admin/categories');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [categoryCode, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImagePreview(URL.createObjectURL(file));
        const fd = new FormData();
        fd.append('image', file);
        try {
            const res = await ApiService.uploadCategoryImage(fd);
            if (res.data.success) {
                setImageUrl(res.data.data.url);
                setFormData(prev => ({ ...prev, category_image: res.data.data.url }));
                toast.success('Image uploaded');
            }
        } catch (error) {
            toast.error('Failed to upload image. Paste URL instead.');
        }
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setImageUrl(url);
        setImagePreview(url);
        setFormData(prev => ({ ...prev, category_image: url }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await ApiService.updateCategory(categoryCode, formData);
            toast.success('Category updated successfully. Products linked will also be updated.');
            navigate('/admin/categories');
        } catch (error) {
            toast.error('Failed to update category');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center">
                <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Edit Category"
                subtitle={formData.category_name ? `Editing: ${formData.category_name}` : 'Category Edit'}
                actions={
                    <button onClick={() => navigate('/admin/categories')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
                        <FiArrowLeft /> Back
                    </button>
                }
            />

            <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl border border-blue-100 shadow-sm !bg-white !opacity-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium !text-gray-800">Category Name *</label>
                            <input type="text" name="category_name" required value={formData.category_name} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium !text-gray-800">Display Order</label>
                            <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium !text-gray-800">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black bg-white">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium !text-gray-800">Description</label>
                            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 border-2 border-dashed border-blue-200 rounded-xl p-4 text-center cursor-pointer">
                            <FiUpload className="mx-auto !text-blue-600" />
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            <p className="text-sm !text-gray-600">Upload Image</p>
                        </div>
                        <div className="flex-1">
                            <input type="text" value={imageUrl} onChange={handleUrlChange} placeholder="Or Paste URL" className="w-full px-4 py-2 border rounded-xl !text-black" />
                        </div>
                    </div>
                    {imagePreview && <img src={imagePreview} className="mt-3 w-24 h-24 object-cover rounded-lg border" />}

                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 !text-white font-semibold rounded-xl shadow-md">
                        <FiSave /> {saving ? 'Updating...' : 'Update Category'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditCategory;