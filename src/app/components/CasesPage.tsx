import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';
import '../../styles/fonts.css';

interface CaseData {
  id: string;
  name: string;
  image: string;
  tier: string;
  deposited: number;
  required: number;
  usedToday: boolean;
  isEvent?: boolean;
  normalizedType?: string; // Добавляем нормализованный тип для надежной фильтрации
}

const tierColors = {
  Common: '#6b7280',
  Rare: '#3b82f6',
  Epic: '#a855f7',
  Legendary: '#eab308',
  Mythic: '#ef4444',
  Premium: '#ec4899',
};

interface CasesPageProps {
  onCaseClick: (caseData: CaseData) => void;
  isAuthenticated: boolean;
}

export function CasesPage({ onCaseClick, isAuthenticated }: CasesPageProps) {
  const { profile } = useAuth();
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerBackground, setBannerBackground] = useState('https://i.ibb.co/nqGS31TR/Chat-GPT-Image-24-2025-04-05-54.png');
  const [stats, setStats] = useState({ casesOpened: 0, uniquePlayers: 0 });

  // Загрузка статистики из API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/public');
        
        if (!response.ok) {
          console.error('Failed to fetch stats');
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          setStats({
            casesOpened: data.stats?.total_spins || data.casesOpened || 0,
            uniquePlayers: data.stats?.unique_users || data.uniquePlayers || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Загрузка настроек баннера из localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('siteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.bannerBackground) {
          setBannerBackground(settings.bannerBackground);
        }
      }
    } catch (error) {
      console.error('Error loading banner settings:', error);
    }
  }, []);

  useEffect(() => {
    // Если пользователь не авторизован, можно загрузить публичные кейсы (если бы API позволяло),
    // но пока используем логику профиля. Если профиля нет, кейсы могут быть пустыми или дефолтными.
    if (!profile || !profile.cases) {
      console.log('⚠️ No profile or no cases in profile');
      setLoading(false);
      return;
    }

    // 📦 ОТЛАДКА: Показываем сырые данные с сервера
    console.log('📦 Raw Cases from Profile:', profile.cases);

    // УЛУЧШЕННЫЙ МАППИНГ: Нормализация типа для защиты от опечаток
    const mappedCases: CaseData[] = (profile.cases || []).map((apiCase: any) => {
      // Нормализация типа: lowercase + trim для защиты от пробелов и регистра
      const normalizedType = (apiCase.type || '').toLowerCase().trim();
      
      // Определяем tier на основе нормализованного типа (используем contains для гибкости)
      let tier: string;
      if (normalizedType.includes('daily')) {
        tier = 'Common';
      } else if (normalizedType.includes('monthly')) {
        tier = 'Premium';
      } else if (normalizedType.includes('event')) {
        tier = 'Legendary';
      } else {
        // Fallback для неизвестных типов - показываем как Common, но логируем
        console.warn(`⚠️ Unknown case type: "${apiCase.type}" (normalized: "${normalizedType}") for case ID: ${apiCase.id}`);
        tier = 'Common';
      }

      return {
        id: apiCase.id,
        // Формируем имя с ценой используя поле threshold
        name: apiCase.title 
          ? `${apiCase.title} (${apiCase.threshold}€)` 
          : (normalizedType.includes('daily')
              ? `Daily Case (${apiCase.threshold}€)` 
              : normalizedType.includes('monthly')
                ? `Monthly Case (${apiCase.threshold}€)`
                : `Event Case (${apiCase.threshold}€)`),
        
        // Используем поле image напрямую
        image: apiCase.image || 'https://i.ibb.co/bRChPPVb/boxcard.png',
        tier: tier,
        
        // Статистика депозитов - используем правильные поля
        deposited: apiCase.progress || 0,        // progress - депозит пользователя
        required: apiCase.threshold || 0,        // threshold - требуемая сумма
        
        // Доступность
        usedToday: apiCase.is_claimed || !apiCase.available,
        
        // УЛУЧШЕННАЯ ПРОВЕРКА: isEvent только если тип содержит 'event'
        isEvent: normalizedType.includes('event'),
        normalizedType: normalizedType, // Сохраняем нормализованный тип
      };
    });

    // 🏷️ ОТЛАДКА: Показываем обработанные данные
    console.log('🏷️ Mapped Cases:', mappedCases);
    console.log(`📊 Total cases mapped: ${mappedCases.length}`);
    
    setCases(mappedCases);
    setLoading(false);
  }, [profile, isAuthenticated]);

  // Разделение кейсов
  const eventCases = cases.filter(c => c.isEvent);
  
  // Daily Cases: содержит 'daily' и НЕ event
  const dailyCases = cases.filter(c => {
    const type = (c.normalizedType || '').toLowerCase();
    return type.includes('daily') && !c.isEvent;
  });
  
  // Monthly Cases: содержит 'monthly' и НЕ event
  const monthlyCases = cases.filter(c => {
    const type = (c.normalizedType || '').toLowerCase();
    return type.includes('monthly') && !c.isEvent;
  });
  
  // 🔍 DEBUG: Проверка на "осиротевшие" кейсы
  const orphanedCases = cases.filter(c => {
    const isInEvent = eventCases.includes(c);
    const isInDaily = dailyCases.includes(c);
    const isInMonthly = monthlyCases.includes(c);
    return !isInEvent && !isInDaily && !isInMonthly;
  });
  
  // Логирование в консоль
  useEffect(() => {
    if (cases.length > 0) {
      console.log(`🔍 Categories Breakdown:`);
      console.log(`   📅 Event Cases: ${eventCases.length}`);
      console.log(`   📆 Daily Cases: ${dailyCases.length}`);
      console.log(`   📊 Monthly Cases: ${monthlyCases.length}`);
      console.log(`   ❓ Orphaned Cases: ${orphanedCases.length}`);
      
      if (orphanedCases.length > 0) {
        console.warn(`⚠️ WARNING: ${orphanedCases.length} cases are not categorized!`);
        console.warn(`Orphaned cases:`, orphanedCases);
      }
    }
  }, [cases, eventCases, dailyCases, monthlyCases, orphanedCases]);
  
  const [showTermsRules, setShowTermsRules] = useState(false);
  
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calculate time until end of month
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const difference = endOfMonth.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCaseClick = (caseData: CaseData) => {
    if (isAuthenticated) {
      if (caseData.usedToday) return;
      
      // Проверка баланса перед открытием
      // (В реальном открытии проверит бэкенд, тут для UI блокировки)
      if (caseData.deposited < caseData.required) return;
    }
    
    onCaseClick(caseData);
  };

  const renderCaseCard = (caseData: CaseData) => {
    const isHovered = hoveredCase === caseData.id;
    // Для гостей всегда показываем deposited = 0
    const displayedDeposited = isAuthenticated ? caseData.deposited : 0;
    // Для гостей usedToday не имеет значения
    const effectiveUsedToday = isAuthenticated && caseData.usedToday;
    const isReady = displayedDeposited >= caseData.required && !effectiveUsedToday;
    const isLocked = displayedDeposited < caseData.required && !effectiveUsedToday;

    return (
      <motion.button
        key={caseData.id}
        onMouseEnter={() => setHoveredCase(caseData.id)}
        onMouseLeave={() => setHoveredCase(null)}
        onClick={() => handleCaseClick(caseData)}
        whileTap={{ scale: 0.97 }}
        className="relative overflow-hidden transition-all duration-150"
        style={{ 
          width: '225px',
          height: '308px',
          flexShrink: 0,
          borderRadius: '6px',
          border: isHovered
            ? '1px solid #eab30850'
            : `1px solid ${caseData.usedToday ? '#374151' : 'rgba(255, 255, 255, 0.05)'}`,
          boxShadow: isHovered
            ? '0 6px 24px rgba(0, 0, 0, 0.5), 0 2px 12px rgba(234, 179, 8, 0.2)'
            : '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Case Image - Full Height */}
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 h-full">
          {/* Darkening overlay for locked cards */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/50 z-10" />
          )}
          
          <img
            src={caseData.image}
            alt={caseData.name}
            className="w-full h-full object-cover"
            style={{
              filter: isLocked ? 'grayscale(0.4) brightness(0.6)' : 'none',
            }}
            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/225x308?text=Case'; }}
          />

          {/* Lock Icon for Insufficient Deposit */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center z-15">
              <Lock className="w-16 h-16 text-white/60" strokeWidth={1.5} />
            </div>
          )}

          {/* Deposit Progress Badge - Top Right - Всегда показываем */}
          {!caseData.usedToday && (
            <div className="absolute top-3 right-3 z-20">
              {/* Deposit Badge with Progress Ring Inside */}
              <div
                className="px-2 py-1.5 font-bold text-xs text-white font-mono flex items-center gap-2"
                style={{
                  background: 'rgba(23, 23, 28, 0.85)',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* Mini Progress Ring */}
                <div className="relative" style={{ width: '18px', height: '18px' }}>
                  <svg className="absolute inset-0 transform -rotate-90" width="18" height="18">
                    <circle
                      cx="9"
                      cy="9"
                      r="7"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle
                      cx="9"
                      cy="9"
                      r="7"
                      stroke="url(#miniOrangeGradient)"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 7}`}
                      strokeDashoffset={Math.max(0, 2 * Math.PI * 7 * (1 - displayedDeposited / (caseData.required || 1)))}
                    />
                    <defs>
                      <linearGradient id="miniOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ffcb77', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#ffa726', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                {/* Deposit Text */}
                <span>{displayedDeposited} / {caseData.required}€</span>
              </div>
            </div>
          )}
          
          {/* Used Badge - только для авторизованных */}
          {isAuthenticated && caseData.usedToday && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
              <div className="flex flex-col items-center gap-3">
                {/* Top Text */}
                <span className="text-white uppercase tracking-wide text-sm font-bold">
                  {caseData.isEvent ? 'USED THIS MONTH' : 'USED TODAY'}
                </span>
                
                {/* Lock Image */}
                <img 
                  src="https://i.ibb.co/1J747Tg4/free-icon-padlock-3758099.png" 
                  alt="Locked" 
                  className="w-16 h-16"
                  style={{
                    filter: 'brightness(0) invert(1) drop-shadow(0 4px 12px rgba(255, 255, 255, 0.6))'
                  }}
                />
                
                {/* Deposit Badge - показываем сколько внесено */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" fill="none" />
                    <circle
                      cx="9"
                      cy="9"
                      r="7"
                      stroke="url(#usedMiniGradient)"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 7}`}
                      strokeDashoffset={Math.max(0, 2 * Math.PI * 7 * (1 - displayedDeposited / (caseData.required || 1)))}
                    />
                    <defs>
                      <linearGradient id="usedMiniGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ffcb77', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#ffa726', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-sm font-bold text-white">{displayedDeposited} / {caseData.required}€</span>
                </div>
                
                {/* Bottom Text */}
                <span className="text-gray-300 text-xs">
                  {caseData.isEvent ? 'Available next month' : 'Available tomorrow'}
                </span>
              </div>
            </div>
          )}

          {/* Circular Progress - Show ONLY on hover for locked cases */}
          {isLocked && isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <div className="flex flex-col items-center gap-4">
                {/* Top Text - Deposit Required Title */}
                <motion.div 
                  className="text-xs text-gray-300 font-[Aldrich] uppercase tracking-wider"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Deposit Required
                </motion.div>
                
                {/* Circular Progress Ring */}
                <div className="relative" style={{ width: '120px', height: '120px' }}>
                  {/* Background Circle */}
                  <svg className="absolute inset-0 transform -rotate-90" width="120" height="120" style={{ overflow: 'visible' }}>
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress Circle with Animation */}
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#orangeGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      initial={{
                        strokeDashoffset: 2 * Math.PI * 50
                      }}
                      animate={{
                        strokeDashoffset: 2 * Math.PI * 50 * (1 - displayedDeposited / (caseData.required || 1))
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut"
                      }}
                    />
                    {/* Gradient Definition */}
                    <defs>
                      <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ffcb77', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#ffa726', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center Text - Amount */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center flex flex-col items-center justify-center gap-0.5">
                      {/* Top Amount - Deposited */}
                      <motion.div 
                        className="text-3xl font-bold text-white font-mono tracking-tight"
                        style={{ textShadow: '0 2px 12px rgba(255, 255, 255, 0.3)' }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        {displayedDeposited}
                      </motion.div>
                      
                      {/* Divider Line */}
                      <motion.div 
                        className="w-14 h-[2px] my-0"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255, 203, 119, 0.6), transparent)',
                        }}
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      />
                      
                      {/* Bottom Amount - Required */}
                      <motion.div 
                        className="flex items-baseline gap-0.5 justify-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <span 
                          className="text-xs font-medium text-gray-500"
                          style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)' }}
                        >
                          €
                        </span>
                        <span 
                          className="text-lg font-semibold text-gray-400 font-mono"
                          style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
                        >
                          {caseData.required}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Text - Amount needed */}
                <motion.div 
                  className="text-center px-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="text-lg font-bold text-[#ffcb77] font-mono" style={{ textShadow: '0 0 12px rgba(255, 203, 119, 0.6)' }}>
                    €{(caseData.required - displayedDeposited).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    to unlock this case
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Ready to Open Overlay - Show on hover for unlocked cases */}
          {isReady && isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(52, 211, 153, 0.2) 50%, transparent 100%)',
                backdropFilter: 'blur(2px)',
              }}
            >
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.15))',
                  boxShadow: 'inset 0 0 80px rgba(16, 185, 129, 0.3), inset 0 0 40px rgba(52, 211, 153, 0.2)',
                }}
              />
              <div className="flex flex-col items-center gap-2.5 relative z-10">
                <motion.div
                  animate={{ 
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.6))'
                  }}
                >
                  <ImageWithFallback 
                    src="https://i.ibb.co/zHjqv4z0/free-icon-padlock-unlock-25215.png"
                    alt="Unlocked"
                    className="w-12 h-12 object-contain"
                    style={{
                      filter: 'brightness(0) invert(1)'
                    }}
                  />
                </motion.div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white font-[Aldrich] uppercase tracking-wider mb-0.5" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}>
                    CLICK TO OPEN
                  </div>
                  <div className="text-xs text-white/90 font-[Aldrich]">
                    Case is ready!
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-[#17171c]">
      {/* EVENT SECTION - Centered Container */}
      <div className="px-6 py-12">
        <div className="max-w-[1600px] mx-auto">
          {/* Test Header */}
          <div className="mb-6 px-6">
            <h2 className="text-2xl font-bold uppercase">
              <span style={{ color: '#ffffff', fontFamily: 'Aldrich, sans-serif' }}>EVENT CASES</span>
              <span style={{ color: '#ffcb77', fontFamily: 'Aldrich, sans-serif' }}> - {timeLeft.days} DAYS {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
            </h2>
          </div>

          <div className="relative rounded-lg overflow-hidden shadow-2xl">
            {/* Event Background - Contained */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1400&h=600&fit=crop)',
                filter: 'brightness(0.5)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-pink-900/40 to-purple-900/40" />
            
            {/* Animated Snowflakes - Contained */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(25)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-white text-lg opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${-20 + Math.random() * 120}%`,
                  }}
                  animate={{
                    y: [0, 600],
                    x: [0, Math.random() * 60 - 30],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8 + Math.random() * 8,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                  }}
                >
                  ❄
                </motion.div>
              ))}
            </div>

            {/* Event Content - Contained */}
            <div 
              className="relative z-10 px-20 py-10"
              style={{
                backgroundImage: `url(${bannerBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Event Header */}
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <h2 className="text-5xl font-bold mb-2 text-white drop-shadow-lg">
                      CHRISTMAS DROPS
                    </h2>
                    <p className="text-lg text-gray-200 drop-shadow-md">
                      Exclusive holiday cases with legendary prizes
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Event Cases */}
              <div className="flex justify-center gap-4 flex-wrap">
                {eventCases.length > 0 ? eventCases.map((caseData) => renderCaseCard(caseData)) : (
                    <div className="text-gray-400 italic">No event cases available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PERMANENT CASES SECTION */}
      <div className="px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* DAILY CASES SECTION */}
          {dailyCases.length > 0 && (
            <div className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h2 className="text-4xl font-bold mb-2 font-[Aldrich]">DAILY CASES</h2>
                <p className="text-gray-400">Available every day with consistent rewards</p>
              </motion.div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {dailyCases.map((caseData) => renderCaseCard(caseData))}
                </div>
              </div>
            </div>
          )}

          {/* MONTHLY CASES SECTION */}
          {monthlyCases.length > 0 && (
            <div className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h2 className="text-4xl font-bold mb-2 font-[Aldrich]">MONTHLY CASES</h2>
                <p className="text-gray-400">Premium cases available all month long</p>
              </motion.div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {monthlyCases.map((caseData) => renderCaseCard(caseData))}
                </div>
              </div>
            </div>
          )}

          {/* No Cases Message */}
          {dailyCases.length === 0 && monthlyCases.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-500">No permanent cases available</div>
          )}
        </div>
      </div>

      {/* FOOTER SECTION - KeyDrop Style */}
      <div className="mt-32 px-12 pb-20">
        <div className="max-w-[1600px] mx-auto">
          {/* DEBUG SECTION: Orphaned Cases Warning (only if there are orphaned cases) */}
          {orphanedCases.length > 0 && (
            <div 
              className="mb-12 p-6 rounded-lg border"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-3xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-400 mb-2">
                    Debug Warning: {orphanedCases.length} Uncategorized Case{orphanedCases.length > 1 ? 's' : ''} Detected
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">
                    The following cases have unknown types and couldn't be categorized into Event, Daily, or Monthly sections:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {orphanedCases.map((c) => (
                      <div 
                        key={c.id} 
                        className="px-3 py-1.5 rounded text-xs font-mono"
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#fca5a5',
                        }}
                      >
                        ID: {c.id} | Tier: {c.tier} | Name: {c.name}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    💡 Tip: Check the console (F12) for detailed debugging information about case types.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Container - Centered */}
          <div className="relative">
            {/* Main Container - Flat Clean Panel */}
            <div 
              className="relative px-12 py-12"
              style={{
                background: '#1d1d22',
                borderRadius: '48px',
              }}
            >
              {/* Content Grid */}
              <div className="relative z-10 flex items-center justify-between">
                {/* Left Section: Stats + Divider + Socials */}
                <div className="flex items-center gap-8">
                  {/* Stats Grid - Left Aligned */}
                  <div className="flex flex-col gap-6 pl-4">
                    {/* Cases Opened */}
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: '#d4af37',
                        }}
                      >
                        <img 
                          src="https://i.ibb.co/Gv0XvbQc/free-icon-keys-4230132.png" 
                          alt="Keys"
                          className="w-6 h-6"
                          style={{
                            filter: 'brightness(0) saturate(100%)'
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white font-mono">{stats.casesOpened.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Cases Opened</div>
                      </div>
                    </div>

                    {/* Players */}
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: '#d4af37',
                        }}
                      >
                        <img 
                          src="https://i.ibb.co/fGBRstJM/free-icon-multiple-users-silhouette-33308.png" 
                          alt="Users"
                          className="w-6 h-6"
                          style={{
                            filter: 'brightness(0) saturate(100%)'
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white font-mono">{stats.uniquePlayers.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Unique Players</div>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div 
                    className="w-px h-32"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)'
                    }}
                  />

                  {/* Social Media Icons */}
                  <div className="flex flex-col gap-4 pr-8">
                    {/* Instagram */}
                    <a 
                      href="#" 
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{
                          background: '#25252a',
                        }}
                      >
                        <svg className="w-5 h-5 transition-colors duration-300 group-hover:text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849.149 3.225-1.664 4.771-4.919 4.919 1.266.058 1.645.07 4.849.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <span className="text-sm uppercase tracking-wide font-[Aldrich]">Instagram</span>
                    </a>

                    {/* TikTok */}
                    <a 
                      href="#" 
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{
                          background: '#25252a',
                        }}
                      >
                        <svg className="w-5 h-5 transition-colors duration-300 group-hover:text-[#00f2ea]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </div>
                      <span className="text-sm uppercase tracking-wide font-[Aldrich]">TikTok</span>
                    </a>

                    {/* Discord */}
                    <a 
                      href="#" 
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{
                          background: '#25252a',
                        }}
                      >
                        <svg className="w-5 h-5 transition-colors duration-300 group-hover:text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                      <span className="text-sm uppercase tracking-wide font-[Aldrich]">Discord</span>
                    </a>
                  </div>

                  {/* Legal Buttons */}
                  <div className="flex flex-col gap-3 pl-8 pr-4">
                    {/* Privacy Policy */}
                    <button 
                      onClick={() => setShowPrivacyPolicy(true)}
                      className="px-6 py-3 text-sm uppercase tracking-wide font-[Aldrich] text-gray-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      Privacy Policy
                    </button>

                    {/* Terms & Rules */}
                    <button 
                      onClick={() => setShowTermsRules(true)}
                      className="px-6 py-3 text-sm uppercase tracking-wide font-[Aldrich] text-gray-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      Terms & Rules
                    </button>
                  </div>
                </div>

                {/* Character - Right Side, Sitting on Container */}
                <div className="absolute -bottom-12 right-6">
                  <img 
                    src="https://i.ibb.co/9kL0pxvj/5.png" 
                    alt="CS2 Character"
                    className="h-[400px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setShowPrivacyPolicy(false)}
          >
             <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[80vh] overflow-hidden rounded-2xl"
              style={{
                background: '#1d1d22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Header */}
              <div 
                className="sticky top-0 z-10 px-8 py-6 flex items-center justify-between border-b"
                style={{
                  background: '#25252a',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <h2 className="text-2xl font-bold uppercase font-[Aldrich] text-white">
                  Privacy Policy
                </h2>
                <button
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-6 overflow-y-auto max-h-[calc(80vh-88px)] scrollbar-hide">
                 <div className="text-center text-gray-400">Policy Content Loaded</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms & Rules Modal */}
      <AnimatePresence>
        {showTermsRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setShowTermsRules(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[80vh] overflow-hidden rounded-2xl"
              style={{
                background: '#1d1d22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div 
                className="sticky top-0 z-10 px-8 py-6 flex items-center justify-between border-b"
                style={{
                  background: '#25252a',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <h2 className="text-2xl font-bold uppercase font-[Aldrich] text-white">
                  Terms & Rules
                </h2>
                <button
                  onClick={() => setShowTermsRules(false)}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
               <div className="px-8 py-6 overflow-y-auto max-h-[calc(80vh-88px)] scrollbar-hide">
                 <div className="text-center text-gray-400">Rules Content Loaded</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}