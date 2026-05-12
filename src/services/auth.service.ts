import { axiosInstance } from './api';
import type { User, AuthResponse } from '../types/auth.types';

export const AuthService = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', {
      ...credentials,
      role: 'HR',
    });
    
    if (response.data.user.role !== 'HR') {
      throw new Error('Unauthorized: Only HR users can access this portal');
    }
    
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      localStorage.removeItem('user');
    }
  },

  forgotPassword: async (email: string): Promise<any> => {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email,
      portal: 'HR',
    });
    return response.data;
  },

  verifyOtp: async (email: string, otp: string): Promise<any> => {
    const response = await axiosInstance.post('/auth/verify-otp', {
      email,
      otp,
    });
    return response.data;
  },

  resetPassword: async (tempToken: string, newPassword: string): Promise<any> => {
    const response = await axiosInstance.post(`/auth/reset-password/${tempToken}`, {
      newPassword,
    });
    return response.data;
  },
};
