
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft,
    FiCheck,
    FiX,
    FiSearch,
    FiSave,
    FiShield,
    FiLock,
    FiUnlock,
    FiGrid,
    FiList,
} from 'react-icons/fi';

import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';

const AssignPermissions = () => {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [role, setRole] = useState(null);
    const [allPermissions, setAllPermissions] = useState([]);
    const [assignedPermissions, setAssignedPermissions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [modules, setModules] = useState([]);
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
        fetchRoleAndPermissions();
    }, [roleId]);

    const fetchRoleAndPermissions = async () => {
        setLoading(true);
        try {
            const roleRes = await ApiService.getAllRoles();
            if (roleRes.data.success) {
                const roleData = roleRes.data.data.find(r => r._id === roleId);
                if (roleData) {
                    setRole(roleData);
                } else {
                    toast.error('Role not found');
                    navigate('/admin/roles');
                }
            }

            const permRes = await ApiService.getAllPermissions({ limit: 100 });
            if (permRes.data.success) {
                setAllPermissions(permRes.data.data || []);
            }

            const assignedRes = await ApiService.getRolePermissions(roleId);
            if (assignedRes.data.success) {
                setAssignedPermissions(assignedRes.data.data || []);
            }

            const moduleRes = await ApiService.getPermissionModules();
            if (moduleRes.data.success) {
                setModules(moduleRes.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error(error.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const isPermissionAssigned = (permissionId) => {
        return assignedPermissions.some(p => p._id === permissionId);
    };

    const handleTogglePermission = (permission) => {
        const isAssigned = isPermissionAssigned(permission._id);
        if (isAssigned) {
            setAssignedPermissions(assignedPermissions.filter(p => p._id !== permission._id));
        } else {
            setAssignedPermissions([...assignedPermissions, permission]);
        }
    };

    const handleToggleAll = () => {
        const filteredPermissions = getFilteredPermissions();
        const allAssigned = filteredPermissions.every(p => isPermissionAssigned(p._id));

        if (allAssigned) {
            const filteredIds = filteredPermissions.map(p => p._id);
            setAssignedPermissions(assignedPermissions.filter(p => !filteredIds.includes(p._id)));
        } else {
            const existingIds = assignedPermissions.map(p => p._id);
            const newPermissions = filteredPermissions.filter(p => !existingIds.includes(p._id));
            setAssignedPermissions([...assignedPermissions, ...newPermissions]);
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            const permissionIds = assignedPermissions.map(p => p._id);
            await ApiService.assignPermissionsToRole(roleId, { permission_ids: permissionIds });
            toast.success('Permissions assigned successfully');
            navigate('/admin/roles');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign permissions');
        } finally {
            setSubmitting(false);
        }
    };

    const getFilteredPermissions = () => {
        let filtered = allPermissions;
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.module?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedModule) {
            filtered = filtered.filter(p => p.module === selectedModule);
        }
        return filtered;
    };

    const filteredPermissions = getFilteredPermissions();

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

    const getActionBadge = (action) => {
        const colors = {
            view: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800',
            create: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800',
            edit: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800',
            delete: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800',
            manage: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800',
            approve: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${colors[action] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'} capitalize`}>
                {action || 'view'}
            </span>
        );
    };

    if (loading) {
        return <LoadingSpinner fullPage text="Loading permissions..." />;
    }

    if (!role) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Role not found</p>
                <button
                    onClick={() => navigate('/admin/roles')}
                    className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    Go back to roles
                </button>
            </div>
        );
    }

    const allFilteredAssigned = filteredPermissions.length > 0 &&
        filteredPermissions.every(p => isPermissionAssigned(p._id));

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-sky-100 p-4 md:p-6">
            <AdminTopbar
                title="Assign Permissions"
                subtitle={`Manage permissions for "${role.name}" role`}
                actions={
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => navigate('/admin/roles')}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm bg-white"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Back to Roles
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={submitting}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 text-sm"
                        >
                            <FiSave className="w-4 h-4" />
                            {submitting ? 'Saving...' : 'Save Permissions'}
                        </button>
                    </div>
                }
            />

            {/* Stats Cards - Dashboard style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{allPermissions.length}</p>
                    <p className="text-xs text-gray-500">Total Permissions</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4 text-center border-l-4 border-green-500">
                    <p className="text-2xl font-bold text-green-600">{assignedPermissions.length}</p>
                    <p className="text-xs text-gray-500">Assigned</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4 text-center border-l-4 border-orange-500">
                    <p className="text-2xl font-bold text-orange-600">{allPermissions.length - assignedPermissions.length}</p>
                    <p className="text-xs text-gray-500">Not Assigned</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="relative w-full sm:w-64">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search permissions..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm bg-white shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                    <button
                        onClick={() => setSelectedModule('')}
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
                            onClick={() => setSelectedModule(module)}
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-colors ${
                            viewMode === 'list'
                                ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-600 shadow-sm'
                                : 'bg-white text-gray-400 hover:bg-gray-50 shadow-sm border border-gray-200'
                        }`}
                    >
                        <FiList className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-600 shadow-sm'
                                : 'bg-white text-gray-400 hover:bg-gray-50 shadow-sm border border-gray-200'
                        }`}
                    >
                        <FiGrid className="w-4 h-4" />
                    </button>
                    {filteredPermissions.length > 0 && (
                        <button
                            onClick={handleToggleAll}
                            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                                allFilteredAssigned
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-600 hover:shadow-sm'
                                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-600 hover:shadow-sm'
                            }`}
                        >
                            {allFilteredAssigned ? 'Deselect All' : 'Select All'}
                        </button>
                    )}
                </div>
            </div>

            {/* Permissions List/Grid */}
            {viewMode === 'list' ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Permission
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Module
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Assign
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPermissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                            No permissions found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPermissions.map((permission) => {
                                        const isAssigned = isPermissionAssigned(permission._id);
                                        return (
                                            <tr key={permission._id} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{permission.name}</p>
                                                        <p className="text-xs text-gray-500">{permission.description}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getModuleBadge(permission.module)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getActionBadge(permission.action)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleTogglePermission(permission)}
                                                        className={`p-1.5 rounded-xl transition-all hover:scale-110 ${
                                                            isAssigned
                                                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-600 shadow-sm'
                                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {isAssigned ? (
                                                            <FiCheck className="w-5 h-5" />
                                                        ) : (
                                                            <FiX className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredPermissions.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No permissions found
                        </div>
                    ) : (
                        filteredPermissions.map((permission) => {
                            const isAssigned = isPermissionAssigned(permission._id);
                            return (
                                <div
                                    key={permission._id}
                                    onClick={() => handleTogglePermission(permission)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                        isAssigned
                                            ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md hover:shadow-lg'
                                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 text-sm truncate">
                                                {permission.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {permission.description || 'No description'}
                                            </p>
                                        </div>
                                        <div className={`ml-2 p-1 rounded-xl flex-shrink-0 ${
                                            isAssigned
                                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-600'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {isAssigned ? (
                                                <FiCheck className="w-4 h-4" />
                                            ) : (
                                                <FiLock className="w-4 h-4" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        {getModuleBadge(permission.module)}
                                        {getActionBadge(permission.action)}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Footer - Save Button */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-2xl border border-gray-200 shadow-md p-4">
                <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">{assignedPermissions.length}</span> of{' '}
                    <span className="font-semibold text-gray-800">{allPermissions.length}</span> permissions assigned
                </p>
                <button
                    onClick={handleSave}
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 w-full sm:w-auto"
                >
                    <FiSave className="w-4 h-4" />
                    {submitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default AssignPermissions;