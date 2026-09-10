

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiShield,
    FiUsers,
    FiCheckCircle,
    FiXCircle,
    FiLock,
    FiUnlock,
} from 'react-icons/fi';

import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import AdminTable from '../../../components/admin/AdminTable';
import AdminSearchBar from '../../../components/admin/AdminSearchBar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const Roles = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, roleId: null });
    const [statusConfirm, setStatusConfirm] = useState({ open: false, roleId: null, action: 'activate' });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    useEffect(() => {
        fetchRoles();
    }, [pagination.page, searchQuery]);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
            };
            const response = await ApiService.getAllRoles(params);
            if (response.data.success) {
                setRoles(response.data.data || []);
                setPagination((prev) => ({
                    ...prev,
                    total: response.data.total || 0,
                    totalPages: response.data.totalPages || 1,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            toast.error(error.response?.data?.message || 'Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const handleDelete = (roleId) => {
        setDeleteConfirm({ open: true, roleId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.roleId) return;
        try {
            await ApiService.deleteRole(deleteConfirm.roleId);
            toast.success('Role deleted successfully');
            fetchRoles();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete role');
        } finally {
            setDeleteConfirm({ open: false, roleId: null });
        }
    };

    const handleStatusToggle = (roleId, action) => {
        setStatusConfirm({ open: true, roleId, action });
    };

    const confirmStatusToggle = async () => {
        if (!statusConfirm.roleId) return;
        try {
            await ApiService.toggleRoleStatus(statusConfirm.roleId);
            toast.success(`Role ${statusConfirm.action === 'activate' ? 'activated' : 'deactivated'} successfully`);
            fetchRoles();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role status');
        } finally {
            setStatusConfirm({ open: false, roleId: null, action: 'activate' });
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800', icon: FiCheckCircle },
            inactive: { color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700', icon: FiXCircle },
            archived: { color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800', icon: FiXCircle },
        };
        const { color, icon: Icon } = config[status] || config.inactive;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${color}`}>
                <Icon className="w-3 h-3" />
                {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Inactive'}
            </span>
        );
    };

    const getRoleTypeBadge = (type) => {
        const config = {
            system: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800',
            custom: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800',
            default: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${config[type] || config.default} capitalize`}>
                {type || 'Custom'}
            </span>
        );
    };

    const columns = [
        {
            key: 'name',
            label: 'Role Name',
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white shadow-md">
                        <FiShield className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{value}</p>
                        <p className="text-xs text-gray-500">{row.description || 'No description'}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            render: (value) => getRoleTypeBadge(value),
        },
        {
            key: 'userCount',
            label: 'Users',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{value || 0}</span>
                </div>
            ),
        },
        {
            key: 'permissions',
            label: 'Permissions',
            render: (value) => (
                <span className="text-sm text-gray-600">
                    {value?.length || 0} permissions
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
            label: 'Manage Permissions',
            icon: <FiLock className="w-4 h-4" />,
            onClick: (row) => navigate(`/admin/roles/${row._id}/permissions`),
            className: 'hover:bg-purple-50 text-purple-600 transition-colors p-1.5 rounded-lg',
        },
        {
            label: 'Edit',
            icon: <FiEdit2 className="w-4 h-4" />,
            onClick: (row) => navigate(`/admin/roles/edit/${row._id}`),
            className: 'hover:bg-blue-50 text-blue-600 transition-colors p-1.5 rounded-lg',
            hidden: (row) => row.type === 'system',
        },
        {
            label: 'Activate',
            icon: <FiUnlock className="w-4 h-4" />,
            onClick: (row) => handleStatusToggle(row._id, 'activate'),
            className: 'hover:bg-green-50 text-green-600 transition-colors p-1.5 rounded-lg',
            hidden: (row) => row.status === 'active' || row.type === 'system',
        },
        {
            label: 'Deactivate',
            icon: <FiLock className="w-4 h-4" />,
            onClick: (row) => handleStatusToggle(row._id, 'deactivate'),
            className: 'hover:bg-orange-50 text-orange-600 transition-colors p-1.5 rounded-lg',
            hidden: (row) => row.status === 'inactive' || row.type === 'system',
        },
        {
            label: 'Delete',
            icon: <FiTrash2 className="w-4 h-4" />,
            onClick: (row) => handleDelete(row._id),
            className: 'hover:bg-red-50 text-red-600 transition-colors p-1.5 rounded-lg',
            hidden: (row) => row.type === 'system' || row.userCount > 0,
        },
    ];

    const topbarActions = (
        <button
            onClick={() => navigate('/admin/roles/create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 text-sm"
        >
            <FiPlus className="w-4 h-4" />
            Create Role
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-sky-100 p-4 md:p-6">
            <AdminTopbar
                title="Role Management"
                subtitle="Manage user roles and permissions across the platform"
                actions={topbarActions}
            />

            <div className="mb-6">
                <AdminSearchBar
                    onSearch={handleSearch}
                    placeholder="Search roles by name..."
                    recentSearches={['Admin', 'Manager', 'Editor']}
                />
            </div>

            <AdminTable
                columns={columns}
                data={roles}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                actions={actions}
                emptyMessage="No roles found. Create your first role!"
            />

            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, roleId: null })}
                onConfirm={confirmDelete}
                title="Delete Role"
                message="Are you sure you want to delete this role? This action cannot be undone."
                confirmText="Delete"
                confirmColor="bg-red-600 hover:bg-red-700"
            />

            <ConfirmDialog
                isOpen={statusConfirm.open}
                onClose={() => setStatusConfirm({ open: false, roleId: null, action: 'activate' })}
                onConfirm={confirmStatusToggle}
                title={statusConfirm.action === 'activate' ? 'Activate Role' : 'Deactivate Role'}
                message={`Are you sure you want to ${statusConfirm.action === 'activate' ? 'activate' : 'deactivate'} this role?`}
                confirmText={statusConfirm.action === 'activate' ? 'Activate' : 'Deactivate'}
                confirmColor={statusConfirm.action === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
            />
        </div>
    );
};

export default Roles;