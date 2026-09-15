


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiSave, FiUser, FiBriefcase, FiMail, FiPhone,
    FiShield, FiAlertCircle, FiRefreshCw, FiChevronDown, FiX, FiActivity,
    FiEye, FiEyeOff, FiCalendar, FiPlus, FiCheck
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const STATUS_LABELS = {
    pending: 'Pending',
    active: 'Active',
    inactive: 'Inactive',
    blocked: 'Blocked'
};

const ALLOWED_TRANSITIONS = {
    pending: ['active', 'inactive'],
    active: ['inactive', 'blocked'],
    inactive: ['active', 'blocked'],
    blocked: ['active', 'inactive']
};

const REASON_REQUIRED = { blocked: 'blocked_reason' };

const STATUS_BADGE_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-50 text-slate-600 border-slate-200',
    blocked: 'bg-rose-50 text-rose-700 border-rose-200'
};

const EMPLOYEE_TYPE_OPTIONS = [
    { value: 'manager', label: 'Manager' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'order_manager', label: 'Order Manager' },
    { value: 'inventory_manager', label: 'Inventory Manager' },
    { value: 'support_staff', label: 'Support Staff' },
    { value: 'account_manager', label: 'Account Manager' }
];

const DEPARTMENT_OPTIONS = [
    { value: 'Operations', label: 'Operations' },
    { value: 'Warehouse & Fulfillment', label: 'Warehouse & Fulfillment' },
    { value: 'Logistics & Shipping', label: 'Logistics & Shipping' },
    { value: 'Inventory Management', label: 'Inventory Management' },
    { value: 'Order Processing', label: 'Order Processing' },
    { value: 'Packing & Dispatch', label: 'Packing & Dispatch' },
    { value: 'Product Catalog', label: 'Product Catalog' },
    { value: 'Merchandising', label: 'Merchandising' },
    { value: 'Category Management', label: 'Category Management' },
    { value: 'Product Listing', label: 'Product Listing' },
    { value: 'Pricing', label: 'Pricing' },
    { value: 'Customer Support', label: 'Customer Support' },
    { value: 'Customer Service', label: 'Customer Service' },
    { value: 'Returns & Refunds', label: 'Returns & Refunds' },
    { value: 'Quality Assurance', label: 'Quality Assurance' },
    { value: 'Escalations', label: 'Escalations' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Digital Marketing', label: 'Digital Marketing' },
    { value: 'SEO & Content', label: 'SEO & Content' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Performance Marketing', label: 'Performance Marketing' },
    { value: 'Brand Management', label: 'Brand Management' },
    { value: 'Business Development', label: 'Business Development' },
    { value: 'Vendor Management', label: 'Vendor Management' },
    { value: 'Seller Relations', label: 'Seller Relations' },
    { value: 'Account Management', label: 'Account Management' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Accounts', label: 'Accounts' },
    { value: 'Taxation', label: 'Taxation' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'Payment Operations', label: 'Payment Operations' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Product Management', label: 'Product Management' },
    { value: 'Data Analytics', label: 'Data Analytics' },
    { value: 'IT Support', label: 'IT Support' },
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
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none">
                    <Icon size={18} />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value ?? ''}
                onChange={onChange}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${type === 'date' ? 'pr-11' : 'pr-4'} py-2.5 bg-white border ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                    } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400`}
                {...props}
            />
            {type === 'date' && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none">
                    <FiCalendar size={18} />
                </div>
            )}
        </div>
        {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle size={12} /> {error}
            </p>
        )}
    </div>
);

const SelectField = ({ label, name, icon: Icon, options = [], value, error, onChange, disabled, hint }) => (
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
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-9 py-2.5 bg-white border ${error ? 'border-red-300' : 'border-slate-200 focus:border-blue-500'
                    } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none transition-all disabled:bg-slate-50 disabled:text-slate-400`}
            >
                {options.map((o) => (
                    <option key={String(o.value)} value={o.value}>{o.label}</option>
                ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
        </div>
        {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle size={12} /> {error}
            </p>
        )}
    </div>
);

// ================= USER EMAIL SELECT (Searchable dropdown + auto-fill) =================
const UserEmailSelect = ({ value, selectedUser, onSelect, error, disabled }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    // Fetch users (debounced)
    useEffect(() => {
        if (!open) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await ApiService.getAvailableUsersForEmployee({
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

    // Click outside
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
            <label className="block text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
            </label>
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
                    disabled={disabled}
                    className={`w-full pl-11 pr-9 py-2.5 bg-white border ${error ? 'border-red-300' : 'border-slate-200 focus:border-blue-500'
                        } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400`}
                />
                <FiChevronDown
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={16}
                />

                {open && !disabled && (
                    <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                        {loading ? (
                            <div className="p-4 text-sm text-slate-500 text-center flex items-center justify-center gap-2">
                                <FiRefreshCw size={14} className="animate-spin" />
                                Searching users...
                            </div>
                        ) : options.length === 0 ? (
                            <div className="p-4 text-sm text-slate-500 text-center">
                                <FiUser size={20} className="mx-auto text-slate-300 mb-2" />
                                <p>No registered users found</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    User must register first to become employee
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
                                                <p className="text-sm font-medium text-slate-800 truncate">
                                                    {u.email}
                                                </p>
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

// ================= SELLER SELECT (Searchable + API search) =================
const SellerSelect = ({ value, onChange, error, initialSellerName }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedName, setSelectedName] = useState(initialSellerName || '');
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initialSellerName && initialSellerName !== selectedName) {
            setSelectedName(initialSellerName);
        }
    }, [initialSellerName]);

    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            loadSellers('');
        }
    }, []);

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

    const extractList = (res) => {
        const data = res?.data?.data || res?.data || {};
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.sellers)) return data.sellers;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(res?.data?.sellers)) return res.data.sellers;
        if (Array.isArray(res?.data?.data?.sellers)) return res.data.data.sellers;
        return [];
    };

    const loadSellers = async (searchTerm) => {
        setLoading(true);
        try {
            const params = { limit: 50 };
            if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();
            const res = await ApiService.getAllSellers(params);
            setOptions(extractList(res));
        } catch (err) {
            console.error('Failed to load sellers:', err);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadSellers(val), 300);
    };

    const handleSelect = (seller) => {
        onChange({ target: { name: 'seller_id', value: seller._id } });
        setSelectedName(seller.business_name || seller.seller_code || '');
        setOpen(false);
        setSearch('');
    };

    const displayValue = open ? search : selectedName;

    return (
        <div className="space-y-2" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-700">Seller *</label>
            <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none">
                    <FiShield size={18} />
                </div>
                <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setOpen(true)}
                    placeholder="Search seller..."
                    className={`w-full pl-11 pr-9 py-2.5 bg-white border ${error ? 'border-red-300' : 'border-slate-200 focus:border-blue-500'
                        } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400`}
                />
                <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                {open && (
                    <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                        {loading ? (
                            <div className="p-4 text-sm text-slate-500 text-center flex items-center justify-center gap-2">
                                <FiRefreshCw size={14} className="animate-spin" />
                                Loading sellers...
                            </div>
                        ) : options.length === 0 ? (
                            <div className="p-4 text-sm text-slate-500 text-center">
                                {search ? 'No sellers match your search' : 'No sellers found'}
                            </div>
                        ) : (
                            <>
                                <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {search ? `Matches (${options.length})` : `Sellers (${options.length})`}
                                </div>
                                {options.map((seller) => (
                                    <button
                                        key={seller._id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelect(seller)}
                                        className={`w-full text-left px-4 py-2 hover:bg-sky-50 border-b border-slate-100 last:border-0 transition-colors ${value === seller._id ? 'bg-sky-50' : ''
                                            }`}
                                    >
                                        <p className="text-sm text-slate-800 font-medium truncate">
                                            {seller.business_name || 'Unnamed Seller'}
                                        </p>
                                        {seller.seller_code && (
                                            <p className="text-[11px] text-slate-400 font-mono truncate">{seller.seller_code}</p>
                                        )}
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
        </div>
    );
};

// ================= DEPARTMENT SELECT =================
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
            <label className="block text-sm font-medium text-slate-700">Department</label>
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
const EmployeeManagement = () => {
    const { employeeCode } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const isEditMode = Boolean(employeeCode) && !location.pathname.includes('/create');

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

    const [initialSellerName, setInitialSellerName] = useState('');

    // Selected user from email dropdown
    const [selectedUser, setSelectedUser] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        mobile_number: '',
        seller_id: '',
        employee_type: 'order_manager',
        designation: '',
        department: '',
        joining_date: '',
        notes: ''
    });

    const [originalData, setOriginalData] = useState(null);
    const [errors, setErrors] = useState({});

    // ================= FETCH EMPLOYEE (Edit mode) =================
    const fetchEmployee = useCallback(async ({ silent = false } = {}) => {
        if (!employeeCode) return;
        silent ? setRefreshing(true) : setLoading(true);
        setFetchError('');

        try {
            const res = await ApiService.getEmployeeByCode(employeeCode);
            const data = res?.data?.data?.employee || {};

            const sellerId = typeof data.seller_id === 'object' ? data.seller_id?._id : data.seller_id;
            const sellerName = typeof data.seller_id === 'object' ? (data.seller_id?.business_name || '') : '';

            const fetched = {
                full_name: data.full_name || '',
                email: data.email || '',
                mobile_number: data.mobile_number || '',
                seller_id: sellerId || '',
                employee_type: data.employee_type || 'order_manager',
                designation: data.designation || '',
                department: data.department || '',
                joining_date: data.joining_date ? new Date(data.joining_date).toISOString().slice(0, 10) : '',
                notes: data.notes || ''
            };

            setCurrentStatus(data.status || 'pending');
            setInitialSellerName(sellerName);
            setFormData(fetched);
            setOriginalData(fetched);
        } catch (error) {
            setFetchError(error?.response?.data?.message || 'Failed to fetch');
            toast.error('Failed to load employee');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [employeeCode]);

    useEffect(() => {
        if (isEditMode) fetchEmployee();
    }, [isEditMode, fetchEmployee]);

    // ================= FORM HANDLERS =================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // When user selected from dropdown → auto-fill
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
        if (!originalData) return true;
        const fields = [
            'full_name', 'email', 'mobile_number',
            'seller_id', 'employee_type', 'designation',
            'department', 'joining_date', 'notes'
        ];
        const changed = fields.some((key) => {
            const c = String(formData[key] ?? '').trim();
            const o = String(originalData[key] ?? '').trim();
            return c !== o;
        });
        return changed;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditMode && !hasFormChanged()) {
            toast.warning('No changes detected. Please modify at least one field before saving.');
            return;
        }

        const errs = {};

        // Create mode: user must be selected
        if (!isEditMode) {
            if (!selectedUser || !selectedUser._id) {
                errs.email = 'Please select a registered user from the dropdown';
            }
            if (!formData.mobile_number?.trim()) errs.mobile_number = 'Mobile number is required';
        }

        if (!formData.full_name?.trim()) errs.full_name = 'Full name is required';
        if (!formData.seller_id) errs.seller_id = 'Seller is required';
        if (!formData.employee_type) errs.employee_type = 'Employee type is required';

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            toast.error('Please fix the form errors');
            return;
        }

        setSaving(true);
        try {
            if (isEditMode) {
                const payload = {
                    full_name: formData.full_name,
                    mobile_number: formData.mobile_number,
                    seller_id: formData.seller_id,
                    employee_type: formData.employee_type,
                    designation: formData.designation,
                    department: formData.department,
                    joining_date: formData.joining_date || undefined,
                    notes: formData.notes
                };
                await ApiService.updateEmployeeDetails(employeeCode, payload);
                toast.success('Employee updated successfully');
                navigate('/admin/employees');
            } else {
                // 👇 Create mode — send user_id (existing registered user)
                const payload = {
                    user_id: selectedUser._id,
                    seller_id: formData.seller_id,
                    employee_type: formData.employee_type,
                    designation: formData.designation,
                    department: formData.department,
                    joining_date: formData.joining_date || undefined,
                    notes: formData.notes
                };
                await ApiService.createEmployee(payload);
                toast.success('Employee created successfully');
                navigate('/admin/employees');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Save failed');
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
            toast.error('Please provide a reason for blocking');
            return;
        }

        setUpdatingStatus(true);
        try {
            await ApiService.updateEmployeeStatus(employeeCode, {
                status: selectedStatus,
                reason: statusReason || '',
                notes: statusNotes || ''
            });
            toast.success(`Status updated to ${STATUS_LABELS[selectedStatus]}`);
            setShowStatusModal(false);
            setSelectedStatus('');
            setStatusReason('');
            setStatusNotes('');
            fetchEmployee({ silent: true });
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Status update failed');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleBack = () => {
        if (window.history.length > 2) navigate(-1);
        else navigate('/admin/employees');
    };

    // ================= LOADING =================
    if (isEditMode && loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    const requiresReason = REASON_REQUIRED[selectedStatus];

    // ================= RENDER =================
    return (
        <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50">

            <AdminTopbar
                title={isEditMode ? 'Edit Employee' : 'Create Employee'}
                subtitle={isEditMode ? (formData.full_name || employeeCode) : 'Add a registered user as employee'}
                actions={
                    isEditMode && (
                        <button
                            type="button"
                            onClick={() => fetchEmployee({ silent: true })}
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
                        <button onClick={() => fetchEmployee({ silent: true })} className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 font-medium">
                            Retry
                        </button>
                    </div>
                )}

                {/* INFO BANNER — Create mode only */}
                {!isEditMode && (
                    <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                        <FiAlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900">How it works</p>
                            <p className="text-xs text-blue-700 mt-0.5">
                                User must first register on the platform. Search and select the registered user from the Email dropdown below. Their name and mobile will auto-fill.
                            </p>
                        </div>
                    </div>
                )}

                {/* STATUS MANAGEMENT (Only Edit) */}
                {isEditMode && (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-md">
                                    <FiShield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Status Management</h3>
                                    <p className="text-xs text-slate-500">Control employee account access</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                                    <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Status</p>
                                    <span className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-base font-bold capitalize ${STATUS_BADGE_STYLES[currentStatus]}`}>
                                        <span className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
                                        {STATUS_LABELS[currentStatus] || currentStatus}
                                    </span>
                                </div>

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

                    {/* Personal Information */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                            <FiUser className="text-blue-600" /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            {/* 👇 Email — searchable dropdown (Create) OR read-only (Edit) */}
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
                                    disabled={saving}
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
                                placeholder={isEditMode ? 'Full name' : 'Auto-filled from selected user'}
                                hint={!isEditMode ? 'Auto-filled from selected user' : ''}
                            />

                            <InputField
                                label="Mobile Number *"
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

                    {/* Employment Details */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                            <FiBriefcase className="text-blue-600" /> Employment Details
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <SellerSelect
                                value={formData.seller_id}
                                onChange={handleChange}
                                error={errors.seller_id}
                                initialSellerName={initialSellerName}
                            />

                            <SelectField
                                label="Employee Type *"
                                name="employee_type"
                                icon={FiBriefcase}
                                value={formData.employee_type}
                                error={errors.employee_type}
                                onChange={handleChange}
                                options={EMPLOYEE_TYPE_OPTIONS}
                            />
                            <InputField
                                label="Designation"
                                name="designation"
                                icon={FiBriefcase}
                                value={formData.designation}
                                onChange={handleChange}
                                placeholder="e.g., Senior Executive"
                            />

                            <DepartmentSelect
                                value={formData.department}
                                onChange={handleChange}
                                error={errors.department}
                            />

                            <InputField
                                label="Joining Date"
                                name="joining_date"
                                type="date"
                                icon={FiCalendar}
                                value={formData.joining_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-slate-700">Internal Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Any internal notes about this employee..."
                                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* Actions */}
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
                            {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Employee'}
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
                                        placeholder="Why are you blocking this employee?"
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

export default EmployeeManagement;