
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, sendOtp, verifyOtp, loginUser } from '../../store/slices/authSlice';
import AuthForm from '../../components/public/AuthForm';
import { toast } from 'react-toastify';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    
    // HANDLE REGISTRATION + SEND OTP
    const handleRegister = async (data) => {
        setEmail(data.email);
        setPassword(data.password);

        const registerResult = await dispatch(registerUser(data));

        if (registerResult.meta.requestStatus === 'fulfilled') {
            setOtpSent(true);
            // toast.success('OTP sent to your email!');
            startTimer();
        }
    };

    
    // HANDLE OTP VERIFICATION
    const handleVerifyOtp = async (data) => {
        setOtpLoading(true);
        setOtpError('');

        const result = await dispatch(verifyOtp({
            email: data.email,
            otp: data.otp,
            purpose: 'user_registration'
        }));

        setOtpLoading(false);

        if (result.meta.requestStatus === 'fulfilled') {
            setOtpVerified(true);
            toast.success('Email verified!');

            // Auto login after OTP verification
            const loginResult = await dispatch(loginUser({
                email: email,
                password: password
            }));

            if (loginResult.meta.requestStatus === 'fulfilled') {
               
                // TOKEN EXTRACTION AND VALIDATION
                // Supports multiple response formats

                const loginData = loginResult.payload;

                // Extract token from multiple possible response formats
                const accessToken = loginData?.accessToken ||
                    loginData?.token ||
                    loginData?.data?.accessToken ||
                    loginData?.data?.token;

                const refreshToken = loginData?.refreshToken ||
                    loginData?.data?.refreshToken;

                const user = loginData?.user ||
                    loginData?.data?.user ||
                    loginData?.data?.data?.user;

                // Debug logs for troubleshooting
                console.log('Login Response:', loginData);
                console.log('Extracted Token:', accessToken);
                console.log('Extracted User:', user);

                // Validate token existence
                if (!accessToken) {
                    console.error('No token found in login response');
                    toast.error('Login failed. Please login manually.');
                    navigate('/login', {
                        state: { message: 'Account created! Please login manually.' }
                    });
                    return;
                }

                // Validate user data existence
                if (!user) {
                    console.error('No user data found in login response');
                    toast.error('User data not found. Please login manually.');
                    navigate('/login', {
                        state: { message: 'Account created! Please login manually.' }
                    });
                    return;
                }

            
                // SAVE TOKEN AND USER DATA IN LOCAL STORAGE

                // Save access token
                localStorage.setItem('accessToken', accessToken);

                // Save refresh token if available
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }

                // Save user data
                localStorage.setItem('user', JSON.stringify(user));

                // Set axios default authorization header if available
                if (window.axios) {
                    window.axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                }

                // SUCCESS - REDIRECT TO HOME

                toast.success('Welcome! Redirecting to home...');
                navigate('/');

            } else {
                // Auto-login failed - redirect to login page
                const errorMessage = loginResult.payload || 'Auto-login failed. Please login manually.';
                console.error('Auto-login failed:', errorMessage);
                toast.error('Account created! Please login manually.');
                navigate('/login', {
                    state: { message: 'Account created! Please login manually.' }
                });
            }
        } else {
            setOtpError('Invalid OTP. Please try again.');
        }
    };

  
    // HANDLE RESEND OTP
    const handleResendOtp = async () => {
        setOtpLoading(true);
        setOtpError('');
        setCanResend(false);
        setTimer(60);

        await dispatch(sendOtp({
            email: email,
            purpose: 'user_registration'
        }));

        setOtpLoading(false);
        toast.success('OTP resent!');
        startTimer();
    };

    
    // OTP TIMER
    const startTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <AuthForm
            type="register"
            onSubmit={handleRegister}
            onVerifyOtp={handleVerifyOtp}
            onResendOtp={handleResendOtp}
            loading={loading}
            otpLoading={otpLoading}
            error={error}
            otpError={otpError}
            otpSent={otpSent}
            otpVerified={otpVerified}
            email={email}
            timer={timer}
            canResend={canResend}
        />
    );
};

export default Register;


