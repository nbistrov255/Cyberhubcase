import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Loader2, Info, Trash2, Coins, CircleCheck, CircleX } from 'lucide-react';
import { FooterSection } from './FooterSection';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';
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
  status?: 'available' | 'processing' | 'received';
}

interface InventoryPageProps {
  onBack: () => void;
}

export function InventoryPage({ onBack }: InventoryPageProps) {
  const { t } = useLanguage();
  const { refreshProfile } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'skin' | 'physical' | 'money'>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  // 🔥 AUTO-RESTART POLLING для processing items при возвращении на страницу
  useEffect(() => {
    if (loading) return;
    
    // Находим все items со status='processing'
    const processingItems = items.filter(item => item.status === 'processing');
    
    if (processingItems.length === 0) return;
    
    console.log(`🔄 Found ${processingItems.length} processing items, restarting polling...`);
    
    // Для каждого processing item запускаем polling
    processingItems.forEach(item => {
      startPolling(item.inventory_id, item.type);
    });
  }, [loading]); // Запускаем только после загрузки
  
  const startPolling = (itemId: number, type: string) => {
    console.log(`🔄 Starting polling for item ${itemId}...`);
    
    const pollInterval = setInterval(async () => {
      try {
        const inventoryResponse = await fetch(API_ENDPOINTS.getInventory, { 
          headers: getAuthHeaders() 
        });
        
        if (!inventoryResponse.ok) {
          console.error('❌ Polling failed: API error');
          return;
        }
        
        const inventoryData = await inventoryResponse.json();
        const rawItems = Array.isArray(inventoryData) ? inventoryData : (inventoryData.items || []);
        const normalizedItems = rawItems.map((item: any) => ({
          ...item,
          inventory_id: item.id,
          price_eur: item.price_eur || item.amount_eur || 0,
        }));
        
        const currentItem = normalizedItems.find((i: any) => i.id === itemId);
        
        if (!currentItem) {
          console.log(`✅ Item ${itemId} disappeared = получен!`);
          clearInterval(pollInterval);
          
          setItems(prev => prev.filter(i => i.inventory_id !== itemId));
          
          if (type === 'money') {
            toast.success(
              <div className="flex items-center gap-3">
                <CircleCheck className="w-5 h-5 flex-shrink-0 text-[#4ade80]" />
                <span>Balance added successfully!</span>
              </div>,
              { duration: 4000 }
            );
            await refreshProfile();
          } else {
            toast.success(
              <div className="flex items-center gap-3">
                <CircleCheck className="w-5 h-5 flex-shrink-0" />
                <span>Item received!</span>
              </div>,
              { duration: 4000 }
            );
          }
          return;
        }
        
        if (currentItem.status === 'received') {
          console.log(`✅ Item ${itemId} status = 'received'`);
          clearInterval(pollInterval);
          
          setItems(prev => prev.filter(i => i.inventory_id !== itemId));
          
          if (type === 'money') {
            toast.success(
              <div className="flex items-center gap-3">
                <CircleCheck className="w-5 h-5 flex-shrink-0" />
                <span>Balance added successfully!</span>
              </div>,
              { duration: 4000 }
            );
            await refreshProfile();
          } else {
            toast.success(
              <div className="flex items-center gap-3">
                <CircleCheck className="w-5 h-5 flex-shrink-0" />
                <span>Item received!</span>
              </div>,
              { duration: 4000 }
            );
          }
        } else {
          console.log(`⏳ Item ${itemId} status = '${currentItem.status}', waiting...`);
        }
      } catch (pollError) {
        console.error('❌ Polling error:', pollError);
      }
    }, 2000);
    
    // Timeout 120 секунд
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log(`⏱ Polling timeout for item ${itemId}`);
    }, 120000);
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.getInventory, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      // Нормализация данных
      const rawItems = Array.isArray(data) ? data : (data.items || []);
      const normalizedItems = rawItems.map((item: any) => ({
        ...item,
        inventory_id: item.id,
        price_eur: item.price_eur || item.amount_eur || 0,
      }));
      
      // 🔥 ФИЛЬТРУЕМ ТОЛЬКО полученные items (status='received')
      setItems(normalizedItems.filter((item: any) => item.status !== 'received'));
    } catch (error) {
      toast.error(t('inventory.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleSellItem = async (inventoryId: number, sellPrice: number, title: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.sellItem, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inventory_id: inventoryId }),
      });

      if (!response.ok) {
        throw new Error('Failed to sell item');
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove the item from the list without reloading
        setItems(prevItems => prevItems.filter(item => item.inventory_id !== inventoryId));
        
        // Show success notification with icon
        toast.success(
          <div className="flex items-center gap-3">
            <CircleCheck className="w-5 h-5 flex-shrink-0 text-[#4ade80]" />
            <span>Sold for {sellPrice}€! Balance updated.</span>
          </div>,
          { duration: 4000 }
        );
        
        // Refresh profile to update balance
        await refreshProfile();
      } else {
        toast.error(
          <div className="flex items-center gap-3">
            <CircleX className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />
            <span>Failed to sell item</span>
          </div>,
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error('Error selling item:', error);
      toast.error(
        <div className="flex items-center gap-3">
          <CircleX className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />
          <span>Error selling item</span>
        </div>,
        { duration: 5000 }
      );
    }
  };

  // 🔥 НОВАЯ ЛОГИКА: НЕТ оптимистичного удаления, polling до success
  const handleClaimItem = async (itemId: number, type: string, itemTitle: string = '') => {
    if (processingId) return;
    
    setProcessingId(itemId);
    
    // 1️⃣ Устанавливаем status='processing' локально (показываем loader на карточке)
    setItems(prev => prev.map(i => 
      i.inventory_id === itemId ? { ...i, status: 'processing' as const } : i
    ));
    
    try {
      // 2️⃣ Отправляем запрос на backend
      const response = await fetch(API_ENDPOINTS.claimItem, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inventory_id: itemId }),
      });
      
      const result = await response.json();

      if (!response.ok) {
        // ❌ ОШИБКА - ОТКАТ: возвращаем status='available'
        setItems(prev => prev.map(i => 
          i.inventory_id === itemId ? { ...i, status: 'available' as const } : i
        ));
        
        if (result.error === 'TRADE_LINK_MISSING') {
          toast.error(
            <div className="flex items-center gap-3">
              <CircleX className="w-5 h-5 flex-shrink-0" />
              <span>Please set your Trade Link in Profile first!</span>
            </div>,
            { duration: 5000 }
          );
          setProcessingId(null);
          return;
        }
        throw new Error(result.error);
      }

      // ✅ Запрос принят - начинаем POLLING
      if (result.success) {
        console.log(`🔄 Starting polling for item ${itemId}...`);
        
        // Запускаем polling каждые 2 секунды
        const pollInterval = setInterval(async () => {
          try {
            const inventoryResponse = await fetch(API_ENDPOINTS.getInventory, { 
              headers: getAuthHeaders() 
            });
            
            if (!inventoryResponse.ok) {
              console.error('❌ Polling failed: API error');
              return;
            }
            
            const inventoryData = await inventoryResponse.json();
            const rawItems = Array.isArray(inventoryData) ? inventoryData : (inventoryData.items || []);
            const normalizedItems = rawItems.map((item: any) => ({
              ...item,
              inventory_id: item.id,
              price_eur: item.price_eur || item.amount_eur || 0,
            }));
            
            // Проверяем статус нашего item
            const currentItem = normalizedItems.find((i: any) => i.id === itemId);
            
            if (!currentItem) {
              // Item исчез из inventory (значит получен и удалён backend'ом)
              console.log(`✅ Item ${itemId} disappeared = успешно получен!`);
              clearInterval(pollInterval);
              
              // Убираем из списка
              setItems(prev => prev.filter(i => i.inventory_id !== itemId));
              
              // Показываем success toast
              if (type === 'money') {
                toast.success(
                  <div className="flex items-center gap-3">
                    <CircleCheck className="w-5 h-5 flex-shrink-0" />
                    <span>{result.message || 'Balance added successfully!'}</span>
                  </div>,
                  { duration: 4000 }
                );
                
                // Обновляем баланс в TopBar
                await refreshProfile();
              } else {
                toast.success(
                  <div className="flex items-center gap-3">
                    <CircleCheck className="w-5 h-5 flex-shrink-0" />
                    <span>Request sent to Admin! Wait for approval.</span>
                  </div>,
                  { duration: 4000 }
                );
              }
              
              setProcessingId(null);
              return;
            }
            
            // Обновляем status в UI (если backend вернул другой статус)
            if (currentItem.status === 'received') {
              console.log(`✅ Item ${itemId} status = 'received'`);
              clearInterval(pollInterval);
              
              // Убираем из списка (фильтр в fetchInventory уберёт received)
              setItems(prev => prev.filter(i => i.inventory_id !== itemId));
              
              // Показываем success toast
              if (type === 'money') {
                toast.success(
                  <div className="flex items-center gap-3">
                    <CircleCheck className="w-5 h-5 flex-shrink-0" />
                    <span>Balance added successfully!</span>
                  </div>,
                  { duration: 4000 }
                );
                await refreshProfile();
              } else {
                toast.success(
                  <div className="flex items-center gap-3">
                    <CircleCheck className="w-5 h-5 flex-shrink-0" />
                    <span>Item received!</span>
                  </div>,
                  { duration: 4000 }
                );
              }
              
              setProcessingId(null);
            } else {
              // Ещё processing, продолжаем ждать
              console.log(`⏳ Item ${itemId} status = '${currentItem.status}', waiting...`);
            }
          } catch (pollError) {
            console.error('❌ Polling error:', pollError);
          }
        }, 2000); // Проверяем каждые 2 секунды
        
        // Таймаут 120 секунд (если больше - прерываем polling)
        setTimeout(() => {
          clearInterval(pollInterval);
          console.log(`⏱ Polling timeout for item ${itemId}`);
          setProcessingId(null);
        }, 120000);
      }
    } catch (error) {
      // ❌ КРИТИЧЕСКАЯ ОШИБКА - ОТКАТ
      console.error('❌ Claim error:', error);
      
      setItems(prev => prev.map(i => 
        i.inventory_id === itemId ? { ...i, status: 'available' as const } : i
      ));
      
      toast.error(
        <div className="flex items-center gap-3">
          <CircleX className="w-5 h-5 flex-shrink-0" />
          <span>Failed: {error instanceof Error ? error.message : 'Unknown error'}</span>
        </div>,
        { duration: 6000 }
      );
      
      setProcessingId(null);
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
            {(['all', 'skin', 'physical', 'money'] as const).map((type) => (
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
                    {/* 🔴 DEBUG: Информационная иконка должна быть видна ВСЕГДА (НЕ только при hover) */}
                    <div 
                      className="absolute top-3 left-3 z-20 bg-black/50 rounded-full p-1"
                      title="Вы можете получить данный товар или продать его, и баланс продажи зачислится на ваш личный аккаунт"
                    >
                      <Info 
                        className="w-5 h-5" 
                        style={{ 
                          color: '#ffffff',
                        }} 
                      />
                    </div>

                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />

                    {/* Action Buttons - Shows on Hover at Bottom */}
                    <AnimatePresence>
                      {hoveredItem === item.inventory_id && item.status !== 'processing' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-3 left-3 right-3 z-50 pointer-events-none flex gap-2"
                        >
                          {/* Green ПОЛУЧИТЬ Button */}
                          <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClaimItem(item.inventory_id, item.type, item.title);
                            }}
                            className="flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all pointer-events-auto shadow-lg"
                            style={{
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.4) 100%)',
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              border: '1px solid rgba(16, 185, 129, 0.6)',
                              color: '#10b981',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            ПОЛУЧИТЬ
                          </motion.button>

                          {/* Red Coin Icon Button - Only for non-money items */}
                          {item.type !== 'money' && (
                            <motion.button
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSellItem(item.inventory_id, item.sell_price_eur, item.title);
                              }}
                              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all pointer-events-auto shadow-lg"
                              style={{
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(185, 28, 28, 0.4) 100%)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(239, 68, 68, 0.6)',
                                color: '#ef4444',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                              }}
                              title={`Sell for ${item.sell_price_eur}€`}
                            >
                              <Coins className="w-5 h-5" />
                            </motion.button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Processing Status Overlay */}
                    {item.status === 'processing' && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          background: 'rgba(0, 0, 0, 0.8)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: '#10b981' }} />
                          <p className="text-white font-bold">PROCESSING</p>
                          <p className="text-xs text-gray-400 mt-1">Wait for admin</p>
                        </div>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase"
                      style={{
                        background: 
                          item.type === 'skin' ? '#3b82f620' : 
                          item.type === 'money' ? '#10b98120' : 
                          '#8b5cf620',
                        color: 
                          item.type === 'skin' ? '#3b82f6' : 
                          item.type === 'money' ? '#10b981' : 
                          '#8b5cf6',
                        border: `1px solid ${
                          item.type === 'skin' ? '#3b82f640' : 
                          item.type === 'money' ? '#10b98140' : 
                          '#8b5cf640'
                        }`,
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
                      {item.type !== 'money' && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{t('inventory.sellPrice')}</p>
                          <p className="font-bold" style={{ color: '#7c2d3a' }}>
                            {item.sell_price_eur}€
                          </p>
                        </div>
                      )}
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