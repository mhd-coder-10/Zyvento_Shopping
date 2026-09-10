
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const AdminTopbar = ({ title, subtitle, actions }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const getBreadcrumbName = (path) => {
        const names = {
            admin: 'Home',
            dashboard: 'Dashboard',
            users: 'Users',
            roles: 'Roles',
            permissions: 'Permissions',
            sellers: 'Sellers',
            employees: 'Employees',
            products: 'Products',
            categories: 'Categories',
            inventory: 'Inventory',
            orders: 'Orders',
            payments: 'Payments',
            transactions: 'Transactions',
            returns: 'Returns',
            reviews: 'Reviews',
            coupons: 'Coupons',
            notifications: 'Notifications',
            reports: 'Reports',
            settings: 'Settings',
            profile: 'Profile',
        };
        return names[path] || path.charAt(0).toUpperCase() + path.slice(1);
    };

    const getBreadcrumbUrl = (index) => {
        return '/' + pathnames.slice(0, index + 1).join('/');
    };

    const pageTitle = title || getBreadcrumbName(pathnames[pathnames.length - 1]);

    return (
        <div className="relative isolate mb-6 rounded-2xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
            {/* top accent */}
            <span className="pointer-events-none absolute inset-x-0 top-0 z-0 h-1 rounded-t-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />
            {/* soft glow (title ke peeche, kabhi uske upar nahi) */}
            <span className="pointer-events-none absolute -right-16 -top-16 z-0 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <nav className="mb-2 flex flex-wrap items-center gap-1 text-sm">
                        <Link
                            to="/admin/dashboard"
                            className="rounded-lg p-1.5 text-sky-600 transition-colors hover:bg-sky-50 hover:text-blue-700"
                        >
                            <FiHome className="h-4 w-4" />
                        </Link>
                        {pathnames.map((path, index) => {
                            const isLast = index === pathnames.length - 1;
                            const name = getBreadcrumbName(path);
                            const url = getBreadcrumbUrl(index);

                            if (isLast) {
                                return (
                                    <span key={index} className="flex items-center gap-1">
                                        <FiChevronRight className="h-3.5 w-3.5 text-sky-300" />
                                        <span className="rounded-lg bg-sky-50 px-2 py-0.5 font-semibold capitalize text-blue-700 ring-1 ring-sky-200">
                                            {name}
                                        </span>
                                    </span>
                                );
                            }

                            return (
                                <span key={index} className="flex items-center gap-1">
                                    <FiChevronRight className="h-3.5 w-3.5 text-sky-300" />
                                    <Link
                                        to={url}
                                        className="rounded-lg px-1.5 py-0.5 font-medium capitalize text-slate-500 transition-colors hover:bg-sky-50 hover:text-blue-700"
                                    >
                                        {name}
                                    </Link>
                                </span>
                            );
                        })}
                    </nav>

                    {/* PAGE TITLE — kisi bhi page ka CSS ise override nahi kar sakta */}
                    <h1
                        title={pageTitle}
                        className="relative z-10 block truncate !text-slate-900 !opacity-100 !mix-blend-normal !bg-none !bg-clip-border !text-2xl !font-extrabold !leading-tight !tracking-tight [text-shadow:none] [filter:none] [-webkit-text-fill-color:currentColor] sm:!text-3xl"
                        style={{
                            color: '#0f172a',
                            WebkitTextFillColor: '#0f172a',
                            opacity: 1,
                            filter: 'none',
                            textShadow: 'none',
                            backgroundImage: 'none',
                            mixBlendMode: 'normal',
                        }}
                    >
                        {pageTitle}
                    </h1>

                    {subtitle && (
                        <p
                            className="relative z-10 mt-1 text-sm !font-medium !text-slate-600 !opacity-100"
                            style={{ color: '#475569', WebkitTextFillColor: '#475569', opacity: 1 }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>

                {actions && (
                    <div className="relative z-20 flex flex-wrap items-center gap-2 sm:gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTopbar;

