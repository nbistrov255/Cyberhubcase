import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  Box, 
  FileText, 
  AlertTriangle, 
  Users, 
  FileSearch, 
  Settings,
  Search,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  Globe,
  Lock,
  X,
  Save
} from 'lucide-react';
import { AdminPage, AdminUser } from '../AdminApp';
import { useAdminLanguage, AdminLanguage } from '../contexts/AdminLanguageContext';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  currentUser: AdminUser;
  onLogout: () => void;
  language: AdminLanguage;
  onLanguageChange: (lang: AdminLanguage) => void;
}

export function AdminLayout({
  children,
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  language,
  onLanguageChange,
}: AdminLayoutProps) {
  const { t } = useAdminLanguage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Загрузка количества заявок
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const token = localStorage.getItem('session_token');
        const response = await fetch('/api/admin/requests?status=pending', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setPendingRequestsCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        // Не показываем ошибку пользователю, просто оставляем 0
      }
    };

    fetchPendingRequests();
    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchPendingRequests, 30000);
    
    return () => clearInterval(interval);
  }, []);

  interface MenuItem {
    id: AdminPage;
    label: string;
    icon: any;
    badge?: number;
    ownerOnly?: boolean;
  }

  const menuItems: MenuItem[] = [
    { id: 'dashboard' as AdminPage, label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { id: 'items' as AdminPage, label: t('sidebar.items'), icon: Package },
    { id: 'cases' as AdminPage, label: t('sidebar.cases'), icon: Box },
    { id: 'requests' as AdminPage, label: t('sidebar.requests'), icon: FileText, badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined },
    { id: 'problem-queue' as AdminPage, label: t('sidebar.problemQueue'), icon: AlertTriangle },
    { id: 'users' as AdminPage, label: t('sidebar.users'), icon: Users, ownerOnly: true },
    { id: 'logs' as AdminPage, label: t('sidebar.logs'), icon: FileSearch },
    { id: 'settings' as AdminPage, label: t('sidebar.settings'), icon: Settings, ownerOnly: true },
  ];

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => {
    if (item.ownerOnly && currentUser.role !== 'owner') {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex" style={{ background: '#17171c' }}>
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarCollapsed ? '80px' : '260px' }}
        className="relative flex flex-col"
        style={{
          background: '#1d1d22',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          {!sidebarCollapsed && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold"
              style={{ color: '#7c2d3a' }}
            >
              CyberHub
            </motion.h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: '#25252a' }}
          >
            <ChevronLeft 
              className="w-5 h-5 text-white transition-transform" 
              style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0)' }}
            />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative"
                style={{
                  background: isActive ? '#7c2d3a' : 'transparent',
                  color: isActive ? '#ffffff' : '#9ca3af',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#25252a';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
                {item.badge && item.badge > 0 && (
                  <div
                    className="absolute right-2 top-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#dc2626', color: '#ffffff' }}
                  >
                    {item.badge}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div
          className="h-20 flex items-center justify-between px-8 border-b"
          style={{
            background: '#1d1d22',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('topbar.search')}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg outline-none transition-all"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c2d3a';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: '#25252a' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
              >
                <Globe className="w-5 h-5 text-gray-300" />
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowLangMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 w-32 rounded-lg overflow-hidden z-50"
                      style={{
                        background: '#1d1d22',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {(['en', 'ru', 'lv'] as AdminLanguage[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            onLanguageChange(lang);
                            setShowLangMenu(false);
                          }}
                          className="w-full px-4 py-2.5 text-left transition-colors"
                          style={{
                            background: language === lang ? '#7c2d3a' : 'transparent',
                            color: language === lang ? '#ffffff' : '#9ca3af',
                          }}
                          onMouseEnter={(e) => {
                            if (language !== lang) e.currentTarget.style.background = '#25252a';
                          }}
                          onMouseLeave={(e) => {
                            if (language !== lang) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: '#25252a' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5 text-gray-300" />
                {pendingRequestsCount > 0 && (
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#dc2626', color: '#ffffff' }}
                  >
                    {pendingRequestsCount}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 w-96 rounded-lg overflow-hidden z-50"
                      style={{
                        background: '#1d1d22',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {/* Header */}
                      <div 
                        className="px-4 py-3 border-b"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                      >
                        <h3 className="font-bold text-white">Notifications</h3>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {/* Pending Requests Notification */}
                        <button
                          onClick={() => {
                            onNavigate('requests');
                            setShowNotifications(false);
                          }}
                          className="w-full px-4 py-3 text-left transition-colors border-b"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#25252a'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: '#f59e0b20' }}
                            >
                              <FileText className="w-5 h-5" style={{ color: '#f59e0b' }} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">
                                {pendingRequestsCount} Pending Requests
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Review and approve customer claims
                              </p>
                              <p className="text-xs text-gray-500 mt-1">5 min ago</p>
                            </div>
                          </div>
                        </button>

                        {/* Problem Cases Notification */}
                        <button
                          onClick={() => {
                            onNavigate('problem-queue');
                            setShowNotifications(false);
                          }}
                          className="w-full px-4 py-3 text-left transition-colors border-b"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#25252a'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: '#ef444420' }}
                            >
                              <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">
                                2 Problem Cases
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Cases requiring immediate attention
                              </p>
                              <p className="text-xs text-gray-500 mt-1">15 min ago</p>
                            </div>
                          </div>
                        </button>

                        {/* Low Stock Notification */}
                        <button
                          onClick={() => {
                            onNavigate('items');
                            setShowNotifications(false);
                          }}
                          className="w-full px-4 py-3 text-left transition-colors"
                          onMouseEnter={(e) => e.currentTarget.style.background = '#25252a'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: '#8b5cf620' }}
                            >
                              <Package className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">
                                8 Items Low Stock
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Restock items to maintain availability
                              </p>
                              <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Footer */}
                      <div 
                        className="px-4 py-3 border-t text-center"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                      >
                        <button
                          onClick={() => {
                            onNavigate('logs');
                            setShowNotifications(false);
                          }}
                          className="text-sm font-medium transition-colors"
                          style={{ color: '#7c2d3a' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#a33d4d'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#7c2d3a'}
                        >
                          View All Activity
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors"
                style={{ background: '#25252a' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#7c2d3a' }}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{currentUser.username}</p>
                  <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-14 w-48 rounded-lg overflow-hidden z-50"
                      style={{
                        background: '#1d1d22',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowPasswordModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors border-b"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: '#9ca3af' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#25252a'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">Change Password</span>
                      </button>
                      <button
                        onClick={() => {
                          onLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors text-red-400"
                        onMouseEnter={(e) => e.currentTarget.style.background = '#25252a'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('topbar.logout')}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordError('');
              }}
              className="absolute inset-0"
              style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-xl overflow-hidden"
              style={{
                background: '#1d1d22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-6"
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h2 className="text-2xl font-bold text-white">Change Password</h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError('');
                  }}
                  className="p-2 rounded-lg transition-all"
                  style={{ background: '#25252a' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2d2d32';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#25252a';
                  }}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  
                  // Validation
                  if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
                    setPasswordError('All fields are required');
                    return;
                  }
                  
                  if (passwordData.newPassword !== passwordData.confirmPassword) {
                    setPasswordError('New passwords do not match');
                    return;
                  }
                  
                  if (passwordData.newPassword.length < 6) {
                    setPasswordError('Password must be at least 6 characters');
                    return;
                  }
                  
                  // Mock password change (replace with actual API call)
                  console.log('Password changed successfully');
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                  alert('Password changed successfully!');
                }}
                className="p-6"
              >
                <div className="space-y-4">
                  {/* Error Message */}
                  {passwordError && (
                    <div
                      className="p-3 rounded-lg text-sm"
                      style={{
                        background: '#ef444420',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                      }}
                    >
                      {passwordError}
                    </div>
                  )}

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, currentPassword: e.target.value });
                        setPasswordError('');
                      }}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2.5 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, newPassword: e.target.value });
                        setPasswordError('');
                      }}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2.5 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                        setPasswordError('');
                      }}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                    }}
                    className="px-6 py-2.5 rounded-lg font-medium transition-all"
                    style={{
                      background: '#25252a',
                      color: '#ffffff',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2d2d32';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#25252a';
                    }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium"
                    style={{
                      background: '#7c2d3a',
                      color: '#ffffff',
                    }}
                  >
                    <Save className="w-5 h-5" />
                    Save Password
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}