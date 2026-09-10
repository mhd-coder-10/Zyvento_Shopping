import React from 'react';

const LoadingSpinner = ({ fullPage = false, size = 'md', color = 'indigo', text = 'Loading...' }) => {
    // Size classes
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4',
    };

    // Color classes
    const colorClasses = {
        indigo: 'border-indigo-600',
        white: 'border-white',
        gray: 'border-gray-600',
        blue: 'border-blue-600',
    };

    // Spinner element
    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full border-t-transparent animate-spin`}
                style={{ borderTopColor: 'transparent' }}
            />
            {text && (
                <p className={`text-sm font-medium ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
                    {text}
                </p>
            )}
        </div>
    );

    // If fullPage is true, show full page overlay
    if (fullPage) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                {spinner}
            </div>
        );
    }

    // Default - inline spinner
    return spinner;
};

export default LoadingSpinner;