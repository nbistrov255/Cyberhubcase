import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function CasesPage({ onCaseClick }: any) {
  const { profile } = useAuth();
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.cases) {
      setCases(profile.cases);
    }
  }, [profile]);

  const renderCaseCard = (caseData: any) => {
    // Кейс закрыт, если прогресс меньше цены (threshold)
    const isLocked = (caseData.progress || 0) < (caseData.threshold || 0);
    const isUsed = caseData.is_claimed;

    return (
      <motion.button
        key={caseData.id}
        onClick={() => !isUsed && !isLocked && onCaseClick(caseData)}
        whileHover={!isUsed && !isLocked ? { scale: 1.03 } : {}}
        className={`relative w-[225px] h-[308px] rounded-lg overflow-hidden border transition-all ${
          isUsed ? 'border-gray-800 opacity-50' : 'border-white/5 hover:border-yellow-500/50'
        }`}
      >
        <img src={caseData.image || 'https://i.ibb.co/bRChPPVb/boxcard.png'} className="w-full h-full object-cover" alt="" />
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Lock className="w-12 h-12 text-white/40" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white">
          {caseData.progress || 0} / {caseData.threshold || 0}€
        </div>
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black text-left">
          <div className="text-white font-bold truncate">{caseData.title}</div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="space-y-16 py-10 px-6 max-w-[1400px] mx-auto">
      {/* Блок Daily Cases */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-8 uppercase tracking-widest font-[Aldrich] border-l-4 border-red-600 pl-4">Daily Cases</h2>
        <div className="flex flex-wrap gap-8 justify-start">
          {cases.filter(c => c.type === 'daily').map(renderCaseCard)}
        </div>
      </section>

      {/* Блок Monthly Cases */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-8 uppercase tracking-widest font-[Aldrich] border-l-4 border-blue-600 pl-4">Monthly Cases</h2>
        <div className="flex flex-wrap gap-8 justify-start">
          {cases.filter(c => c.type === 'monthly').map(renderCaseCard)}
        </div>
      </section>
    </div>
  );
}
