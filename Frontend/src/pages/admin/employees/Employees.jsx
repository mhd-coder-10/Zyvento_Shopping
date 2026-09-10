// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//     FiEye, FiEdit2, FiTrash2, FiUserCheck, FiUserX, FiClock,
//     FiSearch, FiPlus, FiMail, FiPhone, FiRefreshCw,
//     FiUsers, FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight, FiDownload,
// } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import ConfirmDialog from '../../../components/common/ConfirmDialog';

// const Employees = () => {
//     const navigate = useNavigate();
//     const [employees, setEmployees] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [isRefreshing, setIsRefreshing] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [statusFilter, setStatusFilter] = useState('all');
//     const [deleteConfirm, setDeleteConfirm] = useState({ open: false, employeeId: null });
//     const [statusConfirm, setStatusConfirm] = useState({ open: false, employeeId: null, action: 'activate' });
//     const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
//     const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, pending: 0 });

//     // const fetchEmployees = useCallback(async () => {
//     //     setIsRefreshing(true);
//     //     try {
//     //         const params = { page: pagination.page, limit: pagination.limit, search: searchQuery, status: statusFilter !== 'all' ? statusFilter : undefined };
//     //         const response = await ApiService.getAllEmployees(params);
//     //         if (response.data.success) {
//     //             setEmployees(response.data.data || []);
//     //             setPagination({ ...pagination, total: response.data.total || 0, totalPages: response.data.totalPages || 1 });
//     //         }
//     //     } catch (error) {
//     //         toast.error(error.response?.data?.message || 'Failed to load employees');
//     //     } finally {
//     //         setIsRefreshing(false);
//     //         setLoading(false);
//     //     }
//     // }, [pagination.page, pagination.limit, searchQuery, statusFilter]);


//     const fetchEmployees = useCallback(async () => {
//         setIsRefreshing(true);
//         try {
//             const params = {
//                 page: pagination.page,
//                 limit: pagination.limit,
//                 search: searchQuery,
//                 status: statusFilter !== 'all' ? statusFilter : undefined
//             };
//             const response = await ApiService.getAllEmployees(params);

//             if (response.data.success) {
//                 // Handle both structures: direct array or nested object
//                 const empData = response.data.data?.employees || response.data.data || [];
//                 setEmployees(Array.isArray(empData) ? empData : []);

//                 setPagination({
//                     ...pagination,
//                     total: response.data.total || 0,
//                     totalPages: response.data.totalPages || 1
//                 });
//             }
//         } catch (error) {
//             console.error('Failed to fetch employees:', error);
//             toast.error(error.response?.data?.message || 'Failed to load employees');
//         } finally {
//             setIsRefreshing(false);
//             setLoading(false);
//         }
//     }, [pagination.page, pagination.limit, searchQuery, statusFilter]);


//     useEffect(() => {
//         fetchEmployees();
//         fetchStats();
//     }, [fetchEmployees]);

//     const fetchStats = async () => {
//         try {
//             const response = await ApiService.getEmployeeStats();
//             if (response.data.success) setStats(response.data.data);
//         } catch (error) { console.error('Failed to fetch stats:', error); }
//     };

//     const handleSearch = (e) => { setSearchQuery(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); };
//     const handleStatusFilter = (e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); };

//     const confirmStatusToggle = async () => {
//         if (!statusConfirm.employeeId) return;
//         const newStatus = statusConfirm.action === 'activate' ? 'active' : 'inactive';
//         setEmployees(prev => prev.map(emp => emp._id === statusConfirm.employeeId ? { ...emp, status: newStatus } : emp));
//         try {
//             await ApiService.updateEmployeeStatus(statusConfirm.employeeId, { status: newStatus });
//             toast.success(`Employee ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
//             fetchStats();
//         } catch (error) {
//             fetchEmployees();
//             toast.error(error.response?.data?.message || 'Failed to update employee status');
//         } finally {
//             setStatusConfirm({ open: false, employeeId: null, action: 'activate' });
//         }
//     };

//     const confirmDelete = async () => {
//         if (!deleteConfirm.employeeId) return;
//         setEmployees(prev => prev.filter(emp => emp._id !== deleteConfirm.employeeId));
//         try {
//             await ApiService.deleteEmployee(deleteConfirm.employeeId);
//             toast.success('Employee deleted successfully');
//             fetchStats();
//         } catch (error) {
//             fetchEmployees();
//             toast.error(error.response?.data?.message || 'Failed to delete employee');
//         } finally {
//             setDeleteConfirm({ open: false, employeeId: null });
//         }
//     };

//     const handleExport = async () => {
//         try {
//             const response = await ApiService.exportEmployees({ search: searchQuery });
//             const blob = new Blob([response.data], { type: 'text/csv' });
//             const url = window.URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
//             a.click();
//             window.URL.revokeObjectURL(url);
//             toast.success('Employees exported successfully');
//         } catch (error) { toast.error('Failed to export employees'); }
//     };

//     const getStatusBadge = (status) => {
//         const config = {
//             active: { color: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: FiCheckCircle, label: 'Active' },
//             inactive: { color: 'bg-gray-50 text-gray-700 border border-gray-300', icon: FiXCircle, label: 'Inactive' },
//             pending: { color: 'bg-amber-50 text-amber-800 border border-amber-300', icon: FiClock, label: 'Pending' },
//             blocked: { color: 'bg-orange-50 text-orange-800 border border-orange-300', icon: FiXCircle, label: 'Blocked' },
//         };
//         const { color, icon: Icon, label } = config[status] || config.pending;
//         return (
//             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${color}`}>
//                 <Icon className="w-3 h-3" /> {label}
//             </span>
//         );
//     };

//     if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin text-blue-600 w-8 h-8" /></div>;

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Employee Management"
//                 subtitle="Manage all employees across sellers"
//                 actions={
//                     <div className="flex items-center gap-2">
//                         <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
//                             <FiDownload className="w-4 h-4" /> Export
//                         </button>
//                         <button onClick={() => navigate('/admin/employees/create')} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
//                             <FiPlus className="w-5 h-5" /> Add Employee
//                         </button>
//                     </div>
//                 }
//             />

//             <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
//                         <p className="text-sm text-gray-600 font-medium">Total Employees</p>
//                         <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total || 0}</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
//                         <p className="text-sm text-gray-600 font-medium">Active</p>
//                         <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active || 0}</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
//                         <p className="text-sm text-gray-600 font-medium">Inactive</p>
//                         <p className="text-3xl font-bold text-gray-900 mt-1">{stats.inactive || 0}</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
//                         <p className="text-sm text-gray-600 font-medium">Pending</p>
//                         <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending || 0}</p>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
//                     <div className="flex flex-col md:flex-row gap-3">
//                         <div className="flex-1 relative">
//                             <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                             <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Search by name, email, or employee ID..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
//                         </div>
//                         <select value={statusFilter} onChange={handleStatusFilter} className="px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
//                             <option value="all">All Status</option>
//                             <option value="active">Active</option>
//                             <option value="inactive">Inactive</option>
//                             <option value="pending">Pending</option>
//                             <option value="blocked">Blocked</option>
//                         </select>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
//                     <div className="relative">
//                         {isRefreshing && <div className="absolute top-0 left-0 right-0 bg-blue-50/50 z-10 flex justify-center py-2"><FiRefreshCw className="animate-spin text-blue-600 w-5 h-5" /></div>}
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead>
//                                     <tr className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100">
//                                         <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Employee</th>
//                                         <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Employee ID</th>
//                                         <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Role</th>
//                                         <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Contact</th>
//                                         <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Seller</th>
//                                         <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Status</th>
//                                         <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Joined</th>
//                                         <th className="px-4 py-3 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-50">
//                                     {employees.map((emp) => (
//                                         <tr key={emp._id} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/employees/${emp._id}`)}>
//                                             <td className="px-4 py-3">
//                                                 <div className="flex items-center gap-3">
//                                                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
//                                                         {(emp.first_name?.[0] || 'E').toUpperCase()}
//                                                     </div>
//                                                     <div>
//                                                         <p className="font-semibold text-gray-900 text-sm">{emp.first_name} {emp.last_name}</p>
//                                                         <p className="text-xs text-gray-500">{emp.email}</p>
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <span className="text-xs bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg font-semibold">{emp.employee_code || 'N/A'}</span>
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <span className="text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg capitalize">{emp.employee_type || 'Employee'}</span>
//                                             </td>
//                                             <td className="px-4 py-3 text-sm text-gray-700">{emp.mobile_number || 'N/A'}</td>
//                                             <td className="px-4 py-3 text-sm text-gray-700">{emp.seller?.business_name || 'N/A'}</td>
//                                             <td className="px-4 py-3">{getStatusBadge(emp.status)}</td>
//                                             <td className="px-4 py-3 text-sm text-gray-600">{emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-IN') : 'N/A'}</td>
//                                             <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
//                                                 <div className="flex items-center justify-end gap-1">
//                                                     <button onClick={() => navigate(`/admin/employees/${emp._id}`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><FiEye className="w-4 h-4" /></button>
//                                                     <button onClick={() => navigate(`/admin/employees/${emp._id}/edit`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
//                                                     {emp.status !== 'active' && <button onClick={() => setStatusConfirm({ open: true, employeeId: emp._id, action: 'activate' })} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Activate"><FiUserCheck className="w-4 h-4" /></button>}
//                                                     {emp.status === 'active' && <button onClick={() => setStatusConfirm({ open: true, employeeId: emp._id, action: 'deactivate' })} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors" title="Deactivate"><FiUserX className="w-4 h-4" /></button>}
//                                                     <button onClick={() => handleDelete(emp._id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                         {employees.length === 0 && !isRefreshing && <div className="text-center py-10 text-gray-500">No employees found</div>}
//                         {pagination.totalPages > 1 && (
//                             <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
//                                 <p className="text-sm text-gray-600">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} employees</p>
//                                 <div className="flex items-center gap-2">
//                                     <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"><FiChevronLeft className="w-4 h-4" /></button>
//                                     <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"><FiChevronRight className="w-4 h-4" /></button>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, employeeId: null })} onConfirm={confirmDelete} title="Delete Employee" message="Are you sure you want to delete this employee? This action cannot be undone." confirmText="Delete" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
//             <ConfirmDialog isOpen={statusConfirm.open} onClose={() => setStatusConfirm({ open: false, employeeId: null, action: 'activate' })} onConfirm={confirmStatusToggle} title={statusConfirm.action === 'activate' ? 'Activate Employee' : 'Deactivate Employee'} message={`Are you sure you want to ${statusConfirm.action === 'activate' ? 'activate' : 'deactivate'} this employee?`} confirmText={statusConfirm.action === 'activate' ? 'Activate' : 'Deactivate'} confirmColor={statusConfirm.action === 'activate' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'} />
//         </div>
//     );
// };

// export default Employees;





import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiEye, FiEdit2, FiTrash2, FiUserCheck, FiUserX, FiClock,
    FiSearch, FiPlus, FiRefreshCw,
    FiUsers, FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight, FiDownload,
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const Employees = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, employeeId: null });
    const [statusConfirm, setStatusConfirm] = useState({ open: false, employeeId: null, action: 'activate' });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, pending: 0 });

    const fetchEmployees = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
                status: statusFilter !== 'all' ? statusFilter : undefined
            };
            const response = await ApiService.getAllEmployees(params);

            if (response.data.success) {
                const empData = response.data.data?.employees || response.data.data || [];
                setEmployees(Array.isArray(empData) ? empData : []);
                setPagination({
                    ...pagination,
                    total: response.data.total || 0,
                    totalPages: response.data.totalPages || 1
                });
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            toast.error(error.response?.data?.message || 'Failed to load employees');
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, statusFilter]);

    useEffect(() => {
        fetchEmployees();
        fetchStats();
    }, [fetchEmployees]);

    const fetchStats = async () => {
        try {
            const response = await ApiService.getEmployeeStats();
            if (response.data.success) setStats(response.data.data);
        } catch (error) { console.error('Failed to fetch stats:', error); }
    };

    const handleSearch = (e) => { setSearchQuery(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); };
    const handleStatusFilter = (e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); };

    const confirmStatusToggle = async () => {
        if (!statusConfirm.employeeId) return;
        const newStatus = statusConfirm.action === 'activate' ? 'active' : 'inactive';
        setEmployees(prev => prev.map(emp => emp._id === statusConfirm.employeeId ? { ...emp, status: newStatus } : emp));
        try {
            await ApiService.updateEmployeeStatus(statusConfirm.employeeId, { status: newStatus });
            toast.success(`Employee ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
            fetchStats();
        } catch (error) {
            fetchEmployees();
            toast.error(error.response?.data?.message || 'Failed to update employee status');
        } finally {
            setStatusConfirm({ open: false, employeeId: null, action: 'activate' });
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.employeeId) return;
        setEmployees(prev => prev.filter(emp => emp._id !== deleteConfirm.employeeId));
        try {
            await ApiService.deleteEmployee(deleteConfirm.employeeId);
            toast.success('Employee deleted successfully');
            fetchStats();
        } catch (error) {
            fetchEmployees();
            toast.error(error.response?.data?.message || 'Failed to delete employee');
        } finally {
            setDeleteConfirm({ open: false, employeeId: null });
        }
    };

    const handleExport = async () => {
        try {
            const response = await ApiService.exportEmployees({ search: searchQuery });
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Employees exported successfully');
        } catch (error) { toast.error('Failed to export employees'); }
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { color: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: FiCheckCircle, label: 'Active' },
            inactive: { color: 'bg-gray-50 text-gray-700 border border-gray-300', icon: FiXCircle, label: 'Inactive' },
            pending: { color: 'bg-amber-50 text-amber-800 border border-amber-300', icon: FiClock, label: 'Pending' },
        };
        const { color, icon: Icon, label } = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${color}`}>
                <Icon className="w-3 h-3" /> {label}
            </span>
        );
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin text-blue-600 w-8 h-8" /></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Employee Management"
                subtitle="Manage all employees across sellers"
                actions={
                    <div className="flex items-center gap-2">
                        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                            <FiDownload className="w-4 h-4" /> Export
                        </button>
                        <button onClick={() => navigate('/admin/employees/create')} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                            <FiPlus className="w-5 h-5" /> Add Employee
                        </button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                        <p className="text-sm text-gray-600 font-medium">Total Employees</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total || 0}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                        <p className="text-sm text-gray-600 font-medium">Active</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active || 0}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                        <p className="text-sm text-gray-600 font-medium">Inactive</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.inactive || 0}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                        <p className="text-sm text-gray-600 font-medium">Pending</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending || 0}</p>
                    </div>
                </div>

                {/* Search & Filters (Blocked removed) */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Search by name, email, or employee ID..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                        </div>
                        <select value={statusFilter} onChange={handleStatusFilter} className="px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>

                {/* Table (Desktop) + Cards (Mobile) */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    <div className="relative">
                        {isRefreshing && <div className="absolute top-0 left-0 right-0 bg-blue-50/50 z-10 flex justify-center py-2"><FiRefreshCw className="animate-spin text-blue-600 w-5 h-5" /></div>}

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Employee ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Employee Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Role</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Seller</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Joined</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {employees.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/employees/${emp._id}`)}>
                                            <td className="px-4 py-3">
                                                <span className="text-xs bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg font-semibold">{emp.employee_code || 'N/A'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                                                        {(emp.first_name?.[0] || 'E').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{emp.first_name} {emp.last_name}</p>
                                                        <p className="text-xs text-gray-500">{emp.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-left">
                                                <span className="text-sm text-gray-700 capitalize">{emp.employee_type || 'Employee'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-left text-sm text-gray-700">{emp.seller?.business_name || 'N/A'}</td>
                                            <td className="px-4 py-3">{getStatusBadge(emp.status)}</td>
                                            <td className="px-4 py-3 text-left text-sm text-gray-600">{emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-IN') : 'N/A'}</td>
                                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => navigate(`/admin/employees/${emp._id}`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><FiEye className="w-4 h-4" /></button>
                                                    <button onClick={() => navigate(`/admin/employees/${emp._id}/edit`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
                                                    {emp.status !== 'active' && <button onClick={() => setStatusConfirm({ open: true, employeeId: emp._id, action: 'activate' })} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Activate"><FiUserCheck className="w-4 h-4" /></button>}
                                                    {emp.status === 'active' && <button onClick={() => setStatusConfirm({ open: true, employeeId: emp._id, action: 'deactivate' })} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors" title="Deactivate"><FiUserX className="w-4 h-4" /></button>}
                                                    <button onClick={() => handleDelete(emp._id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {employees.map((emp) => (
                                <div key={emp._id} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                                                {(emp.first_name?.[0] || 'E').toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{emp.first_name} {emp.last_name}</p>
                                                <p className="text-xs text-gray-500">{emp.email}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(emp.status)}
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <p className="text-gray-500">Employee ID</p>
                                            <p className="font-semibold text-gray-900">{emp.employee_code || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Role</p>
                                            <p className="font-semibold text-gray-900 capitalize">{emp.employee_type || 'Employee'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Seller</p>
                                            <p className="font-semibold text-gray-900">{emp.seller?.business_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Joined</p>
                                            <p className="font-semibold text-gray-900">{emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-IN') : 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end gap-2">
                                        <button onClick={() => navigate(`/admin/employees/${emp._id}`)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><FiEye className="w-4 h-4" /></button>
                                        <button onClick={() => navigate(`/admin/employees/${emp._id}/edit`)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
                                        {emp.status !== 'active' && <button onClick={() => setStatusConfirm({ open: true, employeeId: emp._id, action: 'activate' })} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Activate"><FiUserCheck className="w-4 h-4" /></button>}
                                        {emp.status === 'active' && <button onClick={() => setStatusConfirm({ open: true, employeeId: emp._id, action: 'deactivate' })} className="p-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors" title="Deactivate"><FiUserX className="w-4 h-4" /></button>}
                                        <button onClick={() => handleDelete(emp._id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {employees.length === 0 && !isRefreshing && <div className="text-center py-10 text-gray-500">No employees found</div>}
                        {pagination.totalPages > 1 && (
                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-sm text-gray-600">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} employees</p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"><FiChevronLeft className="w-4 h-4" /></button>
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"><FiChevronRight className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, employeeId: null })} onConfirm={confirmDelete} title="Delete Employee" message="Are you sure you want to delete this employee? This action cannot be undone." confirmText="Delete" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
            <ConfirmDialog isOpen={statusConfirm.open} onClose={() => setStatusConfirm({ open: false, employeeId: null, action: 'activate' })} onConfirm={confirmStatusToggle} title={statusConfirm.action === 'activate' ? 'Activate Employee' : 'Deactivate Employee'} message={`Are you sure you want to ${statusConfirm.action === 'activate' ? 'activate' : 'deactivate'} this employee?`} confirmText={statusConfirm.action === 'activate' ? 'Activate' : 'Deactivate'} confirmColor={statusConfirm.action === 'activate' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'} />
        </div>
    );
};

export default Employees;