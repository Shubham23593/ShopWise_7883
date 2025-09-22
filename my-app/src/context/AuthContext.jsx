import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, getStoredUser, clearTokens } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is stored in localStorage
        const storedUser = getStoredUser();
        const accessToken = localStorage.getItem('accessToken');
        
        if (storedUser && accessToken) {
          // Verify the token is still valid by fetching current user
          try {
            const response = await authAPI.getCurrentUser();
            setUser(response.user);
          } catch (error) {
            // Token is invalid, clear storage
            clearTokens();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (email, otp, type = 'signup') => {
    try {
      const response = await authAPI.verifyOTP(email, otp, type);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        signup, 
        verifyOTP, 
        logout, 
        updateUser 
      }}
    >
      {!loading && children}
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
