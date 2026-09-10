// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAppSelector } from '../store/hooks';

// const RoleBasedRoute = ({
//     children,
//     allowedRoles = [],
//     requiredPermissions = [],
//     fallbackPath = '/',
// }) => {
//     const { user, isAuthenticated } = useAppSelector((state) => state.auth);

//     if (!isAuthenticated) {
//         return <Navigate to="/login" replace />;
//     }

//     const userRole = user?.role?.roleName || user?.role_name || 'customer';

//     // Check if user has allowed role
//     if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
//         return <Navigate to={fallbackPath} replace />;
//     }

//     // Check if user has required permissions
//     if (requiredPermissions.length > 0) {
//         const userPermissions = user?.role?.permissions || user?.permissions || [];
//         const hasAllPermissions = requiredPermissions.every((p) =>
//             userPermissions.includes(p)
//         );

//         if (!hasAllPermissions) {
//             return <Navigate to={fallbackPath} replace />;
//         }
//     }

//     return children;
// };

// export default RoleBasedRoute;


import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RoleBasedRoute = ({
    children,
    allowedRoles = [],
    requiredPermissions = [],
    fallbackPath = '/',  // ✅ Ye default rakh sakte ho
}) => {
    const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

    console.log('🛡️ RoleBasedRoute - isAuthenticated:', isAuthenticated);
    console.log('🛡️ RoleBasedRoute - loading:', loading);
    console.log('🛡️ RoleBasedRoute - user:', user);
    console.log('🛡️ RoleBasedRoute - allowedRoles:', allowedRoles);

    if (loading) {
        return <LoadingSpinner fullPage text="Verifying access..." />;
    }

    if (!isAuthenticated) {
        console.log('🛡️ RoleBasedRoute - Redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // ✅ IMPORTANT: user_type bhi check karein
    const userRole = user?.role?.roleName || user?.role_name || user?.user_type || 'customer';
    console.log('🛡️ RoleBasedRoute - userRole:', userRole);

    // ✅ Check if user has allowed role
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        console.log('🛡️ RoleBasedRoute - Redirecting to home (role not allowed)');
        return <Navigate to={fallbackPath} replace />;
    }

    // Check if user has required permissions
    if (requiredPermissions.length > 0) {
        const userPermissions = user?.role?.permissions || user?.permissions || [];
        const hasAllPermissions = requiredPermissions.every((p) =>
            userPermissions.includes(p)
        );

        if (!hasAllPermissions) {
            console.log('🛡️ RoleBasedRoute - Redirecting to home (permissions missing)');
            return <Navigate to={fallbackPath} replace />;
        }
    }

    console.log('🛡️ RoleBasedRoute - Access granted');
    return children;
};

export default RoleBasedRoute;