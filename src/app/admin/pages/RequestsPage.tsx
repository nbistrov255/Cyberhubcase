import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Eye, Check, X, RotateCcw } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';

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

  const [requests, setRequests] = useState<Request[]>([
    {
      id: '1',
      requestId: 'REQ-2024-001',
      user: {
        nickname: 'PlayerOne',
        phone: '+371 2000 0000',
        uuid: 'uuid-12345',
      },
      item: {
        name: 'AK-47 | Redline',
        image: 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?w=100&h=100&fit=crop',
        rarity: 'legendary',
      },
      case: 'Daily Gold Case',
      pc: 'PC-001',
      date: new Date('2024-12-24'),
      status: 'pending',
    },
    {
      id: '2',
      requestId: 'REQ-2024-002',
      user: {
        nickname: 'GamerPro',
        phone: '+371 2111 1111',
        uuid: 'uuid-67890',
      },
      item: {
        name: 'Gaming Headset Pro',
        image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=100&h=100&fit=crop',
        rarity: 'epic',
      },
      case: 'Premium Monthly',
      pc: 'PC-002',
      date: new Date('2024-12-23'),
      status: 'approved',
    },
  ]);

  const rarityColors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b',
    mythic: '#ef4444',
  };

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'pending':
        return { bg: '#f59e0b20', color: '#f59e0b' };
      case 'approved':
        return { bg: '#10b98120', color: '#10b981' };
      case 'denied':
        return { bg: '#ef444420', color: '#ef4444' };
      case 'returned':
        return { bg: '#8b5cf620', color: '#8b5cf6' };
      case 'expired':
        return { bg: '#6b728020', color: '#6b7280' };
      default:
        return { bg: '#6b728020', color: '#6b7280' };
    }
  };

  const canApprove = ['owner', 'admin', 'operator'].includes(userRole);

  const handleApprove = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
  };

  const handleDeny = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'denied' } : req
    ));
  };

  const handleReturn = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'returned' } : req
    ));
  };

  const handleSetPending = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'pending' } : req
    ));
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user.phone.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('requests.title')}</h1>
        <p className="text-gray-400">Manage all claim requests</p>
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
            placeholder={t('requests.search')}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg outline-none transition-all"
            style={{
              background: '#1d1d22',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
            }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'denied', 'returned', 'expired'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="px-4 py-2.5 rounded-lg font-medium transition-all capitalize"
              style={{
                background: filterStatus === status ? '#7c2d3a' : '#1d1d22',
                color: filterStatus === status ? '#ffffff' : '#9ca3af',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {t(`requests.filter${status.charAt(0).toUpperCase() + status.slice(1)}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
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
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('requests.requestId')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('requests.user')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('requests.item')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('requests.case')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('requests.pc')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('requests.date')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('requests.status')}</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">{t('requests.actions')}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredRequests.map((req, index) => {
                const statusColor = getStatusColor(req.status);
                
                return (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-white font-mono text-sm">{req.requestId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{req.user.nickname}</p>
                        <p className="text-gray-400 text-sm">{req.user.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.item.image}
                          alt={req.item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-white font-medium text-sm">{req.item.name}</p>
                          <span
                            className="text-xs font-medium capitalize"
                            style={{ color: rarityColors[req.item.rarity] }}
                          >
                            {req.item.rarity}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{req.case}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 font-mono text-sm">{req.pc}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {req.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                        style={{
                          background: statusColor.bg,
                          color: statusColor.color,
                        }}
                      >
                        {t(`requests.${req.status}` as any)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: '#25252a' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        
                        {canApprove && req.status === 'pending' && (
                          <>
                            <button
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                              style={{ background: '#25252a' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                              onClick={() => handleApprove(req.id)}
                              title={t('requests.approve')}
                            >
                              <Check className="w-4 h-4 text-green-400" />
                            </button>
                            <button
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                              style={{ background: '#25252a' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                              onClick={() => handleDeny(req.id)}
                              title={t('requests.deny')}
                            >
                              <X className="w-4 h-4 text-red-400" />
                            </button>
                            <button
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                              style={{ background: '#25252a' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                              onClick={() => handleReturn(req.id)}
                              title={t('requests.return')}
                            >
                              <RotateCcw className="w-4 h-4 text-purple-400" />
                            </button>
                          </>
                        )}
                        
                        {canApprove && req.status !== 'pending' && (
                          <button
                            className="px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors text-sm"
                            style={{ background: '#25252a' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                            onClick={() => handleSetPending(req.id)}
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-white">Pending</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">{t('common.noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
}