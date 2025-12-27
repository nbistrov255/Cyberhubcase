import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, Eye, EyeOff, Loader2, Check, ShieldCheck, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { t } = useLanguage();
  const { login, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error(t('login.fillAllFields') || 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    clearError();
    
    const success = await login(username, password);
    
    setIsLoading(false);

    if (success) {
      toast.success(t('login.loginSuccess') || 'Login successful!');
      setUsername('');
      setPassword('');
      onClose();
    } else {
      toast.error(error || t('login.loginFailed') || 'Login failed');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4 bg-[#1d1d22] rounded-lg border border-[#2a2a30] shadow-2xl overflow-hidden"
        >
          {/* Header with gradient */}
          <div className="relative h-32 bg-gradient-to-br from-[#7c2d3a] via-[#9a3b4a] to-[#7c2d3a] overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
            
            <div className="relative h-full flex flex-col items-center justify-center text-white pt-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-2 border border-white/20"
              >
                <ShieldCheck className="w-7 h-7" />
              </motion.div>
              <h2 className="text-xl uppercase tracking-wider font-bold">{t('login.title')}</h2>
              <p className="text-xs text-white/80 mt-0.5">{t('login.subtitle')}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                {t('login.username')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('login.usernamePlaceholder')}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-[#17171c] border border-[#2a2a30] rounded-lg text-white placeholder-gray-600 focus:border-[#7c2d3a] focus:ring-1 focus:ring-[#7c2d3a] transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  disabled={isLoading}
                  className="w-full pl-11 pr-12 py-3 bg-[#17171c] border border-[#2a2a30] rounded-lg text-white placeholder-gray-600 focus:border-[#7c2d3a] focus:ring-1 focus:ring-[#7c2d3a] transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-[#17171c] rounded-lg p-4 border border-[#2a2a30]">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">{t('login.benefits')}</p>
              <ul className="space-y-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <motion.li
                    key={num}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + num * 0.1 }}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <Check className="w-4 h-4 text-[#7c2d3a] mt-0.5 flex-shrink-0" />
                    <span>{t(`login.benefit${num}`)}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#7c2d3a] to-[#9a3b4a] hover:from-[#9a3b4a] hover:to-[#7c2d3a] text-white font-bold uppercase tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('login.signingIn')}
                </>
              ) : (
                t('login.signIn')
              )}
            </button>

            {/* Note */}
            <p className="text-xs text-gray-400 text-center pt-1">
              {t('login.note')}
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}