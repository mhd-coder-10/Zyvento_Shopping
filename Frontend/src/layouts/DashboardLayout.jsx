import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Sidebar from '../components/common/Sidebar';
import DashboardHeader from '../components/common/DashboardHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardLayout = () => {
    const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (loading) {
        return <LoadingSpinner fullPage text="Loading dashboard..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user?.role?.roleName || user?.role_name || 'customer';
    const isAdmin = ['super_admin', 'sub_admin'].includes(userRole);
    const isSeller = ['seller', 'seller_employee'].includes(userRole);

    if (!isAdmin && !isSeller) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="pt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
            
        </div>
    );
};

export default DashboardLayout;