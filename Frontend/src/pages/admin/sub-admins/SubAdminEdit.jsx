
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiSave, FiUser, FiBriefcase, FiMail, FiPhone,
    FiShield, FiAlertCircle, FiRefreshCw, FiChevronDown, FiX, FiActivity
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const STATUS_LABELS = {
    pending: 'Pending',
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended'
};

const ALLOWED_TRANSITIONS = {
    pending: ['active', 'inactive'],
    active: ['inactive', 'suspended'],
    inactive: ['active', 'suspended'],
    suspended: ['active', 'inactive']
};

const REASON_REQUIRED = {
    suspended: 'suspended_reason'
};

const STATUS_BADGE_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-50 text-slate-600 border-slate-200',
    suspended: 'bg-rose-50 text-rose-700 border-rose-200'
};

const SUB_ADMIN_TYPE_LABELS = {
    manager: 'Manager',
    finance_manager: 'Finance Manager',
    support_manager: 'Support Manager',
    seller_manager: 'Seller Manager'
};

// ================= FIELD COMPONENTS =================
const InputField = ({ label, name, type = 'text', icon: Icon, value, error, onChange, hint, ...props }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500">
                    <Icon size={18} />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value ?? ''}
                onChange={onChange}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 bg-white border ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                    } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400`}
                {...props}
            />
        </div>
        {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle size={12} /> {error}
            </p>
        )}
    </div>
);

const SelectField = ({ label, name, icon: Icon, options = [], value, error, onChange }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none">
                    <Icon size={18} />
                </div>
            )}
            <select
                name={name}
                value={value ?? ''}
                onChange={onChange}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-9 py-2.5 bg-white border ${error ? 'border-red-300' : 'border-slate-200 focus:border-blue-500'
                    } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none transition-all`}
            >
                {options.map((o) => (
                    <option key={String(o.value)} value={o.value}>{o.label}</option>
                ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
        </div>
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle size={12} /> {error}
            </p>
        )}
    </div>
);

// ================= MAIN COMPONENT =================
const SubAdminEdit = () => {
    const { subAdminCode } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [fetchError, setFetchError] = useState('');

    const [currentStatus, setCurrentStatus] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusReason, setStatusReason] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [originalData, setOriginalData] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        mobile_number: '',
        sub_admin_type: 'manager',
        department: '',
        designation: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    // ================= FETCH =================
    // const fetchData = useCallback(async ({ silent = false } = {}) => {
    //     if (!subAdminCode) return;
    //     silent ? setRefreshing(true) : setLoading(true);
    //     setFetchError('');
    //     try {
    //         const res = await ApiService.getSubAdminByCode(subAdminCode);
    //         const data = res?.data?.data?.subAdmin || {};

    //         setCurrentStatus(data.status || 'pending');
    //         setFormData({
    //             full_name: data.full_name || '',
    //             email: data.email || '',
    //             mobile_number: data.mobile_number || '',
    //             sub_admin_type: data.sub_admin_type || 'manager',
    //             department: data.department || '',
    //             designation: data.designation || '',
    //             notes: data.notes || ''
    //         });
    //     } catch (error) {
    //         setFetchError(error?.response?.data?.message || 'Failed to fetch');
    //         toast.error('Failed to load Sub-Admin');
    //     } finally {
    //         setLoading(false);
    //         setRefreshing(false);
    //     }
    // }, [subAdminCode]);

    const fetchData = useCallback(async ({ silent = false } = {}) => {
        if (!subAdminCode) return;
        silent ? setRefreshing(true) : setLoading(true);
        setFetchError('');
        try {
            const res = await ApiService.getSubAdminByCode(subAdminCode);
            const data = res?.data?.data?.subAdmin || {};

            const fetchedData = {
                full_name: data.full_name || '',
                email: data.email || '',
                mobile_number: data.mobile_number || '',
                sub_admin_type: data.sub_admin_type || 'manager',
                department: data.department || '',
                designation: data.designation || '',
                notes: data.notes || ''
            };

            setCurrentStatus(data.status || 'pending');
            setFormData(fetchedData);
            setOriginalData(fetchedData);   // 👈 Original snapshot save karo
        } catch (error) {
            setFetchError(error?.response?.data?.message || 'Failed to fetch');
            toast.error('Failed to load Sub-Admin');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [subAdminCode]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ================= FORM HANDLERS =================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // Check Value update or not in Form
    const hasFormChanged = () => {
        if (!originalData) return false;
        const fields = ['full_name', 'email', 'mobile_number', 'sub_admin_type', 'department', 'designation', 'notes'];
        return fields.some((key) => {
            const current = String(formData[key] ?? '').trim();
            const original = String(originalData[key] ?? '').trim();
            return current !== original;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 👇 Check karo ke form me kuch change hua hai ya nahi
        if (!hasFormChanged()) {
            toast.warning('No changes detected. Please modify at least one field before saving.');
            return;
        }

        const errs = {};
        if (!formData.full_name?.trim()) errs.full_name = 'Full name is required';
        if (!formData.department?.trim()) errs.department = 'Department is required';
        if (!formData.sub_admin_type) errs.sub_admin_type = 'Type is required';

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            toast.error('Please fix the form errors');
            return;
        }

        setSaving(true);
        try {
            await ApiService.updateSubAdminDetails(subAdminCode, formData);
            toast.success('Sub-Admin updated successfully');
            navigate('/admin/sub-admins');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };


    const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];

    const handleStatusDropdownChange = (e) => {
        const newStatus = e.target.value;
        if (!newStatus || newStatus === currentStatus) return;
        setSelectedStatus(newStatus);
        setStatusReason('');
        setStatusNotes('');
        setShowStatusModal(true);
    };

    const handleStatusConfirm = async () => {
        if (!selectedStatus) return;

        const needsReason = REASON_REQUIRED[selectedStatus];
        if (needsReason && !statusReason.trim()) {
            toast.error('Please provide a reason for suspension');
            return;
        }

        setUpdatingStatus(true);
        try {
            await ApiService.updateSubAdminStatus(subAdminCode, {
                status: selectedStatus,
                reason: statusReason || '',
                notes: statusNotes || ''
            });
            toast.success(`Status updated to ${STATUS_LABELS[selectedStatus]}`);
            setShowStatusModal(false);
            setSelectedStatus('');
            setStatusReason('');
            setStatusNotes('');
            fetchData({ silent: true });
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Status update failed');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleBack = () => {
        if (window.history.length > 2) navigate(-1);
        else navigate('/admin/sub-admins');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    const requiresReason = REASON_REQUIRED[selectedStatus];

    return (
        <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50">
            <AdminTopbar
                title="Edit Sub-Admin"
                subtitle={formData.full_name || subAdminCode}
                actions={
                    <button
                        type="button"
                        onClick={() => fetchData({ silent: true })}
                        disabled={refreshing}
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 disabled:opacity-60 sm:px-4"
                    >
                        <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                }
            />

            <main className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6">

                {fetchError && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <span className="flex items-center gap-2"><FiAlertCircle /> {fetchError}</span>
                        <button onClick={() => fetchData({ silent: true })} className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 font-medium">
                            Retry
                        </button>
                    </div>
                )}

                {/* STATUS MANAGEMENT */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-md">
                                <FiShield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Status Management</h3>
                                <p className="text-xs text-slate-500">Control Sub-Admin account access</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* Current Status */}
                            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Status</p>
                                <span className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-base font-bold capitalize ${STATUS_BADGE_STYLES[currentStatus]}`}>
                                    <span className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
                                    {STATUS_LABELS[currentStatus] || currentStatus}
                                </span>
                            </div>

                            {/* Change Status */}
                            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50/50 to-white p-5">
                                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Change Status To</p>
                                {allowedNextStatuses.length === 0 ? (
                                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                        <FiAlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                                        <p className="text-sm font-semibold text-amber-800">No transitions available</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value=""
                                            onChange={handleStatusDropdownChange}
                                            className="w-full cursor-pointer appearance-none rounded-xl border-2 border-blue-200 bg-white px-4 py-3.5 pr-10 font-semibold text-slate-800 shadow-sm outline-none transition-colors hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select new status...</option>
                                            {allowedNextStatuses.map((s) => (
                                                <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-blue-50 p-1.5">
                                            <FiChevronDown className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                            <FiUser className="text-blue-600" /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <InputField
                                label="Full Name *"
                                name="full_name"
                                icon={FiUser}
                                value={formData.full_name}
                                error={errors.full_name}
                                onChange={handleChange}
                                placeholder="e.g., John Doe"
                            />
                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                icon={FiMail}
                                value={formData.email}
                                onChange={handleChange}
                                disabled
                                hint="Email cannot be changed"
                            />
                            <InputField
                                label="Mobile Number"
                                name="mobile_number"
                                icon={FiPhone}
                                value={formData.mobile_number}
                                onChange={handleChange}
                                placeholder="9876543210"
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                            <FiBriefcase className="text-blue-600" /> Role & Department
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <SelectField
                                label="Sub-Admin Type *"
                                name="sub_admin_type"
                                icon={FiShield}
                                value={formData.sub_admin_type}
                                error={errors.sub_admin_type}
                                onChange={handleChange}
                                options={Object.entries(SUB_ADMIN_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                            />
                            <InputField
                                label="Department *"
                                name="department"
                                icon={FiBriefcase}
                                value={formData.department}
                                error={errors.department}
                                onChange={handleChange}
                                placeholder="e.g., Operations"
                            />
                            <InputField
                                label="Designation"
                                name="designation"
                                icon={FiActivity}
                                value={formData.designation}
                                onChange={handleChange}
                                placeholder="e.g., Senior Manager"
                            />
                        </div>
                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-slate-700">Internal Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Any internal notes about this Sub-Admin..."
                                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 font-medium text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-sky-600 disabled:opacity-60"
                        >
                            <FiSave size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </main>

            {/* STATUS MODAL */}
            {showStatusModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
                    onClick={() => setShowStatusModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">
                                Change Status to {STATUS_LABELS[selectedStatus]}
                            </h3>
                            <button onClick={() => setShowStatusModal(false)} className="rounded-lg p-1 hover:bg-gray-100">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">
                                Current: <span className="font-semibold">{STATUS_LABELS[currentStatus]}</span>
                                {' → '}
                                New: <span className="font-semibold text-blue-600">{STATUS_LABELS[selectedStatus]}</span>
                            </p>

                            {requiresReason ? (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Reason *</label>
                                    <textarea
                                        value={statusReason}
                                        onChange={(e) => setStatusReason(e.target.value)}
                                        rows={3}
                                        placeholder="Why are you suspending this Sub-Admin?"
                                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Notes (Optional)</label>
                                    <textarea
                                        value={statusNotes}
                                        onChange={(e) => setStatusNotes(e.target.value)}
                                        rows={3}
                                        placeholder="Add any internal notes..."
                                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowStatusModal(false)}
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStatusConfirm}
                                    disabled={updatingStatus}
                                    className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {updatingStatus ? 'Updating...' : 'Confirm Change'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default SubAdminEdit;