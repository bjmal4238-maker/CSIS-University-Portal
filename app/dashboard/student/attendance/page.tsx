"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import {
  CheckCircle2,
  ArrowRight,
  QrCode,
} from "lucide-react";

interface RecordItem {
  id: string;
  markedAt: string;
  status: string;
  session: {
    room?: string | null;
    subject: { name: string; code: string };
    creator: { name: string };
    academicYear: { name: string };
  };
}

export default function StudentAttendancePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [records, setRecords] = useState<RecordItem[]>([]);
  const [stats, setStats] = useState({
    attendedCount: 0,
    totalSessions: 0,
    attendancePercentage: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadRecords() {
      try {
        const res = await fetch("/api/attendance/my-records");
        if (res.ok) {
          const data = await res.json();
          setRecords(data.records || []);
          if (data.stats) setStats(data.stats);
        }
      } catch (err) {
        console.error("Load records error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadRecords();
  }, [user]);

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

          <Link
            href="/dashboard/student/scan"
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-400"
          >
            <QrCode className="h-4 w-4" />
            <span>مسح كود حضور</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-xl font-black text-white">سجل الحضور الأكاديمي</h2>
            <p className="mt-1 text-xs text-white/50">
              توثيق دقيق لحضور المحاضرات المسجلة عبر البوابة برمز الـ QR
            </p>
          </div>

          {/* Mini stat pills */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-center">
              <span className="text-[10px] text-emerald-300 block font-bold">نسبة الحضور</span>
              <strong className="text-lg font-black text-emerald-400">{stats.attendancePercentage}%</strong>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center">
              <span className="text-[10px] text-amber-300 block font-bold">إجمالي الحضور</span>
              <strong className="text-lg font-black text-amber-400">{stats.attendedCount} محاضرة</strong>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-white/50">جاري تحميل سجلات الحضور...</div>
        ) : records.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center text-xs text-white/40">
            لا توجد سجلات حضور مسجلة حتى الآن. ابدأ بمسح رمز الـ QR في المحاضرة القادمة.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-white/10 bg-white/5 text-white/50">
                <tr>
                  <th className="p-4 font-bold">المقرر الدراسي</th>
                  <th className="p-4 font-bold">المحاضر</th>
                  <th className="p-4 font-bold">تاريخ وتوقيت الحضور</th>
                  <th className="p-4 font-bold">القاعة</th>
                  <th className="p-4 font-bold">حالة التوثيق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-4">
                      <strong className="block text-white font-bold">{r.session.subject.name}</strong>
                      <span className="font-mono text-[11px] text-white/40">{r.session.subject.code}</span>
                    </td>
                    <td className="p-4 text-white/80">{r.session.creator.name}</td>
                    <td className="p-4">
                      <span className="block text-white/90">
                        {new Date(r.markedAt).toLocaleDateString("ar-EG")}
                      </span>
                      <span className="font-mono text-[11px] text-amber-300" dir="ltr">
                        {new Date(r.markedAt).toLocaleTimeString("ar-EG")}
                      </span>
                    </td>
                    <td className="p-4 text-white/70">{r.session.room || "مدرج المعهد"}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>تم التوثيق</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
