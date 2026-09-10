import React from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'bg-blue-600 hover:bg-blue-700',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blur Backdrop - App visible but blurred, NOT solid black */}
            <div
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog Box */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                    <FiX className="w-5 h-5" />
                </button>

                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-50 rounded-full !text-orange-600">
                        <FiAlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold !text-black">{title}</h3>
                </div>

                {/* Message */}
                <p className="text-sm !text-gray-600 mb-6">{message}</p>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-100 !text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white font-semibold shadow-md transition-all ${confirmColor}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;