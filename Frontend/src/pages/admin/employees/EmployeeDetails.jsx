// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//     FiArrowLeft,
//     FiUser,
//     FiMail,
//     FiPhone,
//     FiBriefcase,
//     FiCalendar,
//     FiCheckCircle,
//     FiXCircle,
//     FiClock,
//     FiEdit2,
//     FiTrash2,
//     FiUserCheck,
//     FiUserX,
//     FiShield,
//     FiPackage,
//     FiShoppingBag,
// } from 'react-icons/fi';

// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import LoadingSpinner from '../../../components/common/LoadingSpinner';
// import ConfirmDialog from '../../../components/common/ConfirmDialog';

// const EmployeeDetails = () => {
//     const { employeeId } = useParams();
//     const navigate = useNavigate();
//     const [employee, setEmployee] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [deleteConfirm, setDeleteConfirm] = useState({ open: false });
//     const [statusConfirm, setStatusConfirm] = useState({ open: false, action: 'activate' });

//     useEffect(() => {
//         fetchEmployeeDetails();
//     }, [employeeId]);

//     const fetchEmployeeDetails = async () => {
//         setLoading(true);
//         try {
//             const response = await ApiService.getEmployeeById(employeeId);
//             if (response.data.success) {
//                 setEmployee(response.data.data);
//             }
//         } catch (error) {
//             console.error('Failed to fetch employee details:', error);
//             toast.error(error.response?.data?.message || 'Failed to load employee details');
//             navigate('/admin/employees');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleStatusToggle = (action) => {
//         setStatusConfirm({ open: true, action });
//     };

//     const confirmStatusToggle = async () => {
//         try {
//             await ApiService.updateEmployeeStatus(employeeId, {
//                 status: statusConfirm.action === 'activate' ? 'active' : 'inactive',
//             });
//             toast.success(`Employee ${statusConfirm.action === 'activate' ? 'activated' : 'deactivated'} successfully`);
//             fetchEmployeeDetails();
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to update employee status');
//         } finally {
//             setStatusConfirm({ open: false, action: 'activate' });
//         }
//     };

//     const handleDelete = async () => {
//         try {
//             await ApiService.deleteEmployee(employeeId);
//             toast.success('Employee deleted successfully');
//             navigate('/admin/employees');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to delete employee');
//         } finally {
//             setDeleteConfirm({ open: false });
//         }
//     };

//     const getStatusBadge = (status) => {
//         const config = {
//             active: { color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800', icon: FiCheckCircle },
//             inactive: { color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700', icon: FiXCircle },
//             pending: { color: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800', icon: FiClock },
//             suspended: { color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800', icon: FiXCircle },
//         };
//         const { color, icon: Icon } = config[status] || config.pending;
//         return (
//             <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${color}`}>
//                 <Icon className="w-4 h-4" />
//                 {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
//             </span>
//         );
//     };

//     if (loading) {
//         return <LoadingSpinner fullPage text="Loading employee details..." />;
//     }

//     if (!employee) {
//         return (
//             <div className="text-center py-12">
//                 <p className="text-gray-500">Employee not found</p>
//                 <button
//                     onClick={() => navigate('/admin/employees')}
//                     className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
//                 >
//                     Go back to employees
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-sky-100 p-4 md:p-6">
//             <AdminTopbar
//                 title="Employee Details"
//                 subtitle={`${employee.first_name} ${employee.last_name}`}
//                 actions={
//                     <button
//                         onClick={() => navigate('/admin/employees')}
//                         className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm bg-white"
//                     >
//                         <FiArrowLeft className="w-4 h-4" />
//                         Back to Employees
//                     </button>
//                 }
//             />

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Left - Profile Card */}
//                 <div className="lg:col-span-1">
//                     <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-shadow p-6">
//                         <div className="text-center">
//                             <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 mx-auto flex items-center justify-center text-4xl font-bold text-white shadow-lg">
//                                 {(employee.first_name?.[0] || 'E').toUpperCase()}
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-900 mt-4">
//                                 {employee.first_name} {employee.last_name}
//                             </h2>
//                             <p className="text-sm text-gray-500">{employee.email}</p>
//                             <div className="mt-3">{getStatusBadge(employee.status)}</div>
//                         </div>

//                         <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
//                             <div className="flex items-center gap-3 text-sm">
//                                 <FiMail className="w-4 h-4 text-gray-400 flex-shrink-0" />
//                                 <span className="text-gray-700 truncate">{employee.email}</span>
//                             </div>
//                             <div className="flex items-center gap-3 text-sm">
//                                 <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
//                                 <span className="text-gray-700">{employee.mobile_number || 'N/A'}</span>
//                             </div>
//                             <div className="flex items-center gap-3 text-sm">
//                                 <FiBriefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
//                                 <span className="text-gray-700 capitalize">
//                                     {employee.employee_type || 'Employee'}
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-3 text-sm">
//                                 <FiShield className="w-4 h-4 text-gray-400 flex-shrink-0" />
//                                 <span className="text-gray-700">
//                                     {employee.seller?.business_name || 'N/A'}
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-3 text-sm">
//                                 <FiCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
//                                 <span className="text-gray-700">
//                                     Joined {new Date(employee.createdAt).toLocaleDateString('en-IN', {
//                                         day: 'numeric',
//                                         month: 'long',
//                                         year: 'numeric',
//                                     })}
//                                 </span>
//                             </div>
//                         </div>

//                         <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col gap-2">
//                             {employee.status !== 'active' && (
//                                 <button
//                                     onClick={() => handleStatusToggle('activate')}
//                                     className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition-all hover:scale-[1.02]"
//                                 >
//                                     <FiUserCheck className="w-4 h-4" />
//                                     Activate Employee
//                                 </button>
//                             )}
//                             {employee.status !== 'inactive' && employee.status !== 'suspended' && (
//                                 <button
//                                     onClick={() => handleStatusToggle('deactivate')}
//                                     className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition-all hover:scale-[1.02]"
//                                 >
//                                     <FiUserX className="w-4 h-4" />
//                                     Deactivate Employee
//                                 </button>
//                             )}
//                             <button
//                                 onClick={() => navigate(`/admin/employees/edit/${employee._id}`)}
//                                 className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition-all hover:scale-[1.02]"
//                             >
//                                 <FiEdit2 className="w-4 h-4" />
//                                 Edit Employee
//                             </button>
//                             <button
//                                 onClick={() => setDeleteConfirm({ open: true })}
//                                 className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition-all hover:scale-[1.02]"
//                             >
//                                 <FiTrash2 className="w-4 h-4" />
//                                 Delete Employee
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right - Stats & Info */}
//                 <div className="lg:col-span-2 space-y-6">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 border-l-4 border-blue-500">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2.5 bg-blue-50 rounded-xl">
//                                     <FiPackage className="w-5 h-5 text-blue-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-2xl font-bold text-gray-900">0</p>
//                                     <p className="text-xs text-gray-500">Orders Processed</p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 border-l-4 border-green-500">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2.5 bg-green-50 rounded-xl">
//                                     <FiShoppingBag className="w-5 h-5 text-green-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-2xl font-bold text-gray-900">0</p>
//                                     <p className="text-xs text-gray-500">Products Managed</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
//                         <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
//                         <div className="text-center py-8 text-gray-500">
//                             <p>No activity logs found</p>
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
//                         <h3 className="font-semibold text-gray-800 mb-4">Assigned Permissions</h3>
//                         <div className="flex flex-wrap gap-2">
//                             <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl text-sm text-gray-700 shadow-sm">view_orders</span>
//                             <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl text-sm text-gray-700 shadow-sm">update_orders</span>
//                             <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl text-sm text-gray-700 shadow-sm">view_products</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <ConfirmDialog
//                 isOpen={deleteConfirm.open}
//                 onClose={() => setDeleteConfirm({ open: false })}
//                 onConfirm={handleDelete}
//                 title="Delete Employee"
//                 message="Are you sure you want to delete this employee? This action cannot be undone."
//                 confirmText="Delete"
//                 confirmColor="bg-red-600 hover:bg-red-700"
//             />

//             <ConfirmDialog
//                 isOpen={statusConfirm.open}
//                 onClose={() => setStatusConfirm({ open: false, action: 'activate' })}
//                 onConfirm={confirmStatusToggle}
//                 title={statusConfirm.action === 'activate' ? 'Activate Employee' : 'Deactivate Employee'}
//                 message={`Are you sure you want to ${statusConfirm.action === 'activate' ? 'activate' : 'deactivate'} this employee?`}
//                 confirmText={statusConfirm.action === 'activate' ? 'Activate' : 'Deactivate'}
//                 confirmColor={statusConfirm.action === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
//             />
//         </div>
//     );
// };

// export default EmployeeDetails;







// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//     FiArrowLeft, FiUser, FiMail, FiPhone, FiBriefcase,
//     FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiEdit2, FiTrash2,
//     FiUserCheck, FiUserX, FiPackage, FiShoppingBag, FiShield, FiRefreshCw,
// } from 'react-icons/fi';

// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import ConfirmDialog from '../../../components/common/ConfirmDialog';

// const EmployeeDetails = () => {
//     const { employeeId } = useParams();
//     const navigate = useNavigate();
//     const [employee, setEmployee] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [deleteConfirm, setDeleteConfirm] = useState({ open: false });
//     const [statusConfirm, setStatusConfirm] = useState({ open: false, action: 'activate' });

//     useEffect(() => {
//         fetchEmployeeDetails();
//     }, [employeeId]);

//     const fetchEmployeeDetails = async () => {
//         setLoading(true);
//         try {
//             const response = await ApiService.getEmployeeById(employeeId);
//             if (response.data.success) {
//                 setEmployee(response.data.data);
//             }
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to load employee details');
//             navigate('/admin/employees');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ✅ Optimistic Status Update (No Full Reload)
//     const confirmStatusToggle = async () => {
//         const newStatus = statusConfirm.action === 'activate' ? 'active' : 'inactive';
//         // Optimistic update - turant UI mein change
//         setEmployee(prev => prev ? { ...prev, status: newStatus } : prev);
//         try {
//             await ApiService.updateEmployeeStatus(employeeId, { status: newStatus });
//             toast.success(`Employee ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
//         } catch (error) {
//             fetchEmployeeDetails();
//             toast.error(error.response?.data?.message || 'Failed to update employee status');
//         } finally {
//             setStatusConfirm({ open: false, action: 'activate' });
//         }
//     };

//     const handleDelete = async () => {
//         try {
//             await ApiService.deleteEmployee(employeeId);
//             toast.success('Employee deleted successfully');
//             navigate('/admin/employees');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to delete employee');
//         } finally {
//             setDeleteConfirm({ open: false });
//         }
//     };

//     const getStatusBadge = (status) => {
//         const config = {
//             active: { color: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: FiCheckCircle, label: 'Active' },
//             inactive: { color: 'bg-gray-50 text-gray-700 border border-gray-300', icon: FiXCircle, label: 'Inactive' },
//             pending: { color: 'bg-amber-50 text-amber-800 border border-amber-300', icon: FiClock, label: 'Pending' },
//             suspended: { color: 'bg-orange-50 text-orange-800 border border-orange-300', icon: FiXCircle, label: 'Suspended' },
//         };
//         const { color, icon: Icon, label } = config[status] || config.pending;
//         return (
//             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${color}`}>
//                 <Icon className="w-3 h-3" /> {label}
//             </span>
//         );
//     };

//     if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin text-blue-600 w-8 h-8" /></div>;
//     if (!employee) return <div className="text-center py-12 text-gray-500">Employee not found</div>;

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Employee Details"
//                 subtitle={`${employee.first_name} ${employee.last_name}`}
//                 actions={
//                     <div className="flex items-center gap-2">
//                         <button onClick={() => navigate(`/admin/employees/edit/${employee._id}`)} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
//                             <FiEdit2 className="w-4 h-4" /> Edit
//                         </button>
//                         <button onClick={() => navigate('/admin/employees')} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
//                             <FiArrowLeft className="w-4 h-4" /> Back to Employees
//                         </button>
//                     </div>
//                 }
//             />

//             <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
//                 {/* Profile Header */}
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
//                         <div className="flex items-center gap-4">
//                             <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
//                                 {(employee.first_name?.[0] || 'E').toUpperCase()}
//                             </div>
//                             <div>
//                                 <div className="flex items-center gap-3">
//                                     <h2 className="text-2xl font-bold text-gray-900">{employee.first_name} {employee.last_name}</h2>
//                                     {getStatusBadge(employee.status)}
//                                 </div>
//                                 <p className="text-gray-600 mt-1">{employee.email}</p>
//                                 <div className="flex items-center gap-4 mt-2">
//                                     <span className="flex items-center gap-1.5 text-sm text-gray-700"><FiBriefcase className="w-4 h-4 text-blue-500" />{employee.employee_type || 'Employee'}</span>
//                                     <span className="flex items-center gap-1.5 text-sm text-gray-700"><FiShield className="w-4 h-4 text-purple-500" />{employee.seller?.business_name || 'N/A'}</span>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="flex flex-col sm:flex-row gap-2">
//                             {employee.status !== 'active' && (
//                                 <button onClick={() => setStatusConfirm({ open: true, action: 'activate' })} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
//                                     <FiUserCheck className="w-4 h-4" /> Activate
//                                 </button>
//                             )}
//                             {employee.status === 'active' && (
//                                 <button onClick={() => setStatusConfirm({ open: true, action: 'deactivate' })} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
//                                     <FiUserX className="w-4 h-4" /> Deactivate
//                                 </button>
//                             )}
//                             <button onClick={() => setDeleteConfirm({ open: true })} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
//                                 <FiTrash2 className="w-4 h-4" /> Delete
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Stats & Info */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                         <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiUser className="w-5 h-5 text-blue-600" /> Contact Information</h3>
//                         <div className="space-y-3">
//                             <div className="flex items-center gap-2 text-sm text-gray-700"><FiMail className="w-4 h-4 text-gray-400" /> {employee.email}</div>
//                             <div className="flex items-center gap-2 text-sm text-gray-700"><FiPhone className="w-4 h-4 text-gray-400" /> {employee.mobile_number || 'N/A'}</div>
//                         </div>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                         <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiBriefcase className="w-5 h-5 text-blue-600" /> Role & Assignment</h3>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div><p className="text-xs text-gray-500">Role</p><p className="text-sm font-medium text-gray-900 capitalize">{employee.employee_type || 'N/A'}</p></div>
//                             <div><p className="text-xs text-gray-500">Seller</p><p className="text-sm font-medium text-gray-900">{employee.seller?.business_name || 'N/A'}</p></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false })} onConfirm={handleDelete} title="Delete Employee" message="Are you sure you want to delete this employee? This action cannot be undone." confirmText="Delete" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
//             <ConfirmDialog isOpen={statusConfirm.open} onClose={() => setStatusConfirm({ open: false, action: 'activate' })} onConfirm={confirmStatusToggle} title={statusConfirm.action === 'activate' ? 'Activate Employee' : 'Deactivate Employee'} message={`Are you sure you want to ${statusConfirm.action === 'activate' ? 'activate' : 'deactivate'} this employee?`} confirmText={statusConfirm.action === 'activate' ? 'Activate' : 'Deactivate'} confirmColor={statusConfirm.action === 'activate' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'} />
//         </div>
//     );
// };

// export default EmployeeDetails;




import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft, FiUser, FiMail, FiPhone, FiBriefcase,
    FiCheckCircle, FiXCircle, FiClock, FiEdit2, FiTrash2, FiUserCheck, FiUserX,
    FiRefreshCw, FiTrendingUp, FiShield, FiFileText,
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const EmployeeDetails = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [performance, setPerformance] = useState(null);
    const [sellers, setSellers] = useState([]);
    const [careerHistory, setCareerHistory] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false });
    const [statusConfirm, setStatusConfirm] = useState({ open: false, action: 'activate' });

    useEffect(() => {
        fetchEmployeeDetails();
    }, [employeeId]);

    const fetchEmployeeDetails = async () => {
        setLoading(true);
        try {
            const [empRes, perfRes, sellerRes, historyRes] = await Promise.all([
                ApiService.getEmployeeById(employeeId),
                ApiService.getEmployeePerformance(employeeId, { period: 'monthly' }),
                ApiService.getEmployeeSellers(employeeId),
                ApiService.getEmployeeCareerHistory(employeeId, { page: 1, limit: 10 }),
            ]);
            if (empRes.data.success) setEmployee(empRes.data.data);
            if (perfRes.data.success) setPerformance(perfRes.data.data);
            if (sellerRes.data.success) setSellers(sellerRes.data.data?.current_sellers || []);
            if (historyRes.data.success) setCareerHistory(historyRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load employee details');
            navigate('/admin/employees');
        } finally {
            setLoading(false);
        }
    };

    const confirmStatusToggle = async () => {
        const newStatus = statusConfirm.action === 'activate' ? 'active' : 'inactive';
        setEmployee(prev => prev ? { ...prev, status: newStatus } : prev);
        try {
            await ApiService.updateEmployeeStatus(employeeId, { status: newStatus });
            toast.success(`Employee ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            fetchEmployeeDetails();
            toast.error('Failed to update employee status');
        } finally {
            setStatusConfirm({ open: false, action: 'activate' });
        }
    };

    const handleDelete = async () => {
        try {
            await ApiService.deleteEmployee(employeeId);
            toast.success('Employee deleted successfully');
            navigate('/admin/employees');
        } catch (error) {
            toast.error('Failed to delete employee');
        } finally {
            setDeleteConfirm({ open: false });
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { color: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: FiCheckCircle, label: 'Active' },
            inactive: { color: 'bg-gray-50 text-gray-700 border border-gray-300', icon: FiXCircle, label: 'Inactive' },
            pending: { color: 'bg-amber-50 text-amber-800 border border-amber-300', icon: FiClock, label: 'Pending' },
            blocked: { color: 'bg-orange-50 text-orange-800 border border-orange-300', icon: FiXCircle, label: 'Blocked' },
        };
        const { color, icon: Icon, label } = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${color}`}>
                <Icon className="w-3 h-3" /> {label}
            </span>
        );
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin text-blue-600 w-8 h-8" /></div>;
    if (!employee) return <div className="text-center py-12 text-gray-500">Employee not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Employee Details"
                subtitle={`${employee.first_name} ${employee.last_name} (${employee.employee_code})`}
                actions={
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/employees/${employeeId}/edit`)} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                            <FiEdit2 className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => navigate('/admin/employees')} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                            <FiArrowLeft className="w-4 h-4" /> Back to Employees
                        </button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-sky-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                {(employee.first_name?.[0] || 'E').toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-gray-900">{employee.first_name} {employee.last_name}</h2>
                                    {getStatusBadge(employee.status)}
                                </div>
                                <p className="text-gray-600 mt-1">{employee.email}</p>
                                <p className="text-sm text-blue-600 font-semibold mt-1">Employee ID: {employee.employee_code}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1.5 text-sm text-gray-700"><FiBriefcase className="w-4 h-4 text-blue-500" />{employee.employee_type}</span>
                                    <span className="flex items-center gap-1.5 text-sm text-gray-700"><FiShield className="w-4 h-4 text-purple-500" />{employee.seller?.business_name || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {employee.status !== 'active' && <button onClick={() => setStatusConfirm({ open: true, action: 'activate' })} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"><FiUserCheck className="w-4 h-4" /> Activate</button>}
                            {employee.status === 'active' && <button onClick={() => setStatusConfirm({ open: true, action: 'deactivate' })} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"><FiUserX className="w-4 h-4" /> Deactivate</button>}
                            <button onClick={() => setDeleteConfirm({ open: true })} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"><FiTrash2 className="w-4 h-4" /> Delete</button>
                        </div>
                    </div>
                </div>

                {/* Performance */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiTrendingUp className="w-5 h-5 text-blue-600" /> Performance (Monthly)</h3>
                    {performance ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-xl"><p className="text-sm text-gray-600">Orders Processed</p><p className="text-2xl font-bold text-gray-900">{performance.total_orders || 0}</p></div>
                            <div className="p-4 bg-purple-50 rounded-xl"><p className="text-sm text-gray-600">Products Managed</p><p className="text-2xl font-bold text-gray-900">{performance.total_products || 0}</p></div>
                            <div className="p-4 bg-emerald-50 rounded-xl"><p className="text-sm text-gray-600">Tasks Completed</p><p className="text-2xl font-bold text-gray-900">{performance.total_tasks_completed || 0}</p></div>
                            <div className="p-4 bg-yellow-50 rounded-xl"><p className="text-sm text-gray-600">Efficiency Score</p><p className="text-2xl font-bold text-gray-900">{performance.efficiency_score || 0}%</p></div>
                        </div>
                    ) : <div className="text-center py-6 text-gray-500">No performance data</div>}
                </div>

                {/* Assigned Sellers */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiShield className="w-5 h-5 text-blue-600" /> Assigned Sellers</h3>
                    {sellers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {sellers.map((seller, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="font-semibold text-gray-900">{seller.business_name}</p>
                                    <p className="text-xs text-gray-500">{seller.owner_name}</p>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-center py-4 text-gray-500">No sellers assigned</div>}
                </div>

                {/* Career History */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiFileText className="w-5 h-5 text-blue-600" /> Career History</h3>
                    {careerHistory.length > 0 ? (
                        <div className="space-y-4">
                            {careerHistory.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="p-2 bg-blue-50 rounded-lg"><FiBriefcase className="w-4 h-4 text-blue-600" /></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.action || item.change_reason}</p>
                                        <p className="text-xs text-gray-500">{new Date(item.created_at || item.changed_at).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-center py-4 text-gray-500">No career history</div>}
                </div>

                {/* Contact & Role Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiUser className="w-5 h-5 text-blue-600" /> Contact Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-700"><FiMail className="w-4 h-4 text-gray-400" /> {employee.email}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-700"><FiPhone className="w-4 h-4 text-gray-400" /> {employee.mobile_number || 'N/A'}</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiBriefcase className="w-5 h-5 text-blue-600" /> Role & Assignment</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-xs text-gray-500">Role</p><p className="text-sm font-medium text-gray-900 capitalize">{employee.employee_type || 'N/A'}</p></div>
                            <div><p className="text-xs text-gray-500">Seller</p><p className="text-sm font-medium text-gray-900">{employee.seller?.business_name || 'N/A'}</p></div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false })} onConfirm={handleDelete} title="Delete Employee" message="Are you sure you want to delete this employee? This action cannot be undone." confirmText="Delete" confirmColor="bg-gradient-to-r from-rose-500 to-red-600" />
            <ConfirmDialog isOpen={statusConfirm.open} onClose={() => setStatusConfirm({ open: false, action: 'activate' })} onConfirm={confirmStatusToggle} title={statusConfirm.action === 'activate' ? 'Activate Employee' : 'Deactivate Employee'} message={`Are you sure you want to ${statusConfirm.action === 'activate' ? 'activate' : 'deactivate'} this employee?`} confirmText={statusConfirm.action === 'activate' ? 'Activate' : 'Deactivate'} confirmColor={statusConfirm.action === 'activate' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'} />
        </div>
    );
};

export default EmployeeDetails;