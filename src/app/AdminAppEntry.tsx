import AdminApp from './admin/AdminApp';
import { AdminLanguageProvider } from './admin/contexts/AdminLanguageContext';

export default function AdminAppEntry() {
  return (
    <AdminLanguageProvider>
      <AdminApp />
    </AdminLanguageProvider>
  );
}
