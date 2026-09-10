
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ReviewDashboard from './ReviewDashboard';
import ReviewsList from './ReviewsList';
import ReviewReports from './ReviewReports';

const Reviews = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Read tab from URL, default to 'reviews' if not present or invalid
    const validTabs = ['dashboard', 'reviews', 'reports'];
    const initialTab = validTabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'reviews';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Update URL whenever tab changes
    useEffect(() => {
        setSearchParams({ tab: activeTab });
    }, [activeTab, setSearchParams]);

    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'reviews', label: 'Reviews' },
        { id: 'reports', label: 'Reports' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Review Management" subtitle="Manage customer product reviews" />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                
                {/* Tabs UI */}
                <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                                activeTab === tab.id
                                    ? 'bg-blue-600 !text-white shadow-md'
                                    : 'bg-gray-100 !text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content (No Reload) */}
                <div className="mt-6">
                    {activeTab === 'dashboard' && <ReviewDashboard />}
                    {activeTab === 'reviews' && <ReviewsList />}
                    {activeTab === 'reports' && <ReviewReports />}
                </div>

            </div>
        </div>
    );
};

export default Reviews;