import axios from 'axios';
import { getAdminToken } from './adminAuth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminAPI = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
adminAPI.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle responses
adminAPI.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  }
  return Promise.reject(error);
});

// ============================================
// ADMIN AUTH ENDPOINTS
// ============================================

export const adminAuthAPI = {
  login: (email, password) => 
    adminAPI.post('/auth/login', { email, password }),
  
  getProfile: () => 
    adminAPI.get('/auth/profile'),
  
  updateProfile: (data) => 
    adminAPI.put('/auth/profile', data),
  
  changePassword: (currentPassword, newPassword) => 
    adminAPI.post('/auth/change-password', { currentPassword, newPassword })
};

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

export const dashboardAPI = {
  getOverview: () => 
    adminAPI.get('/dashboard/overview'),
  
  getSalesChart: (period = 'monthly') => 
    adminAPI.get(`/dashboard/sales-chart?period=${period}`)
};

// ============================================
// PRODUCT ENDPOINTS
// ============================================

export const productAPI = {
  getAll: (page = 1, limit = 10, search = '') => 
    adminAPI.get(`/products?page=${page}&limit=${limit}&search=${search}`),
  
  add: (data) => 
    adminAPI.post('/products', data),
  
  edit: (id, data) => 
    adminAPI.put(`/products/${id}`, data),
  
  delete: (id) => 
    adminAPI.delete(`/products/${id}`)
};

// ============================================
// ORDER ENDPOINTS
// ============================================

export const orderAPI = {
  getAll: (page = 1, limit = 10, status = '', search = '') => 
    adminAPI.get(`/orders?page=${page}&limit=${limit}&status=${status}&search=${search}`),
  
  getDetails: (id) => 
    adminAPI.get(`/orders/${id}`),
  
  updateStatus: (id, data) => 
    adminAPI.put(`/orders/${id}`, data),
  
  cancel: (id, reason) => 
    adminAPI.post(`/orders/${id}/cancel`, { reason }),
  
  generateInvoice: (id) => 
    adminAPI.get(`/orders/${id}/invoice`)
};

// ============================================
// USER ENDPOINTS
// ============================================

export const userAPI = {
  getAll: (page = 1, limit = 10, search = '', status = '') => 
    adminAPI.get(`/users?page=${page}&limit=${limit}&search=${search}&status=${status}`),
  
  getProfile: (id) => 
    adminAPI.get(`/users/${id}`),
  
  block: (id, reason) => 
    adminAPI.post(`/users/${id}/block`, { reason }),
  
  unblock: (id) => 
    adminAPI.post(`/users/${id}/unblock`),
  
  delete: (id) => 
    adminAPI.delete(`/users/${id}`),
  
  getOrderHistory: (id, page = 1, limit = 10) => 
    adminAPI.get(`/users/${id}/orders?page=${page}&limit=${limit}`)
};

// ============================================
// BRAND ENDPOINTS
// ============================================

export const brandAPI = {
  getAll: (page = 1, limit = 10, search = '') => 
    adminAPI.get(`/brands?page=${page}&limit=${limit}&search=${search}`),
  
  add: (data) => 
    adminAPI.post('/brands', data),
  
  edit: (id, data) => 
    adminAPI.put(`/brands/${id}`, data),
  
  delete: (id) => 
    adminAPI.delete(`/brands/${id}`),
  
  setFeatured: (id, isFeatured) => 
    adminAPI.post(`/brands/${id}/featured`, { isFeatured })
};

export default {
  adminAuthAPI,
  dashboardAPI,
  productAPI,
  orderAPI,
  userAPI,
  brandAPI
};