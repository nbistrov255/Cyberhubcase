import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Volume2, VolumeOff, FastForward, Users, Box, Activity } from 'lucide-react';

interface CaseOpeningProps {
  caseData: any;
  onOpenCase: () => void;
  onBack: () => void;
}

const rarityColors = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#eab308',
  mythic: '#ef4444',
};

const mockRouletteItems = [
  {
    id: '1',
    name: 'AK-47',
    skin: 'Redline',
    image: 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?w=200&h=200&fit=crop',
    rarity: 'legendary' as const,
    type: 'weapon',
  },
  {
    id: '2',
    name: 'M4A4',
    skin: 'Asiimov',
    image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=200&h=200&fit=crop',
    rarity: 'epic' as const,
    type: 'weapon',
  },
  {
    id: '3',
    name: '',
    skin: '500 Coins',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&h=200&fit=crop',
    rarity: 'legendary' as const,
    type: 'coins',
  },
  {
    id: '4',
    name: 'AWP',
    skin: 'Dragon Lore',
    image: 'https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?w=200&h=200&fit=crop',
    rarity: 'mythic' as const,
    type: 'weapon',
  },
  {
    id: '5',
    name: 'Desert Eagle',
    skin: 'Blaze',
    image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200&h=200&fit=crop',
    rarity: 'legendary' as const,
    type: 'weapon',
  },
  {
    id: '6',
    name: 'Glock-18',
    skin: 'Water Elemental',
    image: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=200&h=200&fit=crop',
    rarity: 'rare' as const,
    type: 'weapon',
  },
  {
    id: '7',
    name: '',
    skin: '100 Coins',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&h=200&fit=crop',
    rarity: 'rare' as const,
    type: 'coins',
  },
  {
    id: '8',
    name: 'USP-S',
    skin: 'Kill Confirmed',
    image: 'https://images.unsplash.com/photo-1611941437604-85d79a4c2029?w=200&h=200&fit=crop',
    rarity: 'epic' as const,
    type: 'weapon',
  },
  {
    id: '9',
    name: 'P90',
    skin: 'Asiimov',
    image: 'https://images.unsplash.com/photo-1625527574283-f375083d5de6?w=200&h=200&fit=crop',
    rarity: 'rare' as const,
    type: 'weapon',
  },
  {
    id: '10',
    name: 'Knife',
    skin: 'Butterfly Fade',
    image: 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?w=200&h=200&fit=crop',
    rarity: 'mythic' as const,
    type: 'weapon',
  },
];

const caseContents = [...mockRouletteItems];

export function CaseOpening({ caseData, onOpenCase, onBack }: CaseOpeningProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [fastMode, setFastMode] = useState(false);
  const [hoveredContentItem, setHoveredContentItem] = useState<string | null>(null);

  const handleOpenCase = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
    }, 13000); // Увеличили с 10500 до 13000мс
    
    setTimeout(() => {
      onOpenCase(); // Затем показываем pop-up с задержкой
    }, 15500); // Задержка 2.5 секунды после остановки
  };

  // Create extended roulette array with center focus
  const extendedItems = [...mockRouletteItems, ...mockRouletteItems, ...mockRouletteItems, ...mockRouletteItems];

  return (
    <div className="min-h-screen flex flex-col bg-[#17171c] relative overflow-hidden">
      {/* Subtle background particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Top Controls */}
      <div className="relative z-10 px-8 py-6 flex items-center justify-between">
        {/* Back Button - Left */}
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

        {/* Level Badge - Center */}
        <div className="px-6 py-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border border-yellow-600/30">
          <span className="text-sm font-bold tracking-wider">LEVEL 0</span>
        </div>

        {/* Icon Buttons - Right */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSoundOn(!soundOn)}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center transition-all"
          >
            {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeOff className="w-5 h-5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFastMode(!fastMode)}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center transition-all"
          >
            <FastForward className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Main Roulette Container */}
      <div className="relative z-10 px-12 py-16">
        <div className="w-full max-w-7xl mx-auto">
          {/* Case Info Above Roulette */}
          <div className="text-center mb-8">
            {/* Premium Case Title Card */}
            <div className="inline-block mb-6">
              <div 
                className="relative px-12 py-6 rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: '#131217',
                  border: '2px solid rgba(234, 179, 8, 0.3)',
                  boxShadow: `
                    0 0 30px rgba(234, 179, 8, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                  `,
                }}
              >
                {/* Subtle corner accents */}
                <div 
                  className="absolute top-0 left-0 w-12 h-12"
                  style={{
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, transparent 100%)',
                  }}
                />
                <div 
                  className="absolute bottom-0 right-0 w-12 h-12"
                  style={{
                    background: 'linear-gradient(-45deg, rgba(234, 179, 8, 0.1) 0%, transparent 100%)',
                  }}
                />

                {/* Level Badge */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div 
                    className="h-px flex-1"
                    style={{
                      background: 'linear-gradient(to right, transparent, rgba(234, 179, 8, 0.5), transparent)',
                    }}
                  />
                  <div 
                    className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest"
                    style={{
                      backgroundColor: 'rgba(234, 179, 8, 0.1)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      color: '#eab308',
                    }}
                  >
                    УРОВЕНЬ {caseData.level || 0}
                  </div>
                  <div 
                    className="h-px flex-1"
                    style={{
                      background: 'linear-gradient(to left, transparent, rgba(234, 179, 8, 0.5), transparent)',
                    }}
                  />
                </div>

                {/* Case Type */}
                <div className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-2 font-medium">
                  {caseData.type}
                </div>

                {/* Case Name */}
                <div className="relative">
                  <h1 
                    className="text-4xl font-bold tracking-wide mb-3"
                    style={{
                      background: 'linear-gradient(to bottom, #ffffff 0%, #d4d4d8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 2px 20px rgba(234, 179, 8, 0.2)',
                    }}
                  >
                    {caseData.name}
                  </h1>
                  
                  {/* Underline accent */}
                  <div className="flex items-center justify-center gap-2">
                    <div 
                      className="w-8 h-px"
                      style={{
                        background: 'linear-gradient(to right, transparent, #eab308)',
                      }}
                    />
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: '#eab308',
                        boxShadow: '0 0 8px rgba(234, 179, 8, 0.6)',
                      }}
                    />
                    <div 
                      className="w-8 h-px"
                      style={{
                        background: 'linear-gradient(to left, transparent, #eab308)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Roulette Container */}
          <div className="relative">
            {/* Top Triangle Indicator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M20 6 C20 6, 32 26, 32 26 L8 26 C8 26, 20 6, 20 6 Z" 
                  fill="#ffcb77"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 0 16px rgba(255, 203, 119, 0.9))',
                  }}
                />
              </svg>
            </div>

            {/* Bottom Triangle Indicator */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 pointer-events-none">
              <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M20 26 C20 26, 8 6, 8 6 L32 6 C32 6, 20 26, 20 26 Z" 
                  fill="#ffcb77"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 0 16px rgba(255, 203, 119, 0.9))',
                  }}
                />
              </svg>
            </div>

            {/* Main Roulette Frame */}
            <div 
              className="relative rounded-2xl overflow-hidden py-12"
              style={{
                backgroundColor: '#1d1d26',
                border: '4px solid #2e3244',
                boxShadow: 'inset 0 2px 30px rgba(0, 0, 0, 0.6), 0 8px 32px rgba(0, 0, 0, 0.4)',
                backgroundImage: `
                  radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
                  radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.03) 0%, transparent 50%)
                `,
              }}
            >
              {/* Gradient Edges for Depth */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/40 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/40 to-transparent z-10 pointer-events-none" />

              {/* Item Strip Container */}
              <div className="overflow-hidden relative px-8">
                <motion.div
                  className="flex gap-6 items-center justify-center"
                  animate={
                    isSpinning
                      ? {
                          x: [-2800, 50 + (Math.random() * 200 - 100)], // Рандомная остановка
                          transition: {
                            duration: 12.5, // Увеличили до 12.5 секунд
                            ease: [0.18, 0, 0.005, 1], // Супер плавное замедление в конце
                          },
                        }
                      : {}
                  }
                >
                  {extendedItems.slice(0, 15).map((item, index) => {
                    const distanceFromCenter = Math.abs(index - 7);
                    const opacity = distanceFromCenter > 3 ? 0.25 : (distanceFromCenter > 1 ? 0.6 : 1);
                    const scale = distanceFromCenter === 0 ? 1.05 : 1;

                    return (
                      <motion.div 
                        key={`${item.id}-${index}`} 
                        className="flex-shrink-0"
                        style={{ width: '180px' }}
                        animate={{ opacity, scale }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Item Card */}
                        <div 
                          className="relative rounded-xl overflow-hidden transition-all"
                          style={{
                            backgroundColor: '#0f1419',
                            border: `1.5px solid ${distanceFromCenter === 0 ? rarityColors[item.rarity] : 'rgba(255, 255, 255, 0.06)'}`,
                            boxShadow: distanceFromCenter === 0 
                              ? `0 0 24px ${rarityColors[item.rarity]}50, inset 0 2px 12px rgba(0, 0, 0, 0.8)`
                              : 'inset 0 2px 12px rgba(0, 0, 0, 0.8)',
                          }}
                        >
                          {/* Rarity Gradient Overlay */}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 40%, ${rarityColors[item.rarity]}25 100%)`,
                            }}
                          />

                          {/* Top Rarity Bar */}
                          <div 
                            className="h-1"
                            style={{
                              backgroundColor: rarityColors[item.rarity],
                              boxShadow: `0 0 12px ${rarityColors[item.rarity]}`,
                            }}
                          />

                          {/* Item Image */}
                          <div className="relative flex items-center justify-center py-8 px-4">
                            <motion.img
                              src={item.image}
                              alt={item.skin}
                              className="object-contain relative z-10"
                              style={{ 
                                width: '110px',
                                height: '110px',
                                filter: isSpinning && distanceFromCenter > 2 ? 'blur(3px)' : 'blur(0px)',
                              }}
                              animate={
                                distanceFromCenter === 0 && !isSpinning
                                  ? {
                                      y: [0, -4, 0],
                                    }
                                  : {}
                              }
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                            {item.type === 'coins' && (
                              <div
                                className="absolute inset-0 rounded-full opacity-30"
                                style={{
                                  background: `radial-gradient(circle, ${rarityColors[item.rarity]}80 0%, transparent 60%)`,
                                }}
                              />
                            )}
                          </div>

                          {/* Item Name */}
                          <div className="text-center pb-4 px-3 relative z-10">
                            {item.name && (
                              <div className="text-xs uppercase text-gray-500 tracking-wide mb-0.5">
                                {item.name}
                              </div>
                            )}
                            <div className="text-sm font-bold leading-tight">
                              {item.skin}
                            </div>
                          </div>

                          {/* Bottom Rarity Glow */}
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-px"
                            style={{
                              backgroundColor: rarityColors[item.rarity],
                              boxShadow: `0 0 8px ${rarityColors[item.rarity]}`,
                            }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Open Button Below Roulette */}
          <div className="flex justify-center mt-12">
            {caseData.locked ? (
              <div className="px-10 py-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-bold tracking-wider text-gray-400">ЗАБЛОКИРОВАНО</span>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenCase}
                disabled={isSpinning}
                className="px-16 py-4 rounded-xl font-bold text-lg tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                style={{
                  backgroundColor: '#eab308',
                  color: '#000',
                  boxShadow: '0 8px 32px rgba(234, 179, 8, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                }}
              >
                {isSpinning ? (
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="flex gap-1"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-black/60" />
                      <div className="w-2 h-2 rounded-full bg-black/60" />
                      <div className="w-2 h-2 rounded-full bg-black/60" />
                    </motion.div>
                    <span>ОТКРЫТИЕ...</span>
                  </div>
                ) : (
                  'ОТКРЫТЬ КЕЙС'
                )}

                {/* Shine Effect */}
                {!isSpinning && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: [-300, 500],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                    }}
                  />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Case Contents Section */}
      <div className="relative z-10 px-12 pb-8">
        <div className="w-full max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">CASE CONTENTS</h2>
          <div className="grid grid-cols-5 gap-4">
            {caseContents.map((item) => (
              <motion.div
                key={item.id}
                className="relative rounded-xl overflow-hidden border border-white/10 cursor-pointer transition-all"
                style={{
                  backgroundColor: '#1a1f26',
                }}
                whileHover={{ scale: 1.05, y: -4 }}
                onMouseEnter={() => setHoveredContentItem(item.id)}
                onMouseLeave={() => setHoveredContentItem(null)}
              >
                {/* Gradient overlay on hover */}
                <div
                  className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                  style={{
                    opacity: hoveredContentItem === item.id ? 0.85 : 0,
                    background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, ${rarityColors[item.rarity]} 100%)`,
                  }}
                />
                
                <div className="aspect-square p-4 flex flex-col items-center justify-center relative z-10">
                  <img
                    src={item.image}
                    alt={item.skin}
                    className="w-24 h-24 object-contain mb-2"
                  />
                  {item.name && (
                    <div className="text-xs text-gray-400 text-center">{item.name}</div>
                  )}
                  <div className="text-sm font-bold text-center">{item.skin}</div>
                  <div
                    className="h-0.5 w-12 rounded-full mt-2"
                    style={{
                      backgroundColor: rarityColors[item.rarity],
                      boxShadow: `0 0 8px ${rarityColors[item.rarity]}80`,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Information Stats Section */}
      <div className="relative z-10 px-12 pb-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            {/* Total Users */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-2xl p-6 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">24,891</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>

            {/* Total Cases Opened */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-2xl p-6 text-center">
              <Box className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">156,742</div>
              <div className="text-sm text-gray-400">Total Cases Opened</div>
            </div>

            {/* Active Players */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-2xl p-6 text-center">
              <Activity className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">1,247</div>
              <div className="text-sm text-gray-400">Active Players Now</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent via-transparent to-black/40" />
    </div>
  );
}