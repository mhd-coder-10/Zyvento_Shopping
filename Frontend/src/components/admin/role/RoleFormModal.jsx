import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiSave, FiShield, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';

const ROLE_TYPE_OPTIONS = [
    { value: 'sub_admin', label: 'Sub-Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'seller', label: 'Seller' },
    { value: 'employee', label: 'Employee' },
    { value: 'customer', label: 'Customer' }
];

const DATA_SCOPE_OPTIONS = [
    { value: 'all', label: 'All — Access all data' },
    { value: 'own', label: 'Own — Access only their own data' }
];

const RoleFormModal = ({ isOpen, onClose, onSuccess, editingRole }) => {
    const isEdit = Boolean(editingRole);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        role_name: '',
        role_key: '',
        role_type: 'sub_admin',
        description: '',
        data_scope: 'own',
        priority: 0
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (editingRole) {
                setFormData({
                    role_name: editingRole.role_name || '',
                    role_key: editingRole.role_key || '',
                    role_type: editingRole.role_type || 'sub_admin',
                    description: editingRole.description || '',
                    data_scope: editingRole.data_scope || 'own',
                    priority: editingRole.priority || 0
                });
            } else {
                setFormData({
                    role_name: '',
                    role_key: '',
                    role_type: 'sub_admin',
                    description: '',
                    data_scope: 'own',
                    priority: 0
                });
            }
            setErrors({});
        }
    }, [isOpen, editingRole]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

        // Auto-generate role_key from role_name
        if (name === 'role_name' && !isEdit) {
            const key = value
                .toUpperCase()
                .trim()
                .replace(/[^A-Z0-9\s_]/g, '')
                .replace(/\s+/g, '_');
            setFormData((prev) => ({ ...prev, role_key: key }));
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.role_name.trim()) errs.role_name = 'Role name is required';
        if (!formData.role_key.trim()) errs.role_key = 'Role key is required';
        if (!formData.role_type) errs.role_type = 'Role type is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const payload = {
                role_name: formData.role_name.trim(),
                role_key: formData.role_key.trim().toUpperCase(),
                role_type: formData.role_type,
                description: formData.description.trim() || null,
                data_scope: formData.data_scope,
                priority: Number(formData.priority) || 0
            };

            if (isEdit) {
                delete payload.role_key; // role_key can't be changed on edit
                await ApiService.updateRole(editingRole._id, payload);
                toast.success('Role updated successfully');
            } else {
                await ApiService.createRole(payload);
                toast.success('Role created successfully');
            }
            onSuccess();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save role');
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
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                            <FiShield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {isEdit ? 'Edit Role' : 'Create Role'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {isEdit ? 'Update role details' : 'Add a new role to the system'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Role Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="role_name"
                            value={formData.role_name}
                            onChange={handleChange}
                            placeholder="e.g., Order Manager"
                            className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all ${
                                errors.role_name
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                        />
                        {errors.role_name && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <FiAlertCircle size={12} /> {errors.role_name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Role Key <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="role_key"
                            value={formData.role_key}
                            onChange={handleChange}
                            disabled={isEdit}
                            placeholder="ORDER_MANAGER"
                            className={`w-full rounded-xl border px-3 py-2.5 text-sm font-mono uppercase outline-none transition-all ${
                                isEdit
                                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                                    : errors.role_key
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                        />
                        {errors.role_key && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <FiAlertCircle size={12} /> {errors.role_key}
                            </p>
                        )}
                        {isEdit && (
                            <p className="text-[11px] text-slate-400 mt-1">Role key cannot be changed after creation</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Role Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="role_type"
                                value={formData.role_type}
                                onChange={handleChange}
                                disabled={isEdit}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all ${
                                    isEdit
                                        ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                }`}
                            >
                                {ROLE_TYPE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Priority
                            </label>
                            <input
                                type="number"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Data Scope
                        </label>
                        <select
                            name="data_scope"
                            value={formData.data_scope}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {DATA_SCOPE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="What is this role responsible for?"
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
                            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Role'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default RoleFormModal;