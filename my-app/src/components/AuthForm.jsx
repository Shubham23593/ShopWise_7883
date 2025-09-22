import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const AuthForm = ({ closeModal }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    newPassword: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup, verifyOTP } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (showOTPVerification) {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.otp.trim()) newErrors.otp = 'OTP is required';
      if (showForgotPassword && !formData.newPassword) newErrors.newPassword = 'New password is required';
    } else if (showForgotPassword) {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    } else {
      if (!isLogin && !formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
      if (!isLogin && formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (showOTPVerification) {
        // Handle OTP verification
        if (showForgotPassword) {
          // Reset password with OTP
          await authAPI.resetPassword(formData.email, formData.otp, formData.newPassword);
          toast.success('Password reset successful! Please login with your new password.');
          resetForm();
        } else {
          // Verify signup OTP
          await verifyOTP(formData.email, formData.otp, 'signup');
          toast.success('Account verified successfully! Welcome to ShopWise!');
          closeModal?.();
        }
      } else if (showForgotPassword) {
        // Send forgot password OTP
        await authAPI.forgotPassword(formData.email);
        toast.success('OTP sent to your email for password reset');
        setShowOTPVerification(true);
      } else if (isLogin) {
        // Login
        const response = await login({
          email: formData.email,
          password: formData.password,
        });
        
        if (response.requiresVerification) {
          // User needs email verification
          setShowOTPVerification(true);
          toast.info('Please verify your email. OTP sent to your email.');
        } else {
          toast.success('Login successful ✅');
          closeModal?.();
        }
      } else {
        // Signup
        await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        toast.success('Registration successful! Please check your email for OTP verification.');
        setShowOTPVerification(true);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    }
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      if (showForgotPassword) {
        await authAPI.forgotPassword(formData.email);
        toast.success('OTP resent to your email');
      } else {
        await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        toast.success('OTP resent to your email');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp: '',
      newPassword: '',
      rememberMe: false,
    });
    setErrors({});
    setShowOTPVerification(false);
    setShowForgotPassword(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowNewPassword(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleGoogleLogin = () => {
    window.location.href = authAPI.getGoogleAuthUrl();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center px-4 z-50 bg-black/30">
      <div className="bg-white shadow rounded-xl p-6 sm:p-8 w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          {showOTPVerification 
            ? (showForgotPassword ? 'Reset Password' : 'Verify Email')
            : showForgotPassword 
            ? 'Forgot Password' 
            : isLogin 
            ? 'Login' 
            : 'Register'}
        </h1>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field - always shown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                disabled={showOTPVerification}
                className={`w-full pl-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } ${showOTPVerification ? 'bg-gray-100' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* OTP Verification */}
          {showOTPVerification && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <div className="relative">
                  <Shield className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className={`w-full pl-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.otp ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.otp && (
                  <p className="text-xs text-red-500">{errors.otp}</p>
                )}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:underline mt-1"
                >
                  Resend OTP
                </button>
              </div>

              {/* New password for reset */}
              {showForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      className={`w-full pl-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-500">{errors.newPassword}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Regular form fields */}
          {!showOTPVerification && !showForgotPassword && (
            <>
              {/* Name field for registration */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      className={`w-full pl-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                  )}
                </div>
              )}

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••"
                    className={`w-full pl-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm password for registration */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••"
                      className={`w-full pl-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Please wait...' : 
             showOTPVerification ? 'Verify OTP' :
             showForgotPassword ? 'Send OTP' :
             isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        {/* Google OAuth button */}
        {!showOTPVerification && !showForgotPassword && (
          <button
            onClick={handleGoogleLogin}
            className="w-full mt-3 bg-red-600 text-white py-2 rounded-lg shadow-md hover:shadow-lg hover:bg-red-700 transition-all"
          >
            Continue with Google
          </button>
        )}

        {/* Footer links */}
        <div className="text-center mt-6 space-y-2">
          {!showOTPVerification && (
            <>
              {!showForgotPassword && (
                <p className="text-sm text-gray-600">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button onClick={toggleMode} className="text-blue-600 hover:underline">
                    {isLogin ? 'Register' : 'Login'}
                  </button>
                </p>
              )}
              
              {isLogin && !showForgotPassword && (
                <p className="text-sm">
                  <button 
                    onClick={() => setShowForgotPassword(true)} 
                    className="text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </p>
              )}

              {showForgotPassword && (
                <p className="text-sm">
                  <button 
                    onClick={() => setShowForgotPassword(false)} 
                    className="text-blue-600 hover:underline"
                  >
                    Back to Login
                  </button>
                </p>
              )}
            </>
          )}

          {showOTPVerification && (
            <p className="text-sm">
              <button 
                onClick={resetForm} 
                className="text-blue-600 hover:underline"
              >
                Back to {isLogin ? 'Login' : 'Register'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
