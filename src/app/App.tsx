import ClientApp from './ClientApp';
import AdminApp from './admin/AdminApp';

// Реэкспорт типов из ClientApp
export type { LiveFeedItem, InventoryItem } from './ClientApp';

export default function App() {
  // Простой роутинг без React Router
  const isAdminPath = window.location.pathname.startsWith('/admin');
  
  return isAdminPath ? <AdminApp /> : <ClientApp />;
}