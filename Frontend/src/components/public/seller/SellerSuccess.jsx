import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SellerSuccess = () => {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleStatusClick = () => {
    navigate('/seller-status');
  };

  const handleCancelRequest = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    alert('Request cancelled successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Success Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">
          Submission Successful! 🎉
        </h2>
        <p className="text-green-600 text-sm sm:text-base">
          Your application has been submitted successfully. We'll review it and get back to you soon.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleStatusClick}
            className="bg-blue-600 text-white px-6 sm:px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105 text-sm sm:text-base"
          >
            📊 View Status
          </button>
          <button
            onClick={handleCancelRequest}
            className="bg-red-500 text-white px-6 sm:px-8 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition transform hover:scale-105 text-sm sm:text-base"
          >
            ❌ Cancel Request
          </button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
          What happens next?
        </h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold text-sm">1.</span>
            <p className="text-gray-600 text-sm">Our team will review your application</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold text-sm">2.</span>
            <p className="text-gray-600 text-sm">You'll receive an email with the decision</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold text-sm">3.</span>
            <p className="text-gray-600 text-sm">Once approved, you can start selling immediately</p>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cancel Request?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to cancel your seller application? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition text-sm"
                >
                  Keep Request
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerSuccess;