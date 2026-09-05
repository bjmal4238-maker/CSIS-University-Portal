"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { getDoctorSessions, getSessionRecords, listAllSessions } from "@/lib/services/attendance";
import { listActiveStudents } from "@/lib/services/users";
import type { AttendanceRecord, AttendanceSession, UserProfile } from "@/types";

export default function AttendanceReportPage() {
  const { profile } = useAuth();
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [allSessions, setAllSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    const load = async () => {
      try {
        const sessions =
          profile.role === "admin"
            ? await listAllSessions()
            : await getDoctorSessions(profile.uid, false);
        const activeStudents = await listActiveStudents();
        setStudents(activeStudents);
        if (sessions.length === 0) {
          setError("لم يتم إنشاء أي جلسات حضور بعد.");
          return;
        }
        const sorted = sessions.sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        );
        setAllSessions(sorted);
        await handleSessionChange(sorted[0].id, sorted);
      } catch {
        setError("حدث خطأ أثناء جلب بيانات الجلسات.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [profile]);

  const handleSessionChange = async (
    sessionId: string,
    sessions: AttendanceSession[] = allSessions,
  ) => {
    const selected = sessions.find((s) => s.id === sessionId);
    if (!selected) return;
    setSession(selected);
    const recs = await getSessionRecords(selected.id);
    setRecords(recs);
  };

  const presentIds = useMemo(() => new Set(records.map((r) => r.studentUid)), [records]);
  const roster = students;
  const presentCount = records.length;
  const totalStudents = roster.length;
  const absentCount = Math.max(totalStudents - roster.filter((s) => presentIds.has(s.uid)).length, 0);
  const rate = totalStudents ? Math.round((roster.filter((s) => presentIds.has(s.uid)).length / totalStudents) * 100) : presentCount ? 100 : 0;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-extrabold text-[var(--gold)]">تقرير الحضور والغياب</h1>
      <p className="mb-6 text-white/55">الكشف مبني على الحسابات المعتمدة، مش أرقام ثابتة.</p>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MiniStat value={totalStudents} label="طلاب المعهد المعتمدون" />
        <MiniStat value={presentCount} label="حاضرون في الجلسة" color="text-[#4CD08A]" />
        <MiniStat value={absentCount} label="غائبون من الكشف" color="text-red-400" />
        <MiniStat value={`${rate}%`} label="نسبة الحضور" color="text-[var(--gold)]" />
      </div>

      <div className="rounded-3xl border border-gray-700 bg-[#1E293B]/80 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold">كشف الجلسة</h2>
          {allSessions.length > 0 && (
            <select
              value={session?.id || ""}
              onChange={(e) => void handleSessionChange(e.target.value)}
              className="rounded-xl border border-gray-600 bg-[#0F172A] px-4 py-2 text-sm"
            >
              {allSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subjectName} - {new Date(s.startedAt).toLocaleString("ar-EG")}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <p className="p-6 text-center text-sm text-white/50">جاري التحميل...</p>
        ) : error ? (
          <p className="p-6 text-center text-sm text-red-400">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-3 py-3 text-right text-xs text-gray-500">الكود</th>
                  <th className="px-3 py-3 text-right text-xs text-gray-500">الاسم</th>
                  <th className="px-3 py-3 text-right text-xs text-gray-500">الفرقة</th>
                  <th className="px-3 py-3 text-right text-xs text-gray-500">التخصص</th>
                  <th className="px-3 py-3 text-right text-xs text-gray-500">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((student) => {
                  const present = presentIds.has(student.uid);
                  const rec = records.find((r) => r.studentUid === student.uid);
                  return (
                    <tr key={student.uid} className="border-b border-gray-800">
                      <td className="px-3 py-3 font-mono">{student.studentId || rec?.studentId || "—"}</td>
                      <td className="px-3 py-3 font-bold">{student.displayName}</td>
                      <td className="px-3 py-3">{student.year || rec?.year || "—"}</td>
                      <td className="px-3 py-3">{student.major || rec?.major || "—"}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${present ? "bg-[#4CD08A]/10 text-[#4CD08A]" : "bg-red-500/10 text-red-400"}`}>
                          {present ? "حاضر" : "غائب"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {records.filter((r) => !roster.some((s) => s.uid === r.studentUid)).map((r) => (
                  <tr key={r.id} className="border-b border-gray-800">
                    <td className="px-3 py-3 font-mono">{r.studentId}</td>
                    <td className="px-3 py-3 font-bold">{r.studentName}</td>
                    <td className="px-3 py-3">{r.year || "—"}</td>
                    <td className="px-3 py-3">{r.major || "—"}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-[#4CD08A]/10 px-2 py-1 text-xs font-bold text-[#4CD08A]">حاضر</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-gray-700 bg-[#1E293B]/80 p-4 text-center">
      <div className={`font-mono text-2xl font-extrabold ${color ?? ""}`}>{value}</div>
      <div className="text-[11px] text-white/45">{label}</div>
    </div>
  );
}
