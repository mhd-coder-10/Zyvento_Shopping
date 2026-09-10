
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    FiHome, FiUsers, FiBriefcase, FiUserPlus, FiUserCheck, FiPackage,
    FiGrid, FiBox, FiLayers, FiShoppingCart, FiCreditCard,
    FiRefreshCw, FiStar, FiTag, FiBell, FiSettings, FiExternalLink,
    FiChevronLeft, FiChevronRight, FiShield, FiPieChart,
    FiDollarSign, FiShoppingBag, FiTrendingUp
} from 'react-icons/fi';

const AdminSidebar = ({ isOpen, setIsOpen, isMobile, user }) => {
    const location = useLocation();
    const [expandedModules, setExpandedModules] = useState({});

    const hasPermission = (permission) => {
        if (user?.user_type === 'super_admin' || user?.role?.roleName === 'super_admin') {
            return true;
        }
        const userPermissions = user?.permissions || user?.role?.permissions || [];
        return userPermissions.includes(permission);
    };

    const toggleModule = (moduleName) => {
        setExpandedModules((prev) => ({
            ...prev,
            [moduleName]: !prev[moduleName],
        }));
    };

    // Check if any child of this module is currently active
    const isChildActive = (item) => {
        return item.children?.some(child => location.pathname.startsWith(child.path));
    };

    const navigation = [
        { name: 'Dashboard', icon: FiHome, path: '/admin/dashboard', permission: 'view_dashboard' },
        { name: 'Users', icon: FiUsers, path: '/admin/users', permission: 'view_users' },
        { name: 'Sellers', icon: FiBriefcase, path: '/admin/sellers', permission: 'view_sellers' },
        { name: 'Employees', icon: FiUserPlus, path: '/admin/employees', permission: 'view_employees' },
        { name: 'Company Finance', path: '/admin/company-finance', permission: 'view_finance', icon: FiDollarSign },
        { name: 'Products', path: '/admin/products', permission: 'view_products', icon: FiPackage },
        { name: 'Inventory', path: '/admin/inventory', permission: 'view_inventory', icon: FiBox },
        { name: 'Reviews', path: '/admin/reviews', permission: 'view_reviews', icon: FiStar },
    
        {
            name: 'Category Management',
            icon: FiPackage,
            children: [
                { name: 'Root Category', path: '/admin/categories', permission: 'view_categories', icon: FiGrid },
                { name: 'Sub-Category', path: '/admin/sub-categories', permission: 'view_sub_categories', icon: FiLayers },
            ],
        },

        {
            name: 'Order Management',
            icon: FiShoppingBag,
            children: [
                { name: 'Orders', path: '/admin/orders', permission: 'view_orders', icon: FiShoppingCart },
                { name: 'Returns', path: '/admin/returns', permission: 'view_returns', icon: FiRefreshCw },
            ],
        },

        { name: "Coupons", path: "/admin/coupons", permission: "view_coupons", icon: FiTag },
        { name: 'Notifications', path: '/admin/notifications', permission: 'view_notifications', icon: FiBell },
        { name: 'Reports', path: '/admin/reports', permission: 'view_reports', icon: FiPieChart },

        {
            name: 'Roles & Permissions',
            icon: FiShield,
            children: [
                { name: 'Roles', path: '/admin/roles', permission: 'view_roles' },
                { name: 'Permissions', path: '/admin/permissions', permission: 'view_permissions' },
            ],
        },

        { name: 'Settings', icon: FiSettings, path: '/admin/settings', permission: 'view_settings' },
        { name: 'Visit Store', icon: FiExternalLink , path: '/',  external: true},
    ];

    const filteredNavigation = navigation.filter((item) => {
        if (!item.permission) return true;
        if (item.children) {
            return item.children.some((child) => hasPermission(child.permission));
        }
        return hasPermission(item.permission);
    });

    return (
        <>
            {isMobile && isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
            )}

            <aside className={`fixed top-0 left-0 h-full z-50 bg-white border-r border-sky-100 shadow-[4px_0_24px_-12px_rgba(2,132,199,0.25)] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isMobile ? 'w-[17rem]' : 'w-64'} lg:translate-x-0 flex flex-col`}
                style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                <style>{`
                    aside::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
                    aside { scrollbar-width: none !important; -ms-overflow-style: none !important; }
                `}</style>

                {/* Brand */}
                <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b border-sky-100 bg-white/90 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200 ring-1 ring-white/60">
                            <span className="text-white font-extrabold text-sm">Z</span>
                        </div>
                        <div className="leading-tight text-left">
                            <span className="block text-base font-bold text-slate-800 !text-left">Admin Panel</span>
                            <span className="block text-[11px] font-medium text-sky-600 !text-left">Super Control</span>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition-colors lg:hidden">
                        <FiChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 !text-left">
                        Main Menu
                    </p>
                    <ul className="space-y-1">
                        {filteredNavigation.map((item, index) => {
                            if (item.children) {
                                const isExpanded = expandedModules[item.name] || false;
                                const anyChildActive = isChildActive(item);
                                return (
                                    <li key={index}>
                                        <button
                                            onClick={() => toggleModule(item.name)}
                                            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 !text-left ${isExpanded || anyChildActive
                                                ? 'bg-sky-50 text-blue-700 font-semibold'
                                                : 'text-slate-600 hover:bg-sky-50/70 hover:text-blue-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1 !text-left">
                                                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${anyChildActive ? 'text-blue-700' : ''}`} />
                                                <span className="truncate !text-left flex-1">{item.name}</span>
                                            </div>
                                            {isExpanded ? (
                                                <FiChevronRight className="w-4 h-4 rotate-90 transition-transform duration-200" />
                                            ) : (
                                                <FiChevronRight className="w-4 h-4 transition-transform duration-200" />
                                            )}
                                        </button>
                                        {isExpanded && (
                                            <ul className="ml-5 mt-1 space-y-1 border-l border-sky-100 pl-3">
                                                {item.children.map((child) => {
                                                    if (!hasPermission(child.permission)) return null;
                                                    const ChildIcon = child.icon || FiChevronRight;
                                                    return (
                                                        <li key={child.path}>
                                                            <NavLink
                                                                to={child.path}
                                                                className={({ isActive }) =>
                                                                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 !text-left ${isActive
                                                                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md shadow-sky-200'
                                                                        : 'text-slate-500 hover:bg-sky-50 hover:text-blue-700'
                                                                    }`
                                                                }
                                                            >
                                                                <ChildIcon className="w-4 h-4 flex-shrink-0" />
                                                                <span className="!text-left flex-1">{child.name}</span>
                                                            </NavLink>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                );
                            }

                            return (
                                <li key={index}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 !text-left ${isActive
                                                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md shadow-sky-200'
                                                : 'text-slate-600 hover:bg-sky-50/70 hover:text-blue-700'
                                            }`
                                        }
                                    >
                                        <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                                        <span className="truncate !text-left flex-1">{item.name}</span>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User footer */}
                <div className="sticky bottom-0 border-t border-sky-100 p-4 bg-gradient-to-r from-sky-50 to-white">
                    <div className="flex items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-sky-100">
                        <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-md shadow-sky-200 flex-shrink-0">
                            <span className="text-white font-semibold text-sm">{user?.first_name?.[0] || 'A'}</span>
                        </div>
                        <div className="flex-1 min-w-0 !text-left">
                            <p className="text-sm font-semibold text-slate-800 truncate !text-left">{user?.first_name} {user?.last_name}</p>
                            <p className="text-[11px] text-sky-600 font-medium truncate capitalize !text-left">{user?.user_type || user?.role?.roleName || 'Admin'}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;