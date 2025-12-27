import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Volume2, VolumeX, X, Gift, Crown, Flame, Diamond, Star, Sparkles } from 'lucide-react';
import { FooterSection } from './FooterSection';

interface CaseItem {
  id: string;
  name: string;
  type: string;
  image: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  chance: number;
}

interface CaseOpenPageProps {
  caseName: string;
  caseImage: string;
  deposited: number;
  required: number;
  onBack: () => void;
  onClose: () => void;
  onWin: (item: CaseItem) => void;
}

const rarityColors = {
  Common: { glow: 'rgba(107, 114, 128, 0.6)', stripe: '#6b7280' },
  Rare: { glow: 'rgba(59, 130, 246, 0.6)', stripe: '#3b82f6' },
  Epic: { glow: 'rgba(168, 85, 247, 0.6)', stripe: '#a855f7' },
  Legendary: { glow: 'rgba(234, 179, 8, 0.6)', stripe: '#eab308' },
  Mythic: { glow: 'rgba(239, 68, 68, 0.6)', stripe: '#ef4444' },
};

const rarityIcons = {
  Common: Gift,
  Rare: Star,
  Epic: Sparkles,
  Legendary: Crown,
  Mythic: Flame,
};

// Mock case contents
const mockCaseContents: CaseItem[] = [
  { id: '1', name: 'Redline', type: 'AK-47', image: 'https://i.ibb.co/wN8mzF3j/3a201c1d-000c-42aa-80b1-5affd33b70c4-sized-1000x1000.png', rarity: 'Mythic', chance: 0.26 },
  { id: '2', name: 'Howl', type: 'M4A4', image: 'https://i.ibb.co/cXCCBcfV/unnamed.png', rarity: 'Legendary', chance: 0.64 },
  { id: '3', name: 'Dragon Lore', type: 'AWP', image: 'https://i.ibb.co/bMXcgsWP/1385599722-preview-Phase-4-BF.png', rarity: 'Mythic', chance: 0.13 },
  { id: '4', name: 'Fade', type: 'Karambit', image: 'https://i.ibb.co/c9JRDpG/12143-b.png', rarity: 'Legendary', chance: 0.86 },
  { id: '5', name: 'Water Elemental', type: 'Glock-18', image: 'https://i.ibb.co/cXCCBcfV/unnamed.png', rarity: 'Epic', chance: 2.54 },
  { id: '6', name: 'Blaze', type: 'Desert Eagle', image: 'https://i.ibb.co/wN8mzF3j/3a201c1d-000c-42aa-80b1-5affd33b70c4-sized-1000x1000.png', rarity: 'Epic', chance: 3.19 },
  { id: '7', name: 'Asiimov', type: 'P90', image: 'https://i.ibb.co/bMXcgsWP/1385599722-preview-Phase-4-BF.png', rarity: 'Rare', chance: 7.98 },
  { id: '8', name: 'Kill Confirmed', type: 'USP-S', image: 'https://i.ibb.co/c9JRDpG/12143-b.png', rarity: 'Rare', chance: 9.45 },
  { id: '9', name: 'Skulls', type: 'MP7', image: 'https://i.ibb.co/cXCCBcfV/unnamed.png', rarity: 'Common', chance: 15.82 },
  { id: '10', name: 'See Ya Later', type: 'P250', image: 'https://i.ibb.co/wN8mzF3j/3a201c1d-000c-42aa-80b1-5affd33b70c4-sized-1000x1000.png', rarity: 'Common', chance: 18.67 },
  { id: '11', name: 'Neon Rider', type: 'MAC-10', image: 'https://i.ibb.co/bMXcgsWP/1385599722-preview-Phase-4-BF.png', rarity: 'Rare', chance: 11.23 },
  { id: '12', name: 'Hyper Beast', type: 'Five-SeveN', image: 'https://i.ibb.co/c9JRDpG/12143-b.png', rarity: 'Epic', chance: 4.67 },
  { id: '13', name: 'Fuel Injector', type: 'Tec-9', image: 'https://i.ibb.co/wN8mzF3j/3a201c1d-000c-42aa-80b1-5affd33b70c4-sized-1000x1000.png', rarity: 'Rare', chance: 8.92 },
  { id: '14', name: 'Pole Position', type: 'CZ75-Auto', image: 'https://i.ibb.co/cXCCBcfV/unnamed.png', rarity: 'Common', chance: 15.64 },
];

export function CaseOpenPage({ caseName, caseImage, deposited, required, onBack, onClose, onWin }: CaseOpenPageProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteItems, setRouletteItems] = useState<CaseItem[]>([]);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const canOpen = deposited >= required;
  const missingAmount = required - deposited;

  // Rarity order for sorting (best to worst)
  const rarityOrder = {
    'Legendary': 1,
    'Mythic': 2,
    'Epic': 3,
    'Rare': 4,
    'Common': 5,
  };

  // Sort case contents by rarity
  const sortedCaseContents = [...mockCaseContents].sort((a, b) => {
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  // Generate roulette items on mount
  useEffect(() => {
    const items: CaseItem[] = [];
    for (let i = 0; i < 100; i++) {
      const randomItem = mockCaseContents[Math.floor(Math.random() * mockCaseContents.length)];
      items.push({ ...randomItem, id: `roulette-${i}` });
    }
    setRouletteItems(items);
  }, []);

  const handleOpen = async () => {
    if (!canOpen || isSpinning) return;

    setIsSpinning(true);
    
    try {
      // Отправляем запрос на сервер для открытия кейса
      const response = await fetch('http://localhost:3000/api/cases/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseName: caseName,
          // Можно добавить дополнительные параметры, если требуется
          // userId: userId, // если есть система авторизации
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to open case');
      }

      const data = await response.json();
      
      // Используем полученный приз из сервера
      const winningItem = data.prize || mockCaseContents[Math.floor(Math.random() * mockCaseContents.length)];
      
      // Calculate final position (center on winning item)
      const itemWidth = 200;
      const winningIndex = 50;
      
      // Replace item at winning position
      const updatedItems = [...rouletteItems];
      updatedItems[winningIndex] = { ...winningItem, id: `winning-${Date.now()}` };
      setRouletteItems(updatedItems);

      // Calculate offset to center winning item
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const targetOffset = -(winningIndex * itemWidth) + (containerWidth / 2) - (itemWidth / 2);
      
      // Add random offset for variation
      const randomOffset = (Math.random() - 0.5) * 40;
      const finalOffset = targetOffset + randomOffset;

      setTimeout(() => {
        setOffset(finalOffset);
      }, 50);

      // Show win after animation
      setTimeout(() => {
        setIsSpinning(false);
        onWin(winningItem);
      }, 5000);
    } catch (error) {
      console.error('Error opening case:', error);
      setIsSpinning(false);
      alert('Failed to open case. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#17171c] pb-12">
      {/* Roulette Section */}
      <div className="px-8 mb-8 pt-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Top Controls - Back Button Left, Case Name Center, Sound & Close Right */}
          <div className="flex items-center justify-between mb-6">
            {/* Back Button */}
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
              <span className="font-bold text-sm uppercase tracking-wider">BACK</span>
            </motion.button>

            {/* Case Name - Center */}
            <h1 className="text-4xl font-bold text-[rgb(255,249,249)] font-[Aldrich] uppercase">{caseName}</h1>

            {/* Control Buttons - Sound & Close */}
            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMuted(!isMuted)}
                className="w-9 h-9 rounded bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-white/60" /> : <Volume2 className="w-4 h-4 text-white/60" />}
              </motion.button>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </motion.button>
            </div>
          </div>

          {/* Unified Roulette Block */}
          <div 
            className="relative rounded-lg overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse at center, #1d1d26 0%, #151519 100%)',
              border: '2px solid #3a3f46',
              height: '280px',
            }}
          >
            {/* Dark Vignette Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
              }}
            />

            {/* Top Selection Arrow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <svg width="64" height="32" viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M32 26 L20 6 L44 6 Z" 
                  fill="#FFCB77"
                  stroke="#FFCB77"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Bottom Selection Arrow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 pointer-events-none">
              <svg width="64" height="32" viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M32 6 L44 26 L20 26 Z" 
                  fill="#FFCB77"
                  stroke="#FFCB77"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Roulette Items Strip */}
            <div ref={containerRef} className="h-full overflow-hidden py-6">
              <motion.div
                className="flex h-full"
                animate={{
                  x: isSpinning ? offset : 0,
                }}
                transition={{
                  duration: isSpinning ? 4.5 : 0,
                  ease: isSpinning ? [0.25, 0.1, 0.25, 1] : 'linear',
                }}
              >
                {rouletteItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 flex flex-col items-center justify-center px-6 relative"
                    style={{
                      width: '200px',
                    }}
                  >
                    {/* Compact Glow Background - Brighter and Tighter */}
                    <div 
                      className="absolute"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        filter: 'blur(25px)',
                        opacity: 0.7,
                      }}
                    >
                      <div 
                        style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: rarityColors[item.rarity].glow.replace('0.6', '1'),
                          borderRadius: '50%',
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                      {/* Item PNG */}
                      <div className="w-32 h-32 flex items-center justify-center">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Name (Main Text) */}
                      <p className="text-base font-bold text-white text-center leading-tight mb-1 font-[ABeeZee]">
                        {item.name}
                      </p>

                      {/* Quality Stripe - KeyDrop Style */}
                      <div 
                        className="w-24 h-0.5"
                        style={{
                          backgroundColor: rarityColors[item.rarity].stripe,
                        }}
                      />

                      {/* Type (Lower Text) */}
                      <p className="text-xs text-white/60 uppercase tracking-wider">
                        {item.type}
                      </p>
                    </div>

                    {/* Card Separator - Black line with fade at top */}
                    {index < rouletteItems.length - 1 && (
                      <div 
                        className="absolute right-0 pointer-events-none"
                        style={{
                          width: '1px',
                          top: '0',
                          bottom: '-24px',
                          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.25) 30%, transparent 100%)',
                        }}
                      />
                    )}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Open Button - Below Roulette */}
          <div className="mt-6 flex justify-center">
            <motion.button
              whileHover={canOpen && !isSpinning ? { scale: 1.02 } : {}}
              whileTap={canOpen && !isSpinning ? { scale: 0.98 } : {}}
              onClick={handleOpen}
              disabled={!canOpen || isSpinning}
              className="px-20 py-4 rounded-lg font-bold text-lg uppercase transition-all font-[Aldrich]"
              style={{
                backgroundColor: 'transparent',
                border: canOpen && !isSpinning ? '2px solid #10b981' : '2px solid #ef4444',
                color: canOpen && !isSpinning ? '#10b981' : '#ef4444',
                cursor: canOpen && !isSpinning ? 'pointer' : 'not-allowed',
              }}
            >
              {isSpinning ? 'OPENING...' : canOpen ? 'OPEN CASE' : `ADD ${missingAmount.toFixed(2)} $ TO OPEN`}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

      {/* Case Contents */}
      <div className="px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-center mb-8 uppercase tracking-wider font-[Aldrich]"
          >
            Case Contents
          </motion.h2>

          {/* Content Grid */}
          <div className="grid grid-cols-6 gap-4">
            {sortedCaseContents.map((item) => {
              const [isHovered, setIsHovered] = useState(false);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="relative rounded-lg overflow-hidden transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: '#1a1f26',
                    border: isHovered ? `1px solid ${rarityColors[item.rarity].glow.replace('0.6', '0.8')}` : '1px solid #2d3339',
                    boxShadow: isHovered 
                      ? `0 8px 32px ${rarityColors[item.rarity].glow}`
                      : 'none',
                  }}
                >
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
                            width: '100px',
                            height: '100px',
                            backgroundColor: rarityColors[item.rarity].glow.replace('0.6', '1'),
                            borderRadius: '50%',
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Chance Badge */}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs font-bold text-gray-300 z-10">
                    {item.chance.toFixed(2)}%
                  </div>

                  {/* Geometric Background Figure */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300"
                    style={{
                      filter: 'brightness(1.5)',
                      opacity: isHovered ? 0.5 : 0.25,
                      transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    <img 
                      src="https://i.ibb.co/FbfsZ36L/free-icon-geometric-10363376.png"
                      alt=""
                      className="w-32 h-32 object-contain"
                      style={{
                        filter: `drop-shadow(0 0 20px ${rarityColors[item.rarity].stripe})`,
                        opacity: 0.6,
                      }}
                    />
                  </div>

                  {/* Item Content */}
                  <div className="relative z-10 p-4 flex flex-col items-center">
                    {/* Type */}
                    <p className="text-[10px] text-white/60 uppercase tracking-wider mb-2">
                      {item.type}
                    </p>

                    {/* Item Image */}
                    <div className="w-full aspect-square flex items-center justify-center mb-3">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Name */}
                    <p className="font-bold text-sm text-center text-white mb-2">
                      {item.name}
                    </p>

                    {/* Quality Stripe - Same as Roulette */}
                    <div 
                      className="w-16 h-0.5 mb-1"
                      style={{
                        backgroundColor: rarityColors[item.rarity].stripe,
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}