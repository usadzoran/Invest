import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, Zap } from 'lucide-react';
import { db, CYCLE_DURATION_MS } from '../../services/storage';

interface CountdownTimerProps {
  userId: string;
  onCycleCompleted?: (returnedAmount: number) => void;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  userId,
  onCycleCompleted,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    totalSeconds: number;
    percent: number;
  }>({
    hours: '23',
    minutes: '59',
    seconds: '59',
    totalSeconds: 86400,
    percent: 100,
  });

  const [cycleCompletedBanner, setCycleCompletedBanner] = useState<number | null>(null);

  useEffect(() => {
    const cycle = db.getUserDailyCycle(userId);

    const updateTimer = () => {
      const now = Date.now();
      const difference = cycle.ends_at - now;

      if (difference <= 0) {
        // Cycle reached 00:00:00! Process cycle return
        const result = db.processCycleCompletion(userId);
        setCycleCompletedBanner(result.returnedAmount);
        if (onCycleCompleted) {
          onCycleCompleted(result.returnedAmount);
        }
        setTimeout(() => setCycleCompletedBanner(null), 6000);
        return;
      }

      const totalSeconds = Math.max(0, Math.floor(difference / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const elapsed = CYCLE_DURATION_MS - difference;
      const percent = Math.min(100, Math.max(0, (elapsed / CYCLE_DURATION_MS) * 100));

      setTimeLeft({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        totalSeconds,
        percent,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [userId, onCycleCompleted]);

  // Handler for quick test simulation: instantly completes cycle
  const handleFastForward = () => {
    const result = db.processCycleCompletion(userId);
    setCycleCompletedBanner(result.returnedAmount);
    if (onCycleCompleted) {
      onCycleCompleted(result.returnedAmount);
    }
    setTimeout(() => setCycleCompletedBanner(null), 5000);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
        <Clock className="w-4 h-4 animate-pulse text-emerald-400" />
        <span className="font-mono text-xs font-semibold tabular-nums tracking-wider" dir="ltr">
          {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
        </span>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#0d1624] to-slate-900 border border-emerald-500/20 p-4 md:p-5 shadow-lg overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {cycleCompletedBanner !== null && (
        <div className="mb-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              اكتملت الدورة اليومية! تمت إضافة أرباح استثمارك (${cycleCompletedBanner}) إلى رصيدك.
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">عداد الدورة اليومية</h4>
            <p className="text-[11px] text-slate-400">
              يتم احتساب العائد وإضافته لحسابك فور انتهاء الوقت
            </p>
          </div>
        </div>

        {/* Demo accelerator button for easy testing */}
        <button
          onClick={handleFastForward}
          title="اختبار إكمال الدورة فوراً وإضافة العائد"
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>إكمال تجريبي</span>
        </button>
      </div>

      {/* Digits display */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 my-1" dir="ltr">
        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 h-12 sm:h-14 rounded-xl bg-slate-950/80 border border-slate-700/60 flex items-center justify-center shadow-inner">
            <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
              {timeLeft.hours}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
            ساعة
          </span>
        </div>

        <span className="text-emerald-500/60 font-bold text-xl pb-5">:</span>

        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 h-12 sm:h-14 rounded-xl bg-slate-950/80 border border-slate-700/60 flex items-center justify-center shadow-inner">
            <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
              {timeLeft.minutes}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
            دقيقة
          </span>
        </div>

        <span className="text-emerald-500/60 font-bold text-xl pb-5">:</span>

        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 h-12 sm:h-14 rounded-xl bg-slate-950/80 border border-slate-700/60 flex items-center justify-center shadow-inner">
            <span className="font-mono text-xl sm:text-2xl font-bold text-amber-400 tabular-nums animate-pulse">
              {timeLeft.seconds}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
            ثانية
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span>تقدم الدورة الحالية</span>
          <span className="font-mono tabular-nums text-slate-300">
            {Math.round(timeLeft.percent)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${timeLeft.percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
