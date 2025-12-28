import { useState, useEffect } from 'react';
import ClientApp from './ClientApp';
import AdminApp from './admin/AdminApp';
import { MaintenanceScreen } from './components/MaintenanceScreen';

// Реэкспорт типов из ClientApp
export type { LiveFeedItem, InventoryItem } from './ClientApp';

export default function App() {
  const [isServerDown, setIsServerDown] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Простой роутинг без React Router
  const isAdminPath = window.location.pathname.startsWith('/admin');
  
  // Проверка доступности сервера
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут

        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer test-token`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Если сервер ответил (даже с ошибкой авторизации), значит он работает
        if (response.status === 401 || response.ok) {
          setIsServerDown(false);
          setRetryCount(0);
        } else {
          throw new Error('Server error');
        }
      } catch (error: any) {
        console.error('Server health check failed:', error);
        
        // Проверяем, является ли это сетевой ошибкой
        if (error.name === 'TypeError' || error.name === 'AbortError' || error.message === 'Failed to fetch') {
          setIsServerDown(true);
          setRetryCount(prev => prev + 1);
        }
      }
    };

    // Первая проверка при загрузке
    checkServerHealth();

    // Периодическая проверка каждые 10 секунд
    const interval = setInterval(checkServerHealth, 10000);

    // Если сервер недоступен, пытаемся переподключиться чаще
    let retryInterval: NodeJS.Timeout | null = null;
    if (isServerDown) {
      retryInterval = setInterval(checkServerHealth, 3000); // Каждые 3 секунды при проблемах
    }

    return () => {
      clearInterval(interval);
      if (retryInterval) clearInterval(retryInterval);
    };
  }, [isServerDown]);

  // Показываем экран обслуживания, если сервер недоступен
  if (isServerDown) {
    return <MaintenanceScreen isActive={true} message="Connection Lost. Retrying..." />;
  }

  return isAdminPath ? <AdminApp /> : <ClientApp />;
}
