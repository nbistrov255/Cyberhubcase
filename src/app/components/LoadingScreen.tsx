import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const LOADING_TEXTS = [
  "Loading your Karambit | Doppler...",
  "Unpacking rare skins...",
  "Filling cases with prizes...",
  "Calculating your lucky streak...",
  "Polishing StatTrak™ counters...",
  "Preparing your inventory...",
  "Shuffling case contents...",
  "Loading epic drops...",
  "Connecting to drop servers...",
  "Warming up RNG system...",
  "Checking for Dragon Lore...",
  "Initializing case animations...",
  "Loading your profile stats...",
  "Preparing legendary items...",
  "Syncing your balance..."
];

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [currentText, setCurrentText] = useState(LOADING_TEXTS[0]);
  const [textIndex, setTextIndex] = useState(0);

  console.log('🎮 [LoadingScreen] Mounted, progress:', progress);

  // Progress animation - запускаем сразу
  useEffect(() => {
    console.log('🎮 [LoadingScreen] Starting progress animation');
    
    // Запускаем анимацию сразу
    setTimeout(() => {
      setProgress(100);
    }, 100);

    return () => {
      console.log('🎮 [LoadingScreen] Cleaning up');
    };
  }, []);

  // Update display progress
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + 2, 100);
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // Change text every 800ms
  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => {
        const next = (prev + 1) % LOADING_TEXTS.length;
        setCurrentText(LOADING_TEXTS[next]);
        return next;
      });
    }, 800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17171c]">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124, 45, 58, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Animated Corner Lines */}
      <div className="absolute top-0 left-0 w-64 h-64 border-t-2 border-l-2 border-[#7c2d3a]/30" />
      <div className="absolute bottom-0 right-0 w-64 h-64 border-b-2 border-r-2 border-[#7c2d3a]/30" />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#7c2d3a]/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-8 max-w-2xl w-full">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7c2d3a 0%, #5a1f2a 100%)',
                boxShadow: '0 8px 32px rgba(124, 45, 58, 0.6)',
              }}
            >
              <span className="text-4xl font-bold text-white">CH</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white font-[Aldrich] tracking-wider uppercase">
            CYBERHUB
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-[0.3em] mt-2">
            Case Opening Platform
          </p>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          key={textIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <p className="text-gray-400 text-lg font-medium">
            {currentText}
          </p>
        </motion.div>

        {/* Progress Bar Container */}
        <div className="relative">
          {/* Progress Percentage */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Loading</span>
            <span className="text-sm text-white font-bold font-mono">{Math.round(displayProgress)}%</span>
          </div>

          {/* Background Bar */}
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Progress Fill */}
            <div
              className="h-full rounded-full relative overflow-hidden transition-all duration-[2500ms] ease-linear"
              style={{
                background: 'linear-gradient(90deg, #7c2d3a 0%, #9a3a4a 50%, #7c2d3a 100%)',
                width: `${displayProgress}%`,
                boxShadow: '0 0 20px rgba(124, 45, 58, 0.8)',
              }}
            >
              {/* Animated Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <p className="text-gray-600 text-xs uppercase tracking-wider">
            Please wait while we prepare everything for you
          </p>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Connecting to server...</span>
          </div>
          <div>
            v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}