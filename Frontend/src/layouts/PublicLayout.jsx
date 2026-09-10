// PUBLIC LAYOUT
// Description: Layout for public pages with proper spacing
// Features: Header (sticky) + Content + Footer

import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PublicLayout = () => {
    const { loading } = useAppSelector((state) => state.auth);

    if (loading) {
        return <LoadingSpinner fullPage text="Loading..." />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 pt-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;