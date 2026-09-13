"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";

interface ScheduleSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
  subject: { name: string; code: string };
  academicYear?: { name: string };
  doctor?: { name: string } | null;
  ta?: { name: string } | null;
  subjectId?: string;
  day?: string;
}

const DAYS_AR: Record<string, string> = {
  Saturday: "السبت",
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
};

const DAY_ORDER = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

export default function FacultySchedulePage() {
  const { user, isFaculty, loading: authLoading } = useAuth();
  const router = useRouter();

  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("ALL");

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isFaculty) {
        router.push("/login");
      }
    }
  }, [user, isFaculty, authLoading, router]);

  useEffect(() => {
    async function loadSchedule() {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/schedules?facultyId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setSchedules(data.schedules || []);
        }
      } catch (err) {
        console.error("Fetch schedule error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadSchedule();
  }, [user]);

  const filteredSlots =
    selectedDay === "ALL"
      ? schedules
      : schedules.filter((s) => s.dayOfWeek === selectedDay || s.day === selectedDay);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center">
        <div className="text-white/50 text-sm">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D1A] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0B1121]/90 px-6 py-4 backdrop-blur-xl sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/dashboard/faculty"
            className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للوحة عضو هيئة التدريس</span>
          </Link>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-white">
              الجدول الدراسي — {user?.name}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Day Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-black text-white">جدول المحاضرات والسكاشن</h2>
            <p className="mt-1 text-xs text-white/50">
              المحاضرات والسكاشن والمعامل المكلف بتدريسها
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap gap-1.5 rounded-2xl bg-white/5 p-1 border border-white/10 text-xs"
          >
            <button
              onClick={() => setSelectedDay("ALL")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                selectedDay === "ALL"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              جميع الأيام
            </button>
            {DAY_ORDER.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`rounded-xl px-3 py-1.5 font-bold transition ${
                  selectedDay === day
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {DAYS_AR[day]}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Schedule Display */}
        {loading ? (
          <div className="py-16 text-center text-xs text-white/50">جاري تحميل الجدول...</div>
        ) : filteredSlots.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center text-xs text-white/40"
          >
            لا توجد محاضرات مجدولة لهذا اليوم.
          </motion.div>
        ) : (
          <div className="mt-8 space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-white/10 bg-white/5 text-white/50">
                  <tr>
                    <th className="p-4 font-bold">اليوم</th>
                    <th className="p-4 font-bold">المقرر الدراسي</th>
                    <th className="p-4 font-bold">الفرقة الدراسية</th>
                    <th className="p-4 font-bold">التوقيت</th>
                    <th className="p-4 font-bold">القاعة / المعمل</th>
                    <th className="p-4 font-bold">النوع</th>
                    <th className="p-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <motion.tbody 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-white/5"
                >
                  <AnimatePresence>
                    {filteredSlots.map((slot) => (
                      <motion.tr 
                        variants={itemVariants}
                        layout
                        key={slot.id} 
                        className="hover:bg-white/[0.02] transition"
                      >
                        <td className="p-4 font-bold text-amber-300">
                          {DAYS_AR[slot.dayOfWeek || slot.day || ""] || slot.dayOfWeek || slot.day}
                        </td>
                        <td className="p-4">
                          <strong className="block text-white font-bold">{slot.subject?.name}</strong>
                          <span className="font-mono text-[11px] text-white/40">{slot.subject?.code}</span>
                        </td>
                        <td className="p-4 text-white/80">
                          {slot.academicYear?.name || "غير محدد"}
                        </td>
                        <td className="p-4 font-mono text-white/80" dir="ltr">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td className="p-4 text-white/80">{slot.room}</td>
                        <td className="p-4">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                              slot.type === "LECTURE"
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                : slot.type === "LAB"
                                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                                : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {slot.type === "LECTURE"
                              ? "محاضرة"
                              : slot.type === "LAB"
                              ? "معمل عملي"
                              : "سكشن"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Link
                            href={`/dashboard/faculty/attendance/create?subjectId=${slot.subjectId || slot.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition"
                          >
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            تسجيل الحضور
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </motion.tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-4 md:hidden"
            >
              <AnimatePresence>
                {filteredSlots.map((slot) => (
                  <motion.article
                    variants={itemVariants}
                    layout
                    key={slot.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md flex flex-col"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400">
                        {DAYS_AR[slot.dayOfWeek || slot.day || ""] || slot.dayOfWeek || slot.day}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          slot.type === "LECTURE"
                            ? "bg-amber-500/20 text-amber-300"
                            : slot.type === "LAB"
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {slot.type === "LECTURE" ? "محاضرة" : slot.type === "LAB" ? "معمل عملي" : "سكشن"}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-black text-white">{slot.subject?.name}</h3>
                    <p className="mt-0.5 text-[10px] text-white/50">{slot.academicYear?.name || "غير محدد"}</p>

                    <div className="mt-3 space-y-1.5 text-xs text-white/60 flex-grow">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span dir="ltr">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-sky-400" />
                        <span>{slot.room}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                      <Link
                        href={`/dashboard/faculty/attendance/create?subjectId=${slot.subjectId || slot.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-400"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        تسجيل حضور الطلاب
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
