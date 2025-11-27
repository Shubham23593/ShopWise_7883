import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaShoppingBag, FaTimes, FaPhone } from "react-icons/fa";
import { toast } from "react-toastify";

const AuthForm = ({ closeModal }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // ✅ Login Validation
        if (!formData.email || !formData.password) {
          toast.error('❌ Please fill all fields');
          setLoading(false);
          return;
        }

        if (!formData.email.includes('@')) {
          toast.error('❌ Please enter a valid email');
          setLoading(false);
          return;
        }

        console.log('🔐 Submitting login...', formData.email);
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          toast.success('✅ Login successful!');
          closeModal?.();
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
        }

      } else {
        // ✅ Register Validation
        if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
          toast.error('❌ Please fill all fields');
          setLoading(false);
          return;
        }

        if (!formData.email.includes('@')) {
          toast.error('❌ Please enter a valid email');
          setLoading(false);
          return;
        }

        if (formData.phone.length < 10) {
          toast.error('❌ Please enter a valid phone number');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error('❌ Passwords do not match');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          toast.error('❌ Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        console.log('📝 Submitting register...', formData.email);
        const result = await register(
          formData.name,
          formData.email,
          formData.phone,
          formData.password
        );

        if (result.success) {
          toast.success('✅ Registration successful!');
          closeModal?.();
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
        }
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      
      // ✅ Better Error Handling
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
        toast.error('❌ Cannot connect to server. Check if backend is running on http://localhost:5000');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('❌ Request timeout. Please try again.');
      } else if (error.response?.status === 400) {
        toast.error(`❌ ${error.response.data.message || 'Invalid credentials'}`);
      } else if (error.response?.status === 401) {
        toast.error('❌ Invalid email or password');
      } else if (error.response?.status === 404) {
        toast.error('❌ User not found');
      } else if (error.response?.status === 500) {
        toast.error('❌ Server error. Please try again later');
      } else if (error.response?.data?.message) {
        toast.error(`❌ ${error.response.data.message}`);
      } else {
        toast.error(`❌ ${error.message || 'An error occurred. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRememberMe(false);
  };

  return (
    <div className="flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row relative">
        
        {/* Mobile Close Button */}
        {closeModal && (
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 z-20 md:hidden text-gray-600 hover:text-gray-800 bg-white rounded-full p-2 shadow-md"
          >
            <FaTimes className="text-lg" />
          </button>
        )}

        {/* Left Side - Branding */}
        <div className="hidden sm:flex bg-gradient-to-br from-[#3B2F2F] to-[#6B4F4F] p-6 sm:p-8 md:w-2/5 flex-col justify-center text-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <FaShoppingBag className="text-2xl sm:text-3xl" />
            <h1 className="text-xl sm:text-2xl font-bold">ShopWise</h1>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
            {isLogin ? '🎉 Welcome Back!' : '🎊 Join Us Today!'}
          </h2>
          <p className="text-gray-200 text-xs sm:text-sm mb-4 sm:mb-6">
            {isLogin 
              ? 'Login to access your account and continue shopping for amazing products!' 
              : 'Create an account to start your shopping journey with us.'}
          </p>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                ✓
              </div>
              <span className="text-xs sm:text-sm">💰 Exclusive Deals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                ✓
              </div>
              <span className="text-xs sm:text-sm">⚡ Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                ✓
              </div>
              <span className="text-xs sm:text-sm">🔒 Secure Payments</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-4 sm:p-6 md:p-8 md:w-3/5 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Mobile Logo */}
          <div className="flex sm:hidden items-center justify-center gap-2 mb-4">
            <FaShoppingBag className="text-[#3B2F2F] text-2xl" />
            <h1 className="text-xl font-bold text-[#3B2F2F]">ShopWise</h1>
          </div>

          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
              {isLogin ? '🔐 Login' : '📝 Create Account'}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Fill in your details to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Name Field (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3B2F2F] transition-colors"
                    placeholder="Enter your full name"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3B2F2F] transition-colors"
                  placeholder="example@email.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Phone Field (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3B2F2F] transition-colors"
                    placeholder="10 digit mobile number"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 text-xs sm:text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3B2F2F] transition-colors"
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">
                  Min 6 characters
                </p>
              )}
            </div>

            {/* Confirm Password Field (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 text-xs sm:text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3B2F2F] transition-colors"
                    placeholder="Re-enter your password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me (Login only) */}
            {isLogin && (
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded border-gray-300 text-[#3B2F2F] focus:ring-[#3B2F2F]"
                  />
                  <span className="text-xs text-gray-600">Remember me</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#3B2F2F] to-[#6B4F4F] text-white py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? '🔓 Login' : '✍️ Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-4 sm:mt-6 mb-3 sm:mb-4 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-2 sm:px-3 text-xs text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Switch Mode */}
          <div className="text-center mb-4">
            <p className="text-gray-600 text-xs sm:text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={switchMode}
                disabled={loading}
                className="ml-1 text-[#3B2F2F] font-bold hover:underline transition-all disabled:opacity-50"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>

          {/* Close Button (Desktop only) */}
          {closeModal && (
            <button
              onClick={closeModal}
              className="hidden md:block w-full py-2 text-sm text-gray-600 hover:text-gray-800 font-semibold transition-colors border-t pt-4"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;