import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';
import { UserFormModal, UserFormData } from '../components/UserFormModal';
import { toast } from 'sonner';
import { getAdminAuthHeaders } from '../utils/adminAuth';

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
  const [blockReason, setBlockReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/users', {
        headers: getAdminAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      // Преобразуем данные из API
      const formattedUsers = (data || []).map((user: any) => ({
        id: user.id || user.uuid,
        username: user.username || user.nickname,
        email: user.email || '',
        fullName: user.full_name || user.nickname,
        password: '',
        role: user.role || 'viewer',
        lastActive: user.last_active ? new Date(user.last_active) : new Date(),
        createdAt: user.created_at ? new Date(user.created_at) : new Date(),
        blockedUntil: user.blocked_until ? new Date(user.blocked_until) : null,
        blockedForever: user.blocked_forever || false,
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]); // Пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const isBlocked = user.blockedForever || (user.blockedUntil && user.blockedUntil > new Date());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !isBlocked) ||
      (filterStatus === 'blocked' && isBlocked);

    return matchesSearch && matchesFilter;
  });

  const handleSaveUser = async (userData: UserFormData) => {
    try {
      
      if (selectedUser) {
        // Update existing user
        const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: getAdminAuthHeaders(),
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error('Failed to update user');
        }

        toast.success('User updated successfully');
      } else {
        // Create new user
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: getAdminAuthHeaders(),
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error('Failed to create user');
        }

        toast.success('User created successfully');
      }

      setIsModalOpen(false);
      setSelectedUser(null);
      fetchUsers(); // Reload users
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('users.deleteConfirm'))) {
      return;
    }

    try {
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers(); // Reload users
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleBlockUser = async () => {
    if (!userToBlock) return;

    try {
      
      const response = await fetch(`/api/admin/users/${userToBlock.id}/block`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ reason: blockReason }),
      });

      if (!response.ok) {
        throw new Error('Failed to block user');
      }

      toast.success('User blocked successfully');
      setShowBlockModal(false);
      setUserToBlock(null);
      setBlockReason('');
      fetchUsers(); // Reload users
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      
      const response = await fetch(`/api/admin/users/${userId}/unblock`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to unblock user');
      }

      toast.success('User unblocked successfully');
      fetchUsers(); // Reload users
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading users...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('users.title')}</h1>
          <p className="text-gray-400">{t('users.subtitle')}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            background: '#7c2d3a',
            color: '#ffffff',
          }}
        >
          <Plus className="w-5 h-5" />
          {t('users.addNew')}
        </motion.button>
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
            placeholder={t('users.search')}
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
          {(['all', 'active', 'blocked'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="px-4 py-2.5 rounded-lg font-medium transition-all"
              style={{
                background: filterStatus === status ? '#7c2d3a' : '#1d1d22',
                color: filterStatus === status ? '#ffffff' : '#9ca3af',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {t(`users.filter${status.charAt(0).toUpperCase() + status.slice(1)}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
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
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('users.username')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('users.email')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('users.role')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('users.status')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('users.lastActive')}</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((user, index) => {
                const isBlocked = user.blockedForever || (user.blockedUntil && user.blockedUntil > new Date());

                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{user.username}</p>
                      {user.fullName && user.fullName !== user.username && (
                        <p className="text-gray-400 text-sm">{user.fullName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{user.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                        style={{
                          background: user.role === 'owner' ? '#ef444420' : user.role === 'admin' ? '#f59e0b20' : '#10b98120',
                          color: user.role === 'owner' ? '#ef4444' : user.role === 'admin' ? '#f59e0b' : '#10b981',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isBlocked ? (
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            background: '#ef444420',
                            color: '#ef4444',
                          }}
                        >
                          {user.blockedForever ? t('users.blockedForever') : t('users.blocked')}
                        </span>
                      ) : (
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            background: '#10b98120',
                            color: '#10b981',
                          }}
                        >
                          {t('users.active')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {user.lastActive.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: '#25252a' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        
                        {isBlocked ? (
                          <button
                            onClick={() => handleUnblockUser(user.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: '#25252a' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                          >
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setUserToBlock(user);
                              setShowBlockModal(true);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: '#25252a' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                          >
                            <Ban className="w-4 h-4 text-yellow-400" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: '#25252a' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">{t('common.noData')}</p>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      <UserFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        editingUser={selectedUser}
      />

      {/* Block User Modal */}
      <AnimatePresence>
        {showBlockModal && userToBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowBlockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl p-6"
              style={{
                background: '#1d1d22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">{t('users.blockUser')}</h2>
              <p className="text-gray-400 mb-6">
                {t('users.blockConfirm')} <span className="text-white font-medium">{userToBlock.fullName || userToBlock.username}</span>?
              </p>

              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">{t('users.blockReason')}</label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder={t('users.blockReasonPlaceholder')}
                  className="w-full px-4 py-2 rounded-lg outline-none transition-all resize-none"
                  rows={3}
                  style={{
                    background: '#25252a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    background: '#25252a',
                    color: '#ffffff',
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleBlockUser}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    background: '#ef444420',
                    color: '#ef4444',
                  }}
                >
                  {t('users.blockButton')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
