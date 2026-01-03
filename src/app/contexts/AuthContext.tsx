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
  isAuthenticating: boolean; // 🔥 НОВОЕ: показываем LoadingScreen
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
  const [isAuthenticating, setIsAuthenticating] = useState(false); // 🔥 НОВОЕ: показываем LoadingScreen
  const [error, setError] = useState<string | null>(null);

  /**
   * Auto-login при загрузке приложения
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = getSessionToken();
      
      if (!token) {
        console.log('🔐 [AuthContext] No saved token found');
        setIsLoading(false);
        return;
      }

      console.log('🔐 [AuthContext] Found saved token, validating...');

      // Пытаемся загрузить профиль
      try {
        const response = await fetch(API_ENDPOINTS.getProfile, {
          headers: getAuthHeaders(),
        });

        console.log('📡 [AuthContext] Profile validation response:', response.status);

        if (!response.ok) {
          console.log('❌ [AuthContext] Token invalid (status:', response.status, ')');
          throw new Error('Failed to load profile');
        }

        const data: GetProfileResponse = await response.json();

        if (data.success && data.profile) {
          console.log('✅ [AuthContext] Session restored successfully!');
          setProfile(data.profile);
          setIsAuthenticated(true);
        } else {
          console.log('❌ [AuthContext] Invalid profile response:', data);
          // Токен невалиден
          clearSessionToken();
        }
      } catch (err) {
        console.error('❌ [AuthContext] Auto-login failed:', err);
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
    // Защита от повторных вызовов
    if (isAuthenticating) {
      console.log('⚠️ [AuthContext] Login already in progress, ignoring duplicate call');
      return false;
    }

    console.log('🔐 [AuthContext] Login attempt:', { login });
    console.log('🔐 [AuthContext] Setting isAuthenticating = true');
    setIsAuthenticating(true);
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
          console.log('🔑 [AuthContext] Using token for profile fetch:', sessionData.session_token);
          
          // ⏱️ Добавляем таймаут для fetch запроса
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('⏰ [AuthContext] Profile fetch timeout! Aborting...');
            controller.abort();
          }, 95000); // 95 секунд таймаут (синхронизировано с backend SmartShell API 90s + запас)
          
          console.log('📤 [AuthContext] Sending profile fetch request to:', API_ENDPOINTS.getProfile);
          
          const profileResponse = await fetch(API_ENDPOINTS.getProfile, {
            headers: {
              'Authorization': `Bearer ${sessionData.session_token}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId); // Очищаем таймаут если запрос успешен

          console.log('📥 [AuthContext] Profile fetch status:', profileResponse.status);
          console.log('📥 [AuthContext] Profile fetch headers sent:', {
            'Authorization': `Bearer ${sessionData.session_token.substring(0, 20)}...`,
          });

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
      
      // 🎮 Показываем экран загрузки минимум 2.5 секунды (как в CS2)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      console.log('✅ [AuthContext] Loading complete, setting isAuthenticating = false');
      
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      console.error('💥 [AuthContext] Login error:', err);
      setError(errorMsg);
      return false;
    } finally {
      console.log('🔚 [AuthContext] Finally block - setting isAuthenticating = false');
      setIsAuthenticating(false);
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
    isAuthenticating,
    error,
    login,
    logout,
    refreshProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};