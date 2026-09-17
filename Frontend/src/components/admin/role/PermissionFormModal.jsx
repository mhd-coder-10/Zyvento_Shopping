import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiSave, FiKey, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';

const ACTION_OPTIONS = [
    { value: 'read', label: 'Read (View)' },
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'manage', label: 'Manage (Full)' },
    { value: 'approve', label: 'Approve' },
    { value: 'reject', label: 'Reject' },
    { value: 'export', label: 'Export' },
    { value: 'import', label: 'Import' },
    { value: 'assign', label: 'Assign' },
    { value: 'revoke', label: 'Revoke' }
];

const MODULE_OPTIONS = [
    'dashboard', 'users', 'sub_admins', 'employees', 'sellers',
    'products', 'categories', 'inventory', 'orders', 'returns',
    'payments', 'transactions', 'finance', 'reviews', 'coupons',
    'notifications', 'reports', 'marketing', 'roles', 'permissions', 'settings'
];

const PermissionFormModal = ({ isOpen, onClose, onSuccess, editingPermission }) => {
    const isEdit = Boolean(editingPermission);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        permission_name: '',
        permission_key: '',
        module_name: 'users',
        action: 'read',
        description: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (editingPermission) {
                setFormData({
                    permission_name: editingPermission.permission_name || '',
                    permission_key: editingPermission.permission_key || '',
                    module_name: editingPermission.module_name || 'users',
                    action: editingPermission.action || 'read',
                    description: editingPermission.description || ''
                });
            } else {
                setFormData({
                    permission_name: '',
                    permission_key: '',
                    module_name: 'users',
                    action: 'read',
                    description: ''
                });
            }
            setErrors({});
        }
    }, [isOpen, editingPermission]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

        // Auto-generate key & name from module + action
        if (!isEdit && (name === 'module_name' || name === 'action')) {
            const mod = name === 'module_name' ? value : formData.module_name;
            const act = name === 'action' ? value : formData.action;
            const autoKey = `${mod}_${act}`.toUpperCase();
            const autoName = `${act.charAt(0).toUpperCase() + act.slice(1)} ${mod.replace(/_/g, ' ')}`;
            setFormData((prev) => ({
                ...prev,
                permission_key: autoKey,
                permission_name: prev.permission_name || autoName
            }));
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.permission_name.trim()) errs.permission_name = 'Permission name is required';
        if (!formData.permission_key.trim()) errs.permission_key = 'Permission key is required';
        if (!formData.module_name) errs.module_name = 'Module is required';
        if (!formData.action) errs.action = 'Action is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const payload = {
                permission_name: formData.permission_name.trim(),
                permission_key: formData.permission_key.trim().toUpperCase(),
                module_name: formData.module_name,
                action: formData.action,
                description: formData.description.trim() || null
            };

            if (isEdit) {
                delete payload.permission_key;
                delete payload.module_name;
                delete payload.action;
                await ApiService.updatePermission(editingPermission._id, payload);
                toast.success('Permission updated successfully');
            } else {
                await ApiService.createPermission(payload);
                toast.success('Permission created successfully');
            }
            onSuccess();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save permission');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md">
                            <FiKey className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {isEdit ? 'Edit Permission' : 'Create Permission'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {isEdit ? 'Update permission details' : 'Add a new permission to the system'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Module <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="module_name"
                                value={formData.module_name}
                                onChange={handleChange}
                                disabled={isEdit}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none capitalize transition-all ${
                                    isEdit
                                        ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                }`}
                            >
                                {MODULE_OPTIONS.map((m) => (
                                    <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Action <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="action"
                                value={formData.action}
                                onChange={handleChange}
                                disabled={isEdit}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all ${
                                    isEdit
                                        ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                }`}
                            >
                                {ACTION_OPTIONS.map((a) => (
                                    <option key={a.value} value={a.value}>{a.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Permission Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="permission_name"
                            value={formData.permission_name}
                            onChange={handleChange}
                            placeholder="e.g., View Users"
                            className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all ${
                                errors.permission_name
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                        />
                        {errors.permission_name && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <FiAlertCircle size={12} /> {errors.permission_name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Permission Key <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="permission_key"
                            value={formData.permission_key}
                            onChange={handleChange}
                            disabled={isEdit}
                            placeholder="USERS_READ"
                            className={`w-full rounded-xl border px-3 py-2.5 text-sm font-mono uppercase outline-none transition-all ${
                                isEdit
                                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                                    : errors.permission_key
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                        />
                        {errors.permission_key && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <FiAlertCircle size={12} /> {errors.permission_key}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={2}
                            placeholder="What does this permission allow?"
                            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-sky-600 disabled:opacity-60"
                        >
                            <FiSave size={16} />
                            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Permission'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default PermissionFormModal;