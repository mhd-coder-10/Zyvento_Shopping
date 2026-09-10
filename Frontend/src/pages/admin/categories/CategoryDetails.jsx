
// import React, { useState, useEffect } from 'react';

// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FiArrowLeft, FiEdit2, FiPackage, FiShoppingBag, FiClock, FiGrid, FiRefreshCw } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';

// const CategoryDetails = () => {
//     const { category_code } = useParams();
//     const navigate = useNavigate();
//     const [category, setCategory] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const res = await ApiService.getCategoryByCode(category_code);
//                 if (res.data.success) setCategory(res.data.data);
//             } catch (error) { toast.error('Failed to load'); navigate('/admin/categories'); }
//             finally { setLoading(false); }
//         };
//         fetchData();
//     }, [category_code]);

//     if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
//     if (!category) return <div className="text-center py-12 !text-gray-600">Category not found</div>;

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar title="Category Details" subtitle={category.category_name} 
//                 actions={<div className="flex gap-2">
//                     <button onClick={() => navigate(`/admin/categories/${category_code}/edit`)} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm"><FiEdit2 /> Edit</button>
//                     <button onClick={() => navigate('/admin/categories')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm"><FiArrowLeft /> Back</button>
//                 </div>} />
            
//             <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
//                 {/* Header Card */}
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 !bg-white !opacity-100">
//                     <div className="flex items-center gap-4">
//                         {category.category_image ? <img src={category.category_image} className="w-24 h-24 rounded-2xl object-cover border" /> : <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center !text-white text-4xl font-bold">{(category.category_name?.[0] || 'C').toUpperCase()}</div>}
//                         <div>
//                             <h2 className="text-2xl font-bold !text-black !opacity-100">{category.category_name}</h2>
//                             <p className="text-sm font-semibold !text-blue-600 mt-1">Code: {category.category_code}</p>
//                             <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${category.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{category.status}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Stats Grid - Products, Orders, Recent Orders, Sub-Cats */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <div className="flex items-center gap-3"><div className="p-2.5 bg-blue-50 rounded-xl !text-blue-600"><FiPackage /></div><div><p className="text-xl font-bold !text-black">{category.total_products}</p><p className="text-xs !text-gray-700">Products</p></div></div>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <div className="flex items-center gap-3"><div className="p-2.5 bg-purple-50 rounded-xl !text-purple-600"><FiShoppingBag /></div><div><p className="text-xl font-bold !text-black">{category.total_orders}</p><p className="text-xs !text-gray-700">Total Orders</p></div></div>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <div className="flex items-center gap-3"><div className="p-2.5 bg-yellow-50 rounded-xl !text-yellow-600"><FiClock /></div><div><p className="text-xl font-bold !text-black">{category.recent_orders}</p><p className="text-xs !text-gray-700">Recent (30d)</p></div></div>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <div className="flex items-center gap-3"><div className="p-2.5 bg-emerald-50 rounded-xl !text-emerald-600"><FiGrid /></div><div><p className="text-xl font-bold !text-black">{category.sub_category_count}</p><p className="text-xs !text-gray-700">Sub-Categories</p></div></div>
//                     </div>
//                 </div>

//                 {/* Description */}
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 !bg-white !opacity-100">
//                     <h3 className="font-semibold !text-black mb-2">Description</h3>
//                     <p className="text-sm !text-gray-800">{category.description || 'No description provided'}</p>
//                 </div>
//             </div>
//         </div>
//     );
// };
// export default CategoryDetails;







import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiEdit2, FiPackage, FiShoppingBag, FiClock, FiGrid, FiRefreshCw } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const CategoryDetails = () => {
    const { categoryCode } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await ApiService.getCategoryByCode(categoryCode);
                if (res.data.success) setCategory(res.data.data);
            } catch (error) {
                toast.error('Failed to load category details');
                navigate('/admin/categories');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [categoryCode, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center">
                <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
            </div>
        );
    }
    if (!category) return <div className="text-center py-12 !text-gray-600">Category not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Category Details"
                subtitle={category.category_name}
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => navigate(`/admin/categories/${categoryCode}/edit`)} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
                            <FiEdit2 /> Edit
                        </button>
                        <button onClick={() => navigate('/admin/categories')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
                            <FiArrowLeft /> Back
                        </button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 !bg-white !opacity-100">
                    <div className="flex items-center gap-4">
                        {category.category_image ? (
                            <img src={category.category_image} className="w-24 h-24 rounded-2xl object-cover border" />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center !text-white text-4xl font-bold">
                                {(category.category_name?.[0] || 'C').toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold !text-black !opacity-100">{category.category_name}</h2>
                            <p className="text-sm font-semibold !text-blue-600 mt-1">Code: {category.category_code}</p>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${category.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{category.status}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-xl !text-blue-600"><FiPackage /></div>
                            <div><p className="text-xl font-bold !text-black">{category.total_products}</p><p className="text-xs !text-gray-700">Products</p></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 rounded-xl !text-purple-600"><FiShoppingBag /></div>
                            <div><p className="text-xl font-bold !text-black">{category.total_orders}</p><p className="text-xs !text-gray-700">Total Orders</p></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-yellow-50 rounded-xl !text-yellow-600"><FiClock /></div>
                            <div><p className="text-xl font-bold !text-black">{category.recent_orders}</p><p className="text-xs !text-gray-700">Recent (30d)</p></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 rounded-xl !text-emerald-600"><FiGrid /></div>
                            <div><p className="text-xl font-bold !text-black">{category.sub_category_count}</p><p className="text-xs !text-gray-700">Sub-Categories</p></div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 !bg-white !opacity-100">
                    <h3 className="font-semibold !text-black mb-2">Description</h3>
                    <p className="text-sm !text-gray-800">{category.description || 'No description provided'}</p>
                </div>
            </div>
        </div>
    );
};

export default CategoryDetails;