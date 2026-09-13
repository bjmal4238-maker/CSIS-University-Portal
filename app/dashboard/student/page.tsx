"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import {
  QrCode,
  Calendar,
  ClipboardList,
  GraduationCap,
  Award,
  Sparkles,
  LogOut,
  Heart,
  MessageSquare,
  Send,
  CheckCircle2,
} from "lucide-react";

interface PostItem {
  id: string;
  title?: string;
  content: string;
  createdAt: string;
  allowComments: boolean;
  allowReactions: boolean;
  reactionsCount: number;
  commentsCount: number;
  myReaction?: string | null;
  author: { name: string; role: string };
  subject?: { name: string; code: string };
  comments: Array<{
    id: string;
    content: string;
    author: { name: string; role: string };
  }>;
}

export default function StudentDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [attendanceStats, setAttendanceStats] = useState({
    attendedCount: 0,
    totalSessions: 0,
    attendancePercentage: 100,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const [postsRes, attRes] = await Promise.all([
          fetch("/api/posts"),
          fetch("/api/attendance/my-records"),
        ]);
        if (postsRes.ok) {
          const data = await postsRes.json();
          setPosts(data.posts || []);
        }
        if (attRes.ok) {
          const data = await attRes.json();
          if (data.stats) setAttendanceStats(data.stats);
        }
      } catch (e) {
        console.error("Load dashboard data error:", e);
      } finally {
        setLoadingPosts(false);
      }
    }
    if (user) loadData();
  }, [user]);

  const handleReaction = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "LIKE" }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                myReaction: data.reacted ? data.type : null,
                reactionsCount: data.reacted
                  ? p.reactionsCount + (p.myReaction ? 0 : 1)
                  : p.reactionsCount - 1,
              };
            }
            return p;
          })
        );
      }
    } catch (e) {
      console.error("Reaction error:", e);
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                comments: [...p.comments, data.comment],
                commentsCount: p.commentsCount + 1,
              };
            }
            return p;
          })
        );
        setCommentText((prev) => ({ ...prev, [postId]: "" }));
      }
    } catch (e) {
      console.error("Comment error:", e);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1121] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  const profile = user.studentProfile;

  return (
    <div className="min-h-screen bg-[#080D1A] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B1121]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 font-bold text-slate-950">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white">بوابة الطالب الأكاديمية</h1>
              <span className="text-[11px] text-white/50">
                {user.name} • {profile?.academicYear?.name || "الفرقة الدراسية"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/student/scan"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110"
            >
              <QrCode className="h-4 w-4" />
              <span>مسح كود الحضور</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Student Metric Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Student Profile Info */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <span className="text-xs text-white/50">بيانات القيد</span>
            <strong className="mt-2 block text-base font-black text-white">{user.name}</strong>
            <div className="mt-3 space-y-1 text-xs text-white/60">
              <p>الرقم الأكاديمي: <span className="font-mono text-amber-300">{profile?.studentId || "---"}</span></p>
              <p>كود المعهد: <span className="font-mono text-white/90">{profile?.universityCode || "---"}</span></p>
            </div>
          </div>

          {/* Card 2: Academic Year & Dept */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <span className="text-xs text-white/50">الفرقة والتخصص</span>
            <strong className="mt-2 block text-base font-black text-white">
              {profile?.academicYear?.name || "الفرقة الأولى"}
            </strong>
            <p className="mt-3 text-xs text-slate-300">
              القسم: <span className="font-bold text-amber-300">{user.department?.name || "عام"}</span>
            </p>
            <p className="mt-1 text-xs text-white/50">
              الساعات المعتمدة: {profile?.totalCredits || 0} ساعة
            </p>
          </div>

          {/* Card 3: GPA */}
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 font-bold">المعدل التراكمي (GPA)</span>
              <Award className="h-5 w-5 text-amber-400" />
            </div>
            <strong className="mt-3 block font-mono text-4xl font-black text-amber-400">
              {(profile?.gpa ?? 0).toFixed(2)}
            </strong>
            <span className="mt-2 block text-[11px] text-white/50">
              محدث ومعتمد من شؤون الطلاب
            </span>
          </div>

          {/* Card 4: Attendance Rate */}
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-bold">نسبة الحضور التراكمية</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <strong className="mt-3 block font-mono text-4xl font-black text-emerald-400">
              {attendanceStats.attendancePercentage}%
            </strong>
            <span className="mt-2 block text-[11px] text-white/50">
              حضور {attendanceStats.attendedCount} من {attendanceStats.totalSessions} جلسة
            </span>
          </div>
        </section>

        {/* Quick Action Navigation Grid */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/dashboard/student/scan"
            className="group flex items-center gap-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 transition hover:border-amber-400 hover:bg-amber-500/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 group-hover:scale-105 transition">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <strong className="block text-sm font-black text-white">مسح كود الحضور (QR Scanner)</strong>
              <span className="text-xs text-slate-300">تسجيل حضور المحاضرة الحالية عبر الكاميرا</span>
            </div>
          </Link>

          <Link
            href="/dashboard/student/schedule"
            className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-sky-400/40 hover:bg-white/[0.06]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 group-hover:scale-105 transition">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <strong className="block text-sm font-black text-white">جدول المحاضرات والسكاشن</strong>
              <span className="text-xs text-slate-300">مواعيد وقاعات محاضرات فرقتك الدراسية</span>
            </div>
          </Link>

          <Link
            href="/dashboard/student/attendance"
            className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/40 hover:bg-white/[0.06]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <strong className="block text-sm font-black text-white">سجل الحضور الأكاديمي</strong>
              <span className="text-xs text-slate-300">كشف توثيق حضور المحاضرات السابقة</span>
            </div>
          </Link>
        </section>

        {/* Academic Posts & Social Interactions Feed */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>منشورات وإعلانات المواد الدراسية</span>
            </h2>
            <span className="text-xs text-white/50">تحديثات الدكاترة والمعيدين</span>
          </div>

          {loadingPosts ? (
            <div className="py-12 text-center text-xs text-white/50">جاري تحميل المنشورات...</div>
          ) : posts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center text-xs text-white/40">
              لا توجد منشورات حالياً.
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
                >
                  {/* Post header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold text-sm">
                        {post.author.name[0]}
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-white">
                          {post.author.name}
                        </strong>
                        <span className="text-[11px] text-amber-300/80">
                          {post.subject ? `مقرر: ${post.subject.name}` : "إعلان أكاديمي عام"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-white/40">
                      {new Date(post.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  {/* Post body */}
                  <div className="py-4">
                    {post.title && (
                      <h3 className="text-base font-black text-white mb-2">{post.title}</h3>
                    )}
                    <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* Actions bar */}
                  <div className="flex items-center gap-4 border-t border-white/10 pt-4 text-xs">
                    {post.allowReactions && (
                      <button
                        onClick={() => handleReaction(post.id)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
                          post.myReaction
                            ? "bg-rose-500/20 text-rose-300 font-bold"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${post.myReaction ? "fill-current" : ""}`} />
                        <span>{post.reactionsCount}</span>
                      </button>
                    )}

                    {post.allowComments && (
                      <span className="flex items-center gap-1.5 text-white/60">
                        <MessageSquare className="h-4 w-4 text-sky-400" />
                        <span>{post.commentsCount} تعليقات</span>
                      </span>
                    )}
                  </div>

                  {/* Comments thread if enabled */}
                  {post.allowComments && (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      {post.comments.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {post.comments.map((c) => (
                            <div
                              key={c.id}
                              className="rounded-2xl bg-white/[0.02] p-3 text-xs border border-white/5"
                            >
                              <span className="font-bold text-amber-300 block mb-1">
                                {c.author.name}
                              </span>
                              <p className="text-slate-300">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText[post.id] || ""}
                          onChange={(e) =>
                            setCommentText({ ...commentText, [post.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleComment(post.id);
                          }}
                          placeholder="اكتب استفساراً أو تعليقاً على المنشور..."
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          className="rounded-xl bg-amber-500 px-4 py-2 text-slate-950 hover:bg-amber-400 transition"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
