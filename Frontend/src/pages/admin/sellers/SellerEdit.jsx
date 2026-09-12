

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiTrendingUp,
    FiArrowLeft,
    FiSave,
    FiUser,
    FiBriefcase,
    FiMapPin,
    FiMail,
    FiPhone,
    FiShield,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiAlertCircle,
    FiRefreshCw,
    FiChevronDown,
    FiX,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';


/* ================= STATUS CONFIG ================= */

const STATUS_LABELS = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
};

// Allowed status transitions (must match backend logic)
const ALLOWED_TRANSITIONS = {
    pending: ['approved', 'rejected'],
    approved: ['active'],
    active: ['inactive', 'suspended'],
    inactive: ['active', 'suspended'],
    suspended: ['active', 'inactive'],
    rejected: ['pending'],
};

// Which statuses require a reason/notes input
const REASON_REQUIRED = {
    rejected: 'rejection_reason',
    suspended: 'suspension_reason',
};

const STATUS_BADGE_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-50 text-slate-600 border-slate-200',
    suspended: 'bg-rose-50 text-rose-700 border-rose-200',
};

/* ================= FIELD COMPONENTS ================= */

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
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 bg-white border ${error ? 'border-red-300 focus:border-red-500' : 'border-sky-200 focus:border-blue-500'
                    } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400`}
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

const SelectField = ({ label, name, icon: Icon, options = [], value, error, onChange, disabled }) => (
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
                disabled={disabled}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-9 py-2.5 bg-white border ${error ? 'border-red-300' : 'border-sky-200 focus:border-blue-500'
                    } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none transition-all disabled:bg-slate-50 disabled:text-slate-400`}
            >
                {options.map((o) => (
                    <option key={String(o.value)} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ▼
            </span>
        </div>
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle size={12} /> {error}
            </p>
        )}
    </div>
);

/* ================= MAIN COMPONENT ================= */

const SellerEdit = () => {
    const { sellerCode } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [fetchError, setFetchError] = useState('');

    const [currentStatus, setCurrentStatus] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusReason, setStatusReason] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);

    const [formData, setFormData] = useState({
        business_name: '',
        owner_name: '',
        email: '',
        mobile_number: '',
        business_type: 'individual',
        gst_number: '',
        pan_number: '',
        business_address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zip_code: '',
        },
        commission_rate: 10,
        settings: {
            order_processing_time: 24,
            return_policy: '',
        },
    });

    const [errors, setErrors] = useState({});

    /* ================= FETCH SELLER ================= */

    const fetchSeller = useCallback(async () => {
        if (!sellerCode) return;
        setLoading(true);
        setFetchError('');
        try {
            const res = await ApiService.getSellerByCode(sellerCode);
            const data = res?.data?.data?.seller || res?.data?.seller || res?.data?.data || res?.data || {};

            setCurrentStatus(data.account_status || 'pending');
            setFormData({
                business_name: data.business_name || '',
                owner_name: data.owner_name || '',
                email: data.email || '',
                mobile_number: data.mobile_number || '',
                business_type: data.business_type || 'individual',
                gst_number: data.gst_number || '',
                pan_number: data.pan_number || '',
                business_address: {
                    street: data.business_address?.street || '',
                    city: data.business_address?.city || '',
                    state: data.business_address?.state || '',
                    country: data.business_address?.country || '',
                    zip_code: data.business_address?.zip_code || '',
                },
                commission_rate: data.commission_rate ?? 10,
                settings: {
                    order_processing_time: data.settings?.order_processing_time || 24,
                    return_policy: data.settings?.return_policy || '',
                },
            });
        } catch (error) {
            console.error('Error fetching seller:', error);
            setFetchError(error?.response?.data?.message || error?.message || 'Failed to fetch seller');
            toast.error('Failed to fetch seller');
        } finally {
            setLoading(false);
        }
    }, [sellerCode]);

    useEffect(() => {
        fetchSeller();
    }, [fetchSeller]);

    /* ================= FORM HANDLERS ================= */

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            business_address: { ...prev.business_address, [name]: value },
        }));
    };

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            settings: { ...prev.settings, [name]: value },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const errs = {};
        if (!formData.business_name?.trim()) errs.business_name = 'Business name is required';
        if (!formData.owner_name?.trim()) errs.owner_name = 'Owner name is required';
        if (!formData.email?.trim()) errs.email = 'Email is required';

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            toast.error('Please fix the form errors');
            return;
        }

        setSaving(true);
        try {
            await ApiService.updateSellerDetails(sellerCode, formData);
            toast.success('Seller details updated successfully');
            fetchSeller();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update seller');
        } finally {
            setSaving(false);
        }
    };

    /* ================= STATUS HANDLERS ================= */

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

        // Validate reason if required
        const needsReason = REASON_REQUIRED[selectedStatus];
        if (needsReason && !statusReason.trim()) {
            toast.error('Please provide a reason for this status change');
            return;
        }

        setUpdatingStatus(true);
        try {
            const payload = {
                status: selectedStatus,
                reason: statusReason || '',
                notes: statusNotes || '',
            };

            await ApiService.updateSellerStatus(sellerCode, payload);
            toast.success(`Seller status updated to ${STATUS_LABELS[selectedStatus]}`);
            setShowStatusModal(false);
            setSelectedStatus('');
            setStatusReason('');
            setStatusNotes('');
            fetchSeller();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    /* ================= RENDER ================= */

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#eaf4ff] to-white flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-700 font-medium">Loading seller details...</p>
                </div>
            </div>
        );
    }

    const requiresReason = REASON_REQUIRED[selectedStatus];

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#eaf4ff] to-white pb-10">
            {/* HEADER */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-20">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => navigate(`/admin/sellers/${sellerCode}`)}
                            className="p-2.5 bg-sky-50 text-slate-700 border border-sky-200 rounded-xl hover:bg-sky-100 shrink-0"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div className="min-w-0">
                            <h1
                                className="truncate"
                                style={{
                                    color: '#0f172a',
                                    fontWeight: 900,
                                    fontSize: '1.75rem',
                                    lineHeight: '2.25rem',
                                }}
                            >
                                Edit Seller
                            </h1>
                            <p className="text-sm text-slate-600 truncate">
                                Update business information and manage status
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={fetchSeller}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 text-slate-700 rounded-xl hover:bg-sky-50 text-sm"
                        >
                            <FiRefreshCw size={16} /> Reload
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl hover:from-blue-700 hover:to-sky-600 shadow-lg shadow-blue-200 disabled:opacity-60 font-medium"
                        >
                            <FiSave size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            {fetchError && (
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <span className="flex items-center gap-2">
                            <FiAlertCircle /> {fetchError}
                        </span>
                        <button
                            onClick={fetchSeller}
                            className="px-3 py-1.5 rounded-lg bg-white border border-amber-200 font-medium"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-5">
                {/* STATUS MANAGEMENT */}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-5 sm:p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                                <FiShield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg" style={{ color: '#0f172a' }}>
                                    Status Management
                                </h3>
                                <p className="text-xs text-slate-500">Control seller account status and access</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 sm:p-6 space-y-5">
                        {/* Current Status + Change Dropdown - Side by Side on Desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Current Status Card */}
                            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Current Status
                                    </p>
                                    <div className={`p-2 rounded-lg ${currentStatus === 'active' ? 'bg-emerald-100' :
                                        currentStatus === 'approved' ? 'bg-blue-100' :
                                            currentStatus === 'pending' ? 'bg-amber-100' :
                                                currentStatus === 'suspended' || currentStatus === 'rejected' ? 'bg-rose-100' :
                                                    'bg-slate-100'
                                        }`}>
                                        {currentStatus === 'active' && <FiCheckCircle className="w-5 h-5 text-emerald-600" />}
                                        {currentStatus === 'approved' && <FiTrendingUp className="w-5 h-5 text-blue-600" />}
                                        {currentStatus === 'pending' && <FiClock className="w-5 h-5 text-amber-600" />}
                                        {(currentStatus === 'suspended' || currentStatus === 'rejected') && (
                                            <FiXCircle className="w-5 h-5 text-rose-600" />
                                        )}
                                        {currentStatus === 'inactive' && <FiXCircle className="w-5 h-5 text-slate-600" />}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <span
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-base font-bold capitalize ${STATUS_BADGE_STYLES[currentStatus] || STATUS_BADGE_STYLES.pending
                                            }`}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
                                        {STATUS_LABELS[currentStatus] || currentStatus}
                                    </span>
                                </div>

                                {/* Status Description */}
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {currentStatus === 'active' && 'Seller is active and can sell on the platform.'}
                                    {currentStatus === 'approved' && 'Verified. Waiting for activation to start selling.'}
                                    {currentStatus === 'pending' && 'Application submitted. Awaiting admin review.'}
                                    {currentStatus === 'suspended' && 'Account suspended. Seller cannot perform actions.'}
                                    {currentStatus === 'inactive' && 'Account inactive. Seller cannot accept orders.'}
                                    {currentStatus === 'rejected' && 'Application rejected. Seller can re-apply.'}
                                </p>
                            </div>

                            {/* Change Status Card */}
                            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50/50 to-white p-5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                                    Change Status To
                                </p>

                                {allowedNextStatuses.length === 0 ? (
                                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                        <FiAlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-amber-800">No transitions available</p>
                                            <p className="text-xs text-amber-600 mt-0.5">
                                                Current status "{STATUS_LABELS[currentStatus]}" has no further transitions.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Dropdown */}
                                        <div className="relative">
                                            <select
                                                value=""
                                                onChange={handleStatusDropdownChange}
                                                className="w-full px-4 py-3.5 pr-10 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-slate-800 font-semibold shadow-sm hover:border-blue-300 transition-colors cursor-pointer"
                                            >
                                                <option value="">Select new status...</option>
                                                {allowedNextStatuses.map((s) => (
                                                    <option key={s} value={s}>
                                                        {STATUS_LABELS[s] || s}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 rounded-lg pointer-events-none">
                                                <FiChevronDown className="w-4 h-4 text-blue-600" />
                                            </div>
                                        </div>

                                        {/* Allowed Transitions Pills */}
                                        <div>
                                            <p className="text-[11px] font-semibold text-slate-500 mb-2">
                                                Allowed transitions:
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {allowedNextStatuses.map((s) => {
                                                    const statusColors = {
                                                        active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                                        approved: 'bg-blue-50 text-blue-700 border-blue-200',
                                                        pending: 'bg-amber-50 text-amber-700 border-amber-200',
                                                        rejected: 'bg-rose-50 text-rose-700 border-rose-200',
                                                        suspended: 'bg-orange-50 text-orange-700 border-orange-200',
                                                        inactive: 'bg-slate-50 text-slate-600 border-slate-200',
                                                    };
                                                    return (
                                                        <span
                                                            key={s}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold capitalize ${statusColors[s] || statusColors.pending
                                                                }`}
                                                        >
                                                            {STATUS_LABELS[s] || s}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Banners - Contextual */}
                        {currentStatus === 'approved' && (
                            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                                    <FiAlertCircle className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-blue-900">Next step: Activation</p>
                                    <p className="text-xs text-blue-700 mt-0.5">
                                        Seller has been approved. To start selling, activate the account.
                                    </p>
                                </div>
                            </div>
                        )}

                        {currentStatus === 'active' && (
                            <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <div className="p-1.5 bg-emerald-100 rounded-lg shrink-0">
                                    <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-900">Seller is live</p>
                                    <p className="text-xs text-emerald-700 mt-0.5">
                                        Seller can accept orders, add products, and perform all seller actions.
                                    </p>
                                </div>
                            </div>
                        )}

                        {currentStatus === 'pending' && (
                            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <div className="p-1.5 bg-amber-100 rounded-lg shrink-0">
                                    <FiClock className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-amber-900">Awaiting your review</p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        Please review the seller's documents and details. Approve or reject the application.
                                    </p>
                                </div>
                            </div>
                        )}

                        {currentStatus === 'suspended' && (
                            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                                <div className="p-1.5 bg-rose-100 rounded-lg shrink-0">
                                    <FiXCircle className="w-4 h-4 text-rose-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-rose-900">Account suspended</p>
                                    <p className="text-xs text-rose-700 mt-0.5">
                                        Seller can log in, but cannot add products, or accept orders. Reactivate when resolved.
                                    </p>
                                </div>
                            </div>
                        )}

                        {currentStatus === 'inactive' && (
                            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="p-1.5 bg-slate-200 rounded-lg shrink-0">
                                    <FiXCircle className="w-4 h-4 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Account inactive</p>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        Seller can log in but cannot sell products or accept orders.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* BUSINESS INFORMATION FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FiBriefcase className="text-blue-600" /> Business Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                label="Business Name *"
                                name="business_name"
                                icon={FiBriefcase}
                                value={formData.business_name}
                                error={errors.business_name}
                                onChange={handleChange}
                                placeholder="e.g., Acme Traders"
                            />
                            <InputField
                                label="Owner Name *"
                                name="owner_name"
                                icon={FiUser}
                                value={formData.owner_name}
                                error={errors.owner_name}
                                onChange={handleChange}
                                placeholder="e.g., John Doe"
                            />
                            <InputField
                                label="Email *"
                                name="email"
                                type="email"
                                icon={FiMail}
                                value={formData.email}
                                error={errors.email}
                                onChange={handleChange}
                                placeholder="business@example.com"
                            />
                            <InputField
                                label="Mobile Number"
                                name="mobile_number"
                                icon={FiPhone}
                                value={formData.mobile_number}
                                onChange={handleChange}
                                placeholder="9876543210"
                            />
                            <SelectField
                                label="Business Type"
                                name="business_type"
                                icon={FiBriefcase}
                                value={formData.business_type}
                                onChange={handleChange}
                                options={[
                                    { value: 'individual', label: 'Individual' },
                                    { value: 'company', label: 'Company' },
                                    { value: 'brand', label: 'Brand' },
                                    { value: 'partnership', label: 'Partnership' },
                                ]}
                            />
                            <InputField
                                label="Commission Rate (%)"
                                name="commission_rate"
                                type="number"
                                icon={FiShield}
                                value={formData.commission_rate}
                                onChange={handleChange}
                                min="0"
                                max="100"
                            />
                            <InputField
                                label="GST Number"
                                name="gst_number"
                                value={formData.gst_number}
                                onChange={handleChange}
                                placeholder="22AAAAA0000A1Z5"
                            />
                            <InputField
                                label="PAN Number"
                                name="pan_number"
                                value={formData.pan_number}
                                onChange={handleChange}
                                placeholder="AAAAA0000A"
                            />
                        </div>
                    </div>

                    {/* ADDRESS */}
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FiMapPin className="text-blue-600" /> Business Address
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <InputField
                                    label="Street Address"
                                    name="street"
                                    icon={FiMapPin}
                                    value={formData.business_address.street}
                                    onChange={handleAddressChange}
                                    placeholder="123, Main Street"
                                />
                            </div>
                            <InputField
                                label="City"
                                name="city"
                                value={formData.business_address.city}
                                onChange={handleAddressChange}
                                placeholder="Surat"
                            />
                            <InputField
                                label="State"
                                name="state"
                                value={formData.business_address.state}
                                onChange={handleAddressChange}
                                placeholder="Gujarat"
                            />
                            <InputField
                                label="Country"
                                name="country"
                                value={formData.business_address.country}
                                onChange={handleAddressChange}
                                placeholder="India"
                            />
                            <InputField
                                label="Postal Code"
                                name="zip_code"
                                value={formData.business_address.zip_code}
                                onChange={handleAddressChange}
                                placeholder="395006"
                            />
                        </div>
                    </div>

                    {/* SETTINGS */}
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FiClock className="text-blue-600" /> Seller Settings
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                label="Order Processing Time (Hours)"
                                name="order_processing_time"
                                type="number"
                                value={formData.settings.order_processing_time}
                                onChange={handleSettingsChange}
                                min="1"
                                max="72"
                            />
                            <InputField
                                label="Return Policy"
                                name="return_policy"
                                value={formData.settings.return_policy}
                                onChange={handleSettingsChange}
                                placeholder="30 days return policy"
                            />
                        </div>
                    </div>

                    {/* SAVE */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/sellers/${sellerCode}`)}
                            className="flex-1 px-4 py-3 border border-sky-200 text-slate-700 bg-white rounded-xl hover:bg-sky-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl hover:from-blue-700 hover:to-sky-600 shadow-lg shadow-blue-200 disabled:opacity-60 font-medium"
                        >
                            <FiSave size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* STATUS CHANGE MODAL */}
            {showStatusModal && (
                <div
                    className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4"
                    onClick={() => setShowStatusModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                Change Status to {STATUS_LABELS[selectedStatus]}
                            </h3>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">
                                Current: <span className="font-semibold">{STATUS_LABELS[currentStatus]}</span>
                                {' → '}
                                New: <span className="font-semibold text-blue-600">{STATUS_LABELS[selectedStatus]}</span>
                            </p>

                            {requiresReason && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Reason *
                                    </label>
                                    <textarea
                                        value={statusReason}
                                        onChange={(e) => setStatusReason(e.target.value)}
                                        rows={3}
                                        placeholder={`Why are you ${selectedStatus === 'rejected' ? 'rejecting' : 'suspending'} this seller?`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                    />
                                </div>
                            )}

                            {!requiresReason && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={statusNotes}
                                        onChange={(e) => setStatusNotes(e.target.value)}
                                        rows={3}
                                        placeholder="Add any internal notes..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowStatusModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-sky-200 text-slate-700 rounded-xl hover:bg-sky-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStatusConfirm}
                                    disabled={updatingStatus}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-60"
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

export default SellerEdit;