// Main settings page with tab navigation for different settings sections
// Admin can manage general, email and payment settings

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiSettings,
    FiGlobe,
    FiMail,
    FiCreditCard,
    FiShield,
    FiBell,
    FiUsers,
    FiPackage,
    FiDollarSign,
    FiChevronRight,
} from 'react-icons/fi';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import GeneralSettings from './GeneralSettings';
import EmailSettings from './EmailSettings';
import PaymentSettings from './PaymentSettings';

const Settings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        {
            id: 'general',
            label: 'General',
            icon: FiGlobe,
            description: 'Basic site settings and configurations',
        },
        {
            id: 'email',
            label: 'Email',
            icon: FiMail,
            description: 'Email server and notification settings',
        },
        {
            id: 'payment',
            label: 'Payment',
            icon: FiCreditCard,
            description: 'Payment gateway and transaction settings',
        },
        {
            id: 'security',
            label: 'Security',
            icon: FiShield,
            description: 'Security and authentication settings',
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: FiBell,
            description: 'System notification preferences',
        },
        {
            id: 'users',
            label: 'Users',
            icon: FiUsers,
            description: 'User management settings',
        },
        {
            id: 'products',
            label: 'Products',
            icon: FiPackage,
            description: 'Product catalog settings',
        },
        {
            id: 'tax',
            label: 'Tax & Fees',
            icon: FiDollarSign,
            description: 'Tax and fee configurations',
        },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings />;
            case 'email':
                return <EmailSettings />;
            case 'payment':
                return <PaymentSettings />;
            default:
                return (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <FiSettings className="w-12 h-12 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                {tabs.find(t => t.id === activeTab)?.label || 'Settings'}
                            </h3>
                            <p className="text-gray-500">
                                This settings section is coming soon.
                            </p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div>
            <AdminTopbar
                title="System Settings"
                subtitle="Manage all platform configurations"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-20">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <p className="text-sm font-semibold text-gray-700">Settings</p>
                        </div>
                        <nav className="p-2 space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${isActive
                                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        <span className="text-sm">{tab.label}</span>
                                        {isActive && (
                                            <FiChevronRight className="w-4 h-4 ml-auto text-indigo-600" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Settings;