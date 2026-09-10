// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FiArrowLeft, FiEdit2, FiBox, FiPackage, FiRefreshCw, FiGrid } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';

// const SubCategoryDetails = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [subCategory, setSubCategory] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const res = await ApiService.getSubCategoryById(id);
//                 if (res.data.success) setSubCategory(res.data.data);
//             } catch (error) {
//                 toast.error('Failed to load sub-category details');
//                 navigate('/admin/sub-categories');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [id, navigate]);

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center">
//                 <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
//             </div>
//         );
//     }
//     if (!subCategory) return <div className="text-center py-12 !text-gray-600">Sub-category not found</div>;

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Sub-Category Details"
//                 subtitle={subCategory.sub_category_name}
//                 actions={
//                     <div className="flex gap-2">
//                         <button onClick={() => navigate(`/admin/sub-categories/${id}/edit`)} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
//                             <FiEdit2 /> Edit
//                         </button>
//                         <button onClick={() => navigate('/admin/sub-categories')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
//                             <FiArrowLeft /> Back
//                         </button>
//                     </div>
//                 }
//             />

//             <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
//                 {/* Header */}
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 !bg-white !opacity-100">
//                     <div className="flex items-center gap-4">
//                         {subCategory.sub_category_image ? (
//                             <img src={subCategory.sub_category_image} className="w-24 h-24 rounded-2xl object-cover border" />
//                         ) : (
//                             <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center !text-white text-4xl font-bold">
//                                 {(subCategory.sub_category_name?.[0] || 'S').toUpperCase()}
//                             </div>
//                         )}
//                         <div>
//                             <h2 className="text-2xl font-bold !text-black !opacity-100">{subCategory.sub_category_name}</h2>
//                             <p className="text-sm font-semibold !text-blue-600 mt-1">Main Category: {subCategory.category_id?.category_name || 'N/A'}</p>
//                             <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${subCategory.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{subCategory.status}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Stats (if any) - You can extend these based on backend response */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <div className="flex items-center gap-3">
//                             <div className="p-2.5 bg-blue-50 rounded-xl !text-blue-600"><FiBox /></div>
//                             <div><p className="text-xl font-bold !text-black">{subCategory.display_order}</p><p className="text-xs !text-gray-700">Display Order</p></div>
//                         </div>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <div className="flex items-center gap-3">
//                             <div className="p-2.5 bg-purple-50 rounded-xl !text-purple-600"><FiGrid /></div>
//                             <div><p className="text-xl font-bold !text-black">{subCategory.category_id?.category_name || 'N/A'}</p><p className="text-xs !text-gray-700">Main Category</p></div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Description */}
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 !bg-white !opacity-100">
//                     <h3 className="font-semibold !text-black mb-2">Description</h3>
//                     <p className="text-sm !text-gray-800">{subCategory.description || 'No description provided'}</p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SubCategoryDetails;  



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiEdit2, FiPackage, FiGrid, FiRefreshCw } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const SubCategoryDetails = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [subCategory, setSubCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await ApiService.getSubCategoryByCode(code);
                if (res.data.success) setSubCategory(res.data.data);
            } catch (error) { toast.error('Failed to load'); navigate('/admin/sub-categories'); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [code, navigate]);

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-purple-600 w-8 h-8" /></div>;
    if (!subCategory) return <div className="text-center py-12 !text-gray-600">Sub-Category not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Sub-Category Details" subtitle={subCategory.sub_category_name}
                actions={<div className="flex gap-2">
                    <button onClick={() => navigate(`/admin/sub-categories/${code}/edit`)} className="flex items-center gap-2 px-4 py-2 border border-purple-200 !text-purple-600 rounded-xl bg-white shadow-sm"><FiEdit2 /> Edit</button>
                    <button onClick={() => navigate('/admin/sub-categories')} className="flex items-center gap-2 px-4 py-2 border border-purple-200 !text-purple-600 rounded-xl bg-white shadow-sm"><FiArrowLeft /> Back</button>
                </div>} />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 !bg-white !opacity-100">
                    <div className="flex items-center gap-4">
                        {subCategory.sub_category_image ? <img src={subCategory.sub_category_image} className="w-24 h-24 rounded-2xl object-cover border" /> : <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center !text-white text-4xl font-bold">{(subCategory.sub_category_name?.[0] || 'S').toUpperCase()}</div>}
                        <div>
                            <h2 className="text-2xl font-bold !text-black !opacity-100">{subCategory.sub_category_name}</h2>
                            <p className="text-sm font-semibold !text-purple-600 mt-1">Code: {subCategory.sub_category_code}</p>
                            <p className="text-sm !text-gray-700">Main Category: {subCategory.category_id?.category_name || 'N/A'}</p>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${subCategory.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{subCategory.status}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 !bg-white !opacity-100">
                        <div className="flex items-center gap-3"><div className="p-2.5 bg-purple-50 rounded-xl !text-purple-600"><FiPackage /></div><div><p className="text-xl font-bold !text-black">{subCategory.product_count}</p><p className="text-xs !text-gray-700">Products</p></div></div>
                    </div>
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 !bg-white !opacity-100">
                        <div className="flex items-center gap-3"><div className="p-2.5 bg-blue-50 rounded-xl !text-blue-600"><FiGrid /></div><div><p className="text-xl font-bold !text-black">{subCategory.category_id?.category_name || 'N/A'}</p><p className="text-xs !text-gray-700">Main Category</p></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SubCategoryDetails;