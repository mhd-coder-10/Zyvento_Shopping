

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiEdit2, FiMail, FiPhone, FiShield, FiUser, FiActivity,
    FiRefreshCw, FiAlertCircle, FiHash, FiClock, FiBriefcase,
    FiCalendar, FiCheckCircle
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const SUB_ADMIN_TYPE_LABELS = {
    manager: 'Manager',
    finance_manager: 'Finance Manager',
    support_manager: 'Support Manager',
    seller_manager: 'Seller Manager'
};

// ================= INFO ROW =================
const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-sky-50/60 hover:bg-sky-50 transition-colors min-w-0">
        <div className="mt-0.5 text-sky-600 shrink-0">{icon}</div>
        <div className="min-w-0">
            <p className="text-xs text-slate-600 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-slate-900 break-words">{value || 'Not available'}</p>
        </div>
    </div>
);

// ================= STAT CARD =================
const StatCard = ({ icon, title, value, subtext, color }) => (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-sm">
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 truncate">{title}</p>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 capitalize">{value || '—'}</h3>
                {subtext && <p className="text-[11px] sm:text-xs text-slate-400 mt-1 truncate">{subtext}</p>}
            </div>
            <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${color}`}>{icon}</div>
        </div>
    </div>
);

// ================= MAIN COMPONENT =================
const SubAdminDetails = () => {
    const { subAdminCode } = useParams();
    const navigate = useNavigate();

    const [subAdmin, setSubAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const fetchData = useCallback(async (silent = false) => {
        if (!subAdminCode) {
            setErrorMsg('No Sub-Admin code in URL');
            setLoading(false);
            return;
        }

        if (!silent) setLoading(true);
        else setRefreshing(true);

        setErrorMsg('');
        try {
            const res = await ApiService.getSubAdminByCode(subAdminCode);
            const data = res?.data?.data?.subAdmin || null;

            if (!data) {
                setSubAdmin(null);
                setErrorMsg('Sub-Admin not found');
            } else {
                setSubAdmin({ ...data });
                if (silent) toast.success('Data refreshed');
            }
        } catch (error) {
            setErrorMsg(error?.response?.data?.message || 'Failed to load');
            setSubAdmin(null);
            if (silent) toast.error('Failed to refresh');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [subAdminCode]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ================= HELPERS =================
    const initials = (subAdmin?.full_name || 'S')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'S';

    const isActive = String(subAdmin?.status || '').toLowerCase() === 'active';

    const statusBadge = () => {
        const styles = {
            active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            inactive: 'bg-slate-100 text-slate-600 border-slate-200',
            suspended: 'bg-rose-100 text-rose-700 border-rose-200',
            pending: 'bg-amber-100 text-amber-700 border-amber-200'
        };
        const s = subAdmin?.status || 'pending';
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${styles[s] || styles.pending}`}>
                <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                {s}
            </span>
        );
    };

    const roleBadge = () => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border bg-blue-100 text-blue-700 border-blue-200 capitalize">
            <FiShield size={14} />
            {SUB_ADMIN_TYPE_LABELS[subAdmin?.sub_admin_type] || subAdmin?.sub_admin_type || 'Sub Admin'}
        </span>
    );

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-700 font-medium">Loading Sub-Admin details...</p>
                </div>
            </div>
        );
    }

    // ================= NOT FOUND =================
    if (!subAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle size={38} className="text-sky-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Sub-Admin not found</h2>
                    <p className="text-slate-600 mb-6 text-sm">{errorMsg || 'The requested Sub-Admin could not be loaded.'}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => fetchData()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-sky-200 text-slate-800 rounded-xl hover:bg-sky-50 font-medium">
                            <FiRefreshCw size={16} /> Retry
                        </button>
                        <button onClick={() => navigate('/admin/sub-admins')} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                            Back to Sub-Admins
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FiUser size={16} /> },
        { id: 'activity', label: 'Activity', icon: <FiActivity size={16} /> }
    ];

    // ================= RENDER =================
    return (
        <div className="min-h-screen  from-sky-50 via-[#eaf4ff] to-white pb-10">

            {/* HEADER */}
            <AdminTopbar
                title="Sub-Admin Details"
                subtitle={subAdmin.full_name}
                actions={
                    <>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                fetchData(true);
                            }}
                            disabled={refreshing}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 sm:px-4 disabled:opacity-60"
                        >
                            <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={() => navigate(`/admin/sub-admins/${subAdminCode}/edit`)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:shadow-lg text-sm font-semibold transition-all"
                            style={{
                                background: 'linear-gradient(to right, #2563eb, #0ea5e9)',
                                color: '#ffffff',
                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            <FiEdit2 size={16} />
                            <span>Edit</span>
                        </button>
                    </>
                }
            />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">

                {/* ========== PROFILE CARD ========== */}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500" />

                    <div className="p-5 sm:p-6">

                        {/* MOBILE LAYOUT */}
                        <div className="flex flex-col lg:hidden">
                            <div className="flex justify-center">
                                <div className="relative shrink-0">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white text-2xl font-black shadow-lg ring-4 ring-sky-100">
                                        {initials}
                                    </div>
                                    <span
                                        className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-4 border-white ${
                                            isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                        }`}
                                    />
                                </div>
                            </div>

                            <div className="text-center mt-4">
                                <h2
                                    className="truncate text-xl"
                                    style={{ color: '#0f172a', fontWeight: 900, letterSpacing: '-0.02em' }}
                                >
                                    {subAdmin.full_name || 'Unnamed'}
                                </h2>
                                <p className="truncate text-sm mt-1" style={{ color: '#475569' }}>
                                    {subAdmin.email || 'No email'}
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                    {roleBadge()}
                                    {statusBadge()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-5">
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-xl">
                                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                        <FiHash className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 text-start ml-2.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
                                            Sub-Admin Code
                                        </p>
                                        <p className="text-sm font-mono font-bold truncate" style={{ color: '#1d4ed8' }}>
                                            {subAdmin.sub_admin_code || subAdminCode}
                                        </p>
                                    </div>
                                </div>

                                {subAdmin.created_at && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                            <FiClock className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="min-w-0 text-start ml-2.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
                                                Joined
                                            </p>
                                            <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>
                                                {new Date(subAdmin.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* DESKTOP LAYOUT */}
                        <div className="hidden lg:flex lg:items-center gap-6">
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white text-3xl font-black shadow-lg ring-4 ring-sky-100">
                                    {initials}
                                </div>
                                <span
                                    className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-4 border-white ${
                                        isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                />
                            </div>

                            <div className="min-w-0 flex-1 flex flex-col items-center justify-center gap-2 text-center">
                                <h2
                                    className="truncate text-2xl"
                                    style={{ color: '#0f172a', fontWeight: 900, letterSpacing: '-0.02em' }}
                                >
                                    {subAdmin.full_name || 'Unnamed'}
                                </h2>
                                <p className="truncate text-sm mt-1" style={{ color: '#475569' }}>
                                    {subAdmin.email || 'No email'}
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                    {roleBadge()}
                                    {statusBadge()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 w-64 shrink-0">
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-xl">
                                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                        <FiHash className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 text-start ml-2.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
                                            Sub-Admin Code
                                        </p>
                                        <p className="text-sm font-mono font-bold truncate" style={{ color: '#1d4ed8' }}>
                                            {subAdmin.sub_admin_code || subAdminCode}
                                        </p>
                                    </div>
                                </div>

                                {subAdmin.created_at && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                            <FiClock className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="min-w-0 text-start ml-2.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
                                                Joined
                                            </p>
                                            <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>
                                                {new Date(subAdmin.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== STATS ========== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    <StatCard
                        icon={<FiShield size={20} className="text-indigo-600" />}
                        title="Type"
                        value={SUB_ADMIN_TYPE_LABELS[subAdmin.sub_admin_type] || subAdmin.sub_admin_type || '—'}
                        subtext="Role"
                        color="bg-indigo-100"
                    />
                    <StatCard
                        icon={<FiActivity size={20} className="text-sky-600" />}
                        title="Status"
                        value={subAdmin.status || 'unknown'}
                        subtext="Account state"
                        color="bg-sky-100"
                    />
                    <StatCard
                        icon={<FiBriefcase size={20} className="text-blue-600" />}
                        title="Department"
                        value={subAdmin.department || '—'}
                        subtext="Assigned to"
                        color="bg-blue-100"
                    />
                    <StatCard
                        icon={<FiUser size={20} className="text-emerald-600" />}
                        title="Designation"
                        value={subAdmin.designation || '—'}
                        subtext="Position"
                        color="bg-emerald-100"
                    />
                </div>

                {/* ========== TABS ========== */}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-1 sm:gap-2 p-3 sm:p-4 border-b border-sky-100 overflow-x-auto">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                    activeTab === t.id
                                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-200'
                                        : 'text-slate-700 hover:bg-sky-50'
                                }`}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 sm:p-6">
                        {activeTab === 'overview' && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5"
                            >
                                {/* Contact Information */}
                                <div className="space-y-3 text-start">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <FiUser className="text-blue-600" /> Contact Information
                                    </h3>
                                    <InfoRow icon={<FiMail size={16} />} label="Email" value={subAdmin.email} />
                                    <InfoRow icon={<FiPhone size={16} />} label="Mobile" value={subAdmin.mobile_number} />
                                    <InfoRow icon={<FiUser size={16} />} label="Full Name" value={subAdmin.full_name} />
                                    <InfoRow icon={<FiHash size={16} />} label="Sub-Admin Code" value={subAdmin.sub_admin_code} />
                                </div>

                                {/* Role & Account Information */}
                                <div className="space-y-3 text-start">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <FiBriefcase className="text-blue-600" /> Role &amp; Account
                                    </h3>
                                    <InfoRow
                                        icon={<FiShield size={16} />}
                                        label="Sub-Admin Type"
                                        value={SUB_ADMIN_TYPE_LABELS[subAdmin.sub_admin_type] || subAdmin.sub_admin_type}
                                    />
                                    <InfoRow icon={<FiBriefcase size={16} />} label="Department" value={subAdmin.department} />
                                    <InfoRow icon={<FiUser size={16} />} label="Designation" value={subAdmin.designation} />
                                    <InfoRow icon={<FiActivity size={16} />} label="Account Status" value={subAdmin.status} />
                                    <InfoRow
                                        icon={<FiCalendar size={16} />}
                                        label="Joined On"
                                        value={subAdmin.created_at ? new Date(subAdmin.created_at).toLocaleString() : null}
                                    />
                                    <InfoRow
                                        icon={<FiClock size={16} />}
                                        label="Last Updated"
                                        value={subAdmin.updated_at ? new Date(subAdmin.updated_at).toLocaleString() : null}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'activity' && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                            >
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-1">
                                    <FiClock className="text-blue-600" /> Status History
                                </h3>

                                {subAdmin.status_history && subAdmin.status_history.length > 0 ? (
                                    [...subAdmin.status_history].reverse().map((h, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3 p-3 rounded-xl bg-sky-50/60 hover:bg-sky-50 transition-colors"
                                        >
                                            <div className="mt-0.5 p-2 bg-white rounded-lg border border-sky-100 shrink-0">
                                                <FiCheckCircle size={14} className="text-sky-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm">
                                                    <span className="font-semibold capitalize text-slate-700">
                                                        {h.from || 'none'}
                                                    </span>
                                                    <span className="mx-1.5 text-slate-400">→</span>
                                                    <span className="font-semibold capitalize text-blue-600">{h.to}</span>
                                                </p>
                                                {h.reason && (
                                                    <p className="mt-1 text-xs text-slate-600">
                                                        <span className="font-medium">Reason:</span> {h.reason}
                                                    </p>
                                                )}
                                                {h.notes && (
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        <span className="font-medium">Notes:</span> {h.notes}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    {new Date(h.changed_at).toLocaleString()}
                                                    {h.changed_by?.email && ` • by ${h.changed_by.email}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <FiClock size={32} className="mx-auto text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500">No activity yet</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubAdminDetails;