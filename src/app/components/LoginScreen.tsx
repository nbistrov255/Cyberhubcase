import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, AlertCircle, Loader2, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen() {
  const { login, error: authError, isLoading } = useAuth(); // Убрали isAuthenticating
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!username || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    const success = await login(username, password);
    
    if (!success && !authError) {
      setLocalError('Login failed. Please try again.');
    }
  };

  const displayError = localError || authError;

  // ClientApp сам показывает LoadingScreen когда isAuthenticating === true

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image - Full Screen */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://i.ibb.co/p6hjRTH9/Gemini-Generated-Image-g3whk1g3whk1g3wh.jpg)',
        }}
      >
        {/* Dark Overlay - БЕЗ BLUR */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Gradient Overlay - Right Side Darker */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to left, rgba(0, 0, 0, 0.85) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Logo - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-12 left-12 z-20"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #7c2d3a 0%, #5a1f2a 100%)',
              boxShadow: '0 4px 20px rgba(124, 45, 58, 0.4)',
            }}
          >
            <span className="text-2xl font-bold text-white">CH</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-[Aldrich] tracking-wide">
              CYBERHUB
            </h1>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Case Opening Platform
            </p>
          </div>
        </div>
      </motion.div>

      {/* Login Form - Right Side */}
      <div className="absolute right-0 top-0 h-full flex items-center justify-center px-24 z-10">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-[450px]"
        >
          {/* Form Container */}
          <div
            className="relative rounded-2xl p-10"
            style={{
              background: 'rgba(23, 23, 28, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Decorative Corner Accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#7c2d3a] rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#7c2d3a] rounded-br-2xl" />

            {/* Header */}
            <div className="text-center mb-8">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-white font-[Aldrich] uppercase tracking-wider mb-2"
              >
                Welcome Back
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 text-sm"
              >
                Login to access your cases
              </motion.p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-400">{displayError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c2d3a] focus:ring-2 focus:ring-[#7c2d3a]/20 transition-all"
                    placeholder="Enter your username"
                    autoFocus
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c2d3a] focus:ring-2 focus:ring-[#7c2d3a]/20 transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </motion.div>

              {/* Login Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-lg font-bold uppercase tracking-wider text-white transition-all duration-300 relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #7c2d3a 0%, #5a1f2a 100%)',
                    boxShadow: '0 4px 20px rgba(124, 45, 58, 0.4)',
                  }}
                >
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  
                  {/* Button Content */}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <span>Login</span>
                    )}
                  </span>
                </button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 text-center"
            >
              <p className="text-xs text-gray-500">
                Powered by CyberHub • Secure Login
              </p>
            </motion.div>
          </div>

          {/* Additional Info Below Form - с иконкой Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6"
          >
            <div 
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{
                background: 'rgba(23, 23, 28, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex-shrink-0">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #7c2d3a 0%, #5a1f2a 100%)',
                  }}
                >
                  <Info className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Use your{' '}
                <span className="text-gray-300 font-medium">
                  club shell account
                </span>
                {' '}credentials to login
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-0 left-0 right-0 z-20"
      >
        <div 
          className="px-12 py-6 flex items-center justify-between"
          style={{
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
          }}
        >
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-400">Server Online</span>
            </div>
            <div className="text-sm text-gray-400">
              Version 1.0.0
            </div>
          </div>
          <div className="text-sm text-gray-400">
            © 2025 CyberHub. All rights reserved.
          </div>
        </div>
      </motion.div>
    </div>
  );
}