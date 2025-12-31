import { useState } from 'react';
import { motion } from 'motion/react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
  isLoggingIn?: boolean;
}

export function LoginPage({ onLogin, isLoggingIn = false }: LoginPageProps) {
  const { t } = useAdminLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError(t('login.error'));
      return;
    }

    onLogin(username, password);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #1a1a1f 0%, #25252a 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#7c2d3a' }}>
            CyberHub
          </h1>
          <p className="text-gray-400 text-lg font-[Aldrich]">
            {t('login.title')}
          </p>
        </div>

        {/* Login Form */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: '#1d1d22',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('login.username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c2d3a';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('login.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  background: '#25252a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c2d3a';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-lg"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: isLoggingIn ? 1 : 1.02 }}
              whileTap={{ scale: isLoggingIn ? 1 : 0.98 }}
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-lg font-bold font-[Aldrich] uppercase transition-all flex items-center justify-center gap-2"
              style={{
                background: isLoggingIn ? '#5a222c' : '#7c2d3a',
                border: '1px solid #9a3b4a',
                color: '#ffffff',
                opacity: isLoggingIn ? 0.7 : 1,
                cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoggingIn && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isLoggingIn ? 'Logging in...' : t('login.button')}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2024 CyberHub Admin Panel
        </p>
      </motion.div>
    </div>
  );
}