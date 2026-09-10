// import React, { useState, useEffect, useCallback } from 'react';
// import { toast } from 'react-toastify';
// import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';

// const CompanyFinance = () => {
//     const [entries, setEntries] = useState([]);
//     const [totalIncome, setTotalIncome] = useState(0);
//     const [totalExpense, setTotalExpense] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState('');
    
//     // Modal State
//     const [showModal, setShowModal] = useState(false);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editingId, setEditingId] = useState(null);
//     const [formData, setFormData] = useState({ entry_type: 'income', amount: '', category: 'Sales', description: '' });

//     // Fetch Data
//     const fetchData = useCallback(async () => {
//         setLoading(true);
//         try {
//             const res = await ApiService.getFinanceEntries({ search });
//             if (res.data.success) {
//                 setEntries(res.data.data || []);
//                 setTotalIncome(res.data.totalIncome || 0);
//                 setTotalExpense(res.data.totalExpense || 0);
//             }
//         } catch (error) {
//             toast.error('Failed to load finance data');
//         } finally {
//             setLoading(false);
//         }
//     }, [search]);

//     useEffect(() => { fetchData(); }, [fetchData]);

//     // Modal Handlers
//     const openAddModal = (type) => {
//         setIsEditMode(false);
//         setEditingId(null);
//         setFormData({ entry_type: type, amount: '', category: type === 'income' ? 'Sales' : 'Rent', description: '' });
//         setShowModal(true);
//     };

//     const openEditModal = (entry) => {
//         setIsEditMode(true);
//         setEditingId(entry._id);
//         setFormData({ entry_type: entry.entry_type, amount: entry.amount, category: entry.category, description: entry.description });
//         setShowModal(true);
//     };

//     // Save Entry
//     const handleSave = async (e) => {
//         e.preventDefault();
//         try {
//             if (isEditMode) {
//                 await ApiService.updateFinanceEntry(editingId, formData);
//                 toast.success('Entry updated successfully');
//             } else {
//                 await ApiService.addFinanceEntry(formData);
//                 toast.success('Entry added successfully');
//             }
//             setShowModal(false);
//             fetchData();
//         } catch (error) {
//             toast.error('Failed to save entry');
//         }
//     };

//     // Delete Entry
//     const handleDelete = async (id) => {
//         if (!window.confirm('Are you sure you want to delete this entry?')) return;
//         try {
//             await ApiService.deleteFinanceEntry(id);
//             toast.success('Entry deleted successfully');
//             fetchData();
//         } catch (error) {
//             toast.error('Failed to delete entry');
//         }
//     };

//     // Export PDF
//     const handleExportPDF = async () => {
//         try {
//             const res = await ApiService.exportFinancePDF();
//             const url = window.URL.createObjectURL(new Blob([res.data]));
//             const a = document.createElement('a');
//             a.href = url; a.download = 'finance-report.pdf'; a.click();
//             window.URL.revokeObjectURL(url);
//             toast.success('PDF downloaded successfully');
//         } catch (error) {
//             toast.error('Failed to export PDF');
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar 
//                 title="Company Finance" 
//                 subtitle="Manage company Income & Expenses"
//                 actions={
//                     <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 !text-white rounded-xl font-semibold hover:bg-blue-700">
//                         <FiDownload /> Export PDF
//                     </button>
//                 }
//             />

//             <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                
//                 {/* Summary Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4">
//                         <div className="flex items-center gap-2">
//                             <FiTrendingUp className="!text-emerald-600" />
//                             <p className="text-xs !text-gray-600">Total Income</p>
//                         </div>
//                         <p className="text-2xl font-bold !text-emerald-600 mt-1">₹{totalIncome.toLocaleString('en-IN')}</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
//                         <div className="flex items-center gap-2">
//                             <FiTrendingDown className="!text-red-600" />
//                             <p className="text-xs !text-gray-600">Total Expenses</p>
//                         </div>
//                         <p className="text-2xl font-bold !text-red-600 mt-1">₹{totalExpense.toLocaleString('en-IN')}</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
//                         <div className="flex items-center gap-2">
//                             <FiDollarSign className="!text-blue-600" />
//                             <p className="text-xs !text-gray-600">Net Balance</p>
//                         </div>
//                         <p className="text-2xl font-bold !text-blue-600 mt-1">₹{(totalIncome - totalExpense).toLocaleString('en-IN')}</p>
//                     </div>
//                 </div>

//                 {/* Search */}
//                 <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
//                     <input 
//                         type="text" 
//                         placeholder="Search by category or description..." 
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-xl !text-black"
//                         onChange={(e) => setSearch(e.target.value)}
//                     />
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex justify-end gap-3">
//                     <button onClick={() => openAddModal('income')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 !text-white rounded-lg">
//                         <FiPlus /> Add Income
//                     </button>
//                     <button onClick={() => openAddModal('expense')} className="flex items-center gap-2 px-4 py-2 bg-red-600 !text-white rounded-lg">
//                         <FiPlus /> Add Expense
//                     </button>
//                 </div>

//                 {/* Table */}
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
//                     {loading ? <div className="p-10 text-center">Loading...</div> : (
//                         <table className="w-full">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-gray-900 uppercase">Code</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-gray-900 uppercase">Type</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-gray-900 uppercase">Category</th>
//                                     <th className="px-4 py-3 text-right text-xs font-bold !text-gray-900 uppercase">Amount</th>
//                                     <th className="px-4 py-3 text-right text-xs font-bold !text-gray-900 uppercase">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {entries.length > 0 ? (
//                                     entries.map((entry) => (
//                                         <tr key={entry._id} className="hover:bg-gray-50">
//                                             <td className="px-4 py-3 text-sm font-bold !text-blue-600">{entry.entry_code}</td>
//                                             <td className="px-4 py-3 text-sm capitalize !text-black">{entry.entry_type}</td>
//                                             <td className="px-4 py-3 text-sm !text-gray-600">{entry.category}</td>
//                                             <td className={`px-4 py-3 text-sm font-bold !text-right ${entry.entry_type === 'income' ? '!text-green-600' : '!text-red-600'}`}>₹{entry.amount}</td>
//                                             <td className="px-4 py-3 text-right">
//                                                 <button onClick={() => openEditModal(entry)} className="p-2 bg-yellow-50 !text-yellow-600 rounded-lg mr-2"><FiEdit2 /></button>
//                                                 <button onClick={() => handleDelete(entry._id)} className="p-2 bg-red-50 !text-red-600 rounded-lg"><FiTrash2 /></button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td colSpan="5" className="px-4 py-6 text-center !text-gray-500">No entries found</td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     )}
//                 </div>
//             </div>

//             {/* Add/Edit Modal */}
//             {showModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl p-6 w-full max-w-md">
//                         <h3 className="text-lg font-bold !text-black mb-4">{isEditMode ? 'Edit' : 'Add'} Entry</h3>
//                         <form onSubmit={handleSave} className="space-y-4">
//                             <div>
//                                 <label className="text-sm font-medium !text-gray-700">Type</label>
//                                 <select value={formData.entry_type} onChange={(e) => setFormData({...formData, entry_type: e.target.value})} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black bg-white">
//                                     <option value="income">Income</option>
//                                     <option value="expense">Expense</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="text-sm font-medium !text-gray-700">Amount (₹)</label>
//                                 <input type="number" required min="1" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" />
//                             </div>
//                             <div>
//                                 <label className="text-sm font-medium !text-gray-700">Category</label>
//                                 <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black bg-white">
//                                     {formData.entry_type === 'income' ? (
//                                         <>
//                                             <option value="Sales">Sales</option>
//                                             <option value="Advertising">Advertising</option>
//                                             <option value="Other">Other</option>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <option value="Rent">Rent</option>
//                                             <option value="Marketing">Marketing</option>
//                                             <option value="Salaries">Salaries</option>
//                                             <option value="Utilities">Utilities</option>
//                                             <option value="Logistics">Logistics</option>
//                                             <option value="Tax">Tax</option>
//                                             <option value="Other">Other</option>
//                                         </>
//                                     )}
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="text-sm font-medium !text-gray-700">Description</label>
//                                 <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" rows="2"></textarea>
//                             </div>
//                             <div className="flex gap-3 pt-2">
//                                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 !text-gray-600 rounded-lg">Cancel</button>
//                                 <button type="submit" className="flex-1 py-2 bg-blue-600 !text-white rounded-lg">{isEditMode ? 'Update' : 'Add'}</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CompanyFinance;


import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const CompanyFinance = () => {
    const [entries, setEntries] = useState([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ entry_type: 'income', amount: '', category: 'Sales', description: '' });

    // Fetch Data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiService.getFinanceEntries({ search });
            if (res.data.success) {
                setEntries(res.data.data || []);
                setTotalIncome(res.data.totalIncome || 0);
                setTotalExpense(res.data.totalExpense || 0);
            }
        } catch (error) {
            toast.error('Failed to load finance data');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Modal Handlers
    const openAddModal = () => {
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ entry_type: 'income', amount: '', category: 'Sales', description: '' }); // Default to Income
        setShowModal(true);
    };

    const openEditModal = (entry) => {
        setIsEditMode(true);
        setEditingId(entry._id);
        setFormData({ entry_type: entry.entry_type, amount: entry.amount, category: entry.category, description: entry.description });
        setShowModal(true);
    };

    // Save Entry
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await ApiService.updateFinanceEntry(editingId, formData);
                toast.success('Entry updated successfully');
            } else {
                await ApiService.addFinanceEntry(formData);
                toast.success('Entry added successfully');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to save entry');
        }
    };

    // Delete Entry
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        try {
            await ApiService.deleteFinanceEntry(id);
            toast.success('Entry deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete entry');
        }
    };

    // Export PDF
    const handleExportPDF = async () => {
        try {
            const res = await ApiService.exportFinancePDF();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url; a.download = 'finance-report.pdf'; a.click();
            window.URL.revokeObjectURL(url);
            toast.success('PDF downloaded successfully');
        } catch (error) {
            toast.error('Failed to export PDF');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar 
                title="Company Finance" 
                subtitle="Manage company Income & Expenses"
                actions={
                    <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 !text-white rounded-xl font-semibold hover:bg-blue-700">
                        <FiDownload /> Export PDF
                    </button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4">
                        <div className="flex items-center gap-2">
                            <FiTrendingUp className="!text-emerald-600" />
                            <p className="text-xs !text-gray-600">Total Income</p>
                        </div>
                        <p className="text-2xl font-bold !text-emerald-600 mt-1">₹{totalIncome.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
                        <div className="flex items-center gap-2">
                            <FiTrendingDown className="!text-red-600" />
                            <p className="text-xs !text-gray-600">Total Expenses</p>
                        </div>
                        <p className="text-2xl font-bold !text-red-600 mt-1">₹{totalExpense.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                        <div className="flex items-center gap-2">
                            <FiDollarSign className="!text-blue-600" />
                            <p className="text-xs !text-gray-600">Net Balance</p>
                        </div>
                        <p className="text-2xl font-bold !text-blue-600 mt-1">₹{(totalIncome - totalExpense).toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                    <input 
                        type="text" 
                        placeholder="Search by category or description..." 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl !text-black"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* SINGLE ACTION BUTTON (FIXED) */}
                <div className="flex justify-end">
                    <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 !text-white rounded-lg shadow-md hover:bg-blue-700">
                        <FiPlus /> Add Entry
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    {loading ? <div className="p-10 text-center">Loading...</div> : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-gray-900 uppercase">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-gray-900 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-gray-900 uppercase">Category</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-gray-900 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-gray-900 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {entries.length > 0 ? (
                                    entries.map((entry) => (
                                        <tr key={entry._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-bold !text-blue-600">{entry.entry_code}</td>
                                            <td className="px-4 py-3 text-sm capitalize !text-black">{entry.entry_type}</td>
                                            <td className="px-4 py-3 text-sm !text-gray-600">{entry.category}</td>
                                            <td className={`px-4 py-3 text-sm font-bold !text-right ${entry.entry_type === 'income' ? '!text-green-600' : '!text-red-600'}`}>₹{entry.amount}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => openEditModal(entry)} className="p-2 bg-yellow-50 !text-yellow-600 rounded-lg mr-2"><FiEdit2 /></button>
                                                <button onClick={() => handleDelete(entry._id)} className="p-2 bg-red-50 !text-red-600 rounded-lg"><FiTrash2 /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-6 text-center !text-gray-500">No entries found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold !text-black mb-4">{isEditMode ? 'Edit' : 'Add'} Entry</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium !text-gray-700">Type</label>
                                <select value={formData.entry_type} onChange={(e) => setFormData({...formData, entry_type: e.target.value})} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black bg-white">
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium !text-gray-700">Amount (₹)</label>
                                <input type="number" required min="1" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" />
                            </div>
                            <div>
                                <label className="text-sm font-medium !text-gray-700">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black bg-white">
                                    {formData.entry_type === 'income' ? (
                                        <>
                                            <option value="Sales">Sales</option>
                                            <option value="Advertising">Advertising</option>
                                            <option value="Other">Other</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Rent">Rent</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Salaries">Salaries</option>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Logistics">Logistics</option>
                                            <option value="Tax">Tax</option>
                                            <option value="Other">Other</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium !text-gray-700">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1 w-full px-4 py-2 border rounded-xl !text-black" rows="2"></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 !text-gray-600 rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 !text-white rounded-lg">{isEditMode ? 'Update' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyFinance;