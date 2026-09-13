"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import {
  Search,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  QrCode,
  StopCircle,
} from "lucide-react";

interface AttendeeRecord {
  id: string;
  markedAt: string;
  status: string;
  student: {
    name: string;
    email: string;
    studentProfile?: {
      studentId: string;
      universityCode: string;
      gpa: number;
      academicYear: { name: string };
    } | null;
  };
}

interface SessionDetail {
  id: string;
  sessionToken: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  durationMinutes: number;
  room?: string | null;
  subject: { name: string; code: string };
  academicYear: { name: string };
  creator: { name: string };
  records: AttendeeRecord[];
}

interface SessionListItem {
  id: string;
  sessionToken: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
  room?: string | null;
  subject: { name: string; code: string };
  academicYear: { name: string };
  creator: { name: string };
  _count: { records: number };
}

function AttendanceSessionsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get("sessionId");

  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSessionId);
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "DOCTOR" && user.role !== "TA" && user.role !== "ADMIN"))) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load all sessions
  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/attendance/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
          if (!selectedSessionId && data.sessions?.length > 0) {
            setSelectedSessionId(data.sessions[0].id);
          }
        }
      } catch (err) {
        console.error("Load sessions error:", err);
      } finally {
        setLoadingList(false);
      }
    }
    if (user) loadSessions();
  }, [user, selectedSessionId]);

  // Load selected session details
  useEffect(() => {
    if (!selectedSessionId) return;

    async function loadDetail() {
      setLoadingDetail(true);
      try {
        const res = await fetch(`/api/attendance/sessions/${selectedSessionId}`);
        if (res.ok) {
          const data = await res.json();
          setSessionDetail(data.session);
        }
      } catch (err) {
        console.error("Load detail error:", err);
      } finally {
        setLoadingDetail(false);
      }
    }
    loadDetail();
  }, [selectedSessionId]);

  // Export to CSV Function
  const exportToCSV = () => {
    if (!sessionDetail || sessionDetail.records.length === 0) return;

    const headers = ["#", "اسم الطالب", "الرقم الأكاديمي", "كود المعهد", "الفرقة الدراسية", "تاريخ ووقت الحضور", "الحالة"];
    const rows = sessionDetail.records.map((r, i) => [
      i + 1,
      `"${r.student.name}"`,
      r.student.studentProfile?.studentId || "---",
      r.student.studentProfile?.universityCode || "---",
      `"${r.student.studentProfile?.academicYear?.name || sessionDetail.academicYear.name}"`,
      new Date(r.markedAt).toLocaleString("ar-EG"),
      r.status === "PRESENT" ? "حاضر" : r.status,
    ]);

    const csvContent =
      "\uFEFF" + // BOM for Arabic support in Excel
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeSubject = sessionDetail.subject.name.replace(/\s+/g, "_");
    const safeDate = new Date(sessionDetail.createdAt).toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `كشف_حضور_${safeSubject}_${safeDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseSession = async () => {
    if (!selectedSessionId) return;
    try {
      const res = await fetch(`/api/attendance/sessions/${selectedSessionId}`, { method: "DELETE" });
      if (res.ok) {
        setSessionDetail((prev) => (prev ? { ...prev, isActive: false } : null));
        setSessions((prev) =>
          prev.map((s) => (s.id === selectedSessionId ? { ...s, isActive: false } : s))
        );
      }
    } catch (e) {
      console.error("Close session error:", e);
    }
  };

  // Filter attendees by search
  const filteredAttendees = (sessionDetail?.records || []).filter((r) => {
    const q = searchQuery.toLowerCase();
    const name = r.student.name.toLowerCase();
    const sId = r.student.studentProfile?.studentId || "";
    const uCode = r.student.studentProfile?.universityCode || "";
    return name.includes(q) || sId.includes(q) || uCode.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#080D1A] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0B1121]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/dashboard/faculty"
            className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للوحة التدريس</span>
          </Link>

          <Link
            href="/dashboard/faculty/attendance/create"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-xs font-black text-slate-950 shadow hover:brightness-110"
          >
            <QrCode className="h-4 w-4" />
            <span>إنشاء جلسة جديدة</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Sessions List Column */}
          <section className="lg:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <h2 className="text-sm font-black text-white border-b border-white/10 pb-3 flex items-center justify-between">
                <span>قائمة جلسات الحضور</span>
                <span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs text-amber-400">
                  {sessions.length}
                </span>
              </h2>

              {loadingList ? (
                <div className="py-12 text-center text-xs text-white/50">جاري التحميل...</div>
              ) : sessions.length === 0 ? (
                <div className="py-10 text-center text-xs text-white/40">لا توجد جلسات سابقة.</div>
              ) : (
                <div className="mt-4 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSessionId(s.id)}
                      className={`w-full rounded-2xl border p-4 text-right transition ${
                        selectedSessionId === s.id
                          ? "border-amber-400/50 bg-amber-500/10 text-white shadow-lg shadow-amber-500/5"
                          : "border-white/5 bg-white/[0.02] text-white/70 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="block text-xs font-bold text-white">
                          {s.subject.name}
                        </strong>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            s.isActive
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {s.isActive ? "نشطة" : "مغلقة"}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-white/50">
                        <span>{new Date(s.createdAt).toLocaleDateString("ar-EG")}</span>
                        <span className="font-bold text-amber-300">
                          {s._count.records} طالب حاضر
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Session Detail & Live Attendees Column */}
          <section className="lg:col-span-8">
            {loadingDetail ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
                <span className="text-xs text-white/50">جاري تحميل كشف الحاضرين...</span>
              </div>
            ) : !sessionDetail ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
                <span className="text-xs text-white/40">اختر جلسة من القائمة لاستعراض كشف الحضور.</span>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6 backdrop-blur-xl">
                {/* Session Header Card */}
                <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-5 gap-4">
                  <div>
                    <span className="text-xs text-amber-400 font-bold">
                      {sessionDetail.subject.code} • {sessionDetail.academicYear.name}
                    </span>
                    <h2 className="text-2xl font-black text-white">{sessionDetail.subject.name}</h2>
                    <p className="mt-1 text-xs text-white/50">
                      تاريخ الجلسة: {new Date(sessionDetail.createdAt).toLocaleString("ar-EG")} •{" "}
                      {sessionDetail.room || "مدرج المعهد"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* CSV Export Button */}
                    <button
                      onClick={exportToCSV}
                      disabled={sessionDetail.records.length === 0}
                      className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition disabled:opacity-40"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>تصدير كشف الحضور (CSV)</span>
                    </button>

                    {sessionDetail.isActive && (
                      <button
                        onClick={handleCloseSession}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/25 transition"
                      >
                        <StopCircle className="h-4 w-4" />
                        <span>إغلاق الجلسة</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Search in attendees */}
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="بحث باسم الطالب، الرقم الأكاديمي، أو كود المعهد..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/80">
                    الحاضرون: <span className="text-amber-400 font-mono">{filteredAttendees.length}</span>
                  </div>
                </div>

                {/* Attendees Table */}
                {filteredAttendees.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-xs text-white/40">
                    لا يوجد طلاب حاضرون يطابقون معايير البحث.
                  </div>
                ) : (
                  <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                    <table className="w-full text-right text-xs">
                      <thead className="border-b border-white/10 bg-white/5 text-white/50">
                        <tr>
                          <th className="p-3.5 font-bold">#</th>
                          <th className="p-3.5 font-bold">اسم الطالب</th>
                          <th className="p-3.5 font-bold">الرقم الأكاديمي</th>
                          <th className="p-3.5 font-bold">كود المعهد</th>
                          <th className="p-3.5 font-bold">وقت المسح</th>
                          <th className="p-3.5 font-bold">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredAttendees.map((rec, index) => (
                          <tr key={rec.id} className="hover:bg-white/[0.02]">
                            <td className="p-3.5 font-mono text-white/40">{index + 1}</td>
                            <td className="p-3.5">
                              <strong className="block text-white font-bold">
                                {rec.student.name}
                              </strong>
                              <span className="font-mono text-[10px] text-white/40" dir="ltr">
                                {rec.student.email}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono text-amber-300">
                              {rec.student.studentProfile?.studentId || "---"}
                            </td>
                            <td className="p-3.5 font-mono text-white/70">
                              {rec.student.studentProfile?.universityCode || "---"}
                            </td>
                            <td className="p-3.5 font-mono text-white/60" dir="ltr">
                              {new Date(rec.markedAt).toLocaleTimeString("ar-EG")}
                            </td>
                            <td className="p-3.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>حاضر</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function FacultyAttendanceSessionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080D1A] text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        </div>
      }
    >
      <AttendanceSessionsContent />
    </Suspense>
  );
}
