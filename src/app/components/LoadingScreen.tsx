import { motion } from 'motion/react';
import { useState } from 'react';

// Particles configuration
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  angle: number;
  distance: number;
}

export function LoadingScreen() {
  const [particles] = useState<Particle[]>(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      angle: (360 / 20) * i,
      distance: Math.random() * 80 + 100,
    }))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17171c] overflow-hidden">
      {/* 🔥 ТОЛЬКО ИСКРЫ - никаких фоновых эффектов */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: '#7c2d3a',
            boxShadow: '0 0 10px rgba(124, 45, 58, 0.8)',
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [
              0,
              Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
              0,
            ],
            y: [
              0,
              Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
              0,
            ],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with Spinning Ring */}
        <div className="relative">
          {/* Spinning Ring Container */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Continuously Spinning Ring */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="spinningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c2d3a" />
                  <stop offset="50%" stopColor="#ff4d6d" />
                  <stop offset="100%" stopColor="#7c2d3a" />
                </linearGradient>
                
                {/* Glow filter */}
                <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="url(#spinningGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * 0.5}
                style={{
                  filter: 'url(#glowFilter)',
                }}
                animate={{ 
                  rotate: 360,
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </svg>

            {/* Logo in Center - УМЕНЬШЕН + ПУЛЬСАЦИЯ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.05, 1], // 🔥 Слабая пульсация
              }}
              transition={{ 
                opacity: { duration: 0.5 },
                scale: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              }}
              className="relative z-10"
            >
              <img 
                src="https://i.ibb.co/23s1kJd7/Cyber-Hub-Logo-06.png" 
                alt="CyberHub"
                className="relative w-24 h-24 object-contain"
              />
            </motion.div>
          </div>
        </div>

        {/* Loading Text with Animated Dots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex items-center gap-2"
        >
          <span className="text-gray-400 uppercase tracking-[0.3em] font-[Aldrich]">
            Loading
          </span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="text-gray-400"
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              >
                .
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
