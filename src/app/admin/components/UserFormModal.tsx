import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';

export interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: UserRole | null;
  status: 'active' | 'inactive';
  useCustomPermissions: boolean;
  permissions: Record<string, boolean>;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => void;
  userData?: UserFormData | null;
}

// Define all available permissions
const allPermissions = [
  'viewDashboard',
  'viewCases',
  'createCase',
  'editCase',
  'deleteCase',
  'viewPrizes',
  'createPrize',
  'editPrize',
  'deletePrize',
  'viewClaims',
  'manageClaims',
  'viewUsers',
  'manageUsers',
  'viewLogs',
  'viewSettings',
  'manageSettings',
];

// Default permissions for each role
const rolePermissions: Record<UserRole, Record<string, boolean>> = {
  owner: {
    viewDashboard: true,
    viewCases: true,
    createCase: true,
    editCase: true,
    deleteCase: true,
    viewPrizes: true,
    createPrize: true,
    editPrize: true,
    deletePrize: true,
    viewClaims: true,
    manageClaims: true,
    viewUsers: true,
    manageUsers: true,
    viewLogs: true,
    viewSettings: true,
    manageSettings: true,
  },
  admin: {
    viewDashboard: true,
    viewCases: true,
    createCase: true,
    editCase: true,
    deleteCase: true,
    viewPrizes: true,
    createPrize: true,
    editPrize: true,
    deletePrize: true,
    viewClaims: true,
    manageClaims: true,
    viewUsers: true,
    manageUsers: false,
    viewLogs: true,
    viewSettings: false,
    manageSettings: false,
  },
  moderator: {
    viewDashboard: true,
    viewCases: true,
    createCase: false,
    editCase: false,
    deleteCase: false,
    viewPrizes: true,
    createPrize: false,
    editPrize: false,
    deletePrize: false,
    viewClaims: true,
    manageClaims: true,
    viewUsers: false,
    manageUsers: false,
    viewLogs: true,
    viewSettings: false,
    manageSettings: false,
  },
};

// Group permissions by category
const permissionGroups = [
  {
    title: 'Dashboard',
    permissions: ['viewDashboard'],
  },
  {
    title: 'Cases',
    permissions: ['viewCases', 'createCase', 'editCase', 'deleteCase'],
  },
  {
    title: 'Prizes',
    permissions: ['viewPrizes', 'createPrize', 'editPrize', 'deletePrize'],
  },
  {
    title: 'Claims',
    permissions: ['viewClaims', 'manageClaims'],
  },
  {
    title: 'Users',
    permissions: ['viewUsers', 'manageUsers'],
  },
  {
    title: 'Logs',
    permissions: ['viewLogs'],
  },
  {
    title: 'Settings',
    permissions: ['viewSettings', 'manageSettings'],
  },
];

export function UserFormModal({ isOpen, onClose, onSave, userData }: UserFormModalProps) {
  const { t } = useAdminLanguage();
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'moderator',
    status: 'active',
    useCustomPermissions: false,
    permissions: {},
  });

  useEffect(() => {
    if (isOpen) {
      if (userData) {
        setFormData({
          ...userData,
          password: '', // Don't show existing password
        });
      } else {
        setFormData({
          username: '',
          email: '',
          fullName: '',
          password: '',
          role: 'moderator',
          status: 'active',
          useCustomPermissions: false,
          permissions: rolePermissions.moderator,
        });
      }
    }
  }, [userData, isOpen]);

  // Update permissions when role changes (if not using custom permissions)
  useEffect(() => {
    if (!formData.useCustomPermissions && formData.role) {
      setFormData(prev => ({
        ...prev,
        permissions: rolePermissions[prev.role as UserRole],
      }));
    } else if (!formData.useCustomPermissions && !formData.role) {
      // No role selected, clear all permissions
      setFormData(prev => ({
        ...prev,
        permissions: {},
      }));
    }
  }, [formData.role, formData.useCustomPermissions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password only for new users
    if (!userData && !formData.password) {
      alert('Password is required for new users');
      return;
    }
    
    onSave(formData);
    onClose();
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{ background: 'rgba(0, 0, 0, 0.8)' }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl rounded-xl overflow-hidden"
          style={{
            background: '#1d1d22',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: '85vh',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6"
            style={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 className="text-2xl font-bold text-white">
              {userData ? t('users.editUser') : t('users.addNew')}
            </h2>
            <button
              onClick={onClose}
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
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('users.username')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="admin123"
                    className="w-full px-4 py-2.5 rounded-lg outline-none"
                    style={{
                      background: '#25252a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('users.email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-2.5 rounded-lg outline-none"
                    style={{
                      background: '#25252a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('users.fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-lg outline-none"
                  style={{
                    background: '#25252a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('users.password')} {!userData && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!userData}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={userData ? 'Leave blank to keep current password' : 'Enter password'}
                    className="w-full px-4 py-2.5 pr-12 rounded-lg outline-none"
                    style={{
                      background: '#25252a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('users.role')}
                  </label>
                  <select
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: (e.target.value || null) as UserRole | null })}
                    className="w-full px-4 py-2.5 rounded-lg outline-none"
                    style={{
                      background: '#25252a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  >
                    <option value="">No Role</option>
                    <option value="owner">{t('users.roleOwner')}</option>
                    <option value="admin">{t('users.roleAdmin')}</option>
                    <option value="moderator">{t('users.roleModerator')}</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('users.status')} *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-2.5 rounded-lg outline-none"
                    style={{
                      background: '#25252a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  >
                    <option value="active">{t('users.active')}</option>
                    <option value="inactive">{t('users.inactive')}</option>
                  </select>
                </div>
              </div>

              {/* Custom Permissions Toggle */}
              <div
                className="rounded-lg p-4"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium mb-1">
                      {t('users.customPermissions')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {t('users.useCustomPermissions')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, useCustomPermissions: !prev.useCustomPermissions }))}
                    className="relative w-14 h-7 rounded-full transition-all"
                    style={{
                      background: formData.useCustomPermissions ? '#7c2d3a' : '#3d3d42',
                    }}
                  >
                    <div
                      className="absolute top-1 w-5 h-5 bg-white rounded-full transition-all"
                      style={{
                        left: formData.useCustomPermissions ? '32px' : '4px',
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* Permissions Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {t('users.permissions')}
                </label>
                
                <div className="space-y-4">
                  {permissionGroups.map((group) => (
                    <div
                      key={group.title}
                      className="rounded-lg p-4"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <h4 className="text-white font-medium mb-3">{group.title}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {group.permissions.map((permission) => (
                          <label
                            key={permission}
                            className="flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all"
                            style={{
                              background: formData.permissions[permission] ? '#7c2d3a33' : 'transparent',
                              opacity: formData.useCustomPermissions ? 1 : 0.6,
                              pointerEvents: formData.useCustomPermissions ? 'auto' : 'none',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions[permission] || false}
                              onChange={() => togglePermission(permission)}
                              disabled={!formData.useCustomPermissions}
                              className="w-5 h-5 rounded"
                              style={{
                                accentColor: '#7c2d3a',
                              }}
                            />
                            <span className="text-sm text-gray-300">
                              {t(`permissions.${permission}`)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 p-6"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
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
              {t('common.cancel')}
            </button>
            <motion.button
              type="submit"
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium"
              style={{
                background: '#7c2d3a',
                color: '#ffffff',
              }}
            >
              <Save className="w-5 h-5" />
              {t('common.save')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}