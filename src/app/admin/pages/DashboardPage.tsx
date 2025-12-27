import { motion } from 'motion/react';
import { TrendingUp, FileText, AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { AdminPage } from '../AdminApp';

interface DashboardPageProps {
  onNavigate?: (page: AdminPage) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { t } = useAdminLanguage();

  const stats = [
    {
      label: t('dashboard.casesOpened'),
      value: '1,234',
      change: '+12%',
      period: t('dashboard.today'),
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      label: t('dashboard.pendingRequests'),
      value: '5',
      change: '',
      period: '',
      icon: FileText,
      color: '#f59e0b',
    },
    {
      label: t('dashboard.problemCases'),
      value: '2',
      change: '-50%',
      period: t('dashboard.thisWeek'),
      icon: AlertTriangle,
      color: '#ef4444',
    },
    {
      label: t('dashboard.lowStock'),
      value: '8',
      change: '+2',
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

  const recentActivity = [
    { user: 'JohnDoe', action: 'Approved request #1234', time: '5 min ago' },
    { user: 'AdminUser', action: 'Updated Case "Daily Gold"', time: '15 min ago' },
    { user: 'JaneSmith', action: 'Added new item "Premium Headset"', time: '1 hour ago' },
    { user: 'Operator1', action: 'Denied request #1230', time: '2 hours ago' },
  ];

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

        {/* Recent Activity */}
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
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
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
                  {activity.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-gray-400">{activity.action}</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}