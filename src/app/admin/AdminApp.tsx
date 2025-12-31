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

  const handleLogin = (username: string, password: string) => {
    // Временно отключена проверка пароля для настройки админки
    // TODO: Включить обратно когда будет система ролей в БД
    if (username) {
      setCurrentUser({
        id: '1',
        username,
        role: 'owner',
        email: 'admin@cyberhub.com',
      });
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  return (
    <WebSocketProvider>
      <AdminLanguageProvider>
        {(currentPage === 'login' || !currentUser) ? (
          <LoginPage onLogin={handleLogin} />
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