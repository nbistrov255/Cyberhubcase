import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Eye, Check, X, RotateCcw } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';
import { toast } from 'sonner';

interface Request {
  id: string;
  requestId: string;
  user: {
    nickname: string;
    phone: string;
    uuid: string;
  };
  item: {
    name: string;
    image: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  };
  case: string;
  pc: string;
  date: Date;
  status: 'pending' | 'approved' | 'denied' | 'returned' | 'expired';
}

interface RequestsPageProps {
  userRole: UserRole;
}

export function RequestsPage({ userRole }: RequestsPageProps) {
  const { t } = useAdminLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Request['status']>('all');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка заявок из API
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('session_token');
      
      const response = await fetch('/api/admin/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      
      // Преобразуем данные из API в формат компонента
      const formattedRequests = (data || []).map((req: any) => ({
        id: req.id,
        requestId: req.request_id || `REQ-${req.id}`,
        user: {
          nickname: req.user_nickname || 'Unknown',
          phone: req.user_phone || 'N/A',
          uuid: req.user_uuid || '',
        },
        item: {
          name: req.item_name || 'Unknown Item',
          image: req.item_image || 'https://via.placeholder.com/100',
          rarity: req.item_rarity || 'common',
        },
        case: req.case_name || 'Unknown Case',
        pc: req.pc_id || 'N/A',
        date: req.created_at ? new Date(req.created_at) : new Date(),
        status: req.status || 'pending',
      }));

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
      setRequests([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const rarityColors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b',
    mythic: '#ef4444',
  };

  const statusColors = {
    pending: '#f59e0b',
    approved: '#10b981',
    denied: '#ef4444',
    returned: '#8b5cf6',
    expired: '#6b7280',
  };

  const filteredRequests = (requests || []).filter((req) => {
    const matchesSearch = 
      req.user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const canEdit = ['owner', 'admin'].includes(userRole);

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('session_token');
      
      const response = await fetch(`/api/admin/requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      toast.success('Request approved successfully');
      fetchRequests(); // Перезагружаем список
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleDeny = async (id: string) => {
    try {
      const token = localStorage.getItem('session_token');
      
      const response = await fetch(`/api/admin/requests/${id}/deny`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deny request');
      }

      toast.success('Request denied');
      fetchRequests(); // Перезагружаем список
    } catch (error) {
      console.error('Error denying request:', error);
      toast.error('Failed to deny request');
    }
  };

  const handleReturn = async (id: string) => {
    try {
      const token = localStorage.getItem('session_token');
      
      const response = await fetch(`/api/admin/requests/${id}/return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to return request');
      }

      toast.success('Request returned to inventory');
      fetchRequests(); // Перезагружаем список
    } catch (error) {
      console.error('Error returning request:', error);
      toast.error('Failed to return request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading requests...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('requests.title')}</h1>
        <p className="text-gray-400">{t('requests.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder={t('requests.searchPlaceholder')}
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
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="returned">Returned</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1d1d22', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No pending requests found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Request ID</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Item</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Case</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">PC</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                  {canEdit && <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredRequests.map((request) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-white font-mono text-sm">{request.requestId}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{request.user.nickname}</p>
                          <p className="text-gray-500 text-xs">{request.user.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={request.item.image} alt={request.item.name} className="w-12 h-12 rounded object-cover" />
                          <div>
                            <p className="text-white font-medium">{request.item.name}</p>
                            <p className="text-xs" style={{ color: rarityColors[request.item.rarity] }}>
                              {request.item.rarity.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{request.case}</td>
                      <td className="p-4 text-gray-300">{request.pc}</td>
                      <td className="p-4 text-gray-300">{request.date.toLocaleDateString()}</td>
                      <td className="p-4">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: `${statusColors[request.status]}20`,
                            color: statusColors[request.status],
                          }}
                        >
                          {request.status.toUpperCase()}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request.id)}
                                  className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-500 transition-colors"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeny(request.id)}
                                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors"
                                  title="Deny"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {request.status === 'approved' && (
                              <button
                                onClick={() => handleReturn(request.id)}
                                className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-500 transition-colors"
                                title="Return to Inventory"
                              >
                                <RotateCcw className="w-4 h-4" />
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
