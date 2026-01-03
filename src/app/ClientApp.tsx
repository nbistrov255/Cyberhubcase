import { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider, useWebSocketEvent } from './contexts/WebSocketContext';
import { TopBar } from './components/TopBar';
import { CasesPage } from './components/CasesPage';
import { CaseOpening } from './components/CaseOpening';
import { WinPage } from './components/WinPage';
import { PlayerProfile } from './components/PlayerProfile';
import { SettingsModal } from './components/SettingsModal';
import { CaseContentPage } from './components/CaseContentPage';
import { CaseOpenPage } from './components/CaseOpenPage';
import { LoginModal } from './components/LoginModal';
import { LoginScreen } from './components/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen'; // 🔥 НОВЫЙ ИМПОРТ
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { toast, Toaster } from 'sonner';

export type Page = 'cases' | 'opening' | 'win' | 'profile-public' | 'profile-private' | 'case-content' | 'case-open';

export interface InventoryItem {
  id: string;
  name: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  type: 'money' | 'cs2' | 'physical';
  status: 'available' | 'processing' | 'received' | 'failed';
  value?: number;
}

export interface LiveFeedItem {
  id: string;
  itemName: string;
  itemImage: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  playerName: string;
  playerAvatar: string;
  playerLevel: number;
  caseName: string;
  timestamp: Date;
}

function ClientAppContent() {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, profile, refreshProfile, isLoading, isAuthenticating } = useAuth(); // 🔥 Добавили isAuthenticating
  const [currentPage, setCurrentPage] = useState<Page>('cases');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [wonItem, setWonItem] = useState<InventoryItem | null>(null);
  const [casesRefreshKey, setCasesRefreshKey] = useState(0); // 🔥 Key для force refresh кейсов
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'AK-47 | Redline',
      image: 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?w=400&h=300&fit=crop',
      rarity: 'legendary',
      type: 'cs2',
      status: 'available',
    },
    {
      id: '2',
      name: '$50 Balance',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop',
      rarity: 'epic',
      type: 'money',
      status: 'received',
      value: 50,
    },
    {
      id: '3',
      name: 'Gaming Headset',
      image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=300&fit=crop',
      rarity: 'rare',
      type: 'physical',
      status: 'processing',
    },
  ]);
  const [selectedProfilePlayer, setSelectedProfilePlayer] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  // Получаем баланс из профиля
  const balance = profile?.dailySum || 0;

  console.log('🎮 [ClientApp] State:', { isLoading, isAuthenticating, isAuthenticated });

  // 🔥 ВАЖНО: ВСЕ хуки ДОЛЖНЫ быть вызваны ДО условных returns!
  // WebSocket: Real-time обновление баланса
  useWebSocketEvent(`balance:updated:${profile?.id || 'none'}`, (data: { balance: number }) => {
    if (!profile?.id) return; // Игнорируем если нет профиля
    console.log('💰 Balance updated:', data.balance);
    refreshProfile(); // Автообновление профиля
  });

  // WebSocket: Real-time обновление инвентаря
  useWebSocketEvent(`inventory:updated:${profile?.id || 'none'}`, () => {
    if (!profile?.id) return; // Игнорируем если нет профиля
    console.log('🎒 Inventory updated');
    // Здесь можно добавить обновление инвентаря
  });

  // WebSocket: Real-time обновление кейсов
  useWebSocketEvent('cases:updated', () => {
    console.log('📦 Cases updated by admin, refreshing list...');
    // Триггерим обновление списка кейсов в CasesPage через key prop
    setCasesRefreshKey(prev => prev + 1);
  });

  // Check maintenance mode
  const isMaintenanceMode = (() => {
    try {
      const maintenanceMode = localStorage.getItem('maintenanceMode');
      return maintenanceMode === 'true';
    } catch {
      return false;
    }
  })();

  // Show maintenance screen if maintenance mode is enabled
  if (isMaintenanceMode) {
    return <MaintenanceScreen />;
  }

  // 🔥 ВАЖНО: Проверяем isAuthenticating ПЕРВЫМ! LoadingScreen показывается пока идет логин
  if (isLoading || isAuthenticating) {
    console.log('⏳ [ClientApp] Showing LoadingScreen:', { isLoading, isAuthenticating });
    return <LoadingScreen />;
  }

  // 🔥 НОВАЯ ЛОГИКА: Показываем LoginScreen если не авторизован
  if (!isAuthenticated) {
    console.log('🔑 [ClientApp] Showing LoginScreen (not authenticated)');
    return <LoginScreen />;
  }

  console.log('✅ [ClientApp] Showing main interface');

  const handleCaseClick = (caseData: any) => {
    // Гость может просмотреть страницу кейса, но передаем флаг авторизации
    setSelectedCase(caseData);
    setCurrentPage('case-open');
  };

  const handleCaseWin = (item: any) => {
    const wonItem: InventoryItem = {
      id: Date.now().toString(),
      name: item.name,
      image: item.image,
      rarity: item.rarity.toLowerCase() as 'common' | 'rare' | 'epic' | 'legendary' | 'mythic',
      type: 'cs2',
      status: 'available',
    };
    setWonItem(wonItem);
    setCurrentPage('win');
  };

  const handleClaimItem = (item: InventoryItem) => {
    setInventory((prev) => [...prev, item]);
    setCurrentPage('profile-private');
  };

  const handleInventoryAction = (itemId: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status:
                item.type === 'money'
                  ? 'received'
                  : item.type === 'physical'
                  ? 'processing'
                  : 'processing',
            }
          : item
      )
    );
  };

  const handleLiveFeedClick = (playerName: string) => {
    setSelectedProfilePlayer(playerName);
    setCurrentPage('profile-public');
  };

  const handleSaveSettings = (newLanguage: 'en' | 'ru' | 'lv') => {
    setLanguage(newLanguage);
    setSettingsOpen(false);
  };

  const handleLogoClick = () => {
    setCurrentPage('cases'); // Переход на главную страницу
  };

  const handleBalanceRefresh = async () => {
    // Используем метод refresh из AuthContext
    await refreshProfile();
    // Убрали toast.success - обновление баланса происходит тихо
  };

  return (
    <div className="min-h-screen bg-[#17171c] text-white">
      <TopBar
        balance={balance}
        isAuthenticated={isAuthenticated}
        onSettingsClick={() => setSettingsOpen(true)}
        onProfileClick={() => setCurrentPage('profile-private')}
        onLoginClick={() => setLoginModalOpen(true)}
        onLiveFeedClick={(playerName) => {
          setSelectedProfilePlayer(playerName);
          setCurrentPage('profile-public');
        }}
        onLogoClick={() => setCurrentPage('cases')}
        onBalanceRefresh={refreshProfile}
        onInventoryClick={() => setCurrentPage('profile-private')} // 🔥 Открытие своего профиля (с инвентарём и историей)
      />

      <div className="pt-48">
        {currentPage === 'cases' && <CasesPage onCaseClick={handleCaseClick} isAuthenticated={isAuthenticated} key={casesRefreshKey} />}
        {currentPage === 'win' && wonItem && (
          <WinPage
            item={wonItem}
            onClaim={() => handleClaimItem(wonItem)}
            onGoToInventory={() => setCurrentPage('cases')}
            onBack={() => setCurrentPage('cases')}
          />
        )}
        {currentPage === 'profile-public' && (
          <PlayerProfile
            isPrivate={false}
            playerName={selectedProfilePlayer || 'Unknown'}
            onBack={() => setCurrentPage('cases')}
          />
        )}
        {currentPage === 'profile-private' && (
          <PlayerProfile
            isPrivate={true}
            playerName="You"
            onBack={() => setCurrentPage('cases')}
          />
        )}
        {currentPage === 'case-content' && (
          <CaseContentPage
            onBack={() => setCurrentPage('cases')}
          />
        )}
        {currentPage === 'case-open' && selectedCase && (
          <CaseOpenPage
            caseId={selectedCase.id}
            caseName={selectedCase.name}
            caseImage={selectedCase.image}
            deposited={selectedCase.deposited}
            required={selectedCase.required}
            isAuthenticated={isAuthenticated}
            onBack={() => setCurrentPage('cases')}
            onClose={() => setCurrentPage('cases')}
            onWin={handleCaseWin}
            onRefreshProfile={refreshProfile}
            onRequestLogin={() => {
              setLoginModalOpen(true);
              toast.warning(t('login.needAuth').replace('{action}', t('login.actionOpen')));
            }}
          />
        )}
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentLanguage={language}
        onSave={handleSaveSettings}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <Toaster 
        position="top-right"
        offset="70px"
        toastOptions={{
          unstyled: true,
          duration: 4000,
          classNames: {
            toast: 'min-w-[350px] flex items-center gap-3 rounded-lg px-5 py-3 shadow-2xl border relative overflow-hidden group',
            title: 'font-bold text-sm',
            description: 'text-xs',
            success: 'border-[rgba(74,222,128,0.3)]',
            error: 'border-[rgba(239,68,68,0.3)]',
            info: 'border-[rgba(255,255,255,0.1)]',
          },
          style: {
            background: 'linear-gradient(135deg, rgba(29, 29, 34, 0.95) 0%, rgba(23, 23, 28, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
          },
        }}
      />
    </div>
  );
}

export default function ClientApp() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <WebSocketProvider>
          <ClientAppContent />
        </WebSocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}