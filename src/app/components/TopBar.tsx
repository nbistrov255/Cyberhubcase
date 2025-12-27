import { useState, useEffect } from 'react';
import { Settings, User, DollarSign, Trophy, Box, RotateCw, Crown, Zap, Users, Circle, Diamond, Star, Flame } from 'lucide-react';
import { LiveFeedItem } from '../App';
import { motion, AnimatePresence } from 'motion/react';

// Заменено figma:asset импорт на прямую ссылку
const knifeImage = "https://i.ibb.co/cXCCBcfV/unnamed.png";

interface TopBarProps {
  balance: number;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  onLiveFeedClick: (playerName: string) => void;
  onLogoClick?: () => void; // Добавили функцию для клика по логотипу
  onBalanceRefresh?: () => void; // Добавили функцию для обновления баланса
}

const mockLiveFeed: LiveFeedItem[] = [
  {
    id: '1',
    itemName: 'AK-47 | Fire Serpent',
    itemImage: knifeImage,
    rarity: 'mythic',
    playerName: 'ProGamer_2024',
    playerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    playerLevel: 44,
    caseName: 'Christmas Drops',
    timestamp: new Date(),
  },
  {
    id: '2',
    itemName: 'M4A4 | Howl',
    itemImage: knifeImage,
    rarity: 'legendary',
    playerName: 'SkillMaster',
    playerAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    playerLevel: 38,
    caseName: 'Silent Night Case',
    timestamp: new Date(),
  },
  {
    id: '3',
    itemName: 'AWP | Dragon Lore',
    itemImage: knifeImage,
    rarity: 'mythic',
    playerName: 'SniperElite',
    playerAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    playerLevel: 52,
    caseName: 'Legendary Case',
    timestamp: new Date(),
  },
  {
    id: '4',
    itemName: 'Glock-18 | Fade',
    itemImage: knifeImage,
    rarity: 'epic',
    playerName: 'QuickDraw',
    playerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    playerLevel: 29,
    caseName: 'Daily Case',
    timestamp: new Date(),
  },
  {
    id: '5',
    itemName: 'Knife | Karambit Fade',
    itemImage: knifeImage,
    rarity: 'mythic',
    playerName: 'KnifeKing',
    playerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    playerLevel: 61,
    caseName: 'Premium Case',
    timestamp: new Date(),
  },
  {
    id: '6',
    itemName: 'USP-S | Kill Confirmed',
    itemImage: knifeImage,
    rarity: 'legendary',
    playerName: 'Headshot999',
    playerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    playerLevel: 47,
    caseName: 'Elite Case',
    timestamp: new Date(),
  },
  {
    id: '7',
    itemName: 'P90 | Asiimov',
    itemImage: knifeImage,
    rarity: 'epic',
    playerName: 'SpeedRunner',
    playerAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    playerLevel: 33,
    caseName: 'Speed Case',
    timestamp: new Date(),
  },
  {
    id: '8',
    itemName: 'M4A1-S | Hyper Beast',
    itemImage: knifeImage,
    rarity: 'mythic',
    playerName: 'BeastMode',
    playerAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    playerLevel: 55,
    caseName: 'Beast Case',
    timestamp: new Date(),
  },
  {
    id: '9',
    itemName: 'Desert Eagle | Blaze',
    itemImage: knifeImage,
    rarity: 'legendary',
    playerName: 'FireStarter',
    playerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    playerLevel: 41,
    caseName: 'Blaze Case',
    timestamp: new Date(),
  },
  {
    id: '10',
    itemName: 'MAC-10 | Neon Rider',
    itemImage: knifeImage,
    rarity: 'epic',
    playerName: 'NeonKing',
    playerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    playerLevel: 36,
    caseName: 'Neon Case',
    timestamp: new Date(),
  },
  {
    id: '11',
    itemName: 'Five-Seven | Monkey Business',
    itemImage: knifeImage,
    rarity: 'rare',
    playerName: 'MonkeyPro',
    playerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    playerLevel: 28,
    caseName: 'Jungle Case',
    timestamp: new Date(),
  },
  {
    id: '12',
    itemName: 'Galil AR | Cerberus',
    itemImage: knifeImage,
    rarity: 'mythic',
    playerName: 'CerberusGod',
    playerAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    playerLevel: 58,
    caseName: 'Mythic Case',
    timestamp: new Date(),
  },
  {
    id: '13',
    itemName: 'FAMAS | Roll Cage',
    itemImage: knifeImage,
    rarity: 'rare',
    playerName: 'RollMaster',
    playerAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    playerLevel: 25,
    caseName: 'Daily Case',
    timestamp: new Date(),
  },
  {
    id: '14',
    itemName: 'P250 | Asiimov',
    itemImage: knifeImage,
    rarity: 'epic',
    playerName: 'P250Pro',
    playerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    playerLevel: 39,
    caseName: 'Elite Case',
    timestamp: new Date(),
  },
  {
    id: '15',
    itemName: 'SSG 08 | Blood in the Water',
    itemImage: knifeImage,
    rarity: 'legendary',
    playerName: 'SharkHunter',
    playerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    playerLevel: 49,
    caseName: 'Ocean Case',
    timestamp: new Date(),
  },
];

const rarityColors = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#eab308',
  mythic: '#ef4444',
};

const rarityGradients = {
  common: {
    gradient: 'linear-gradient(to bottom, #2A3238, #6B7F8E)',
    color: '#6B7F8E',
    glow: 'rgba(107, 127, 142, 0.15)',
  },
  rare: {
    gradient: 'linear-gradient(to bottom, #1A2633, #3FA5D8)',
    color: '#3FA5D8',
    glow: 'rgba(63, 165, 216, 0.2)',
  },
  epic: {
    gradient: 'linear-gradient(to bottom, #2B153E, #A855F7)',
    color: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.25)',
  },
  legendary: {
    gradient: 'linear-gradient(to bottom, #3A2810, #DAA520)',
    color: '#DAA520',
    glow: 'rgba(218, 165, 32, 0.3)',
  },
  mythic: {
    gradient: 'linear-gradient(to bottom, #3A0F14, #DC2626)',
    color: '#DC2626',
    glow: 'rgba(220, 38, 38, 0.3)',
  },
};

const getRarityIcon = (rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic') => {
  switch (rarity) {
    case 'common':
      return Circle;
    case 'rare':
      return Diamond;
    case 'epic':
      return Star;
    case 'legendary':
      return Crown;
    case 'mythic':
      return Flame;
  }
};

export function TopBar({
  balance,
  onSettingsClick,
  onProfileClick,
  onLiveFeedClick,
  onLogoClick,
  onBalanceRefresh,
}: TopBarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<LiveFeedItem[]>(mockLiveFeed);
  const [activeFilter, setActiveFilter] = useState<'all' | 'top'>('all');
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeedItems((prev) => {
        const newItem = generateRandomLiveFeedItem();
        return [newItem, ...prev.slice(0, 24)]; // Увеличили с 9 до 24 для заполнения экрана
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        // Скролл вниз - скрываем Live Drop ленту
        setIsTopBarVisible(false);
      } else {
        // Вверху страницы - показываем Live Drop ленту
        setIsTopBarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleRefreshClick = () => {
    if (isRefreshing) return; // Предотвращаем множественные клики
    
    setIsRefreshing(true);
    
    // Вызываем функцию обновления баланса
    if (onBalanceRefresh) {
      onBalanceRefresh();
    }
    
    // Сбрасываем состояние анимации через 1 секунду
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <>
      {/* ROW 1 - TOP NAVIGATION BAR - всегда видимый */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#17171c]">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="https://i.ibb.co/k64yKKZG/Cyber-Hub-Logo-02.png" 
              alt="CyberHub Logo" 
              className="h-28 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onLogoClick}
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Balance - KeyDrop Style */}
            <div className="flex items-center bg-[#3d5a2f] rounded-sm overflow-hidden border border-[#4a6738]/60 h-10">
              {/* Left Icon Zone - Slightly Lighter Green Square */}
              <div className="h-10 w-10 flex items-center justify-center bg-[#4a6738]">
                <DollarSign className="w-4 h-4 text-[#8BC34A]" strokeWidth={2.5} />
              </div>
              
              {/* Text Zone */}
              <div className="px-3 flex flex-col items-start justify-center">
                <div className="text-sm font-bold text-white leading-tight">{balance.toFixed(2)} $</div>
                <div className="text-[9px] text-[#7a9960] uppercase tracking-wider leading-tight font-medium">Баланс Кошелька</div>
              </div>
              
              {/* Right Action Zone - Slightly Lighter Green Square */}
              <button 
                className="bg-[#4a6738] h-10 w-10 flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50"
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(139, 195, 74, 0.15))'
                }}
              >
                <RotateCw 
                  className={`w-4 h-4 text-[#8BC34A] transition-transform duration-1000 ${isRefreshing ? 'animate-spin' : ''}`} 
                  strokeWidth={2.5} 
                />
              </button>
            </div>

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
            >
              <Settings className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
            </button>

            {/* Profile Avatar with Level */}
            <button
              onClick={onProfileClick}
              className="w-10 h-10 rounded-lg overflow-hidden relative hover:ring-2 hover:ring-white/20 transition-all"
            >
              {/* Avatar Image */}
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                alt="Player Avatar"
                className="w-full h-full object-cover"
              />
              
              {/* Level Bar - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm flex items-center justify-center" style={{ height: '14px' }}>
                <span className="text-[9px] font-bold text-white/90 tracking-wide">LVL 44</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Bottom fade - smooth transition to live feed row */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-[#1d1f24] pointer-events-none" />
      </div>

      {/* ROW 2 - LIVE FEED ROW (One continuous strip) - скрывается при скролле */}
      <div className={`fixed top-16 left-0 right-0 z-40 h-32 bg-[#1d1f24] transition-all duration-300 ${
        isTopBarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}>
        {/* Top fade - smooth transition from nav bar */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#17171c] to-transparent pointer-events-none" />
        
        <div className="h-full flex items-center">
          {/* Unified Block: Total Wins + Filter Buttons */}
          <div className="flex-shrink-0 h-full flex items-center justify-center relative">{/* Убрали border-r border-white/5 */}
            {/* Subtle right fade - убираем тоже */}
            
            {/* Cards group - matching live feed styling */}
            <div className="flex items-center gap-1 ml-6 mr-1">{/* Изменили mx-6 на ml-6 mr-1 */}
              {/* TOTAL WINS - Square Card (same size as live feed) */}
              <div className="w-28 h-28 bg-white/[0.02] flex flex-col items-center justify-center gap-1 p-3">
                <img 
                  src="https://i.ibb.co/Gv0XvbQc/free-icon-keys-4230132.png" 
                  alt="Keys" 
                  className="w-10 h-10"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(82%) sepia(40%) saturate(628%) hue-rotate(335deg) brightness(103%) contrast(98%)'
                  }}
                />
                <span className="text-xl font-bold text-white leading-tight">47</span>
                <span className="text-[8px] text-gray-500 uppercase tracking-wider leading-tight">Cases Opened</span>
              </div>

              {/* Filter Buttons - Vertical Stack */}
              <div className="flex flex-col gap-1">
                {/* Crown Button - Top Wins */}
                <button
                  onClick={() => setActiveFilter('top')}
                  className={`w-12 h-[3.375rem] flex items-center justify-center transition-all duration-150 rounded-r-md ${
                    activeFilter === 'top'
                      ? 'bg-[#ffcb77]/20'
                      : 'bg-white/[0.02] hover:bg-white/10'
                  }`}
                  title="Top Wins"
                  style={{
                    color: activeFilter === 'top' ? '#ffcb77' : '#ffffff70'
                  }}
                >
                  <Crown className="w-5 h-5" />
                </button>

                {/* Lightning Button - All Wins */}
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`w-12 h-[3.375rem] flex items-center justify-center transition-all duration-150 rounded-r-md ${
                    activeFilter === 'all'
                      ? 'bg-[#ffcb77]/20'
                      : 'bg-white/[0.02] hover:bg-white/10'
                  }`}
                  title="All Wins"
                  style={{
                    color: activeFilter === 'all' ? '#ffcb77' : '#ffffff70'
                  }}
                >
                  <Zap className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Live Feed - Cards directly on row background */}
          <div className="flex-1 h-full relative overflow-hidden">
            {/* Left Fade - убираем, чтобы карточки начинались сразу после разделителя */}
            
            {/* Right Fade - убираем, чтобы карточки уходили за границу экрана */}

            {/* Scrolling Cards */}
            <div className="h-full flex items-center gap-1.5 pl-2 pr-0">{/* Добавили небольшой отступ pl-2 */}
              <AnimatePresence initial={false}>
                {feedItems.map((item) => {
                  const RarityIcon = getRarityIcon(item.rarity);
                  
                  return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ x: -120, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      layout: { type: 'spring', stiffness: 350, damping: 30 },
                      opacity: { duration: 0.2 },
                      scale: { duration: 0.2 },
                    }}
                    className="relative flex-shrink-0"
                  >
                    <motion.button
                      layout
                      className="w-28 h-28 rounded-md overflow-hidden relative p-2"
                      style={{ 
                        background: rarityGradients[item.rarity].gradient,
                        boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)` // Убрали внешнее свечение
                      }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      transition={{ duration: 0.2 }}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => onLiveFeedClick(item.playerName)}
                    >
                      {/* Subtle noise texture overlay */}
                      <div 
                        className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                        }}
                      />
                      
                      {/* Hover darkening overlay */}
                      <div 
                        className="absolute inset-0 bg-black/0 transition-all duration-200 pointer-events-none z-[5]"
                        style={{ 
                          backgroundColor: hoveredItem === item.id ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0)'
                        }}
                      />
                      
                      {/* Rarity Icon - top center */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                        <RarityIcon 
                          className="w-4 h-4"
                          style={{ 
                            color: rarityGradients[item.rarity].color,
                            opacity: 0.65,
                            filter: `drop-shadow(0 0 3px ${rarityGradients[item.rarity].glow})`
                          }}
                        />
                      </div>
                      
                      {/* Gradient Overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
                      
                      {/* Item Image */}
                      <img 
                        src={item.itemImage} 
                        alt={item.itemName} 
                        className="w-full h-full object-contain relative z-10 transition-opacity duration-200"
                        style={{ opacity: hoveredItem === item.id ? 0 : 1 }}
                      />
                      
                      {/* Item Name */}
                      <div 
                        className="absolute bottom-1 left-1 right-1 z-10 text-[10px] text-white/80 font-medium truncate px-1 transition-opacity duration-200"
                        style={{ opacity: hoveredItem === item.id ? 0 : 1 }}
                      >
                        {item.itemName}
                      </div>
                      
                      {/* Player Info on Hover */}
                      <AnimatePresence>
                        {hoveredItem === item.id && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-1 z-20 p-2"
                          >
                            <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden">
                              <img
                                src={item.playerAvatar}
                                alt={item.playerName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-[10px] font-semibold text-white truncate max-w-[90%] px-1">
                              {item.playerName}
                            </div>
                            <div className="bg-[#7fa650] px-2 py-0.5 rounded text-xs font-bold text-[#1a1f15]">
                              {item.playerLevel}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Tooltip */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-black/95 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-2xl z-50"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={item.playerAvatar}
                              alt={item.playerName}
                              className="w-10 h-10 rounded-full border-2"
                              style={{ borderColor: rarityColors[item.rarity] }}
                            />
                            <div className="flex-1">
                              <button
                                onClick={() => onLiveFeedClick(item.playerName)}
                                className="font-bold hover:text-red-400 transition-colors text-left"
                              >
                                {item.playerName}
                              </button>
                              <div className="text-xs text-gray-400">LVL {item.playerLevel}</div>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="text-gray-400">
                              <span className="text-white font-medium">{item.itemName}</span>
                            </div>
                            <div className="text-gray-500 text-xs">{item.caseName}</div>
                            <div className="text-gray-500 text-xs">
                              {item.timestamp.toLocaleTimeString()}
                            </div>
                            <div
                              className="inline-block px-2 py-1 rounded text-xs font-bold mt-2"
                              style={{ 
                                backgroundColor: rarityColors[item.rarity] + '30', 
                                color: rarityColors[item.rarity] 
                              }}
                            >
                              {item.rarity.toUpperCase()}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function generateRandomLiveFeedItem(): LiveFeedItem {
  const randomItem = mockLiveFeed[Math.floor(Math.random() * mockLiveFeed.length)];
  return { ...randomItem, id: Date.now().toString(), timestamp: new Date() };
}