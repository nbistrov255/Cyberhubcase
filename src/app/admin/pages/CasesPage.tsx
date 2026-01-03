import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';
import { CaseFormModal, CaseFormData } from '../components/CaseFormModal';
import { toast } from 'sonner';
// ✅ ИСПРАВЛЕНО: Используем админские заголовки
import { getAdminAuthHeaders } from '../utils/adminAuth';
// ✅ ДОБАВЛЕН ИМПОРТ WebSocket ХУКА
import { useWebSocketEvent } from '../../contexts/WebSocketContext';

interface Case {
  id: string;
  nameLv: string;
  nameRu: string;
  nameEn: string;
  type: 'daily' | 'monthly' | 'event';
  threshold: number;
  status: 'draft' | 'published' | 'archived';
  image: string;
  lastModified: Date;
  eventEndsAt?: Date;
  eventDurationDays?: number;
  contents?: any[];
}

interface CasesPageProps {
  userRole: UserRole;
}

export function CasesPage({ userRole }: CasesPageProps) {
  const { t, language } = useAdminLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'monthly' | 'event'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка кейсов при монтировании
  useEffect(() => {
    fetchCases();
  }, []);

  // ✅ ДОБАВЛЕНО: Автообновление при изменении кейсов через WebSocket
  useWebSocketEvent('cases:updated', () => {
    console.log('📦 Received cases:updated event, refreshing cases...');
    fetchCases();
  });

  const fetchCases = async () => {
    try {
      setLoading(true);
      // ✅ ИСПРАВЛЕНО: Используем админские заголовки!
      const response = await fetch('/api/admin/cases', {
        headers: getAdminAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }

      const data = await response.json();
      const items = data.cases || data || [];
      
      if (Array.isArray(items)) {
        setCases(items.map((caseItem: any) => ({
          ...caseItem,
          // Маппинг полей от бэкенда к фронтенду
          id: caseItem.id,
          // ✅ Бэкенд отдает 'title', мы кладем его в nameEn/Ru/Lv
          nameEn: caseItem.title || caseItem.nameEn || 'Untitled Case',
          nameRu: caseItem.title || caseItem.nameRu || 'Untitled Case',
          nameLv: caseItem.title || caseItem.nameLv || 'Untitled Case',
          
          // Цена/Порог входа
          threshold: caseItem.threshold ?? caseItem.threshold_eur ?? 0,
          
          // Картинка
          image: caseItem.image || caseItem.image_url || '',
          
          // Тип кейса
          type: caseItem.type || 'daily',
          
          // Статус
          status: caseItem.status || (caseItem.is_active ? 'published' : 'draft'),
          
          contents: caseItem.contents || [],
          lastModified: new Date(caseItem.lastModified || caseItem.updatedAt || Date.now()),
        })));
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = ['owner', 'admin'].includes(userRole);

  const filteredCases = cases.filter((c) => {
    const nameEn = c.nameEn || '';
    const nameRu = c.nameRu || '';
    const nameLv = c.nameLv || '';
    const query = searchQuery.toLowerCase();
    
    return nameEn.toLowerCase().includes(query) ||
           nameRu.toLowerCase().includes(query) ||
           nameLv.toLowerCase().includes(query);
  }).filter((c) => filterType === 'all' || c.type === filterType)
  .filter((c) => filterStatus === 'all' || c.status === filterStatus);

  const getCaseName = (caseItem: Case) => {
    if (language === 'lv') return caseItem.nameLv;
    if (language === 'ru') return caseItem.nameRu;
    return caseItem.nameEn;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return { bg: '#10b98120', color: '#10b981' };
      case 'draft':
        return { bg: '#f59e0b20', color: '#f59e0b' };
      case 'archived':
        return { bg: '#6b728020', color: '#6b7280' };
      default:
        return { bg: '#6b728020', color: '#6b7280' };
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const openModal = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCase(null);
    setIsModalOpen(false);
  };

  const handleSave = async (formData: CaseFormData) => {
    try {
      // ИСПРАВЛЕНИЕ 1: Явно используем id из selectedCase или formData
      const caseId = selectedCase?.id || formData.id;
      
      const apiPayload = {
        id: caseId, // Гарантируем наличие ID для обновлений
        title: formData.nameEn || formData.nameRu || formData.nameLv,
        nameEn: formData.nameEn,
        nameRu: formData.nameRu,
        nameLv: formData.nameLv,
        type: formData.type,
        threshold: formData.threshold, // Отправляем как threshold (бэк поймет)
        image: formData.image,         // Отправляем как image (бэк поймет)
        contents: formData.contents,
        status: formData.status,       // Отправляем статус (бэк переведет в is_active)
      };

      console.log('Sending case data:', apiPayload);

      let response;
      if (selectedCase && caseId) {
        // ✅ Используем PUT метод для обновления существующего кейса
        response = await fetch(`/api/admin/cases/${caseId}`, {
          method: 'PUT',
          headers: getAdminAuthHeaders(),
          body: JSON.stringify(apiPayload),
        });
      } else {
        // Создание нового кейса
        response = await fetch('/api/admin/cases', {
          method: 'POST',
          headers: getAdminAuthHeaders(),
          body: JSON.stringify(apiPayload),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save case');
      }

      await fetchCases(); // Перезагружаем список
      closeModal();
      toast.success(t('cases.saveSuccess'));
    } catch (error) {
      console.error('Error saving case:', error);
      toast.error('Failed to save case');
    }
  };

  const handleDelete = async (caseId: string) => {
    if (!confirm(t('cases.deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/admin/cases/${caseId}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete case');
      }

      // ИСПРАВЛЕНИЕ 2: Правильное удаление одного кейса с приведением типов
      setCases((prev) => prev.filter((c) => String(c.id) !== String(caseId)));
      toast.success(t('cases.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting case:', error);
      toast.error('Failed to delete case');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('cases.title')}</h1>
          <p className="text-gray-400">Manage all cases and their contents</p>
        </div>
        {canEdit && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                setSelectedCase(null);
                setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              background: '#7c2d3a',
              color: '#ffffff',
            }}
          >
            <Plus className="w-5 h-5" />
            {t('cases.addNew')}
          </motion.button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('cases.search')}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg outline-none transition-all"
            style={{
              background: '#1d1d22',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
            }}
          />
        </div>
        
        <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer"
              style={{ background: '#1d1d22', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
            >
              <option value="all">{t('cases.filterTypeAll')}</option>
              <option value="daily">{t('cases.filterTypeDaily')}</option>
              <option value="monthly">{t('cases.filterTypeMonthly')}</option>
              <option value="event">{t('cases.filterTypeEvent')}</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer"
              style={{ background: '#1d1d22', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
            >
              <option value="all">{t('cases.filterStatusAll')}</option>
              <option value="draft">{t('cases.filterStatusDraft')}</option>
              <option value="published">{t('cases.filterStatusPublished')}</option>
              <option value="archived">{t('cases.filterStatusArchived')}</option>
            </select>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence>
          {filteredCases.map((caseItem, index) => {
            const statusColor = getStatusColor(caseItem.status);
            
            return (
              <motion.div
                key={caseItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl overflow-hidden group"
                style={{
                  background: '#1d1d22',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: '220px' }}>
                  <img
                    src={caseItem.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={getCaseName(caseItem)}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Error'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                      style={{
                        background: statusColor.bg,
                        color: statusColor.color,
                      }}
                    >
                      {t(`cases.${caseItem.status}` as any) || caseItem.status}
                    </span>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                      style={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        color: '#ffffff',
                      }}
                    >
                      {caseItem.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 truncate" title={getCaseName(caseItem)}>{getCaseName(caseItem)}</h3>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-400">{t('cases.threshold')}</span>
                    <span className="text-white font-medium">{caseItem.threshold} €</span>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    {t('cases.lastModified')}: {caseItem.lastModified.toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  {canEdit && (
                    <div className="flex gap-2">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all"
                        style={{ background: '#25252a', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                        onClick={() => openModal(caseItem)}
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white ml-2">{t('cases.edit')}</span>
                      </button>
                      
                      <button
                        className="px-3 py-2 rounded-lg transition-all"
                        style={{ background: '#25252a', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                        onClick={() => handleDelete(caseItem.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredCases.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">{t('common.noData')}</p>
        </div>
      )}

      {/* Modal */}
      <CaseFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        caseData={selectedCase}
      />
    </div>
  );
}