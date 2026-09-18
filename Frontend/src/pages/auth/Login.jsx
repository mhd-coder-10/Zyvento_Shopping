
// LOGIN PAGE
// Description: User login page with role-based redirect
// Features: Login, Role-based redirect, Auto-login after registration

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import AuthForm from '../../components/public/AuthForm';
import { toast } from 'react-toastify';

/* Returns the correct dashboard path based on user_type */
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

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, user, isAuthenticated } = useSelector((state) => state.auth);

    // Redirect based on user_type after successful login
    useEffect(() => {
        if (isAuthenticated && user) {
            /* Backend sends user_type - not role.roleName */
            const userType = user?.user_type || user?.role?.role_type || 'customer';
            navigate(getDashboardPath(userType), { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleLogin = async (data) => {
        try {
            const result = await dispatch(loginUser(data));

            if (result.meta.requestStatus === 'fulfilled') {
                // Success - toast already in authSlice
                // AuthForm will clear fields on success
            } else {
                // Failed - keep fields filled
                const errorMsg = result.payload || 'Invalid credentials';
                toast.error(errorMsg);
            }
        } catch (error) {
            toast.error(error.message || 'Login failed');
        }
    };

    return (
        <AuthForm
            type="login"
            onSubmit={handleLogin}
            loading={loading}
            error={error}
        />
    );
};

export default Login;