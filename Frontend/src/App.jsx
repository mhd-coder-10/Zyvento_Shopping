
// APP ROOT COMPONENT
// Description: Main application component that handles authentication
// and routing. Fetches user profile only if valid token exists.

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { useAppSelector } from './store/hooks';
import { checkAuthStatus } from './store/slices/authSlice';

const App = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user, profileLoading } = useSelector((state) => state.auth);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Check auth status if not already authenticated and user not loaded
            if (!isAuthenticated && !user && !profileLoading) {
                dispatch(checkAuthStatus());
            }
        }
    }, [dispatch, isAuthenticated, user, profileLoading]);


    return (
        <AppRoutes />
    );
};

export default App;
