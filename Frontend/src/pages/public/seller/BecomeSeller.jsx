// export default BecomeSeller;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerVerification from '../../../components/public/seller/SellerVerification';
import SellerRegistrationForm from '../../../components/public/seller/SellerRegistrationForm';
import SellerSuccess from '../../../components/public/seller/SellerSuccess';

const BecomeSeller = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login', { state: { from: '/become-seller' } });
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    setCurrentStep(1);
  };

  const handleFormSubmit = () => {
    setIsSubmitted(true);
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Become a Seller
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Join our marketplace and start selling your products
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center w-full max-w-md">
            {[0, 1, 2].map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-300 ${
                      currentStep >= step
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step + 1}
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1 text-gray-600 font-medium">
                    {step === 0 && 'Verify'}
                    {step === 1 && 'Details'}
                    {step === 2 && 'Complete'}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`flex-1 h-1 mx-1 sm:mx-2 transition-all duration-300 ${
                      currentStep > step ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {!isVerified && !isSubmitted && (
              <SellerVerification onVerify={handleVerificationSuccess} />
            )}

            {isVerified && !isSubmitted && (
              <SellerRegistrationForm onSubmit={handleFormSubmit} />
            )}

            {isSubmitted && (
              <SellerSuccess />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;