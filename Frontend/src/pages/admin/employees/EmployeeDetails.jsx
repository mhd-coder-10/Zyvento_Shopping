

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