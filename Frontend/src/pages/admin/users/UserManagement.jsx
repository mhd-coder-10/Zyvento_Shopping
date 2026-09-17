
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiLock,
    FiShield, FiEye, FiEyeOff, FiCalendar, FiAlertCircle, FiRefreshCw,
    FiX,
} from 'react-icons/fi';
import { FaUsersCog, FaUserTag } from 'react-icons/fa';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import UserRoleMultiSelect from '../../../components/admin/role/UserRoleMultiSelect';

/* OPTIONS */
const MAIN_USER_TYPES = [
    { value: 'customer', label: 'Customer' },
    { value: 'seller', label: 'Seller' },
    { value: 'seller_employee', label: 'Seller Employee' },
    { value: 'sub_admin', label: 'Sub Admin (Platform Staff)' },
    { value: 'super_admin', label: 'Super Admin' },
];

const SUB_ADMIN_TYPES = [
    { value: 'manager', label: 'Manager' },
    { value: 'finance_manager', label: 'Finance Manager' },
    { value: 'support_manager', label: 'Support Manager' },
    { value: 'seller_manager', label: 'Seller Manager' },
];

const EMPLOYEE_TYPES = [
    { value: 'manager', label: 'Manager (Full Seller Access)' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'order_manager', label: 'Order Manager' },
    { value: 'inventory_manager', label: 'Inventory Manager' },
    { value: 'support_staff', label: 'Support Staff' },
    { value: 'account_manager', label: 'Account Manager' },
];

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'blocked', label: 'Blocked' },
];

const EMPTY_FORM = {
    first_name: '', last_name: '', email: '', phone: '', username: '',
    password: '', password_confirmation: '',
    user_type: 'customer',
    sub_admin_type: '',
    employee_type: '',
    seller_id: '',
    status: 'active',
    date_of_birth: '', gender: '', address: '', city: '', state: '',
    country: '', postal_code: '',
};

/* Maps user_type to role_type - Role model stores role_type */
const USER_TYPE_TO_ROLE_TYPE = {
    'super_admin': 'admin',
    'sub_admin': 'sub_admin',
    'seller': 'seller',
    'seller_employee': 'employee',
    'customer': 'customer',
};

/* Extracts applicable role_types from a role object - Role model has a single role_type */
const getRoleApplicableTypes = (role) => {
    const type = role?.role_type;
    /* If the field is missing, return null which means valid for all */
    if (!type) return null;
    const cleaned = String(type).trim().toLowerCase();
    return cleaned ? [cleaned] : null;
};

/* FIELD COMPONENTS */
const InputField = ({ label, name, type = 'text', icon: Icon, required = false, value, error, onChange, hint, ...props }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500"><Icon size={18} /></div>}
            <input
                type={type}
                name={name}
                value={value ?? ''}
                onChange={onChange}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 bg-white border ${error ? 'border-red-300 focus:border-red-500' : 'border-sky-200 focus:border-blue-500'} rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400`}
                {...props}
            />
        </div>
        {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-red-500 flex items-center gap-1"><FiAlertCircle size={12} /> {error}</p>}
    </div>
);

const SelectField = ({ label, name, icon: Icon, options = [], required = false, value, error, onChange, hint }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none"><Icon size={18} /></div>}
            <select
                name={name}
                value={value ?? ''}
                onChange={onChange}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-9 py-2.5 bg-white border ${error ? 'border-red-300' : 'border-sky-200 focus:border-blue-500'} rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none transition-all`}
            >
                {options.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
        </div>
        {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-red-500 flex items-center gap-1"><FiAlertCircle size={12} /> {error}</p>}
    </div>
);

/* MAIN COMPONENT */
const UserManagement = () => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const userId = params.userId || params.id || new URLSearchParams(location.search).get('id') || '';
    const isEditMode = Boolean(userId) && !location.pathname.includes('/create');

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditMode);
    const [fetchError, setFetchError] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    /* ROLES STATE */
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [originalRoleIds, setOriginalRoleIds] = useState([]);

    const [actualUserId, setActualUserId] = useState(null);

    /* FETCH USER (Edit Mode) */
    const fetchUserData = useCallback(async (silent = false) => {
        if (!userId) return;

        if (!silent) {
            setFetchLoading(true);
        } else {
            setRefreshing(true);
        }

        setFetchError('');
        try {
            const res = await ApiService.getUserById(userId);

            const u = res?.data?.data?.user || res?.data?.user || res?.data?.data || res?.data || {};

            setActualUserId(u._id || null);

            const fetchedData = {
                ...EMPTY_FORM,
                first_name: u.first_name || '',
                last_name: u.last_name || '',
                email: u.email || '',
                phone: u.mobile_number || u.phone || '',
                username: u.username || '',
                user_type: u.user_type || 'customer',
                sub_admin_type: u.sub_admin_type || '',
                employee_type: u.employee_type || '',
                seller_id: (typeof u.seller_id === 'object' ? u.seller_id?._id : u.seller_id) || '',
                status: u.account_status || 'active',
                date_of_birth: u.date_of_birth ? new Date(u.date_of_birth).toISOString().slice(0, 10) : '',
                gender: u.gender || '',
                address: u.address || '',
                city: u.city || '',
                state: u.state || '',
                country: u.country || '',
                postal_code: u.postal_code || '',
                password: '',
                password_confirmation: '',
            };

            setFormData(fetchedData);
            setOriginalData(fetchedData);

            /* Fetch roles currently assigned to the user */
            try {
                const rolesRes = await ApiService.getUserRoles(u._id || userId);
                const rolesData = rolesRes?.data?.data || rolesRes?.data || [];
                const roleIds = Array.isArray(rolesData)
                    ? rolesData.map((r) => String(r._id || r))
                    : [];
                setSelectedRoleIds(roleIds);
                setOriginalRoleIds(roleIds);
            } catch (roleErr) {
                console.error('Failed to fetch user roles:', roleErr);
                setSelectedRoleIds([]);
                setOriginalRoleIds([]);
            }

            if (silent) {
                toast.success('Data refreshed');
            }

        } catch (error) {
            console.error('Error fetching user:', error);
            setFetchError(error?.response?.data?.message || error?.message || 'Failed to fetch user');
            if (silent) {
                toast.error('Failed to refresh');
            } else {
                toast.error(error?.response?.data?.message || 'Failed to fetch user');
            }
        } finally {
            if (!silent) {
                setFetchLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    }, [userId]);

    /* FETCH AVAILABLE ROLES */
    const fetchAvailableRoles = useCallback(async () => {
        try {
            const res = await ApiService.getAllRoles({ limit: 100 });
            const data = res?.data || {};
            let list = [];
            if (Array.isArray(data.data)) list = data.data;
            else if (Array.isArray(data.roles)) list = data.roles;
            else if (Array.isArray(data)) list = data;
            setAvailableRoles(list);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
            setAvailableRoles([]);
        }
    }, []);

    useEffect(() => { if (isEditMode) fetchUserData(); }, [isEditMode, fetchUserData]);
    useEffect(() => { fetchAvailableRoles(); }, [fetchAvailableRoles]);

    /* Filter roles based on selected user_type, active status, and existing assignment */
    const filteredRoles = useMemo(() => {
        const all = Array.isArray(availableRoles) ? availableRoles : [];
        if (!formData.user_type) return all;

        /* Convert user_type to the matching role_type */
        const targetRoleType = USER_TYPE_TO_ROLE_TYPE[formData.user_type] || formData.user_type;
        const selectedSet = new Set(selectedRoleIds.map(String));

        return all.filter((role) => {
            const isActive = role?.is_active !== false;
            const isSelected = selectedSet.has(String(role._id));

            /* Hide inactive roles unless already assigned to this user (so admin can remove them) */
            if (!isActive && !isSelected) return false;

            const types = getRoleApplicableTypes(role);
            /* If types is null, the role is valid for all user types */
            if (!types) return true;
            return types.includes(targetRoleType);
        });
    }, [availableRoles, formData.user_type, selectedRoleIds]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            if (name === 'user_type') {
                if (value !== 'sub_admin') next.sub_admin_type = '';
                if (value !== 'seller_employee') {
                    next.employee_type = '';
                    next.seller_id = '';
                }
            }
            return next;
        });

        /* When user_type changes, deselect roles that are no longer valid */
        if (name === 'user_type') {
            const targetRoleType = USER_TYPE_TO_ROLE_TYPE[value] || value;
            const currentSelected = new Set(selectedRoleIds.map(String));
            const allowedIds = new Set(
                (Array.isArray(availableRoles) ? availableRoles : [])
                    .filter((role) => {
                        const isActive = role?.is_active !== false;
                        const isSelected = currentSelected.has(String(role._id));

                        /* Inactive roles are only allowed if already selected */
                        if (!isActive && !isSelected) return false;

                        const types = getRoleApplicableTypes(role);
                        if (!types) return true;
                        return types.includes(targetRoleType);
                    })
                    .map((r) => String(r._id))
            );
            setSelectedRoleIds((prev) => prev.filter((id) => allowedIds.has(String(id))));
        }

        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const e = {};
        if (!formData.first_name.trim()) e.first_name = 'First name is required';
        if (!formData.last_name.trim()) e.last_name = 'Last name is required';
        if (!formData.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email';
        if (!formData.phone.trim()) e.phone = 'Phone is required';
        else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) e.phone = 'Invalid phone';

        if (formData.user_type === 'sub_admin' && !formData.sub_admin_type) {
            e.sub_admin_type = 'Sub-admin type is required';
        }
        if (formData.user_type === 'seller_employee' && !formData.employee_type) {
            e.employee_type = 'Employee type is required';
        }

        if (!isEditMode) {
            if (!formData.password) e.password = 'Password is required';
            else if (formData.password.length < 6) e.password = 'Min 6 characters';
            if (formData.password !== formData.password_confirmation) e.password_confirmation = 'Passwords do not match';
        } else if (formData.password) {
            if (formData.password.length < 6) e.password = 'Min 6 characters';
            if (formData.password !== formData.password_confirmation) e.password_confirmation = 'Passwords do not match';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* Check whether any field has been changed */
    const hasFormChanged = () => {
        if (!originalData) return true;
        const fields = [
            'first_name', 'last_name', 'email', 'phone', 'username',
            'user_type', 'sub_admin_type', 'employee_type', 'seller_id',
            'status', 'date_of_birth', 'gender', 'address', 'city',
            'state', 'country', 'postal_code'
        ];
        const fieldChanged = fields.some((key) => {
            const current = String(formData[key] ?? '').trim();
            const original = String(originalData[key] ?? '').trim();
            return current !== original;
        });
        const passwordChanged = Boolean(formData.password);
        const rolesChanged =
            JSON.stringify([...selectedRoleIds].sort()) !==
            JSON.stringify([...originalRoleIds].sort());
        return fieldChanged || passwordChanged || rolesChanged;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (isEditMode && !hasFormChanged()) {
            toast.warning('No changes detected. Please modify at least one field before saving.');
            return;
        }

        if (!validateForm()) { toast.error('Please fix form errors'); return; }

        setLoading(true);
        try {
            const payload = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim(),
                mobile_number: formData.phone.trim(),
                username: formData.username.trim() || undefined,
                user_type: formData.user_type,
                account_status: formData.status,
                date_of_birth: formData.date_of_birth || undefined,
                gender: formData.gender || undefined,
                address: formData.address || undefined,
                city: formData.city || undefined,
                state: formData.state || undefined,
                country: formData.country || undefined,
                postal_code: formData.postal_code || undefined,
            };

            if (formData.user_type === 'sub_admin') {
                payload.sub_admin_type = formData.sub_admin_type;
            }
            if (formData.user_type === 'seller_employee') {
                payload.employee_type = formData.employee_type;
            }

            if (formData.password) payload.password = formData.password;

            let savedUserId = isEditMode ? actualUserId : null;

            if (isEditMode) {
                await ApiService.updateUserByAdmin(userId, payload);
                savedUserId = actualUserId || null;
                toast.success('User updated successfully');
            } else {
                const createRes = await ApiService.createUserByAdmin(payload);
                savedUserId =
                    createRes?.data?.data?._id ||
                    createRes?.data?.data?.user?._id ||
                    createRes?.data?.user?._id;
                toast.success('User created successfully');
            }

            /* Assign or revoke roles based on the changes */
            if (savedUserId) {
                const currentIds = selectedRoleIds.map(String);
                const originalIds = isEditMode ? originalRoleIds.map(String) : [];

                const toAdd = currentIds.filter((id) => !originalIds.includes(id));
                const toRemove = originalIds.filter((id) => !currentIds.includes(id));

                if (toRemove.length > 0) {
                    try {
                        await ApiService.revokeRoleFromUser({
                            user_id: savedUserId,
                            role_ids: toRemove,
                            reason: 'Removed from User Management',
                        });
                    } catch (revokeErr) {
                        console.error('Failed to revoke roles:', revokeErr);
                        toast.warning('User saved, but some roles could not be removed');
                    }
                }

                if (toAdd.length > 0) {
                    try {
                        await ApiService.assignRoleToUser({
                            user_id: savedUserId,
                            role_ids: toAdd,
                            reason: isEditMode
                                ? 'Updated from User Management'
                                : 'Assigned during user creation',
                        });
                    } catch (assignErr) {
                        console.error('Failed to assign roles:', assignErr);
                        toast.warning('User saved, but some roles could not be assigned');
                    }
                }
            }

            navigate('/admin/users');

        } catch (error) {
            console.error('Save error:', error);
            const fieldErrors = error?.response?.data?.errors;
            if (fieldErrors && typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
                const normalized = {};
                Object.entries(fieldErrors).forEach(([k, v]) => {
                    normalized[k] = Array.isArray(v) ? v[0] : (typeof v === 'object' ? v?.message : v);
                });
                setErrors(normalized);
                toast.error('Please fix the validation errors');
            } else {
                toast.error(error?.response?.data?.message || error?.message || 'Failed to save user');
            }
        } finally {
            setLoading(false);
        }
    };

    /* NAVIGATION */
    const handleBack = () => {
        if (isEditMode && window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/admin/users');
        }
    };

    const initials = `${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}`.toUpperCase() || 'U';
    const showSubAdmin = formData.user_type === 'sub_admin';
    const showEmployee = formData.user_type === 'seller_employee';

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#eaf4ff] to-white flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-700 font-medium">Loading user...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen from-sky-50 via-[#eaf4ff] to-white pb-10">

            {/* HEADER */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-5">
                <AdminTopbar
                    title={isEditMode ? 'Edit User' : 'Create User'}
                    subtitle={isEditMode ? 'Update user profile, role and access' : 'Add a new user to the platform'}
                    actions={
                        <>
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        fetchUserData(true);
                                    }}
                                    disabled={refreshing}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 sm:px-4 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                                    <span>{refreshing ? 'Refreshing...' : 'Reload'}</span>
                                </button>
                            )}
                        </>
                    }
                />
            </div>

            {fetchError && (
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <span className="flex items-center gap-2"><FiAlertCircle /> {fetchError}</span>
                        <button onClick={fetchUserData} className="px-3 py-1.5 rounded-lg bg-white border border-amber-200 font-medium">Retry</button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                {/* LEFT SIDEBAR */}
                <div className="lg:col-span-1 space-y-5">
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 text-center">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white text-3xl font-bold border-4 border-sky-100 shadow-md mx-auto">
                                {initials}
                            </div>
                        </div>
                        <p className="mt-4 font-semibold text-slate-900 truncate">
                            {`${formData.first_name} ${formData.last_name}`.trim() || 'New User'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{formData.email || 'no-email@example.com'}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6 space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <FaUsersCog className="text-blue-600" /> Role &amp; Access
                        </h3>

                        <SelectField
                            label="User Type"
                            name="user_type"
                            icon={FiShield}
                            required
                            value={formData.user_type}
                            error={errors.user_type}
                            onChange={handleChange}
                            options={MAIN_USER_TYPES}
                        />

                        {showSubAdmin && (
                            <SelectField
                                label="Sub-Admin Type"
                                name="sub_admin_type"
                                icon={FiShield}
                                required
                                value={formData.sub_admin_type}
                                error={errors.sub_admin_type}
                                onChange={handleChange}
                                options={[{ value: '', label: 'Select Sub-Admin Type' }, ...SUB_ADMIN_TYPES]}
                                hint="Platform staff department"
                            />
                        )}

                        {showEmployee && (
                            <SelectField
                                label="Employee Type"
                                name="employee_type"
                                icon={FaUserTag}
                                required
                                value={formData.employee_type}
                                error={errors.employee_type}
                                onChange={handleChange}
                                options={[{ value: '', label: 'Select Employee Type' }, ...EMPLOYEE_TYPES]}
                            />
                        )}

                        {/* ASSIGNED ROLES - filtered by selected user_type and active status */}
                        <UserRoleMultiSelect
                            availableRoles={filteredRoles}
                            selectedRoleIds={selectedRoleIds}
                            onChange={setSelectedRoleIds}
                            error={errors.role_ids}
                        />

                        <SelectField
                            label="Account Status"
                            name="status"
                            icon={FiShield}
                            value={formData.status}
                            error={errors.status}
                            onChange={handleChange}
                            options={STATUS_OPTIONS}
                        />
                    </div>
                </div>

                {/* RIGHT - Main fields */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FiUser className="text-blue-600" /> Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="First Name" name="first_name" icon={FiUser} required placeholder="John" value={formData.first_name} error={errors.first_name} onChange={handleChange} />
                            <InputField label="Last Name" name="last_name" icon={FiUser} required placeholder="Doe" value={formData.last_name} error={errors.last_name} onChange={handleChange} />
                            <InputField label="Email" name="email" type="email" icon={FiMail} required placeholder="john@example.com" value={formData.email} error={errors.email} onChange={handleChange} />
                            <InputField label="Phone" name="phone" icon={FiPhone} required placeholder="9876543210" value={formData.phone} error={errors.phone} onChange={handleChange} />
                            <InputField
                                label="Username"
                                name="username"
                                icon={FiUser}
                                placeholder="johndoe"
                                value={formData.username}
                                error={errors.username}
                                onChange={handleChange}
                                hint="Used to generate user code (USR-username)"
                            />
                            <InputField label="Date of Birth" name="date_of_birth" type="date" icon={FiCalendar} value={formData.date_of_birth} error={errors.date_of_birth} onChange={handleChange} />
                            <SelectField
                                label="Gender"
                                name="gender"
                                icon={FiUser}
                                value={formData.gender}
                                error={errors.gender}
                                onChange={handleChange}
                                options={[
                                    { value: '', label: 'Select Gender' },
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FiLock className="text-blue-600" /> {isEditMode ? 'Change Password (Optional)' : 'Password'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <InputField
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    icon={FiLock}
                                    required={!isEditMode}
                                    placeholder="••••••"
                                    value={formData.password}
                                    error={errors.password}
                                    onChange={handleChange}
                                    hint={isEditMode ? 'Leave blank to keep current' : 'Minimum 6 characters'}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-[42px] text-slate-400 hover:text-slate-600">
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            <div className="relative">
                                <InputField
                                    label="Confirm Password"
                                    name="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    icon={FiLock}
                                    required={!isEditMode}
                                    placeholder="••••••"
                                    value={formData.password_confirmation}
                                    error={errors.password_confirmation}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(s => !s)} className="absolute right-3 top-[42px] text-slate-400 hover:text-slate-600">
                                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FiMapPin className="text-blue-600" /> Address
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <InputField label="Street Address" name="address" icon={FiMapPin} placeholder="123, Main Street" value={formData.address} onChange={handleChange} />
                            </div>
                            <InputField label="City" name="city" placeholder="Surat" value={formData.city} onChange={handleChange} />
                            <InputField label="State" name="state" placeholder="Gujarat" value={formData.state} onChange={handleChange} />
                            <InputField label="Country" name="country" placeholder="India" value={formData.country} onChange={handleChange} />
                            <InputField label="Postal Code" name="postal_code" placeholder="395006" value={formData.postal_code} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 px-4 py-3 border border-sky-200 text-slate-700 bg-white rounded-xl hover:bg-sky-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl hover:from-blue-700 hover:to-sky-600 shadow-lg shadow-blue-200 disabled:opacity-60 font-medium"
                        >
                            <FiSave size={18} /> {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserManagement;