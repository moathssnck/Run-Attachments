export function GrandOccasion() {
  const units = [
    { v: "08", l: "أيام" },
    { v: "14", l: "ساعة" },
    { v: "32", l: "دقيقة" },
    { v: "07", l: "ثانية" },
  ];

  return (
    <div dir="rtl" className="min-h-screen font-['Cairo'] overflow-hidden relative" style={{ background: "#0D1B2A" }}>
      {/* Decorative concentric rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[900px] h-[900px] rounded-full border border-white/5" />
        <div className="absolute w-[650px] h-[650px] rounded-full border border-white/5" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-white/5" />
      </div>

      {/* Gold radial glow at top center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse at top, #FFD700 0%, transparent 70%)" }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <img src="/__mockup/images/logo.png" alt="logo" className="w-10 h-10 object-contain brightness-0 invert opacity-90" />
          <div className="text-white/80 text-sm font-bold">الاتحاد العام للجمعيات الخيرية</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-white/50 text-xs border border-white/10 px-4 py-1.5 rounded-full">
            الدورة الرابعة عشرة · ٢٠٢٦
          </div>
          <button className="border border-yellow-500/60 text-yellow-400 text-sm font-bold px-5 py-2 rounded-full hover:bg-yellow-500/10 transition-colors">
            تسجيل الدخول
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-6 pb-10 min-h-[calc(100vh-80px)]">

        {/* Event badge */}
        <div className="inline-flex items-center gap-3 mb-8 border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-md rounded-full px-6 py-2">
          <span className="text-yellow-400 text-sm">✦</span>
          <span className="text-yellow-300 text-sm font-bold tracking-widest uppercase">حفل السحب الكبير</span>
          <span className="text-yellow-400 text-sm">✦</span>
        </div>

        {/* Headline — large Arabic type */}
        <h1 className="text-6xl font-black text-white leading-[1.15] mb-3 max-w-3xl"
          style={{ textShadow: "0 0 80px rgba(255,215,0,0.15)" }}>
          السحب الخيري السنوي
        </h1>
        <div className="text-5xl font-black mb-8 leading-tight"
          style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          ٢٠ مارس ٢٠٢٦
        </div>

        {/* Prize */}
        <div className="mb-10 flex flex-col items-center">
          <div className="text-white/40 text-xs uppercase tracking-[0.3em] mb-2">الجائزة الكبرى</div>
          <div className="text-white font-black"
            style={{ fontSize: "clamp(3rem,8vw,6rem)", textShadow: "0 0 60px rgba(255,215,0,0.3)" }}>
            ٥٠,٠٠٠ <span className="text-yellow-400">د.أ</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex gap-6 mb-10 justify-center">
          {units.map(({ v, l }) => (
            <div key={l} className="flex flex-col items-center">
              <div className="relative w-16 h-16 flex items-center justify-center rounded-xl overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.05))", border: "1px solid rgba(255,215,0,0.2)" }}>
                <span className="text-3xl font-black text-white tabular-nums">{v}</span>
              </div>
              <span className="text-white/40 text-[10px] mt-2 tracking-wider">{l}</span>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button className="font-black text-black text-base px-10 py-4 rounded-2xl shadow-2xl transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", boxShadow: "0 8px 32px rgba(255,215,0,0.35)" }}>
            احجز بطاقتك — ٣ دنانير فقط
          </button>
          <button className="text-white/60 text-sm border border-white/10 px-6 py-4 rounded-2xl hover:border-white/20 transition-colors">
            تعرّف على الجوائز ›
          </button>
        </div>

        {/* Divider strip */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(255,215,0,0.3), transparent)" }} />
      </div>
    </div>
  );
}
