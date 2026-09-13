"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Award, BookOpen } from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  role: string;
  departmentName?: string;
  title?: string | null;
  specialty?: string | null;
}

interface FacultySectionProps {
  facultyList: FacultyMember[];
}

export function FacultySection({ facultyList }: FacultySectionProps) {
  // Static prestigious profiles if DB list is small
  const defaultFaculty = [
    {
      name: "أ.د. عميد معهد الحاسبات ونظم المعلومات",
      role: "ADMIN",
      title: "عميد المعهد - أستاذ متفرغ",
      departmentName: "علوم الحاسب",
      specialty: "هندسة البرمجيات والذكاء الاصطناعي",
    },
    {
      name: "أ.د. عصام الدين عبد الحميد",
      role: "DOCTOR",
      title: "رئيس قسم علوم الحاسب",
      departmentName: "علوم الحاسب",
      specialty: "الخوارزميات والحوسبة عالية الأداء",
    },
    {
      name: "أ.د. ماجدة إبراهيم حلمي",
      role: "DOCTOR",
      title: "رئيس قسم نظم المعلومات",
      departmentName: "نظم المعلومات",
      specialty: "أنظمة قواعد البيانات وذكاء الأعمال",
    },
    {
      name: "د. أحمد فؤاد النحاس",
      role: "DOCTOR",
      title: "أستاذ مشارك",
      departmentName: "علوم الحاسب",
      specialty: "تراكيب البيانات وأمن المعلومات",
    },
    {
      name: "د. سارة محمود الشاذلي",
      role: "DOCTOR",
      title: "مدرس دكتور",
      departmentName: "علوم الحاسب",
      specialty: "تعلم الآلة ورؤية الحاسوب",
    },
    {
      name: "م. مصطفى خالد عبد الوهاب",
      role: "TA",
      title: "مدرس مساعد",
      departmentName: "علوم الحاسب",
      specialty: "تطوير تطبيقات الويب السحابية",
    },
  ];

  const displayList = facultyList.length >= 3 ? facultyList : defaultFaculty;

  return (
    <section id="faculty" className="border-t border-white/10 py-20 bg-[#0B1121]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <Users className="h-4 w-4" />
            <span>الهيئة الأكاديمية والتدريسية</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black text-white">
            نخبة من كبار الأساتذة والخبراء الأكاديميين
          </h2>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-400">
            أساتذة وعلماء متخصصون يجمعون بين المعرفة الأكاديمية العميقة والخبرة المهنية في كبرى المشاريع التقنية
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayList.map((member, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 hover:border-amber-500/40 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border border-amber-500/30 text-amber-400 font-bold text-lg flex-shrink-0">
                  {member.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {member.name}
                  </h3>
                  <span className="block text-[11px] text-amber-400 font-bold mt-0.5">
                    {member.title || (member.role === "DOCTOR" ? "دكتور جامعي" : "هيئة معاونة")}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/5 p-3 text-xs space-y-1.5">
                {member.departmentName && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <BookOpen className="h-3.5 w-3.5 text-sky-400" />
                    <span>القسم: {member.departmentName}</span>
                  </div>
                )}
                {member.specialty && (
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    <span>التخصص: {member.specialty}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

