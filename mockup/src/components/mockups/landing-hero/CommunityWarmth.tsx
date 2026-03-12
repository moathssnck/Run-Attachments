export function CommunityWarmth() {
  return (
    <div dir="rtl" className="min-h-screen font-['Cairo'] bg-[#FDF6EE] overflow-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur border-b border-amber-100">
        <div className="flex items-center gap-3">
          <img src="/__mockup/images/logo.png" alt="logo" className="w-10 h-10 object-contain" />
          <div>
            <div className="text-sm font-black text-amber-900">اليانصيب الخيري</div>
            <div className="text-[10px] text-amber-600/70">الاتحاد العام للجمعيات الخيرية</div>
          </div>
        </div>
        <button className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-5 py-2 rounded-full shadow-md transition-colors">
          تسجيل الدخول
        </button>
      </nav>

      {/* Hero */}
      <div className="relative max-w-7xl mx-auto px-8 pt-14 pb-10 grid grid-cols-5 gap-12 items-center min-h-[calc(100vh-72px)]">

        {/* Left — story + CTA (3 cols) */}
        <div className="col-span-3 space-y-8">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-700 tracking-wide">السحب الخيري 2026 · الرابعة عشرة</span>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-amber-950 leading-tight">
              بطاقتك الواحدة<br />
              <span className="text-amber-500">تُغيّر حياة أسرة</span>
            </h1>
            <p className="text-base text-amber-800/70 max-w-lg leading-relaxed">
              عندما تشتري بطاقة، أنت لا تشتري رقمًا — أنت تمدّ يدك لأسرة تحتاج مساعدتك.
              ريع كل بطاقة يذهب مباشرةً لدعم الأسر العفيفة في مجتمعنا.
            </p>
          </div>

          {/* Impact stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: "٤٨٠٠+", label: "أسرة استفادت" },
              { val: "٢٠٠ ألف", label: "دينار وُزّع" },
              { val: "١٤ عامًا", label: "من العطاء" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-amber-100 rounded-2xl px-4 py-4 shadow-sm text-center">
                <div className="text-2xl font-black text-amber-600">{s.val}</div>
                <div className="text-xs text-amber-800/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex items-center gap-4 flex-wrap">
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-black text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-amber-200 transition-all hover:-translate-y-0.5">
              انضم إلى قافلة الخير →
            </button>
            <div className="text-sm text-amber-700">
              السعر: <strong>٣ دنانير</strong> فقط للبطاقة
            </div>
          </div>

          {/* Prize note — secondary */}
          <div className="flex items-center gap-3 bg-white border border-amber-100 rounded-2xl px-5 py-3 w-fit shadow-sm">
            <span className="text-lg">🏆</span>
            <div className="text-sm text-amber-900">
              الجائزة الكبرى: <strong className="text-amber-600">٥٠٬٠٠٠ دينار</strong>
              <span className="text-amber-800/50 mr-2 text-xs">· السحب ٢٠ مارس ٢٠٢٦</span>
            </div>
          </div>
        </div>

        {/* Right — warm visual (2 cols) */}
        <div className="col-span-2 relative flex flex-col items-center gap-5">
          {/* Warm background blob */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl -rotate-3 scale-105 opacity-60" />

          {/* Ticket card */}
          <div className="relative bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden w-full">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-6 pt-6 pb-10">
              <div className="flex justify-between items-start mb-6">
                <img src="/__mockup/images/logo.png" alt="" className="w-10 h-10 object-contain brightness-0 invert opacity-80" />
                <div className="text-right">
                  <div className="text-white/80 text-xs">بطاقة مشاركة</div>
                  <div className="text-white font-black text-lg">#٠٠٤٢٨١</div>
                </div>
              </div>
              <div className="text-white font-black text-3xl">٣ دنانير</div>
              <div className="text-white/70 text-sm">حصتك في الخير</div>
            </div>
            <div className="relative -mt-6 bg-white rounded-t-3xl px-6 py-5">
              <div className="flex justify-between text-sm text-amber-800">
                <span>السحب الأول</span>
                <span className="font-bold">٢٠ مارس ٢٠٢٦</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full font-bold">متاحة للشراء</span>
                <button className="bg-amber-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">اشترِ الآن</button>
              </div>
            </div>
          </div>

          {/* Testimonial pill */}
          <div className="relative bg-white rounded-2xl border border-amber-100 px-4 py-3 shadow-sm flex items-center gap-3 w-full">
            <div className="flex -space-x-2 space-x-reverse shrink-0">
              {["bg-rose-400", "bg-sky-400", "bg-emerald-400"].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}>
                  {["م","أ","ف"][i]}
                </div>
              ))}
            </div>
            <div className="text-xs text-amber-800">
              <strong>١٢٠٠+</strong> شخص اشتركوا هذا الأسبوع
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
