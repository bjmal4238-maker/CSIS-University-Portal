"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Trophy, Laptop, Users, ArrowUpRight } from "lucide-react";

export function EventsSection() {
  const events = [
    {
      date: "15 مايو 2026",
      tag: "هاكاثون برمجي",
      title: "هاكاثون معهد الحاسبات السنوي (CSI Hackathon)",
      desc: "مسابقة برمجية مكثفة على مدار 48 ساعة لبناء حلول ذكاء اصطناعي وتطبيقات سحابية بجوائز قيمة.",
      icon: Laptop,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    {
      date: "28 مايو 2026",
      tag: "ملتقى التوظيف",
      title: "ملتقى التوظيف والتدريب التكنولوجي السنوي",
      desc: "لقاء مباشر مع أكثر من 30 شركة رائدة في قطاع الاتصالات والبرمجيات لتوفير فرص تدريب وتوظيف للخريجين.",
      icon: Users,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    },
    {
      date: "10 يونيو 2026",
      tag: "معرض التخرج",
      title: "المعرض الختامي لمشاريع تخرج الفرقة الرابعة",
      desc: "عرض المشاريع الابتكارية للطلاب أمام لجنة تحكيم أكاديمية وصناعية متخصصة ومستثمرين في ريادة الأعمال.",
      icon: Trophy,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
  ];

  return (
    <section id="events" className="border-t border-white/10 py-20 bg-[#080D18]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Calendar className="h-4 w-4" />
              <span>الأنشطة والفعاليات الجامعية</span>
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-white">
              فعاليات تصقل المهارات وتبني قادة المستقبل
            </h2>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {events.map((evt, idx) => {
            const Icon = evt.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 hover:bg-white/[0.04] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl border ${evt.color}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{evt.tag}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">{evt.date}</span>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-white leading-snug">
                    {evt.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {evt.desc}
                  </p>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>تفاصيل الفعالية والتسجيل</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

