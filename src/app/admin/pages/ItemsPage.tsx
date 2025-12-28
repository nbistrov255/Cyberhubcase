import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';
import { ItemFormModal } from '../components/ItemFormModal';

interface Item {
  id: number;
  type: 'skin' | 'physical' | 'money';
  title: string;
  image_url: string;
  price_eur: number;
  sell_price_eur: number;
  created_at?: string;
}

interface ItemsPageProps {
  userRole: UserRole;
}

export function ItemsPage({ userRole }: ItemsPageProps) {
  const { t, language } = useAdminLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'skin' | 'physical' | 'money'>('all');
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
      const response = await fetch('/api/admin/items');
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = ['owner', 'admin'].includes(userRole);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSaveItem = async (itemData: any) => {
    try {
      const token = localStorage.getItem('session_token');
      
      if (editingItem) {
        // Обновление существующего предмета
        const response = await fetch(`/api/admin/items/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(itemData),
        });

        if (!response.ok) {
          throw new Error('Failed to update item');
        }
      } else {
        // Создание нового предмета
        const response = await fetch('/api/admin/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(itemData),
        });

        if (!response.ok) {
          throw new Error('Failed to create item');
        }
      }

      // Перезагрузка списка
      await fetchItems();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm(t('items.deleteConfirm'))) return;

    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch(`/api/admin/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
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
          {(['all', 'skin', 'physical', 'money'] as const).map((type) => (
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
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('items.price')}</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">{t('items.sellPrice')}</th>
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
                      src={item.image_url}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{item.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 capitalize">{t(`items.type${item.type.charAt(0).toUpperCase() + item.type.slice(1)}` as any)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                      style={{
                        background: '#3b82f620',
                        color: '#3b82f6',
                      }}
                    >
                      {item.price_eur} €
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                      style={{
                        background: '#3b82f620',
                        color: '#3b82f6',
                      }}
                    >
                      {item.sell_price_eur} €
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
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