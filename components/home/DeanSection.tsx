"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle2, Target, Eye, BookOpen } from "lucide-react";

export function DeanSection() {
  return (
    <section id="about" className="border-t border-white/10 py-20 bg-[#080D1A] relative overflow-hidden">
      {/* Soft background highlight */}
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Dean's Photo & Badge Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#111827] to-[#0D1322] p-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20 flex-shrink-0">
                  CSI
                </div>
                <div>
                  <span className="inline-block text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full mb-1">
                    إدارة المعهد
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    أ.د. عميد معهد الحاسبات
                  </h3>
                  <p className="text-xs text-slate-400">
                    أستاذ علوم الحاسب وهندسة البرمجيات
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-slate-300 space-y-3">
                <p>
                  &ldquo;أهلاً بكم في المعهد العالي لعلوم الحاسب ونظم المعلومات بمدينة الثقافة والعلوم بالسادس من أكتوبر. نحرص دائماً على تقديم نموذج تعليمي تطبيقي حديث يربط المقررات الأكاديمية باحتياجات سوق العمل وصناعة التكنولوجيا المتقدمة، مع توفير بيئة تعليمية تدعم الإبداع والبحث العلمي وتطوير البرمجيات والذكاء الاصطناعي.&rdquo;
                </p>
              </div>

              {/* Official Accreditation Badges */}
              <div className="mt-5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>معادلة الدرجة العلمية للبكالوريوس من المجلس الأعلى للجامعات المصرية.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>عضوية نقابة التطبيقيين ونقابة التجاريين وفقاً للتخصص.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>شراكات تدريبية مستمرة مع كبرى شركات الاتصالات وتكنولوجيا المعلومات.</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Vision, Mission, and Educational Objectives */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Award className="h-4 w-4" />
              <span>الرؤية والرسالة الأكاديمية</span>
            </div>

            <h2 className="mt-4 text-2xl sm:text-4xl font-black text-white leading-snug">
              نحو تخريج مهندسي برمجيات ورواد نظم معلومات مؤهلين عالمياً
            </h2>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {/* Vision */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-3">
                  <Eye className="h-5 w-5" />
                </div>
                <h4 className="text-base font-extrabold text-white">رؤية المعهد</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  أن يكون المعهد صرحاً تعليمياً وبحثياً رائداً في مجالات الحوسبة ونظم المعلومات محلياً وإقليمياً، وفق أعلى معايير الجودة والاعتماد الأكاديمي.
                </p>
              </div>

              {/* Mission */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 mb-3">
                  <Target className="h-5 w-5" />
                </div>
                <h4 className="text-base font-extrabold text-white">رسالة المعهد</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  تقديم برامج تعليمية معتمدة ومواكبة للتطور التكنولوجي، ترتقي بقدرات الطلاب المعرفية والعملية لتلبية متطلبات التحول الرقمي وسوق العمل.
                </p>
              </div>

              {/* Objectives */}
              <div className="sm:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-extrabold text-white">الأهداف الاستراتيجية للمعهد</h4>
                </div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>تطوير المناهج باستمرار بما يتوافق مع الذكاء الاصطناعي وهندسة البرمجيات.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>تجهيز معامل حاسوبية متقدمة بأحدث العتاد والبرمجيات المرخصة.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>تشجيع مشاريع التخرج الابتكارية وحاضنات الأعمال التكنولوجية.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>التحول الرقمي الكامل في جميع المعاملات الأكاديمية والطلابية.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

