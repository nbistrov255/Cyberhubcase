import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';

interface SettingsPageProps {
  userRole: UserRole;
}

export function SettingsPage({ userRole }: SettingsPageProps) {
  const { t } = useAdminLanguage();

  // Only owner and admin can access settings
  if (!['owner', 'admin'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access settings</p>
        </div>
      </div>
    );
  }
  
  const [settings, setSettings] = useState({
    // Appearance
    siteLogo: 'https://via.placeholder.com/200x60?text=CyberHub',
    bannerBackground: 'https://i.ibb.co/nqGS31TR/Chat-GPT-Image-24-2025-04-05-54.png',
    profileBackground: 'https://i.ibb.co/0jf2XZFw/Chat-GPT-Image-25-2025-00-01-32.png',
    snowEffect: true,
    maintenanceMode: false,
    // General
    lowStockThreshold: 10,
    expireTtl: 48,
    rarities: {
      common: { color: '#9ca3af', chance: 50 },
      rare: { color: '#3b82f6', chance: 30 },
      epic: { color: '#8b5cf6', chance: 15 },
      mythic: { color: '#ef4444', chance: 4 },
      legendary: { color: '#f59e0b', chance: 1 },
    },
  });

  // Загрузка настроек из localStorage при монтировании
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('siteSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const handleSave = () => {
    console.log('Settings saved:', settings);
    
    // Сохраняем все настройки в localStorage под ключом 'siteSettings'
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    
    // Также сохраняем maintenanceMode отдельно для обратной совместимости
    localStorage.setItem('maintenanceMode', JSON.stringify(settings.maintenanceMode));
    
    // Show success toast
    toast.success('Settings saved successfully!', {
      description: 'All changes have been applied',
      duration: 3000,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('settings.title')}</h1>
          <p className="text-gray-400">Configure system parameters and defaults</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            background: '#7c2d3a',
            color: '#ffffff',
          }}
        >
          <Save className="w-5 h-5" />
          {t('settings.save')}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div
          className="lg:col-span-2 rounded-xl p-6"
          style={{
            background: '#1d1d22',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 className="text-xl font-bold text-white mb-6">{t('settings.appearance')}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Site Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('settings.siteLogo')}
              </label>
              <input
                type="text"
                value={settings.siteLogo}
                onChange={(e) => setSettings({ ...settings, siteLogo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-3 rounded-lg outline-none mb-2"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              />
              <p className="text-xs text-gray-500 mb-3">{t('settings.siteLogoHint')}</p>
              {settings.siteLogo && (
                <div 
                  className="rounded-lg p-4 flex items-center justify-center"
                  style={{
                    background: '#25252a',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    minHeight: '80px',
                  }}
                >
                  <img
                    src={settings.siteLogo}
                    alt="Site Logo Preview"
                    className="max-h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/200x60?text=Invalid+URL';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Snow Effect */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('settings.snowEffect')}
              </label>
              <div
                className="rounded-lg p-4"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">
                    {settings.snowEffect ? t('settings.enabled') : t('settings.disabled')}
                  </span>
                  <button
                    onClick={() => setSettings({ ...settings, snowEffect: !settings.snowEffect })}
                    className="relative w-14 h-7 rounded-full transition-all"
                    style={{
                      background: settings.snowEffect ? '#7c2d3a' : '#3d3d42',
                    }}
                  >
                    <div
                      className="absolute top-1 w-5 h-5 bg-white rounded-full transition-all"
                      style={{
                        left: settings.snowEffect ? '32px' : '4px',
                      }}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500">{t('settings.snowEffectHint')}</p>
              </div>
            </div>

            {/* Maintenance Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('settings.maintenanceMode')}
              </label>
              <div
                className="rounded-lg p-4"
                style={{
                  background: '#25252a',
                  border: settings.maintenanceMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">
                    {settings.maintenanceMode ? t('settings.enabled') : t('settings.disabled')}
                  </span>
                  <button
                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    className="relative w-14 h-7 rounded-full transition-all"
                    style={{
                      background: settings.maintenanceMode ? '#ef4444' : '#3d3d42',
                    }}
                  >
                    <div
                      className="absolute top-1 w-5 h-5 bg-white rounded-full transition-all"
                      style={{
                        left: settings.maintenanceMode ? '32px' : '4px',
                      }}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500">{t('settings.maintenanceModeHint')}</p>
                {settings.maintenanceMode && (
                  <div 
                    className="mt-3 p-3 rounded-lg flex items-start gap-2"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                  >
                    <span className="text-red-400 text-sm">⚠️ Warning: All users will see maintenance screen and cannot access the application.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Banner Background */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('settings.bannerBackground')}
              </label>
              <input
                type="text"
                value={settings.bannerBackground}
                onChange={(e) => setSettings({ ...settings, bannerBackground: e.target.value })}
                placeholder="https://example.com/banner-bg.png"
                className="w-full px-4 py-3 rounded-lg outline-none mb-2"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              />
              <p className="text-xs text-gray-500 mb-3">{t('settings.bannerBackgroundHint')}</p>
              {settings.bannerBackground && (
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    height: '120px',
                    background: '#25252a',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <img
                    src={settings.bannerBackground}
                    alt="Banner Background Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x200?text=Invalid+URL';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Profile Background */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('settings.profileBackground')}
              </label>
              <input
                type="text"
                value={settings.profileBackground}
                onChange={(e) => setSettings({ ...settings, profileBackground: e.target.value })}
                placeholder="https://example.com/profile-bg.png"
                className="w-full px-4 py-3 rounded-lg outline-none mb-2"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              />
              <p className="text-xs text-gray-500 mb-3">{t('settings.profileBackgroundHint')}</p>
              {settings.profileBackground && (
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    height: '120px',
                    background: '#25252a',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <img
                    src={settings.profileBackground}
                    alt="Profile Background Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x200?text=Invalid+URL';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div
          className="rounded-xl p-6"
          style={{
            background: '#1d1d22',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 className="text-xl font-bold text-white mb-6">{t('settings.general')}</h2>
          
          <div className="space-y-6">
            {/* Low Stock Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('settings.lowStockThreshold')}
              </label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this number</p>
            </div>

            {/* Expire TTL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('settings.expireTtl')}
              </label>
              <input
                type="number"
                value={settings.expireTtl}
                onChange={(e) => setSettings({ ...settings, expireTtl: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Hours before unclaimed prize expires</p>
            </div>
          </div>
        </div>

        {/* Rarities */}
        <div
          className="rounded-xl p-6"
          style={{
            background: '#1d1d22',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 className="text-xl font-bold text-white mb-6">{t('settings.rarities')}</h2>
          
          <div className="space-y-4">
            {Object.entries(settings.rarities).map(([rarity, data]) => (
              <div
                key={rarity}
                className="p-4 rounded-lg"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ background: data.color }}
                    />
                    <span className="text-white font-medium capitalize">{rarity}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{data.chance}%</span>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Default Chance %</label>
                  <input
                    type="number"
                    value={data.chance}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        rarities: {
                          ...settings.rarities,
                          [rarity]: { ...data, chance: parseFloat(e.target.value) || 0 },
                        },
                      });
                    }}
                    className="w-full px-3 py-2 rounded text-sm outline-none"
                    style={{
                      background: '#1d1d22',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Presets Info */}
        <div
          className="lg:col-span-2 rounded-xl p-6"
          style={{
            background: '#1d1d22',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 className="text-xl font-bold text-white mb-4">{t('settings.presets')}</h2>
          <p className="text-gray-400 text-sm mb-4">
            These percentages are used when using the "Auto Calculate" feature in case management.
            The system will automatically distribute chances based on these rarity presets.
          </p>
          <div
            className="p-4 rounded-lg"
            style={{
              background: '#25252a',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total:</span>
              <span
                className="font-bold"
                style={{
                  color: Object.values(settings.rarities).reduce((sum, r) => sum + r.chance, 0) === 100
                    ? '#10b981'
                    : '#ef4444',
                }}
              >
                {Object.values(settings.rarities).reduce((sum, r) => sum + r.chance, 0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}