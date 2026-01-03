import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minimize2, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

export interface ClaimRequest {
  id: string;
  requestId: string; // Номер заявки для отображения
  itemName: string;
  itemImage: string;
  itemRarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  itemType: 'skin' | 'physical' | 'money';
  caseName: string;
  status: 'pending' | 'approved' | 'denied';
  tradeLink?: string;
  comment?: string; // Комментарий игрока
  adminComment?: string; // 🔥 Причина отклонения от админа
  createdAt: Date;
  timeRemaining: number; // в секундах
}

interface RequestNotificationsProps {
  requests: ClaimRequest[];
  onClose: (id: string) => void;
  onUpdateTime: (id: string, timeRemaining: number) => void;
  requestTimeoutMinutes?: number; // 🔥 НОВОЕ: настраиваемое время ответа
}

export function RequestNotifications({ 
  requests, 
  onClose, 
  onUpdateTime,
  requestTimeoutMinutes = 5 // 🔥 По умолчанию 5 минут
}: RequestNotificationsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleRequests, setVisibleRequests] = useState<ClaimRequest[]>([]);
  const [showAllRequests, setShowAllRequests] = useState(false); // 🔥 НОВОЕ: показать все заявки

  // Показываем только первые 3 + остальные (или все если showAllRequests = true)
  useEffect(() => {
    console.log(`📋 [RequestNotifications] Received ${requests.length} requests:`, requests);
    if (showAllRequests) {
      setVisibleRequests(requests);
    } else {
      setVisibleRequests(requests.slice(0, 3));
    }
  }, [requests, showAllRequests]);
  
  // 🔥 Сбрасываем showAllRequests когда открывается drawer
  useEffect(() => {
    if (expandedId) {
      setShowAllRequests(false);
    }
  }, [expandedId]);

  const hiddenCount = showAllRequests ? 0 : requests.length - visibleRequests.length;

  return (
    <>
      {/* Floating Circles - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3">
        <AnimatePresence>
          {visibleRequests.map((request, index) => {
            const isExpanded = expandedId === request.id;
            
            return (
              <div key={request.id}>
                {!isExpanded && (
                  <FloatingCircle
                    request={request}
                    onClick={() => {
                      console.log(`🖱️ [FloatingCircle] Clicked on request:`, request);
                      console.log(`🖱️ [FloatingCircle] Setting expandedId to:`, request.id);
                      setExpandedId(request.id);
                    }}
                    onClose={onClose}
                    onUpdateTime={onUpdateTime}
                    index={index}
                    requestTimeoutMinutes={requestTimeoutMinutes}
                  />
                )}
              </div>
            );
          })}
        </AnimatePresence>

        {/* +X More Badge */}
        {hiddenCount > 0 && !expandedId && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAllRequests(true)}
            className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all"
            style={{
              background: 'linear-gradient(135deg, #7c2d3a 0%, #5a1f2a 100%)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 24px rgba(124, 45, 58, 0.4)',
            }}
          >
            <span className="text-white font-bold text-sm">+{hiddenCount}</span>
          </motion.div>
        )}
        
        {/* Collapse Badge - показывается когда раскрыты все заявки */}
        {showAllRequests && requests.length > 3 && !expandedId && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAllRequests(false)}
            className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all"
            style={{
              background: 'linear-gradient(135deg, #5a1f2a 0%, #7c2d3a 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 24px rgba(124, 45, 58, 0.5)',
            }}
          >
            <span className="text-white font-bold text-xs">Collapse</span>
          </motion.div>
        )}
      </div>

      {/* Expanded Drawer Panel */}
      <AnimatePresence>
        {expandedId && requests.find(r => r.id === expandedId) && (() => {
          const foundRequest = requests.find(r => r.id === expandedId)!;
          console.log(`📂 [RequestDrawer] Opening drawer for expandedId:`, expandedId);
          console.log(`📂 [RequestDrawer] Found request:`, foundRequest);
          console.log(`📂 [RequestDrawer] All requests:`, requests);
          return (
          <RequestDrawer
            key={expandedId} // 🔥 ВАЖНО: key для перерендера при изменении request
            request={foundRequest}
            onClose={(requestId: string) => {
              // 🔥 ИСПРАВЛЕНО: сначала сворачиваем, потом удаляем
              setExpandedId(null);
              setTimeout(() => {
                onClose(requestId);
              }, 100); // Небольшая задержка чтобы анимация свертывания прошла
            }}
            onMinimize={() => setExpandedId(null)}
            onUpdateTime={onUpdateTime}
            requestTimeoutMinutes={requestTimeoutMinutes}
          />
          );
        })()}
      </AnimatePresence>
    </>
  );
}

// ============================
// FLOATING CIRCLE COMPONENT
// ============================

interface FloatingCircleProps {
  request: ClaimRequest;
  onClick: () => void;
  onClose: (id: string) => void;
  onUpdateTime: (id: string, timeRemaining: number) => void;
  index: number;
  requestTimeoutMinutes: number;
}

function FloatingCircle({ request, onClick, onClose, onUpdateTime, index, requestTimeoutMinutes }: FloatingCircleProps) {
  const [timeRemaining, setTimeRemaining] = useState(request.timeRemaining);

  // 🔥 СИНХРОНИЗАЦИЯ: обновляем timeRemaining когда request меняется
  useEffect(() => {
    setTimeRemaining(request.timeRemaining);
    console.log(`🔄 [FloatingCircle] Request updated:`, request);
  }, [request]);

  // Countdown timer
  useEffect(() => {
    if (request.status !== 'pending') return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);
        onUpdateTime(request.id, newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [request.status, request.id, onUpdateTime]);

  const getStatusColor = () => {
    switch (request.status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'denied': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const statusColor = getStatusColor();
  const progress = request.status === 'pending' ? (timeRemaining / (requestTimeoutMinutes * 60)) * 100 : 100;
  const canClose = request.status !== 'pending';
  
  console.log(`🔍 [FloatingCircle] Request ${request.id}: status=${request.status}, canClose=${canClose}`);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0, y: 20 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 25,
        delay: index * 0.05 
      }}
      className="relative group"
    >
      {/* Close Button (только для approved/denied) */}
      {canClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(request.id);
          }}
          className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
          }}
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}

      {/* Main Circle - НОВЫЙ ДИЗАЙН */}
      <div
        onClick={onClick}
        className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden"
        style={{
          background: `radial-gradient(circle, ${statusColor}40 0%, ${statusColor}20 50%, transparent 100%)`,
          border: `2px solid ${statusColor}`,
          boxShadow: `0 8px 24px ${statusColor}66`,
        }}
      >
        {/* Убираем Progress Ring - больше не нужен */}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {request.status === 'pending' ? (
            <>
              <span className="text-white font-bold text-xs mb-0.5">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </span>
              <Clock className="w-4 h-4 text-white/70" />
            </>
          ) : request.status === 'approved' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: statusColor }} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <XCircle className="w-8 h-8" style={{ color: statusColor }} />
            </motion.div>
          )}
        </div>

        {/* Pulsing Effect for Pending */}
        {request.status === 'pending' && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${statusColor}40 0%, transparent 70%)`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Item Preview on Hover */}
      <AnimatePresence>
        {!canClose && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute right-24 top-0 w-48 p-3 rounded-lg pointer-events-none"
            style={{
              background: '#1a1f26',
              border: `1px solid ${statusColor}40`,
              boxShadow: `0 8px 24px ${statusColor}33`,
            }}
          >
            <img src={request.itemImage} alt={request.itemName} className="w-full h-24 object-contain mb-2" />
            <p className="text-white text-xs font-bold truncate">{request.itemName}</p>
            <p className="text-gray-400 text-[10px] truncate">{request.caseName}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================
// REQUEST DRAWER COMPONENT
// ============================

interface RequestDrawerProps {
  request: ClaimRequest;
  onClose: (requestId: string) => void; // 🔥 Изменили сигнатуру
  onMinimize: () => void;
  onUpdateTime: (id: string, timeRemaining: number) => void;
  requestTimeoutMinutes: number;
}

function RequestDrawer({ request, onClose, onMinimize, onUpdateTime, requestTimeoutMinutes }: RequestDrawerProps) {
  const [timeRemaining, setTimeRemaining] = useState(request.timeRemaining);

  // 🔥 СИНХРОНИЗАЦИЯ: обновляем timeRemaining когда request меняется
  useEffect(() => {
    setTimeRemaining(request.timeRemaining);
    console.log(`🔄 [RequestDrawer] Request updated:`, request);
  }, [request]);

  // Countdown timer
  useEffect(() => {
    if (request.status !== 'pending') return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);
        onUpdateTime(request.id, newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [request.status, request.id, onUpdateTime]);

  const getStatusColor = () => {
    switch (request.status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'denied': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const statusColor = getStatusColor();
  const progress = request.status === 'pending' ? (timeRemaining / (requestTimeoutMinutes * 60)) * 100 : 100;
  const canClose = request.status !== 'pending';
  
  console.log(`🔍 [RequestDrawer] Request ${request.id}: status=${request.status}, canClose=${canClose}`);

  const rarityColors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b',
    mythic: '#ef4444',
  };

  // 🔥 НОВОЕ: Форматирование времени в часах и минутах
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-6 bottom-6 w-[420px] rounded-2xl overflow-hidden shadow-2xl z-50"
      style={{
        background: '#1a1f26',
        border: `2px solid ${statusColor}60`,
        boxShadow: `0 20px 60px ${statusColor}40`,
      }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between border-b"
        style={{
          background: `linear-gradient(135deg, ${statusColor}20 0%, transparent 100%)`,
          borderColor: `${statusColor}30`,
        }}
      >
        <div className="flex items-center gap-2">
          {request.status === 'pending' ? (
            <Clock className="w-5 h-5" style={{ color: statusColor }} />
          ) : request.status === 'approved' ? (
            <CheckCircle className="w-5 h-5" style={{ color: statusColor }} />
          ) : (
            <XCircle className="w-5 h-5" style={{ color: statusColor }} />
          )}
          <h3 className="font-bold text-white uppercase tracking-wide text-sm">
            {request.status === 'pending' && 'Request Pending'}
            {request.status === 'approved' && 'Request Approved'}
            {request.status === 'denied' && 'Request Denied'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMinimize}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-gray-400" />
          </button>
          {canClose && (
            <button
              onClick={() => onClose(request.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content - НОВЫЙ ДИЗАЙН БЕЗ СКРОЛЛА */}
      <div className="p-6 space-y-4">
        {/* Item Card - Квадратная фотка + Название справа */}
        <div className="flex items-center gap-4">
          {/* Квадратная фотка слева */}
          <div
            className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${rarityColors[request.itemRarity]}20 0%, transparent 100%)`,
              border: `1px solid ${rarityColors[request.itemRarity]}40`,
            }}
          >
            <img
              src={request.itemImage}
              alt={request.itemName}
              className="w-full h-full object-contain p-2"
              style={{
                filter: `drop-shadow(0 0 10px ${rarityColors[request.itemRarity]}66)`,
              }}
            />
          </div>
          
          {/* Название и детали справа */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white mb-1 truncate">{request.itemName}</h2>
            <p className="text-gray-400 text-xs mb-2 truncate">From: {request.caseName}</p>
            
            {/* Rarity Badge */}
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase"
              style={{
                background: `${rarityColors[request.itemRarity]}30`,
                color: rarityColors[request.itemRarity],
                border: `1px solid ${rarityColors[request.itemRarity]}60`,
              }}
            >
              {request.itemRarity}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: `${statusColor}30` }} />

        {/* Details Grid */}
        <div className="space-y-3">
          {/* Request ID */}
          <div>
            <span className="text-gray-400 text-xs block mb-1">Request ID:</span>
            <div className="px-3 py-2 rounded-lg bg-white/5 text-white font-mono text-sm border border-white/10">
              {request.requestId}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs">Status:</span>
              <div
                className="px-3 py-1.5 rounded-lg font-bold uppercase text-xs text-center"
                style={{
                  background: `${statusColor}20`,
                  color: statusColor,
                  border: `1px solid ${statusColor}40`,
                }}
              >
                {request.status}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 text-xs">Type:</span>
              <div className="px-3 py-1.5 rounded-lg bg-white/5 text-white capitalize text-xs text-center border border-white/10">
                {request.itemType}
              </div>
            </div>
          </div>
        </div>

        {/* Time Remaining (for pending) */}
        {request.status === 'pending' && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Time Remaining:</span>
              <span className="text-white font-mono font-bold text-sm">
                {formatTimeRemaining(timeRemaining)}
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: `${statusColor}20` }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: statusColor }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* 🔥 User Info Block - Trade Link or Comment */}
        {(request.tradeLink || request.comment) && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            {request.tradeLink && (
              <div>
                <span className="text-gray-400 text-xs block mb-1">Trade Link:</span>
                <a
                  href={request.tradeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-xs hover:underline break-all"
                >
                  {request.tradeLink}
                </a>
              </div>
            )}
            {request.comment && (
              <div>
                <span className="text-gray-400 text-xs block mb-1">Your Comment:</span>
                <p className="text-white text-xs">{request.comment}</p>
              </div>
            )}
          </div>
        )}

        {/* Status Message */}
        <div
          className="p-4 rounded-xl text-sm"
          style={{
            background: `${statusColor}10`,
            border: `1px solid ${statusColor}30`,
          }}
        >
          {request.status === 'pending' && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: statusColor }} />
              <div>
                <p className="font-bold text-white mb-1">Waiting for Admin Approval</p>
                <p className="text-gray-400 text-xs">
                  Your request is being reviewed. Please wait while an administrator processes your claim.
                </p>
              </div>
            </div>
          )}

          {request.status === 'approved' && (
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: statusColor }} />
              <div>
                <p className="font-bold text-white mb-1">Request Approved!</p>
                {request.itemType === 'skin' ? (
                  <>
                    <p className="text-gray-400 text-xs mb-2">
                      Your item has been sent to your trade link. Expect delivery within 1-24 hours.
                    </p>
                    {request.tradeLink && (
                      <a
                        href={request.tradeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs hover:underline"
                        style={{ color: statusColor }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Trade Offer
                      </a>
                    )}
                  </>
                ) : request.itemType === 'physical' ? (
                  <p className="text-gray-400 text-xs">
                    Your item will be shipped to your registered address. Check your phone for SMS confirmation.
                  </p>
                ) : (
                  <p className="text-gray-400 text-xs">
                    Funds have been added to your balance.
                  </p>
                )}
              </div>
            </div>
          )}

          {request.status === 'denied' && (
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: statusColor }} />
              <div className="flex-1">
                <p className="font-bold text-white mb-1">Request Denied</p>
                
                {/* 🔥 Причина отклонения от админа */}
                {request.adminComment && (
                  <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-gray-400 mb-1">Reason:</p>
                    <p className="text-sm text-white">{request.adminComment}</p>
                  </div>
                )}
                
                <p className="text-gray-400 text-xs">
                  {!request.adminComment && 'Your request has been denied. '}
                  The item has been returned to your inventory.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Close Button (for approved/denied) */}
        {canClose && (
          <button
            onClick={() => onClose(request.id)}
            className="w-full py-3 rounded-lg font-bold text-white hover:opacity-80 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%)`,
            }}
          >
            Close Notification
          </button>
        )}
      </div>
    </motion.div>
  );
}