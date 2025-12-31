import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Circle, Diamond, Star, Crown, Flame } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useWebSocket } from '../contexts/WebSocketContext'; // ✅ Добавлен WebSocket

interface LiveDrop {
  id: string;
  item_name: string;
  image: string;
  user_name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  case_image?: string;
  timestamp?: Date;
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

export function LiveFeed() {
  const [drops, setDrops] = useState<LiveDrop[]>([]);
  const [hoveredDrop, setHoveredDrop] = useState<string | null>(null);
  const { socket } = useWebSocket(); // ✅ Используем WebSocket

  // Fetch live drops every 3-5 seconds
  useEffect(() => {
    const fetchDrops = async () => {
      try {
        const response = await fetch('/api/drops/recent');
        
        if (!response.ok) {
          console.error('Failed to fetch live drops:', response.status);
          return;
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.drops)) {
          const mappedDrops: LiveDrop[] = data.drops.map((drop: any) => ({
            id: drop.id || `${Date.now()}-${Math.random()}`,
            item_name: drop.item_name || 'Unknown Item',
            image: drop.image || 'https://via.placeholder.com/200',
            user_name: drop.user_name || 'Anonymous',
            rarity: (drop.rarity || 'common').toLowerCase() as 'common' | 'rare' | 'epic' | 'legendary' | 'mythic',
            case_image: drop.case_image,
            timestamp: drop.timestamp ? new Date(drop.timestamp) : new Date(),
          }));
          
          setDrops(mappedDrops);
        }
      } catch (error) {
        console.error('Error fetching live drops:', error);
      }
    };

    fetchDrops();
    const interval = setInterval(fetchDrops, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // ✅ Обработка сообщений от WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewDrop = (drop: LiveDrop) => {
      setDrops((prevDrops) => [drop, ...prevDrops]);
    };

    socket.on('new_drop', handleNewDrop);

    return () => {
      socket.off('new_drop', handleNewDrop);
    };
  }, [socket]);

  return (
    <div className="w-full overflow-hidden bg-[#1d1f24] py-4">
      <div className="flex items-center gap-3 px-6">
        {/* Live Indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.div
            className="w-3 h-3 rounded-full bg-red-500"
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            Live Drops
          </span>
        </div>

        {/* Scrolling Feed */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <AnimatePresence mode="popLayout">
              {drops.map((drop) => {
                const RarityIcon = getRarityIcon(drop.rarity);
                
                return (
                  <motion.div
                    key={drop.id}
                    layout
                    initial={{ x: -120, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      layout: { type: 'spring', stiffness: 350, damping: 30 },
                      opacity: { duration: 0.2 },
                      scale: { duration: 0.2 },
                    }}
                    className="flex-shrink-0"
                  >
                    <motion.button
                      className="w-24 h-24 rounded-md overflow-hidden relative p-2"
                      style={{
                        background: rarityGradients[drop.rarity].gradient,
                        border: `1px solid ${rarityColors[drop.rarity]}40`,
                        boxShadow: `0 0 10px ${rarityGradients[drop.rarity].glow}`,
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ duration: 0.2 }}
                      onMouseEnter={() => setHoveredDrop(drop.id)}
                      onMouseLeave={() => setHoveredDrop(null)}
                    >
                      {/* Rarity Icon */}
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10">
                        <RarityIcon
                          className="w-3 h-3"
                          style={{
                            color: rarityGradients[drop.rarity].color,
                            opacity: 0.7,
                            filter: `drop-shadow(0 0 3px ${rarityGradients[drop.rarity].glow})`,
                          }}
                        />
                      </div>

                      {/* Item Image */}
                      <ImageWithFallback
                        src={drop.image}
                        alt={drop.item_name}
                        className="w-full h-full object-contain relative z-10"
                      />

                      {/* User Name */}
                      <div
                        className="absolute bottom-1 left-1 right-1 z-10 text-[9px] text-white/80 font-medium truncate px-1 text-center"
                      >
                        {drop.user_name}
                      </div>

                      {/* Hover Overlay */}
                      {hoveredDrop === drop.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/20 z-[5]"
                        />
                      )}
                    </motion.button>

                    {/* Tooltip on Hover */}
                    <AnimatePresence>
                      {hoveredDrop === drop.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-black/95 backdrop-blur-lg border border-white/20 rounded-xl p-3 shadow-2xl z-50 pointer-events-none"
                        >
                          <div className="text-sm space-y-1">
                            <div className="text-white font-bold truncate">
                              {drop.item_name}
                            </div>
                            <div className="text-gray-400 text-xs">
                              Won by: {drop.user_name}
                            </div>
                            <div
                              className="inline-block px-2 py-0.5 rounded text-xs font-bold mt-1"
                              style={{
                                backgroundColor: rarityColors[drop.rarity] + '30',
                                color: rarityColors[drop.rarity],
                              }}
                            >
                              {drop.rarity.toUpperCase()}
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
  );
}