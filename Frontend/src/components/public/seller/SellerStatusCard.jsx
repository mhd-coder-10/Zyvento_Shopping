
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SellerStatusCard = ({ statusData, onCancel }) => {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Default status if not provided
  const defaultStatus = {
    currentStatus: 'pending',
    submittedDate: '2024-01-15',
    lastUpdated: '2024-01-16',
    remarks: 'Application is under review'
  };

  const status = statusData || defaultStatus;

  // Status configurations
  const statusConfig = {
    pending: {
      label: 'Under Review',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: '⏳',
      progress: 40
    },
    approved: {
      label: 'Approved ✅',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: '✅',
      progress: 100
    },
    rejected: {
      label: 'Rejected ❌',
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: '❌',
      progress: 100
    },
    cancelled: {
      label: 'Cancelled 🚫',
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: '🚫',
      progress: 0
    }
  };

  const currentStatus = statusConfig[status.currentStatus] || statusConfig.pending;

  // Timeline steps
  const timelineSteps = [
    { id: 'submitted', label: 'Application Submitted', icon: '📝', date: status.submittedDate },
    { id: 'review', label: 'Under Review', icon: '🔍', date: status.lastUpdated },
    { id: 'decision', label: 'Final Decision', icon: '📋', date: status.currentStatus === 'approved' || status.currentStatus === 'rejected' ? status.lastUpdated : 'Pending' }
  ];

  const getStepStatus = (stepId) => {
    if (status.currentStatus === 'cancelled') return 'cancelled';
    
    const order = ['submitted', 'review', 'decision'];
    const currentIndex = order.indexOf(status.currentStatus === 'approved' || status.currentStatus === 'rejected' ? 'decision' : status.currentStatus);
    const stepIndex = order.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    if (onCancel) {
      onCancel();
    } else {
      alert('Request cancelled successfully!');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className={`p-4 sm:p-6 border-b ${currentStatus.bgColor} ${currentStatus.borderColor}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-3xl sm:text-4xl">{currentStatus.icon}</span>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Seller Application Status
              </h3>
              <p className={`text-sm font-semibold ${currentStatus.textColor}`}>
                {currentStatus.label}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">ID: #APP-2024-001</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{currentStatus.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-1000 ${currentStatus.color}`}
            style={{ width: `${currentStatus.progress}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4 sm:p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h4>
        <div className="space-y-4">
          {timelineSteps.map((step, index) => {
            const stepStatus = getStepStatus(step.id);
            
            return (
              <div key={step.id} className="flex items-start space-x-3">
                {/* Icon Column */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    stepStatus === 'completed' ? 'bg-green-500 text-white' :
                    stepStatus === 'current' ? 'bg-blue-500 text-white animate-pulse' :
                    stepStatus === 'cancelled' ? 'bg-gray-400 text-white' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {stepStatus === 'completed' ? '✓' :
                     stepStatus === 'current' ? '●' :
                     stepStatus === 'cancelled' ? '✗' :
                     step.icon}
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className={`w-0.5 h-8 ${
                      stepStatus === 'completed' ? 'bg-green-400' :
                      stepStatus === 'cancelled' ? 'bg-gray-300' :
                      'bg-gray-200'
                    }`} />
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <p className={`text-sm font-medium ${
                      stepStatus === 'completed' ? 'text-green-700' :
                      stepStatus === 'current' ? 'text-blue-700' :
                      stepStatus === 'cancelled' ? 'text-gray-500' :
                      'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                    <span className={`text-xs ${
                      stepStatus === 'cancelled' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {step.date || 'Pending'}
                    </span>
                  </div>
                  {stepStatus === 'current' && step.id !== 'decision' && (
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      ⏳ In Progress...
                    </p>
                  )}
                  {stepStatus === 'current' && step.id === 'decision' && (
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      ⏳ Awaiting Decision...
                    </p>
                  )}
                  {stepStatus === 'completed' && step.id === 'decision' && (
                    <p className={`text-xs font-medium mt-0.5 ${
                      status.currentStatus === 'approved' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {status.currentStatus === 'approved' ? '✅ Application Approved!' : '❌ Application Rejected'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Details */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Application Date</p>
              <p className="text-sm font-medium text-gray-800">{status.submittedDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-sm font-medium text-gray-800">{status.lastUpdated}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Remarks</p>
              <p className="text-sm font-medium text-gray-800">{status.remarks || 'No remarks'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {status.currentStatus !== 'cancelled' && (
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-end">
          {status.currentStatus === 'pending' && (
            <button
              onClick={handleCancelClick}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold transition transform hover:scale-105 text-sm"
            >
              ❌ Cancel Request
            </button>
          )}
          <button
            onClick={() => navigate('/become-seller')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-semibold transition text-sm"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cancel Seller Application?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to cancel your seller application? This action cannot be undone and all your progress will be lost.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg font-semibold transition text-sm"
                >
                  Keep Request
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold transition text-sm"
                >
                  Yes, Cancel Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerStatusCard;