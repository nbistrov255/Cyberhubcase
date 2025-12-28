import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useAdminLanguage } from '../contexts/AdminLanguageContext';
import { UserRole } from '../AdminApp';
import { CaseFormModal, CaseFormData } from '../components/CaseFormModal';

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

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cases');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }

      const data = await response.json();
      setCases(data.map((caseItem: any) => ({
        ...caseItem,
        lastModified: new Date(caseItem.lastModified || caseItem.updatedAt || Date.now()),
      })));
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = ['owner', 'admin'].includes(userRole);

  const filteredCases = cases.filter((c) =>
    c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.nameLv.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter((c) => filterType === 'all' || c.type === filterType)
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
      // Преобразуем формат из UI в формат API
      const apiPayload = {
        id: formData.id,
        title: formData.nameEn || formData.nameRu || formData.nameLv, // Используем английское название
        type: formData.type,
        threshold_eur: formData.threshold,
        image_url: formData.image,
        items: formData.contents?.map(item => ({
          item_id: item.itemId,
          weight: item.dropChance,
          rarity: item.item.rarity,
        })) || [],
        status: formData.status,
      };

      console.log('Sending case data to API:', apiPayload);

      if (selectedCase) {
        // Обновление существующего кейса
        const response = await fetch(`/api/admin/cases/${selectedCase.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiPayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to update case:', errorData);
          throw new Error(errorData.message || 'Failed to update case');
        }

        const updatedCase = await response.json();
        setCases(cases.map((c) => c.id === selectedCase.id ? { ...updatedCase, lastModified: new Date(updatedCase.lastModified || updatedCase.updatedAt) } : c));
      } else {
        // Создание нового кейса
        const response = await fetch('/api/admin/cases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiPayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to create case:', errorData);
          throw new Error(errorData.message || 'Failed to create case');
        }

        const newCase = await response.json();
        setCases([...cases, { ...newCase, lastModified: new Date(newCase.lastModified || newCase.createdAt) }]);
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving case:', error);
      alert(`Failed to save case: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (caseId: string) => {
    if (!confirm(t('cases.deleteConfirm'))) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/cases/${caseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete case');
      }

      setCases(cases.filter((c) => c.id !== caseId));
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('Failed to delete case. Please try again.');
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
            onClick={() => setIsModalOpen(true)}
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

      {/* Search */}
      <div className="mb-6">
        <div className="max-w-md relative">
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
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'daily' | 'monthly' | 'event')}
              className="w-40 px-4 py-2.5 pr-10 rounded-lg outline-none transition-all appearance-none cursor-pointer"
              style={{
                background: '#1d1d22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
              }}
            >
              <option value="all">{t('cases.filterTypeAll')}</option>
              <option value="daily">{t('cases.filterTypeDaily')}</option>
              <option value="monthly">{t('cases.filterTypeMonthly')}</option>
              <option value="event">{t('cases.filterTypeEvent')}</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'published' | 'archived')}
              className="w-48 px-4 py-2.5 pr-10 rounded-lg outline-none transition-all appearance-none cursor-pointer"
              style={{
                background: '#1d1d22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
              }}
            >
              <option value="all">{t('cases.filterStatusAll')}</option>
              <option value="draft">{t('cases.filterStatusDraft')}</option>
              <option value="published">{t('cases.filterStatusPublished')}</option>
              <option value="archived">{t('cases.filterStatusArchived')}</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
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
                  width: '222px',
                }}
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: '306px' }}>
                  <img
                    src={caseItem.image}
                    alt={getCaseName(caseItem)}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
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
                      {t(`cases.${caseItem.status}` as any)}
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
                      {t(`cases.type${caseItem.type.charAt(0).toUpperCase() + caseItem.type.slice(1)}` as any)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">{getCaseName(caseItem)}</h3>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-400">{t('cases.threshold')}</span>
                    <span className="text-white font-medium">${caseItem.threshold}</span>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    {t('cases.lastModified')}: {caseItem.lastModified.toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  {canEdit && (
                    <div className="flex gap-2">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all"
                        style={{
                          background: '#25252a',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2d2d32';
                          e.currentTarget.style.borderColor = '#7c2d3a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#25252a';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onClick={() => openModal(caseItem)}
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white">{t('cases.edit')}</span>
                      </button>
                      
                      <button
                        className="px-3 py-2 rounded-lg transition-all"
                        style={{
                          background: '#25252a',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2d2d32';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#25252a';
                        }}
                        onClick={() => handleDelete(caseItem.id)}
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">{t('common.noData')}</p>
        </div>
      )}

      {/* Case Form Modal */}
      <CaseFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        caseData={selectedCase}
      />
    </div>
  );
}