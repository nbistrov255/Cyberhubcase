import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  currentLanguage: 'en' | 'ru' | 'lv';
  onSave: (language: 'en' | 'ru' | 'lv') => void;
}

export function SettingsModal({ open, onClose, currentLanguage, onSave }: SettingsModalProps) {
  const { t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleSave = () => {
    onSave(selectedLanguage);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl w-full overflow-hidden rounded-2xl"
            style={{
              background: '#1d1d22',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div 
              className="px-8 py-6 flex items-center justify-between border-b"
              style={{
                background: '#25252a',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <h2 className="text-2xl font-bold uppercase font-[Aldrich] text-white">
                {t('settings.title')}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              {/* Language Selection */}
              <div className="mb-8">
                <label className="block text-lg font-medium text-gray-300 mb-4 font-[Rajdhani] tracking-wide">
                  Language / Valoda / Язык
                </label>
                <div className="space-y-3">
                  {/* English Option */}
                  <button
                    onClick={() => setSelectedLanguage('en')}
                    className="w-full px-6 py-4 rounded-lg flex items-center gap-4 transition-all duration-300"
                    style={{
                      background: selectedLanguage === 'en' ? '#7c2d3a' : '#25252a',
                      border: `1px solid ${selectedLanguage === 'en' ? '#9a3b4a' : 'rgba(255, 255, 255, 0.05)'}`,
                    }}
                  >
                    <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-full h-full">
                        <clipPath id="s">
                          <path d="M0,0 v30 h60 v-30 z"/>
                        </clipPath>
                        <clipPath id="t">
                          <path d="M30,15 h30 v15 z v-30 h-30 z h-30 v15 z v-30 h30 z"/>
                        </clipPath>
                        <g clipPath="url(#s)">
                          <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
                          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                        </g>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-bold font-[Aldrich]">English</div>
                      <div className="text-sm text-gray-400">English language</div>
                    </div>
                    {selectedLanguage === 'en' && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </button>

                  {/* Russian Option */}
                  <button
                    onClick={() => setSelectedLanguage('ru')}
                    className="w-full px-6 py-4 rounded-lg flex items-center gap-4 transition-all duration-300"
                    style={{
                      background: selectedLanguage === 'ru' ? '#7c2d3a' : '#25252a',
                      border: `1px solid ${selectedLanguage === 'ru' ? '#9a3b4a' : 'rgba(255, 255, 255, 0.05)'}`,
                    }}
                  >
                    <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" className="w-full h-full">
                        <rect fill="#fff" width="9" height="3"/>
                        <rect fill="#d52b1e" y="3" width="9" height="3"/>
                        <rect fill="#0039a6" y="2" width="9" height="2"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-bold font-[Aldrich]">Русский</div>
                      <div className="text-sm text-gray-400">Russian language</div>
                    </div>
                    {selectedLanguage === 'ru' && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </button>

                  {/* Latvian Option */}
                  <button
                    onClick={() => setSelectedLanguage('lv')}
                    className="w-full px-6 py-4 rounded-lg flex items-center gap-4 transition-all duration-300"
                    style={{
                      background: selectedLanguage === 'lv' ? '#7c2d3a' : '#25252a',
                      border: `1px solid ${selectedLanguage === 'lv' ? '#9a3b4a' : 'rgba(255, 255, 255, 0.05)'}`,
                    }}
                  >
                    <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" className="w-full h-full">
                        <rect width="1200" height="600" fill="#9e3039"/>
                        <rect y="240" width="1200" height="120" fill="#fff"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-bold font-[Aldrich]">Latviešu</div>
                      <div className="text-sm text-gray-400">Latvian language</div>
                    </div>
                    {selectedLanguage === 'lv' && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg font-bold transition-all duration-300 uppercase font-[Aldrich] hover:bg-white/10"
                  style={{
                    background: '#25252a',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                  }}
                >
                  {t('settings.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-lg font-bold transition-all duration-300 uppercase font-[Aldrich] hover:brightness-110"
                  style={{
                    background: '#7c2d3a',
                    border: '1px solid #9a3b4a',
                    color: '#ffffff',
                  }}
                >
                  {t('settings.save')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}