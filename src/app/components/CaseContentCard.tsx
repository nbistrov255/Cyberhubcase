import { motion } from 'motion/react';
import { Gift, Crown, Flame, Diamond, Star, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface CaseContentItem {
  id: string;
  name: string;
  type: 'weapon' | 'knife' | 'bonus' | 'privilege';
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  dropChance: number;
}

interface CaseContentCardProps {
  item: CaseContentItem;
}

const rarityConfig = {
  common: {
    color: '#6b7280',
    glow: 'rgba(107, 114, 128, 0.3)',
    bg: 'linear-gradient(135deg, rgba(107, 114, 128, 0.08) 0%, rgba(107, 114, 128, 0.02) 100%)',
    icon: Star,
  },
  rare: {
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.03) 100%)',
    icon: Diamond,
  },
  epic: {
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.5)',
    bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.04) 100%)',
    icon: Sparkles,
  },
  legendary: {
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.6)',
    bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.18) 0%, rgba(234, 179, 8, 0.05) 100%)',
    icon: Crown,
  },
  mythic: {
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.6)',
    bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.06) 100%)',
    icon: Flame,
  },
};

const typeIcons = {
  weapon: Star,
  knife: Flame,
  bonus: Gift,
  privilege: Crown,
};

export function CaseContentCard({ item }: CaseContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = rarityConfig[item.rarity];
  const TypeIcon = typeIcons[item.type];

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      {/* Card Container */}
      <div 
        className="relative h-64 bg-black/40 backdrop-blur-sm border border-white/5 overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, rgba(13, 17, 23, 0.95), rgba(22, 27, 34, 0.98))`,
          boxShadow: isHovered 
            ? `0 8px 32px ${config.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.03)` 
            : `0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.02)`,
        }}
      >
        {/* Drop Chance Badge - Top Right */}
        <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/10">
          <span className="text-xs font-bold text-white/90">{item.dropChance}%</span>
        </div>

        {/* Geometric Shape Background */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {/* Diamond Shape */}
          <motion.div
            className="absolute"
            animate={{
              rotate: isHovered ? 180 : 0,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div
              className="w-32 h-32 rotate-45"
              style={{
                background: config.bg,
                opacity: isHovered ? 0.8 : 0.4,
                boxShadow: `0 0 60px ${config.glow}`,
                transition: 'opacity 0.15s ease-out',
              }}
            />
          </motion.div>

          {/* Hexagon Shape (using CSS clip-path) */}
          <motion.div
            className="absolute"
            animate={{
              scale: isHovered ? 1.15 : 1,
              opacity: isHovered ? 0.6 : 0.25,
            }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="w-40 h-40"
              style={{
                background: config.bg,
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                filter: `blur(20px)`,
              }}
            />
          </motion.div>
        </div>

        {/* Hover Darkening Overlay */}
        <motion.div
          className="absolute inset-0 bg-black pointer-events-none z-[5]"
          animate={{ opacity: isHovered ? 0.3 : 0 }}
          transition={{ duration: 0.15 }}
        />

        {/* Center Glow on Hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-[6]"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
            style={{
              background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
            }}
          />
        </motion.div>

        {/* Item Image */}
        <div className="absolute inset-0 flex items-center justify-center z-10 p-8">
          <motion.img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain drop-shadow-2xl"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.15 }}
          />
        </div>

        {/* Center Icon on Hover */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[15] pointer-events-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: isHovered ? 0.35 : 0,
            scale: isHovered ? 1.2 : 0.5,
          }}
          transition={{ duration: 0.15 }}
        >
          <TypeIcon
            className="w-20 h-20"
            style={{ color: config.color }}
            strokeWidth={1.5}
          />
        </motion.div>

        {/* Bottom Info Section */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
          {/* Item Name */}
          <div className="text-sm font-bold text-white mb-1 truncate">
            {item.name}
          </div>

          {/* Item Type Badge */}
          <div className="flex items-center gap-1.5">
            <div
              className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: `${config.color}20`,
                color: config.color,
                border: `1px solid ${config.color}40`,
              }}
            >
              {item.type}
            </div>
            
            {/* Rarity Indicator Dot */}
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: config.color,
                boxShadow: `0 0 6px ${config.glow}`,
              }}
            />
          </div>
        </div>

        {/* Subtle Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </motion.div>
  );
}
