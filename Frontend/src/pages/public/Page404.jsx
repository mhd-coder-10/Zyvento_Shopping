// ============================================================
// 404 PAGE
// Description: Not found page for invalid routes
// Features: Error message, Home button
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';

const Page404 = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-8xl mb-6">🔍</div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-500 mb-8">
                    Oops! The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default Page404;