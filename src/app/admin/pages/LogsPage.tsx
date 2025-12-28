import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';
import { toast } from 'sonner';

interface Log {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  details: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface LogsPageProps {
  userRole: UserRole;
}

export function LogsPage({ userRole }: LogsPageProps) {
  const { t } = useAdminLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | Log['type']>('all');
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('session_token');
      
      const response = await fetch('/api/admin/logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      
      // Преобразуем данные из API
      const formattedLogs = (data || []).map((log: any) => ({
        id: log.id,
        timestamp: new Date(log.timestamp || log.created_at),
        user: log.user || log.username || 'System',
        action: log.action || 'Unknown action',
        details: log.details || '',
        type: log.type || 'info',
      }));

      setLogs(formattedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load logs');
      setLogs([]); // Пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const typeColors = {
    info: '#3b82f6',
    warning: '#f59e0b',
    error: '#ef4444',
    success: '#10b981',
  };

  const filteredLogs = (logs || []).filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === 'all' || log.type === filterType;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading logs...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('logs.title')}</h1>
        <p className="text-gray-400">{t('logs.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1d1d22] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#7c2d3a] focus:outline-none"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 bg-[#1d1d22] border border-white/10 rounded-lg text-white focus:border-[#7c2d3a] focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="success">Success</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1d1d22', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {logs.length === 0 ? 'No logs available yet' : 'No logs match your search'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Timestamp</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Action</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Details</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-gray-300 text-sm">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="p-4 text-white font-medium">{log.user}</td>
                    <td className="p-4 text-gray-300">{log.action}</td>
                    <td className="p-4 text-gray-400 text-sm">{log.details}</td>
                    <td className="p-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: `${typeColors[log.type]}20`,
                          color: typeColors[log.type],
                        }}
                      >
                        {log.type.toUpperCase()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
