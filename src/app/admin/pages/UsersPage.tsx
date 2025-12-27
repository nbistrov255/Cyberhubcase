import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus, Edit2, Trash2, Ban, CheckCircle, X } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserFormModal, UserFormData } from '../components/UserFormModal';
import { UserRole } from '../AdminApp';

interface User extends UserFormData {
  id: string;
  lastActive: Date;
  createdAt: Date;
  blockedUntil?: Date | null;
  blockedForever?: boolean;
}

interface UsersPageProps {
  userRole: UserRole;
}

export function UsersPage({ userRole }: UsersPageProps) {
  const { t } = useAdminLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState<User | null>(null);
  const [blockDays, setBlockDays] = useState('');
  const [blockForever, setBlockForever] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');

  // Only owner can access this page
  if (userRole !== 'owner') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">Only owners can manage users</p>
        </div>
      </div>
    );
  }

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin1',
      email: 'admin@cyberhub.com',
      fullName: 'Admin User',
      password: '',
      role: 'admin',
      status: 'active',
      useCustomPermissions: false,
      permissions: {},
      lastActive: new Date(),
      createdAt: new Date(2024, 0, 15),
    },
    {
      id: '2',
      username: 'moderator1',
      email: 'mod@cyberhub.com',
      fullName: 'Moderator User',
      password: '',
      role: 'moderator',
      status: 'active',
      useCustomPermissions: false,
      permissions: {},
      lastActive: new Date(Date.now() - 3600000),
      createdAt: new Date(2024, 2, 20),
    },
  ]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm(t('users.deleteConfirm'))) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleSaveUser = (userData: UserFormData) => {
    if (selectedUser) {
      // Update existing user
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...userData } : u));
    } else {
      // Add new user
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        lastActive: new Date(),
        createdAt: new Date(),
      };
      setUsers([...users, newUser]);
    }
  };

  const openBlockModal = (user: User) => {
    setUserToBlock(user);
    setBlockDays('');
    setBlockForever(false);
    setShowBlockModal(true);
  };

  const handleBlockUser = () => {
    if (!userToBlock) return;

    let blockedUntil: Date | null = null;
    let blockedForeverFlag = false;

    if (blockForever) {
      blockedForeverFlag = true;
    } else if (blockDays) {
      const days = parseInt(blockDays);
      if (days > 0) {
        blockedUntil = new Date();
        blockedUntil.setDate(blockedUntil.getDate() + days);
      }
    }

    setUsers(users.map(u => 
      u.id === userToBlock.id 
        ? { ...u, blockedUntil, blockedForever: blockedForeverFlag }
        : u
    ));

    setShowBlockModal(false);
    setUserToBlock(null);
    setBlockDays('');
    setBlockForever(false);
  };

  const handleUnblockUser = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, blockedUntil: null, blockedForever: false }
        : u
    ));
  };

  const isUserBlocked = (user: User): boolean => {
    if (user.blockedForever) return true;
    if (user.blockedUntil) {
      return new Date() < user.blockedUntil;
    }
    return false;
  };

  const getBlockStatus = (user: User): string => {
    if (user.blockedForever) return 'Blocked Forever';
    if (user.blockedUntil && new Date() < user.blockedUntil) {
      const days = Math.ceil((user.blockedUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return `Blocked (${days}d left)`;
    }
    return user.status === 'active' ? 'Active' : 'Inactive';
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(user => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return !isUserBlocked(user);
    if (filterStatus === 'blocked') return isUserBlocked(user);
    return true;
  });

  const getRoleBadgeColor = (role: UserRole | null) => {
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

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('users.title')}</h1>
          <p className="text-gray-400">Manage admin panel users and permissions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddUser}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            background: '#7c2d3a',
            color: '#ffffff',
          }}
        >
          <UserPlus className="w-5 h-5" />
          {t('users.addNew')}
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username, email, or name..."
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

      {/* Status Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className="px-5 py-2.5 rounded-lg font-medium transition-all"
          style={{
            background: filterStatus === 'all' ? '#7c2d3a' : '#1d1d22',
            color: filterStatus === 'all' ? '#ffffff' : '#9ca3af',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          All Users
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className="px-5 py-2.5 rounded-lg font-medium transition-all"
          style={{
            background: filterStatus === 'active' ? '#7c2d3a' : '#1d1d22',
            color: filterStatus === 'active' ? '#ffffff' : '#9ca3af',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          Active
        </button>
        <button
          onClick={() => setFilterStatus('blocked')}
          className="px-5 py-2.5 rounded-lg font-medium transition-all"
          style={{
            background: filterStatus === 'blocked' ? '#7c2d3a' : '#1d1d22',
            color: filterStatus === 'blocked' ? '#ffffff' : '#9ca3af',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          Blocked
        </button>
      </div>

      {/* Users Table */}
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
                  {t('users.username')}
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                  {t('users.email')}
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                  {t('users.fullName')}
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                  {t('users.role')}
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                  {t('users.lastActive')}
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                  {t('users.status')}
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                        style={{
                          background: getRoleBadgeColor(user.role),
                          color: '#ffffff',
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 text-white">{user.fullName}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                      style={{
                        background: `${getRoleBadgeColor(user.role)}33`,
                        color: getRoleBadgeColor(user.role),
                      }}
                    >
                      {user.role || 'no role'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {formatDate(user.lastActive)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                      style={{
                        background: isUserBlocked(user) ? '#ef444433' : (user.status === 'active' ? '#10b98133' : '#6b728033'),
                        color: isUserBlocked(user) ? '#ef4444' : (user.status === 'active' ? '#10b981' : '#6b7280'),
                      }}
                    >
                      {getBlockStatus(user)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 rounded-lg transition-all"
                        style={{ background: '#25252a' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2d2d32';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#25252a';
                        }}
                      >
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </button>
                      {isUserBlocked(user) ? (
                        <button
                          onClick={() => handleUnblockUser(user.id)}
                          className="p-2 rounded-lg transition-all"
                          style={{ background: '#25252a' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#2d2d32';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#25252a';
                          }}
                        >
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </button>
                      ) : (
                        <button
                          onClick={() => openBlockModal(user)}
                          className="p-2 rounded-lg transition-all"
                          style={{ background: '#25252a' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#2d2d32';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#25252a';
                          }}
                        >
                          <Ban className="w-4 h-4 text-orange-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 rounded-lg transition-all"
                        style={{ background: '#25252a' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2d2d32';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#25252a';
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">{t('common.noData')}</p>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        userData={selectedUser}
      />

      {/* Block User Modal */}
      <AnimatePresence>
        {showBlockModal && userToBlock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlockModal(false)}
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
                <div>
                  <h2 className="text-2xl font-bold text-white">Block User</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Block {userToBlock.username} from accessing admin panel
                  </p>
                </div>
                <button
                  onClick={() => setShowBlockModal(false)}
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
              <div className="p-6 space-y-6">
                {/* Block Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Block Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={blockDays}
                    onChange={(e) => setBlockDays(e.target.value)}
                    disabled={blockForever}
                    placeholder="Enter number of days"
                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                    style={{
                      background: blockForever ? '#1a1a1f' : '#25252a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: blockForever ? '#6b7280' : '#ffffff',
                    }}
                  />
                </div>

                {/* Block Forever Checkbox */}
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: '#25252a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blockForever}
                      onChange={(e) => {
                        setBlockForever(e.target.checked);
                        if (e.target.checked) setBlockDays('');
                      }}
                      className="w-5 h-5 rounded"
                      style={{
                        accentColor: '#7c2d3a',
                      }}
                    />
                    <div>
                      <span className="text-white font-medium block">Block Forever</span>
                      <span className="text-gray-400 text-sm">
                        Permanently block this user from admin access
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-end gap-3 p-6"
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <button
                  onClick={() => setShowBlockModal(false)}
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBlockUser}
                  disabled={!blockForever && !blockDays}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium"
                  style={{
                    background: (!blockForever && !blockDays) ? '#6b7280' : '#ef4444',
                    color: '#ffffff',
                    cursor: (!blockForever && !blockDays) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Ban className="w-5 h-5" />
                  Block User
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}