import { useState, useEffect } from 'react';
import { Settings, User, DollarSign, Trophy, Box, RotateCw, Crown, Zap, Users, Circle, Diamond, Star, Flame, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { LiveFeedItem } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { API_ENDPOINTS } from '../../config/api';

// Заменено figma:asset импорт на прямую ссылку
const knifeImage = "https://i.ibb.co/cXCCBcfV/unnamed.png";

interface TopBarProps {
  balance: number;
  isAuthenticated: boolean;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  onLoginClick: () => void;
  onLiveFeedClick: (playerName: string) => void;
  onLogoClick?: () => void; // Добавили функцию для клика по логотипу
  onBalanceRefresh?: () => void; // Добавили функцию для обновления баланса
}

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
  isAuthenticated,
  onSettingsClick,
  onProfileClick,
  onLoginClick,
  onLiveFeedClick,
  onLogoClick,
  onBalanceRefresh,
}: TopBarProps) {
  const { profile } = useAuth(); // Получаем профиль из контекста
  const { isConnected } = useWebSocket(); // 🔥 Получаем статус WebSocket
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<LiveFeedItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'top'>('all');
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({ casesOpened: 0, uniquePlayers: 0 });

  // Загрузка статистики из API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/public');
        
        if (!response.ok) {
          console.error('Failed to fetch stats');
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          setStats({
            casesOpened: data.stats?.total_spins || 0,
            uniquePlayers: data.stats?.unique_users || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Загрузка Live Feed из API
  useEffect(() => {
    const fetchLiveFeed = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getRecentDrops);
        
        if (!response.ok) {
          console.error('Live feed API error:', response.status, response.statusText);
          return;
        }
        
        const data = await response.json();
        
        if (data.success && data.drops && Array.isArray(data.drops)) {
          const items: LiveFeedItem[] = data.drops.map((drop: any) => ({
            id: drop.id || `${Date.now()}-${Math.random()}`,
            itemName: drop.item_name || drop.prize_title || 'Unknown Item',
            itemImage: drop.image || drop.image_url || knifeImage,
            rarity: (drop.rarity || 'common').toLowerCase() as 'common' | 'rare' | 'epic' | 'legendary' | 'mythic',
            playerName: drop.user_name || 'Anonymous',
            playerAvatar: drop.player_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
            playerLevel: drop.player_level || 1,
            caseName: drop.case_name || 'Mystery Case',
            timestamp: drop.timestamp ? new Date(drop.timestamp) : new Date(),
          }));
          setFeedItems(items);
        }
      } catch (err) {
        console.error('Failed to fetch live feed:', err);
      }
    };

    fetchLiveFeed();
    const interval = setInterval(fetchLiveFeed, 10000); // Обновляем каждые 10 секунд

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
    
    // Вызываем функцию обновления баланса (БЕЗ toast.success)
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
          <div className="flex items-center gap-3">
            {/* Balance Monoblock - Единая плашка со всеми балансами */}
            {isAuthenticated && profile && (
              <div 
                className="h-10 px-4 rounded-lg bg-white/5 flex items-center gap-4 border border-white/10"
                title="Balance Overview"
              >
                {/* Wallet Balance */}
                <div className="flex items-center gap-2 pr-3 border-r border-white/10">
                  <DollarSign className="w-4 h-4 text-[#4ade80]" strokeWidth={2.5} />
                  <span className="text-sm font-bold text-white">
                    {profile.balance?.toFixed(2) || '0.00'} €
                  </span>
                </div>

                {/* Deposit Progress - Today & Month */}
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-[#4ade80]" strokeWidth={2.5} />
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-400 uppercase leading-tight">Today</span>
                      <span className="text-white font-bold leading-tight">
                        {(profile.dailySum || 0).toFixed(2)}€
                      </span>
                    </div>
                    <div className="w-px h-6 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-400 uppercase leading-tight">Month</span>
                      <span className="text-white font-bold leading-tight">
                        {(profile.monthlySum || 0).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>

                {/* Refresh Button - внутри моноблока */}
                <button 
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-50 ml-2"
                  onClick={handleRefreshClick}
                  disabled={isRefreshing}
                  title="Refresh Balance"
                >
                  <RotateCw 
                    className={`w-4 h-4 text-white transition-transform duration-1000 ${isRefreshing ? 'animate-spin' : ''}`} 
                    strokeWidth={2.5} 
                  />
                </button>
              </div>
            )}

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group border border-white/10"
            >
              <Settings className="w-5 h-5 text-white transition-transform duration-200 group-hover:rotate-90" />
            </button>

            {/* 🔥 WebSocket Connection Indicator */}
            <div className="relative group">
              <div 
                className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                  isConnected 
                    ? 'bg-[#4ade80]/10 border-[#4ade80]/30 hover:bg-[#4ade80]/20' 
                    : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 animate-pulse'
                }`}
                title={isConnected ? 'Connected' : 'Disconnected'}
              >
                {isConnected ? (
                  <Wifi className="w-5 h-5 text-[#4ade80]" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute top-full mt-2 right-0 w-48 bg-black/95 backdrop-blur-lg border border-white/20 rounded-lg p-3 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white">Real-time Connection</div>
                  <div className={isConnected ? 'text-[#4ade80]' : 'text-red-500'}>
                    {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                  </div>
                  <div className="text-gray-400 text-[10px] mt-2">
                    {isConnected 
                      ? 'Live updates enabled' 
                      : 'Reconnecting...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Login Button or Profile Avatar */}
            {!isAuthenticated ? (
              // Кнопка авторизации - зеленая с градиентом
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onLoginClick}
                className="px-5 h-10 rounded-lg flex items-center gap-2 transition-all duration-300 font-bold uppercase text-sm tracking-wider relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(34, 197, 94, 0.25) 100%)',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  boxShadow: '0 0 20px rgba(74, 222, 128, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Градиентный overlay на hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.25) 0%, rgba(34, 197, 94, 0.35) 100%)',
                  }}
                />
                
                {/* Анимированное свечение границы на hover */}
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: '0 0 30px rgba(74, 222, 128, 0.4), inset 0 0 20px rgba(74, 222, 128, 0.1)',
                  }}
                />
                
                <User className="w-5 h-5 text-[#4ade80] relative z-10 group-hover:text-[#22c55e] transition-colors duration-300" />
                <span className="text-[#4ade80] relative z-10 group-hover:text-[#22c55e] transition-colors duration-300">Sign In</span>
              </motion.button>
            ) : (
              // Profile Avatar with Level для авторизованных
              <button
                onClick={onProfileClick}
                className="w-10 h-10 rounded-lg overflow-hidden relative hover:ring-2 hover:ring-white/20 transition-all"
              >
                {/* Avatar Image */}
                <img
                  src={profile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                  alt="Player Avatar"
                  className="w-full h-full object-cover"
                />
                
                {/* Level Bar - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm flex items-center justify-center" style={{ height: '14px' }}>
                  <span className="text-[9px] font-bold text-white/90 tracking-wide">LVL 1</span>
                </div>
              </button>
            )}
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
                <span className="text-xl font-bold text-white leading-tight">{stats.casesOpened.toLocaleString()}</span>
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