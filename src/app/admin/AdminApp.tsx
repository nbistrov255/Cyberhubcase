import { useState } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ItemsPage } from './pages/ItemsPage';
import { CasesPage } from './pages/CasesPage';
import { RequestsPage } from './pages/RequestsPage';
import { ProblemQueuePage } from './pages/ProblemQueuePage';
import { UsersPage } from './pages/UsersPage';
import { LogsPage } from './pages/LogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminLanguageProvider } from './contexts/AdminLanguageContext';
// ✅ ДОБАВЛЕН ИМПОРТ WebSocketProvider
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { toast } from 'sonner';

export type AdminPage = 
  | 'login'
  | 'dashboard'
  | 'items'
  | 'cases'
  | 'requests'
  | 'problem-queue'
  | 'users'
  | 'logs'
  | 'settings';

export type UserRole = 'owner' | 'admin' | 'moderator';

export interface AdminUser {
  id: string;
  username: string;
  role: UserRole;
  email: string;
}

export default function AdminApp() {
  const [currentPage, setCurrentPage] = useState<AdminPage>('login');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [adminLanguage, setAdminLanguage] = useState<'en' | 'ru' | 'lv'>('en');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    try {
      setIsLoggingIn(true);
      console.log('🔐 [AdminApp] Attempting admin login...');
      
      // ✅ Реальная авторизация через backend /api/admin/login
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      console.log('📡 [AdminApp] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();
      console.log('✅ [AdminApp] Login response:', data);

      if (data.success && data.session_token) {
        // Сохраняем токен в localStorage
        localStorage.setItem('session_token', data.session_token);
        console.log('💾 [AdminApp] Token saved to localStorage');

        // Устанавливаем пользователя
        setCurrentUser({
          id: data.user_id || 'admin-id',
          username: data.username || username,
          role: data.role || 'owner',
          email: data.email || 'admin@cyberhub.com',
        });
        
        setCurrentPage('dashboard');
        toast.success(`Welcome back, ${data.username}!`);
        
        console.log('✅ [AdminApp] Login successful');
        console.log('🔑 [AdminApp] Token:', data.session_token.substring(0, 20) + '...');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ [AdminApp] Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 [AdminApp] Logging out...');
    localStorage.removeItem('session_token');
    setCurrentUser(null);
    setCurrentPage('login');
    toast.success('Logged out successfully');
  };

  return (
    <WebSocketProvider>
      <AdminLanguageProvider>
        {(currentPage === 'login' || !currentUser) ? (
          <LoginPage onLogin={handleLogin} isLoggingIn={isLoggingIn} />
        ) : (
          <AdminLayout
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            currentUser={currentUser}
            onLogout={handleLogout}
            language={adminLanguage}
            onLanguageChange={setAdminLanguage}
          >
            {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
            {currentPage === 'items' && <ItemsPage userRole={currentUser.role} />}
            {currentPage === 'cases' && <CasesPage userRole={currentUser.role} />}
            {currentPage === 'requests' && <RequestsPage userRole={currentUser.role} />}
            {currentPage === 'problem-queue' && <ProblemQueuePage userRole={currentUser.role} />}
            {currentPage === 'users' && <UsersPage userRole={currentUser.role} />}
            {currentPage === 'logs' && <LogsPage userRole={currentUser.role} />}
            {currentPage === 'settings' && <SettingsPage userRole={currentUser.role} />}
          </AdminLayout>
        )}
      </AdminLanguageProvider>
    </WebSocketProvider>
  );
}