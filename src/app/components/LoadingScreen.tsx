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
      distance: Math.random() * 100 + 150,
    }))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17171c] overflow-hidden">
      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124, 45, 58, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial Glow Background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(124, 45, 58, 0.15) 0%, transparent 50%)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Flying Particles */}
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
          {/* Outer Glow Rings */}
          <motion.div
            className="absolute inset-0"
            style={{
              transform: 'translate(-50%, -50%) scale(1.5)',
              left: '50%',
              top: '50%',
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1.4, 1.6, 1.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div 
              className="w-64 h-64 rounded-full"
              style={{
                border: '1px solid rgba(124, 45, 58, 0.3)',
                boxShadow: '0 0 40px rgba(124, 45, 58, 0.4)',
              }}
            />
          </motion.div>

          <motion.div
            className="absolute inset-0"
            style={{
              transform: 'translate(-50%, -50%) scale(1.3)',
              left: '50%',
              top: '50%',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1.2, 1.4, 1.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          >
            <div 
              className="w-64 h-64 rounded-full"
              style={{
                border: '1px solid rgba(124, 45, 58, 0.4)',
                boxShadow: '0 0 30px rgba(124, 45, 58, 0.5)',
              }}
            />
          </motion.div>

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
                strokeDashoffset={2 * Math.PI * 120 * 0.75} // 75% пустоты, 25% линия
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

            {/* Logo in Center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
              }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              {/* Pulsing Glow Behind Logo */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(124, 45, 58, 0.6) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              <img 
                src="https://i.ibb.co/23s1kJd7/Cyber-Hub-Logo-06.png" 
                alt="CyberHub"
                className="relative w-32 h-32 object-contain"
              />
            </motion.div>
          </div>

          {/* Rotating Ring Accent */}
          <motion.div
            className="absolute inset-0"
            style={{
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%',
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div className="w-64 h-64 relative">
              {/* Small accent dots */}
              {[0, 90, 180, 270].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: '#7c2d3a',
                    boxShadow: '0 0 10px rgba(124, 45, 58, 0.8)',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-122px)`,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
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
