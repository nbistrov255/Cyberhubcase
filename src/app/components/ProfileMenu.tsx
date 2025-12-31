import { motion, AnimatePresence } from 'motion/react';
import { Package, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onInventoryClick: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export function ProfileMenu({ isOpen, onClose, onInventoryClick, anchorRef }: ProfileMenuProps) {
  const { profile, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleInventory = () => {
    onInventoryClick();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - закрывает меню при клике вне */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
          />

          {/* Menu Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-20 right-6 z-[70] w-80"
            style={{
              background: 'rgba(23, 23, 28, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Decorative Corner Accent */}
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#7c2d3a] rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#7c2d3a] rounded-bl-2xl" />

            {/* Profile Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                  <img
                    src={profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  {/* Level Badge */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm flex items-center justify-center h-5">
                    <span className="text-[10px] font-bold text-white/90 tracking-wide">LVL 1</span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {profile?.nickname || 'Player'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-gray-400">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance Overview */}
              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Balance</span>
                  <span className="text-lg font-bold text-[#4ade80]">
                    {(profile?.balance || 0).toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-3">
              {/* My Inventory Button */}
              <button
                onClick={handleInventory}
                className="w-full p-4 rounded-lg flex items-center gap-3 transition-all duration-200 group hover:bg-white/10 mb-2"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(34, 197, 94, 0.25) 100%)',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                  }}
                >
                  <Package className="w-5 h-5 text-[#4ade80]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium group-hover:text-[#4ade80] transition-colors">
                    My Inventory
                  </div>
                  <div className="text-xs text-gray-400">
                    View your items
                  </div>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full p-4 rounded-lg flex items-center gap-3 transition-all duration-200 group hover:bg-red-500/10"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.25) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium group-hover:text-red-400 transition-colors">
                    Exit Application
                  </div>
                  <div className="text-xs text-gray-400">
                    Sign out from account
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <p className="text-xs text-gray-500 text-center">
                CyberHub © 2025 • Version 1.0.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
