import React, { useState } from 'react';
import { User, Profile, CryptoWallet } from '../types/database';
import { db } from '../services/storage';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Coins,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface WalletViewProps {
  user: User;
  profile: Profile;
  onRefreshData: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ user, profile, onRefreshData }) => {
  const wallets = db.getWallets(user.id);

  // Selected wallet for modal
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(wallets[0] || null);

  // Deposit state
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [depositSuccess, setDepositSuccess] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleExecuteDeposit = async () => {
    if (!selectedWallet) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    await db.depositToWallet(user.id, selectedWallet.currency, amt);
    setDepositSuccess(true);
    onRefreshData();
    setTimeout(() => {
      setDepositSuccess(false);
      setActiveModal(null);
    }, 1800);
  };

  const handleExecuteWithdrawal = async () => {
    setWithdrawError(null);
    if (!selectedWallet) return;
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('يرجى إدخال مبلغ سحب صحيح');
      return;
    }
    if (!withdrawAddress.trim()) {
      setWithdrawError('يرجى إدخال عنوان المحفظة المستلمة');
      return;
    }

    const res = await db.withdrawFromWallet(user.id, selectedWallet.currency, amt, withdrawAddress.trim());
    if (!res.success) {
      setWithdrawError(res.error || 'فشل تنفيذ عملية السحب');
      return;
    }

    setWithdrawSuccess(true);
    onRefreshData();
    setTimeout(() => {
      setWithdrawSuccess(false);
      setActiveModal(null);
      setWithdrawAmount('');
      setWithdrawAddress('');
    }, 1800);
  };

  return (
    <div className="space-y-6 text-right max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0e1728] to-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            المحفظة الرقمية
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">إدارة الأرصدة والمحافظ</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              إيداع وسحب سريع عبر العملات الرقمية المستقرة (USDT) والعملات المشفرة مع عناوين دفع فورية.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-left sm:text-right">
            <span className="text-[11px] text-slate-400">إجمالي القيمة المقدرة:</span>
            <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
              ${profile.total_balance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Wallets Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {wallets.map((w) => {
          const usdValue = w.balance * w.usd_rate;
          return (
            <div
              key={w.id}
              className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-[#0c121d] border border-slate-800 p-5 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-white">
                      {w.currency === 'USDT' ? '₮' : w.currency === 'BTC' ? '₿' : 'Ξ'}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{w.currency}</h4>
                      <span className="text-[10px] text-slate-400">{w.network}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    1 {w.currency} = ${w.usd_rate.toLocaleString()}
                  </span>
                </div>

                {/* Balances */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">الرصيد المتاح:</span>
                  <div className="text-xl font-black text-white font-mono tabular-nums mt-0.5">
                    {w.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
                    <span className="text-xs text-slate-400">{w.currency}</span>
                  </div>
                  <div className="text-xs text-emerald-400 font-mono font-medium mt-1 tabular-nums">
                    ≈ ${usdValue.toFixed(2)} USD
                  </div>
                </div>

                {/* Wallet Address Preview */}
                <div className="mt-3">
                  <span className="text-[10px] text-slate-400">عنوان المحفظة:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono text-slate-300 truncate bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 flex-1">
                      {w.address}
                    </span>
                    <button
                      onClick={() => handleCopyAddress(w.address)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="نسخ العنوان"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setSelectedWallet(w);
                    setActiveModal('deposit');
                  }}
                  className="py-2 px-3 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>إيداع</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedWallet(w);
                    setActiveModal('withdraw');
                  }}
                  className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>سحب</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extensibility & Gateway Note */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white block mb-0.5">جاهزية الربط مع بوابات الدفع (Webhooks & API)</span>
          النظام مصمم بنظام فصل المحافظ (Crypto Wallets Architecture) ليتيح ربط مزودي الدفع المباشر مثل Binance Pay و NowPayments و Stripe Crypto مستقبلاً دون الحاجة لتغيير هيكل الحسابات.
        </div>
      </div>

      {/* Deposit Modal */}
      {activeModal === 'deposit' && selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0d1422] border border-emerald-500/30 p-6 shadow-2xl text-right">
            <h3 className="text-lg font-bold text-white mb-1">
              إيداع {selectedWallet.currency} ({selectedWallet.network})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              أرسل العملة إلى العنوان المخصص لحسابك أو قم بتأكيد الإيداع التجريبي
            </p>

            {depositSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">تم تأكيد الإيداع بنجاح!</h4>
                <p className="text-xs text-slate-300">تمت إضافة الرصيد إلى محفظتك وحسابك فوراً.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* QR Code Mock */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-950 mx-auto w-44 h-44 shadow-md">
                  <QrCode className="w-32 h-32" />
                  <span className="text-[10px] font-mono font-bold mt-1">SCAN TO DEPOSIT</span>
                </div>

                {/* Address Box */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">عنوان الدفع المباشر:</label>
                  <div className="flex items-center gap-2">
                    <span
                      dir="ltr"
                      className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 break-all select-all text-left"
                    >
                      {selectedWallet.address}
                    </span>
                    <button
                      onClick={() => handleCopyAddress(selectedWallet.address)}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedAddress ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Demo Deposit Simulator */}
                <div className="pt-3 border-t border-slate-800">
                  <label className="block text-[11px] text-slate-300 mb-1">
                    محاكاة شحن رصيد تجريبي (للاختبار الفوري):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                      placeholder="المبلغ بالعملة"
                    />
                    <button
                      onClick={handleExecuteDeposit}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 whitespace-nowrap cursor-pointer"
                    >
                      إيداع الآن
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 hover:text-white cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {activeModal === 'withdraw' && selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0d1422] border border-emerald-500/30 p-6 shadow-2xl text-right">
            <h3 className="text-lg font-bold text-white mb-1">
              سحب {selectedWallet.currency} إلى محفظتك الخارجية
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              الرصيد المتاح: {selectedWallet.balance} {selectedWallet.currency} (≈ ${(selectedWallet.balance * selectedWallet.usd_rate).toFixed(2)})
            </p>

            {withdrawSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">تم تنفيذ طلب السحب بنجاح!</h4>
                <p className="text-xs text-slate-300">تم تسجيل المعاملة وخصم الرصيد من محفظتك.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {withdrawError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    عنوان المحفظة المستلمة ({selectedWallet.network}):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="أدخل عنوان محفظتك الخارجية"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white text-right"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    مبلغ السحب ({selectedWallet.currency}):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder={`أقصى حد: ${selectedWallet.balance}`}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(selectedWallet.balance.toString())}
                      className="absolute left-2.5 top-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 cursor-pointer"
                    >
                      الكل
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>رسوم الشبكة المقدرة:</span>
                    <span className="font-mono text-slate-300">$0.00 (مجاناً للعرض التجريبي)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مدة المعالجة:</span>
                    <span className="text-emerald-400">فوري</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleExecuteWithdrawal}
                    className="flex-[2] py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-l from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 shadow-md cursor-pointer"
                  >
                    تأكيد السحب
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
