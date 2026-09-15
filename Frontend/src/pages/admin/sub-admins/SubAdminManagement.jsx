
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiSave, FiUser, FiBriefcase, FiMail, FiPhone,
    FiShield, FiAlertCircle, FiRefreshCw, FiChevronDown, FiX, FiActivity,
    FiLock, FiEye, FiEyeOff, FiPlus, FiCheck
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

const DEPARTMENT_OPTIONS = [
    { value: 'Platform Operations', label: 'Platform Operations' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Customer Support', label: 'Customer Support' },
    { value: 'Seller Relations', label: 'Seller Relations' },
    { value: 'Seller Verification', label: 'Seller Verification' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Accounts', label: 'Accounts' },
    { value: 'Payment Operations', label: 'Payment Operations' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Digital Marketing', label: 'Digital Marketing' },
    { value: 'Category Management', label: 'Category Management' },
    { value: 'Product Catalog', label: 'Product Catalog' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'Legal', label: 'Legal' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Data Analytics', label: 'Data Analytics' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Administration', label: 'Administration' },
    { value: 'Training & Development', label: 'Training & Development' }
];

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

// ================= USER EMAIL SELECT (Searchable dropdown) =================
const UserEmailSelect = ({ value, selectedUser, onSelect, error }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await ApiService.getAvailableUsersForSubAdmin({
                    search: search.trim(),
                    limit: 50
                });
                setOptions(res?.data?.data?.users || []);
            } catch {
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [search, open]);

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (user) => {
        onSelect(user);
        setOpen(false);
        setSearch('');
    };

    const displayValue = open ? search : (selectedUser?.email || value || '');

    return (
        <div className="space-y-2" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-700">Email *</label>
            <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none">
                    <FiMail size={18} />
                </div>
                <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder="Search user by email, name, mobile..."
                    className={`w-full pl-11 pr-9 py-2.5 bg-white border ${error ? 'border-red-300' : 'border-slate-200 focus:border-blue-500'
                        } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400`}
                />
                <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />

                {open && (
                    <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                        {loading ? (
                            <div className="p-4 text-sm text-slate-500 text-center flex items-center justify-center gap-2">
                                <FiRefreshCw size={14} className="animate-spin" />
                                Searching users...
                            </div>
                        ) : options.length === 0 ? (
                            <div className="p-4 text-sm text-slate-500 text-center">
                                <FiUser size={20} className="mx-auto text-slate-300 mb-2" />
                                <p>No eligible users found</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    User must register first to become Sub-Admin
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {search ? `Matches (${options.length})` : `Recent Users (${options.length})`}
                                </div>
                                {options.map((u) => (
                                    <button
                                        key={u._id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelect(u)}
                                        className={`w-full text-left px-4 py-2.5 hover:bg-sky-50 border-b border-slate-100 last:border-0 transition-colors ${selectedUser?._id === u._id ? 'bg-sky-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-slate-800 truncate">{u.email}</p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {u.first_name} {u.last_name}
                                                    {u.mobile_number && ` • ${u.mobile_number}`}
                                                </p>
                                            </div>
                                            {selectedUser?._id === u._id && (
                                                <FiCheck className="text-emerald-600 shrink-0" size={16} />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <FiAlertCircle size={12} /> {error}
                </p>
            )}
            {selectedUser && (
                <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <FiCheck size={12} /> User selected — details auto-filled
                </p>
            )}
        </div>
    );
};

// ================= DEPARTMENT SELECT (Searchable + custom add) =================
const DepartmentSelect = ({ value, onChange, error }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const searchLower = search.trim().toLowerCase();
    const filtered = searchLower
        ? DEPARTMENT_OPTIONS.filter((d) => d.label.toLowerCase().includes(searchLower))
        : DEPARTMENT_OPTIONS;

    const typedDept = search.trim();
    const alreadyExists = DEPARTMENT_OPTIONS.some(
        (d) => d.label.toLowerCase() === typedDept.toLowerCase()
    );
    const showAddOption = typedDept.length > 0 && !alreadyExists;

    const commit = (dept) => {
        onChange({ target: { name: 'department', value: dept } });
        setOpen(false);
        setSearch('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!typedDept) return;
            const match = DEPARTMENT_OPTIONS.find(
                (d) => d.label.toLowerCase() === typedDept.toLowerCase()
            );
            commit(match ? match.value : typedDept);
        } else if (e.key === 'Escape') {
            setOpen(false);
            setSearch('');
        }
    };

    const displayValue = open ? search : (value || '');

    return (
        <div className="space-y-2" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-700">Department *</label>
            <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none">
                    <FiBriefcase size={18} />
                </div>
                <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Select or type & press Enter..."
                    className={`w-full pl-11 pr-9 py-2.5 bg-white border ${error ? 'border-red-300' : 'border-slate-200 focus:border-blue-500'
                        } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400`}
                />
                <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />

                {open && (
                    <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                        {showAddOption && (
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => commit(typedDept)}
                                className="w-full text-left px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border-b border-emerald-200 transition-colors flex items-center gap-2"
                            >
                                <FiPlus size={14} className="text-emerald-600" />
                                <span className="text-sm text-emerald-700 font-semibold">
                                    Add "{typedDept}"
                                </span>
                            </button>
                        )}
                        {filtered.length > 0 ? (
                            <>
                                <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {searchLower ? 'Matches' : 'Suggested'}
                                </div>
                                {filtered.slice(0, 20).map((d) => (
                                    <button
                                        key={d.value}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => commit(d.value)}
                                        className="w-full text-left px-4 py-2 hover:bg-sky-50 border-b border-slate-100 last:border-0 transition-colors"
                                    >
                                        <p className="text-sm text-slate-800">{d.label}</p>
                                    </button>
                                ))}
                            </>
                        ) : !showAddOption ? (
                            <div className="p-4 text-sm text-slate-500 text-center">
                                No department found — type to add new
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <FiAlertCircle size={12} /> {error}
                </p>
            )}
        </div>
    );
};

// ================= MAIN COMPONENT =================
const SubAdminManagement = () => {
    const { subAdminCode } = useParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(subAdminCode);

    const [loading, setLoading] = useState(isEditMode);
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

    // 👇 Create mode: selected user + password visibility
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        mobile_number: '',
        password: '',
        confirm_password: '',
        sub_admin_type: 'manager',
        department: '',
        designation: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    // ================= FETCH (Edit mode) =================
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
                password: '',
                confirm_password: '',
                sub_admin_type: data.sub_admin_type || 'manager',
                department: data.department || '',
                designation: data.designation || '',
                notes: data.notes || ''
            };

            setCurrentStatus(data.status || 'pending');
            setFormData(fetchedData);
            setOriginalData(fetchedData);
        } catch (error) {
            setFetchError(error?.response?.data?.message || 'Failed to fetch');
            toast.error('Failed to load Sub-Admin');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [subAdminCode]);

    useEffect(() => { if (isEditMode) fetchData(); }, [isEditMode, fetchData]);

    // ================= FORM HANDLERS =================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // Auto-fill when user selected from dropdown (Create mode)
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setFormData((prev) => ({
            ...prev,
            email: user.email || '',
            full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            mobile_number: user.mobile_number || ''
        }));
        setErrors((prev) => ({ ...prev, email: '', full_name: '', mobile_number: '' }));
    };

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

        // ============ EDIT MODE ============
        if (isEditMode) {
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
                await ApiService.updateSubAdminDetails(subAdminCode, {
                    full_name: formData.full_name,
                    mobile_number: formData.mobile_number,
                    sub_admin_type: formData.sub_admin_type,
                    department: formData.department,
                    designation: formData.designation,
                    notes: formData.notes
                });
                toast.success('Sub-Admin updated successfully');
                navigate('/admin/sub-admins');
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Update failed');
            } finally {
                setSaving(false);
            }
            return;
        }

        // ============ CREATE MODE ============
        const errs = {};
        if (!selectedUser || !selectedUser._id) errs.email = 'Please select a registered user';
        if (!formData.sub_admin_type) errs.sub_admin_type = 'Sub-Admin type is required';
        if (!formData.department?.trim()) errs.department = 'Department is required';

        if (formData.password && formData.password.length < 6) {
            errs.password = 'Password must be at least 6 characters';
        }
        if (formData.password && formData.password !== formData.confirm_password) {
            errs.confirm_password = 'Passwords do not match';
        }

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            toast.error('Please fix the form errors');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                user_id: selectedUser._id,
                sub_admin_type: formData.sub_admin_type,
                department: formData.department,
                designation: formData.designation,
                notes: formData.notes,
                current_role_ids: []
            };

            if (formData.password && formData.password.trim()) {
                payload.password = formData.password.trim();
            }

            await ApiService.createSubAdmin(payload);
            toast.success('Sub-Admin created. Activate to grant dashboard access.');
            navigate('/admin/sub-admins');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Creation failed');
        } finally {
            setSaving(false);
        }
    };

    // ================= STATUS HANDLERS =================
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

    if (isEditMode && loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    const requiresReason = REASON_REQUIRED[selectedStatus];

    return (
        <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50">

            {/* Header */}
            <AdminTopbar
                title={isEditMode ? 'Edit Sub-Admin' : 'Create Sub-Admin'}
                subtitle={isEditMode ? (formData.full_name || subAdminCode) : 'Add a registered user as Sub-Admin'}
                actions={
                    isEditMode && (
                        <button
                            type="button"
                            onClick={() => fetchData({ silent: true })}
                            disabled={refreshing}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 disabled:opacity-60 sm:px-4"
                        >
                            <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    )
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

                {/* INFO BANNER (Create mode only) */}
                {!isEditMode && (
                    <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                        <FiAlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900">How it works</p>
                            <p className="text-xs text-blue-700 mt-0.5">
                                User must first register on the platform. Search and select the registered user from the Email dropdown below. Account will be created as <b>Pending</b> — activate from Edit page.
                            </p>
                        </div>
                    </div>
                )}

                {/* STATUS MANAGEMENT (Edit mode only) */}
                {isEditMode && (
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
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                            <FiUser className="text-blue-600" /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            {/* Email — Dropdown (Create) / Disabled (Edit) */}
                            {isEditMode ? (
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
                            ) : (
                                <UserEmailSelect
                                    value={formData.email}
                                    selectedUser={selectedUser}
                                    onSelect={handleUserSelect}
                                    error={errors.email}
                                />
                            )}

                            <InputField
                                label="Full Name *"
                                name="full_name"
                                icon={FiUser}
                                value={formData.full_name}
                                error={errors.full_name}
                                onChange={handleChange}
                                disabled={!isEditMode}
                                placeholder={isEditMode ? 'e.g., John Doe' : 'Auto-filled from selected user'}
                                hint={!isEditMode ? 'Auto-filled from selected user' : ''}
                            />
                            <InputField
                                label="Mobile Number"
                                name="mobile_number"
                                icon={FiPhone}
                                value={formData.mobile_number}
                                error={errors.mobile_number}
                                onChange={handleChange}
                                disabled={!isEditMode}
                                placeholder={isEditMode ? '9876543210' : 'Auto-filled from selected user'}
                            />
                        </div>
                    </div>

                    {/* PASSWORD SECTION (Create mode only) */}
                    {!isEditMode && (
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h3 className="mb-1 flex items-center gap-2 font-semibold text-slate-900">
                                <FiLock className="text-blue-600" /> Password (Optional)
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Leave blank to keep user's existing password. If changed, it updates everywhere.
                            </p>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="relative">
                                    <InputField
                                        label="New Password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        icon={FiLock}
                                        value={formData.password}
                                        error={errors.password}
                                        onChange={handleChange}
                                        placeholder="••••••"
                                        hint="Minimum 6 characters (leave blank to keep current)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-3 top-[42px] text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <InputField
                                        label="Confirm Password"
                                        name="confirm_password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        icon={FiLock}
                                        value={formData.confirm_password}
                                        error={errors.confirm_password}
                                        onChange={handleChange}
                                        placeholder="••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((s) => !s)}
                                        className="absolute right-3 top-[42px] text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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

                            {/* 👇 Department — Searchable dropdown with custom add */}
                            <DepartmentSelect
                                value={formData.department}
                                onChange={handleChange}
                                error={errors.department}
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
                            <FiSave size={18} />
                            {saving
                                ? (isEditMode ? 'Saving...' : 'Creating...')
                                : (isEditMode ? 'Save Changes' : 'Create Sub-Admin')}
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

export default SubAdminManagement;
