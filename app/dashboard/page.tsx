"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { ROLE_LABELS } from "@/lib/rbac/permissions";
import { getStaffDashboardStats, getStudentDashboardStats } from "@/lib/services/stats";
import Link from "next/link";
import { BookOpen, QrCode, Users, Newspaper, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

export default function DashboardPage() {
  const { profile, loading } = useAuth();
  const [stats, setStats] = useState({
    attendanceRate: 0,
    subjectCount: 0,
    studentCount: 0,
    pendingCount: 0,
    sessionCount: 0,
    newsCount: 0,
    presentCount: 0,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      try {
        if (profile.role === "student") {
          const data = await getStudentDashboardStats(profile.uid);
          setStats((s) => ({ ...s, ...data }));
        } else {
          const data = await getStaffDashboardStats();
          setStats((s) => ({ ...s, ...data }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setReady(true);
      }
    };
    void load();
  }, [profile]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--gold)] border-t-transparent" />
      </div>
    );
  }

  const student = profile.role === "student";

  return (
    <div>
      <section className="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-[#1E293B]/80 p-8">
        <div>
          <p className="text-xs font-bold text-[var(--gold)]">{ROLE_LABELS[profile.role]}</p>
          <h1 className="mt-1 text-3xl font-black">
            أهلاً، <span className="text-[var(--gold)]">{profile.displayName}</span>
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {student
              ? [profile.studentId, profile.year, profile.major].filter(Boolean).join(" • ") || "أكمل الملف الشخصي عشان يظهر في كشف الغياب"
              : "المعهد العالي لعلوم الحاسب ونظم المعلومات — مدينة الثقافة والعلوم"}
          </p>
        </div>
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className="hidden h-16 w-16 rounded-full border-2 border-[var(--gold)] object-cover md:block" />
        ) : (
          <div className="hidden h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--gold)] bg-[#0F172A] text-xl font-black md:flex">
            {profile.displayName?.charAt(0) || "C"}
          </div>
        )}
      </section>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {student ? (
          <>
            <StatCard label="نسبة الحضور" value={ready ? `${stats.attendanceRate}%` : "—"} hint={`${stats.presentCount} من ${stats.sessionCount} جلسة`} icon={<QrCode className="h-9 w-9 text-[#4CD08A] opacity-50" />} />
            <StatCard label="المواد المتاحة" value={ready ? String(stats.subjectCount) : "—"} icon={<BookOpen className="h-9 w-9 text-[var(--gold)] opacity-50" />} />
            <StatCard label="إعلانات المعهد" value={ready ? String(stats.newsCount) : "—"} icon={<Newspaper className="h-9 w-9 text-sky-300 opacity-50" />} />
          </>
        ) : (
          <>
            <StatCard label="الطلاب المعتمدون" value={ready ? String(stats.studentCount) : "—"} icon={<Users className="h-9 w-9 text-[var(--gold)] opacity-50" />} />
            <StatCard label="نسبة حضور الجلسات" value={ready ? `${stats.attendanceRate}%` : "—"} hint={`${stats.sessionCount} جلسة مسجّلة`} icon={<QrCode className="h-9 w-9 text-[#4CD08A] opacity-50" />} />
            <StatCard label="حسابات بانتظار الموافقة" value={ready ? String(stats.pendingCount) : "—"} icon={<ShieldAlert className="h-9 w-9 text-red-400 opacity-50" />} />
          </>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/news" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold hover:border-[var(--gold)]/40">الأخبار الأكاديمية</Link>
        {student ? (
          <Link href="/attendance/scan" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold hover:border-[var(--gold)]/40">مسح حضور المحاضرة</Link>
        ) : (
          <Link href="/attendance/report" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold hover:border-[var(--gold)]/40">كشف الغياب من الحسابات الحقيقية</Link>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <div>
        <p className="mb-1 text-sm text-white/50">{label}</p>
        <p className="text-3xl font-black">{value}</p>
        {hint && <p className="mt-1 text-[11px] text-white/40">{hint}</p>}
      </div>
      {icon}
    </div>
  );
}
