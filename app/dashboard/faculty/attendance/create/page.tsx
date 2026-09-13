"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  ArrowRight,
  Clock,
  Users,
  AlertCircle,
  Sparkles,
  StopCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  academicYearId: string;
  academicYear: { name: string };
}

interface AcademicYear {
  id: string;
  name: string;
}

function CreateAttendanceSessionContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSubjectId = searchParams.get("subjectId") || "";

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubjectId);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [room, setRoom] = useState("مدرج 1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Session State
  const [activeSession, setActiveSession] = useState<{
    id: string;
    sessionToken: string;
    expiresAt: string;
    durationMinutes: number;
    subjectName: string;
    attendeesCount: number;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "DOCTOR" && user.role !== "TA" && user.role !== "ADMIN"))) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load subjects and years
  useEffect(() => {
    async function loadMeta() {
      try {
        const [subRes, yrRes] = await Promise.all([
          fetch("/api/subjects"),
          fetch("/api/academic-years"),
        ]);
        if (subRes.ok) {
          const data = await subRes.json();
          setSubjects(data.subjects || []);
          if (data.subjects?.length > 0 && !defaultSubjectId) {
            setSelectedSubjectId(data.subjects[0].id);
            setSelectedYearId(data.subjects[0].academicYearId);
          } else if (defaultSubjectId) {
            const found = data.subjects?.find((s: SubjectItem) => s.id === defaultSubjectId);
            if (found) setSelectedYearId(found.academicYearId);
          }
        }
        if (yrRes.ok) {
          const yrData = await yrRes.json();
          setYears(yrData.years || []);
        }
      } catch (err) {
        console.error("Meta load error:", err);
      }
    }
    loadMeta();
  }, [defaultSubjectId]);

  // Sync selected year with chosen subject
  const handleSubjectChange = (subjId: string) => {
    setSelectedSubjectId(subjId);
    const sub = subjects.find((s) => s.id === subjId);
    if (sub) {
      setSelectedYearId(sub.academicYearId);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedYearId) {
      setError("يرجى اختيار المقرر الدراسي والفرقة.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/attendance/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          academicYearId: selectedYearId,
          durationMinutes: Number(durationMinutes),
          room,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر إنشاء جلسة الحضور.");
      }

      const expires = new Date(data.session.expiresAt).getTime();
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((expires - now) / 1000));

      setActiveSession({
        id: data.session.id,
        sessionToken: data.session.sessionToken,
        expiresAt: data.session.expiresAt,
        durationMinutes: data.session.durationMinutes,
        subjectName: data.session.subject.name,
        attendeesCount: 0,
      });

      setTimeLeft(diffSecs);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (!activeSession || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, timeLeft]);

  // Poll attendee count while session is active
  useEffect(() => {
    if (!activeSession || timeLeft <= 0) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/attendance/sessions/${activeSession.id}`);
        if (res.ok) {
          const data = await res.json();
          setActiveSession((prev) =>
            prev ? { ...prev, attendeesCount: data.session.records.length } : null
          );
        }
      } catch (e) {
        console.error("Poll attendees error:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeSession, timeLeft]);

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      await fetch(`/api/attendance/sessions/${activeSession.id}`, { method: "DELETE" });
      setTimeLeft(0);
    } catch (e) {
      console.error("End session error:", e);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0 && activeSession !== null;

  return (
    <div className="min-h-screen bg-[#080D1A] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0B1121]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/dashboard/faculty"
            className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للوحة التدريس</span>
          </Link>

          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-white">توليد جلسة الحضور بالـ QR</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {!activeSession ? (
          /* Session Creator Form */
          <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#0E1526]/80 p-8 shadow-2xl backdrop-blur-2xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>جلسة حضور ديناميكية ومؤقتة</span>
              </div>
              <h2 className="text-2xl font-black text-white">بدء جلسة حضور جديدة</h2>
              <p className="mt-1 text-xs text-white/50">
                حدد المقرر والمدة لتوليد رمز QR مشفر يعرض على شاشة المحاضرة
              </p>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/15 p-4 text-xs font-bold text-rose-200">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateSession} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  المقرر الدراسي
                </label>
                <select
                  required
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1121] px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) — {s.academicYear.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  الفرقة المستهدفة بالحضور
                </label>
                <select
                  required
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1121] px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                >
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    مدة صلاحية الرمز (بالدقائق)
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1121] px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                  >
                    <option value={3}>3 دقائق (سريعة جداً)</option>
                    <option value={5}>5 دقائق (الافتراضي الموصى به)</option>
                    <option value={10}>10 دقائق</option>
                    <option value={15}>15 دقيقة</option>
                    <option value={30}>30 دقيقة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    القاعة / المدرج
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="مثال: مدرج 1"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    <span>توليد كود الحضور وعرضه على الشاشة</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Active QR Projection Screen */
          <div className="rounded-3xl border border-white/10 bg-[#0E1526]/90 p-8 shadow-2xl backdrop-blur-2xl text-center">
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-6 gap-4">
              <div className="text-right">
                <span className="text-xs text-amber-400 font-bold">جلسة حضور نشطة الآن</span>
                <h2 className="text-2xl font-black text-white">{activeSession.subjectName}</h2>
                <span className="text-xs text-white/50">{room}</span>
              </div>

              {/* Countdown timer pill */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 rounded-2xl border px-5 py-3 ${
                    isExpired
                      ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                      : "border-amber-500/40 bg-amber-500/15 text-amber-300"
                  }`}
                >
                  <Clock className="h-5 w-5 animate-pulse" />
                  <div className="text-right">
                    <span className="text-[10px] block opacity-80">الوقت المتبقي للصلاحية</span>
                    <span className="font-mono text-xl font-black" dir="ltr">
                      {isExpired
                        ? "انتهت الجلسة"
                        : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-5 py-3 text-emerald-300">
                  <Users className="h-5 w-5" />
                  <div className="text-right">
                    <span className="text-[10px] block opacity-80">الطلاب الحاضرين</span>
                    <span className="font-mono text-xl font-black">
                      {activeSession.attendeesCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Display Area */}
            <div className="my-8 flex flex-col items-center justify-center">
              <div
                className={`p-6 rounded-3xl bg-white shadow-2xl transition-all ${
                  isExpired ? "opacity-30 grayscale" : "ring-8 ring-amber-400/20"
                }`}
              >
                <QRCodeSVG
                  value={activeSession.sessionToken}
                  size={280}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {isExpired ? (
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>انتهت صلاحية رمز الـ QR ولم يعد يقبل مسح جديد.</span>
                </div>
              ) : (
                <p className="mt-4 text-xs font-bold text-amber-300 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>الرمز صالح ومحدث الآن، يرجى توجيه كاميرا تطبيق البوابة نحو الشاشة</span>
                </p>
              )}

              {/* Dynamic Token Details for transparency */}
              <div className="mt-4 rounded-xl bg-white/5 border border-white/5 px-4 py-2 font-mono text-[11px] text-white/40 max-w-md truncate">
                Token: {activeSession.sessionToken}
              </div>
            </div>

            {/* Session Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-6">
              <Link
                href={`/dashboard/faculty/attendance/sessions?sessionId=${activeSession.id}`}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 py-2.5 text-xs font-black text-slate-950 shadow hover:brightness-110"
              >
                <Users className="h-4 w-4" />
                <span>فتح كشف الحاضرين المباشر ({activeSession.attendeesCount})</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              {!isExpired && (
                <button
                  onClick={handleEndSession}
                  className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 px-5 py-2.5 text-xs font-bold text-rose-200 hover:bg-rose-500/25"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>إنهاء وإغلاق الجلسة فوراً</span>
                </button>
              )}

              <button
                onClick={() => setActiveSession(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-white/70 hover:bg-white/10"
              >
                إنشاء جلسة لمادة أخرى
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CreateAttendanceSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080D1A] text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        </div>
      }
    >
      <CreateAttendanceSessionContent />
    </Suspense>
  );
}
