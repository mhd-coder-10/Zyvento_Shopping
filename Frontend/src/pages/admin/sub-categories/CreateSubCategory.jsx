// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FiSave, FiArrowLeft, FiUpload, FiLink } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';

// const CreateSubCategory = () => {
//     const navigate = useNavigate();
//     const [categories, setCategories] = useState([]);
//     const [saving, setSaving] = useState(false);
//     const [formData, setFormData] = useState({
//         sub_category_name: '',
//         category_id: '',
//         description: '',
//         display_order: 0,
//         status: 'active'
//     });
//     const [imageUrl, setImageUrl] = useState('');
//     const [imagePreview, setImagePreview] = useState('');

//     useEffect(() => {
//         // Fetch main categories for dropdown
//         const loadCategories = async () => {
//             try {
//                 const res = await ApiService.getAllCategories({ limit: 100 });
//                 if (res.data.success) setCategories(res.data.data || []);
//             } catch (error) {
//                 console.error('Failed to load categories:', error);
//             }
//         };
//         loadCategories();
//     }, []);

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
//                 setFormData(prev => ({ ...prev, sub_category_image: res.data.data.url }));
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
//         setFormData(prev => ({ ...prev, sub_category_image: url }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSaving(true);
//         try {
//             await ApiService.createSubCategory(formData);
//             toast.success('Sub-category created successfully');
//             navigate('/admin/sub-categories');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to create');
//         } finally {
//             setSaving(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Create Sub-Category"
//                 subtitle="Add a new sub-category under a main category"
//                 actions={
//                     <button onClick={() => navigate('/admin/sub-categories')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
//                         <FiArrowLeft /> Back
//                     </button>
//                 }
//             />

//             <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl border border-blue-100 shadow-sm !bg-white !opacity-100">
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-sm font-medium !text-gray-800">Sub-Category Name *</label>
//                             <input type="text" name="sub_category_name" required value={formData.sub_category_name} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" />
//                         </div>
//                         <div>
//                             <label className="text-sm font-medium !text-gray-800">Main Category *</label>
//                             <select name="category_id" required value={formData.category_id} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black bg-white">
//                                 <option value="">Select Main Category</option>
//                                 {categories.map((cat) => (
//                                     <option key={cat._id} value={cat._id}>{cat.category_name}</option>
//                                 ))}
//                             </select>
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
//                         <FiSave /> {saving ? 'Creating...' : 'Create Sub-Category'}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default CreateSubCategory;




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft, FiUpload, FiLink } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const CreateSubCategory = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        sub_category_name: '', category_id: '', description: '', display_order: 0, status: 'active'
    });
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        const loadCats = async () => {
            try {
                const res = await ApiService.getAllCategories({ limit: 100 });
                if (res.data.success) setCategories(res.data.data || []);
            } catch (error) { console.error('Failed to load categories'); }
        };
        loadCats();
    }, []);

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImagePreview(URL.createObjectURL(file));
        const fd = new FormData(); fd.append('image', file);
        try {
            const res = await ApiService.uploadCategoryImage(fd);
            if (res.data.success) { setImageUrl(res.data.data.url); setFormData(prev => ({ ...prev, sub_category_image: res.data.data.url })); }
        } catch (error) { toast.error('Upload failed. Paste URL instead.'); }
    };

    const handleUrlChange = (e) => { const url = e.target.value; setImageUrl(url); setImagePreview(url); setFormData(prev => ({ ...prev, sub_category_image: url })); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (!formData.category_id) { toast.error('Please select a Main Category'); setSaving(false); return; }
            await ApiService.createSubCategory(formData); toast.success('Sub-Category created'); navigate('/admin/sub-categories');
        } catch (error) { toast.error('Failed to create'); } finally { setSaving(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Create Sub-Category" actions={<button onClick={() => navigate('/admin/sub-categories')} className="flex items-center gap-2 px-4 py-2 border border-purple-200 !text-purple-600 rounded-xl bg-white shadow-sm"><FiArrowLeft /> Back</button>} />
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl border border-purple-100 shadow-sm !bg-white !opacity-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium !text-gray-800">Sub-Category Name *</label>
                            <input type="text" name="sub_category_name" required value={formData.sub_category_name} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium !text-gray-800">Main Category *</label>
                            <select name="category_id" required value={formData.category_id} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black bg-white">
                                <option value="">Select Main Category</option>
                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.category_name}</option>)}
                            </select>
                        </div>
                        <div><label className="text-sm font-medium !text-gray-800">Display Order</label><input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" /></div>
                        <div><label className="text-sm font-medium !text-gray-800">Status</label><select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black bg-white"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                        <div className="md:col-span-2"><label className="text-sm font-medium !text-gray-800">Description</label><textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" /></div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-1 border-2 border-dashed border-purple-200 rounded-xl p-4 text-center cursor-pointer"><FiUpload className="mx-auto !text-purple-600" /><input type="file" onChange={handleUpload} className="hidden" /><p className="text-sm !text-gray-600">Upload Image</p></div>
                        <div className="flex-1"><input type="text" value={imageUrl} onChange={handleUrlChange} placeholder="Or Paste URL" className="w-full px-4 py-2 border rounded-xl !text-black" /></div>
                    </div>
                    {imagePreview && <img src={imagePreview} className="mt-3 w-24 h-24 object-cover rounded-lg border" />}

                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 !text-white font-semibold rounded-xl shadow-md"><FiSave /> {saving ? 'Creating...' : 'Create Sub-Category'}</button>
                </form>
            </div>
        </div>
    );
};
export default CreateSubCategory;