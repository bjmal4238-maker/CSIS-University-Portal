"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
} from "lucide-react";

interface ScheduleSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
  subject: { name: string; code: string };
  doctor?: { name: string } | null;
  ta?: { name: string } | null;
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

export default function StudentSchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("ALL");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadSchedule() {
      if (!user?.studentProfile?.academicYearId) return;
      try {
        const yearId = user.studentProfile.academicYearId;
        const res = await fetch(`/api/schedules?academicYearId=${yearId}`);
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
      : schedules.filter((s) => s.dayOfWeek === selectedDay);

  return (
    <div className="min-h-screen bg-[#080D1A] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0B1121]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/dashboard/student"
            className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للوحة الطالب</span>
          </Link>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-white">
              جدول المحاضرات — {user?.studentProfile?.academicYear?.name || "الفرقة الحالية"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Day Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h2 className="text-xl font-black text-white">الجدول الدراسي الأسبوعي</h2>
            <p className="mt-1 text-xs text-white/50">
              المحاضرات والسكاشن والمعامل المقررة لفرقتك الأكاديمية
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-white/5 p-1 border border-white/10 text-xs">
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
          </div>
        </div>

        {/* Schedule Display */}
        {loading ? (
          <div className="py-16 text-center text-xs text-white/50">جاري تحميل الجدول...</div>
        ) : filteredSlots.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center text-xs text-white/40">
            لا توجد محاضرات مجدولة لهذا اليوم.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-white/10 bg-white/5 text-white/50">
                  <tr>
                    <th className="p-4 font-bold">اليوم</th>
                    <th className="p-4 font-bold">المقرر الدراسي</th>
                    <th className="p-4 font-bold">التوقيت</th>
                    <th className="p-4 font-bold">القاعة / المعمل</th>
                    <th className="p-4 font-bold">المحاضر / المعيد</th>
                    <th className="p-4 font-bold">النوع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 font-bold text-amber-300">
                        {DAYS_AR[slot.dayOfWeek] || slot.dayOfWeek}
                      </td>
                      <td className="p-4">
                        <strong className="block text-white font-bold">{slot.subject.name}</strong>
                        <span className="font-mono text-[11px] text-white/40">{slot.subject.code}</span>
                      </td>
                      <td className="p-4 font-mono text-white/80" dir="ltr">
                        {slot.startTime} - {slot.endTime}
                      </td>
                      <td className="p-4 text-white/80">{slot.room}</td>
                      <td className="p-4 text-white/80">
                        {slot.doctor?.name || slot.ta?.name || "هيئة التدريس"}
                      </td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {filteredSlots.map((slot) => (
                <article
                  key={slot.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400">
                      {DAYS_AR[slot.dayOfWeek] || slot.dayOfWeek}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        slot.type === "LECTURE"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-sky-500/20 text-sky-300"
                      }`}
                    >
                      {slot.type === "LECTURE" ? "محاضرة" : "سكشن / معمل"}
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-black text-white">{slot.subject.name}</h3>

                  <div className="mt-3 space-y-1.5 text-xs text-white/60">
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
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{slot.doctor?.name || slot.ta?.name || "المحاضر"}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
