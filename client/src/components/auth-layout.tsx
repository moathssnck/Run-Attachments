import { Trophy, Users, Shield } from "lucide-react";
import { motion, Variants } from "framer-motion";
import logoImage from "@assets/logo01_1767784684828.png";
import { useLanguage } from "@/lib/language-context";
import type { ReactNode } from "react";
import { LanguageToggle } from "./language-toggle";
import { ColorThemeToggle } from "./theme-toggle";

const statsCardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.8 + i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const heroTextVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 + i * 0.15,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function AuthLayout({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  return (
    <div className="min-h-screen flex" dir={isRTL ? "rtl" : "ltr"}>
      <div className="absolute  bg-[radial-gradient(rgba(255, 255, 255, 0.171) 2px, transparent 0)]" />

      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 xl:p-16 text-white">
          <motion.div
            className="flex items-center gap-5 mb-14"
            initial={{ opacity: 0, scale: 0.7, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute -inset-2 bg-white/10 rounded-[28px] blur-lg" />
              <div className="relative bg-white p-4 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <img
                  src={logoImage}
                  alt={t("app.name")}
                  className="h-[72px] w-auto"
                />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-3xl xl:text-4xl font-bold tracking-tight drop-shadow-sm">
                {t("app.name")}
              </span>
              <span className="text-base xl:text-lg text-white/75 font-medium mt-0.5">
                {t("hero.kingdom")}
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl xl:text-5xl font-bold text-center mb-5 leading-tight max-w-xl drop-shadow-sm"
            custom={0}
            variants={heroTextVariants}
            initial="hidden"
            animate="visible"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            className="text-lg xl:text-xl text-white/80 text-center max-w-md mb-14 leading-relaxed"
            custom={1}
            variants={heroTextVariants}
            initial="hidden"
            animate="visible"
          >
            {t("hero.subtitle")}
          </motion.p>

          <div className="grid grid-cols-3 gap-5 xl:gap-7 w-full max-w-xl xl:max-w-2xl">
            {[
              {
                icon: Trophy,
                value: "+50M",
                label: t("hero.prizes"),
                color: "from-yellow-400/20 to-yellow-500/10",
              },
              {
                icon: Users,
                value: "+100K",
                label: t("hero.winners"),
                color: "from-blue-400/20 to-blue-500/10",
              },
              {
                icon: Shield,
                value: "100%",
                label: isRTL ? "آمن وموثوق" : "Secure",
                color: "from-emerald-300/20 to-emerald-400/10",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={statsCardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.06, y: -4 }}
                className={`group relative flex flex-col items-center text-center p-5 xl:p-6 rounded-2xl bg-gradient-to-b ${stat.color} backdrop-blur-md border border-white/15 cursor-default`}
              >
                <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
                <motion.div
                  className="relative w-12 h-12 xl:w-14 xl:h-14 rounded-xl bg-white/15 flex items-center justify-center mb-3"
                  whileHover={{ rotate: 10 }}
                >
                  <stat.icon className="h-6 w-6 xl:h-7 xl:w-7 drop-shadow-sm" />
                </motion.div>
                <span className="relative text-2xl xl:text-3xl font-bold tabular-nums drop-shadow-sm">
                  {stat.value}
                </span>
                <span className="relative text-xs xl:text-sm text-white/65 font-medium mt-1">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background">
        <motion.div
          className="flex justify-between items-center p-5 xl:p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 lg:hidden">
            <div className="bg-primary/10 p-2.5 rounded-xl shadow-sm">
              <img src={logoImage} alt={t("app.name")} className="h-9 w-auto" />
            </div>
            <span className="font-bold text-lg text-primary">
              {t("app.name")}
            </span>
          </div>
          <div className="flex items-center gap-2 ltr:ml-auto rtl:mr-auto">
            <LanguageToggle />
            <ColorThemeToggle />
          </div>
        </motion.div>

        <div className="flex-1 flex items-center justify-center px-6 py-4 xl:px-8 overflow-y-auto">
          <motion.div
            className={`w-full ${wide ? "max-w-3xl" : "max-w-xl"}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </div>

        <div className="p-6 text-center text-xs text-muted-foreground/40">
          &copy; {new Date().getFullYear()} {t("app.name")}. All rights
          reserved.
        </div>
      </div>
    </div>
  );
}
