import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, RotateCcw, CheckCircle, MessageSquare } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';

interface Problem {
  id: string;
  requestId: string;
  user: string;
  issue: string;
  type: 'error' | 'expired' | 'failed';
  date: Date;
}

interface ProblemQueuePageProps {
  userRole: UserRole;
}

export function ProblemQueuePage({ userRole }: ProblemQueuePageProps) {
  const { t } = useAdminLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | Problem['type']>('all');

  const [problems, setProblems] = useState<Problem[]>([
    {
      id: '1',
      requestId: 'REQ-2024-010',
      user: 'PlayerError',
      issue: 'Failed to deliver item - Steam API error',
      type: 'error',
      date: new Date('2024-12-24'),
    },
    {
      id: '2',
      requestId: 'REQ-2024-008',
      user: 'ExpiredUser',
      issue: 'Request expired after 48 hours',
      type: 'expired',
      date: new Date('2024-12-23'),
    },
  ]);

  const canResolve = ['owner', 'admin', 'operator'].includes(userRole);

  const handleRetry = (problemId: string) => {
    // In real app, this would trigger a retry action
    console.log('Retrying problem:', problemId);
    // Remove from queue after retry
    setProblems(problems.filter(p => p.id !== problemId));
  };

  const handleResolve = (problemId: string) => {
    // Mark as resolved and remove from queue
    console.log('Resolving problem:', problemId);
    setProblems(problems.filter(p => p.id !== problemId));
  };

  const filteredProblems = problems.filter((prob) => {
    const matchesSearch =
      prob.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prob.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prob.issue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || prob.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: Problem['type']) => {
    switch (type) {
      case 'error':
        return { bg: '#ef444420', color: '#ef4444' };
      case 'expired':
        return { bg: '#f59e0b20', color: '#f59e0b' };
      case 'failed':
        return { bg: '#6b728020', color: '#6b7280' };
      default:
        return { bg: '#6b728020', color: '#6b7280' };
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('problems.title')}</h1>
        <p className="text-gray-400">Resolve problematic cases and delivery errors</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('problems.search')}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg outline-none transition-all"
            style={{
              background: '#1d1d22',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
            }}
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
          {(['all', 'error', 'expired', 'failed'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className="px-4 py-2.5 rounded-lg font-medium transition-all capitalize"
              style={{
                background: filterType === type ? '#7c2d3a' : '#1d1d22',
                color: filterType === type ? '#ffffff' : '#9ca3af',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {t(`problems.filter${type.charAt(0).toUpperCase() + type.slice(1)}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: '#1d1d22',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: '#25252a', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('problems.requestId')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('problems.user')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('problems.issue')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('problems.date')}</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">{t('problems.actions')}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredProblems.map((prob, index) => {
                const typeColor = getTypeColor(prob.type);
                
                return (
                  <motion.tr
                    key={prob.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-white font-mono text-sm">{prob.requestId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{prob.user}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium uppercase"
                          style={{
                            background: typeColor.bg,
                            color: typeColor.color,
                          }}
                        >
                          {prob.type}
                        </span>
                        <span className="text-gray-300">{prob.issue}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {prob.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {canResolve && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                            style={{ background: '#25252a' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#2d2d32';
                              e.currentTarget.style.borderColor = '#10b981';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#25252a';
                            }}
                            onClick={() => handleRetry(prob.id)}
                          >
                            <RotateCcw className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-white">{t('problems.retry')}</span>
                          </button>
                          <button
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: '#25252a' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                            onClick={() => handleResolve(prob.id)}
                          >
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: '#25252a' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                          >
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">{t('common.noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
}