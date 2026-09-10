// LOGIN PAGE
// Description: User login page with role-based redirect
// Features: Login, Role-based redirect, Auto-login after registration

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import AuthForm from '../../components/public/AuthForm';
import { toast } from 'react-toastify';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, user, isAuthenticated } = useSelector((state) => state.auth);

    // Redirect based on user role after successful login
    useEffect(() => {
        if (isAuthenticated && user) {
            const role = user?.role?.roleName || user?.role_name || 'customer';

            if (role === 'super_admin' || role === 'sub_admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (role === 'seller' || role === 'seller_employee') {
                navigate('/seller/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
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