

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft,
    FiShield,
    FiCheck,
    FiX,
    FiInfo,
    FiAlertCircle,
} from 'react-icons/fi';

import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const EditRole = () => {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'custom',
        status: 'active',
    });
    const [errors, setErrors] = useState({});
    const [isSystemRole, setIsSystemRole] = useState(false);

    useEffect(() => {
        fetchRoleDetails();
    }, [roleId]);

    const fetchRoleDetails = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getAllRoles();
            if (response.data.success) {
                const role = response.data.data.find(r => r._id === roleId);
                if (role) {
                    setFormData({
                        name: role.name || '',
                        description: role.description || '',
                        type: role.type || 'custom',
                        status: role.status || 'active',
                    });
                    setIsSystemRole(role.type === 'system');
                } else {
                    toast.error('Role not found');
                    navigate('/admin/roles');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load role details');
            navigate('/admin/roles');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Role name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Role name must be at least 2 characters';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await ApiService.updateRole(roleId, {
                name: formData.name,
                description: formData.description,
                status: formData.status,
            });
            toast.success('Role updated successfully');
            navigate('/admin/roles');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage text="Loading role details..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-sky-100 p-4 md:p-6">
            <AdminTopbar
                title="Edit Role"
                subtitle={`Managing ${formData.name}`}
                actions={
                    <button
                        onClick={() => navigate('/admin/roles')}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm bg-white"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Roles
                    </button>
                }
            />

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
                    {/* System Role Warning */}
                    {isSystemRole && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 flex items-start gap-3">
                            <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-yellow-800">System Role</p>
                                <p className="text-xs text-yellow-600 mt-0.5">
                                    This is a system role. Some fields may be restricted from editing.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isSystemRole}
                                className={`w-full px-3 py-2.5 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm ${isSystemRole ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                            )}
                            {isSystemRole && (
                                <p className="text-xs text-gray-400 mt-1">
                                    System role name cannot be changed
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                disabled={isSystemRole}
                                placeholder="Describe what this role is responsible for..."
                                className={`w-full px-3 py-2.5 rounded-xl border ${errors.description ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none bg-white shadow-sm text-sm ${isSystemRole ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={isSystemRole}
                                className={`w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm ${isSystemRole ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="archived">Archived</option>
                            </select>
                            {isSystemRole && (
                                <p className="text-xs text-gray-400 mt-1">
                                    System role status cannot be changed
                                </p>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button
                                type="submit"
                                disabled={submitting || isSystemRole}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                <FiCheck className="w-4 h-4" />
                                Update Role
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/roles')}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <FiX className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRole;