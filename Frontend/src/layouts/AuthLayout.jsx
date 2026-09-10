// import React from 'react';
// import { Outlet, Navigate } from 'react-router-dom';
// import { useAppSelector } from '../store/hooks';
// import LoadingSpinner from '../components/common/LoadingSpinner';

// const AuthLayout = () => {
//     const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

//     if (loading) {
//         return <LoadingSpinner fullPage text="Loading..." />;
//     }

//     if (isAuthenticated) {
//         return <Navigate to="/" replace />;
//     }

//     return (
//         <div className="auth-layout">
//             <Outlet />
//         </div>
//     );
// };

// export default AuthLayout;



import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AuthLayout = () => {
    const { isAuthenticated, profileLoading } = useAppSelector((state) => state.auth);

    if (profileLoading) {
        return <LoadingSpinner fullPage text="Loading..." />;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="auth-layout">
            <Outlet />
        </div>
    );
};

export default AuthLayout;