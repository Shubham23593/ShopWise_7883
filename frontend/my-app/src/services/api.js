import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
  withCredentials: false,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token added to request');
    }
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorDetails = {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      errors: error.response?.data?.errors || null,
    };
    
    console.error('❌ API Error:', errorDetails);

    // ✅ Handle specific error cases
    if (error.response?.status === 400) {
      console.warn('⚠️ Bad Request - Invalid data');
    }

    if (error.response?.status === 401) {
      console.warn('🔐 Unauthorized - Token expired or invalid');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if needed
      if (typeof window !== 'undefined') {
        // Uncomment if you want auto-redirect
        // window.location.href = '/';
      }
    }

    if (error.response?.status === 403) {
      console.warn('🚫 Forbidden - Insufficient permissions');
    }

    if (error.response?.status === 404) {
      console.warn('🔍 Not Found:', error.config?.url);
    }

    if (error.response?.status === 500) {
      console.error('🔥 Server Error - Internal Server Error');
    }

    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout - Server took too long');
    }

    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error - Cannot connect to server');
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  register: async (data) => {
    try {
      console.log('📝 Register request:', data.email);
      const response = await api.post('/auth/register', data);
      console.log('✅ Register successful');
      return response;
    } catch (error) {
      console.error('❌ Register failed:', error.response?.data);
      throw error;
    }
  },

  login: async (data) => {
    try {
      console.log('🔐 Login request:', data.email);
      const response = await api.post('/auth/login', data);
      console.log('✅ Login successful');
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      console.log('👤 Getting profile');
      const response = await api.get('/auth/profile');
      console.log('✅ Profile fetched');
      return response;
    } catch (error) {
      console.error('❌ Get profile failed:', error.response?.data);
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      console.log('✏️ Updating profile');
      const response = await api.put('/auth/profile', data);
      console.log('✅ Profile updated');
      return response;
    } catch (error) {
      console.error('❌ Update profile failed:', error.response?.data);
      throw error;
    }
  },

  changePassword: async (data) => {
    try {
      console.log('🔑 Changing password');
      const response = await api.post('/auth/change-password', data);
      console.log('✅ Password changed');
      return response;
    } catch (error) {
      console.error('❌ Change password failed:', error.response?.data);
      throw error;
    }
  },
};

// ============================================
// CART API
// ============================================
export const cartAPI = {
  getCart: async () => {
    try {
      console.log('🛒 Getting cart');
      const response = await api.get('/cart');
      return response;
    } catch (error) {
      console.error('❌ Get cart failed:', error.response?.data);
      throw error;
    }
  },

  addToCart: async (productData) => {
    try {
      console.log('➕ Adding to cart:', productData);
      const response = await api.post('/cart', productData);
      console.log('✅ Added to cart');
      return response;
    } catch (error) {
      console.error('❌ Add to cart failed:', error.response?.data);
      throw error;
    }
  },

  updateCartItem: async (productId, quantity) => {
    try {
      console.log(`🔄 Updating cart item ${productId} to quantity ${quantity}`);
      const response = await api.put(`/cart/${productId}`, { quantity });
      return response;
    } catch (error) {
      console.error('❌ Update cart failed:', error.response?.data);
      throw error;
    }
  },

  removeFromCart: async (productId) => {
    try {
      console.log(`🗑️ Removing from cart: ${productId}`);
      const response = await api.delete(`/cart/${productId}`);
      return response;
    } catch (error) {
      console.error('❌ Remove from cart failed:', error.response?.data);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      console.log('🧹 Clearing cart');
      const response = await api.delete('/cart');
      return response;
    } catch (error) {
      console.error('❌ Clear cart failed:', error.response?.data);
      throw error;
    }
  },
};

// ============================================
// ORDER API
// ============================================
export const orderAPI = {
  createOrder: async (orderData) => {
    try {
      console.log('📦 Creating order');
      const response = await api.post('/orders', orderData);
      console.log('✅ Order created:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Create order failed:', error.response?.data);
      throw error;
    }
  },

  getOrders: async (filters = {}) => {
    try {
      console.log('📋 Getting orders');
      const response = await api.get('/orders', { params: filters });
      return response;
    } catch (error) {
      console.error('❌ Get orders failed:', error.response?.data);
      throw error;
    }
  },

  getOrderById: async (id) => {
    try {
      console.log(`📄 Getting order ${id}`);
      const response = await api.get(`/orders/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Get order by ID failed:', error.response?.data);
      throw error;
    }
  },

  cancelOrder: async (id, reason) => {
    try {
      console.log(`❌ Cancelling order ${id}`);
      const response = await api.post(`/orders/${id}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error('❌ Cancel order failed:', error.response?.data);
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      console.log(`🔄 Updating order ${id} status to ${status}`);
      const response = await api.put(`/orders/${id}`, { orderStatus: status });
      return response;
    } catch (error) {
      console.error('❌ Update order status failed:', error.response?.data);
      throw error;
    }
  },
};

// ============================================
// PRODUCT API
// ============================================
export const productAPI = {
  getProducts: async (params = {}) => {
    try {
      console.log('📱 Getting products', params);
      const response = await api.get('/products', { params });
      return response;
    } catch (error) {
      console.error('❌ Get products failed:', error.response?.data);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      console.log(`📱 Getting product ${id}`);
      const response = await api.get(`/products/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Get product failed:', error.response?.data);
      throw error;
    }
  },

  getFeaturedProducts: async () => {
    try {
      console.log('⭐ Getting featured products');
      const response = await api.get('/products/featured');
      return response;
    } catch (error) {
      console.error('❌ Get featured products failed:', error.response?.data);
      throw error;
    }
  },

  getBrands: async () => {
    try {
      console.log('🏷️ Getting brands');
      const response = await api.get('/products/brands');
      return response;
    } catch (error) {
      console.error('❌ Get brands failed:', error.response?.data);
      throw error;
    }
  },

  getProductsByBrand: async (brand, params = {}) => {
    try {
      console.log(`🏷️ Getting products by brand: ${brand}`);
      const response = await api.get(`/products/brand/${brand}`, { params });
      return response;
    } catch (error) {
      console.error('❌ Get products by brand failed:', error.response?.data);
      throw error;
    }
  },

  searchProducts: async (query, params = {}) => {
    try {
      console.log(`🔍 Searching products: ${query}`);
      const response = await api.get('/products/search', { 
        params: { query, ...params } 
      });
      return response;
    } catch (error) {
      console.error('❌ Search products failed:', error.response?.data);
      throw error;
    }
  },

  // Admin routes
  createProduct: async (data) => {
    try {
      console.log('➕ Creating product');
      const response = await api.post('/products', data);
      return response;
    } catch (error) {
      console.error('❌ Create product failed:', error.response?.data);
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    try {
      console.log(`✏️ Updating product ${id}`);
      const response = await api.put(`/products/${id}`, data);
      return response;
    } catch (error) {
      console.error('❌ Update product failed:', error.response?.data);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      console.log(`🗑️ Deleting product ${id}`);
      const response = await api.delete(`/products/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Delete product failed:', error.response?.data);
      throw error;
    }
  },
};

// ============================================
// CHAT API
// ============================================
export const chatAPI = {
  sendMessage: async (message) => {
    try {
      console.log('💬 Sending chat message');
      const response = await api.post('/chat/message', { message });
      return response;
    } catch (error) {
      console.error('❌ Send message failed:', error.response?.data);
      throw error;
    }
  },

  getChatHistory: async () => {
    try {
      console.log('📜 Getting chat history');
      const response = await api.get('/chat/history');
      return response;
    } catch (error) {
      console.error('❌ Get chat history failed:', error.response?.data);
      throw error;
    }
  },

  clearChatHistory: async () => {
    try {
      console.log('🧹 Clearing chat history');
      const response = await api.delete('/chat/history');
      return response;
    } catch (error) {
      console.error('❌ Clear chat history failed:', error.response?.data);
      throw error;
    }
  },
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  login: async (data) => {
    try {
      console.log('🔐 Admin login:', data.email);
      const response = await api.post('/admin/auth/login', data);
      return response;
    } catch (error) {
      console.error('❌ Admin login failed:', error.response?.data);
      throw error;
    }
  },

  getDashboard: async () => {
    try {
      console.log('📊 Getting admin dashboard');
      const response = await api.get('/admin/dashboard/overview');
      return response;
    } catch (error) {
      console.error('❌ Get dashboard failed:', error.response?.data);
      throw error;
    }
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Extract data from response
export const extractData = (response) => {
  if (response.data?.success && response.data?.data) {
    return response.data.data;
  }
  if (response.data?.data) {
    return response.data.data;
  }
  return response.data;
};

// Handle API errors
export const handleAPIError = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map(e => e.msg || e.message).join(', ');
  }
  if (error.message === 'Network Error') {
    return 'Cannot connect to server. Please check if backend is running.';
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

// Health check
export const checkAPIHealth = async () => {
  try {
    console.log('❤️ Checking API health');
    const response = await api.get('/health');
    console.log('💚 API Health OK:', response.data);
    return { healthy: true, data: response.data };
  } catch (error) {
    console.error('❌ API Health check failed:', error.message);
    return { healthy: false, error: error.message };
  }
};

export default api;