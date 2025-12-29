import { useAuth } from '../contexts/AuthContext';
import { User, Wallet, Calendar, Clock } from 'lucide-react';

export function TopBar() {
  const { profile, isAuthenticated } = useAuth();

  if (!isAuthenticated || !profile) return null;

  return (
    <div className="flex items-center gap-6 bg-[#1d1d22] px-6 py-3 rounded-xl border border-white/5 shadow-2xl">
      <div className="flex items-center gap-2 border-r border-white/10 pr-6">
        <User className="w-4 h-4 text-gray-400" />
        <span className="text-white font-medium">{profile.nickname}</span>
      </div>

      {/* Баланс (Берем из profile.balance) */}
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 uppercase font-bold">Total Balance</span>
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#ffa726]" />
          <span className="text-white font-mono font-bold">{(profile.balance || 0).toFixed(2)} €</span>
        </div>
      </div>

      {/* Пополнено сегодня (Берем из profile.dailySum) */}
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 uppercase font-bold">Today Top-up</span>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#4caf50]" />
          <span className="text-white font-mono font-bold">{(profile.dailySum || 0).toFixed(2)} €</span>
        </div>
      </div>

      {/* Пополнено за месяц (Берем из profile.monthlySum) */}
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 uppercase font-bold">Monthly Top-up</span>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#2196f3]" />
          <span className="text-white font-mono font-bold">{(profile.monthlySum || 0).toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
}
