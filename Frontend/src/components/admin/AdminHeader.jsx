
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import {
    FiMenu,
    FiBell,
    FiSearch,
    FiUser,
    FiLogOut,
    FiSettings,
    FiChevronDown,
    FiX,
    FiMail,
    FiShoppingBag,
    FiStar,
} from 'react-icons/fi';

const AdminHeader = ({ sidebarOpen, setSidebarOpen, isMobile, user }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const notifications = [
        { id: 1, title: 'New order received', time: '5 min ago', read: false, icon: FiShoppingBag, color: 'text-blue-500' },
        { id: 2, title: 'Seller registration pending', time: '1 hour ago', read: false, icon: FiUser, color: 'text-sky-500' },
        { id: 3, title: 'Payment failed for order #123', time: '3 hours ago', read: true, icon: FiMail, color: 'text-rose-500' },
        { id: 4, title: 'New review on product', time: '1 day ago', read: true, icon: FiStar, color: 'text-amber-500' },
    ];

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <header className="fixed top-0 right-0 left-0 z-40 h-16 lg:left-64 transition-all duration-300 bg-white/85 backdrop-blur-xl border-b border-sky-100 shadow-[0_4px_20px_-14px_rgba(2,132,199,0.5)]">
            <div className="flex items-center justify-between h-full px-3 sm:px-6 gap-2">
                {/* Left side */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-xl text-slate-600 hover:bg-sky-50 hover:text-sky-600 active:scale-95 transition-all"
                        aria-label="Toggle sidebar"
                    >
                        {isMobile && sidebarOpen ? (
                            <FiX className="w-5 h-5" />
                        ) : (
                            <FiMenu className="w-5 h-5" />
                        )}
                    </button>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center">
                        <div className="relative group">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search orders, users, products..."
                                className="pl-9 pr-4 py-2.5 w-64 lg:w-80 rounded-2xl border border-sky-100 bg-sky-50/60 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:bg-white focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                            />
                        </div>
                    </form>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                    {/* Mobile search shortcut */}
                    <button
                        onClick={() => navigate('/admin/search')}
                        className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                        aria-label="Search"
                    >
                        <FiSearch className="w-5 h-5" />
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative p-2 rounded-xl text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                            aria-label="Notifications"
                        >
                            <FiBell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-sky-500 to-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md shadow-sky-200 ring-2 ring-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotificationsOpen && (
                            <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-[4.25rem] sm:top-auto sm:mt-2 sm:w-96 bg-white rounded-2xl shadow-2xl shadow-sky-100 border border-sky-100 overflow-hidden z-50 animate-fadeIn">
                                <div className="px-4 py-3 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-white">
                                    <h3 className="font-bold text-slate-800">Notifications</h3>
                                    <button className="text-xs font-semibold text-sky-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-sky-50 transition-colors">
                                        Mark all read
                                    </button>
                                </div>
                                <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
                                    {notifications.map((notification) => {
                                        const Icon = notification.icon;
                                        return (
                                            <div
                                                key={notification.id}
                                                className={`px-4 py-3 cursor-pointer transition-colors border-b border-sky-50 last:border-0 hover:bg-sky-50/70 ${
                                                    !notification.read ? 'bg-sky-50/40' : ''
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-xl flex-shrink-0 ${!notification.read ? 'bg-sky-100' : 'bg-slate-100'}`}>
                                                        <Icon className={`w-4 h-4 ${notification.color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm leading-snug ${!notification.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">{notification.time}</p>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-sky-500 rounded-full mt-2 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-3 border-t border-sky-100 text-center bg-sky-50/50">
                                    <button
                                        onClick={() => navigate('/admin/notifications')}
                                        className="text-sm font-semibold text-sky-600 hover:text-blue-700"
                                    >
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1.5 pr-2 rounded-2xl hover:bg-sky-50 transition-colors group"
                            aria-label="Profile menu"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-md shadow-sky-200 ring-2 ring-white">
                                <span className="text-white font-semibold text-sm">
                                    {user?.first_name?.[0] || 'A'}
                                </span>
                            </div>
                            <span className="hidden sm:inline text-sm font-semibold text-slate-700 max-w-[9rem] truncate">
                                {user?.first_name} {user?.last_name}
                            </span>
                            <FiChevronDown className={`hidden sm:block w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl shadow-sky-100 border border-sky-100 overflow-hidden z-50 animate-fadeIn">
                                <div className="px-4 py-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white">
                                    <p className="text-sm font-bold text-slate-800 truncate">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                                        {user?.user_type || user?.role?.roleName || 'Admin'}
                                    </span>
                                </div>
                                <div className="py-1.5">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            navigate('/admin/profile');
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-blue-700 transition-colors"
                                    >
                                        <FiUser className="w-4 h-4 text-sky-500" />
                                        My Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            navigate('/admin/settings');
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-blue-700 transition-colors"
                                    >
                                        <FiSettings className="w-4 h-4 text-sky-500" />
                                        Settings
                                    </button>
                                    <div className="border-t border-sky-100 my-1" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <FiLogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </header>
    );
};

export default AdminHeader;
