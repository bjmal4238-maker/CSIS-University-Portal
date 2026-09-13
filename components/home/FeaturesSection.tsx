"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Zap,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: QrCode,
      color: "from-amber-500 to-amber-400",
      textColor: "text-amber-400",
      title: "نظام حضور ذكي بالـ QR",
      desc: "رموز مشفرة ديناميكية قصيرة الأجل تتجدد لكل محاضرة لمنع التزوير أو تسجيل الحضور عن بُعد.",
    },
    {
      icon: Calendar,
      color: "from-emerald-500 to-emerald-400",
      textColor: "text-emerald-400",
      title: "جداول دراسية لحظية",
      desc: "عرض تفاعلي للجداول الأسبوعية لكل قسم وفرقة مع تحديد دقيق للقاعات والمدرجات والمعامل.",
    },
    {
      icon: GraduationCap,
      color: "from-sky-500 to-sky-400",
      textColor: "text-sky-400",
      title: "سجلات ومعدل GPA التراكمي",
      desc: "متابعة فورية وموثوقة للساعات المعتمدة والدرجات التراكمية وسجل الحضور والغياب الأكاديمي.",
    },
    {
      icon: ShieldCheck,
      color: "from-purple-500 to-purple-400",
      textColor: "text-purple-400",
      title: "صلاحيات وأمان متقدم",
      desc: "بوابات مستقلة ومؤمنة للطلاب، الأساتذة، المعيدين، ولوحة تحكم عليا لإدارة المعهد والعميد.",
    },
    {
      icon: MessageSquare,
      color: "from-rose-500 to-rose-400",
      textColor: "text-rose-400",
      title: "منصة تواصل وتفاعل أكاديمي",
      desc: "نشر التكليفات والإعلانات والمواد العلمية مع إمكانية التفاعل بالتعليقات والإعجابات.",
    },
    {
      icon: Smartphone,
      color: "from-teal-500 to-teal-400",
      textColor: "text-teal-400",
      title: "تطبيق ويب تقدمي (PWA)",
      desc: "تجربة مستخدم سريعة وسلسة تدعم العمل على جميع الهواتف الذكية مع إشعارات فورية.",
    },
  ];

  return (
    <section id="features" className="border-t border-white/10 py-20 bg-[#080D18]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <Zap className="h-4 w-4" />
            <span>بنية تحتية رقمية متكاملة</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black text-white">
            منظومة إدارة المعهد الذكية (CSIS Cloud)
          </h2>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-400">
            أدوات رقمية تسهل العملية التعليمية وترتقي بالتواصل الأكاديمي بين الطلاب وأعضاء هيئة التدريس
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="group rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 hover:border-amber-500/30 hover:bg-white/[0.04] transition-all"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${feat.color} p-0.5 shadow-md`}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0A0F1E]">
                    <Icon className={`h-6 w-6 ${feat.textColor}`} />
                  </div>
                </div>

                <h3 className="mt-5 text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition">
                  {feat.title}
                </h3>

                <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

