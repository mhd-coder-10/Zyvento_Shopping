

// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiGrid, FiEye, FiFilter } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import ConfirmDialog from '../../../components/common/ConfirmDialog';

// const SubCategories = () => {
//     const navigate = useNavigate();
//     const [subCategories, setSubCategories] = useState([]);
//     const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState('');
//     const [statusFilter, setStatusFilter] = useState('all');
//     const [deleteConfirm, setDeleteConfirm] = useState({ open: false, code: null });

//     const fetchData = useCallback(async () => {
//         setLoading(true);
//         try {
//             const params = { search, status: statusFilter };
//             const res = await ApiService.getAllSubCategories(params);
//             if (res.data.success) {
//                 setSubCategories(res.data.data || []);
//                 setStats(res.data.stats || { total: 0, active: 0, inactive: 0 });
//             }
//         } catch (error) {
//             toast.error('Failed to load sub-categories');
//         } finally {
//             setLoading(false);
//         }
//     }, [search, statusFilter]);

//     useEffect(() => { fetchData(); }, [fetchData]);

//     const handleDelete = async () => {
//         if (!deleteConfirm.code) return;
//         try {
//             await ApiService.deleteSubCategory(deleteConfirm.code);
//             toast.success('Sub-Category deleted');
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
//                 title="Sub-Category Management"
//                 subtitle="Manage sub-categories under main categories"
//                 actions={
//                     <button
//                         onClick={() => navigate('/admin/sub-categories/create')}
//                         className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 !text-white font-semibold rounded-xl shadow-md"
//                     >
//                         <FiPlus /> Add Sub-Category
//                     </button>
//                 }
//             />

//             <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
//                 {/* Stats Cards */}
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <p className="text-2xl font-bold !text-black">{stats.total}</p>
//                         <p className="text-xs !text-gray-700">Total Sub-Categories</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <p className="text-2xl font-bold !text-emerald-600">{stats.active}</p>
//                         <p className="text-xs !text-gray-700">Active</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 !bg-white !opacity-100">
//                         <p className="text-2xl font-bold !text-gray-500">{stats.inactive}</p>
//                         <p className="text-xs !text-gray-700">Inactive</p>
//                     </div>
//                 </div>

//                 {/* Filters Section: Search + Status Dropdown */}
//                 <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col sm:flex-row gap-3">
//                     <div className="flex-1 relative">
//                         <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
//                         {/* UPDATED: Removed "main category or product" from placeholder */}
//                         <input
//                             type="text"
//                             placeholder="Search by Sub-Category name or code..."
//                             className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black"
//                             onChange={(e) => setSearch(e.target.value)}
//                         />
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <FiFilter className="!text-gray-500" />
//                         <select
//                             value={statusFilter}
//                             onChange={(e) => setStatusFilter(e.target.value)}
//                             className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white cursor-pointer"
//                         >
//                             <option value="all">All Status</option>
//                             <option value="active">Active</option>
//                             <option value="inactive">Inactive</option>
//                         </select>
//                     </div>
//                 </div>

//                 {/* Desktop Table */}
//                 <div className="hidden md:block bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
//                     {loading ? <div className="p-10 text-center">Loading...</div> : (
//                         <table className="w-full">
//                             <thead className="bg-gradient-to-r from-purple-50 to-fuchsia-50">
//                                 <tr>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-purple-900 uppercase">Sub-Category</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-purple-900 uppercase">Code</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-purple-900 uppercase">Main Category</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-purple-900 uppercase">Products</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-purple-900 uppercase">Status</th>
//                                     <th className="px-4 py-3 text-right text-xs font-bold !text-purple-900 uppercase">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {subCategories.map((sub) => (
//                                     <tr key={sub._id} className="hover:bg-purple-50/30 cursor-pointer" onClick={() => navigate(`/admin/sub-categories/${sub.sub_category_code}`)}>
//                                         <td className="px-4 py-3">
//                                             <div className="flex items-center gap-3">
//                                                 {sub.sub_category_image ? <img src={sub.sub_category_image} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><FiGrid /></div>}
//                                                 <p className="font-semibold !text-black">{sub.sub_category_name}</p>
//                                             </div>
//                                         </td>
//                                         <td className="px-4 py-3 text-sm font-bold !text-left !text-purple-600">{sub.sub_category_code}</td>
//                                         <td className="px-4 py-3 text-sm !text-gray-800">{sub.category_id?.category_name || 'N/A'}</td>
//                                         <td className="px-4 py-3 text-sm !text-gray-800">{sub.product_count}</td>
//                                         <td className="px-4 py-3">
//                                             <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${sub.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{sub.status}</span>
//                                         </td>
//                                         <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
//                                             <button onClick={() => navigate(`/admin/sub-categories/${sub.sub_category_code}`)} className="p-1.5 hover:bg-purple-50 !text-purple-600"><FiEye /></button>
//                                             <button onClick={() => navigate(`/admin/sub-categories/${sub.sub_category_code}/edit`)} className="p-1.5 hover:bg-purple-50 !text-purple-600"><FiEdit2 /></button>
//                                             <button onClick={() => setDeleteConfirm({ open: true, code: sub.sub_category_code })} className="p-1.5 hover:bg-rose-50 !text-rose-600"><FiTrash2 /></button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     )}
//                 </div>

//                 {/* Mobile Cards */}
//                 <div className="md:hidden space-y-4">
//                     {loading ? <div className="p-10 text-center">Loading...</div> : (
//                         subCategories.map((sub) => (
//                             <div key={sub._id} className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4">
//                                 <div className="flex items-center gap-3">
//                                     {sub.sub_category_image ? <img src={sub.sub_category_image} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><FiGrid /></div>}
//                                     <div className="flex-1">
//                                         <p className="font-semibold !text-black">{sub.sub_category_name}</p>
//                                         <p className="text-xs !text-purple-600">{sub.sub_category_code}</p>
//                                         <p className="text-xs !text-gray-600">Main: {sub.category_id?.category_name || 'N/A'}</p>
//                                     </div>
//                                     <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${sub.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{sub.status}</span>
//                                 </div>
//                                 <div className="mt-3 flex items-center justify-between">
//                                     <div className="text-xs !text-gray-600">Products: {sub.product_count}</div>
//                                     <div className="flex gap-2">
//                                         <button onClick={() => navigate(`/admin/sub-categories/${sub.sub_category_code}`)} className="p-2 bg-purple-50 rounded-lg !text-purple-600"><FiEye /></button>
//                                         <button onClick={() => navigate(`/admin/sub-categories/${sub.sub_category_code}/edit`)} className="p-2 bg-yellow-50 rounded-lg !text-yellow-600"><FiEdit2 /></button>
//                                         <button onClick={() => setDeleteConfirm({ open: true, code: sub.sub_category_code })} className="p-2 bg-red-50 rounded-lg !text-red-600"><FiTrash2 /></button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>

//             <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, code: null })} onConfirm={handleDelete} title="Delete Sub-Category" message="Are you sure?" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
//         </div>
//     );
// };

// export default SubCategories;







import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiGrid, FiEye, FiFilter } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const SubCategories = () => {
    const navigate = useNavigate();
    const [subCategories, setSubCategories] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, code: null });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { search, status: statusFilter };
            const res = await ApiService.getAllSubCategories(params);
            if (res.data.success) {
                setSubCategories(res.data.data || []);
                setStats(res.data.stats || { total: 0, active: 0, inactive: 0 });
            }
        } catch (error) {
            toast.error('Failed to load sub-categories');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async () => {
        if (!deleteConfirm.code) return;
        try {
            await ApiService.deleteSubCategory(deleteConfirm.code);
            toast.success('Sub-Category deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        } finally {
            setDeleteConfirm({ open: false, code: null });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Sub-Category Management"
                subtitle="Manage sub-categories under main categories"
                actions={
                    <button
                        onClick={() => navigate('/admin/sub-categories/create')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 !text-white font-semibold rounded-xl shadow-md hover:shadow-lg"
                    >
                        <FiPlus /> Add Sub-Category
                    </button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 !bg-white !opacity-100">
                        <p className="text-2xl font-bold !text-black">{stats.total}</p>
                        <p className="text-xs !text-gray-700">Total Sub-Categories</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 !bg-white !opacity-100">
                        <p className="text-2xl font-bold !text-emerald-600">{stats.active}</p>
                        <p className="text-xs !text-gray-700">Active</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 !bg-white !opacity-100">
                        <p className="text-2xl font-bold !text-gray-500">{stats.inactive}</p>
                        <p className="text-xs !text-gray-700">Inactive</p>
                    </div>
                </div>

                {/* Filters Section: Search + Status Dropdown */}
                <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Sub-Category name or code..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <FiFilter className="!text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                    {loading ? <div className="p-10 text-center">Loading...</div> : (
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-purple-50 to-fuchsia-50">
                                <tr>
                                    {/* All headers strictly LEFT aligned */}
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-purple-900 uppercase">Sub-Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-purple-900 uppercase">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-purple-900 uppercase">Main Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-purple-900 uppercase">Products</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-purple-900 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-purple-900 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {subCategories.map((sub) => (
                                    <tr key={sub._id} className="hover:bg-purple-50/30 cursor-pointer" onClick={() => navigate(`/admin/sub-categories/${sub.sub_category_code}`)}>
                                        <td className="px-4 py-3 text-left !text-left">
                                            <div className="flex items-center gap-3">
                                                {sub.sub_category_image ? <img src={sub.sub_category_image} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><FiGrid /></div>}
                                                <p className="font-semibold !text-black">{sub.sub_category_name}</p>
                                            </div>
                                        </td>
                                        {/* CODE strictly LEFT */}
                                        <td className="px-4 py-3 text-sm font-bold !text-left !text-purple-600">{sub.sub_category_code}</td>
                                        {/* MAIN CATEGORY strictly LEFT */}
                                        <td className="px-4 py-3 text-sm !text-left !text-gray-800">{sub.category_id?.category_name || 'N/A'}</td>
                                        {/* product count */}
                                        <td className="px-4 py-3 text-sm !text-center !text-gray-800">{sub.product_count}</td>
                                        {/* status */}
                                        <td className="px-4 py-3 text-left">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${sub.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{sub.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => navigate(`/admin/sub-categories/${sub.sub_category_code}`)} className="p-1.5 hover:bg-purple-50 !text-purple-600"><FiEye /></button>
                                            <button onClick={() => navigate(`/admin/sub-categories/${sub.sub_category_code}/edit`)} className="p-1.5 hover:bg-purple-50 !text-purple-600"><FiEdit2 /></button>
                                            <button onClick={() => setDeleteConfirm({ open: true, code: sub.sub_category_code })} className="p-1.5 hover:bg-rose-50 !text-rose-600"><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {loading ? <div className="p-10 text-center">Loading...</div> : (
                        subCategories.map((sub) => (
                            <div key={sub._id} className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4">
                                <div className="flex items-center gap-3">
                                    {sub.sub_category_image ? <img src={sub.sub_category_image} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><FiGrid /></div>}
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold !text-black">{sub.sub_category_name}</p>
                                        <p className="text-xs !text-purple-600">{sub.sub_category_code}</p>
                                        <p className="text-xs !text-gray-600">Main: {sub.category_id?.category_name || 'N/A'}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold !opacity-100 ${sub.status === 'active' ? '!bg-emerald-50 !text-emerald-700' : '!bg-gray-100 !text-gray-500'}`}>{sub.status}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="text-xs !text-gray-600">Products: {sub.product_count}</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => navigate(`/admin/sub-categories/${sub.sub_category_code}`)} className="p-2 bg-purple-50 rounded-lg !text-purple-600"><FiEye /></button>
                                        <button onClick={() => navigate(`/admin/sub-categories/${sub.sub_category_code}/edit`)} className="p-2 bg-yellow-50 rounded-lg !text-yellow-600"><FiEdit2 /></button>
                                        <button onClick={() => setDeleteConfirm({ open: true, code: sub.sub_category_code })} className="p-2 bg-red-50 rounded-lg !text-red-600"><FiTrash2 /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, code: null })} onConfirm={handleDelete} title="Delete Sub-Category" message="Are you sure?" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
        </div>
    );
};

export default SubCategories;