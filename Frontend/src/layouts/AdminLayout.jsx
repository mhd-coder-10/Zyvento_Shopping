
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    console.log('🏗️ AdminLayout - isAuthenticated:', isAuthenticated);
    console.log('🏗️ AdminLayout - loading:', loading);
    console.log('🏗️ AdminLayout - user:', user);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            console.log('🏗️ AdminLayout - Not authenticated, redirecting to login');
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return <LoadingSpinner fullPage text="Loading Dashboard..." />;
    }

    if (!isAuthenticated) {
        return null;
    }

    // IMPORTANT: check the user_type 
    const userRole = user?.role?.roleName || user?.role_name || user?.user_type || 'customer';
    const isAdmin = ['super_admin', 'sub_admin'].includes(userRole);

    console.log('🏗️ AdminLayout - userRole:', userRole);
    console.log('🏗️ AdminLayout - isAdmin:', isAdmin);

    if (!isAdmin) {
        console.log('🏗️ AdminLayout - Not admin, redirecting to home');
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                isMobile={isMobile}
                user={user}
            />

            <div
                className={`transition-all duration-300 ${sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-0'
                    }`}
            >
                <AdminHeader
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    isMobile={isMobile}
                    user={user}
                />

                <main
                    className="pt-16"
                    style={{
                        overflowY: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    <style>{`
                        main::-webkit-scrollbar {
                            display: none !important;
                            width: 0 !important;
                            height: 0 !important;
                        }
                        main {
                            scrollbar-width: none !important;
                            -ms-overflow-style: none !important;
                        }
                    `}</style>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;