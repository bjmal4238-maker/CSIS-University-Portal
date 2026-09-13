import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, RefreshCw, PhoneCall, Mail, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  const instituteName =
    settings?.instituteName || "المعهد العالي لعلوم الحاسب ونظم المعلومات - مدينة الثقافة والعلوم";
  const message =
    settings?.maintenanceMessage ||
    "نقوم حالياً بإجراء بعض أعمال التحديث والصيانة لتحسين وتطوير تجربة البوابة الأكاديمية والخدمات الطلابية. سنعود للعمل بكامل طاقتنا في أقرب وقت.";
  const phone = settings?.contactPhone || "02-38350000";
  const email = settings?.contactEmail || "info@csi.edu.eg";

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#0B1121] via-[#0F172A] to-[#020617] text-white selection:bg-amber-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 mx-auto w-full max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0F172A]">
              <span className="text-lg font-black text-amber-400">CSI</span>
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black text-white">مدينة الثقافة والعلوم</h1>
            <p className="text-xs text-white/60">المعهد العالي لعلوم الحاسب ونظم المعلومات</p>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/80 transition-all hover:bg-white/10 hover:text-white"
        >
          <ShieldCheck className="h-4 w-4 text-amber-400" />
          <span>دخول الإدارة</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        {/* Animated Pulse Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2 text-xs font-bold text-amber-300 backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          </span>
          <span>وضع الصيانة المجدولة والتحديث</span>
        </div>

        {/* Animated Spinner Icon */}
        <div className="mt-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-amber-500/20 bg-amber-500/5 shadow-2xl backdrop-blur-xl">
          <RefreshCw className="h-10 w-10 animate-spin text-amber-400 [animation-duration:4s]" />
        </div>

        <h2 className="mt-8 text-3xl font-black tracking-tight sm:text-4xl text-white">
          جاري عمل تحديثات للنظام
        </h2>

        <p className="mt-4 text-base leading-relaxed text-slate-300 max-w-xl">
          {message}
        </p>

        {/* Info card */}
        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md text-right">
            <p className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles className="h-4 w-4" />
              <span>ما الذي نعمل عليه الآن؟</span>
            </p>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              تحسين خوادم الجداول الأكاديمية ونظام مسح الحضور بالـ QR لضمان استجابة فائقة السرعة مع انطلاق المحاضرات.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md text-right">
            <p className="flex items-center gap-2 text-xs font-bold text-sky-300">
              <PhoneCall className="h-4 w-4" />
              <span>للحالات العاجلة وشؤون الطلاب</span>
            </p>
            <p className="mt-2 text-xs text-white/60 leading-relaxed font-mono flex items-center gap-2" dir="ltr">
              <PhoneCall className="h-3.5 w-3.5 text-amber-400" />
              <span>{phone}</span>
            </p>
            <p className="mt-1 text-xs text-white/60 leading-relaxed font-mono flex items-center gap-2" dir="ltr">
              <Mail className="h-3.5 w-3.5 text-amber-400" />
              <span>{email}</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} {instituteName} - جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
