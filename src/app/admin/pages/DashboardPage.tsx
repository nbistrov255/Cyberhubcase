import { motion } from 'motion/react';
import { TrendingUp, FileText, AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { AdminPage } from '../AdminApp';
import { useEffect, useState } from 'react';
import { getAdminAuthHeaders } from '../utils/adminAuth';

interface DashboardPageProps {
  onNavigate?: (page: AdminPage) => void;
}

interface Drop {
  id: string;
  player_nickname: string;
  prize_name: string;
  case_name: string;
  created_at: string;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { t } = useAdminLanguage();
  const [dashboardData, setDashboardData] = useState({
    casesOpened: 0,
    pendingRequests: 0,
    problemCases: 0,
    lowStock: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Drop[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        
        // Загружаем все данные параллельно
        const [requestsRes, dropsRes] = await Promise.all([
          fetch('/api/admin/requests?status=pending', {
            headers: getAdminAuthHeaders(),
          }),
          fetch('/api/drops/recent', {
            headers: getAdminAuthHeaders(),
          }),
        ]);

        const requests = requestsRes.ok ? await requestsRes.json() : [];
        const dropsData = dropsRes.ok ? await dropsRes.json() : { drops: [] };

        setDashboardData({
          casesOpened: 0, // TODO: Add API endpoint
          pendingRequests: Array.isArray(requests) ? requests.length : 0,
          problemCases: 0, // TODO: Add API endpoint
          lowStock: 0, // TODO: Add API endpoint
        });

        // Загружаем недавние дропы из API
        if (dropsData.success && Array.isArray(dropsData.drops)) {
          setRecentActivity(dropsData.drops.slice(0, 5)); // Берем только 5 последних
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      label: t('dashboard.casesOpened'),
      value: dashboardData.casesOpened.toString(),
      change: '',
      period: t('dashboard.today'),
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      label: t('dashboard.pendingRequests'),
      value: dashboardData.pendingRequests.toString(),
      change: '',
      period: '',
      icon: FileText,
      color: '#f59e0b',
    },
    {
      label: t('dashboard.problemCases'),
      value: dashboardData.problemCases.toString(),
      change: '',
      period: t('dashboard.thisWeek'),
      icon: AlertTriangle,
      color: '#ef4444',
    },
    {
      label: t('dashboard.lowStock'),
      value: dashboardData.lowStock.toString(),
      change: '',
      period: t('dashboard.thisMonth'),
      icon: Package,
      color: '#8b5cf6',
    },
  ];

  const quickActions = [
    { label: t('dashboard.viewRequests'), link: 'requests', color: '#f59e0b' },
    { label: t('dashboard.viewLowStock'), link: 'items', color: '#8b5cf6' },
    { label: t('dashboard.viewProblems'), link: 'problem-queue', color: '#ef4444' },
  ];

  // Функция для форматирования времени
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('dashboard.title')}</h1>
        <p className="text-gray-400">Overview of system status and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl p-6"
              style={{
                background: '#1d1d22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                {stat.change && (
                  <span
                    className="text-sm font-medium px-2 py-1 rounded"
                    style={{
                      background: stat.change.startsWith('+') ? '#10b98120' : '#ef444420',
                      color: stat.change.startsWith('+') ? '#10b981' : '#ef4444',
                    }}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              {stat.period && (
                <p className="text-gray-500 text-xs mt-2">{stat.period}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl p-6"
          style={{
            background: '#1d1d22',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-4 rounded-lg transition-all group"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2d2d32';
                  e.currentTarget.style.borderColor = action.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#25252a';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onClick={() => onNavigate && onNavigate(action.link as AdminPage)}
              >
                <span className="text-white font-medium">{action.label}</span>
                <ArrowRight
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  style={{ color: action.color }}
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity - данные из API */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 rounded-xl p-6"
          style={{
            background: '#1d1d22',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Recent Drops</h2>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No recent activity
              </div>
            ) : (
              (recentActivity || []).map((drop, index) => (
                <div
                  key={drop.id || index}
                  className="flex items-start gap-4 p-4 rounded-lg"
                  style={{
                    background: '#25252a',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                    style={{
                      background: '#7c2d3a',
                      color: '#ffffff',
                    }}
                  >
                    {(drop.player_nickname || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      <span className="font-medium">{drop.player_nickname || 'Anonymous'}</span>{' '}
                      <span className="text-gray-400">won {drop.prize_name || 'Unknown Prize'} from {drop.case_name || 'Mystery Case'}</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{formatTime(drop.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}