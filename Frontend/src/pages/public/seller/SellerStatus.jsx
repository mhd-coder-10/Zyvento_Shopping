// // src/publicPages/pages/seller/SellerStatus.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//     CheckCircle,
//     Clock,
//     XCircle,
//     AlertCircle,
//     ChevronLeft,
//     UserCheck,
//     FileText,
//     ShoppingBag,
//     Home,
//     Calendar,
//     ArrowRight,
//     Loader
// } from 'lucide-react';

// const SellerStatus = () => {
//     const navigate = useNavigate();
//     const [status, setStatus] = useState({
//         currentStep: 2, // 1: Submitted, 2: Under Review, 3: Approved, 4: Rejected
//         steps: [
//             { id: 1, label: 'Application Submitted', date: '2026-01-15', completed: true },
//             { id: 2, label: 'Under Review', date: '2026-01-16', completed: false, active: true },
//             { id: 3, label: 'Document Verification', date: 'Pending', completed: false },
//             { id: 4, label: 'Final Approval', date: 'Pending', completed: false },
//         ],
//         canCancel: true,
//         cancellationReason: '',
//         isCancelled: false
//     });

//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         // Simulate API call to fetch status
//         setTimeout(() => {
//             setLoading(false);
//         }, 1500);
//     }, []);

//     const handleCancelRequest = () => {
//         if (window.confirm('Are you sure you want to cancel your seller application? This action cannot be undone.')) {
//             setStatus(prev => ({
//                 ...prev,
//                 isCancelled: true,
//                 canCancel: false,
//                 currentStep: 5 // Cancelled
//             }));
//             // API call to cancel request
//             alert('Your application has been cancelled successfully.');
//         }
//     };

//     const getStepStatus = (stepId) => {
//         if (status.isCancelled) return 'cancelled';

//         const step = status.steps.find(s => s.id === stepId);
//         if (!step) return 'pending';
//         if (step.completed) return 'completed';
//         if (step.active) return 'active';
//         return 'pending';
//     };

//     const getStatusColor = (stepStatus) => {
//         switch (stepStatus) {
//             case 'completed': return 'bg-green-500';
//             case 'active': return 'bg-blue-500 animate-pulse';
//             case 'cancelled': return 'bg-red-500';
//             default: return 'bg-gray-300';
//         }
//     };

//     const getStatusIcon = (stepStatus) => {
//         switch (stepStatus) {
//             case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
//             case 'active': return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
//             case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
//             default: return <Clock className="w-5 h-5 text-gray-400" />;
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading status...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-4xl mx-auto">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <button
//                         onClick={() => navigate('/become-seller')}
//                         className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 mb-4"
//                     >
//                         <ChevronLeft className="w-5 h-5" />
//                         Back to Application
//                     </button>

//                     <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
//                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                             <div>
//                                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
//                                     Seller Application Status
//                                 </h1>
//                                 <p className="text-gray-500 text-sm mt-1">
//                                     Track your seller application progress
//                                 </p>
//                             </div>

//                             {!status.isCancelled && status.canCancel && (
//                                 <button
//                                     onClick={handleCancelRequest}
//                                     className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 text-sm"
//                                 >
//                                     <XCircle className="w-4 h-4" />
//                                     Cancel Request
//                                 </button>
//                             )}
//                         </div>

//                         {/* Status Summary */}
//                         <div className="mt-6 p-4 bg-gray-50 rounded-xl">
//                             <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
//                                 <div className="flex items-center gap-3">
//                                     <div className={`w-3 h-3 rounded-full ${status.isCancelled ? 'bg-red-500' :
//                                             status.currentStep === 3 ? 'bg-green-500' :
//                                                 status.currentStep === 4 ? 'bg-red-500' : 'bg-blue-500'
//                                         }`}></div>
//                                     <span className="font-medium text-gray-700">
//                                         {status.isCancelled ? 'Cancelled' :
//                                             status.currentStep === 3 ? '✅ Approved' :
//                                                 status.currentStep === 4 ? '❌ Rejected' :
//                                                     '⏳ In Progress'}
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center gap-4 text-sm text-gray-500">
//                                     <span className="flex items-center gap-1">
//                                         <Calendar className="w-4 h-4" />
//                                         Applied: 15 Jan 2026
//                                     </span>
//                                     <span className="flex items-center gap-1">
//                                         <Clock className="w-4 h-4" />
//                                         {status.isCancelled ? 'Cancelled' : 'Est. 2-3 days'}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Status Timeline */}
//                         <div className="mt-8">
//                             <h3 className="font-semibold text-gray-700 mb-6 text-sm sm:text-base">
//                                 Application Progress
//                             </h3>

//                             <div className="space-y-0">
//                                 {status.steps.map((step, index) => {
//                                     const stepStatus = getStepStatus(step.id);
//                                     const isLast = index === status.steps.length - 1;

//                                     return (
//                                         <div key={step.id} className="relative">
//                                             {!isLast && (
//                                                 <div className={`absolute left-5 top-10 w-0.5 h-12 ${stepStatus === 'completed' ? 'bg-green-500' :
//                                                         stepStatus === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'
//                                                     }`}></div>
//                                             )}

//                                             <div className="flex items-start gap-4 pb-8">
//                                                 <div className="flex-shrink-0">
//                                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${stepStatus === 'completed' ? 'border-green-500 bg-green-50' :
//                                                             stepStatus === 'active' ? 'border-blue-500 bg-blue-50' :
//                                                                 stepStatus === 'cancelled' ? 'border-red-500 bg-red-50' :
//                                                                     'border-gray-300 bg-gray-50'
//                                                         }`}>
//                                                         {getStatusIcon(stepStatus)}
//                                                     </div>
//                                                 </div>

//                                                 <div className="flex-1 pt-1">
//                                                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
//                                                         <div>
//                                                             <p className={`font-medium text-sm sm:text-base ${stepStatus === 'cancelled' ? 'text-gray-400 line-through' : 'text-gray-800'
//                                                                 }`}>
//                                                                 {step.label}
//                                                             </p>
//                                                             <p className="text-xs text-gray-500">
//                                                                 {step.date}
//                                                             </p>
//                                                         </div>
//                                                         <div className="flex items-center gap-2">
//                                                             <span className={`text-xs px-2 py-1 rounded-full ${stepStatus === 'completed' ? 'bg-green-100 text-green-700' :
//                                                                     stepStatus === 'active' ? 'bg-blue-100 text-blue-700' :
//                                                                         stepStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
//                                                                             'bg-gray-100 text-gray-500'
//                                                                 }`}>
//                                                                 {stepStatus === 'completed' ? 'Completed' :
//                                                                     stepStatus === 'active' ? 'In Progress' :
//                                                                         stepStatus === 'cancelled' ? 'Cancelled' :
//                                                                             'Pending'}
//                                                             </span>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>

//                         {/* Additional Info */}
//                         {status.isCancelled && (
//                             <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
//                                 <div className="flex items-start gap-3">
//                                     <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                                     <div>
//                                         <p className="font-medium text-red-700 text-sm">Request Cancelled</p>
//                                         <p className="text-red-600 text-sm">
//                                             Your seller application has been cancelled. You can re-apply anytime.
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {status.currentStep === 3 && !status.isCancelled && (
//                             <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
//                                 <div className="flex items-start gap-3">
//                                     <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//                                     <div>
//                                         <p className="font-medium text-green-700 text-sm">Congratulations! 🎉</p>
//                                         <p className="text-green-600 text-sm">
//                                             Your seller account has been approved. Start listing your products now!
//                                         </p>
//                                         <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm flex items-center gap-2">
//                                             <ShoppingBag className="w-4 h-4" />
//                                             Start Selling
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Navigation */}
//                         <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
//                             <div className="text-xs text-gray-400">
//                                 Application ID: #SELL-2026-001
//                             </div>
//                             <button
//                                 onClick={() => navigate('/')}
//                                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-sm"
//                             >
//                                 <Home className="w-4 h-4" />
//                                 Back to Home
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SellerStatus;







import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SellerStatus = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [isCancelled, setIsCancelled] = useState(false);

  // Mock status data - In real app, fetch from API
  const statusData = {
    submitted: { label: 'Application Submitted', date: '2024-01-15', time: '10:30 AM' },
    pending: { label: 'Under Review', date: '2024-01-16', time: '02:00 PM' },
    approved: { label: 'Approved', date: '2024-01-20', time: '09:00 AM' },
    rejected: { label: 'Rejected', date: '2024-01-22', time: '11:00 AM' },
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const handleCancelRequest = () => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      setIsCancelled(true);
      setStatus('cancelled');
      alert('Request cancelled successfully!');
    }
  };

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Request Cancelled</h2>
          <p className="text-gray-600 text-sm">
            Your seller application has been cancelled. You can reapply at any time.
          </p>
          <button
            onClick={() => navigate('/become-seller')}
            className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
          >
            Apply Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Application Status
          </h1>
          <p className="text-gray-600 mt-2 text-sm">Track your seller application progress</p>
        </div>

        {/* Status Card */}
        <div className={`border-2 rounded-2xl p-6 sm:p-8 ${getStatusColor(status)}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl sm:text-4xl">{getStatusIcon(status)}</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {statusData[status]?.label || 'Application Submitted'}
                </h2>
                <p className="text-sm opacity-75">
                  Last updated: {statusData[status]?.date || 'Today'}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              status === 'approved' ? 'bg-green-200 text-green-800' :
              status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
              status === 'rejected' ? 'bg-red-200 text-red-800' :
              'bg-gray-200 text-gray-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h3 className="font-semibold text-gray-900 mb-6 text-lg">
            Application Timeline
          </h3>
          <div className="space-y-6">
            {[
              { id: 'submitted', label: 'Application Submitted', icon: '📝' },
              { id: 'pending', label: 'Under Review', icon: '🔍' },
              { id: 'approved', label: 'Approved', icon: '✅' },
            ].map((item, index) => {
              const isCompleted = ['submitted', 'pending', 'approved'].indexOf(item.id) <= 
                                  ['submitted', 'pending', 'approved'].indexOf(status);
              const isCurrent = item.id === status;
              const isRejected = status === 'rejected' && item.id === 'pending';
              
              return (
                <div key={item.id} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      isCompleted && !isRejected
                        ? 'bg-green-500 text-white'
                        : isRejected
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted && !isRejected ? '✓' : isRejected ? '✗' : item.icon}
                    </div>
                    {index < 2 && (
                      <div className={`w-0.5 h-8 ${
                        isCompleted && !isRejected ? 'bg-green-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`font-semibold ${
                      isCompleted && !isRejected
                        ? 'text-green-700'
                        : isRejected
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {item.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-blue-600 font-medium">
                        {status === 'pending' ? '⏳ In Progress...' : '✅ Completed'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/become-seller')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
          >
            ← Back to Dashboard
          </button>
          {status === 'pending' && (
            <button
              onClick={handleCancelRequest}
              className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition text-sm"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerStatus;