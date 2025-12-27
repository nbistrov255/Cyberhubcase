import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';
import { ItemFormModal } from '../components/ItemFormModal';

interface Item {
  id: string;
  nameLv: string;
  nameRu: string;
  nameEn: string;
  type: 'physical' | 'balance' | 'virtual';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  image: string;
  stock: number;
  isActive: boolean;
  lastModified: Date;
}

interface ItemsPageProps {
  userRole: UserRole;
}

export function ItemsPage({ userRole }: ItemsPageProps) {
  const { t, language } = useAdminLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'physical' | 'balance' | 'virtual'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка предметов при монтировании
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/admin/items');
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data.map((item: any) => ({
        ...item,
        lastModified: new Date(item.lastModified || item.updatedAt || Date.now()),
      })));
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const rarityColors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b',
    mythic: '#ef4444',
  };

  const canEdit = ['owner', 'admin'].includes(userRole);

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameLv.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getItemName = (item: Item) => {
    if (language === 'lv') return item.nameLv;
    if (language === 'ru') return item.nameRu;
    return item.nameEn;
  };

  const handleSaveItem = async (itemData: any) => {
    try {
      if (editingItem) {
        // Обновление существующего предмета
        const response = await fetch(`http://localhost:3000/api/admin/items/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });

        if (!response.ok) {
          throw new Error('Failed to update item');
        }

        const updatedItem = await response.json();
        setItems(items.map(item => item.id === editingItem.id ? { ...updatedItem, lastModified: new Date(updatedItem.lastModified || updatedItem.updatedAt) } : item));
      } else {
        // Создание нового предмета
        const response = await fetch('http://localhost:3000/api/admin/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });

        if (!response.ok) {
          throw new Error('Failed to create item');
        }

        const newItem = await response.json();
        setItems([...items, { ...newItem, lastModified: new Date(newItem.lastModified || newItem.createdAt) }]);
      }
      
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item. Please try again.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/admin/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('items.title')}</h1>
          <p className="text-gray-400">Manage all prizes and rewards</p>
        </div>
        {canEdit && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              background: '#7c2d3a',
              color: '#ffffff',
            }}
          >
            <Plus className="w-5 h-5" />
            {t('items.addNew')}
          </motion.button>
        )}
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
            placeholder={t('items.search')}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg outline-none transition-all"
            style={{
              background: '#1d1d22',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
            }}
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
          {(['all', 'physical', 'balance', 'virtual'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className="px-4 py-2.5 rounded-lg font-medium transition-all"
              style={{
                background: filterType === type ? '#7c2d3a' : '#1d1d22',
                color: filterType === type ? '#ffffff' : '#9ca3af',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {t(`items.filter${type.charAt(0).toUpperCase() + type.slice(1)}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table */}
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
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Image</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('items.name')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('items.type')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('items.rarity')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('items.stock')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('items.status')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('items.lastModified')}</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <img
                      src={item.image}
                      alt={getItemName(item)}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{getItemName(item)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 capitalize">{t(`items.type${item.type.charAt(0).toUpperCase() + item.type.slice(1)}` as any)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                      style={{
                        background: `${rarityColors[item.rarity]}20`,
                        color: rarityColors[item.rarity],
                      }}
                    >
                      {item.rarity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-medium ${
                        item.stock === 0 ? 'text-red-400' : item.stock < 10 ? 'text-yellow-400' : 'text-green-400'
                      }`}
                    >
                      {item.type === 'balance' ? '∞' : item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        background: item.isActive ? '#10b98120' : '#6b728020',
                        color: item.isActive ? '#10b981' : '#6b7280',
                      }}
                    >
                      {item.isActive ? t('items.active') : t('items.hidden')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {item.lastModified.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: '#25252a' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowModal(true);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: '#25252a' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: '#25252a' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d32'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#25252a'}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">{t('common.noData')}</p>
          </div>
        )}
      </div>

      {/* Item Form Modal */}
      <ItemFormModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editingItem={editingItem}
      />
    </div>
  );
}