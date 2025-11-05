// ============================================
// FILE: client/src/services/auth.service.ts
// ============================================
import { api } from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: any;
    token: string;
  };
  message?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async getProfile(): Promise<any> {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

// ============================================
// FILE: client/src/hooks/useAuth.ts
// ============================================
import { useState } from 'react';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      setUser(response.data.user);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};