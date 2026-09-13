"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import {
  QrCode,
  Users,
  BookOpen,
  LogOut,
  Clock,
  CheckCircle2,
  FileText,
  Send,
  Link2,
  AlertCircle,
} from "lucide-react";

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  creditHours: number;
  academicYear: { name: string };
  department: { name: string };
  _count: { sessions: true };
}

interface SessionItem {
  id: string;
  sessionToken: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  durationMinutes: number;
  subject: { name: string; code: string };
  academicYear: { name: string };
  _count: { records: number };
}

export default function FacultyDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Post Composer State
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postSubjectId, setPostSubjectId] = useState("");
  const [postLink, setPostLink] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "DOCTOR" && user.role !== "TA" && user.role !== "ADMIN"))) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadFacultyData() {
      if (!user) return;
      try {
        const [subjRes, sessRes] = await Promise.all([
          fetch(`/api/subjects?${user.role === "TA" ? `taId=${user.id}` : `doctorId=${user.id}`}`),
          fetch("/api/attendance/sessions"),
        ]);

        if (subjRes.ok) {
          const data = await subjRes.json();
          setSubjects(data.subjects || []);
          if (data.subjects?.length > 0) setPostSubjectId(data.subjects[0].id);
        }
        if (sessRes.ok) {
          const data = await sessRes.json();
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error("Load faculty data error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadFacultyData();
  }, [user]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    setPostSubmitting(true);
    setPostError(null);
    setPostSuccess(false);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle.trim() || undefined,
          content: postContent.trim(),
          subjectId: postSubjectId || undefined,
          linkUrl: postLink.trim() || undefined,
          allowComments,
          allowReactions,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPostSuccess(true);
        setPostTitle("");
        setPostContent("");
        setPostLink("");
        setTimeout(() => setPostSuccess(false), 4000);
      } else {
        setPostError(data.error || "تعذر نشر المنشور.");
      }
    } catch {
      setPostError("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setPostSubmitting(false);
    }
  };

  if (authLoading || !user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1121] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  const isDoctor = user.role === "DOCTOR";
  const roleTitle = isDoctor ? "عضو هيئة تدريس (دكتور)" : "هيئة معاونة (معيد)";

  return (
    <div className="min-h-screen bg-[#080D1A] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B1121]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-slate-950 ${
                isDoctor ? "bg-emerald-400" : "bg-cyan-400"
              }`}
            >
              {isDoctor ? "Dr" : "TA"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-white">{user.name}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                    isDoctor
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                      : "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                  }`}
                >
                  {roleTitle}
                </span>
              </div>
              <span className="text-[11px] text-white/50">
                {user.department?.name || "المعهد العالي لعلوم الحاسب"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/faculty/attendance/create"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110"
            >
              <QrCode className="h-4 w-4" />
              <span>إنشاء كود حضور</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Quick actions cards */}
        <section className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/dashboard/faculty/attendance/create"
            className="group flex items-center gap-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 transition hover:border-amber-400 hover:bg-amber-500/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 group-hover:scale-105 transition">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <strong className="block text-sm font-black text-white">
                توليد كود الحضور (QR Session)
              </strong>
              <span className="text-xs text-slate-300">
                إنشاء جلسة حضور ديناميكية تعرض على شاشة المحاضرة
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/faculty/attendance/sessions"
            className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/40 hover:bg-white/[0.06]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <strong className="block text-sm font-black text-white">
                كشوفات وسجلات الحضور
              </strong>
              <span className="text-xs text-slate-300">
                استعراض الطلاب الحاضرين وتصدير ملفات Excel / CSV
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <strong className="block text-sm font-black text-white">المقررات المكلف بها</strong>
              <span className="text-xs text-slate-300">{subjects.length} مقررات دراسية مسندة</span>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Post Composer Panel */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-400" />
                  <h2 className="text-base font-black text-white">نشر إعلان أو تعليمات للطلاب</h2>
                </div>
                <span className="text-xs text-white/50">Post Composer</span>
              </div>

              {postSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-xs font-bold text-emerald-200">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
                  <span>تم نشر المنشور بنجاح! سيظهر لجميع الطلاب والمهتمين.</span>
                </div>
              )}

              {postError && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/15 p-4 text-xs font-bold text-rose-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
                  <span>{postError}</span>
                </div>
              )}

              <form onSubmit={handleCreatePost} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">
                    عنوان الإعلان (اختياري)
                  </label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="مثال: تعليمات تسليم المشروع الفصلي وتوزيع المجموعات"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">
                    المقرر الدراسي المرتبط بالإعلان
                  </label>
                  <select
                    value={postSubjectId}
                    onChange={(e) => setPostSubjectId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1121] px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                  >
                    <option value="">(إعلان عام لجميع الطلاب)</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) - {s.academicYear.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">
                    محتوى المنشور
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="اكتب تفاصيل التكليف، مواعيد المحاضرات، الملاحظات الهامة..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">
                    رابط إضافي أو ملف خارجي (اختياري)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={postLink}
                      onChange={(e) => setPostLink(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      dir="ltr"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400"
                    />
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  </div>
                </div>

                {/* Social controls */}
                <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-white/[0.02] p-4 border border-white/5 text-xs">
                  <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowComments}
                      onChange={(e) => setAllowComments(e.target.checked)}
                      className="h-4 w-4 rounded accent-amber-500"
                    />
                    <span>السماح بتعليقات الطلاب (Comments ON)</span>
                  </label>

                  <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowReactions}
                      onChange={(e) => setAllowReactions(e.target.checked)}
                      className="h-4 w-4 rounded accent-amber-500"
                    />
                    <span>السماح بالتفاعلات والـ Reactions</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={postSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{postSubmitting ? "جاري النشر..." : "نشر المنشور فوراً"}</span>
                </button>
              </form>
            </div>
          </section>

          {/* Assigned Subjects & Active Sessions Side View */}
          <section className="lg:col-span-5 space-y-6">
            {/* Assigned Subjects */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <BookOpen className="h-4 w-4 text-amber-400" />
                <span>المقررات الدراسية المكلف بها</span>
              </h3>

              {subjects.length === 0 ? (
                <p className="mt-4 text-xs text-white/40">لا توجد مواد مسندة حالياً من الإدارة.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {subjects.map((subj) => (
                    <div
                      key={subj.id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 text-xs"
                    >
                      <div>
                        <strong className="block text-white font-bold">{subj.name}</strong>
                        <span className="text-[11px] text-amber-300/80">
                          {subj.code} • {subj.academicYear.name}
                        </span>
                      </div>
                      <Link
                        href={`/dashboard/faculty/attendance/create?subjectId=${subj.id}`}
                        className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25 transition"
                      >
                        بدء جلسة QR
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Attendance Sessions */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>آخر جلسات الحضور المولدة</span>
                </h3>
                <Link
                  href="/dashboard/faculty/attendance/sessions"
                  className="text-[11px] text-amber-400 font-bold hover:underline"
                >
                  عرض الكل
                </Link>
              </div>

              {sessions.length === 0 ? (
                <p className="mt-4 text-xs text-white/40">لم يتم إنشاء جلسات حضور بعد.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {sessions.slice(0, 4).map((sess) => (
                    <div
                      key={sess.id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 text-xs"
                    >
                      <div>
                        <strong className="block text-white font-bold">{sess.subject.name}</strong>
                        <span className="text-[11px] text-white/40">
                          {new Date(sess.createdAt).toLocaleDateString("ar-EG")} • {sess.academicYear.name}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                          <Users className="h-3 w-3" />
                          <span>{sess._count.records} طالب</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
