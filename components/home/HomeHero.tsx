"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ShieldCheck,
  QrCode,
  Sparkles,
  ArrowLeft,
  Award,
  CheckCircle2,
  TrendingUp,
  Cpu,
} from "lucide-react";

interface HomeHeroProps {
  heroTitle?: string;
  heroSubtitle?: string;
  shortName?: string;
  studentsCount: number;
  doctorsCount: number;
  subjectsCount: number;
}

export function HomeHero({
  heroTitle = "صناع المستقبل التقني ورواد الابتكار",
  heroSubtitle = "المعهد العالي لعلوم الحاسب ونظم المعلومات بمدينة الثقافة والعلوم بالسادس من أكتوبر — صرح أكاديمي رائد معتمد لإعداد خريجين متميزين في هندسة البرمجيات والذكاء الاصطناعي وإدارة نظم المؤسسات.",
  shortName = "CSI 6th of October",
  studentsCount,
  doctorsCount,
  subjectsCount,
}: HomeHeroProps) {
  const [activeCardTab, setActiveCardTab] = useState<"qr" | "schedule" | "gpa">("qr");

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28">
      {/* Background radial blurs */}
      <div className="absolute -top-32 right-1/4 h-[550px] w-[550px] rounded-full bg-amber-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 text-center lg:text-right"
          >
            {/* Accreditation Badge */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md shadow-sm">
              <Award className="h-4 w-4 text-amber-400" />
              <span>معتمد من وزارة التعليم العالي المصرية • طابع تنسيق معتمد</span>
              <span className="hidden sm:inline text-amber-400/50">•</span>
              <span className="hidden sm:inline">{shortName}</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-5xl xl:text-6xl leading-[1.25]">
              {heroTitle}
              <span className="block mt-2.5 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                بأحدث مناهج التكنولوجيا والذكاء الاصطناعي
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300 max-w-2xl mx-auto lg:mx-0">
              {heroSubtitle}
            </p>

            {/* Quick Feature Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>بكالوريوس معتمد 4 سنوات</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                <Cpu className="h-3.5 w-3.5 text-sky-400" />
                <span>معامل حاسب وذكاء اصطناعي</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>منظومة حضور رقمية بالـ QR</span>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <GraduationCap className="h-5 w-5" />
                <span>دخول البوابة الأكاديمية</span>
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/30"
              >
                <span>التقديم والتسجيل الأكاديمي</span>
                <ArrowLeft className="h-4 w-4 text-amber-400" />
              </Link>
            </div>

            {/* Key Statistics Bar */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-7 max-w-lg mx-auto lg:mx-0 text-center lg:text-right">
              <div>
                <strong className="block text-2xl sm:text-3xl font-black text-amber-400">
                  {studentsCount || 450}+
                </strong>
                <span className="text-xs text-slate-300 font-medium">طالب مقيد ومسجل</span>
              </div>
              <div>
                <strong className="block text-2xl sm:text-3xl font-black text-emerald-400">
                  {doctorsCount || 24}+
                </strong>
                <span className="text-xs text-slate-300 font-medium">هيئة تدريس ومعاونة</span>
              </div>
              <div>
                <strong className="block text-2xl sm:text-3xl font-black text-sky-400">
                  {subjectsCount || 36}+
                </strong>
                <span className="text-xs text-slate-300 font-medium">مقرر دراسي معتمد</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Portal Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md rounded-3xl border border-white/15 bg-gradient-to-b from-[#0E172A]/90 to-[#0A0F1E]/90 p-6 shadow-2xl backdrop-blur-2xl">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-mono text-slate-300">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>CSI Portal 2026</span>
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-2xl bg-white/5 p-1 text-xs font-bold">
                <button
                  onClick={() => setActiveCardTab("qr")}
                  className={`rounded-xl py-2 transition ${
                    activeCardTab === "qr"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  الـ QR الذكي
                </button>
                <button
                  onClick={() => setActiveCardTab("schedule")}
                  className={`rounded-xl py-2 transition ${
                    activeCardTab === "schedule"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  الجدول الدراسي
                </button>
                <button
                  onClick={() => setActiveCardTab("gpa")}
                  className={`rounded-xl py-2 transition ${
                    activeCardTab === "gpa"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  المعدل GPA
                </button>
              </div>

              {/* Tab Contents */}
              <div className="mt-5 space-y-3 min-h-[220px]">
                {activeCardTab === "qr" && (
                  <motion.div
                    key="tab-qr"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                        <QrCode className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <strong className="block text-xs font-bold text-white">
                          تسجيل حضور بالرمز المشفر
                        </strong>
                        <span className="text-[11px] text-slate-300">
                          كود ديناميكي متجدد لمنع الغياب والتكرار
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2">
                      <div className="flex justify-between text-slate-300">
                        <span>المادة الحالية:</span>
                        <strong className="text-white">تراكيب البيانات (CS201)</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>المحاضر:</span>
                        <span className="text-amber-300">د. أحمد فؤاد</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>حالة الجلسة:</span>
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                          مفتوحة الآن (متبقي 3 د)
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeCardTab === "schedule" && (
                  <motion.div
                    key="tab-schedule"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2.5"
                  >
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">الذكاء الاصطناعي (CS305)</span>
                        <span className="text-sky-400 font-mono text-[11px]">09:00 - 10:30</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-300">
                        <span>د. سارة محمود</span>
                        <span className="rounded bg-sky-500/20 px-2 py-0.5 text-sky-300 font-bold">مدرج 2</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">قواعد البيانات المتقدمة (IS202)</span>
                        <span className="text-amber-400 font-mono text-[11px]">11:00 - 12:30</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-300">
                        <span>م. ندى شريف (سكشن)</span>
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300 font-bold">معمل 4</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeCardTab === "gpa" && (
                  <motion.div
                    key="tab-gpa"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <div>
                        <span className="text-[11px] text-emerald-300 font-bold">المعدل التراكمي العام</span>
                        <h4 className="text-3xl font-black text-white mt-0.5">3.84 / 4.0</h4>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-slate-300 space-y-1.5">
                      <div className="flex justify-between">
                        <span>التقدير العام:</span>
                        <strong className="text-emerald-400">ممتاز مع مرتبة الشرف (A)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>الساعات المعتمدة المنجزة:</span>
                        <span className="text-white font-mono">102 / 136 ساعة</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Official Link Badge */}
              <div className="mt-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-center">
                <span className="text-xs font-bold text-amber-300">
                  مدينة الثقافة والعلوم – السادس من أكتوبر
                </span>
                <p className="text-[11px] text-slate-300 mt-1">
                  الحي الأول • أمام جهاز تنمية مدينة 6 أكتوبر
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

