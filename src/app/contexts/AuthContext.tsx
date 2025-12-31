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
    console.log('🔐 [AuthContext] Login attempt:', { login });
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: CreateSessionRequest = { login, password };
      
      console.log('📤 [AuthContext] Sending login request to:', API_ENDPOINTS.createSession);
      
      const response = await fetch(API_ENDPOINTS.createSession, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 [AuthContext] Login response status:', response.status);

      const data: CreateSessionResponse | ErrorResponse = await response.json();
      console.log('📦 [AuthContext] Login response data:', data);
      console.log('📦 [AuthContext] Login response data (JSON):', JSON.stringify(data, null, 2));

      if (!response.ok || !data.success) {
        const errorMsg = 'error' in data ? data.error : 'Login failed';
        console.error('❌ [AuthContext] Login failed:', errorMsg);
        setError(errorMsg);
        return false;
      }

      // Успешная авторизация
      const sessionData = data as CreateSessionResponse;
      
      console.log('✅ [AuthContext] Login successful!');
      console.log('🔑 [AuthContext] Session token:', sessionData.session_token);
      console.log('👤 [AuthContext] Profile (sessionData.profile):', sessionData.profile);
      console.log('👤 [AuthContext] User (sessionData.user):', (sessionData as any).user);
      console.log('👤 [AuthContext] Data object (sessionData.data):', (sessionData as any).data);
      console.log('📋 [AuthContext] All keys in response:', Object.keys(sessionData));
      
      // ✅ ИСПРАВЛЕНИЕ: Сохраняем токен СРАЗУ
      setSessionToken(sessionData.session_token);
      
      // ✅ ИСПРАВЛЕНИЕ: Пробуем разные варианты структуры профиля
      const profile = sessionData.profile || (sessionData as any).user || (sessionData as any).data?.profile || (sessionData as any).data?.user;
      
      console.log('🎯 [AuthContext] Resolved profile:', profile);
      
      // ✅ НОВАЯ ЛОГИКА: Если профиль не пришел в ответе - загружаем отдельно
      if (profile) {
        setProfile(profile);
        setIsAuthenticated(true);
        console.log('💾 [AuthContext] State updated - isAuthenticated: true, profile:', profile);
      } else {
        console.log('⚠️ [AuthContext] Profile not in login response, fetching separately...');
        
        // Загружаем профиль отдельным запросом
        try {
          const profileResponse = await fetch(API_ENDPOINTS.getProfile, {
            headers: getAuthHeaders(),
          });

          console.log('📥 [AuthContext] Profile fetch status:', profileResponse.status);

          if (!profileResponse.ok) {
            throw new Error('Failed to fetch profile');
          }

          const profileData: GetProfileResponse = await profileResponse.json();
          console.log('📦 [AuthContext] Profile data:', profileData);

          if (profileData.success && profileData.profile) {
            setProfile(profileData.profile);
            setIsAuthenticated(true);
            console.log('✅ [AuthContext] Profile loaded successfully:', profileData.profile);
          } else {
            throw new Error('Invalid profile response');
          }
        } catch (profileErr) {
          console.error('❌ [AuthContext] Failed to load profile:', profileErr);
          // Откатываем авторизацию если не удалось загрузить профиль
          clearSessionToken();
          setError('Failed to load profile');
          return false;
        }
      }
      
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      console.error('💥 [AuthContext] Login error:', err);
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