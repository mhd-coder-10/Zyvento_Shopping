
// MY PROFILE PAGE - COMPLETE WITH ALL FEATURES
// Description: User profile with edit, change/reset password, stats
// APIs: getProfile, updateProfile, uploadProfileImage, changePassword, forgotPassword

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiEdit2,
    FiCamera,
    FiSave,
    FiX,
    FiCheck,
    FiLock,
    FiLogOut,
    FiPackage,
    FiHeart,
    FiStar,
    FiTag,
    FiMapPin,
    FiShoppingBag,
    FiClock,
    FiChevronRight,
    FiShield,
    FiBell,
    FiSettings,
    FiCreditCard,
    FiHelpCircle,
    FiArrowLeft,
    FiSend,
    FiKey,
} from 'react-icons/fi';
import ApiService from '../../api/ApiService';
import { logoutUser } from '../../store/slices/authSlice';

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile_number: '',
        profile_image: '',
        created_at: '',
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [stats, setStats] = useState({
        orders: 0,
        wishlist: 0,
        reviews: 0,
        coupons: 0,
    });

    // Load profile data
    useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                mobile_number: user.mobile_number || '',
                profile_image: user.profile_image || '',
                created_at: user.created_at || '',
            });
            setResetEmail(user.email || '');
        }
        loadStats();
    }, [user]);

    // Load user stats
    const loadStats = async () => {
        try {
            // Fetch orders count
            const ordersRes = await ApiService.getCustomerOrders({ page: 1, limit: 1 });
            if (ordersRes.data.success) {
                setStats(prev => ({ ...prev, orders: ordersRes.data.data.total || 0 }));
            }

            // Fetch wishlist count
            const wishlistRes = await ApiService.getWishlist({ page: 1, limit: 1 });
            if (wishlistRes.data.success) {
                setStats(prev => ({ ...prev, wishlist: wishlistRes.data.data.total || 0 }));
            }

            // Fetch reviews count
            const reviewsRes = await ApiService.getUserReviews({ page: 1, limit: 1 });
            if (reviewsRes.data.success) {
                setStats(prev => ({ ...prev, reviews: reviewsRes.data.data.total || 0 }));
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    // Handle profile update
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await ApiService.updateProfile({
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                mobile_number: profileData.mobile_number,
            });

            if (response.data.success) {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
                const updatedUser = { ...user, ...profileData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.location.reload();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // Handle image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('profileImage', file);

        setLoading(true);

        try {
            const response = await ApiService.uploadProfileImage(formData);

            if (response.data.success) {
                toast.success('Profile picture updated!');
                setImagePreview(URL.createObjectURL(file));
                const updatedUser = { ...user, profile_image: response.data.data.profileImage };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.location.reload();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (loading) return;

        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('New passwords do not match');
            return;
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
        if (!passwordRegex.test(passwordData.new_password)) {
            toast.error('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)');
            return;
        }

        setLoading(true);

        try {
            const response = await ApiService.changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
                confirm_password: passwordData.confirm_password,
            });

            if (response.data.success) {
                toast.success('Password changed successfully!');
                setShowChangePassword(false);
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                });
            }
        } catch (error) {
            console.log('Error:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };


    // Handle reset password (Forgot Password)
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!resetEmail.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        // Check if email matches registered email
        if (resetEmail.trim() !== user?.email) {
            toast.error('Email does not match your registered email');
            return;
        }

        setResetLoading(true);

        try {
            const response = await ApiService.forgotPassword({ email: resetEmail });

            if (response.data.success) {
                toast.success('Password reset link sent to your email!');
                setShowResetPassword(false);
                setShowChangePassword(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally {
            setResetLoading(false);
        }
    };

    // Handle logout
       const handleLogout = async () => {
        try {
            const result = await dispatch(logoutUser());

            // Toast already shown in authSlice
            // Navigation handled here
            if (result.meta.requestStatus === 'fulfilled') {
                navigate('/login', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login', { replace: true });
        }
    };


    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Quick action items with counts
    const quickActions = [
        { icon: <FiPackage />, label: 'My Orders', path: '/orders', count: stats.orders },
        { icon: <FiHeart />, label: 'Wishlist', path: '/wishlist', count: stats.wishlist },
        { icon: <FiMapPin />, label: 'Saved Addresses', path: '/addresses' },
        { icon: <FiBell />, label: 'Notifications', path: '/notifications' },
        { icon: <FiCreditCard />, label: 'Payment Methods', path: '/payment-methods' },
        { icon: <FiSettings />, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

            {/* ============ BACK BUTTON ============ */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-4"
            >
                <FiArrowLeft className="w-4 h-4" />
                Back
            </button>

            {/* ============ PAGE HEADER ============ */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Account</h1>
                    <p className="text-sm text-gray-500">Manage your profile and account settings</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <FiLogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>

            {/* ============ PROFILE CARD ============ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 sm:p-8">

                    {/* ===== Profile Header ===== */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-indigo-200 shadow-lg">
                                {imagePreview || profileData.profile_image ? (
                                    <img
                                        src={imagePreview || profileData.profile_image || `https://ui-avatars.com/api/?name=${profileData.first_name}+${profileData.last_name}&size=128&background=4F46E5&color=fff`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FiUser className="w-12 h-12 text-indigo-400" />
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
                                disabled={loading}
                            >
                                <FiCamera className="w-4 h-4" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {profileData.first_name} {profileData.last_name}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                    <FiMail className="w-4 h-4" />
                                    {profileData.email}
                                </span>
                                <span className="hidden sm:inline text-gray-300">|</span>
                                <span className="flex items-center gap-1">
                                    <FiPhone className="w-4 h-4" />
                                    {profileData.mobile_number || 'No phone'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Member since {formatDate(profileData.created_at)}
                            </p>
                        </div>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            {isEditing ? <FiX className="w-4 h-4" /> : <FiEdit2 className="w-4 h-4" />}
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {/* ===== Stats Cards ===== */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-gray-100">
                        <Link to="/orders" className="text-center p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer">
                            <p className="text-2xl font-bold text-indigo-600">{stats.orders}</p>
                            <p className="text-xs text-gray-500">Orders</p>
                        </Link>
                        <Link to="/wishlist" className="text-center p-3 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors cursor-pointer">
                            <p className="text-2xl font-bold text-pink-500">{stats.wishlist}</p>
                            <p className="text-xs text-gray-500">Wishlist</p>
                        </Link>
                        <Link to="/reviews" className="text-center p-3 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors cursor-pointer">
                            <p className="text-2xl font-bold text-yellow-500">{stats.reviews}</p>
                            <p className="text-xs text-gray-500">Reviews</p>
                        </Link>
                        <Link to="/coupons" className="text-center p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors cursor-pointer">
                            <p className="text-2xl font-bold text-green-500">{stats.coupons}</p>
                            <p className="text-xs text-gray-500">Coupons</p>
                        </Link>
                    </div>

                    {/* ===== Edit Profile Form ===== */}
                    {isEditing && (
                        <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.first_name}
                                        onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.last_name}
                                        onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    value={profileData.mobile_number}
                                    onChange={(e) => setProfileData({ ...profileData, mobile_number: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : <><FiSave className="w-4 h-4" /> Save Changes</>}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* ============ QUICK ACTIONS ============ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {quickActions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.path}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                {action.icon}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{action.label}</p>
                                {action.count !== undefined && (
                                    <p className="text-xs text-gray-500">{action.count} items</p>
                                )}
                            </div>
                        </div>
                        <FiChevronRight className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </Link>
                ))}
            </div>

            {/* ============ CHANGE PASSWORD & RESET PASSWORD ============ */}
            <div className="mt-6">
                <button
                    onClick={() => {
                        setShowChangePassword(!showChangePassword);
                        setShowResetPassword(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                    <FiLock className="w-4 h-4" />
                    {showChangePassword ? 'Cancel' : 'Change Password'}
                </button>

                {showChangePassword && (
                    <div className="mt-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* ===== LEFT: Change Password ===== */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            required
                                            minLength={8}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : <><FiCheck className="w-4 h-4" /> Update Password</>}
                                    </button>
                                </form>
                            </div>

                            {/* ===== RIGHT: Reset Password ===== */}
                            <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiKey className="text-indigo-600" />
                                    Forgot Password?
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    If you forgot your current password, enter your registered email to receive a reset link.
                                </p>

                                {!showResetPassword ? (
                                    <button
                                        onClick={() => setShowResetPassword(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                                    >
                                        Reset Password
                                    </button>
                                ) : (
                                    <form onSubmit={handleResetPassword} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Registered Email
                                            </label>
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                placeholder="Enter your registered email"
                                                required
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">
                                                Password reset link will be sent to this email
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={resetLoading}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                            >
                                                {resetLoading ? 'Sending...' : <><FiSend className="w-4 h-4" /> Send Reset Link</>}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowResetPassword(false)}
                                                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ============ SUPPORT SECTION ============ */}
            <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <FiHelpCircle className="text-2xl text-indigo-600" />
                    <div>
                        <p className="font-medium text-gray-900">Need Help?</p>
                        <p className="text-sm text-gray-500">Our support team is here to assist you</p>
                    </div>
                </div>
                <Link
                    to="/help"
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Visit Help Center
                </Link>
            </div>
        </div>
    );
};

export default Profile;