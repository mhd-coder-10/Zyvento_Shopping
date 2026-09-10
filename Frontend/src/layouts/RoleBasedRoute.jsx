import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RoleBasedRoute = ({ allowedRoles, children }) => {
    const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

    if (loading) {
        return <LoadingSpinner fullPage text="Verifying access..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user?.role?.roleName || user?.role_name || 'customer';

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return children || <Outlet />;
};

export default RoleBasedRoute;