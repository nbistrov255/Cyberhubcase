import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';

interface ItemFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  editingItem: any | null;
}

// Цвета для каждого качества
const rarityColors = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  mythic: '#ef4444',
  legendary: '#f59e0b',
};

export function ItemFormModal({ open, onClose, onSave, editingItem }: ItemFormModalProps) {
  const { t } = useAdminLanguage();
  
  const [formData, setFormData] = useState({
    type: 'skin' as 'skin' | 'physical' | 'money',
    title: '',
    image_url: '',
    price_eur: 0,
    sell_price_eur: 0,
    stock: '',
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'mythic' | 'legendary',
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        type: editingItem.type || 'skin',
        title: editingItem.title || '',
        image_url: editingItem.image_url || '',
        price_eur: editingItem.price_eur || 0,
        sell_price_eur: editingItem.sell_price_eur || 0,
        stock: editingItem.stock === -1 ? '' : (editingItem.stock || '').toString(),
        rarity: editingItem.rarity || 'common',
      });
    } else {
      setFormData({
        type: 'skin',
        title: '',
        image_url: '',
        price_eur: 0,
        sell_price_eur: 0,
        stock: '',
        rarity: 'common',
      });
    }
  }, [editingItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 [ItemFormModal] Form submitted');
    console.log('📝 [ItemFormModal] Raw formData:', formData);
    
    // Логика для Stock: если пустое, отправляем -1 (бесконечно)
    const stockValue = formData.stock === '' ? -1 : parseInt(formData.stock) || 0;
    
    // Логика для Sell Price: если не заполнено, равно price_eur
    const sellPriceValue = formData.sell_price_eur || formData.price_eur;
    
    const submissionData = {
      ...formData,
      stock: stockValue,
      sell_price_eur: sellPriceValue,
    };
    
    console.log('📤 [ItemFormModal] Submission data:', submissionData);
    
    onSave(submissionData);
  };

  return (
    <AnimatePresence>
      {open && (
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

          {/* Modal - размер как у CaseFormModal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl rounded-xl overflow-hidden"
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
                {editingItem ? t('itemForm.update') : t('itemForm.create')}
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

            {/* Scrollable Form Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
              <form id="item-form" onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('itemForm.type')}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-lg outline-none"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('itemForm.title')}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('itemForm.image')}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="Image URL"
                        className="flex-1 px-4 py-2.5 rounded-lg outline-none"
                        style={{
                          background: '#25252a',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                        }}
                      />
                      <button
                        type="button"
                        className="px-4 py-2.5 rounded-lg transition-all"
                        style={{
                          background: '#25252a',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2d2d32';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#25252a';
                        }}
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    {formData.image_url && (
                      <div className="mt-3 rounded-lg overflow-hidden" style={{ maxHeight: '200px' }}>
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Price EUR */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('itemForm.priceEur')}
                    </label>
                    <input
                      type="number"
                      value={formData.price_eur}
                      onChange={(e) => setFormData({ ...formData, price_eur: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Sell Price EUR */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('itemForm.sellPriceEur')}
                      <span className="text-xs text-gray-500 ml-2">(Leave empty to use Price EUR)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.sell_price_eur}
                      onChange={(e) => setFormData({ ...formData, sell_price_eur: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                      min="0"
                      step="0.01"
                      placeholder={`Default: ${formData.price_eur} €`}
                    />
                  </div>

                  {/* Stock (Quantity) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity (Stock)
                      <span className="text-xs text-gray-500 ml-2">(Leave empty for infinite ∞)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                      min="0"
                      placeholder="Leave empty for infinite (-1)"
                    />
                    {formData.stock === '' && (
                      <p className="text-xs text-blue-400 mt-2">Stock will be set to infinite (∞)</p>
                    )}
                  </div>

                  {/* Rarity - с цветными точками и legendary в конце */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rarity
                    </label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                    >
                      <option value="common">● Common</option>
                      <option value="rare">● Rare</option>
                      <option value="epic">● Epic</option>
                      <option value="mythic">● Mythic</option>
                      <option value="legendary">● Legendary</option>
                    </select>
                    
                    {/* Визуальная подсказка с цветом */}
                    <div className="mt-2 flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ background: rarityColors[formData.rarity] }}
                      ></div>
                      <span 
                        className="text-sm font-medium capitalize"
                        style={{ color: rarityColors[formData.rarity] }}
                      >
                        {formData.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer - sticky buttons */}
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
                form="item-form"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 rounded-lg font-bold uppercase transition-all"
                style={{
                  background: '#7c2d3a',
                  color: '#ffffff',
                }}
              >
                {t('itemForm.save')}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}