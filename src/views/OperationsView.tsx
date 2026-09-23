import React, { useState } from 'react';
import { User, Transaction } from '../types/database';
import { db } from '../services/storage';
import {
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Coins,
  Users,
  Unlock,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';

interface OperationsViewProps {
  user: User;
}

export const OperationsView: React.FC<OperationsViewProps> = ({ user }) => {
  const [filter, setFilter] = useState<string>('all');
  const transactions = db.getTransactions(user.id);

  const filtered = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'investment') return tx.type === 'investment';
    if (filter === 'return') return tx.type === 'return';
    if (filter === 'deposit_withdraw') return tx.type === 'deposit' || tx.type === 'withdrawal';
    if (filter === 'referral') return tx.type === 'referral_bonus' || tx.type === 'level_unlock';
    return true;
  });

  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'return':
        return <Coins className="w-4 h-4 text-emerald-400" />;
      case 'referral_bonus':
        return <Users className="w-4 h-4 text-amber-400" />;
      case 'level_unlock':
        return <Unlock className="w-4 h-4 text-purple-400" />;
      default:
        return <ArrowRightLeft className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeName = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'إيداع';
      case 'withdrawal':
        return 'سحب';
      case 'investment':
        return 'استثمار';
      case 'return':
        return 'عائد أرباح';
      case 'referral_bonus':
        return 'إحالة';
      case 'level_unlock':
        return 'فتح مستوى';
      default:
        return 'عملية';
    }
  };

  return (
    <div className="space-y-6 text-right max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0e1628] to-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            السجل المالي
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">سجل العمليات</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          كشف حساب زمني شفاف بكافة التحركات المالية من استثمارات، عوائد يومية، إيداعات، وسحوبات.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'investment', label: 'الاستثمارات' },
          { id: 'return', label: 'العوائد' },
          { id: 'deposit_withdraw', label: 'الإيداع والسحب' },
          { id: 'referral', label: 'الإحالات والمستويات' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filter === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Operations List */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6">
        {filtered.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لا توجد عمليات مسجلة تحت هذا التصنيف.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx) => {
              const isPositive =
                tx.type === 'deposit' || tx.type === 'return' || tx.type === 'referral_bonus';
              const isNegative = tx.type === 'withdrawal' || tx.type === 'investment';

              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {getIcon(tx.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{tx.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {getTypeName(tx.type)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{tx.description}</p>
                      <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                        {new Date(tx.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    {Number(tx.amount) > 0 && (
                      <span
                        dir="ltr"
                        className={`text-base font-black font-mono tabular-nums ${
                          isPositive
                            ? 'text-emerald-400'
                            : isNegative
                            ? 'text-white'
                            : 'text-slate-300'
                        }`}
                      >
                        {isPositive ? '+' : isNegative ? '-' : ''}${(Number(tx.amount) || 0).toFixed(2)}
                      </span>
                    )}

                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] font-medium text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{tx.status === 'completed' ? 'ناجحة ومكتملة' : 'قيد المعالجة'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
