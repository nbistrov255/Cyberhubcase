import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, AlertTriangle, Check, X, Eye } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';
import { toast } from 'sonner';

interface Problem {
  id: string;
  problemId: string;
  user: {
    nickname: string;
    phone: string;
    uuid: string;
  };
  type: 'technical' | 'payment' | 'item-claim' | 'account' | 'other';
  description: string;
  date: Date;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface ProblemQueuePageProps {
  userRole: UserRole;
}

export function ProblemQueuePage({ userRole }: ProblemQueuePageProps) {
  const { t } = useAdminLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Problem['status']>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Problem['priority']>('all');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('session_token');
      
      const response = await fetch('/api/admin/problems', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }

      const data = await response.json();
      
      // Преобразуем данные из API
      const formattedProblems = (data || []).map((problem: any) => ({
        id: problem.id,
        problemId: problem.problem_id || `PRB-${problem.id}`,
        user: {
          nickname: problem.user_nickname || 'Unknown',
          phone: problem.user_phone || 'N/A',
          uuid: problem.user_uuid || '',
        },
        type: problem.type || 'other',
        description: problem.description || 'No description',
        date: problem.created_at ? new Date(problem.created_at) : new Date(),
        status: problem.status || 'pending',
        priority: problem.priority || 'medium',
      }));

      setProblems(formattedProblems);
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Failed to load problems');
      setProblems([]); // Пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#dc2626',
  };

  const statusColors = {
    pending: '#f59e0b',
    'in-progress': '#3b82f6',
    resolved: '#10b981',
    closed: '#6b7280',
  };

  const filteredProblems = (problems || []).filter((problem) => {
    const matchesSearch =
      problem.user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.problemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || problem.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || problem.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const canEdit = ['owner', 'admin'].includes(userRole);

  const handleResolve = async (id: string) => {
    try {
      const token = localStorage.getItem('session_token');
      
      const response = await fetch(`/api/admin/problems/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to resolve problem');
      }

      toast.success('Problem resolved successfully');
      fetchProblems(); // Reload problems
    } catch (error) {
      console.error('Error resolving problem:', error);
      toast.error('Failed to resolve problem');
    }
  };

  const handleClose = async (id: string) => {
    try {
      const token = localStorage.getItem('session_token');
      
      const response = await fetch(`/api/admin/problems/${id}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to close problem');
      }

      toast.success('Problem closed');
      fetchProblems(); // Reload problems
    } catch (error) {
      console.error('Error closing problem:', error);
      toast.error('Failed to close problem');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading problems...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('problemQueue.title')}</h1>
        <p className="text-gray-400">{t('problemQueue.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1d1d22] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#7c2d3a] focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 bg-[#1d1d22] border border-white/10 rounded-lg text-white focus:border-[#7c2d3a] focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as any)}
          className="px-4 py-2 bg-[#1d1d22] border border-white/10 rounded-lg text-white focus:border-[#7c2d3a] focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Problems Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1d1d22', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {problems.length === 0 ? 'No problems in queue' : 'No problems match your filters'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Problem ID</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Description</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Priority</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                  {canEdit && <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredProblems.map((problem) => (
                    <motion.tr
                      key={problem.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-white font-mono text-sm">{problem.problemId}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{problem.user.nickname}</p>
                          <p className="text-gray-500 text-xs">{problem.user.phone}</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300 capitalize">{problem.type.replace('-', ' ')}</td>
                      <td className="p-4 text-gray-400 text-sm max-w-xs truncate">{problem.description}</td>
                      <td className="p-4 text-gray-300 text-sm">{problem.date.toLocaleDateString()}</td>
                      <td className="p-4">
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: `${priorityColors[problem.priority]}20`,
                            color: priorityColors[problem.priority],
                          }}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {problem.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: `${statusColors[problem.status]}20`,
                            color: statusColors[problem.status],
                          }}
                        >
                          {problem.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {problem.status === 'pending' && (
                              <button
                                onClick={() => handleResolve(problem.id)}
                                className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-500 transition-colors"
                                title="Resolve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {problem.status === 'resolved' && (
                              <button
                                onClick={() => handleClose(problem.id)}
                                className="p-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-gray-500 transition-colors"
                                title="Close"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
