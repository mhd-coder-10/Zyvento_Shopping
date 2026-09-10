// RESET PASSWORD PAGE
// Description: User enters new password using token from email link
// API Used: resetPassword (POST /auth/reset-password)
// Flow: User clicks email link -> Enters new password -> API verifies token -> Password updated
// URL: /reset-password/:token (token comes from email link)


import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../store/slices/authSlice';
import AuthForm from '../../components/public/AuthForm';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    // State to store token (never shown in URL)
    const [token, setToken] = useState(null);
    const [isTokenValid, setIsTokenValid] = useState(false);

    useEffect(() => {
        // Extract token from URL query params
        const queryParams = new URLSearchParams(location.search);
        const urlToken = queryParams.get('token');

        if (urlToken) {
            // Store token in state
            setToken(urlToken);
            setIsTokenValid(true);

            // IMMEDIATELY remove token from URL (security best practice)
            // This prevents token from staying in browser history
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname // Only path, no query params
            );

            // Store token in session storage (cleared when tab closes)
            sessionStorage.setItem('resetToken', urlToken);

            toast.info('Please enter your new password');
        } else {
            // Check if token exists in session storage
            const sessionToken = sessionStorage.getItem('resetToken');
            if (sessionToken) {
                setToken(sessionToken);
                setIsTokenValid(true);
            } else {
                toast.error('Invalid or missing reset token');
                navigate('/forgot-password');
            }
        }
    }, [location, navigate]);

    const handleResetPassword = async (data) => {
        // Get token from state or session storage
        const resetToken = token || sessionStorage.getItem('resetToken');

        if (!resetToken) {
            toast.error('Invalid reset token. Please request a new one.');
            navigate('/forgot-password');
            return;
        }

        // Validate password match
        if (data.newPassword !== data.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const result = await dispatch(resetPassword({
                token: resetToken,
                new_password: data.newPassword || data.new_password,
                confirm_password: data.confirmPassword || data.confirm_password,
            }));

            if (result.meta.requestStatus === 'fulfilled') {
                // Clear token after successful reset
                sessionStorage.removeItem('resetToken');
                setToken(null);
                setIsTokenValid(false);

                toast.success('Password reset successfully! Please login with your new password.');
                navigate('/login');
            } else {
                // Show error message from backend
                const errorMessage = result.payload || 'Failed to reset password';
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    };

    // If no token, show loading or redirect
    if (!isTokenValid) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <p>Verifying token...</p>
            </div>
        );
    }

    return (
        <AuthForm
            type="reset"
            onSubmit={handleResetPassword}
            loading={loading}
            error={error}
        />
    );
};

export default ResetPassword;