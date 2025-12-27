/**
 * Auth Context
 * Единый источник данных для авторизации и профиля пользователя
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserProfile, 
  CreateSessionRequest, 
  CreateSessionResponse, 
  GetProfileResponse,
  LogoutResponse,
  ErrorResponse 
} from '../../types/api';
import { 
  API_ENDPOINTS, 
  getSessionToken, 
  setSessionToken, 
  clearSessionToken, 
  getAuthHeaders 
} from '../../config/api';

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Автозагрузка профиля при старте приложения
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = getSessionToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Пытаемся загрузить профиль
      try {
        const response = await fetch(API_ENDPOINTS.getProfile, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error('Failed to load profile');
        }

        const data: GetProfileResponse = await response.json();

        if (data.success && data.profile) {
          setProfile(data.profile);
          setIsAuthenticated(true);
        } else {
          // Токен невалиден
          clearSessionToken();
        }
      } catch (err) {
        console.error('Auto-login failed:', err);
        clearSessionToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Логин пользователя
   */
  const login = async (login: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: CreateSessionRequest = { login, password };
      
      const response = await fetch(API_ENDPOINTS.createSession, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: CreateSessionResponse | ErrorResponse = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = 'error' in data ? data.error : 'Login failed';
        setError(errorMsg);
        return false;
      }

      // Успешная авторизация
      const sessionData = data as CreateSessionResponse;
      
      setSessionToken(sessionData.session_token);
      setProfile(sessionData.profile);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout пользователя
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const token = getSessionToken();
      
      if (token) {
        await fetch(API_ENDPOINTS.logout, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Всегда очищаем локальное состояние
      clearSessionToken();
      setProfile(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  /**
   * Обновление профиля (для кнопки Refresh)
   */
  const refreshProfile = async (): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(API_ENDPOINTS.getProfile, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh profile');
      }

      const data: GetProfileResponse = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Refresh profile error:', err);
      setError('Failed to refresh profile');
    }
  };

  /**
   * Очистка ошибки
   */
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    profile,
    isLoading,
    error,
    login,
    logout,
    refreshProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
