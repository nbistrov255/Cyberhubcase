import { motion } from 'motion/react';
import { Wrench, Clock } from 'lucide-react';

interface MaintenanceScreenProps {
  isActive?: boolean;
  message?: string;
}

export function MaintenanceScreen({ isActive = true, message }: MaintenanceScreenProps) {
  if (!isActive) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden"
    >
      {/* Blurred Background - изменен на backdrop-blur-sm */}
      <div 
        className="absolute inset-0 backdrop-blur-sm bg-black/70"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(124, 45, 58, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(154, 59, 74, 0.1) 0%, transparent 50%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center relative z-10"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #7c2d3a 0%, #9a3b4a 100%)' }}
          >
            <Wrench className="w-16 h-16 text-white" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute"
              style={{ top: '10px', right: '10px' }}
            >
              <Clock className="w-8 h-8 text-white/60" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-white mb-4 uppercase tracking-wider"
        >
          {message || 'Сайт временно недоступен'}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-400 mb-8"
        >
          {message ? 'Проверяем соединение...' : 'Мы проводим технические работы, скоро вернемся'}
        </motion.p>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-6 mb-8 backdrop-blur-sm"
          style={{
            background: 'rgba(29, 29, 34, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p className="text-gray-300 leading-relaxed">
            {message 
              ? 'Сервер временно недоступен. Пытаемся восстановить соединение...'
              : 'В данный момент проводятся плановые технические работы для улучшения вашего опыта. Мы скоро вернемся онлайн. Спасибо за терпение!'
            }
          </p>
        </motion.div>

        {/* Animated dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 rounded-full"
              style={{ background: '#7c2d3a' }}
            />
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-sm text-gray-500"
        >
          Если вы считаете, что это ошибка, пожалуйста, свяжитесь с поддержкой
        </motion.p>
      </motion.div>
    </div>
  );
}
