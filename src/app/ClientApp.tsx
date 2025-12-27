import { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TopBar } from './components/TopBar';
import { CasesPage } from './components/CasesPage';
import { CaseOpening } from './components/CaseOpening';
import { WinPage } from './components/WinPage';
import { InventoryPage } from './components/InventoryPage';
import { PlayerProfile } from './components/PlayerProfile';
import { SettingsModal } from './components/SettingsModal';
import { CaseContentPage } from './components/CaseContentPage';
import { CaseOpenPage } from './components/CaseOpenPage';
import { LoginModal } from './components/LoginModal';
import { toast, Toaster } from 'sonner';

export type Page = 'cases' | 'opening' | 'win' | 'inventory' | 'profile-public' | 'profile-private' | 'case-content' | 'case-open';

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
  const { isAuthenticated, profile, refreshProfile, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('cases');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [wonItem, setWonItem] = useState<InventoryItem | null>(null);
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
    toast.success(t('login.loginSuccess') || 'Profile refreshed!');
  };

  // Показываем индикатор загрузки при инициализации
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#17171c] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#7c2d3a]"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

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
        onBalanceRefresh={handleBalanceRefresh}
      />

      <div className="pt-48">
        {currentPage === 'cases' && <CasesPage onCaseClick={handleCaseClick} isAuthenticated={isAuthenticated} />}
        {currentPage === 'win' && wonItem && (
          <WinPage
            item={wonItem}
            onClaim={() => handleClaimItem(wonItem)}
            onGoToInventory={() => setCurrentPage('cases')}
            onBack={() => setCurrentPage('cases')}
          />
        )}
        {currentPage === 'inventory' && (
          <InventoryPage
            items={inventory}
            onAction={handleInventoryAction}
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
            caseName={selectedCase.name}
            caseImage={selectedCase.image}
            deposited={selectedCase.deposited}
            required={selectedCase.required}
            isAuthenticated={isAuthenticated}
            onBack={() => setCurrentPage('cases')}
            onClose={() => setCurrentPage('cases')}
            onWin={handleCaseWin}
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
        toastOptions={{
          style: {
            background: '#1d1d22',
            border: '1px solid #2a2a30',
            color: '#fff',
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
        <ClientAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}