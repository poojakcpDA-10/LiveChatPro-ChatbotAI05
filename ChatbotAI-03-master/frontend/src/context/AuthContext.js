import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/auth.js';
import { disconnectSocket } from '../services/socket.js';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      localStorage.removeItem('salesUser');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  const login = async (credentials, isSales = false) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const endpoint = isSales ? '/sales/login' : '/login';
      const response = await authAPI.loginTo(endpoint, credentials);
      
      // Store additional data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', isSales ? 'sales' : 'user');
      localStorage.setItem(isSales ? 'salesUser' : 'user', JSON.stringify(response.data.user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.response?.data?.message || 'Login failed'
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.register(userData);
      
      // Store user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'user');
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user: response.data.user, 
          token: response.data.token 
        } 
      });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: error.response?.data?.message || 'Registration failed' 
      });
      throw error;
    }
  };
  
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    disconnectSocket(); 
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.verifyToken();
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { 
              user: response.data.user, 
              token: token 
            } 
          });
        } catch (error) {
          console.error('Token verification failed:', error);
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      clearError: () => dispatch({ type: 'CLEAR_ERROR' })
    }}>
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