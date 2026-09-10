import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft, FiSave, FiRefreshCw, FiShuffle, FiX, FiAlertCircle,
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const EmployeeEdit = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [roles, setRoles] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [selectedNewSeller, setSelectedNewSeller] = useState('');
    const [transferring, setTransferring] = useState(false);
    const [transferConfirm, setTransferConfirm] = useState({ open: false });

    useEffect(() => {
        fetchEmployeeData();
    }, [employeeId]);

    const fetchEmployeeData = async () => {
        try {
            const [empRes, rolesRes, sellersRes] = await Promise.all([
                ApiService.getEmployeeById(employeeId),
                ApiService.getAllRoles({ limit: 100 }),
                ApiService.getAllSellers({ limit: 100 }),
            ]);
            if (empRes.data.success) setEmployee(empRes.data.data);
            if (rolesRes.data.success) setRoles(rolesRes.data.data || []);
            if (sellersRes.data.success) setSellers(sellersRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load employee data');
            navigate('/admin/employees');
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!selectedNewSeller) return;
        setTransferring(true);
        try {
            await ApiService.transferEmployee(employeeId, { newSellerId: selectedNewSeller });
            toast.success('Employee transferred successfully');
            navigate(`/admin/employees/${employeeId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to transfer employee');
        } finally {
            setTransferring(false);
            setTransferConfirm({ open: false });
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin text-blue-600 w-8 h-8" /></div>;
    if (!employee) return <div className="text-center py-12 text-gray-500">Employee not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Edit Employee"
                subtitle={`${employee.first_name} ${employee.last_name} (${employee.employee_code})`}
                actions={
                    <button onClick={() => navigate(`/admin/employees/${employeeId}`)} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                        <FiArrowLeft className="w-4 h-4" /> Back to Details
                    </button>
                }
            />

            <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label><input type="text" value={employee.first_name} readOnly className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" /></div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label><input type="text" value={employee.last_name} readOnly className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" /></div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Email</label><input type="text" value={employee.email} readOnly className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" /></div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Mobile</label><input type="text" value={employee.mobile_number} readOnly className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" /></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                        <FiShuffle className="w-5 h-5 text-indigo-600" /> Transfer to Another Seller
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Select New Seller</label>
                            <select
                                value={selectedNewSeller}
                                onChange={(e) => setSelectedNewSeller(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm"
                            >
                                <option value="">Select Seller</option>
                                {sellers.map((seller) => (
                                    <option key={seller._id} value={seller._id}>
                                        {seller.business_name || seller.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => setTransferConfirm({ open: true })}
                            disabled={!selectedNewSeller || transferring}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            <FiShuffle className="w-4 h-4" /> {transferring ? 'Transferring...' : 'Transfer Employee'}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={transferConfirm.open}
                onClose={() => setTransferConfirm({ open: false })}
                onConfirm={handleTransfer}
                title="Transfer Employee"
                message="Are you sure you want to transfer this employee to a new seller? This will update their assignments."
                confirmText="Transfer"
                confirmColor="bg-gradient-to-r from-indigo-500 to-purple-600"
            />
        </div>
    );
};

export default EmployeeEdit;