import { motion } from 'motion/react';
import { X, Package, Sparkles } from 'lucide-react';
import { InventoryItem } from '../App';

interface WinPageProps {
  item: InventoryItem;
  onClaim: () => void;
  onGoToInventory: () => void;
  onBack: () => void;
  currentLevel?: number;
  nextLevel?: number;
  currentXP?: number;
  requiredXP?: number;
}

const rarityColors = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#eab308',
  mythic: '#ef4444',
};

export function WinPage({ 
  item, 
  onClaim, 
  onGoToInventory, 
  onBack,
  currentLevel = 12,
  nextLevel = 13,
  currentXP = 750,
  requiredXP = 1000,
}: WinPageProps) {
  const xpProgress = (currentXP / requiredXP) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 w-[600px] rounded-3xl border-2 border-white/10 p-8"
        style={{
          backgroundColor: '#1a1b20',
          boxShadow: `0 0 80px ${rarityColors[item.rarity]}40`,
        }}
      >
        {/* Background Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${rarityColors[item.rarity]}40 0%, ${rarityColors[item.rarity]}20 40%, transparent 85%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{
              backgroundColor: rarityColors[item.rarity],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="absolute top-4 right-4 z-20 p-2 rounded-lg border-2 border-white/10 transition-all font-[Aldrich]"
          style={{
            backgroundColor: '#24262d',
          }}
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center pt-2">
          {/* Congratulations Text */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl font-bold font-[Aldrich] mb-1">CONGRATULATIONS!</h1>
            <p className="text-lg text-gray-400 font-[Aldrich]">YOU WON:</p>
          </motion.div>

          {/* Prize Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative mb-6"
          >
            {/* Glow Ring */}
            <motion.div
              className="absolute -inset-4 rounded-2xl"
              style={{
                background: `radial-gradient(circle, ${rarityColors[item.rarity]}40 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />

            {/* Card */}
            <div
              className="relative w-[320px] h-[320px] rounded-xl overflow-hidden border-4"
              style={{
                borderColor: rarityColors[item.rarity],
                boxShadow: `0 0 40px ${rarityColors[item.rarity]}60`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center p-8">
                <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div
                className="absolute inset-0 opacity-20"
                style={{ backgroundColor: rarityColors[item.rarity] }}
              />

              {/* Item Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent px-5 py-3">
                <div
                  className="inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-1.5"
                  style={{
                    backgroundColor: rarityColors[item.rarity] + '30',
                    color: rarityColors[item.rarity],
                    border: `2px solid ${rarityColors[item.rarity]}`,
                  }}
                >
                  {item.rarity.toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">{item.name}</h2>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">{item.type.toUpperCase()}</div>
              </div>
            </div>
          </motion.div>

          {/* Inventory Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-4 w-full px-4"
          >
            <p className="text-sm text-gray-300 font-[Aldrich]">
              Ваш приз находится у вас в инвентаре
            </p>
          </motion.div>

          {/* Inventory Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="w-full px-4 mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGoToInventory}
              className="w-full px-8 py-4 rounded-xl font-bold text-sm tracking-wider relative font-[Aldrich]"
              style={{
                backgroundColor: '#2a2b32',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Notification Badge - New Design */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0, x: 10, y: -10 }}
                animate={{ 
                  scale: [1, 1.08, 1], 
                  opacity: 1, 
                  x: 0, 
                  y: 0,
                }}
                transition={{ 
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2.5,
                  },
                  opacity: {
                    delay: 2.0,
                    duration: 0.5,
                    ease: [0.34, 1.56, 0.64, 1],
                  },
                  x: {
                    delay: 2.0,
                    duration: 0.5,
                    ease: [0.34, 1.56, 0.64, 1],
                  },
                  y: {
                    delay: 2.0,
                    duration: 0.5,
                    ease: [0.34, 1.56, 0.64, 1],
                  },
                }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.6), 0 0 0 3px #1a1b20, 0 0 0 4px rgba(239, 68, 68, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <span className="relative z-10 font-[Aldrich]">
                  1
                </span>
              </motion.div>

              {/* Button content */}
              <div className="flex items-center justify-center gap-2.5">
                <Package className="w-5 h-5" />
                <span>МОЙ ИНВЕНТАРЬ</span>
              </div>
            </motion.button>
          </motion.div>

          {/* XP Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full px-4"
          >
            <div className="flex items-center gap-3">
              {/* Current Level */}
              <div className="flex flex-col items-center gap-1">
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-lg font-bold font-[Aldrich]"
                  style={{
                    backgroundColor: '#d4af37',
                    color: '#1a1b20',
                  }}
                >
                  {currentLevel}
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-[Aldrich]">Current</span>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 relative">
                <div 
                  className="relative h-4 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: '#1a1b20',
                    border: '2px solid rgba(212, 175, 55, 0.3)',
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ delay: 0.5, duration: 2, ease: [0.2, 0.8, 0.1, 1] }}
                    className="h-full relative overflow-hidden"
                    style={{
                      background: '#d4af37',
                      boxShadow: '0 0 20px rgba(212, 175, 55, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {/* Animated shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      style={{
                        width: '100%',
                      }}
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                        ease: 'easeInOut',
                      }}
                    />
                    
                    {/* Pulsing glow overlay */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                      }}
                      animate={{
                        opacity: [0.3, 0.7, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </motion.div>
                </div>
                
                {/* XP Text with icon */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <span 
                    className="text-xs font-bold font-[Aldrich]" 
                    style={{ 
                      color: '#d4af37',
                    }}
                  >
                    {currentXP} / {requiredXP} XP
                  </span>
                </div>
              </div>

              {/* Next Level */}
              <div className="flex flex-col items-center gap-1">
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-lg font-bold font-[Aldrich]"
                  style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    color: '#d4af37',
                    border: '2px solid #d4af37',
                  }}
                >
                  {nextLevel}
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-[Aldrich]">Next</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Flash Effect */}
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-white pointer-events-none rounded-3xl"
        />
      </motion.div>
    </motion.div>
  );
}