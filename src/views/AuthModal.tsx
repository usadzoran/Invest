import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Phone, User, KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../services/storage';
import { Logo } from '../components/common/Logo';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [hasReferralFromUrl, setHasReferralFromUrl] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setInfoMessage(null);

    // Check URL parameters for ref code (?ref=ABC123)
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setHasReferralFromUrl(true);
      if (initialMode === 'login') {
        setMode('register');
      }
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setError('يرجى ملء جميع الحقول المطلوبة');
          setLoading(false);
          return;
        }
        const res = await db.loginUser(email, password);
        if (!res.success) {
          setError(res.error || 'فشل تسجيل الدخول');
          setLoading(false);
          return;
        }
        onSuccess();
        onClose();
      } else {
        // Registration
        if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim() || !password) {
          setError('يرجى ملء جميع الحقول الإلزامية');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('كلمة المرور وتأكيد كلمة المرور غير متطابقين');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام');
          setLoading(false);
          return;
        }

        const res = await db.registerUser({
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          password,
          referred_by_code: referralCode.trim() || undefined,
        });

        if (!res.success) {
          setError(res.error || 'حدث خطأ أثناء التسجيل');
          setLoading(false);
          return;
        }

        if (res.requiresEmailConfirmation) {
          setInfoMessage(res.message || 'تم إرسال رابط تأكيد إلى بريدك الإلكتروني.');
          setMode('login');
          setLoading(false);
          return;
        }

        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md my-8 rounded-3xl bg-[#0d131f] border border-emerald-500/20 shadow-2xl p-6 sm:p-8 text-right overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="md" showSubtitle={true} />
          <h2 className="text-xl font-bold text-slate-100 mt-4">
            {mode === 'login' ? 'تسجيل الدخول إلى حسابك' : 'إنشاء حساب استثماري جديد'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {mode === 'login'
              ? 'أدخل بيانات حسابك للمتابعة والاستثمار'
              : 'ابدأ خطواتك المالية واستفد من عوائد المستويات المتعددة'}
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {/* Info message */}
        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              {/* Name & Last Name */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    الاسم <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="أحمد"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    اللقب <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="المنصوري"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  رقم الهاتف <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="+966 50 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-right"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              البريد الإلكتروني <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                dir="ltr"
                placeholder="investor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-right"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              كلمة المرور <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                dir="ltr"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-right"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {mode === 'register' && (
            <>
              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  تأكيد كلمة المرور <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    dir="ltr"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-right"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Referral Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-slate-300">
                    كود الإحالة {hasReferralFromUrl ? '(تم التعرف عليه تلقائياً)' : '(اختياري)'}
                  </label>
                  {hasReferralFromUrl && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> رابط إحالة مفعل
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="ABC123"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono tracking-wider text-right"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  إذا دخلت عبر رابط دعوة صديق، يتم احتسابك ضمن إحالاته لدعمه في فتح المستويات القادمة.
                </p>
              </div>
            </>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-l from-amber-400 via-emerald-400 to-emerald-300 hover:from-amber-300 hover:to-emerald-200 transition-all shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>
              {loading
                ? 'جاري التحقق...'
                : mode === 'login'
                ? 'دخول إلى حسابي'
                : 'إتمام التسجيل وبدء الاستثمار'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
