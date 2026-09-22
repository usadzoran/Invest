import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowLeft, Calendar, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import { InvestmentPlan, InvestmentLevel } from '../types/database';
import { db } from '../services/storage';

interface InvestmentModalProps {
  isOpen: boolean;
  level: InvestmentLevel;
  plans: InvestmentPlan[];
  userBalance: number;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  level,
  plans,
  userBalance,
  userId,
  onClose,
  onSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [stage, setStage] = useState<'select' | 'confirm'>('select');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate return rate for custom amount
  // Level 1: 20% daily return
  // Level 2: 25% daily return
  const returnRate = level.level_number === 1 ? 0.20 : 0.25;

  const currentAmount = isCustom
    ? parseFloat(customAmount) || 0
    : selectedPlan
    ? selectedPlan.amount
    : 0;

  const expectedDailyReturn = isCustom
    ? Math.round(currentAmount * returnRate * 100) / 100
    : selectedPlan
    ? selectedPlan.daily_return
    : 0;

  const handleProceedToConfirm = () => {
    setError(null);
    if (!isCustom && !selectedPlan) {
      setError('يرجى اختيار خطة استثمار أو إدخال مبلغ مخصص');
      return;
    }

    if (isCustom) {
      const amt = parseFloat(customAmount);
      if (isNaN(amt) || amt <= 0) {
        setError('يرجى إدخال مبلغ استثمار صحيح');
        return;
      }
      if (amt < level.min_investment) {
        setError(`الحد الأدنى للاستثمار في هذا المستوى هو $${level.min_investment}`);
        return;
      }
      if (amt > level.max_investment) {
        setError(`الحد الأقصى للاستثمار في هذا المستوى هو $${level.max_investment}`);
        return;
      }
    }

    if (currentAmount > userBalance) {
      setError(`رصيدك المتاح ($${userBalance.toFixed(2)}) لا يكفي لتغطية هذا المبلغ ($${currentAmount})`);
      return;
    }

    setStage('confirm');
  };

  const handleConfirmInvestment = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await db.createInvestment({
        userId,
        levelId: level.level_number,
        amount: currentAmount,
        expectedDailyReturn,
        planId: selectedPlan?.id,
      });

      if (!res.success) {
        setError(res.error || 'فشل تنفيذ الاستثمار');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'حدث خطأ أثناء تنفيذ الاستثمار');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const nextCycle = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 rounded-3xl bg-[#0d1422] border border-emerald-500/30 shadow-2xl p-6 sm:p-7 text-right overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {stage === 'select' ? (
          <div>
            {/* Header */}
            <div className="mb-5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                خطط {level.name}
              </span>
              <h3 className="text-xl font-bold text-white mt-1">اختر باقة الاستثمار اليومية</h3>
              <p className="text-xs text-slate-400 mt-1">
                رصيدك المتاح حالياً:{' '}
                <span className="font-mono text-emerald-400 font-bold tabular-nums">
                  ${userBalance.toFixed(2)}
                </span>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {plans.map((p) => {
                const isSelected = !isCustom && selectedPlan?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setIsCustom(false);
                      setSelectedPlan(p);
                    }}
                    className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 left-2 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-xs text-slate-400">المبلغ</span>
                    <div className="text-xl font-extrabold text-white font-mono tabular-nums mt-0.5">
                      ${p.amount}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">العائد:</span>
                      <span className="font-mono font-bold text-amber-400 tabular-nums">
                        +${p.daily_return}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Option */}
            <div
              onClick={() => {
                setIsCustom(true);
                setSelectedPlan(null);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer mb-5 ${
                isCustom
                  ? 'bg-emerald-950/60 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  استثمار مبلغ مخصص
                </span>
                <span className="text-[11px] text-slate-400">
                  من ${level.min_investment} إلى ${level.max_investment}
                </span>
              </div>

              <div className="relative mt-2">
                <input
                  type="number"
                  min={level.min_investment}
                  max={level.max_investment}
                  placeholder={`أدخل المبلغ ($${level.min_investment} - $${level.max_investment})`}
                  value={customAmount}
                  onFocus={() => {
                    setIsCustom(true);
                    setSelectedPlan(null);
                  }}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-mono">$</span>
              </div>

              {isCustom && parseFloat(customAmount) > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">العائد اليومي المتوقع (+{(returnRate * 100).toFixed(0)}%):</span>
                  <span className="font-mono font-bold text-amber-400 text-sm tabular-nums">
                    +${expectedDailyReturn.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Proceed Button */}
            <button
              type="button"
              onClick={handleProceedToConfirm}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-l from-amber-400 via-emerald-400 to-emerald-300 hover:from-amber-300 hover:to-emerald-200 transition-all shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>متابعة إلى شاشة التأكيد</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Confirmation Screen as required */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setStage('select')}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
              <h3 className="text-lg font-bold text-white">تأكيد عملية الاستثمار</h3>
            </div>

            <p className="text-xs text-slate-400 mb-5">
              يرجى مراجعة تفاصيل الخطة الاستثمارية قبل الاعتماد النهائي:
            </p>

            <div className="space-y-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 p-4 mb-5">
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                <span className="text-slate-400">مبلغ الاستثمار:</span>
                <span className="font-mono font-bold text-white text-sm tabular-nums">
                  ${currentAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                <span className="text-slate-400">العائد المتوقع:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                  +${expectedDailyReturn.toFixed(2)} / يومياً
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                <span className="text-slate-400">المستوى:</span>
                <span className="font-bold text-amber-300">{level.name}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                <span className="text-slate-400">تاريخ بداية الاستثمار:</span>
                <span className="text-slate-300 font-mono text-[11px]">{formatDate(now)}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-400">تاريخ الدورة القادمة:</span>
                <span className="text-slate-300 font-mono text-[11px]">{formatDate(nextCycle)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStage('select')}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                تعديل المبلغ
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmInvestment}
                className="flex-[2] py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-l from-amber-400 via-emerald-400 to-emerald-300 hover:from-amber-300 hover:to-emerald-200 transition-all shadow-lg shadow-emerald-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{loading ? 'جاري التأكيد...' : 'تأكيد الاستثمار'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
