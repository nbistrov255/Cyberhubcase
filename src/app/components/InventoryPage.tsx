import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { FooterSection } from './FooterSection';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

interface InventoryItem {
  id: number;
  inventory_id: number;
  title: string;
  image_url: string;
  type: 'skin' | 'physical' | 'money';
  sell_price_eur: number;
  price_eur: number;
  created_at: string;
}

interface InventoryPageProps {
  onBack: () => void;
}

export function InventoryPage({ onBack }: InventoryPageProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'skin' | 'physical'>('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('session_token');
      
      const response = await fetch('http://91.107.120.48:3000/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      
      // Filter out money type items (they are auto-added to balance)
      const filteredItems = data.items.filter((item: InventoryItem) => item.type !== 'money');
      setItems(filteredItems);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error(t('inventory.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleSellItem = async (inventoryId: number, sellPrice: number, title: string) => {
    try {
      const token = localStorage.getItem('session_token');
      
      const response = await fetch('http://91.107.120.48:3000/api/inventory/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ inventory_id: inventoryId }),
      });

      if (!response.ok) {
        throw new Error('Failed to sell item');
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove the item from the list without reloading
        setItems(prevItems => prevItems.filter(item => item.inventory_id !== inventoryId));
        
        // Show success notification
        toast.success(`${t('inventory.itemSold')} ${sellPrice}€`);
      } else {
        toast.error(t('inventory.errorSelling'));
      }
    } catch (error) {
      console.error('Error selling item:', error);
      toast.error(t('inventory.errorSelling'));
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: '#17171c' }}>
      {/* Header */}
      <div className="relative" style={{ background: 'linear-gradient(180deg, #1d1d22 0%, #17171c 100%)' }}>
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg mb-6 transition-all"
            style={{
              background: '#1d1d22',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#25252a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1d1d22';
            }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#7c2d3a' }} />
            <span className="text-white font-medium">{t('inventory.back')}</span>
          </button>

          <h1 className="text-4xl font-bold text-white mb-2 uppercase tracking-wider">
            {t('inventory.title')}
          </h1>
          <p className="text-gray-400">{t('inventory.description')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('inventory.search')}
              className="w-full pl-11 pr-4 py-3 rounded-lg outline-none transition-all"
              style={{
                background: '#1d1d22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
              }}
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            {(['all', 'skin', 'physical'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className="px-6 py-3 rounded-lg font-medium transition-all uppercase"
                style={{
                  background: filterType === type ? '#7c2d3a' : '#1d1d22',
                  color: filterType === type ? '#ffffff' : '#9ca3af',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {t(`inventory.filter${type.charAt(0).toUpperCase() + type.slice(1)}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#7c2d3a' }} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">{t('inventory.noItems')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.inventory_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative rounded-xl overflow-hidden group cursor-pointer"
                  style={{
                    background: '#1d1d22',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  onMouseEnter={() => setHoveredItem(item.inventory_id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />

                    {/* Hover Overlay with Sell Button */}
                    <AnimatePresence>
                      {hoveredItem === item.inventory_id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            background: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          <motion.button
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={() => handleSellItem(item.inventory_id, item.sell_price_eur, item.title)}
                            className="px-8 py-4 rounded-lg font-bold uppercase transition-all"
                            style={{
                              background: '#7c2d3a',
                              color: '#ffffff',
                              border: '2px solid #9a3b4a',
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {t('inventory.sell')} {item.sell_price_eur}€
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Type Badge */}
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase"
                      style={{
                        background: item.type === 'skin' ? '#3b82f620' : '#8b5cf620',
                        color: item.type === 'skin' ? '#3b82f6' : '#8b5cf6',
                        border: `1px solid ${item.type === 'skin' ? '#3b82f640' : '#8b5cf640'}`,
                      }}
                    >
                      {t(`inventory.type${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-white font-bold mb-2 truncate">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">{t('inventory.marketPrice')}</p>
                        <p className="text-white font-bold">{item.price_eur}€</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{t('inventory.sellPrice')}</p>
                        <p className="font-bold" style={{ color: '#7c2d3a' }}>
                          {item.sell_price_eur}€
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <FooterSection />
    </div>
  );
}
