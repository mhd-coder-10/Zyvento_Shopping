
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiHome, FiArrowLeft } from 'react-icons/fi';

const STATIC_ROUTE_NAMES = {
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
    edit: 'Edit',
    create: 'Create',
    add: 'Add',
    details: 'Details',
    view: 'View',
};

const AdminTopbar = ({ title, subtitle, actions }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const breadcrumbItems = pathnames
        .map((path, index) => ({
            path,
            index,
            url: '/' + pathnames.slice(0, index + 1).join('/'),
            name: STATIC_ROUTE_NAMES[path] || null,
        }))
        .filter((item) => item.name !== null)
        .filter((item) => item.path !== 'admin');

    const lastPath = pathnames[pathnames.length - 1] || '';
    const fallbackTitle =
        STATIC_ROUTE_NAMES[lastPath] ||
        lastPath.charAt(0).toUpperCase() + lastPath.slice(1);
    const pageTitle = title || fallbackTitle;

    // Smart Navigation logic 
    // - On a detail/edit page (path > /admin/module) → go back 1 step
    // - On a list page (/admin/module) → go to dashboard

    const handleHomeclick = () => {
        // pathnames[0] = 'admin', pathnames[1] = module (users/sellers/etc)
        // If more than 2 segments → we're on a sub-page (detail/edit/create)

        if (pathnames.length > 2) {
            navigate(-1); // Navigate back to the previous page
        }
        else {
            window.location.href = '/admin/dashboard';
        }
    };
    const isDetailPage = pathnames.length > 2;

    return (
        <div className="relative isolate mb-0 rounded-2xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
            <span className="pointer-events-none absolute inset-x-0 top-0 z-0 h-1 rounded-t-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />
            <span className="pointer-events-none absolute -right-16 -top-16 z-0 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />

            <div className="relative z-10 p-4 sm:p-5">
                {/* Breadcrumb - left aligned on all screen sizes */}
                <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm">
                    <Link
                        type="button"
                        onClick={handleHomeclick}
                        className="rounded-lg p-1.5 text-sky-600 transition-colors hover:bg-sky-50 hover:text-blue-700"
                        title={isDetailPage ? 'Back' : 'Go to Dashboard'}
                        style={{ color: '#0284c7' }}
                    >
                        {/* <FiHome className="h-4 w-4" /> */}
                        {isDetailPage ? <FiArrowLeft className="h-4 w-4" /> : <FiHome className="h-4 w-4" />}
                    </Link>

                    {breadcrumbItems.map((item, idx) => {
                        const isLast = idx === breadcrumbItems.length - 1;
                        return (
                            <span key={item.path + item.index} className="flex items-center gap-1">
                                <FiChevronRight className="h-3.5 w-3.5 text-sky-300" />
                                {isLast ? (
                                    <span
                                        className="rounded-lg bg-sky-50 px-2 py-0.5 font-semibold capitalize ring-1 ring-sky-200"
                                        style={{ color: '#1d4ed8' }}
                                    >
                                        {item.name}
                                    </span>
                                ) : (
                                    <Link
                                        to={item.url}
                                        className="rounded-lg px-1.5 py-0.5 font-medium capitalize text-slate-500 transition-colors hover:bg-sky-50 hover:text-blue-700"
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </span>
                        );
                    })}
                </nav>

                {/* Desktop Layout */}
                <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1
                            title={pageTitle}
                            className="truncate"
                            style={{
                                color: '#0f172a',
                                WebkitTextFillColor: '#0f172a',
                                fontWeight: 900,
                                fontSize: '1.5rem',
                                lineHeight: '2rem',
                                letterSpacing: '-0.025em',
                                opacity: 1,
                                filter: 'none',
                                textShadow: 'none',
                                mixBlendMode: 'normal',
                                marginTop: '-1rem',
                                marginBottom: '0.8rem',
                            }}
                        >
                            {pageTitle}
                        </h1>
                        {subtitle && (
                            <p
                                className="mt-0.5 truncate"
                                style={{
                                    color: '#475569',
                                    WebkitTextFillColor: '#475569',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    lineHeight: '1.25rem',
                                    opacity: 1,
                                    filter: 'none',
                                }}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {actions && (
                        <div className="flex items-center gap-3 shrink-0 -mt-2">
                            {actions}
                        </div>
                    )}
                </div>


                {/* Mobile Layout */}
                <div className="flex flex-col gap-3 lg:hidden">
                    <div className="text-center">
                        <h1
                            title={pageTitle}
                            className="truncate"
                            style={{
                                color: '#0f172a',
                                WebkitTextFillColor: '#0f172a',
                                fontWeight: 900,
                                fontSize: '1.5rem',
                                lineHeight: '2rem',
                                letterSpacing: '-0.025em',
                                opacity: 1,
                                filter: 'none',
                                textShadow: 'none',
                                mixBlendMode: 'normal',
                                marginTop: '0rem',
                                marginBottom: '0.4rem',
                            }}
                        >
                            {pageTitle}
                        </h1>
                        {subtitle && (
                            <p
                                className="mt-0.5"
                                style={{
                                    color: '#475569',
                                    WebkitTextFillColor: '#475569',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    lineHeight: '1.35rem',
                                    opacity: 1,
                                    filter: 'none',
                                    whiteSpace: 'normal',
                                    overflow: 'visible',
                                    textOverflow: 'clip',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {actions && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                            {actions}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminTopbar;