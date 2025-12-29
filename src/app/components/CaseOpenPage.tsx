import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Volume2, VolumeX, X, Gift, Crown, Flame, Diamond, Star, Sparkles, Lock } from 'lucide-react';
import { FooterSection } from './FooterSection';
import { useLanguage } from '../contexts/LanguageContext';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import { toast } from 'sonner';

interface CaseItem {
  id: string;
  name: string;
  type: string;
  image: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  chance: number;
}

interface CaseOpenPageProps {
  caseId: string;
  caseName: string;
  caseImage: string;
  deposited: number;
  required: number;
  isAuthenticated: boolean;
  onBack: () => void;
  onClose: () => void;
  onWin: (item: CaseItem) => void;
  onRequestLogin: () => void;
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

// Map API rarity to UI rarity
const mapRarity = (apiRarity: string): 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' => {
  const normalized = apiRarity.toLowerCase();
  if (normalized.includes('mythic')) return 'Mythic';
  if (normalized.includes('legendary')) return 'Legendary';
  if (normalized.includes('epic')) return 'Epic';
  if (normalized.includes('rare')) return 'Rare';
  return 'Common';
};

export function CaseOpenPage({ caseId, caseName, caseImage, deposited, required, isAuthenticated, onBack, onClose, onWin, onRequestLogin }: CaseOpenPageProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteItems, setRouletteItems] = useState<CaseItem[]>([]);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [caseContents, setCaseContents] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Для гостей всегда показываем deposited = 0
  const displayedDeposited = isAuthenticated ? deposited : 0;
  const canOpen = displayedDeposited >= required;
  const missingAmount = required - displayedDeposited;

  // Rarity order for sorting (best to worst)
  const rarityOrder = {
    'Mythic': 1,
    'Legendary': 2,
    'Epic': 3,
    'Rare': 4,
    'Common': 5,
  };

  // Load case contents from API
  useEffect(() => {
    const fetchCaseContents = async () => {
      try {
        console.log('📦 Loading case contents for ID:', caseId);
        const response = await fetch(API_ENDPOINTS.getCaseById(caseId), {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error('Failed to load case contents');
        }

        const data = await response.json();
        console.log('📦 Case data received:', data);

        if (data.success && data.case && data.case.contents) {
          const mappedContents: CaseItem[] = data.case.contents.map((item: any) => ({
            id: item.id || item.item_id || String(Math.random()),
            name: item.name || item.item_name || 'Unknown Item',
            type: item.type || item.item_type || 'Item',
            image: item.image || item.item_image || 'https://i.ibb.co/bRChPPVb/boxcard.png',
            rarity: mapRarity(item.rarity || 'Common'),
            chance: parseFloat(item.chance || item.drop_chance || '0'),
          }));

          console.log('📦 Mapped case contents:', mappedContents);
          setCaseContents(mappedContents);
        } else {
          console.warn('⚠️ No case contents in response, using empty array');
          setCaseContents([]);
        }
      } catch (error) {
        console.error('❌ Error loading case contents:', error);
        toast.error('Failed to load case contents');
        setCaseContents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseContents();
  }, [caseId]);

  // Sort case contents by rarity
  const sortedCaseContents = [...caseContents].sort((a, b) => {
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  // Generate roulette items when case contents are loaded
  useEffect(() => {
    if (caseContents.length === 0) return;

    const items: CaseItem[] = [];
    for (let i = 0; i < 100; i++) {
      const randomItem = caseContents[Math.floor(Math.random() * caseContents.length)];
      items.push({ ...randomItem, id: `roulette-${i}` });
    }
    setRouletteItems(items);
  }, [caseContents]);

  const handleOpen = async () => {
    if (!canOpen || isSpinning) return;

    setIsSpinning(true);
    
    try {
      console.log('🎰 Opening case:', caseId);
      const response = await fetch(API_ENDPOINTS.openCase, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          case_id: caseId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to open case');
      }

      const data = await response.json();
      console.log('🎰 Case opened, result:', data);
      
      // Map the winning item from API
      const winningItem: CaseItem = {
        id: data.item?.id || data.item?.item_id || String(Date.now()),
        name: data.item?.name || data.item?.item_name || 'Unknown Item',
        type: data.item?.type || data.item?.item_type || 'Item',
        image: data.item?.image || data.item?.item_image || 'https://i.ibb.co/bRChPPVb/boxcard.png',
        rarity: mapRarity(data.item?.rarity || 'Common'),
        chance: parseFloat(data.item?.chance || data.item?.drop_chance || '0'),
      };
      
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
    } catch (error: any) {
      console.error('❌ Error opening case:', error);
      setIsSpinning(false);
      toast.error(error.message || 'Failed to open case. Please try again.');
    }
  };

  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#17171c] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#7c2d3a]"></div>
          <p className="mt-4 text-gray-400">Loading case contents...</p>
        </div>
      </div>
    );
  }

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
            {!isAuthenticated ? (
              // Кнопка для неавторизованных
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRequestLogin}
                className="px-20 py-4 rounded-lg font-bold text-lg uppercase transition-all font-[Aldrich] flex items-center gap-3"
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #7c2d3a',
                  color: '#7c2d3a',
                  cursor: 'pointer',
                }}
              >
                <Lock className="w-5 h-5" />
                {t('login.signIn').toUpperCase()}
              </motion.button>
            ) : (
              // Кнопка для авторизованных
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
                {isSpinning ? t('caseOpen.opening') : canOpen ? t('caseOpen.openCase') : `ADD ${missingAmount.toFixed(2)} $ TO OPEN`}
              </motion.button>
            )}
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
          {sortedCaseContents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No items in this case</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}
