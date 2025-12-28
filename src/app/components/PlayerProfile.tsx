import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Edit2, Save, HelpCircle, X, CheckCircle, Clock, Minimize2, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { FooterSection } from './FooterSection';
import { useAuth } from '../contexts/AuthContext';

interface PlayerProfileProps {
  isPrivate: boolean;
  playerName: string;
  onBack: () => void;
}

interface ClaimRequest {
  id: string;
  requestId: string;
  itemName: string;
  itemRarity: keyof typeof rarityColors;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
  timeRemaining: number; // seconds
}

const rarityColors = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#eab308',
  mythic: '#ef4444',
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
function CountdownTimer({ request, onUpdate }: { request: ClaimRequest; onUpdate: (id: string, timeRemaining: number) => void }) {
  useEffect(() => {
    const interval = setInterval(() => {
      if (request.timeRemaining > 0) {
        onUpdate(request.id, request.timeRemaining - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [request.id, request.timeRemaining, onUpdate]);

  return null;
}

export function PlayerProfile({ isPrivate, playerName, onBack }: PlayerProfileProps) {
  const { profile } = useAuth();
  const [tradeLink, setTradeLink] = useState('https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=abcdef');
  const [isEditingTradeLink, setIsEditingTradeLink] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([]);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [minimizedRequests, setMinimizedRequests] = useState<Set<string>>(new Set());
  const [inventoryPage, setInventoryPage] = useState(0);
  const [winHistoryPage, setWinHistoryPage] = useState(0);
  const [profileBackground, setProfileBackground] = useState('https://i.ibb.co/0jf2XZFw/Chat-GPT-Image-25-2025-00-01-32.png');
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

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

  // Загрузка инвентаря из API
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoadingInventory(true);
        const token = localStorage.getItem('session_token');
        const response = await fetch('/api/inventory', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setInventory(Array.isArray(data) ? data : []);
        } else {
          setInventory([]);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setInventory([]);
      } finally {
        setLoadingInventory(false);
      }
    };

    fetchInventory();
  }, []);

  // Расчет уровня и XP на основе депозитов
  const level = profile?.level || Math.floor((profile?.dailySum || 0) / 100) + 1;
  const currentXP = (profile?.dailySum || 0) % 100;
  const requiredXP = 100;
  const xpProgress = (currentXP / requiredXP) * 100;
  const openedCases = profile?.openedCases || 0;

  // Имя и аватар игрока из профиля
  const displayName = profile?.nickname || playerName;
  const avatarUrl = profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';

  // Pagination constants
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(inventory.length / ITEMS_PER_PAGE);
  const startIndex = inventoryPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = inventory.slice(startIndex, endIndex);

  // Win History - пока пустой массив (нет API endpoint)
  const winHistory: any[] = [];
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

  const handleSaveTradeLink = () => {
    setIsEditingTradeLink(false);
  };

  const handleClaimItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newRequest: ClaimRequest = {
      id: itemId,
      requestId: generateRequestId(),
      itemName: item.title || item.name,
      itemRarity: (item.rarity || 'common') as keyof typeof rarityColors,
      timestamp: new Date(),
      status: 'pending',
      timeRemaining: 3600, // 1 hour in seconds
    };

    setClaimRequests(prev => [...prev, newRequest]);
  };

  const handleRemoveRequest = (itemId: string) => {
    setClaimRequests(prev => prev.filter(req => req.id !== itemId));
  };

  const handleToggleMinimize = (itemId: string) => {
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
            <h2 className="text-2xl font-bold mb-6 font-[Rajdhani] uppercase">MY INVENTORY</h2>
            
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
                    
                    return (
                      <motion.div
                        key={item.id}
                        onMouseEnter={() => setHoveredItemId(item.id)}
                        onMouseLeave={() => setHoveredItemId(null)}
                        onClick={() => !hasClaimRequest && handleClaimItem(item.id)}
                        className="relative rounded-lg overflow-hidden transition-all duration-200 cursor-pointer"
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
                            )}
                          </AnimatePresence>

                        </div>

                        {/* Claim Button - Shows on Hover */}
                        <AnimatePresence>
                          {isHovered && !hasClaimRequest && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute bottom-3 left-3 right-3 z-50 pointer-events-none"
                            >
                              <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaimItem(item.id);
                                }}
                                className="w-full py-2.5 rounded-lg text-xs font-bold font-[Aldrich] uppercase transition-all pointer-events-auto shadow-lg"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.4) 100%)',
                                  backdropFilter: 'blur(10px)',
                                  WebkitBackdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(16, 185, 129, 0.6)',
                                  color: '#10b981',
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                                }}
                              >
                                ЗАБРАТЬ
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                className="relative border-2 rounded-xl shadow-2xl overflow-hidden cursor-pointer"
                style={{
                  backgroundColor: '#1a1f26',
                  borderColor: '#dc2626',
                  boxShadow: `0 8px 32px #dc262666`,
                }}
              >
                {isMinimized ? (
                  // Minimized View (Tab)
                  <div 
                    onClick={() => handleToggleMinimize(request.id)}
                    className="p-3 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold font-[Aldrich] text-orange-400 truncate">
                          ОЖИДАНИЕ
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {formatTimeRemaining(request.timeRemaining)}
                        </div>
                      </div>
                    </div>
                    <Maximize2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ) : (
                  // Expanded View
                  <div className="p-4">
                    {/* Countdown Timer */}
                    <CountdownTimer
                      request={request}
                      onUpdate={(id, timeRemaining) => {
                        setClaimRequests(prev => prev.map(req => req.id === id ? { ...req, timeRemaining } : req));
                      }}
                    />
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMinimize(request.id);
                        }}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <Minimize2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveRequest(request.id);
                        }}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <h3 className="font-bold text-sm font-[Aldrich] text-orange-400">СТАТУС ЗАЯВКИ</h3>
                    </div>

                    {/* Request ID */}
                    <div className="mb-3 bg-black/40 rounded-lg p-2">
                      <div className="text-xs text-gray-400 mb-1">ID Заявки:</div>
                      <div className="font-bold text-sm font-mono text-orange-400">#{request.requestId}</div>
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

                    {/* Status - Pending with Spinner */}
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30 mb-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="text-xs text-gray-400">Статус:</div>
                        <div className="font-bold text-sm font-[Aldrich] text-red-400">
                          Ожидание подтверждения администратора
                        </div>
                      </div>
                    </div>

                    {/* Countdown Display */}
                    <div className="flex items-center justify-between p-2 bg-black/40 rounded-lg">
                      <div className="text-xs text-gray-400">Осталось времени:</div>
                      <div className="font-bold font-mono text-lg text-orange-400">
                        {formatTimeRemaining(request.timeRemaining)}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="mt-2 text-xs text-gray-500">
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