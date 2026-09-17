import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiCheck, FiShield, FiChevronDown, FiLock, FiEdit2 } from 'react-icons/fi';

const ROLE_TYPE_LABELS = {
    system: 'System', admin: 'Admin', sub_admin: 'Sub-Admin',
    seller: 'Seller', employee: 'Employee', customer: 'Customer'
};

const ROLE_TYPE_STYLES = {
    system: 'bg-purple-50 text-purple-700 border-purple-200',
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    sub_admin: 'bg-blue-50 text-blue-700 border-blue-200',
    seller: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    employee: 'bg-teal-50 text-teal-700 border-teal-200',
    customer: 'bg-slate-50 text-slate-600 border-slate-200'
};

const RoleMultiSelect = ({ availableRoles = [], selectedRoleIds = [], onChange, error }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = search.trim()
        ? availableRoles.filter((r) =>
            r.role_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.role_key?.toLowerCase().includes(search.toLowerCase())
        )
        : availableRoles;

    const toggleRole = (roleId) => {
        const strId = String(roleId);
        const next = selectedRoleIds.includes(strId)
            ? selectedRoleIds.filter((id) => id !== strId)
            : [...selectedRoleIds, strId];
        onChange(next);
    };

    const removeRole = (roleId) => {
        onChange(selectedRoleIds.filter((id) => id !== roleId));
    };

    const selectedRoles = availableRoles.filter((r) =>
        selectedRoleIds.includes(String(r._id))
    );

    return (
        <div className="space-y-2" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-700">
                Assigned Roles
                {selectedRoleIds.length > 0 && (
                    <span className="ml-2 text-[11px] font-semibold text-sky-600">
                        ({selectedRoleIds.length} selected)
                    </span>
                )}
            </label>

            {/* Dropdown trigger */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((s) => !s)}
                    className={`w-full text-left px-3 py-2.5 bg-white border rounded-xl text-sm transition-all ${
                        error
                            ? 'border-red-300'
                            : open
                            ? 'border-blue-500 ring-2 ring-blue-100'
                            : 'border-slate-200 hover:border-blue-300'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <FiShield size={16} className="text-sky-500 shrink-0" />
                        <span className="flex-1 text-slate-700 truncate">
                            {selectedRoleIds.length === 0
                                ? 'Select roles...'
                                : `${selectedRoleIds.length} role${selectedRoleIds.length > 1 ? 's' : ''} selected`}
                        </span>
                        <FiChevronDown
                            size={16}
                            className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                    </div>
                </button>

                {/* Dropdown menu */}
                {open && (
                    <div className="absolute z-30 mt-1 w-full max-h-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        {/* Search */}
                        <div className="p-2 border-b border-slate-100">
                            <div className="relative">
                                <FiSearch
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={14}
                                />
                                <input
                                    type="text"
                                    placeholder="Search roles..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Roles list */}
                        <div className="max-h-56 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <div className="p-4 text-sm text-slate-500 text-center">
                                    No roles found
                                </div>
                            ) : (
                                filtered.map((role) => {
                                    const isSelected = selectedRoleIds.includes(String(role._id));
                                    return (
                                        <button
                                            key={role._id}
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => toggleRole(role._id)}
                                            className={`w-full text-left px-3 py-2.5 hover:bg-sky-50 transition-colors border-b border-slate-100 last:border-0 flex items-center gap-3 ${
                                                isSelected ? 'bg-sky-50/60' : ''
                                            }`}
                                        >
                                            {/* Checkbox */}
                                            <div
                                                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                                    isSelected
                                                        ? 'bg-sky-500 border-sky-500'
                                                        : 'border-slate-300'
                                                }`}
                                            >
                                                {isSelected && (
                                                    <FiCheck size={11} className="text-white" strokeWidth={3} />
                                                )}
                                            </div>

                                            {/* Role info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm text-slate-800 truncate">
                                                        {role.role_name}
                                                    </p>
                                                    {role.is_system_role && (
                                                        <FiLock size={10} className="text-purple-500 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-mono truncate">
                                                    {role.role_key}
                                                </p>
                                            </div>

                                            {/* Type badge */}
                                            <span
                                                className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold shrink-0 ${
                                                    ROLE_TYPE_STYLES[role.role_type] || ROLE_TYPE_STYLES.customer
                                                }`}
                                            >
                                                {ROLE_TYPE_LABELS[role.role_type] || role.role_type}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Selected chips */}
            {selectedRoles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedRoles.map((role) => (
                        <span
                            key={role._id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-semibold"
                        >
                            <FiShield size={10} />
                            {role.role_name}
                            <button
                                type="button"
                                onClick={() => removeRole(String(role._id))}
                                className="ml-0.5 hover:text-rose-600 transition-colors"
                            >
                                <FiX size={11} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
};

export default RoleMultiSelect;