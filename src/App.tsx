export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          المشروع جاهز للبدء من الصفر
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          تم تنظيف جميع ملفات المشروع القديمة، الإعدادات، وأكواد النسخة السابقة بنجاح.
        </p>
      </div>
    </div>
  );
}
