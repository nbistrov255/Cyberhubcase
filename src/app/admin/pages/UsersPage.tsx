import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus, Edit2, Trash2, Ban, CheckCircle, X } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserFormModal, UserFormData } from '../components/UserFormModal';
import { UserRole } from '../AdminApp';
import { toast } from 'sonner';

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
      const token = localStorage.getItem('session_token');
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      const token = localStorage.getItem('session_token');
      
      if (selectedUser) {
        // Update existing user
        const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
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
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('session_token');
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      const token = localStorage.getItem('session_token');
      
      const response = await fetch(`/api/admin/users/${userToBlock.id}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          blockForever,
          blockDays: blockForever ? null : parseInt(blockDays),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to block user');
      }

      toast.success('User blocked successfully');
      setShowBlockModal(false);
      setUserToBlock(null);
      setBlockDays('');
      setBlockForever(false);
      fetchUsers(); // Reload users
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('session_token');
      
      const response = await fetch(`/api/admin/users/${userId}/unblock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7c2d3a] to-[#9a3b4a] hover:from-[#9a3b4a] hover:to-[#7c2d3a] rounded-lg font-medium transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
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
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1d1d22', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {loading ? 'Loading...' : 'No users found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Last Active</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user) => {
                    const isBlocked = user.blockedForever || (user.blockedUntil && user.blockedUntil > new Date());

                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{user.fullName || user.username}</p>
                            <p className="text-gray-500 text-xs">{user.email || user.username}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              background: user.role === 'owner' ? '#ef444420' : user.role === 'admin' ? '#f59e0b20' : '#10b98120',
                              color: user.role === 'owner' ? '#ef4444' : user.role === 'admin' ? '#f59e0b' : '#10b981',
                            }}
                          >
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300 text-sm">
                          {user.lastActive.toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
                              <Ban className="w-3 h-3" />
                              {user.blockedForever ? 'Blocked Forever' : `Blocked until ${user.blockedUntil?.toLocaleDateString()}`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            
                            {isBlocked ? (
                              <button
                                onClick={() => handleUnblockUser(user.id)}
                                className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-500 transition-colors"
                                title="Unblock"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setUserToBlock(user);
                                  setShowBlockModal(true);
                                }}
                                className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 transition-colors"
                                title="Block"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <UserFormModal
          user={selectedUser}
          onSave={handleSaveUser}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Block User Modal */}
      <AnimatePresence>
        {showBlockModal && userToBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setShowBlockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#1d1d22] border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Block User</h2>
              <p className="text-gray-400 mb-6">
                Block <span className="text-white font-medium">{userToBlock.fullName || userToBlock.username}</span>
              </p>

              <div className="space-y-4 mb-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={blockForever}
                    onChange={(e) => setBlockForever(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-white">Block forever</span>
                </label>

                {!blockForever && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Block for (days)</label>
                    <input
                      type="number"
                      value={blockDays}
                      onChange={(e) => setBlockDays(e.target.value)}
                      placeholder="Enter number of days"
                      className="w-full px-4 py-2 bg-[#25252a] border border-white/10 rounded-lg text-white focus:border-[#7c2d3a] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockUser}
                  className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg font-medium transition-colors"
                >
                  Block User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
