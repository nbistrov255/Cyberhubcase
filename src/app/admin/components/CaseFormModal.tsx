import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Upload, Plus, Trash2, Info } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';

// Rarity type definition
type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

// Default drop rates based on rarity (should match Settings)
const DEFAULT_DROP_RATES: Record<Rarity, number> = {
  common: 50,
  rare: 30,
  epic: 15,
  legendary: 1,
  mythic: 4,
};

interface Item {
  id: string;
  nameLv: string;
  nameRu: string;
  nameEn: string;
  type: 'physical' | 'balance' | 'virtual';
  rarity: Rarity;
  image: string;
  stock: number;
  isActive: boolean;
}

interface CaseItem {
  itemId: string;
  item: Item;
  dropChance: number;
  customChance: boolean;
}

interface Case {
  id: string;
  nameLv: string;
  nameRu: string;
  nameEn: string;
  type: 'daily' | 'monthly' | 'event';
  threshold: number;
  status: 'draft' | 'published' | 'archived';
  image: string;
  lastModified: Date;
  contents?: CaseItem[];
  eventEndsAt?: Date;
  eventDurationDays?: number;
}

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: CaseFormData) => void;
  caseData?: Case | null;
}

export interface CaseFormData {
  id?: string;
  nameLv: string;
  nameRu: string;
  nameEn: string;
  type: 'daily' | 'monthly' | 'event';
  threshold: number;
  status: 'draft' | 'published' | 'archived';
  image: string;
  contents?: CaseItem[];
  eventEndsAt?: Date;
  eventDurationDays?: number;
}

export function CaseFormModal({ isOpen, onClose, onSave, caseData }: CaseFormModalProps) {
  const { t, language } = useAdminLanguage();
  const [activeTab, setActiveTab] = useState<'details' | 'contents'>('details');
  
  const [formData, setFormData] = useState<CaseFormData>({
    nameLv: '',
    nameRu: '',
    nameEn: '',
    type: 'daily',
    threshold: 0,
    status: 'draft',
    image: '',
    contents: [],
  });

  // Mock items from database
  const [availableItems] = useState<Item[]>([
    {
      id: '1',
      nameLv: 'Gaming Austiņas Pro',
      nameRu: 'Игровые наушники Pro',
      nameEn: 'Gaming Headset Pro',
      type: 'physical',
      rarity: 'legendary',
      image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=100&h=100&fit=crop',
      stock: 5,
      isActive: true,
    },
    {
      id: '2',
      nameLv: '€50 Bonuss',
      nameRu: '€50 Бонус',
      nameEn: '€50 Bonus',
      type: 'balance',
      rarity: 'epic',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=100&h=100&fit=crop',
      stock: 0,
      isActive: true,
    },
    {
      id: '3',
      nameLv: 'AK-47 | Redline',
      nameRu: 'AK-47 | Redline',
      nameEn: 'AK-47 | Redline',
      type: 'virtual',
      rarity: 'mythic',
      image: 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?w=100&h=100&fit=crop',
      stock: 2,
      isActive: true,
    },
    {
      id: '4',
      nameLv: '€10 Bonuss',
      nameRu: '€10 Бонус',
      nameEn: '€10 Bonus',
      type: 'balance',
      rarity: 'rare',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=100&h=100&fit=crop',
      stock: 0,
      isActive: true,
    },
    {
      id: '5',
      nameLv: 'Sticker Pack',
      nameRu: 'Пак стикеров',
      nameEn: 'Sticker Pack',
      type: 'virtual',
      rarity: 'common',
      image: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=100&h=100&fit=crop',
      stock: 100,
      isActive: true,
    },
  ]);

  const [showAddItem, setShowAddItem] = useState(false);

  const rarityColors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b',
    mythic: '#ef4444',
  };

  const getItemName = (item: Item) => {
    if (language === 'lv') return item.nameLv;
    if (language === 'ru') return item.nameRu;
    return item.nameEn;
  };

  // Calculate automatic drop chances based on rarity
  const calculateAutoChances = (items: CaseItem[]): CaseItem[] => {
    const totalWeight = items.reduce((sum, item) => {
      return sum + (item.customChance ? 0 : DEFAULT_DROP_RATES[item.item.rarity]);
    }, 0);

    const customTotal = items.reduce((sum, item) => {
      return sum + (item.customChance ? item.dropChance : 0);
    }, 0);

    const remainingPercentage = 100 - customTotal;

    return items.map(item => {
      if (item.customChance) {
        return item;
      }
      const autoChance = totalWeight > 0 
        ? (DEFAULT_DROP_RATES[item.item.rarity] / totalWeight) * remainingPercentage 
        : 0;
      return { ...item, dropChance: parseFloat(autoChance.toFixed(2)) };
    });
  };

  // Add item to case
  const addItemToCase = (item: Item) => {
    const existingItem = formData.contents?.find(ci => ci.itemId === item.id);
    if (existingItem) {
      alert('This item is already in the case!');
      return;
    }

    const newCaseItem: CaseItem = {
      itemId: item.id,
      item: item,
      dropChance: DEFAULT_DROP_RATES[item.rarity],
      customChance: false,
    };

    const updatedContents = [...(formData.contents || []), newCaseItem];
    const recalculated = calculateAutoChances(updatedContents);
    
    setFormData({ ...formData, contents: recalculated });
    setShowAddItem(false);
  };

  // Remove item from case
  const removeItemFromCase = (itemId: string) => {
    const updatedContents = formData.contents?.filter(ci => ci.itemId !== itemId) || [];
    const recalculated = calculateAutoChances(updatedContents);
    setFormData({ ...formData, contents: recalculated });
  };

  // Update custom chance
  const updateItemChance = (itemId: string, newChance: number, isCustom: boolean) => {
    const updatedContents = formData.contents?.map(ci => {
      if (ci.itemId === itemId) {
        return { ...ci, dropChance: newChance, customChance: isCustom };
      }
      return ci;
    }) || [];

    const recalculated = calculateAutoChances(updatedContents);
    setFormData({ ...formData, contents: recalculated });
  };

  // Calculate total chance
  const totalChance = formData.contents?.reduce((sum, item) => sum + item.dropChance, 0) || 0;

  useEffect(() => {
    if (isOpen) {
      if (caseData) {
        setFormData(caseData);
      } else {
        setFormData({
          nameLv: '',
          nameRu: '',
          nameEn: '',
          type: 'daily',
          threshold: 0,
          status: 'draft',
          image: '',
          contents: [],
        });
      }
    }
  }, [caseData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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
              {caseData ? t('cases.editCase') : t('cases.addNew')}
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

          {/* Tabs */}
          <div 
            className="flex border-b"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className="flex-1 px-6 py-4 font-medium transition-all"
              style={{
                color: activeTab === 'details' ? '#7c2d3a' : '#9ca3af',
                borderBottom: activeTab === 'details' ? '2px solid #7c2d3a' : '2px solid transparent',
              }}
            >
              Case Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contents')}
              className="flex-1 px-6 py-4 font-medium transition-all"
              style={{
                color: activeTab === 'contents' ? '#7c2d3a' : '#9ca3af',
                borderBottom: activeTab === 'contents' ? '2px solid #7c2d3a' : '2px solid transparent',
              }}
            >
              Case Contents {formData.contents && formData.contents.length > 0 && `(${formData.contents.length})`}
            </button>
          </div>

          {/* Form */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 240px)' }}>
            {activeTab === 'details' ? (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Names */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      {t('cases.caseName')}
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">English</label>
                        <input
                          type="text"
                          required
                          value={formData.nameEn}
                          onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                          placeholder="Enter case name in English"
                          className="w-full px-4 py-2.5 rounded-lg outline-none"
                          style={{
                            background: '#25252a',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Русский</label>
                        <input
                          type="text"
                          required
                          value={formData.nameRu}
                          onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                          placeholder="Введите название кейса на русском"
                          className="w-full px-4 py-2.5 rounded-lg outline-none"
                          style={{
                            background: '#25252a',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Latviešu</label>
                        <input
                          type="text"
                          required
                          value={formData.nameLv}
                          onChange={(e) => setFormData({ ...formData, nameLv: e.target.value })}
                          placeholder="Ievadiet lietas nosaukumu latviešu valodā"
                          className="w-full px-4 py-2.5 rounded-lg outline-none"
                          style={{
                            background: '#25252a',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('cases.image')}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        required
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/image.png"
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
                    {formData.image && (
                      <div className="mt-3 rounded-lg overflow-hidden" style={{ maxHeight: '200px' }}>
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Type & Threshold */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('cases.type')}
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'daily' | 'monthly' | 'event' })}
                        className="w-full px-4 py-2.5 rounded-lg outline-none"
                        style={{
                          background: '#25252a',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                        }}
                      >
                        <option value="daily">{t('cases.typeDaily')}</option>
                        <option value="monthly">{t('cases.typeMonthly')}</option>
                        <option value="event">{t('cases.typeEvent')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('cases.threshold')}
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.threshold}
                        onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 rounded-lg outline-none"
                        style={{
                          background: '#25252a',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                        }}
                      />
                    </div>
                  </div>

                  {/* Event Duration - Only show for event type */}
                  {formData.type === 'event' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('cases.eventDuration')} (Days)
                      </label>
                      <div className="space-y-3">
                        <input
                          type="number"
                          required
                          min="1"
                          max="365"
                          value={formData.eventDurationDays || ''}
                          onChange={(e) => {
                            const days = parseInt(e.target.value) || 0;
                            const endsAt = new Date();
                            endsAt.setDate(endsAt.getDate() + days);
                            setFormData({ 
                              ...formData, 
                              eventDurationDays: days,
                              eventEndsAt: endsAt
                            });
                          }}
                          placeholder="Enter number of days"
                          className="w-full px-4 py-2.5 rounded-lg outline-none"
                          style={{
                            background: '#25252a',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                          }}
                        />
                        {formData.eventDurationDays && formData.eventDurationDays > 0 && (
                          <div 
                            className="p-3 rounded-lg flex items-center gap-2"
                            style={{
                              background: '#7c2d3a20',
                              border: '1px solid #7c2d3a40',
                            }}
                          >
                            <Info className="w-4 h-4" style={{ color: '#7c2d3a' }} />
                            <div className="text-sm">
                              <p style={{ color: '#7c2d3a' }} className="font-medium">
                                Event will end in {formData.eventDurationDays} day{formData.eventDurationDays !== 1 ? 's' : ''}
                              </p>
                              {formData.eventEndsAt && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Countdown will start from: {formData.eventEndsAt.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('cases.status')}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                      className="w-full px-4 py-2.5 rounded-lg outline-none"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                    >
                      <option value="draft">{t('cases.draft')}</option>
                      <option value="published">{t('cases.published')}</option>
                      <option value="archived">{t('cases.archived')}</option>
                    </select>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-6">
                <div className="space-y-6">
                  {/* Header Info */}
                  <div 
                    className="flex items-center gap-2 p-4 rounded-lg"
                    style={{ background: '#25252a', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  >
                    <Info className="w-5 h-5" style={{ color: '#7c2d3a' }} />
                    <div>
                      <p className="text-sm text-gray-300">
                        Add items and manage drop chances. Total must equal 100%.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Default rates: Common 50%, Rare 30%, Epic 15%, Legendary 4%, Mythic 1%
                      </p>
                    </div>
                  </div>

                  {/* Add Item Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddItem(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all"
                    style={{
                      background: '#7c2d3a',
                      color: '#ffffff',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#973f4a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#7c2d3a';
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    Add Item to Case
                  </button>

                  {/* Add Item Modal */}
                  <AnimatePresence>
                    {showAddItem && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowAddItem(false)}
                          className="fixed inset-0 z-[60]"
                          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-xl overflow-hidden z-[70]"
                          style={{
                            background: '#1d1d22',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            maxHeight: '70vh',
                          }}
                        >
                          {/* Modal Header */}
                          <div 
                            className="flex items-center justify-between p-6 border-b"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          >
                            <h3 className="text-xl font-bold text-white">Select Item</h3>
                            <button
                              onClick={() => setShowAddItem(false)}
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

                          {/* Items List */}
                          <div className="p-6 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 140px)' }}>
                            {availableItems.filter(item => !formData.contents?.find(ci => ci.itemId === item.id)).map(item => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => addItemToCase(item)}
                                className="w-full flex items-center gap-4 p-4 rounded-lg transition-all"
                                style={{
                                  background: '#25252a',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#2d2d32';
                                  e.currentTarget.style.borderColor = '#7c2d3a';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#25252a';
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                              >
                                {/* Item Image */}
                                <div 
                                  className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                                  style={{ border: `2px solid ${rarityColors[item.rarity]}` }}
                                >
                                  <img
                                    src={item.image}
                                    alt={getItemName(item)}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                {/* Item Info */}
                                <div className="flex-1 text-left">
                                  <p className="text-sm font-medium text-white">
                                    {getItemName(item)}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span
                                      className="text-xs font-bold uppercase px-2 py-0.5 rounded"
                                      style={{
                                        background: `${rarityColors[item.rarity]}20`,
                                        color: rarityColors[item.rarity],
                                      }}
                                    >
                                      {item.rarity}
                                    </span>
                                    <span className="text-xs text-gray-500 capitalize">
                                      {item.type}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Stock: {item.stock}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Default drop: {DEFAULT_DROP_RATES[item.rarity]}%
                                  </p>
                                </div>

                                {/* Add Icon */}
                                <Plus className="w-5 h-5" style={{ color: '#7c2d3a' }} />
                              </button>
                            ))}

                            {availableItems.filter(item => !formData.contents?.find(ci => ci.itemId === item.id)).length === 0 && (
                              <div className="text-center py-8">
                                <p className="text-gray-400">All items have been added to this case.</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* Case Contents List */}
                  {formData.contents && formData.contents.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-300">
                        Case Items ({formData.contents.length})
                      </h3>

                      {formData.contents.map(caseItem => (
                        <div
                          key={caseItem.itemId}
                          className="rounded-lg p-4 transition-all"
                          style={{
                            background: '#25252a',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <div className="flex items-center gap-4">
                            {/* Item Image */}
                            <div 
                              className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                              style={{ border: `2px solid ${rarityColors[caseItem.item.rarity]}` }}
                            >
                              <img
                                src={caseItem.item.image}
                                alt={getItemName(caseItem.item)}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Item Info */}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">
                                {getItemName(caseItem.item)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className="text-xs font-bold uppercase px-2 py-0.5 rounded"
                                  style={{
                                    background: `${rarityColors[caseItem.item.rarity]}20`,
                                    color: rarityColors[caseItem.item.rarity],
                                  }}
                                >
                                  {caseItem.item.rarity}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">
                                  {caseItem.item.type}
                                </span>
                              </div>
                            </div>

                            {/* Drop Chance Controls */}
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-xs text-gray-500 mb-1">Drop Chance</p>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={caseItem.dropChance}
                                    onChange={(e) => {
                                      const newValue = parseFloat(e.target.value) || 0;
                                      if (newValue <= 100) {
                                        updateItemChance(caseItem.itemId, newValue, true);
                                      }
                                    }}
                                    className="w-20 px-3 py-1.5 rounded-lg outline-none text-center"
                                    style={{
                                      background: '#1d1d22',
                                      border: caseItem.customChance 
                                        ? '1px solid #7c2d3a' 
                                        : '1px solid rgba(255, 255, 255, 0.1)',
                                      color: '#ffffff',
                                    }}
                                  />
                                  <span className="text-sm text-gray-400">%</span>
                                </div>
                              </div>

                              {/* Reset to Auto */}
                              {caseItem.customChance && (
                                <button
                                  type="button"
                                  onClick={() => updateItemChance(caseItem.itemId, DEFAULT_DROP_RATES[caseItem.item.rarity], false)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                  style={{
                                    background: '#1d1d22',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#9ca3af',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#7c2d3a';
                                    e.currentTarget.style.color = '#7c2d3a';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.color = '#9ca3af';
                                  }}
                                >
                                  Auto
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => removeItemFromCase(caseItem.itemId)}
                                className="p-2 rounded-lg transition-all"
                                style={{
                                  background: '#1d1d22',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#ef444420';
                                  e.currentTarget.style.borderColor = '#ef4444';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#1d1d22';
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>

                          {/* Custom Warning */}
                          {caseItem.customChance && (
                            <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: '#f59e0b' }}>
                              <Info className="w-3 h-3" />
                              <span>Custom drop chance (other items auto-adjusted)</span>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Total Chance Summary */}
                      <div 
                        className="rounded-lg p-4"
                        style={{
                          background: totalChance.toFixed(2) === '100.00' 
                            ? '#10b98120' 
                            : '#ef444420',
                          border: `1px solid ${totalChance.toFixed(2) === '100.00' ? '#10b981' : '#ef4444'}`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">
                            Total Drop Chance
                          </span>
                          <span 
                            className="text-lg font-bold"
                            style={{ 
                              color: totalChance.toFixed(2) === '100.00' ? '#10b981' : '#ef4444' 
                            }}
                          >
                            {totalChance.toFixed(2)}%
                          </span>
                        </div>
                        {totalChance.toFixed(2) !== '100.00' && (
                          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                            Warning: Total must equal 100%
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="text-center py-12 rounded-lg"
                      style={{ background: '#25252a' }}
                    >
                      <p className="text-gray-400">No items added to this case yet.</p>
                      <p className="text-sm text-gray-500 mt-2">Click "Add Item to Case" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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