
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiLock,
    FiUnlock,
    FiCheckCircle,
    FiXCircle,
    FiGrid,
    FiList,
    FiSearch,
} from 'react-icons/fi';

import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import AdminTable from '../../../components/admin/AdminTable';
import AdminSearchBar from '../../../components/admin/AdminSearchBar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';

const Permissions = () => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, permissionId: null });
    const [statusConfirm, setStatusConfirm] = useState({ open: false, permissionId: null, action: 'activate' });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        module: '',
        action: '',
        status: 'active',
    });
    const [formErrors, setFormErrors] = useState({});
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    useEffect(() => {
        fetchPermissions();
        fetchModules();
    }, [pagination.page, searchQuery, selectedModule]);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
                module: selectedModule,
            };
            const response = await ApiService.getAllPermissions(params);
            if (response.data.success) {
                setPermissions(response.data.data || []);
                setPagination((prev) => ({
                    ...prev,
                    total: response.data.total || 0,
                    totalPages: response.data.totalPages || 1,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            toast.error(error.response?.data?.message || 'Failed to load permissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchModules = async () => {
        try {
            const response = await ApiService.getPermissionModules();
            if (response.data.success) {
                setModules(response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch modules:', error);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleModuleFilter = (module) => {
        setSelectedModule(module);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const handleOpenModal = (permission = null) => {
        if (permission) {
            setEditingPermission(permission);
            setFormData({
                name: permission.name || '',
                description: permission.description || '',
                module: permission.module || '',
                action: permission.action || '',
                status: permission.status || 'active',
            });
        } else {
            setEditingPermission(null);
            setFormData({
                name: '',
                description: '',
                module: '',
                action: '',
                status: 'active',
            });
        }
        setFormErrors({});
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingPermission(null);
        setFormData({
            name: '',
            description: '',
            module: '',
            action: '',
            status: 'active',
        });
        setFormErrors({});
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Permission name is required';
        if (!formData.module.trim()) errors.module = 'Module is required';
        if (!formData.action.trim()) errors.action = 'Action is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (editingPermission) {
                await ApiService.updatePermission(editingPermission._id, formData);
                toast.success('Permission updated successfully');
            } else {
                await ApiService.createPermission(formData);
                toast.success('Permission created successfully');
            }
            handleCloseModal();
            fetchPermissions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save permission');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (permissionId) => {
        setDeleteConfirm({ open: true, permissionId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.permissionId) return;
        try {
            await ApiService.deletePermission(deleteConfirm.permissionId);
            toast.success('Permission deleted successfully');
            fetchPermissions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete permission');
        } finally {
            setDeleteConfirm({ open: false, permissionId: null });
        }
    };

    const handleStatusToggle = (permissionId, action) => {
        setStatusConfirm({ open: true, permissionId, action });
    };

    const confirmStatusToggle = async () => {
        if (!statusConfirm.permissionId) return;
        try {
            await ApiService.togglePermissionStatus(statusConfirm.permissionId);
            toast.success(`Permission ${statusConfirm.action === 'activate' ? 'activated' : 'deactivated'} successfully`);
            fetchPermissions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update permission status');
        } finally {
            setStatusConfirm({ open: false, permissionId: null, action: 'activate' });
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800', icon: FiCheckCircle },
            inactive: { color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700', icon: FiXCircle },
        };
        const { color, icon: Icon } = config[status] || config.inactive;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${color}`}>
                <Icon className="w-3 h-3" />
                {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Inactive'}
            </span>
        );
    };

    const getModuleBadge = (module) => {
        const colors = {
            users: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800',
            roles: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800',
            permissions: 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800',
            sellers: 'bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800',
            products: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800',
            orders: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800',
            payments: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800',
            settings: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${colors[module] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'} capitalize`}>
                {module || 'General'}
            </span>
        );
    };

    const columns = [
        {
            key: 'name',
            label: 'Permission',
            render: (value, row) => (
                <div>
                    <p className="font-semibold text-gray-800">{value}</p>
                    <p className="text-xs text-gray-500">{row.description || 'No description'}</p>
                </div>
            ),
        },
        {
            key: 'module',
            label: 'Module',
            render: (value) => getModuleBadge(value),
        },
        {
            key: 'action',
            label: 'Action',
            render: (value) => (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm capitalize">
                    {value || 'view'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => getStatusBadge(value),
        },
        {
            key: 'createdAt',
            label: 'Created',
            render: (value) => (
                <span className="text-sm text-gray-600">
                    {new Date(value).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                </span>
            ),
        },
    ];

    const actions = [
        {
            label: 'Edit',
            icon: <FiEdit2 className="w-4 h-4" />,
            onClick: (row) => handleOpenModal(row),
            className: 'hover:bg-blue-50 text-blue-600 transition-colors p-1.5 rounded-lg',
        },
        {
            label: 'Activate',
            icon: <FiUnlock className="w-4 h-4" />,
            onClick: (row) => handleStatusToggle(row._id, 'activate'),
            className: 'hover:bg-green-50 text-green-600 transition-colors p-1.5 rounded-lg',
            hidden: (row) => row.status === 'active',
        },
        {
            label: 'Deactivate',
            icon: <FiLock className="w-4 h-4" />,
            onClick: (row) => handleStatusToggle(row._id, 'deactivate'),
            className: 'hover:bg-orange-50 text-orange-600 transition-colors p-1.5 rounded-lg',
            hidden: (row) => row.status === 'inactive',
        },
        {
            label: 'Delete',
            icon: <FiTrash2 className="w-4 h-4" />,
            onClick: (row) => handleDelete(row._id),
            className: 'hover:bg-red-50 text-red-600 transition-colors p-1.5 rounded-lg',
        },
    ];

    const topbarActions = (
        <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 text-sm"
        >
            <FiPlus className="w-4 h-4" />
            Add Permission
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-sky-100 p-4 md:p-6">
            <AdminTopbar
                title="Permission Management"
                subtitle="Manage system permissions and access control"
                actions={topbarActions}
            />

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="w-full sm:w-auto">
                    <AdminSearchBar
                        onSearch={handleSearch}
                        placeholder="Search permissions..."
                        recentSearches={['view_users', 'manage_orders', 'edit_products']}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                    <button
                        onClick={() => handleModuleFilter('')}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                            !selectedModule
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200'
                        }`}
                    >
                        All
                    </button>
                    {modules.map((module) => (
                        <button
                            key={module}
                            onClick={() => handleModuleFilter(module)}
                            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap capitalize ${
                                selectedModule === module
                                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200'
                            }`}
                        >
                            {module}
                        </button>
                    ))}
                </div>
            </div>

            {/* Permissions Table */}
            <AdminTable
                columns={columns}
                data={permissions}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                actions={actions}
                emptyMessage="No permissions found. Create your first permission!"
            />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                title={editingPermission ? 'Edit Permission' : 'Create Permission'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Permission Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. manage_users"
                            className={`w-full px-3 py-2.5 rounded-xl border ${formErrors.name ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm`}
                        />
                        {formErrors.name && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                            Use snake_case format: e.g. view_users, manage_orders
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            placeholder="Describe what this permission allows..."
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none bg-white shadow-sm text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Module <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.module}
                                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                                placeholder="e.g. users"
                                className={`w-full px-3 py-2.5 rounded-xl border ${formErrors.module ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm`}
                            />
                            {formErrors.module && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.module}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Action <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.action}
                                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                className={`w-full px-3 py-2.5 rounded-xl border ${formErrors.action ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm`}
                            >
                                <option value="">Select Action</option>
                                <option value="view">View</option>
                                <option value="create">Create</option>
                                <option value="edit">Edit</option>
                                <option value="delete">Delete</option>
                                <option value="manage">Manage</option>
                                <option value="approve">Approve</option>
                            </select>
                            {formErrors.action && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.action}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                        >
                            {editingPermission ? 'Update Permission' : 'Create Permission'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, permissionId: null })}
                onConfirm={confirmDelete}
                title="Delete Permission"
                message="Are you sure you want to delete this permission? This action cannot be undone."
                confirmText="Delete"
                confirmColor="bg-red-600 hover:bg-red-700"
            />

            <ConfirmDialog
                isOpen={statusConfirm.open}
                onClose={() => setStatusConfirm({ open: false, permissionId: null, action: 'activate' })}
                onConfirm={confirmStatusToggle}
                title={statusConfirm.action === 'activate' ? 'Activate Permission' : 'Deactivate Permission'}
                message={`Are you sure you want to ${statusConfirm.action === 'activate' ? 'activate' : 'deactivate'} this permission?`}
                confirmText={statusConfirm.action === 'activate' ? 'Activate' : 'Deactivate'}
                confirmColor={statusConfirm.action === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
            />
        </div>
    );
};

export default Permissions;