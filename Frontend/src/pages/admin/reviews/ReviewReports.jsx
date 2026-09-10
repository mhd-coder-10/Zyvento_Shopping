
import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiCheckCircle, FiXCircle, FiEye, FiRefreshCw } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import { toast } from 'react-toastify';

const ReviewReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiService.getAllReviewReports({ search, status: statusFilter });
            if (res.data.success) setReports(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleReportAction = async (reportId, action) => {
        try {
            await ApiService.updateReviewReport(reportId, { status: 'action_taken', action });
            toast.success('Report action taken');
            fetchReports();
        } catch (error) {
            toast.error('Failed to take action');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: 'bg-amber-50 text-amber-700',
            reviewed: 'bg-blue-50 text-blue-700',
            dismissed: 'bg-gray-100 text-gray-600',
            action_taken: 'bg-emerald-50 text-emerald-700'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Reported Reviews" subtitle="Manage customer reports" />
            
            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
                        <input type="text" placeholder="Search reports..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl !text-black" onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border rounded-xl !text-black bg-white">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="dismissed">Dismissed</option>
                        <option value="action_taken">Action Taken</option>
                    </select>
                </div>

                {/* Desktop Table (hidden on mobile) */}
                <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center w-full h-64">
                            <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="flex items-center justify-center w-full h-64 !text-gray-500">No reports found</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Report</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Review</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Reason</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reports.map(report => (
                                    <tr key={report._id} className="hover:bg-blue-50/30">
                                        <td className="px-4 py-3 font-bold !text-blue-600">{report.report_code}</td>
                                        <td className="px-4 py-3 !text-black">{report.review_id?.title || 'N/A'}</td>
                                        <td className="px-4 py-3 !text-gray-600">{report.reason}</td>
                                        <td className="px-4 py-3">{getStatusBadge(report.status)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleReportAction(report._id, 'hide')} className="p-2 bg-gray-100 !text-gray-600 rounded-lg" title="Hide"><FiEye /></button>
                                                <button onClick={() => handleReportAction(report._id, 'publish')} className="p-2 bg-emerald-50 !text-emerald-600 rounded-lg" title="Publish"><FiCheckCircle /></button>
                                                <button onClick={() => handleReportAction(report._id, 'dismiss')} className="p-2 bg-rose-50 !text-rose-600 rounded-lg" title="Dismiss"><FiXCircle /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile Cards (visible on mobile only) */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center w-full h-64 bg-white rounded-2xl border border-blue-100 shadow-sm">
                            <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="flex items-center justify-center w-full h-64 bg-white rounded-2xl border border-blue-100 shadow-sm !text-gray-500">
                            No reports found
                        </div>
                    ) : (
                        reports.map(report => (
                            <div key={report._id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold !text-blue-600">{report.report_code}</p>
                                        <p className="text-xs !text-gray-600 mt-1">{report.review_id?.title || 'N/A'}</p>
                                    </div>
                                    {getStatusBadge(report.status)}
                                </div>
                                <p className="text-sm !text-gray-700"><strong>Reason:</strong> {report.reason}</p>
                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                                    <button onClick={() => handleReportAction(report._id, 'hide')} className="p-2 bg-gray-100 !text-gray-600 rounded-lg"><FiEye /></button>
                                    <button onClick={() => handleReportAction(report._id, 'publish')} className="p-2 bg-emerald-50 !text-emerald-600 rounded-lg"><FiCheckCircle /></button>
                                    <button onClick={() => handleReportAction(report._id, 'dismiss')} className="p-2 bg-rose-50 !text-rose-600 rounded-lg"><FiXCircle /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewReports;