import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Eye } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';

interface ItemFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  editingItem: any | null;
}

export function ItemFormModal({ open, onClose, onSave, editingItem }: ItemFormModalProps) {
  const { t } = useAdminLanguage();
  const [activeTab, setActiveTab] = useState<'lv' | 'ru' | 'en'>('en');
  
  const [formData, setFormData] = useState({
    nameLv: '',
    nameRu: '',
    nameEn: '',
    descLv: '',
    descRu: '',
    descEn: '',
    type: 'physical' as 'physical' | 'balance' | 'virtual',
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary' | 'mythic',
    image: '',
    stock: 0,
    amount: 0,
    isActive: true,
  });

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({
        nameLv: '',
        nameRu: '',
        nameEn: '',
        descLv: '',
        descRu: '',
        descEn: '',
        type: 'physical',
        rarity: 'common',
        image: '',
        stock: 0,
        amount: 0,
        isActive: true,
      });
    }
  }, [editingItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const rarityColors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b',
    mythic: '#ef4444',
  };

  const copyFromLanguage = (lang: 'lv' | 'ru' | 'en') => {
    const nameKey = `name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as 'nameLv' | 'nameRu' | 'nameEn';
    const descKey = `desc${lang.charAt(0).toUpperCase() + lang.slice(1)}` as 'descLv' | 'descRu' | 'descEn';
    
    const targetNameKey = `name${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as 'nameLv' | 'nameRu' | 'nameEn';
    const targetDescKey = `desc${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as 'descLv' | 'descRu' | 'descEn';
    
    setFormData({
      ...formData,
      [targetNameKey]: formData[nameKey],
      [targetDescKey]: formData[descKey],
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background: '#1d1d22',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 px-8 py-6 flex items-center justify-between border-b"
              style={{
                background: '#25252a',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <h2 className="text-2xl font-bold text-white">
                {editingItem ? t('itemForm.update') : t('itemForm.create')}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: '#1d1d22' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#25252a'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1d1d22'}
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6">
              {/* Language Tabs */}
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  {(['lv', 'ru', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveTab(lang)}
                      className="px-4 py-2 rounded-lg font-medium transition-all"
                      style={{
                        background: activeTab === lang ? '#7c2d3a' : '#25252a',
                        color: activeTab === lang ? '#ffffff' : '#9ca3af',
                      }}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                  
                  {activeTab !== 'en' && (
                    <button
                      type="button"
                      onClick={() => copyFromLanguage('en')}
                      className="ml-auto px-4 py-2 rounded-lg font-medium transition-all text-sm"
                      style={{
                        background: '#25252a',
                        color: '#9ca3af',
                      }}
                    >
                      {t('itemForm.copyFrom')} EN
                    </button>
                  )}
                </div>

                {/* Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t(`itemForm.name${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as any)}
                  </label>
                  <input
                    type="text"
                    value={formData[`name${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as 'nameLv' | 'nameRu' | 'nameEn']}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`name${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`]: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                    style={{
                      background: '#25252a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                    required
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t(`itemForm.desc${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as any)}
                  </label>
                  <textarea
                    value={formData[`desc${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as 'descLv' | 'descRu' | 'descEn']}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`desc${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`]: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg outline-none transition-all resize-none"
                    style={{
                      background: '#25252a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('itemForm.type')}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{
                      background: '#25252a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  >
                    <option value="physical">{t('items.typePhysical')}</option>
                    <option value="balance">{t('items.typeBalance')}</option>
                    <option value="virtual">{t('items.typeVirtual')}</option>
                  </select>
                </div>

                {/* Rarity */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('itemForm.rarity')}
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{
                      background: '#25252a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  >
                    {Object.keys(rarityColors).map((rarity) => (
                      <option key={rarity} value={rarity}>
                        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock or Amount */}
                {formData.type !== 'balance' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('itemForm.stock')}
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                      min="0"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('itemForm.amount')}
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                      min="0"
                    />
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('itemForm.image')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Image URL"
                      className="flex-1 px-4 py-3 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                    />
                    <button
                      type="button"
                      className="px-4 py-3 rounded-lg transition-colors"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="mt-6 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: '#7c2d3a' }}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                  {t('itemForm.isActive')}
                </label>
              </div>

              {/* Preview */}
              {formData.image && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('itemForm.preview')}
                  </label>
                  <div
                    className="inline-block p-4 rounded-lg"
                    style={{
                      background: '#25252a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg font-bold transition-all uppercase"
                  style={{
                    background: '#25252a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg font-bold transition-all uppercase"
                  style={{
                    background: '#7c2d3a',
                    border: '1px solid #9a3b4a',
                    color: '#ffffff',
                  }}
                >
                  {t('itemForm.save')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
