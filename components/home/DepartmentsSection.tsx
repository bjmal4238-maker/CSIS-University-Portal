"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Code, Database, ChevronLeft, CheckCircle2, Briefcase, GraduationCap } from "lucide-react";

interface DepartmentData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  headOfDepartment: string | null;
  _count: {
    subjects: number;
    users: number;
  };
}

interface DepartmentsSectionProps {
  departments: DepartmentData[];
}

export function DepartmentsSection({ departments }: DepartmentsSectionProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>("CS");

  const csTracks = [
    { title: "هندسة البرمجيات وتطبيقات الويب", desc: "تصميم وبناء الأنظمة السحابية المعقدة وتطبيقات الويب الحديثة." },
    { title: "الذكاء الاصطناعي وتعلم الآلة", desc: "الشبكات العصبية، معالجة اللغات الطبيعية، ورؤية الحاسوب." },
    { title: "الأمن السيبراني وحماية البيانات", desc: "أمن الشبكات، اختبار الاختراق، والتشفير الرقمي الحديث." },
    { title: "تطوير تطبيقات الهواتف الذكية", desc: "بناء تطبيقات iOS و Android الأصلية والمختلطة." },
  ];

  const isTracks = [
    { title: "إدارة قواعد البيانات الضخمة Big Data", desc: "تصميم وإدارة مستودعات البيانات وقواعد البيانات الموزعة." },
    { title: "تخطيط موارد المؤسسات (ERP Systems)", desc: "تطبيق وحوكمة أنظمة SAP و Oracle في بيئات الأعمال." },
    { title: "تحليل الأعمال وذكاء الأعمال (BI)", desc: "استخراج المؤشرات واتخاذ القرارات الإدارية القائمة على البيانات." },
    { title: "إدارة وتأمين شبكات المؤسسات", desc: "تصميم البنى التحتية لتقنية المعلومات وحوكمة الخدمات السحابية." },
  ];

  return (
    <section id="departments" className="border-t border-white/10 py-20 bg-[#0A0F1E] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <GraduationCap className="h-4 w-4" />
            <span>البرامج التخصصية المعتمدة</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black text-white">
            برامج أكاديمية تفتح آفاق المستقبل المهني
          </h2>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-400">
            يمنح المعهد درجة البكالوريوس المعتمدة في تخصصين رئيسيين يقودان الثورة الرقمية في مصر والعالم
          </p>
        </div>

        {/* Department Selection Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {departments.map((dept) => {
            const isCS = dept.code === "CS";
            return (
              <motion.div
                key={dept.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedTrack(dept.code)}
                className={`cursor-pointer rounded-3xl border p-7 sm:p-8 transition-all ${
                  selectedTrack === dept.code
                    ? "border-amber-500 bg-white/[0.06] shadow-xl shadow-amber-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        isCS
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-sky-500/20 text-sky-400"
                      }`}
                    >
                      {isCS ? <Code className="h-6 w-6" /> : <Database className="h-6 w-6" />}
                    </div>
                    <div>
                      <span className="font-mono text-xs font-black text-amber-400 uppercase">
                        تخصص {dept.code}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        قسم {dept.name}
                      </h3>
                    </div>
                  </div>

                  <span className="rounded-xl bg-white/5 border border-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                    {dept._count.subjects} مقرراً
                  </span>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-300">
                  {dept.description ||
                    "برنامج أكاديمي وعملي متكامل لتأهيل خريجين قادرين على تلبية متطلبات كبرى شركات التكنولوجيا."}
                </p>

                {dept.headOfDepartment && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 border-t border-white/10 pt-4">
                    <span>رئيس القسم:</span>
                    <strong className="text-white">{dept.headOfDepartment}</strong>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>
                    {selectedTrack === dept.code ? "المسارات المعروضة بالأسفل ✓" : "اضغط لعرض المسارات والوظائف"}
                  </span>
                  <ChevronLeft className="h-4 w-4" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tracks & Careers Spotlight */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Briefcase className="h-5 w-5 text-amber-400" />
              <h4 className="text-base sm:text-lg font-black text-white">
                المسارات التخصصية والوظائف المستهدفة لقسم{" "}
                <span className="text-amber-400">
                  {selectedTrack === "CS" ? "علوم الحاسب (CS)" : "نظم المعلومات (IS)"}
                </span>
              </h4>
            </div>
            <span className="text-xs text-slate-400">مخرجات التعلم المتوافقة مع NARS</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(selectedTrack === "CS" ? csTracks : isTracks).map((track, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <strong className="text-xs font-bold text-white">{track.title}</strong>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">{track.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

