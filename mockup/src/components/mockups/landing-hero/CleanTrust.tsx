export function CleanTrust() {
  return (
    <div dir="rtl" className="min-h-screen font-['Cairo'] bg-white overflow-hidden">
      {/* Top announcement bar */}
      <div className="bg-blue-700 text-white text-xs text-center py-2 px-4 tracking-wide">
        تحت رعاية وإشراف وزارة التنمية الاجتماعية · مرخص رسميًا · الدورة الرابعة عشرة
      </div>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <img src="/__mockup/images/logo.png" alt="logo" className="w-10 h-10 object-contain" />
          <div>
            <div className="text-sm font-black text-slate-900">اليانصيب الخيري الأردني</div>
            <div className="text-[10px] text-slate-500">الاتحاد العام للجمعيات الخيرية</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-md">
            📅 السحب: ٢٠ مارس ٢٠٢٦
          </span>
          <button className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-5 py-2 rounded-md transition-colors">
            تسجيل الدخول
          </button>
        </div>
      </nav>

      {/* Hero — two column, facts-first */}
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-5 gap-16 items-start min-h-[calc(100vh-104px)]">

        {/* Left — facts & info (3 cols) */}
        <div className="col-span-3 space-y-8 pt-4">
          <div>
            <div className="inline-flex items-center gap-2 text-blue-700 text-xs font-bold bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-md mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              السجل مفتوح — بطاقات متاحة الآن
            </div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight mb-3">
              اليانصيب الخيري السنوي<br />
              <span className="text-blue-700">للجمعيات الخيرية الأردنية</span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
              برنامج سنوي معتمد لجمع التبرعات وتوزيع الجوائز. كل بطاقة تساهم في دعم الأسر
              المحتاجة وتمنحك فرصة الفوز بجوائز نقدية.
            </p>
          </div>

          {/* Key facts grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "الجائزة الكبرى", value: "٥٠,٠٠٠ د.أ", icon: "🏆", sub: "نقدًا" },
              { label: "سعر البطاقة", value: "٣ د.أ فقط", icon: "🎫", sub: "شاملة الضريبة" },
              { label: "موعد السحب", value: "٢٠ مارس ٢٠٢٦", icon: "📅", sub: "بثٌّ مباشر" },
              { label: "إجمالي الجوائز", value: "١٠٠,٠٠٠ د.أ", icon: "💰", sub: "+١٠٠ فائز" },
            ].map((f) => (
              <div key={f.label} className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">{f.label}</span>
                </div>
                <div className="text-xl font-black text-slate-900">{f.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{f.sub}</div>
              </div>
            ))}
          </div>

          {/* Credentials */}
          <div className="flex items-center gap-4 flex-wrap">
            {["✅ مرخص رسميًا", "🔒 دفع آمن", "📋 نتائج معتمدة", "🏛️ إشراف حكومي"].map((tag) => (
              <span key={tag} className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md font-medium">
                {tag}
              </span>
            ))}
          </div>

          {/* Primary CTA */}
          <div className="flex items-center gap-4">
            <button className="bg-blue-700 hover:bg-blue-800 text-white font-black text-base px-8 py-3.5 rounded-xl shadow-sm transition-colors">
              تصفح البطاقات المتاحة
            </button>
            <a href="#" className="text-blue-700 text-sm font-semibold hover:underline">
              تنزيل النشرة الرسمية ↓
            </a>
          </div>
        </div>

        {/* Right — clean ticket (2 cols) */}
        <div className="col-span-2 space-y-4 pt-4">
          {/* Official ticket document look */}
          <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="bg-blue-700 px-5 py-3 flex items-center justify-between">
              <span className="text-white text-xs font-bold tracking-wide">بطاقة مشاركة رسمية</span>
              <img src="/__mockup/images/logo.png" alt="" className="w-7 h-7 object-contain brightness-0 invert opacity-80" />
            </div>
            <div className="px-5 py-5 border-b border-dashed border-slate-200">
              <div className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">رقم البطاقة</div>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-wider">#٠٠٤٢٨١</div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { l: "الفئة", v: "السحب الأول" },
                { l: "السعر", v: "٣.٠٠ دينار أردني" },
                { l: "تاريخ الإصدار", v: "١٢ مارس ٢٠٢٦" },
                { l: "موعد السحب", v: "٢٠ مارس ٢٠٢٦" },
                { l: "الحالة", v: "✅ متاحة" },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{r.l}</span>
                  <span className="font-semibold text-slate-800">{r.v}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
              <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-2.5 rounded-lg text-sm transition-colors">
                شراء هذه البطاقة
              </button>
            </div>
          </div>

          {/* Countdown — minimal */}
          <div className="border border-slate-200 rounded-xl px-5 py-4 bg-white text-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">الوقت المتبقي على السحب</div>
            <div className="flex justify-center gap-4 text-center">
              {[["٠٨","يوم"],["١٤","ساعة"],["٣٢","دقيقة"],["٠٧","ثانية"]].map(([v,l]) => (
                <div key={l}>
                  <div className="text-2xl font-black text-slate-900 tabular-nums">{v}</div>
                  <div className="text-[10px] text-slate-400">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
