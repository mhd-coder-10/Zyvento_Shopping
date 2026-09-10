// FORGOT PASSWORD PAGE
// Description: User enters email to receive password reset link
// API Used: forgotPassword (POST /auth/forgot-password)
// Flow: User submits email -> API sends reset link to email -> Redirect to login


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../store/slices/authSlice';
import AuthForm from '../../components/public/AuthForm';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);
    const [error, setError] = useState(null);

    const handleForgotPassword = async (data) => {
        // Validate email
        if (!data.email || !data.email.trim()) {
            setError('Email is required');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            setError('Please enter a valid email address');
            return;
        }

        setError(null);

        try {
            const result = await dispatch(forgotPassword(data));
            
            if (result.meta.requestStatus === 'fulfilled') {
                // toast.success('Password reset link sent to your email!');
                navigate('/login');
            } else {
                // Show proper error message from backend
                const errorMessage = result.payload || 'Failed to send reset link';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send reset link';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <AuthForm
            type="forgot"
            onSubmit={handleForgotPassword}
            loading={loading}
            error={error}
        />
    );
};

export default ForgotPassword;