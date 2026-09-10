import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiDownload, FiCalendar, FiLoader } from 'react-icons/fi';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ApiService from '../../../api/ApiService';
import SalesReport from './SalesReport';
import RevenueReport from './RevenueReport';
import OrderReport from './OrderReport';
import ProductReport from './ProductReport';

const validTabs = ['revenue', 'sales', 'orders', 'products', 'users'];
const DEFAULT_TAB = 'revenue';
const STORAGE_KEY = 'admin_reports_active_tab';

const Reports = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Priority: URL query param > last saved tab (sessionStorage) > default ('revenue')
    const getInitialTab = () => {
        const urlType = searchParams.get('type');
        if (validTabs.includes(urlType)) return urlType;

        const savedTab = sessionStorage.getItem(STORAGE_KEY);
        if (validTabs.includes(savedTab)) return savedTab;

        return DEFAULT_TAB;
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);
    const [isExporting, setIsExporting] = useState(false);

    // Keep URL in sync + persist tab choice whenever it changes
    useEffect(() => {
        setSearchParams({ type: activeTab });
        sessionStorage.setItem(STORAGE_KEY, activeTab);
    }, [activeTab, setSearchParams]);

    const startDateRef = useRef(null);
    const endDateRef = useRef(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    const openCalendar = (ref) => {
        if (ref.current) {
            if (ref.current.showPicker) {
                ref.current.showPicker();
            } else {
                ref.current.click();
            }
        }
    };

    const reportTypes = [
        { id: 'revenue', label: 'Revenue Report', component: RevenueReport },
        { id: 'sales', label: 'Sales Report', component: SalesReport },
        { id: 'orders', label: 'Order Report', component: OrderReport },
        { id: 'products', label: 'Product Report', component: ProductReport },
    ];

    const ActiveComponent = reportTypes.find(r => r.id === activeTab)?.component || RevenueReport;
    const activeLabel = reportTypes.find(r => r.id === activeTab)?.label || 'Revenue Report';

    // ==================== EXPORT PDF ====================
    const handleExportPDF = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const response = await ApiService.exportReportPDF(activeTab, dateRange);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${activeTab}-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export PDF', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white overflow-x-hidden">
            <AdminTopbar
                title="Reports & Analytics"
                subtitle="Advanced business performance insights"
                actions={
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        {/* Date Range Container */}
                        <div className="flex items-center gap-1 sm:gap-2 bg-white border border-blue-100 rounded-xl px-2 sm:px-4 py-2 shadow-sm w-full sm:w-auto">
                            <div className="relative flex-1 min-w-0">
                                <input
                                    ref={startDateRef}
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                    className="w-full pl-2 sm:pl-3 pr-8 sm:pr-10 py-1.5 text-xs sm:text-sm !text-slate-800 border-none outline-none bg-transparent cursor-pointer rounded appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => openCalendar(startDateRef)}
                                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-blue-50 !text-blue-600"
                                >
                                    <FiCalendar className="w-4 h-4" />
                                </button>
                            </div>

                            <span className="text-slate-400 font-medium text-xs sm:text-sm px-0.5 sm:px-1 shrink-0">to</span>

                            <div className="relative flex-1 min-w-0">
                                <input
                                    ref={endDateRef}
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                    className="w-full pl-2 sm:pl-3 pr-8 sm:pr-10 py-1.5 text-xs sm:text-sm !text-slate-800 border-none outline-none bg-transparent cursor-pointer rounded appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => openCalendar(endDateRef)}
                                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-blue-50 !text-blue-600"
                                >
                                    <FiCalendar className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Export Button */}
                        <button
                            type="button"
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 !text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto shrink-0"
                        >
                            {isExporting ? (
                                <>
                                    <FiLoader className="w-4 h-4 animate-spin" /> Exporting...
                                </>
                            ) : (
                                <>
                                    <FiDownload className="w-4 h-4" /> Export PDF
                                </>
                            )}
                        </button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">

                {/* Premium Tab Container */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-2 flex gap-2 overflow-x-auto sm:flex-wrap">
                    {reportTypes.map(report => (
                        <button
                            key={report.id}
                            type="button"
                            onClick={() => setActiveTab(report.id)}
                            className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${activeTab === report.id
                                ? 'bg-gradient-to-r from-blue-600 to-sky-500 !text-white shadow-md'
                                : 'text-slate-600 hover:bg-blue-50 hover:!text-blue-600'
                                }`}
                        >
                            {report.label}
                        </button>
                    ))}
                </div>

                {/* Report Content Container */}
                <div className="mt-2">
                    <ActiveComponent dateRange={dateRange} setDateRange={setDateRange} />
                </div>
            </div>
        </div>
    );
};

export default Reports;