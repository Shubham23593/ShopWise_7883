import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
          
          // Update tokens
          setTokens(newAccessToken, newRefreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          clearTokens();
          window.location.href = '/auth';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
export const setTokens = (newAccessToken, newRefreshToken) => {
  accessToken = newAccessToken;
  refreshToken = newRefreshToken;
  localStorage.setItem('accessToken', newAccessToken);
  localStorage.setItem('refreshToken', newRefreshToken);
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Auth API functions
export const authAPI = {
  // Register user and send OTP
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (email, otp, type = 'signup') => {
    const response = await api.post('/auth/verify-otp', { email, otp, type });
    const { user, accessToken, refreshToken } = response.data;
    
    setTokens(accessToken, refreshToken);
    setStoredUser(user);
    
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { user, accessToken, refreshToken } = response.data;
    
    setTokens(accessToken, refreshToken);
    setStoredUser(user);
    
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Google OAuth login URL
  getGoogleAuthUrl: () => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  },
};

// Cart API functions
export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, product, quantity = 1) => {
    const response = await api.post('/cart/add', { productId, product, quantity });
    return response.data;
  },

  // Update item quantity
  updateQuantity: async (productId, quantity) => {
    const response = await api.put(`/cart/update/${productId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
  },

  // Increase quantity
  increaseQuantity: async (productId) => {
    const response = await api.post(`/cart/increase/${productId}`);
    return response.data;
  },

  // Decrease quantity
  decreaseQuantity: async (productId) => {
    const response = await api.post(`/cart/decrease/${productId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },
};

// Order API functions
export const orderAPI = {
  // Get user's orders
  getOrders: async (page = 1, limit = 10) => {
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get specific order
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  },

  // Search order by order number
  searchOrder: async (orderNumber) => {
    const response = await api.get(`/orders/search/${orderNumber}`);
    return response.data;
  },
};

// User API functions
export const userAPI = {
  // Get profile
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    const { user } = response.data;
    setStoredUser(user);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/user/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async (password) => {
    const response = await api.delete('/user/account', { data: { password } });
    clearTokens();
    return response.data;
  },
};

export default api;