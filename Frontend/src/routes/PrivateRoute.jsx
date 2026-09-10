
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
    const location = useLocation();

        if (loading) {
        return <LoadingSpinner fullPage text="Verifying..." />;
    }

    // if not authenticated so redirect on login page
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children || <Outlet />; 
};

export default PrivateRoute;
