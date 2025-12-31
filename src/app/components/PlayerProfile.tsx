import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Edit2, Save, HelpCircle, X, CheckCircle, Clock, Minimize2, Maximize2, ChevronLeft, ChevronRight, Info, Trash2, Check, Coins, CircleCheck, CircleX, Loader2, RotateCcw } from 'lucide-react';
import { FooterSection } from './FooterSection';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import { toast } from 'sonner';

interface PlayerProfileProps {
  isPrivate: boolean;
  playerName: string;
  onBack: () => void;
}

interface ClaimRequest {
  id: number; // 🔥 Изменён на number для соответствия inventory_id
  requestId: string;
  itemName: string;
  itemRarity: keyof typeof rarityColors;
  timestamp: Date;
  status: 'pending' | 'approved' | 'denied'; // 🔥 ИЗМЕНЕНО: 'rejected' → 'denied'
  timeRemaining: number; // seconds
}

const rarityColors = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#eab308',
  mythic: '#ef4444',
  Common: '#6b7280',
  Rare: '#3b82f6',
  Epic: '#a855f7',
  Legendary: '#eab308',
  Mythic: '#ef4444',
};

// Generate random request ID
function generateRequestId(): string {
  return `REQ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

// Format time remaining (seconds to MM:SS)
function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Countdown Timer Component
function CountdownTimer({ 
  request, 
  onUpdate,
  onTimeout 
}: { 
  request: ClaimRequest; 
  onUpdate: (id: number, timeRemaining: number) => void;
  onTimeout?: (id: number) => void;
}) {
  useEffect(() => {
    const interval = setInterval(() => {
      if (request.timeRemaining > 0) {
        onUpdate(request.id, request.timeRemaining - 1);
      } else if (request.timeRemaining === 0 && onTimeout) {
        // Таймер истёк - вызываем callback для автоотмены
        onTimeout(request.id);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [request.id, request.timeRemaining, onUpdate, onTimeout]);

  return null;
}

export function PlayerProfile({ isPrivate, playerName, onBack }: PlayerProfileProps) {
  const { profile, refreshProfile } = useAuth();
  const [tradeLink, setTradeLink] = useState('https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=abcdef');
  const [isEditingTradeLink, setIsEditingTradeLink] = useState(false);
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([]);
  const [hoveredItemId, setHoveredItemId] = useState<number | null>(null); // 🔥 Изменён на number
  const [minimizedRequests, setMinimizedRequests] = useState<Set<number>>(new Set()); // 🔥 Изменён на number
  const [inventoryPage, setInventoryPage] = useState(0);
  const [winHistoryPage, setWinHistoryPage] = useState(0);
  const [profileBackground, setProfileBackground] = useState('https://i.ibb.co/0jf2XZFw/Chat-GPT-Image-25-2025-00-01-32.png');
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null); // 🔥 Изменён на number для правильного сравнения
  
  const [winHistory, setWinHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // 🔥 HELPER: Очистка processingId и localStorage
  const clearProcessingId = () => {
    setProcessingId(null);
    try {
      localStorage.removeItem('player_profile_processing_id');
      console.log(`🗑️ [PlayerProfile] Cleared processingId from localStorage`);
    } catch (error) {
      console.error('Error clearing processingId from localStorage:', error);
    }
  };

  // 🔥 ВОССТАНОВЛЕНИЕ processingId из localStorage при загрузке
  useEffect(() => {
    try {
      const savedProcessingId = localStorage.getItem('player_profile_processing_id');
      if (savedProcessingId) {
        const itemId = parseInt(savedProcessingId, 10); // 🔥 Преобразуем в число!
        console.log(`📦 [PlayerProfile] Restored processingId from localStorage: ${itemId}`);
        setProcessingId(itemId);
      }
    } catch (error) {
      console.error('Error loading processingId from localStorage:', error);
    }
  }, []);

  // 🔥 ВОССТАНОВЛЕНИЕ claimRequests из localStorage при загрузке
  useEffect(() => {
    try {
      const savedRequests = localStorage.getItem('player_profile_claim_requests');
      if (savedRequests) {
        const parsed = JSON.parse(savedRequests);
        // Преобразуем timestamp обратно в Date
        const requests = parsed.map((req: any) => ({
          ...req,
          timestamp: new Date(req.timestamp),
        }));
        console.log(`📦 [PlayerProfile] Restored ${requests.length} claim requests from localStorage`);
        setClaimRequests(requests);
      }
    } catch (error) {
      console.error('Error loading claim requests from localStorage:', error);
    }
  }, []);

  // 🔥 СОХРАНЕНИЕ claimRequests в localStorage при изменении
  useEffect(() => {
    try {
      if (claimRequests.length > 0) {
        localStorage.setItem('player_profile_claim_requests', JSON.stringify(claimRequests));
        console.log(`💾 [PlayerProfile] Saved ${claimRequests.length} claim requests to localStorage`);
      } else {
        localStorage.removeItem('player_profile_claim_requests');
      }
    } catch (error) {
      console.error('Error saving claim requests to localStorage:', error);
    }
  }, [claimRequests]);

  // Загрузка фона профиля из настроек
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('siteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.profileBackground) {
          setProfileBackground(settings.profileBackground);
        }
      }
    } catch (error) {
      console.error('Error loading profile background:', error);
    }
  }, []);

  // 🔥 ФУНКЦИЯ загрузки инвентаря (вынесена наружу для повторного использования)
  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      
      // 🔥 Добавляем timeout 10 секунд
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('/api/inventory', {
        headers: getAuthHeaders(),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 [PlayerProfile] Inventory data from backend:', data);
        
        // ✅ Бэкенд возвращает { items: [...] }, а не просто массив
        const items = data.items || (Array.isArray(data) ? data : []);
        
        console.log(`📦 [PlayerProfile] Loaded ${items.length} items from backend`);
        
        setInventory(items.map((item: any) => ({
           ...item,
           id: item.inventory_id || item.id, // Нормализация ID
           date: new Date(item.created_at || Date.now())
        })));
      } else {
        console.error('❌ [PlayerProfile] Failed to fetch inventory:', response.status);
        setInventory([]);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ [PlayerProfile] Inventory fetch timeout (10s)');
        toast.error('Loading timeout. Please try again.');
      } else {
        console.error('❌ [PlayerProfile] Error fetching inventory:', error);
      }
      setInventory([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  // ✅ ЗАГРУЗКА ИНВЕНТАРЯ (ИСПРАВЛЕНО)
  useEffect(() => {
    fetchInventory();
  }, []);

  // 🔥 AUTO-RESTART POLLING для processing items при возвращении на страницу
  useEffect(() => {
    if (loadingInventory) return;
    if (!processingId) return; // 🔥 Ждём восстановления processingId из localStorage
    
    // Находим item с processingId
    const processingItem = inventory.find(item => item.id === processingId);
    
    if (!processingItem) {
      console.log(`⚠️ [PlayerProfile] Processing item ${processingId} not found in inventory, clearing...`);
      clearProcessingId();
      return;
    }
    
    console.log(`🔄 [PlayerProfile] Found processing item ${processingId}, restarting polling...`);
    // Запускаем polling для этого item
    startPolling(processingId, processingItem.type || 'skin');
  }, [loadingInventory, processingId, inventory]);

  // 🔥 POLLING для статуса заявок (skins/physical)
  useEffect(() => {
    if (claimRequests.length === 0) return;
    
    const pollInterval = setInterval(async () => {
      try {
        // Запрашиваем СВОИ заявки из backend
        const response = await fetch(API_ENDPOINTS.getUserRequests, {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        // Проверяем статус каждой активной заявки
        claimRequests.forEach((localRequest) => {
          const serverRequest = (data || []).find((r: any) => r.id === localRequest.id);
          
          if (serverRequest) {
            if (serverRequest.status === 'approved' && localRequest.status !== 'approved') {
              // ✅ Заявка одобрена - ОБНОВЛЯЕМ СТАТУС (не удаляем сразу)
              console.log(`✅ [PlayerProfile] Request ${localRequest.id} approved!`);
              
              // Обновляем статус в pop-up
              setClaimRequests(prev => prev.map(req => 
                req.id === localRequest.id 
                  ? { ...req, status: 'approved' as const } 
                  : req
              ));
              
              // Удаляем item из inventory
              setInventory(prev => prev.filter(i => i.id !== localRequest.id));
              
              toast.success(
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 text-[#4ade80]" />
                  <span>Request approved! Item will be sent to your Steam account.</span>
                </div>,
                { duration: 5000 }
              );
              
              // 🔥 АВТОЗАКРЫТИЕ через 5 секунд
              setTimeout(() => {
                handleRemoveRequest(localRequest.id);
                clearProcessingId();
              }, 5000);
              
            } else if ((serverRequest.status === 'denied' || serverRequest.status === 'expired') && localRequest.status !== 'denied') {
              // ❌ Заявка отклонена или истекла - ОБНОВЛЯЕМ СТАТУС
              console.log(`❌ [PlayerProfile] Request ${localRequest.id} ${serverRequest.status}!`);
              
              // Обновляем статус в pop-up
              setClaimRequests(prev => prev.map(req => 
                req.id === localRequest.id 
                  ? { ...req, status: 'denied' as const } 
                  : req
              ));
              
              toast.error(
                <div className="flex items-center gap-3">
                  <CircleX className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />
                  <span>Request {serverRequest.status === 'denied' ? 'denied' : 'expired'} by admin</span>
                </div>,
                { duration: 5000 }
              );
              
              // 🔥 АВТОЗАКРЫТИЕ через 5 секунд
              setTimeout(() => {
                handleRemoveRequest(localRequest.id);
                clearProcessingId();
              }, 5000);
            }
          }
        });
      } catch (error) {
        console.error('❌ [PlayerProfile] Polling error:', error);
      }
    }, 3000); // Проверяем каждые 3 секунды
    
    return () => clearInterval(pollInterval);
  }, [claimRequests]);

  // ✅ ЗАГРУЗКА ИСТОРИИ (НОВОЕ)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        // Используем новый эндпоинт, который мы добавили в бэкенд
        const response = await fetch('/api/user/history', {
            headers: getAuthHeaders(),
        });

        if (response.ok) {
            const data = await response.json();
            const history = data.history || [];
            
            setWinHistory(history.map((spin: any) => ({
                id: spin.id,
                itemName: spin.prize_title,
                itemImage: spin.image_url,
                rarity: spin.rarity || 'common',
                // Case name пока не хранится в spins, ставим заглушку или берем из логики
                caseName: 'Case Drop', 
                timestamp: new Date(spin.created_at)
            })));
        }
      } catch (e) {
          console.error("History error:", e);
      } finally {
          setLoadingHistory(false);
      }
    };
    
    fetchHistory();
  }, []);

  // Расчет уровня и XP на основе депозитов
  const level = profile?.level || Math.floor((profile?.dailySum || 0) / 100) + 1;
  const currentXP = (profile?.dailySum || 0) % 100;
  const requiredXP = 100;
  const xpProgress = (currentXP / requiredXP) * 100;
  const openedCases = profile?.openedCases || winHistory.length || 0; // ✅ Берем из истории, если в профиле нет

  // Имя и аватар игрока из профиля
  const displayName = profile?.nickname || playerName;
  const avatarUrl = profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';

  // Pagination constants
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(inventory.length / ITEMS_PER_PAGE);
  const startIndex = inventoryPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = inventory.slice(startIndex, endIndex);

  // Win History Pagination
  const totalWinHistoryPages = Math.ceil(winHistory.length / ITEMS_PER_PAGE);
  const winHistoryStartIndex = winHistoryPage * ITEMS_PER_PAGE;
  const winHistoryEndIndex = winHistoryStartIndex + ITEMS_PER_PAGE;
  const currentWinHistoryItems = winHistory.slice(winHistoryStartIndex, winHistoryEndIndex);

  const handleNextPage = () => {
    if (inventoryPage < totalPages - 1) {
      setInventoryPage(inventoryPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (inventoryPage > 0) {
      setInventoryPage(inventoryPage - 1);
    }
  };

  const handleSaveTradeLink = async () => {
    setIsSavingLink(true);
    try {
        const response = await fetch(API_ENDPOINTS.updateTradeLink, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ trade_link: tradeLink }),
        });
        
        if (!response.ok) throw new Error('Failed to save');
        
        toast.success('Trade Link saved successfully!');
        setIsEditingTradeLink(false);
    } catch (e) {
        toast.error('Failed to save Trade Link');
    } finally {
        setIsSavingLink(false);
    }
  };

  // 🔥 POLLING функция для отслеживания статуса item
  const startPolling = (itemId: number, type: string) => {
    console.log(`🔄 [PlayerProfile] Starting polling for item ${itemId}...`);
    
    const pollInterval = setInterval(async () => {
      try {
        const inventoryResponse = await fetch('/api/inventory', { 
          headers: getAuthHeaders() 
        });
        
        if (!inventoryResponse.ok) {
          console.error('❌ Polling failed: API error');
          return;
        }
        
        const inventoryData = await inventoryResponse.json();
        const rawItems = inventoryData.items || (Array.isArray(inventoryData) ? inventoryData : []);
        const normalizedItems = rawItems.map((item: any) => ({
          ...item,
          id: item.inventory_id || item.id,
        }));
        
        const currentItem = normalizedItems.find((i: any) => i.id === itemId);
        
        if (!currentItem) {
          // Item исчез из inventory (успешно получен)
          console.log(`✅ [PlayerProfile] Item ${itemId} disappeared = успешно получен!`);
          clearInterval(pollInterval);
          
          // Убираем из списка
          setInventory(prev => prev.filter(i => i.id !== itemId));
          
          // Показываем success toast
          if (type === 'money' || type?.includes('money')) {
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
                <CircleCheck className="w-5 h-5 flex-shrink-0 text-[#4ade80]" />
                <span>Item sent to your Steam account! Check your trade offers.</span>
              </div>,
              { duration: 4000 }
            );
          }
          
          clearProcessingId();
          return;
        }
        
        // Проверяем статус
        if (currentItem.status === 'received') {
          console.log(`✅ [PlayerProfile] Item ${itemId} status = 'received'`);
          clearInterval(pollInterval);
          
          setInventory(prev => prev.filter(i => i.id !== itemId));
          
          if (type === 'money' || type?.includes('money')) {
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
                <CircleCheck className="w-5 h-5 flex-shrink-0 text-[#4ade80]" />
                <span>Item received!</span>
              </div>,
              { duration: 4000 }
            );
          }
          
          clearProcessingId();
        } else if (currentItem.status === 'available') {
          // 🔥 ОТКАТ: Backend вернул item в available (ошибка на сервере)
          console.log(`❌ [PlayerProfile] Item ${itemId} rolled back to 'available'`);
          clearInterval(pollInterval);
          
          toast.error(
            <div className="flex items-center gap-3">
              <CircleX className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />
              <span>Server error! Please try again later.</span>
            </div>,
            { duration: 6000 }
          );
          
          clearProcessingId();
        } else {
          console.log(`⏳ [PlayerProfile] Item ${itemId} status = '${currentItem.status}', waiting...`);
        }
      } catch (pollError) {
        console.error('❌ Polling error:', pollError);
      }
    }, 500); // 🔥 Polling каждые 500мс
    
    // Timeout 120 секунд
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log(`⏱ [PlayerProfile] Polling timeout for item ${itemId}`);
      clearProcessingId();
    }, 120000);
  };

  const handleClaimItem = async (itemId: number, itemType?: string) => {
    if (processingId) return;
    
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    // 🔥 ПРОВЕРКА: если item уже processing на backend - показываем ошибку
    if (item.status === 'processing') {
      toast.error(
        <div className="flex items-center gap-3">
          <CircleX className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />
          <span>This item is already being processed. Please wait or refresh the page.</span>
        </div>,
        { duration: 5000 }
      );
      return;
    }

    setProcessingId(itemId);
    
    // 🔥 СОХРАНЯЕМ processingId в localStorage
    try {
      localStorage.setItem('player_profile_processing_id', itemId.toString());
      console.log(`💾 [PlayerProfile] Saved processingId to localStorage: ${itemId}`);
    } catch (error) {
      console.error('Error saving processingId to localStorage:', error);
    }

    try {
      // Отправляем запрос на backend
      const response = await fetch(API_ENDPOINTS.claimItem, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inventory_id: itemId }),
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'TRADE_LINK_MISSING') {
          toast.error(
            <div className="flex items-center gap-3">
              <CircleX className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />
              <span>Please set your Trade Link in Profile first!</span>
            </div>,
            { duration: 5000 }
          );
          clearProcessingId();
          return;
        }
        
        // 🔥 Если backend возвращает "Item not available" - показываем инструкцию
        if (result.error?.includes('not available') || result.error?.includes('processing')) {
          toast.error(
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <CircleX className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />
                <span className="font-bold">Item is stuck in processing!</span>
              </div>
              <span className="text-sm text-gray-300">
                Click the "Refresh" button above inventory to reload data from server.
              </span>
            </div>,
            { duration: 8000 }
          );
          clearProcessingId();
          return;
        }
        
        throw new Error(result.error);
      }

      // ✅ Запрос принят
      if (result.success) {
        console.log(`🔄 [PlayerProfile] Request accepted for item ${itemId}...`);
        const type = itemType || item.type;
        
        // 🔥 РАЗНАЯ ЛОГИКА для money vs skins/physical
        if (type === 'money' || type?.includes('money')) {
          // Money - мгновенный polling
          startPolling(itemId, type);
        } else {
          // Skins/Physical - показываем pop-up уведомление
          toast.success('Request sent to Admin!');
          
          const newRequest: ClaimRequest = {
            id: itemId,
            requestId: result.requestId || generateRequestId(), // Используем requestId из backend или генерируем
            itemName: item.title || item.name || 'Unknown Item',
            itemRarity: (item.rarity || 'common') as keyof typeof rarityColors,
            timestamp: new Date(),
            status: 'pending',
            timeRemaining: 3600, // 60 минут в секундах
          };
          
          setClaimRequests(prev => [...prev, newRequest]);
          // НЕ очищаем processingId - он будет показывать loader на карточке
        }
      }
    } catch (error) {
      console.error('❌ [PlayerProfile] Claim error:', error);
      
      toast.error(
        <div className="flex items-center gap-3">
          <CircleX className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />
          <span>Failed: {error instanceof Error ? error.message : 'Unknown error'}</span>
        </div>,
        { duration: 6000 }
      );
      
      clearProcessingId();
    }
  };

  const handleSellItem = async (itemId: number, sellPrice: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.sellItem, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inventory_id: itemId }),
      });

      if (!response.ok) throw new Error('Failed to sell');

      const result = await response.json();
      if (result.success) {
        setInventory(prev => prev.filter(i => i.id !== itemId));
        toast.success(`Item sold for ${sellPrice}€`);
      } else {
        toast.error('Failed to sell item');
      }
    } catch (error) {
      toast.error('Failed to sell item');
    }
  };

  const handleRemoveRequest = (itemId: number) => {
    setClaimRequests(prev => prev.filter(req => req.id !== itemId));
  };

  const handleToggleMinimize = (itemId: number) => {
    setMinimizedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen px-12 py-8 bg-[#17171c]">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-[Aldrich] transition-all border-2"
          style={{
            backgroundColor: '#17171c',
            borderColor: '#ffffff20',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1f1f25';
            e.currentTarget.style.borderColor = '#ffffff30';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#17171c';
            e.currentTarget.style.borderColor = '#ffffff20';
          }}
        >
          {/* Filled Triangle Arrow */}
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 1L2 7L10 13V1Z" fill="white"/>
          </svg>
          <span className="font-bold text-sm tracking-wider uppercase">НАЗАД</span>
        </motion.button>
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div 
          className="relative rounded-3xl overflow-hidden border-2 border-white/10 p-12" 
          style={{ 
            backgroundColor: '#131217',
            backgroundImage: `url(${profileBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" style={{ zIndex: 1 }} />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Avatar with XP Ring */}
            <div className="relative mb-6 flex items-center justify-center" style={{ width: '200px', height: '200px' }}>
              {/* Horizontal Rectangle with Diagonal Cuts Background Shape */}
              <svg 
                className="absolute" 
                style={{ 
                  width: '780px', 
                  height: '120px',
                  opacity: 1,
                  zIndex: 0,
                }}
                viewBox="0 0 780 120"
              >
                {/* Horizontal rectangle with diagonal cuts on left and right */}
                <polygon
                  points="90,0 690,0 780,60 690,120 90,120 0,60"
                  fill="#17171C"
                  stroke="#2A2F36"
                  strokeWidth="1.5"
                />
              </svg>
              
              {/* XP Progress Ring */}
              <svg 
                className="absolute inset-0 w-full h-full" 
                style={{ transform: 'rotate(-90deg)', zIndex: 10 }} 
                viewBox="0 0 200 200"
              >
                {/* Filter for glow */}
                <defs>
                  <filter id="glowFilter">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Background circle - same color with 20% opacity */}
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke="#ffa629"
                  strokeWidth="10"
                  strokeLinecap="round"
                  opacity="0.2"
                />
                
                {/* Progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke="#ffa629"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - xpProgress / 100)}`}
                  filter="url(#glowFilter)"
                />
              </svg>
              
              {/* Avatar */}
              <div className="relative w-40 h-40 rounded-full overflow-hidden" style={{ zIndex: 20 }}>
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Level Badge - Small graphite-black */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-full px-3 py-1 z-20 border border-white/10 shadow-lg" style={{ zIndex: 30 }}>
                <span className="text-xs font-bold text-white/90 tracking-wide">LVL {level}</span>
              </div>
            </div>

            {/* Player Name */}
            <h1 className="text-4xl font-bold mb-2">{displayName}</h1>

            {/* Stats Row */}
            <div className="flex items-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold">{level}</div>
                <div className="text-sm text-gray-400">Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{currentXP.toLocaleString()}</div>
                <div className="text-sm text-gray-400">XP Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{openedCases}</div>
                <div className="text-sm text-gray-400">Cases Opened</div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full max-w-md mt-6">
              <div className="flex items-center gap-3">
                {/* Current Level */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-lg font-bold font-[Aldrich] text-sm"
                    style={{
                      backgroundColor: '#ffa629',
                      color: '#1a1b20',
                    }}
                  >
                    {level}
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-[Aldrich]">LVL</span>
                </div>

                {/* Progress Bar */}
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{currentXP.toLocaleString()} XP</span>
                    <span>{requiredXP.toLocaleString()} XP</span>
                  </div>
                  <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-600 to-yellow-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>

                {/* Next Level */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-lg font-bold font-[Aldrich] text-sm"
                    style={{
                      backgroundColor: 'rgba(255, 166, 41, 0.15)',
                      color: '#ffa629',
                      border: '2px solid #ffa629',
                    }}
                  >
                    {level + 1}
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-[Aldrich]">LVL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Link Section (Private Only) */}
      {isPrivate && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="border border-white/10 rounded-2xl p-6" style={{ backgroundColor: '#131217' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">TRADE LINK</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLevelsModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                How do levels work?
              </motion.button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={tradeLink}
                onChange={(e) => setTradeLink(e.target.value)}
                disabled={!isEditingTradeLink}
                className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 disabled:opacity-70"
              />
              {isEditingTradeLink ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveTradeLink}
                  className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 rounded-xl font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  SAVE
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditingTradeLink(true)}
                  className="px-6 py-3 bg-gradient-to-r from-red-900 to-red-700 rounded-xl font-bold flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  EDIT
                </motion.button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Inventory Preview - Full Width with Pagination */}
        <div className="relative">
          {/* Left Arrow - Absolute positioned outside */}
          {inventoryPage > 0 && (
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevPage}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl z-10"
              style={{
                backgroundColor: '#1f1f25',
                border: '2px solid #ffffff20',
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          )}

          {/* Right Arrow - Absolute positioned outside */}
          {inventoryPage < totalPages - 1 && (
            <motion.button
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextPage}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl z-10"
              style={{
                backgroundColor: '#1f1f25',
                border: '2px solid #ffffff20',
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}

          {/* Inventory Block */}
          <div className="border border-white/10 rounded-2xl p-6 pr-8" style={{ backgroundColor: '#131217' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-[Rajdhani] uppercase">MY INVENTORY</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // 🔥 СНАЧАЛА очищаем processingId, ПОТОМ загружаем inventory
                  clearProcessingId();
                  setLoadingInventory(true);
                  fetchInventory();
                  toast.success('Refreshing inventory...');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: 'linear-gradient(135deg, #7c2d3a 0%, #5a1f2a 100%)',
                  color: '#ffffff',
                  border: '1px solid rgba(124, 45, 58, 0.5)',
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Refresh
              </motion.button>
            </div>
            
            {/* Inventory Container */}
            <div 
              className="overflow-hidden"
              style={{
                minHeight: '220px',
              }}
            >
              <AnimatePresence mode="wait">
                {loadingInventory ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white/30 mb-4"></div>
                    <p className="text-gray-400">Loading inventory...</p>
                  </motion.div>
                ) : inventory.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <p className="text-xl text-gray-400 mb-2">Inventory is empty</p>
                    <p className="text-sm text-gray-500">Open cases to win prizes!</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={inventoryPage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-5 gap-3"
                  >
                    {currentItems.map((item) => {
                    const isHovered = hoveredItemId === item.id;
                    const hasClaimRequest = claimRequests.some(req => req.id === item.id);
                    
                    // Split item name (e.g., "AK-47 | Fire Serpent" -> ["AK-47", "Fire Serpent"])
                    const itemName = item.title || item.name || 'Unknown Item';
                    const nameParts = itemName.split(' | ');
                    const weaponName = nameParts[0] || '';
                    const skinName = nameParts[1] || itemName;
                    const itemRarity = (item.rarity || 'common') as keyof typeof rarityColors;
                    const itemImage = item.image_url || item.image || 'https://via.placeholder.com/200';
                    const itemType = item.type || '';
                    const isMoney = itemType === 'money' || itemType.includes('money');
                    const sellPrice = item.sell_price_eur || 0;
                    
                    return (
                      <motion.div
                        key={item.id}
                        onMouseEnter={() => setHoveredItemId(item.id)}
                        onMouseLeave={() => setHoveredItemId(null)}
                        className="relative rounded-lg overflow-hidden transition-all duration-200"
                        style={{
                          width: '240px',
                          height: '200px',
                          backgroundColor: '#1a1f26',
                          border: isHovered ? `1px solid ${rarityColors[itemRarity]}cc` : '1px solid #2d3339',
                          boxShadow: isHovered 
                            ? `inset 0 0 30px ${rarityColors[itemRarity]}30`
                            : 'none',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Info Icon - Always Visible */}
                        <div 
                          className="absolute top-2 left-2 z-20 bg-black/60 rounded-full p-1.5"
                          title="Вы можете получить данный товар или продать его, и баланс продажи зачислится на ваш личный аккаунт"
                        >
                          <Info 
                            className="w-3.5 h-3.5" 
                            style={{ color: '#ffffff' }} 
                          />
                        </div>

                        {/* Full Card Color Overlay */}
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundColor: rarityColors[itemRarity],
                            opacity: 0.15,
                          }}
                        />

                        {/* Hexagon Element - Behind Item Image */}
                        <div 
                          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300"
                          style={{
                            opacity: isHovered ? 0.35 : 0.12,
                            transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                          }}
                        >
                          <div
                            className="w-22 h-22"
                            style={{
                              backgroundColor: rarityColors[itemRarity],
                              maskImage: 'url(https://i.ibb.co/gMY5s4S6/free-icon-hexagon-2875801.png)',
                              maskSize: 'contain',
                              maskRepeat: 'no-repeat',
                              maskPosition: 'center',
                              WebkitMaskImage: 'url(https://i.ibb.co/gMY5s4S6/free-icon-hexagon-2875801.png)',
                              WebkitMaskSize: 'contain',
                              WebkitMaskRepeat: 'no-repeat',
                              WebkitMaskPosition: 'center',
                              width: '116px',
                              height: '116px',
                              filter: isHovered ? `drop-shadow(0 0 20px ${rarityColors[itemRarity]})` : 'none',
                            }}
                          />
                        </div>

                        {/* Gradient Glow from Top - Rarity Color Fade Down */}
                        <div 
                          className="absolute top-0 left-0 right-0 pointer-events-none"
                          style={{
                            height: '140px',
                            background: `linear-gradient(to bottom, ${rarityColors[itemRarity]}50 0%, ${rarityColors[itemRarity]}30 40%, transparent 100%)`,
                            opacity: 0.6,
                          }}
                        />

                        {/* Soft Glow Background on Hover */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.15 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex items-center justify-center"
                              style={{
                                filter: 'blur(40px)',
                              }}
                            >
                              <div 
                                style={{
                                  width: '120px',
                                  height: '120px',
                                  backgroundColor: rarityColors[itemRarity],
                                  borderRadius: '50%',
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Item Content */}
                        <div className="relative z-10 flex flex-col h-full p-4">
                          {/* Date - Top Center */}
                          <div className="flex items-center justify-center gap-1 text-white/50 mb-2">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                              <rect x="1" y="2" width="8" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                              <line x1="1" y1="4" x2="9" y2="4" stroke="currentColor" strokeWidth="0.8"/>
                              <line x1="3" y1="1" x2="3" y2="3" stroke="currentColor" strokeWidth="0.8"/>
                              <line x1="7" y1="1" x2="7" y2="3" stroke="currentColor" strokeWidth="0.8"/>
                            </svg>
                            <span className="text-[10px]">{item.date.toLocaleDateString('en-GB')}</span>
                          </div>

                          {/* Item Image - Centered */}
                          <div className="flex items-center justify-center" style={{ height: '110px' }}>
                            <img 
                              src={itemImage} 
                              alt={itemName}
                              className="w-36 h-36 object-contain transition-all duration-300"
                              style={{
                                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                                filter: isHovered ? `drop-shadow(0 0 15px ${rarityColors[itemRarity]}) brightness(1.2)` : 'none',
                              }}
                            />
                          </div>

                          {/* Text Content - Positioned Higher */}
                          <AnimatePresence>
                            {!isHovered && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-center space-y-1"
                              >
                                {/* Item Type */}
                                <p className="text-xs text-white/60 truncate">
                                  {itemType.toUpperCase()}
                                </p>

                                {/* Item Name */}
                                <p className="font-bold text-sm text-white truncate">
                                  {skinName}
                                </p>

                                {/* Sell Price - только для НЕ money */}
                                {!isMoney && (
                                  <p className="text-xs font-bold" style={{ color: '#ef4444' }}>
                                    Sell: {sellPrice}€
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>

                        {/* Action Buttons - Show on Hover */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute bottom-3 left-3 right-3 z-50 pointer-events-none flex gap-2"
                            >
                              {/* Green ПОЛУЧИТЬ Button - Always visible */}
                              <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaimItem(item.id, itemType);
                                }}
                                disabled={processingId === item.id}
                                className="flex-1 py-2.5 rounded-lg text-xs font-bold font-[Aldrich] uppercase transition-all pointer-events-auto shadow-lg flex items-center justify-center gap-1.5"
                                style={{
                                  background: processingId === item.id
                                    ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.4) 0%, rgba(75, 85, 99, 0.4) 100%)'
                                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.4) 100%)',
                                  backdropFilter: 'blur(10px)',
                                  WebkitBackdropFilter: 'blur(10px)',
                                  border: processingId === item.id
                                    ? '1px solid rgba(107, 114, 128, 0.6)'
                                    : '1px solid rgba(16, 185, 129, 0.6)',
                                  color: processingId === item.id ? '#9ca3af' : '#10b981',
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                                  cursor: processingId === item.id ? 'not-allowed' : 'pointer',
                                  opacity: processingId === item.id ? 0.7 : 1,
                                }}
                              >
                                {processingId === item.id ? (
                                  <>
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                      className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full"
                                    />
                                    <span className="text-[10px]">ОБРАБОТКА...</span>
                                  </>
                                ) : (
                                  'ПОЛУЧИТЬ'
                                )}
                              </motion.button>

                              {/* Red Coin Icon Button - Only for non-money items */}
                              {!isMoney && (
                                <motion.button
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSellItem(item.id, sellPrice);
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
                                  title={`Sell for ${sellPrice}€`}
                                >
                                  <Coins className="w-5 h-5" />
                                </motion.button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* 🔥 GLOBAL PROCESSING OVERLAY - перекрывает ВСЮ карточку */}
                        {processingId === item.id && (
                          <div
                            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                            style={{
                              background: 'rgba(0, 0, 0, 0.75)',
                              backdropFilter: 'blur(6px)',
                              WebkitBackdropFilter: 'blur(6px)',
                              borderRadius: '8px',
                            }}
                          >
                            <div className="text-center">
                              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" style={{ color: '#10b981' }} />
                              <p className="text-white font-bold text-sm uppercase tracking-wider">PROCESSING</p>
                              <p className="text-[10px] text-gray-300 mt-1">Please wait...</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Win History - Full Width with Pagination */}
        <div className="relative">
          {/* Left Arrow - Absolute positioned outside */}
          {winHistoryPage > 0 && (
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setWinHistoryPage(winHistoryPage - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl z-10"
              style={{
                backgroundColor: '#1f1f25',
                border: '2px solid #ffffff20',
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          )}

          {/* Right Arrow - Absolute positioned outside */}
          {winHistoryPage < totalWinHistoryPages - 1 && (
            <motion.button
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setWinHistoryPage(winHistoryPage + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl z-10"
              style={{
                backgroundColor: '#1f1f25',
                border: '2px solid #ffffff20',
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}

          {/* Win History Block */}
          <div className="border border-white/10 rounded-2xl p-6 pr-8" style={{ backgroundColor: '#131217' }}>
            <h2 className="text-2xl font-bold mb-6 font-[Rajdhani] uppercase">WIN HISTORY</h2>
            
            {/* Win History Container */}
            <div 
              className="overflow-hidden"
              style={{
                minHeight: '220px',
              }}
            >
              <AnimatePresence mode="wait">
                {loadingHistory ? (
                  <div className="text-center py-20">
                    <p className="text-gray-400">Loading history...</p>
                  </div>
                ) : winHistory.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-400">No history yet.</p>
                  </div>
                ) : (
                <motion.div
                  key={winHistoryPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-5 gap-3"
                >
                  {currentWinHistoryItems.map((win) => {
                    const isHovered = hoveredItemId === `win-${win.id}`;
                    
                    // Split item name (e.g., "AK-47 | Fire Serpent" -> ["AK-47", "Fire Serpent"])
                    const nameParts = win.itemName.split(' | ');
                    const weaponName = nameParts[0] || '';
                    const skinName = nameParts[1] || win.itemName;
                    
                    return (
                      <motion.div
                        key={win.id}
                        onMouseEnter={() => setHoveredItemId(`win-${win.id}`)}
                        onMouseLeave={() => setHoveredItemId(null)}
                        className="relative rounded-lg overflow-hidden transition-all duration-200 cursor-pointer"
                        style={{
                          width: '240px',
                          height: '200px',
                          backgroundColor: '#1a1f26',
                          border: isHovered ? `1px solid ${rarityColors[win.rarity]}cc` : '1px solid #2d3339',
                          boxShadow: isHovered 
                            ? `inset 0 0 30px ${rarityColors[win.rarity]}30`
                            : 'none',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Full Card Color Overlay */}
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundColor: rarityColors[win.rarity],
                            opacity: 0.15,
                          }}
                        />

                        {/* Hexagon Element - Behind Item Image */}
                        <div 
                          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300"
                          style={{
                            opacity: isHovered ? 0.35 : 0.12,
                            transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                          }}
                        >
                          <div
                            className="w-22 h-22"
                            style={{
                              backgroundColor: rarityColors[win.rarity],
                              maskImage: 'url(https://i.ibb.co/gMY5s4S6/free-icon-hexagon-2875801.png)',
                              maskSize: 'contain',
                              maskRepeat: 'no-repeat',
                              maskPosition: 'center',
                              WebkitMaskImage: 'url(https://i.ibb.co/gMY5s4S6/free-icon-hexagon-2875801.png)',
                              WebkitMaskSize: 'contain',
                              WebkitMaskRepeat: 'no-repeat',
                              WebkitMaskPosition: 'center',
                              width: '116px',
                              height: '116px',
                              filter: isHovered ? `drop-shadow(0 0 20px ${rarityColors[win.rarity]})` : 'none',
                            }}
                          />
                        </div>

                        {/* Gradient Glow from Top - Rarity Color Fade Down */}
                        <div 
                          className="absolute top-0 left-0 right-0 pointer-events-none"
                          style={{
                            height: '140px',
                            background: `linear-gradient(to bottom, ${rarityColors[win.rarity]}50 0%, ${rarityColors[win.rarity]}30 40%, transparent 100%)`,
                            opacity: 0.6,
                          }}
                        />

                        {/* Soft Glow Background on Hover */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.15 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex items-center justify-center"
                              style={{
                                filter: 'blur(40px)',
                              }}
                            >
                              <div 
                                style={{
                                  width: '120px',
                                  height: '120px',
                                  backgroundColor: rarityColors[win.rarity],
                                  borderRadius: '50%',
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Item Content */}
                        <div className="relative z-10 flex flex-col h-full p-4">
                          {/* Date - Top Center */}
                          <div className="flex items-center justify-center gap-1 text-white/50 mb-2">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                              <rect x="1" y="2" width="8" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                              <line x1="1" y1="4" x2="9" y2="4" stroke="currentColor" strokeWidth="0.8"/>
                              <line x1="3" y1="1" x2="3" y2="3" stroke="currentColor" strokeWidth="0.8"/>
                              <line x1="7" y1="1" x2="7" y2="3" stroke="currentColor" strokeWidth="0.8"/>
                            </svg>
                            <span className="text-[10px]">{win.timestamp.toLocaleDateString('en-GB')}</span>
                          </div>

                          {/* Item Image - Centered */}
                          <div className="flex items-center justify-center" style={{ height: '110px' }}>
                            <img 
                              src={win.itemImage} 
                              alt={win.itemName}
                              className="w-36 h-36 object-contain transition-all duration-300"
                              style={{
                                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                                filter: isHovered ? `drop-shadow(0 0 15px ${rarityColors[win.rarity]}) brightness(1.2)` : 'none',
                              }}
                            />
                          </div>

                          {/* Text Content - Shows Item Name or Case Name */}
                          <AnimatePresence mode="wait">
                            {!isHovered ? (
                              <motion.div 
                                key="item-name"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-center"
                              >
                                {/* Weapon Name - Small */}
                                <p className="text-[11px] text-white/60 mb-0.5 truncate">
                                  {weaponName}
                                </p>

                                {/* Skin Name - Bold */}
                                <p className="font-bold text-sm text-white truncate">
                                  {skinName}
                                </p>
                              </motion.div>
                            ) : (
                              <motion.div 
                                key="case-name"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-center"
                              >
                                {/* "FROM:" Label */}
                                <p className="text-[10px] text-white/40 mb-1 uppercase font-[Aldrich]">
                                  FROM:
                                </p>

                                {/* Case Name - Bold */}
                                <p className="font-bold text-sm text-white truncate">
                                  {win.caseName}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Notifications - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 w-80">
        <AnimatePresence>
          {claimRequests.map((request) => {
            const isMinimized = minimizedRequests.has(request.id);
            
            // 🎨 Определяем цвет в зависимости от статуса
            const getStatusColor = () => {
              switch (request.status) {
                case 'pending': return '#f59e0b'; // 🟡 Желтый/Оранжевый
                case 'approved': return '#10b981'; // 🟢 Зеленый
                case 'denied': return '#ef4444'; // 🔴 Красный
                default: return '#f59e0b';
              }
            };
            
            const getStatusText = () => {
              switch (request.status) {
                case 'pending': return 'ОЖИДАНИЕ';
                case 'approved': return 'ОДОБРЕНО';
                case 'denied': return 'ОТКЛОНЕНО';
                default: return 'ОЖИДАНИЕ';
              }
            };
            
            const getStatusIcon = () => {
              switch (request.status) {
                case 'pending': return <Clock className="w-5 h-5" />;
                case 'approved': return <CheckCircle className="w-5 h-5" />;
                case 'denied': return <CircleX className="w-5 h-5" />;
                default: return <Clock className="w-5 h-5" />;
              }
            };
            
            const statusColor = getStatusColor();
            
            return (
              <motion.div
                key={request.id}
                initial={{ x: 400, opacity: 0 }}
                animate={{ 
                  x: 0, 
                  opacity: 1,
                  width: isMinimized ? '220px' : '340px',
                }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative rounded-xl shadow-2xl overflow-hidden"
                style={{
                  backgroundColor: '#1a1f26',
                }}
              >
                {/* 🔥 БЕГУЩАЯ ОБВОДКА (Animated Border) */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <svg className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id={`border-gradient-${request.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: statusColor, stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: statusColor, stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: statusColor, stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <motion.rect
                      x="1"
                      y="1"
                      width="calc(100% - 2px)"
                      height="calc(100% - 2px)"
                      rx="12"
                      fill="none"
                      stroke={`url(#border-gradient-${request.id})`}
                      strokeWidth="3"
                      strokeDasharray={request.status === 'pending' ? "20 10" : "0"}
                      animate={request.status === 'pending' ? {
                        strokeDashoffset: [0, -300],
                      } : {}}
                      transition={{
                        duration: 3,
                        repeat: request.status === 'pending' ? Infinity : 0,
                        ease: 'linear',
                      }}
                      style={{
                        filter: `drop-shadow(0 0 8px ${statusColor}66)`,
                      }}
                    />
                  </svg>
                </div>

                {isMinimized ? (
                  // Minimized View (Tab)
                  <div 
                    onClick={() => handleToggleMinimize(request.id)}
                    className="relative p-3 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {request.status === 'pending' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{
                            border: `2px solid ${statusColor}30`,
                            borderTopColor: statusColor,
                          }}
                        />
                      ) : request.status === 'approved' ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: statusColor }} />
                      ) : (
                        <CircleX className="w-4 h-4 flex-shrink-0" style={{ color: statusColor }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold font-[Aldrich] truncate" style={{ color: statusColor }}>
                          {getStatusText()}
                        </div>
                        {request.status === 'pending' && (
                          <div className="text-xs text-gray-400 truncate">
                            {formatTimeRemaining(request.timeRemaining)}
                          </div>
                        )}
                      </div>
                    </div>
                    <Maximize2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ) : (
                  // Expanded View
                  <div className="relative p-4">
                    {/* Countdown Timer (только для pending) */}
                    {request.status === 'pending' && (
                      <CountdownTimer
                        request={request}
                        onUpdate={(id, timeRemaining) => {
                          setClaimRequests(prev => prev.map(req => req.id === id ? { ...req, timeRemaining } : req));
                        }}
                        onTimeout={(id) => {
                          // 🔥 Таймер истёк - автоматическая отмена заявки
                          console.log(`⏱ [PlayerProfile] Request ${id} timed out, cancelling...`);
                          handleRemoveRequest(id);
                          clearProcessingId();
                          toast.error(
                            <div className="flex items-center gap-3">
                              <CircleX className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />
                              <span>Request cancelled: Admin did not respond in 60 minutes</span>
                            </div>,
                            { duration: 6000 }
                          );
                        }}
                      />
                    )}
                    
                    {/* Action Button - ТОЛЬКО МИНИМИЗАЦИЯ (без крестика) */}
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMinimize(request.id);
                        }}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <Minimize2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div style={{ color: statusColor }}>
                        {getStatusIcon()}
                      </div>
                      <h3 className="font-bold text-sm font-[Aldrich]" style={{ color: statusColor }}>
                        СТАТУС ЗАЯВКИ
                      </h3>
                    </div>

                    {/* Request ID */}
                    <div className="mb-3 bg-black/40 rounded-lg p-2">
                      <div className="text-xs text-gray-400 mb-1">ID Заявки:</div>
                      <div className="font-bold text-sm font-mono" style={{ color: statusColor }}>
                        #{request.requestId}
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Предмет:</div>
                      <div className="font-bold text-sm truncate">{request.itemName}</div>
                      <div 
                        className="text-xs font-bold uppercase mt-1"
                        style={{ color: rarityColors[request.itemRarity] }}
                      >
                        {request.itemRarity}
                      </div>
                    </div>

                    {/* Status Display */}
                    <div 
                      className="flex items-center gap-3 p-3 rounded-lg border mb-3"
                      style={{
                        backgroundColor: `${statusColor}10`,
                        borderColor: `${statusColor}30`,
                      }}
                    >
                      {request.status === 'pending' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 rounded-full flex-shrink-0"
                          style={{
                            border: `2px solid ${statusColor}30`,
                            borderTopColor: statusColor,
                          }}
                        />
                      ) : request.status === 'approved' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: statusColor }} />
                      ) : (
                        <CircleX className="w-5 h-5 flex-shrink-0" style={{ color: statusColor }} />
                      )}
                      <div className="flex-1">
                        <div className="text-xs text-gray-400">Статус:</div>
                        <div className="font-bold text-sm font-[Aldrich]" style={{ color: statusColor }}>
                          {request.status === 'pending' && 'Ожидание подтверждения администратора'}
                          {request.status === 'approved' && 'Заявка одобрена! Предмет отправлен.'}
                          {request.status === 'denied' && 'Заявка отклонена администратором.'}
                        </div>
                      </div>
                    </div>

                    {/* Countdown Display (только для pending) */}
                    {request.status === 'pending' && (
                      <div className="flex items-center justify-between p-2 bg-black/40 rounded-lg mb-2">
                        <div className="text-xs text-gray-400">Осталось времени:</div>
                        <div className="font-bold font-mono text-lg" style={{ color: statusColor }}>
                          {formatTimeRemaining(request.timeRemaining)}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs text-gray-500">
                      Создано: {request.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Levels Modal */}
      {showLevelsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowLevelsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="rounded-2xl max-w-3xl w-full mx-4 border border-white/10 flex flex-col"
            style={{ backgroundColor: '#131217', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="p-8 pb-4 flex-shrink-0">
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowLevelsModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </motion.button>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold mb-2 font-[Rajdhani] uppercase text-center">
                HOW DO LEVELS WORK?
              </h2>
              
              {/* Subtitle */}
              <p className="text-center text-white/60 mb-4 text-sm">
                Level up by opening cases and unlock exclusive rewards
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-8 flex-1" style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#7c2d3a #1a1a1a',
            }}>
              <div className="space-y-6 mb-6">
              {/* Info Card */}
              <div 
                className="rounded-xl p-6 border border-white/10"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                <p className="text-white/80 leading-relaxed">
                  As you open cases and win prizes, you earn XP and level up. Higher levels unlock access to premium case tiers with better prizes and improved drop chances!
                </p>
              </div>

              {/* Level Milestones */}
              <div 
                className="rounded-xl p-6 border border-white/10"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              >
                <h3 className="font-bold text-xl mb-4 font-[Rajdhani] uppercase text-[#ffa629]">
                  LEVEL MILESTONES
                </h3>
                <div className="space-y-3">
                  {[
                    { level: 10, reward: 'Unlock Rare Tier Cases', color: '#3b82f6' },
                    { level: 20, reward: 'Unlock Epic Tier Cases', color: '#a855f7' },
                    { level: 30, reward: 'Unlock Legendary Tier Cases', color: '#eab308' },
                    { level: 40, reward: 'Unlock Mythic Tier Cases', color: '#ef4444' },
                    { level: 50, reward: 'Unlock Premium Rewards', color: '#ffa629' },
                  ].map((milestone, index) => (
                    <motion.div
                      key={milestone.level}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-3 px-4 rounded-lg transition-all"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        borderLeft: `3px solid ${milestone.color}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold font-[Aldrich]"
                          style={{
                            backgroundColor: `${milestone.color}20`,
                            color: milestone.color,
                          }}
                        >
                          {milestone.level}
                        </div>
                        <span className="text-white/90">{milestone.reward}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Premium Prizes */}
              <div 
                className="rounded-xl p-6 border border-white/10"
                style={{ 
                  backgroundColor: 'rgba(124, 45, 58, 0.1)',
                  borderColor: 'rgba(124, 45, 58, 0.3)',
                }}
              >
                <h3 className="font-bold mb-4 font-[Rajdhani] uppercase text-lg" style={{ color: '#7c2d3a' }}>
                  PREMIUM PRIZES INCLUDE
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '🔪', text: 'CS2 Knives and rare skins' },
                    { icon: '🎮', text: 'Gaming devices' },
                    { icon: '💰', text: 'Balance rewards up to €500' },
                    { icon: '⭐', text: 'Exclusive limited items' },
                  ].map((prize, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    >
                      <span className="text-2xl">{prize.icon}</span>
                      <span className="text-sm text-white/80">{prize.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            </div>

            {/* Footer Button - Fixed */}
            <div className="p-8 pt-4 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLevelsModal(false)}
                className="w-full py-3.5 rounded-xl font-bold font-[Aldrich] uppercase tracking-wider transition-all text-sm"
                style={{
                  background: 'linear-gradient(135deg, #7c2d3a 0%, #5a1f2a 100%)',
                  boxShadow: '0 4px 16px rgba(124, 45, 58, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 45, 58, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 45, 58, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                GOT IT
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}