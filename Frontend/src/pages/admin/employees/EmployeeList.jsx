
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiSearch, FiRefreshCw, FiEye, FiEdit2, FiTrash2,
    FiChevronLeft, FiChevronRight, FiUserPlus, FiUsers, FiCheckCircle,
    FiClock, FiXCircle, FiAlertCircle, FiFilter, FiRotateCcw, FiX,
    FiDownload, FiUserCheck, FiUserX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const EMPLOYEE_TYPE_LABELS = {
    manager: 'Manager',
    product_manager: 'Product Manager',
    order_manager: 'Order Manager',
    inventory_manager: 'Inventory Manager',
    support_staff: 'Support Staff',
    account_manager: 'Account Manager'
};

const STATUS_BADGE = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-50 text-slate-600 border-slate-200',
    blocked: 'bg-rose-50 text-rose-700 border-rose-200'
};

// ================= MAIN COMPONENT =================
const EmployeeList = () => {
    const navigate = useNavigate();
    const hasLoadedOnce = useRef(false);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState(null);
    const [restoringCode, setRestoringCode] = useState(null);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, total_pages: 1 });

    // Tab: 'active' | 'deleted'
    const [activeTab, setActiveTab] = useState('active');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortValue, setSortValue] = useState('created_at:desc');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Restore modal
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [employeeToRestore, setEmployeeToRestore] = useState(null);

    const isDeletedTab = activeTab === 'deleted';

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, typeFilter, statusFilter, sortValue, activeTab]);

    // ================= FETCH =================
    const fetchData = useCallback(async ({ silent = false } = {}) => {
        const showFullLoader = !hasLoadedOnce.current && !silent;
        if (showFullLoader) setLoading(true);
        else setRefreshing(true);

        try {
            const [sort_by, sort_order] = sortValue.split(':');

            const listPromise = isDeletedTab
                ? ApiService.getDeletedEmployees({
                    page, limit,
                    search: debouncedSearch,
                    employee_type: typeFilter
                })
                : ApiService.getAllEmployees({
                    page, limit,
                    search: debouncedSearch,
                    employee_type: typeFilter,
                    status: statusFilter,
                    sort_by, sort_order,
                    view: 'active'
                });

            const [listRes, statsRes] = await Promise.all([
                listPromise,
                ApiService.getEmployeeStats()
            ]);

            const listData = listRes?.data?.data || {};
            setEmployees(listData.employees || []);
            setPagination(listData.pagination || { total: 0, page: 1, limit, total_pages: 1 });
            setStats(statsRes?.data?.data || null);
            hasLoadedOnce.current = true;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to load employees');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, limit, debouncedSearch, typeFilter, statusFilter, sortValue, isDeletedTab]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ================= HANDLERS =================
    const handleTabChange = (tab) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setSearchQuery('');
        setTypeFilter('all');
        setStatusFilter('all');
        setPage(1);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setTypeFilter('all');
        setStatusFilter('all');
        setPage(1);
    };

    // ---- Delete flow ----
    const handleDeleteClick = (emp) => {
        setEmployeeToDelete(emp);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!employeeToDelete) return;
        setDeleting(true);
        try {
            await ApiService.deleteEmployee(employeeToDelete.employee_code);
            toast.success('Employee deleted. Restore from Deleted tab if needed.');
            setShowDeleteModal(false);
            setEmployeeToDelete(null);
            fetchData({ silent: true });
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    // ---- Restore flow ----
    const handleRestoreClick = (emp) => {
        setEmployeeToRestore(emp);
        setShowRestoreModal(true);
    };

    const handleRestoreConfirm = async () => {
        if (!employeeToRestore) return;
        setRestoringCode(employeeToRestore.employee_code);
        try {
            await ApiService.restoreEmployee(employeeToRestore.employee_code);
            toast.success('Employee restored. Activate to grant dashboard access.');
            setShowRestoreModal(false);
            setEmployeeToRestore(null);
            fetchData({ silent: true });
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Restore failed');
        } finally {
            setRestoringCode(null);
        }
    };

    // ---- Export ----
    const handleExport = () => {
        if (!employees.length) {
            toast.warning('No data to export');
            return;
        }

        const headers = ['Employee Code', 'Name', 'Email', 'Mobile', 'Type', 'Seller', 'Status', 'Joined'];
        const rows = employees.map((e) => [
            e.employee_code || '',
            e.full_name || '',
            e.email || '',
            e.mobile_number || '',
            EMPLOYEE_TYPE_LABELS[e.employee_type] || e.employee_type || '',
            e.seller_id?.business_name || '',
            isDeletedTab ? 'Deleted' : (e.status || ''),
            e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN') : ''
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees-${isDeletedTab ? 'deleted-' : ''}${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Employees exported');
    };

    const activeFilterCount =
        (typeFilter !== 'all' ? 1 : 0) +
        (statusFilter !== 'all' && !isDeletedTab ? 1 : 0) +
        (searchQuery ? 1 : 0);

    // ================= RENDER =================
    return (
        <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50">

            {/* Header */}
            <AdminTopbar
                title="Employee Management"
                subtitle="Manage all seller employees across the platform"
                actions={
                    <>
                        <button
                            onClick={() => fetchData({ silent: true })}
                            disabled={refreshing}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 disabled:opacity-60 sm:px-4"
                        >
                            <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={handleExport}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 sm:px-4"
                        >
                            <FiDownload size={15} />
                            Export
                        </button>
                        {!isDeletedTab && (
                            <button
                                onClick={() => navigate('/admin/employees/create')}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-sky-600 sm:px-5"
                            >
                                <FiUserPlus size={16} /> Add Employee
                            </button>
                        )}
                    </>
                }
            />

            <main className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6">

                {/* STATS */}
                {stats && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
                        {[
                            { label: 'Total', value: stats.total, icon: FiUsers, color: 'from-blue-500 to-indigo-600' },
                            { label: 'Active', value: stats.active, icon: FiCheckCircle, color: 'from-emerald-500 to-teal-600' },
                            { label: 'Pending', value: stats.pending, icon: FiClock, color: 'from-amber-500 to-orange-600' },
                            { label: 'Inactive', value: stats.inactive, icon: FiAlertCircle, color: 'from-slate-500 to-slate-700' },
                            { label: 'Blocked', value: stats.blocked, icon: FiXCircle, color: 'from-rose-500 to-red-600' },
                            { label: 'Deleted', value: stats.deleted, icon: FiTrash2, color: 'from-rose-600 to-rose-800' }
                        ].map((card) => (
                            <div key={card.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${card.color} mb-2`}>
                                    <card.icon className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{card.label}</p>
                                <p className="text-2xl font-bold text-slate-800 mt-0.5">{card.value || 0}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* TABS */}
                <div className="inline-flex w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm sm:w-auto">
                    <button
                        onClick={() => handleTabChange('active')}
                        className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            !isDeletedTab
                                ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-200'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <FiUsers size={15} />
                            Active
                            {stats?.total > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${!isDeletedTab ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    {stats.total}
                                </span>
                            )}
                        </span>
                    </button>
                    <button
                        onClick={() => handleTabChange('deleted')}
                        className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            isDeletedTab
                                ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-md shadow-rose-200'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <FiTrash2 size={15} />
                            Deleted
                            {stats?.deleted > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isDeletedTab ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    {stats.deleted}
                                </span>
                            )}
                        </span>
                    </button>
                </div>

                {/* FILTERS + TABLE */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    {/* FILTER TOOLBAR */}
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="relative min-w-0 sm:col-span-2 xl:col-span-1">
                                <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={searchQuery}
                                    placeholder="Search name, email, code..."
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-9 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <FiX size={15} />
                                    </button>
                                )}
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="all">All Types</option>
                                {Object.entries(EMPLOYEE_TYPE_LABELS).map(([v, l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>

                            {!isDeletedTab ? (
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            ) : (
                                <div className="hidden xl:block" />
                            )}

                            {!isDeletedTab ? (
                                <select
                                    value={sortValue}
                                    onChange={(e) => setSortValue(e.target.value)}
                                    className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="created_at:desc">Newest First</option>
                                    <option value="created_at:asc">Oldest First</option>
                                    <option value="full_name:asc">Name A-Z</option>
                                    <option value="full_name:desc">Name Z-A</option>
                                </select>
                            ) : (
                                <div className="sm:col-span-2 xl:col-span-1 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
                                    <FiAlertCircle size={14} />
                                    Restored accounts are inactive by default.
                                </div>
                            )}
                        </div>

                        {activeFilterCount > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-slate-500">Active filters:</span>
                                {typeFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                        {EMPLOYEE_TYPE_LABELS[typeFilter]}
                                        <button onClick={() => setTypeFilter('all')} className="hover:text-blue-900"><FiX size={12} /></button>
                                    </span>
                                )}
                                {statusFilter !== 'all' && !isDeletedTab && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                        Status: {statusFilter}
                                        <button onClick={() => setStatusFilter('all')} className="hover:text-emerald-900"><FiX size={12} /></button>
                                    </span>
                                )}
                                <button onClick={handleClearFilters} className="ml-1 text-xs font-semibold text-rose-600 hover:text-rose-700">
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="space-y-3 p-3 sm:p-4 xl:hidden">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="h-28 bg-sky-50 rounded-xl animate-pulse" />
                            ))
                        ) : employees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="p-4 bg-sky-50 rounded-full mb-4">
                                    {isDeletedTab ? <FiTrash2 size={28} className="text-sky-500" /> : <FiUsers size={28} className="text-sky-500" />}
                                </div>
                                <h3 className="text-base font-semibold text-slate-800">
                                    {isDeletedTab ? 'No deleted employees' : 'No employees found'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {isDeletedTab ? 'Deleted employees will appear here' : 'Try changing filters or add a new employee'}
                                </p>
                            </div>
                        ) : (
                            employees.map((emp) => (
                                <div key={emp._id} className={`overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${isDeletedTab ? 'bg-rose-50/20' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        
                                        <div className={`w-11 h-11 mt-1 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${
                                            isDeletedTab ? 'bg-gradient-to-br from-slate-400 to-slate-600' : 'bg-gradient-to-r from-blue-600 to-sky-500'
                                        }`}>
                                            {(emp.full_name || 'E').charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0 pl-2 text-start">
                                            <p className="font-semibold text-slate-800 truncate">{emp.full_name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500 truncate">{emp.email || 'No email'}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.employee_code || '—'}</p>

                                            <div className="flex flex-wrap items-center gap-1.5 mt-3">
                                                <span className="inline-flex px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold">
                                                    {EMPLOYEE_TYPE_LABELS[emp.employee_type] || emp.employee_type}
                                                </span>
                                                {!isDeletedTab && (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold capitalize ${STATUS_BADGE[emp.status]}`}>
                                                        {emp.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] text-start items-center gap-3 border-t border-slate-100 pt-3">
                                        <span className="text-xs text-slate-400 truncate">
                                            {emp.seller_id?.business_name || 'No seller'}
                                            {isDeletedTab && emp.deleted_at && ` • ${new Date(emp.deleted_at).toLocaleDateString()}`}
                                        </span>

                                        {isDeletedTab ? (
                                            <button
                                                onClick={() => handleRestoreClick(emp)}
                                                disabled={restoringCode === emp.employee_code}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-60"
                                            >
                                                <FiRotateCcw size={13} />
                                                Restore
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => navigate(`/admin/employees/${emp.employee_code}`)} title="View" className="p-2 text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg">
                                                    <FiEye size={15} />
                                                </button>
                                                <button onClick={() => navigate(`/admin/employees/${emp.employee_code}/edit`)} title="Edit" className="p-2 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg">
                                                    <FiEdit2 size={15} />
                                                </button>
                                                <button onClick={() => handleDeleteClick(emp)} title="Delete" className="p-2 text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg">
                                                    <FiTrash2 size={15} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* DESKTOP TABLE */}
                    <div className="hidden overflow-x-auto xl:block">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-sky-50/60">
                                <tr>
                                    <th className="px-4 py-3 pl-20 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee</th>
                                    <th className="px-4 py-3 pl-8 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Seller</th>
                                    <th className="px-4 py-3 pl-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        {isDeletedTab ? 'Deleted On' : 'Status'}
                                    </th>
                                    <th className="px-4 py-3 pr-8 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sky-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(5)].map((__, j) => (
                                                <td key={j} className="px-4 py-4">
                                                    <div className="h-4 bg-sky-50 rounded animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                                <div className="p-4 bg-sky-50 rounded-full mb-4">
                                                    {isDeletedTab ? <FiTrash2 size={28} className="text-sky-500" /> : <FiUsers size={28} className="text-sky-500" />}
                                                </div>
                                                <h3 className="text-base font-semibold text-slate-800">
                                                    {isDeletedTab ? 'No deleted employees' : 'No employees found'}
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {isDeletedTab ? 'Deleted employees will appear here' : 'Try changing filters or add a new employee'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((emp) => (
                                        <tr
                                            key={emp._id}
                                            onClick={() => navigate(`/admin/employees/${emp.employee_code}`)}
                                            className={`transition-colors cursor-pointer ${isDeletedTab ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-sky-50/40'}`}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${
                                                        isDeletedTab ? 'bg-gradient-to-br from-slate-400 to-slate-600' : 'bg-gradient-to-r from-blue-600 to-sky-500'
                                                    }`}>
                                                        {(emp.full_name || 'E').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 text-start">
                                                        <p className="font-medium text-slate-800 truncate">{emp.full_name || 'Unknown'}</p>
                                                        <p className="text-xs text-slate-400 truncate">{emp.email || 'No email'}</p>
                                                        <p className="text-xs text-slate-400 font-mono">{emp.employee_code || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-start">
                                                <span className="inline-flex px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                                                    {EMPLOYEE_TYPE_LABELS[emp.employee_type] || emp.employee_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-start text-slate-700">
                                                {emp.seller_id?.business_name || '—'}
                                            </td>
                                            <td className="px-4 py-4 text-start">
                                                {isDeletedTab ? (
                                                    <div>
                                                        <p className="text-xs text-slate-700 font-medium">
                                                            {emp.deleted_at ? new Date(emp.deleted_at).toLocaleDateString() : '—'}
                                                        </p>
                                                        {emp.deleted_by?.email && (
                                                            <p className="text-[10px] text-slate-400 mt-0.5">by {emp.deleted_by.email}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold capitalize ${STATUS_BADGE[emp.status] || STATUS_BADGE.pending}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                        {emp.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {isDeletedTab ? (
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRestoreClick(emp); }}
                                                            disabled={restoringCode === emp.employee_code}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-60"
                                                        >
                                                            <FiRotateCcw size={13} />
                                                            Restore
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end items-center gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/employees/${emp.employee_code}`); }}
                                                            title="View"
                                                            className="p-2.5 text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg transition-all"
                                                        >
                                                            <FiEye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/employees/${emp.employee_code}/edit`); }}
                                                            title="Edit"
                                                            className="p-2.5 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-all"
                                                        >
                                                            <FiEdit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(emp); }}
                                                            title="Delete"
                                                            className="p-2.5 text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-all"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {!loading && employees.length > 0 && (
                        <div className="grid grid-cols-1 items-center gap-3 border-t border-slate-200 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <p className="text-xs text-slate-500">
                                Showing {((pagination.page - 1) * limit) + 1} to{' '}
                                {Math.min(pagination.page * limit, pagination.total)} of{' '}
                                {pagination.total} results
                            </p>
                            <div className="flex max-w-full items-center justify-center gap-1 overflow-x-auto pb-1 sm:justify-end">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={pagination.page <= 1}
                                    className="p-2 rounded-lg border border-sky-200 text-slate-600 disabled:opacity-40 hover:bg-sky-50"
                                >
                                    <FiChevronLeft size={16} />
                                </button>
                                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === pagination.total_pages || Math.abs(p - pagination.page) <= 1)
                                    .map((p, idx, arr) => (
                                        <React.Fragment key={p}>
                                            {idx > 0 && p - arr[idx - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
                                            <button
                                                onClick={() => setPage(p)}
                                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === pagination.page
                                                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-200'
                                                    : 'border border-sky-200 text-slate-600 hover:bg-sky-50'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        </React.Fragment>
                                    ))}
                                <button
                                    onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                                    disabled={pagination.page >= pagination.total_pages}
                                    className="p-2 rounded-lg border border-sky-200 text-slate-600 disabled:opacity-40 hover:bg-sky-50"
                                >
                                    <FiChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* DELETE MODAL */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => !deleting && setShowDeleteModal(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                                <FiAlertCircle size={22} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 text-center mt-4">Delete this employee?</h3>
                            <p className="text-sm text-slate-500 text-center mt-2">
                                <b>{employeeToDelete?.full_name}</b> will be removed from active list and login access will be blocked. Restore from Deleted tab anytime.
                            </p>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 border border-sky-200 text-slate-700 rounded-xl hover:bg-sky-50 font-medium disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium disabled:opacity-60"
                                >
                                    {deleting ? 'Deleting...' : 'Delete Employee'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RESTORE MODAL */}
            <AnimatePresence>
                {showRestoreModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => !restoringCode && setShowRestoreModal(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                                <FiRotateCcw size={22} className="text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 text-center mt-4">Restore this employee?</h3>
                            <p className="text-sm text-slate-500 text-center mt-2">
                                <b>{employeeToRestore?.full_name}</b> will be restored as <b>INACTIVE</b>. Activate manually to grant dashboard access.
                            </p>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowRestoreModal(false)}
                                    disabled={!!restoringCode}
                                    className="flex-1 px-4 py-2.5 border border-sky-200 text-slate-700 rounded-xl hover:bg-sky-50 font-medium disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRestoreConfirm}
                                    disabled={!!restoringCode}
                                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium disabled:opacity-60"
                                >
                                    {restoringCode ? 'Restoring...' : 'Restore Employee'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeList;