
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import LoadingSpinner from '../components/common/LoadingSpinner';

const getDashboardPath = (userType) => {
    switch (userType) {
        case 'super_admin':
        case 'sub_admin':
            return '/admin/dashboard';
        case 'seller':
        case 'seller_employee':
            return '/';
        case 'customer':
        default:
            return '/';
    }
};

const RoleBasedRoute = ({
    children,
    allowedRoles = [],
    requiredPermissions = [],
    fallbackPath = null,
}) => {
    const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

    if (loading) {
        return <LoadingSpinner fullPage text="Verifying access..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    /* user_type priority — ore reliable for RoleBasedRoute  */
    const userType = user?.user_type || user?.role?.role_type || 'customer';

    /* Allowed role check */
    if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
        const redirectTo = fallbackPath || getDashboardPath(userType);
        return <Navigate to={redirectTo} replace />;
    }

    /* Permission check */
    if (requiredPermissions.length > 0) {
        const raw = user?.permissions || user?.permission_keys || user?.role?.permissions || [];
        const perms = (Array.isArray(raw) ? raw : [])
            .map((p) => (typeof p === 'string' ? p : p?.permission_key || p?.key))
            .filter(Boolean)
            .map((k) => String(k).toUpperCase());

        const hasAll = requiredPermissions.every((p) =>
            perms.includes(String(p).toUpperCase())
        );

        if (!hasAll) {
            const redirectTo = fallbackPath || getDashboardPath(userType);
            return <Navigate to={redirectTo} replace />;
        }
    }

    return children;
};

export default RoleBasedRoute;