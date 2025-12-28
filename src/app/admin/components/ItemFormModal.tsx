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
  
  const [formData, setFormData] = useState({
    type: 'skin' as 'skin' | 'physical' | 'money',
    title: '',
    image_url: '',
    price_eur: 0,
    sell_price_eur: 0,
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary' | 'mythic',
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        type: editingItem.type || 'skin',
        title: editingItem.title || '',
        image_url: editingItem.image_url || '',
        price_eur: editingItem.price_eur || 0,
        sell_price_eur: editingItem.sell_price_eur || 0,
        rarity: editingItem.rarity || 'common',
      });
    } else {
      setFormData({
        type: 'skin',
        title: '',
        image_url: '',
        price_eur: 0,
        sell_price_eur: 0,
        rarity: 'common',
      });
    }
  }, [editingItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
              {/* Type */}
              <div className="mb-6">
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
                  <option value="skin">{t('items.typeSkin')}</option>
                  <option value="physical">{t('items.typePhysical')}</option>
                  <option value="money">{t('items.typeMoney')}</option>
                </select>
              </div>

              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('itemForm.title')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg outline-none"
                  style={{
                    background: '#25252a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                  }}
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('itemForm.image')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
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

              {/* Price EUR */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('itemForm.priceEur')}
                </label>
                <input
                  type="number"
                  value={formData.price_eur}
                  onChange={(e) => setFormData({ ...formData, price_eur: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg outline-none"
                  style={{
                    background: '#25252a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                  }}
                  min="0"
                />
              </div>

              {/* Sell Price EUR */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('itemForm.sellPriceEur')}
                </label>
                <input
                  type="number"
                  value={formData.sell_price_eur}
                  onChange={(e) => setFormData({ ...formData, sell_price_eur: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg outline-none"
                  style={{
                    background: '#25252a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                  }}
                  min="0"
                />
              </div>

              {/* Rarity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rarity
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
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                  <option value="mythic">Mythic</option>
                </select>
              </div>

              {/* Preview */}
              {formData.image_url && (
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
                      src={formData.image_url}
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