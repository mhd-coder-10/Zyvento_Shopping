import React, { useState } from 'react';
import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiSearch,
    FiX,
} from 'react-icons/fi';

const AdminTable = ({
    columns,
    data,
    loading,
    pagination,
    onPageChange,
    onSearch,
    onFilter,
    actions,
    selectable = false,
    onSelect,
    selectedRows = [],
    emptyMessage = 'No data found',
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        if (onSearch) {
            onSearch('');
        }
    };

    const handleSelectAll = (e) => {
        if (onSelect) {
            if (e.target.checked) {
                onSelect(data.map((item) => item._id || item.id));
            } else {
                onSelect([]);
            }
        }
    };

    const handleSelectRow = (id) => {
        if (onSelect) {
            const newSelected = selectedRows.includes(id)
                ? selectedRows.filter((rowId) => rowId !== id)
                : [...selectedRows, id];
            onSelect(newSelected);
        }
    };

    const navBtnClass =
        'p-2 rounded-xl border border-sky-100 bg-white text-slate-500 hover:bg-sky-50 hover:text-sky-600 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all';

    const renderPagination = () => {
        if (!pagination) return null;

        const { page, limit, total, totalPages } = pagination;
        const start = (page - 1) * limit + 1;
        const end = Math.min(page * limit, total);

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3.5 border-t border-sky-100 bg-sky-50/40">
                <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                    Showing <span className="font-bold text-slate-800">{start}</span> to{' '}
                    <span className="font-bold text-slate-800">{end}</span> of{' '}
                    <span className="font-bold text-slate-800">{total}</span> results
                </p>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <button onClick={() => onPageChange(1)} disabled={page === 1} className={navBtnClass}>
                        <FiChevronsLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className={navBtnClass}>
                        <FiChevronLeft className="w-4 h-4" />
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = index + 1;
                        } else if (page <= 3) {
                            pageNum = index + 1;
                        } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + index;
                        } else {
                            pageNum = page - 2 + index;
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => onPageChange(pageNum)}
                                className={`min-w-[2.25rem] px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${page === pageNum
                                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200'
                                        : 'border border-sky-100 bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className={navBtnClass}>
                        <FiChevronRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} className={navBtnClass}>
                        <FiChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-sm">
                <div className="p-4 animate-pulse">
                    <div className="h-10 bg-sky-100 rounded-xl mb-4" />
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="h-12 bg-sky-50 rounded-xl mb-2" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-sky-100 transition-shadow duration-300">
            {(onSearch || onFilter || selectable) && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3.5 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white">
                    {onSearch && (
                        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-sky-100 bg-white text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            )}
                        </form>
                    )}
                    {selectable && selectedRows.length > 0 && (
                        <span className="text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
                            {selectedRows.length} selected
                        </span>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                    <thead>
                        <tr className="bg-sky-50/70 border-b border-sky-100">
                            {selectable && (
                                <th className="px-4 py-3.5 text-left">
                                    <input
                                        type="checkbox"
                                        checked={data.length > 0 && selectedRows.length === data.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-sky-300 text-blue-600 focus:ring-sky-400"
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                    className={`px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.08em] whitespace-nowrap ${col.sortable !== false ? 'cursor-pointer hover:text-sky-600 transition-colors select-none' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortable !== false && sortField === col.key && (
                                            <span className="text-xs text-sky-600">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th className="px-4 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-[0.08em]">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-50">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                                    className="px-4 py-14 text-center text-slate-500"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-50 text-3xl">📭</span>
                                        <p className="font-semibold text-slate-600">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={item._id || item.id || index}
                                    className="hover:bg-sky-50/60 transition-colors duration-150"
                                >
                                    {selectable && (
                                        <td className="px-4 py-3.5">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(item._id || item.id)}
                                                onChange={() => handleSelectRow(item._id || item.id)}
                                                className="w-4 h-4 rounded border-sky-300 text-blue-600 focus:ring-sky-400"
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3.5 text-sm text-slate-600 align-middle">
                                            {col.render
                                                ? col.render(item[col.key], item)
                                                : item[col.key]?.toString() || '-'}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {actions.map((action, actionIndex) => (
                                                    <button
                                                        key={actionIndex}
                                                        onClick={() => action.onClick(item)}
                                                        className={`p-2 rounded-xl transition-all hover:scale-110 ${action.className || 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
                                                            }`}
                                                        title={action.label}
                                                    >
                                                        {action.icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {renderPagination()}
        </div>
    );
};

export default AdminTable;
