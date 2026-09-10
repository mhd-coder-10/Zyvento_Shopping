// User details page 

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft, FiEdit2, FiMail, FiPhone, FiMapPin, FiCalendar,
    FiShoppingBag, FiDollarSign, FiShield, FiUser, FiActivity,
    FiRefreshCw, FiAlertCircle, FiHash, FiClock
} from 'react-icons/fi';
import { FaStore, FaUsersCog, FaUserTag } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-sky-50/60 hover:bg-sky-50 transition-colors min-w-0">
        <div className="mt-0.5 text-sky-600 shrink-0">{icon}</div>
        <div className="min-w-0">
            <p className="text-xs text-slate-600 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-slate-900 break-words">{value || 'Not available'}</p>
        </div>
    </div>
);

const StatCard = ({ icon, title, value, subtext, color }) => (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-sm">
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 truncate">{title}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{value}</h3>
                {subtext && <p className="text-[11px] sm:text-xs text-slate-400 mt-1 truncate">{subtext}</p>}
            </div>
            <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${color}`}>{icon}</div>
        </div>
    </div>
);

const UserDetails = () => {
    const params = useParams();
    const navigate = useNavigate();

    const userId = params.userId || params.id || '';
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const fetchUserDetails = useCallback(async () => {
        if (!userId) { setErrorMsg('No user id in URL'); setLoading(false); return; }
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await ApiService.getUserById(userId);
            const data = res?.data?.data?.user || res?.data?.user || res?.data?.data || res?.data || null;
            if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
                setUser(null);
                setErrorMsg('User not found');
            } else {
                setUser(data);
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMsg(error?.response?.data?.message || error?.message || 'Failed to load user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchUserDetails(); }, [fetchUserDetails]);

    const roleKey = String(user?.user_type || 'customer').toLowerCase().replace(/[\s-]+/g, '_');
    const isActive = String(user?.account_status || '').toLowerCase() === 'active';
    const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U';

    const roleBadge = () => {
        const map = {
            super_admin: { bg: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <FaUsersCog size={14} />, label: 'Super Admin' },
            sub_admin: { bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: <FiShield size={14} />, label: 'Sub Admin' },
            seller: { bg: 'bg-sky-100 text-sky-700 border-sky-200', icon: <FaStore size={14} />, label: 'Seller' },
            seller_employee: { bg: 'bg-teal-100 text-teal-700 border-teal-200', icon: <FaUserTag size={14} />, label: 'Seller Employee' },
            customer: { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <FiUser size={14} />, label: 'Customer' },
        };
        const c = map[roleKey] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: <FiUser size={14} />, label: 'User' };
        const subLabel = user?.sub_admin_type ? ` • ${user.sub_admin_type.replace(/_/g, ' ')}` : '';
        const empLabel = user?.employee_type ? ` • ${user.employee_type.replace(/_/g, ' ')}` : '';
        return <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${c.bg}`}>{c.icon}{c.label}{subLabel || empLabel}</span>;
    };

    const statusBadge = () => {
        const styles = {
            active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            inactive: 'bg-slate-100 text-slate-600 border-slate-200',
            blocked: 'bg-rose-100 text-rose-700 border-rose-200',
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
        };
        const s = user?.account_status || 'inactive';
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${styles[s] || styles.inactive}`}>
                <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                {s}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-700 font-medium">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle size={38} className="text-sky-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">User not found</h2>
                    <p className="text-slate-600 mb-6 text-sm">{errorMsg || 'The requested user could not be loaded.'}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={fetchUserDetails} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-sky-200 text-slate-800 rounded-xl hover:bg-sky-50 font-medium">
                            <FiRefreshCw size={16} /> Retry
                        </button>
                        <button onClick={() => navigate('/admin/users')} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                            Back to Users
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FiUser size={16} /> },
        { id: 'activity', label: 'Activity', icon: <FiActivity size={16} /> },
    ];

    const addrLine = [user.address, user.city, user.state, user.postal_code, user.country].filter(Boolean).join(', ');

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#eaf4ff] to-white pb-10">
            {/* HEADER */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => navigate('/admin/users')} className="p-2.5 bg-sky-50 text-slate-800 border border-sky-200 rounded-xl hover:bg-sky-100 shrink-0">
                            <FiArrowLeft size={20} />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-slate-900 text-xl sm:text-2xl font-bold truncate">User Details</h1>
                            <p className="text-slate-600 text-xs sm:text-sm truncate">View and manage user information</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button onClick={fetchUserDetails} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 text-slate-800 rounded-xl hover:bg-sky-50 text-sm">
                            <FiRefreshCw size={16} /> <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button
                            onClick={() => navigate(`/admin/users/edit/${user.user_code || userId}`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl hover:from-blue-700 hover:to-sky-600 shadow-lg shadow-blue-200 text-sm font-medium"
                        >
                            <FiEdit2 size={16} /> Edit User
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
                {/* PROFILE */}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white text-2xl font-bold border-4 border-sky-100 shadow-md">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                                {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed user'}
                            </h2>
                            <p className="text-sm text-slate-600 truncate">{user.email || 'No email'}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {roleBadge()}
                                {statusBadge()}
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 break-all sm:text-right">
                            <p className="flex items-center gap-1 sm:justify-end font-mono font-semibold text-blue-600">
                                <FiHash size={12} /> {user.user_code || userId}
                            </p>
                            {user.created_at && (
                                <p className="mt-1 flex items-center gap-1 sm:justify-end">
                                    <FiClock size={12} /> Joined {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    <StatCard icon={<FiShield size={20} className="text-indigo-600" />} title="User Type" value={(user.user_type || '').replace(/_/g, ' ')} subtext="Role" color="bg-indigo-100" />
                    <StatCard icon={<FiActivity size={20} className="text-sky-600" />} title="Status" value={user.account_status || 'unknown'} subtext="Account state" color="bg-sky-100" />
                    <StatCard icon={<FiMail size={20} className="text-blue-600" />} title="Email Verified" value={user.is_email_verified ? 'Yes' : 'No'} subtext="Verification" color="bg-blue-100" />
                    <StatCard icon={<FiPhone size={20} className="text-emerald-600" />} title="Mobile Verified" value={user.is_mobile_verified ? 'Yes' : 'No'} subtext="Verification" color="bg-emerald-100" />
                </div>

                {/* TABS */}
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
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <FiUser className="text-blue-600" /> Contact Information
                                    </h3>
                                    <InfoRow icon={<FiMail size={16} />} label="Email" value={user.email} />
                                    <InfoRow icon={<FiPhone size={16} />} label="Phone" value={user.mobile_number} />
                                    <InfoRow icon={<FiUser size={16} />} label="Username" value={user.username} />
                                    <InfoRow icon={<FiCalendar size={16} />} label="Date of Birth" value={user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : null} />
                                    <InfoRow icon={<FiUser size={16} />} label="Gender" value={user.gender} />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <FiMapPin className="text-blue-600" /> Address &amp; Account
                                    </h3>
                                    <InfoRow icon={<FiMapPin size={16} />} label="Address" value={addrLine || null} />
                                    <InfoRow icon={<FiShield size={16} />} label="Sub-Admin Type" value={user.sub_admin_type ? user.sub_admin_type.replace(/_/g, ' ') : null} />
                                    <InfoRow icon={<FaUserTag size={16} />} label="Employee Type" value={user.employee_type ? user.employee_type.replace(/_/g, ' ') : null} />
                                    <InfoRow icon={<FiActivity size={16} />} label="Account Status" value={user.account_status} />
                                    <InfoRow icon={<FiCalendar size={16} />} label="Joined On" value={user.created_at ? new Date(user.created_at).toLocaleString() : null} />
                                    <InfoRow icon={<FiClock size={16} />} label="Last Updated" value={user.updated_at ? new Date(user.updated_at).toLocaleString() : null} />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'activity' && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                <InfoRow icon={<FiClock size={16} />} label="Account created" value={user.created_at ? new Date(user.created_at).toLocaleString() : null} />
                                <InfoRow icon={<FiActivity size={16} />} label="Last login" value={user.last_login ? new Date(user.last_login).toLocaleString() : null} />
                                <InfoRow icon={<FiRefreshCw size={16} />} label="Profile last updated" value={user.updated_at ? new Date(user.updated_at).toLocaleString() : null} />
                                <InfoRow icon={<FiMail size={16} />} label="Email verified" value={user.is_email_verified ? 'Yes' : 'No'} />
                                <InfoRow icon={<FiPhone size={16} />} label="Phone verified" value={user.is_mobile_verified ? 'Yes' : 'No'} />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;