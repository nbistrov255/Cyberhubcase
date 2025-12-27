import { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { TopBar } from './components/TopBar';
import { CasesPage } from './components/CasesPage';
import { CaseOpening } from './components/CaseOpening';
import { WinPage } from './components/WinPage';
import { InventoryPage } from './components/InventoryPage';
import { PlayerProfile } from './components/PlayerProfile';
import { SettingsModal } from './components/SettingsModal';
import { CaseContentPage } from './components/CaseContentPage';
import { CaseOpenPage } from './components/CaseOpenPage';

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
  const { language, setLanguage } = useLanguage();
  const [currentPage, setCurrentPage] = useState<Page>('cases');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [balance, setBalance] = useState(5.05);
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

  const handleCaseClick = (caseData: any) => {
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
    // TODO: В будущем здесь будет запрос к SmartShell API
    // const newBalance = await smartshellAPI.getBalance(userId);
    // setBalance(newBalance);
    
    // Пока что просто имитируем обновление баланса
    console.log('Refreshing balance from SmartShell API...');
    
    // Можно добавить визуальный feedback
    // Например, случайное изменение для демонстрации
    // setBalance(prevBalance => prevBalance + (Math.random() * 10 - 5));
  };

  return (
    <div className="min-h-screen bg-[#17171c] text-white">
      <TopBar
        balance={balance}
        onSettingsClick={() => setSettingsOpen(true)}
        onProfileClick={() => setCurrentPage('profile-private')}
        onLiveFeedClick={handleLiveFeedClick}
        onLogoClick={handleLogoClick}
        onBalanceRefresh={handleBalanceRefresh}
      />

      <div className="pt-48">
        {currentPage === 'cases' && <CasesPage onCaseClick={handleCaseClick} />}
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
            onBack={() => setCurrentPage('cases')}
            onClose={() => setCurrentPage('cases')}
            onWin={handleCaseWin}
          />
        )}
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentLanguage={language}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default function ClientApp() {
  return (
    <LanguageProvider>
      <ClientAppContent />
    </LanguageProvider>
  );
}