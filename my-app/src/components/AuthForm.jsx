import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { 
  signup, 
  verifyOTP, 
  login, 
  forgotPassword, 
  resetPassword,
  clearError, 
  clearAuthState 
} from '../redux/authSlice';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthForm = ({ closeModal }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent, resetEmailSent, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      closeModal?.();
      navigate('/');
    }
  }, [isAuthenticated, navigate, closeModal]);

  useEffect(() => {
    dispatch(clearError());
  }, [isLogin, forgotPasswordMode, resetPasswordMode, dispatch]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (forgotPasswordMode) {
      if (!formData.email) {
        toast.error('Please enter your email');
        return;
      }
      dispatch(forgotPassword(formData.email));
      return;
    }

    if (resetPasswordMode) {
      if (!formData.email || !formData.otp || !formData.password) {
        toast.error('Please fill all fields');
        return;
      }
      const result = await dispatch(resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.password
      }));
      if (result.meta.requestStatus === 'fulfilled') {
        setResetPasswordMode(false);
        setForgotPasswordMode(false);
        setFormData({ name: '', email: '', password: '', confirmPassword: '', otp: '' });
        toast.success('Password reset successfully');
      }
      return;
    }

    if (otpSent) {
      if (!formData.email || !formData.otp) {
        toast.error('Please enter OTP');
        return;
      }
      dispatch(verifyOTP({
        email: formData.email,
        otp: formData.otp
      }));
      return;
    }

    if (isLogin) {
      if (!formData.email || !formData.password) {
        toast.error('Please fill all fields');
        return;
      }
      dispatch(login({
        email: formData.email,
        password: formData.password
      }));
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error('Please fill all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      dispatch(signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      }));
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = authAPI.googleAuth();
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '', otp: '' });
    setForgotPasswordMode(false);
    setResetPasswordMode(false);
    dispatch(clearAuthState());
  };

  const renderTitle = () => {
    if (forgotPasswordMode) return 'Forgot Password';
    if (resetPasswordMode) return 'Reset Password';
    if (otpSent) return 'Verify Email';
    return isLogin ? 'Login' : 'Sign Up';
  };

  const renderSubmitText = () => {
    if (forgotPasswordMode) return 'Send Reset Code';
    if (resetPasswordMode) return 'Reset Password';
    if (otpSent) return 'Verify OTP';
    return isLogin ? 'Login' : 'Sign Up';
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center px-4 z-50 bg-black/30">
      <div className="bg-white shadow rounded-xl p-6 sm:p-8 w-full max-w-md relative">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          {renderTitle()}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !otpSent && !forgotPasswordMode && !resetPasswordMode && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your full name"
              />
            </div>
          )}

          {!otpSent || forgotPasswordMode || resetPasswordMode ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
              />
            </div>
          ) : null}

          {(otpSent || resetPasswordMode) && (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={formData.otp}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter 6-digit OTP"
                maxLength="6"
              />
            </div>
          )}

          {!forgotPasswordMode && !otpSent && (
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute bottom-2 right-3 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          )}

          {(!isLogin || resetPasswordMode) && !forgotPasswordMode && !otpSent && (
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute bottom-2 right-3 text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {otpSent && (
            <div className="text-green-600 text-sm text-center">
              OTP sent to your email. Please check and enter the code.
            </div>
          )}

          {resetEmailSent && (
            <div className="text-green-600 text-sm text-center">
              Reset code sent to your email. Please check and enter the code.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : renderSubmitText()}
          </button>

          {!otpSent && !forgotPasswordMode && !resetPasswordMode && (
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FaGoogle className="text-red-500" />
              Continue with Google
            </button>
          )}

          <div className="text-center space-y-2">
            {!otpSent && !forgotPasswordMode && !resetPasswordMode && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    resetForm();
                  }}
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </button>

                {isLogin && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordMode(true)}
                      className="text-blue-600 hover:text-blue-500 text-sm"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </>
            )}

            {resetEmailSent && (
              <button
                type="button"
                onClick={() => setResetPasswordMode(true)}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Enter reset code
              </button>
            )}

            {(otpSent || forgotPasswordMode || resetPasswordMode) && (
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-600 hover:text-gray-500 text-sm"
              >
                Back to login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;