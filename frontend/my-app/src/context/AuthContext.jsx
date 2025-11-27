import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      console.log('🔍 Checking auth, token:', storedToken ? 'exists' : 'none');
      
      if (storedToken) {
        setToken(storedToken);
        // Try to fetch profile
        try {
          const response = await api.get('/auth/profile', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          console.log('✅ Profile fetched:', response.data);
          setUser(response.data.data || response.data.user);
        } catch (profileError) {
          console.error('❌ Profile fetch failed:', profileError);
          // Token is invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login:', email);
      
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      console.log('📦 Login response:', response.data);
      
      if (response.data.success) {
        // Store token
        const newToken = response.data.data?.token || response.data.token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          setToken(newToken);
          console.log('✅ Token stored');
        }
        
        // Set user
        const userData = response.data.data?.user || response.data.user || response.data.data;
        setUser(userData);
        console.log('✅ User set:', userData);
        
        return { success: true, data: response.data };
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      console.log('📝 Attempting register:', email);
      
      const response = await api.post('/auth/register', {
        name,
        email,
        phone,
        password
      });
      
      console.log('📦 Register response:', response.data);
      
      if (response.data.success) {
        // Store token
        const newToken = response.data.data?.token || response.data.token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          setToken(newToken);
          console.log('✅ Token stored');
        }
        
        // Set user
        const userData = response.data.data?.user || response.data.user || response.data.data;
        setUser(userData);
        console.log('✅ User set:', userData);
        
        return { success: true, data: response.data };
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      console.error('❌ Register error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    console.log('👋 Logging out...');
    localStorage.removeItem('token');
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token
  };

  console.log('🔐 Auth Context State:', { 
    user: user?.name || 'none', 
    loading, 
    isAuthenticated: !!user 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;