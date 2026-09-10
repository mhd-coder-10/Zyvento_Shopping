
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiGrid, FiEye, FiShoppingBag } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import ConfirmDialog from '../../../components/common/ConfirmDialog';

// const Categories = () => {
//     const navigate = useNavigate();
//     const [categories, setCategories] = useState([]);
//     const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState('');
//     const [deleteConfirm, setDeleteConfirm] = useState({ open: false, code: null });

//     const fetchData = useCallback(async () => {
//         setLoading(true);
//         try {
//             const res = await ApiService.getAllCategories({ search });
//             if (res.data.success) {
//                 setCategories(res.data.data || []);
//                 setStats(res.data.stats || { total: 0, active: 0, inactive: 0 });
//             }
//         } catch (error) {
//             toast.error('Failed to load categories');
//         } finally {
//             setLoading(false);
//         }
//     }, [search]);

//     useEffect(() => { fetchData(); }, [fetchData]);

//     const handleDelete = async () => {
//         if (!deleteConfirm.code) return;
//         try {
//             await ApiService.deleteCategory(deleteConfirm.code);
//             toast.success('Category deleted');
//             fetchData();
//         } catch (error) {
//             toast.error('Failed to delete');
//         } finally {
//             setDeleteConfirm({ open: false, code: null });
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Category Management"
//                 subtitle="Manage root categories"
//                 actions={
//                     <button
//                         onClick={() => navigate('/admin/categories/create')}
//                         className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 !text-white font-semibold rounded-xl shadow-md hover:shadow-lg"
//                     >
//                         <FiPlus /> Add Category
//                     </button>
//                 }
//             />

//             <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
//                 {/* Stats Cards */}
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <p className="text-2xl font-bold !text-black">{stats.total}</p>
//                         <p className="text-xs !text-gray-700">Total Categories</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <p className="text-2xl font-bold !text-emerald-600">{stats.active}</p>
//                         <p className="text-xs !text-gray-700">Active</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <p className="text-2xl font-bold !text-gray-500">{stats.inactive}</p>
//                         <p className="text-xs !text-gray-700">Inactive</p>
//                     </div>
//                 </div>

//                 {/* Search */}
//                 <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm relative">
//                     <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 !text-gray-400" />
//                     <input
//                         type="text"
//                         placeholder="Search by name or code..."
//                         className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black"
//                         onChange={(e) => setSearch(e.target.value)}
//                     />
//                 </div>

//                 {/* Desktop Table (hidden on mobile) */}
//                 <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
//                     {loading ? (
//                         <div className="p-10 text-center">Loading...</div>
//                     ) : (
//                         <table className="w-full">
//                             <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
//                                 <tr>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Category</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Code</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Products</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Orders</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Sub-Cats</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Status</th>
//                                     <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {categories.map((cat) => (
//                                     <tr
//                                         key={cat._id}
//                                         className="hover:bg-blue-50/30 cursor-pointer"
//                                         onClick={() => navigate(`/admin/categories/${cat.category_code}`)}
//                                     >
//                                         <td className="px-4 py-3">
//                                             <div className="flex items-center gap-3">
//                                                 {cat.category_image ? (
//                                                     <img src={cat.category_image} className="w-10 h-10 rounded-lg object-cover" />
//                                                 ) : (
//                                                     <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FiGrid /></div>
//                                                 )}
//                                                 <p className="font-semibold !text-black">{cat.category_name}</p>
//                                             </div>
//                                         </td>
//                                         <td className="px-4 py-3 text-sm font-bold !text-left !text-blue-600">{cat.category_code}</td>
//                                         <td className="px-4 py-3 text-sm !text-gray-800">{cat.product_count}</td>
//                                         <td className="px-4 py-3 text-sm !text-gray-800">{cat.order_count}</td>
//                                         <td className="px-4 py-3 text-sm !text-gray-800">{cat.sub_category_count}</td>
//                                         <td className="px-4 py-3">
//                                             <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${cat.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{cat.status}</span>
//                                         </td>
//                                         <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
//                                             <button onClick={() => navigate(`/admin/categories/${cat.category_code}`)} className="p-1.5 hover:bg-blue-50 !text-blue-600"><FiEye /></button>
//                                             <button onClick={() => navigate(`/admin/categories/${cat.category_code}/edit`)} className="p-1.5 hover:bg-blue-50 !text-blue-600"><FiEdit2 /></button>
//                                             <button onClick={() => setDeleteConfirm({ open: true, code: cat.category_code })} className="p-1.5 hover:bg-rose-50 !text-rose-600"><FiTrash2 /></button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     )}
//                 </div>

//                 {/* Mobile Cards (Visible on small screens) */}
//                 <div className="md:hidden space-y-4">
//                     {loading ? (
//                         <div className="p-10 text-center">Loading...</div>
//                     ) : (
//                         categories.map((cat) => (
//                             <div key={cat._id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
//                                 <div className="flex items-center gap-3">
//                                     {cat.category_image ? (
//                                         <img src={cat.category_image} className="w-12 h-12 rounded-lg object-cover" />
//                                     ) : (
//                                         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><FiGrid /></div>
//                                     )}
//                                     <div className="flex-1">
//                                         <p className="font-semibold !text-black">{cat.category_name}</p>
//                                         <p className="text-xs !text-blue-600">{cat.category_code}</p>
//                                     </div>
//                                     <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${cat.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{cat.status}</span>
//                                 </div>
//                                 <div className="mt-3 flex items-center justify-between">
//                                     <div className="text-xs !text-gray-600">Products: {cat.product_count} | Orders: {cat.order_count}</div>
//                                     <div className="flex gap-2">
//                                         <button onClick={() => navigate(`/admin/categories/${cat.category_code}`)} className="p-2 bg-blue-50 rounded-lg !text-blue-600"><FiEye /></button>
//                                         <button onClick={() => navigate(`/admin/categories/${cat.category_code}/edit`)} className="p-2 bg-yellow-50 rounded-lg !text-yellow-600"><FiEdit2 /></button>
//                                         <button onClick={() => setDeleteConfirm({ open: true, code: cat.category_code })} className="p-2 bg-red-50 rounded-lg !text-red-600"><FiTrash2 /></button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>

//             <ConfirmDialog
//                 isOpen={deleteConfirm.open}
//                 onClose={() => setDeleteConfirm({ open: false, code: null })}
//                 onConfirm={handleDelete}
//                 title="Delete Category"
//                 message="Are you sure?"
//                 confirmColor="bg-gradient-to-r from-rose-500 to-red-600"
//             />
//         </div>
//     );
// };

// export default Categories;


import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiGrid, FiEye, FiShoppingBag } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const Categories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, code: null });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiService.getAllCategories({ search });
            if (res.data.success) {
                setCategories(res.data.data || []);
                setStats(res.data.stats || { total: 0, active: 0, inactive: 0 });
            }
        } catch (error) { toast.error('Failed to load categories'); }
        finally { setLoading(false); }
    }, [search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async () => {
        if (!deleteConfirm.code) return;
        try {
            await ApiService.deleteCategory(deleteConfirm.code);
            toast.success('Category deleted');
            fetchData();
        } catch (error) { toast.error('Failed to delete'); }
        finally { setDeleteConfirm({ open: false, code: null }); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Category Management"
                subtitle="Manage root categories"
                actions={
                    <button onClick={() => navigate('/admin/categories/create')} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 !text-white font-semibold rounded-xl shadow-md">
                        <FiPlus /> Add Category
                    </button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                
                {/* Stats Cards - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
                        <p className="text-2xl font-bold !text-black">{stats.total}</p>
                        <p className="text-xs !text-gray-700">Total Categories</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
                        <p className="text-2xl font-bold !text-emerald-600">{stats.active}</p>
                        <p className="text-xs !text-gray-700">Active</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 !bg-white !opacity-100">
                        <p className="text-2xl font-bold !text-gray-500">{stats.inactive}</p>
                        <p className="text-xs !text-gray-700">Inactive</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm relative">
                    <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 !text-gray-400" />
                    <input type="text" placeholder="Search by name or code..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black" onChange={(e) => setSearch(e.target.value)} />
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    {loading ? <div className="p-10 text-center">Loading...</div> : (
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
                                <tr>
                                    {/* Explicit Text-Left on all headers */}
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Products</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Orders</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {categories.map((cat) => (
                                    <tr key={cat._id} className="hover:bg-blue-50/30 cursor-pointer" onClick={() => navigate(`/admin/categories/${cat.category_code}`)}>
                                        {/* Explicit Text-Left on all data cells */}
                                        <td className="px-4 py-3 text-left">
                                            <div className="flex items-center gap-3">
                                                {cat.category_image ? <img src={cat.category_image} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FiGrid /></div>}
                                                <p className="font-semibold !text-black">{cat.category_name}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-left text-sm font-bold !text-blue-600">{cat.category_code}</td>
                                        <td className="px-4 py-3 text-left text-sm !text-gray-800">{cat.product_count}</td>
                                        <td className="px-4 py-3 text-left text-sm !text-gray-800">{cat.order_count}</td>
                                        <td className="px-4 py-3 text-left">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${cat.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{cat.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-left" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => navigate(`/admin/categories/${cat.category_code}`)} className="p-1.5 hover:bg-blue-50 !text-blue-600"><FiEye /></button>
                                            <button onClick={() => navigate(`/admin/categories/${cat.category_code}/edit`)} className="p-1.5 hover:bg-blue-50 !text-blue-600"><FiEdit2 /></button>
                                            <button onClick={() => setDeleteConfirm({ open: true, code: cat.category_code })} className="p-1.5 hover:bg-rose-50 !text-rose-600"><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile Cards - Fully Responsive */}
                <div className="md:hidden space-y-4">
                    {loading ? <div className="p-10 text-center">Loading...</div> : (
                        categories.map((cat) => (
                            <div key={cat._id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                                <div className="flex items-center gap-3">
                                    {cat.category_image ? <img src={cat.category_image} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><FiGrid /></div>}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold !text-black truncate">{cat.category_name}</p>
                                        <p className="text-xs !text-blue-600 truncate">{cat.category_code}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${cat.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{cat.status}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                                    <div className="text-xs !text-gray-600">
                                        <span className="mr-3">📦 Products: {cat.product_count}</span>
                                        <span>🛒 Orders: {cat.order_count}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => navigate(`/admin/categories/${cat.category_code}`)} className="p-2 bg-blue-50 rounded-lg !text-blue-600"><FiEye /></button>
                                        <button onClick={() => navigate(`/admin/categories/${cat.category_code}/edit`)} className="p-2 bg-yellow-50 rounded-lg !text-yellow-600"><FiEdit2 /></button>
                                        <button onClick={() => setDeleteConfirm({ open: true, code: cat.category_code })} className="p-2 bg-red-50 rounded-lg !text-red-600"><FiTrash2 /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, code: null })} onConfirm={handleDelete} title="Delete Category" message="Are you sure?" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
        </div>
    );
};

export default Categories;