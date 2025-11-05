// ============================================
// FILE: client/src/hooks/useAuth.ts
// ============================================
import { useState, useEffect } from 'react';
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