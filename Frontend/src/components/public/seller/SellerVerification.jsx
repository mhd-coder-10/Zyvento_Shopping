import React, { useState } from 'react';

const SellerVerification = ({ onVerify }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);

  const handleSendEmailOTP = async () => {
    if (!email) {
      setError('Please enter email');
      return;
    }
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      setIsLoading(false);
      setShowOTPField(true);
      setStep(3);
    }, 1500);
  };

  const handleSendMobileOTP = async () => {
    if (!mobile) {
      setError('Please enter mobile number');
      return;
    }
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      setIsLoading(false);
      setShowOTPField(true);
      setStep(3);
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      if (otp === '1234') {
        setIsLoading(false);
        if (!emailVerified) {
          setEmailVerified(true);
          setShowOTPField(false);
          setOtp('');
          setStep(2); // Move to mobile step
        } else if (!mobileVerified) {
          setMobileVerified(true);
          setShowOTPField(false);
          setOtp('');
          // Both verified, proceed
          onVerify();
        }
      } else {
        setIsLoading(false);
        setError('Invalid OTP. Please try again.');
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Verification Required</h2>
        <p className="text-gray-600 text-sm mt-1">Verify your email and mobile to continue</p>
      </div>

      {/* Email Verification */}
      <div className={`border rounded-xl p-4 sm:p-6 transition-all ${
        emailVerified ? 'border-green-500 bg-green-50' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg sm:text-xl">📧</span>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Email Verification</h3>
            {emailVerified && (
              <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>
        </div>

        {!emailVerified ? (
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              disabled={step !== 1 && step !== 3}
            />
            <button
              onClick={handleSendEmailOTP}
              disabled={!email || isLoading || step === 2}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading && step === 1 ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <p className="text-green-600 font-medium text-sm">✓ Email verified successfully</p>
        )}
      </div>

      {/* Mobile Verification */}
      <div className={`border rounded-xl p-4 sm:p-6 transition-all ${
        mobileVerified ? 'border-green-500 bg-green-50' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg sm:text-xl">📱</span>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Mobile Verification</h3>
            {mobileVerified && (
              <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>
        </div>

        {!mobileVerified ? (
          <div className="space-y-3">
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter your mobile number"
              className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              disabled={!emailVerified || (step !== 2 && step !== 3)}
            />
            <button
              onClick={handleSendMobileOTP}
              disabled={!mobile || isLoading || !emailVerified || step !== 2}
              className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading && step === 2 ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <p className="text-green-600 font-medium text-sm">✓ Mobile verified successfully</p>
        )}
      </div>

      {/* OTP Field */}
      {showOTPField && (
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 sm:p-6">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
            {!emailVerified ? 'Enter Email OTP' : 'Enter Mobile OTP'}
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength="4"
              className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-xl tracking-widest"
            />
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button
              onClick={handleVerifyOTP}
              disabled={!otp || isLoading}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <p className="text-xs text-gray-500 text-center">
              (Demo OTP: 1234)
            </p>
          </div>
        </div>
      )}

      {emailVerified && mobileVerified && (
        <div className="text-center py-3">
          <div className="bg-green-100 text-green-700 p-3 rounded-xl text-sm">
            ✅ Both email and mobile verified successfully!
          </div>
          <button
            onClick={onVerify}
            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-2.5 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105 text-sm sm:text-base"
          >
            Continue to Registration →
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerVerification;