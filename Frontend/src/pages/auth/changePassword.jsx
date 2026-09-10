
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../../store/slices/authSlice';
import Input from '../../components/forms/Input';
import { FiLock } from 'react-icons/fi';

const ChangePassword = () => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);  // ✅ Add this

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.current_password) {
            newErrors.current_password = 'Current password is required';
        }
        
        if (!formData.new_password) {
            newErrors.new_password = 'New password is required';
        } else if (formData.new_password.length < 8) {
            newErrors.new_password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.new_password)) {
            newErrors.new_password = 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)';
        }
        
        if (formData.new_password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ Prevent double submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ✅ Prevent multiple submissions
        if (isSubmitting || loading) {
            console.log('Already submitting, ignoring...');
            return;
        }
        
        if (!validate()) {
            console.log('Validation failed:', errors);
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('Submitting payload:', {
                current_password: formData.current_password,
                new_password: formData.new_password,
                confirm_password: formData.confirm_password,
            });

            const result = await dispatch(changePassword({
                current_password: formData.current_password,
                new_password: formData.new_password,
                confirm_password: formData.confirm_password,
            }));

            console.log('Result:', result);

            if (result.meta.requestStatus === 'fulfilled') {
                setSubmitted(true);
                setFormData({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                });
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                // ✅ Show exact error from backend
                const errorMsg = result.payload || 'Failed to change password';
                console.log('Error from backend:', errorMsg);
                toast.error(errorMsg);
            }
        } catch (error) {
            console.log('Catch error:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
                <p className="text-gray-600">Update your account password</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {submitted && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                        Password changed successfully!
                    </div>
                )}

                {/* ✅ Show validation errors at top */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        {Object.values(errors).map((error, index) => (
                            <p key={index} className="text-red-600 text-sm">{error}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Current Password"
                        name="current_password"
                        type="password"
                        value={formData.current_password}
                        onChange={handleChange}
                        error={errors.current_password}
                        placeholder="Enter current password"
                        required
                        icon={<FiLock className="text-gray-400" />}
                    />

                    <Input
                        label="New Password"
                        name="new_password"
                        type="password"
                        value={formData.new_password}
                        onChange={handleChange}
                        error={errors.new_password}
                        placeholder="Enter new password (min 8 characters)"
                        required
                        icon={<FiLock className="text-gray-400" />}
                    />

                    <Input
                        label="Confirm New Password"
                        name="confirm_password"
                        type="password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        error={errors.confirm_password}
                        placeholder="Confirm new password"
                        required
                        icon={<FiLock className="text-gray-400" />}
                    />

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={loading || isSubmitting}  // ✅ Disable during submission
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading || isSubmitting ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;