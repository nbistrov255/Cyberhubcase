import { useState, useMemo } from 'react';
import { Search, Trophy, UserCog, ArrowUpDown } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';

interface LogsPageProps {
  userRole: UserRole;
}

type LogTab = 'client' | 'admin';
type SortOrder = 'asc' | 'desc';
type ClientSortField = 'date' | 'value' | 'rarity' | 'prize';
type AdminSortField = 'date' | 'action' | 'admin';

interface ClientLog {
  id: string;
  player: string;
  playerAvatar?: string;
  case: string;
  prize: string;
  rarity: 'common' | 'rare' | 'epic' | 'mythic' | 'legendary';
  value: number;
  timestamp: Date;
}

interface AdminLog {
  id: string;
  admin: string;
  adminRole: UserRole;
  action: string;
  target?: string;
  details?: string;
  ipAddress: string;
  timestamp: Date;
}

const rarityOrder = {
  common: 1,
  rare: 2,
  epic: 3,
  mythic: 4,
  legendary: 5,
};

export function LogsPage({ userRole }: LogsPageProps) {
  const { t } = useAdminLanguage();
  const [activeTab, setActiveTab] = useState<LogTab>('client');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Client filters & sorting
  const [clientSortField, setClientSortField] = useState<ClientSortField>('date');
  const [clientSortOrder, setClientSortOrder] = useState<SortOrder>('desc');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  
  // Admin filters & sorting
  const [adminSortField, setAdminSortField] = useState<AdminSortField>('date');
  const [adminSortOrder, setAdminSortOrder] = useState<SortOrder>('desc');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Mock client activity data
  const [clientLogs] = useState<ClientLog[]>([
    {
      id: '1',
      player: 'Player_2024',
      case: 'Christmas Mega',
      prize: 'AirPods Pro',
      rarity: 'legendary',
      value: 250,
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: '2',
      player: 'GamerPro',
      case: 'Daily Free',
      prize: '$5 Balance',
      rarity: 'common',
      value: 5,
      timestamp: new Date(Date.now() - 600000),
    },
    {
      id: '3',
      player: 'LuckyOne',
      case: 'Premium Box',
      prize: 'Gaming Mouse',
      rarity: 'epic',
      value: 80,
      timestamp: new Date(Date.now() - 900000),
    },
    {
      id: '4',
      player: 'CyberKing',
      case: 'Christmas Mega',
      prize: 'PlayStation 5',
      rarity: 'mythic',
      value: 500,
      timestamp: new Date(Date.now() - 1200000),
    },
    {
      id: '5',
      player: 'NoobMaster',
      case: 'Daily Free',
      prize: '$2 Balance',
      rarity: 'common',
      value: 2,
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: '6',
      player: 'ProGamer123',
      case: 'Premium Box',
      prize: 'Mechanical Keyboard',
      rarity: 'rare',
      value: 45,
      timestamp: new Date(Date.now() - 2400000),
    },
  ]);

  // Mock admin activity data
  const [adminLogs] = useState<AdminLog[]>([
    {
      id: '1',
      admin: 'admin1',
      adminRole: 'admin',
      action: 'login',
      ipAddress: '192.168.1.100',
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: '2',
      admin: 'admin1',
      adminRole: 'admin',
      action: 'claimApproved',
      target: 'Claim #12345',
      details: 'Approved claim for AirPods Pro delivery',
      ipAddress: '192.168.1.100',
      timestamp: new Date(Date.now() - 1500000),
    },
    {
      id: '3',
      admin: 'moderator1',
      adminRole: 'moderator',
      action: 'claimRejected',
      target: 'Claim #12346',
      details: 'Invalid phone number',
      ipAddress: '192.168.1.105',
      timestamp: new Date(Date.now() - 1200000),
    },
    {
      id: '4',
      admin: 'admin1',
      adminRole: 'admin',
      action: 'caseEdited',
      target: 'Christmas Mega',
      details: 'Updated prize distribution percentages',
      ipAddress: '192.168.1.100',
      timestamp: new Date(Date.now() - 900000),
    },
    {
      id: '5',
      admin: 'owner',
      adminRole: 'owner',
      action: 'userCreated',
      target: 'moderator2',
      details: 'Created new moderator account',
      ipAddress: '192.168.1.1',
      timestamp: new Date(Date.now() - 600000),
    },
    {
      id: '6',
      admin: 'admin1',
      adminRole: 'admin',
      action: 'prizeCreated',
      target: 'Gaming Keyboard RGB',
      details: 'Added new prize to inventory',
      ipAddress: '192.168.1.100',
      timestamp: new Date(Date.now() - 300000),
    },
  ]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#9ca3af';
      case 'rare':
        return '#3b82f6';
      case 'epic':
        return '#8b5cf6';
      case 'mythic':
        return '#ef4444';
      case 'legendary':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return '#7c2d3a';
      case 'admin':
        return '#3b82f6';
      case 'moderator':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleString();
  };

  // Filter and sort client logs
  const filteredClientLogs = useMemo(() => {
    let filtered = clientLogs.filter(log =>
      log.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.case.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.prize.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply rarity filter
    if (rarityFilter !== 'all') {
      filtered = filtered.filter(log => log.rarity === rarityFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (clientSortField) {
        case 'date':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'rarity':
          comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity];
          break;
        case 'prize':
          comparison = a.prize.localeCompare(b.prize);
          break;
      }

      return clientSortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [clientLogs, searchQuery, rarityFilter, clientSortField, clientSortOrder]);

  // Filter and sort admin logs
  const filteredAdminLogs = useMemo(() => {
    let filtered = adminLogs.filter(log =>
      log.admin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target && log.target.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Apply action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (adminSortField) {
        case 'date':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'action':
          comparison = a.action.localeCompare(b.action);
          break;
        case 'admin':
          comparison = a.admin.localeCompare(b.admin);
          break;
      }

      return adminSortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [adminLogs, searchQuery, actionFilter, adminSortField, adminSortOrder]);

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(adminLogs.map(log => log.action)));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('logs.title')}</h1>
          <p className="text-gray-400">Monitor client wins and admin activities</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('client')}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            background: activeTab === 'client' ? '#7c2d3a' : '#1d1d22',
            color: activeTab === 'client' ? '#ffffff' : '#9ca3af',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Trophy className="w-5 h-5" />
          {t('logs.clientActivity')}
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            background: activeTab === 'admin' ? '#7c2d3a' : '#1d1d22',
            color: activeTab === 'admin' ? '#ffffff' : '#9ca3af',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <UserCog className="w-5 h-5" />
          {t('logs.adminActivity')}
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* Search Bar */}
        <div className="col-span-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'client'
                  ? 'Search by player, case, or prize...'
                  : 'Search by admin, target, or details...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg outline-none"
              style={{
                background: '#1d1d22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
              }}
            />
          </div>
        </div>

        {activeTab === 'client' ? (
          <>
            {/* Rarity Filter */}
            <div className="col-span-3">
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: '#1d1d22',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              >
                <option value="all">{t('logs.allRarities')}</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="mythic">Mythic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>

            {/* Sort Field */}
            <div className="col-span-3">
              <select
                value={clientSortField}
                onChange={(e) => setClientSortField(e.target.value as ClientSortField)}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: '#1d1d22',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              >
                <option value="date">{t('logs.sortByDate')}</option>
                <option value="value">{t('logs.sortByValue')}</option>
                <option value="rarity">{t('logs.sortByRarity')}</option>
                <option value="prize">{t('logs.sortByPrize')}</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="col-span-2">
              <button
                onClick={() => setClientSortOrder(clientSortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  background: '#1d1d22',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              >
                <ArrowUpDown className="w-5 h-5" />
                {clientSortOrder === 'asc' ? t('logs.ascending') : t('logs.descending')}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Action Filter */}
            <div className="col-span-3">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: '#1d1d22',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              >
                <option value="all">{t('logs.allActions')}</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{t(`actions.${action}`)}</option>
                ))}
              </select>
            </div>

            {/* Sort Field */}
            <div className="col-span-3">
              <select
                value={adminSortField}
                onChange={(e) => setAdminSortField(e.target.value as AdminSortField)}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: '#1d1d22',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              >
                <option value="date">{t('logs.sortByDate')}</option>
                <option value="action">{t('logs.sortByAction')}</option>
                <option value="admin">{t('logs.sortByAdmin')}</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="col-span-2">
              <button
                onClick={() => setAdminSortOrder(adminSortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  background: '#1d1d22',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              >
                <ArrowUpDown className="w-5 h-5" />
                {adminSortOrder === 'asc' ? t('logs.ascending') : t('logs.descending')}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {activeTab === 'client' ? (
        // Client Activity Table
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: '#1d1d22',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.player')}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.case')}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.prize')}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.rarity')}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.value')}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.timestamp')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClientLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                          style={{
                            background: '#7c2d3a',
                            color: '#ffffff',
                          }}
                        >
                          {log.player.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{log.player}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{log.case}</td>
                    <td className="px-6 py-4 text-white font-medium">{log.prize}</td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          background: `${getRarityColor(log.rarity)}33`,
                          color: getRarityColor(log.rarity),
                        }}
                      >
                        {log.rarity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-green-400 font-medium">${log.value}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatTime(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClientLogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">{t('common.noData')}</p>
            </div>
          )}
        </div>
      ) : (
        // Admin Activity Table
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: '#1d1d22',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.admin')}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.action')}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.target')}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.details')}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.ipAddress')}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    {t('logs.timestamp')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAdminLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                          style={{
                            background: getRoleBadgeColor(log.adminRole),
                            color: '#ffffff',
                          }}
                        >
                          {log.admin.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{log.admin}</div>
                          <div
                            className="text-xs capitalize"
                            style={{ color: getRoleBadgeColor(log.adminRole) }}
                          >
                            {log.adminRole}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: '#25252a',
                          color: '#ffffff',
                        }}
                      >
                        {t(`actions.${log.action}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{log.target || '-'}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">
                      {log.details || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-mono">{log.ipAddress}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatTime(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAdminLogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">{t('common.noData')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
