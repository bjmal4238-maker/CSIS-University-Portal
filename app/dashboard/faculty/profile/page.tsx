"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  BookOpen,
  Clock,
  Briefcase,
  MapPin,
  FileText,
  Award,
  ChevronRight,
  Activity,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  department?: { name: string };
  facultyProfile?: {
    title?: string;
    officeRoom?: string;
    specialty?: string;
    bio?: string;
  };
  _count?: {
    postsCreated?: number;
    sessionsCreated?: number;
  };
}

export default function FacultyProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!authUser || (authUser.role !== "DOCTOR" && authUser.role !== "TA" && authUser.role !== "ADMIN"))) {
      router.push("/login");
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    async function loadProfileData() {
      if (!authUser) return;
      try {
        const [meRes, subjRes, sessRes, postsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/subjects?${authUser.role === "TA" ? `taId=${authUser.id}` : `doctorId=${authUser.id}`}`),
          fetch("/api/attendance/sessions"),
          fetch("/api/posts"), // Assuming this gets user's posts or we can count from it
        ]);

        if (meRes.ok) {
          const data = await meRes.json();
          setUserData(data.user);
          if (data.user?._count?.postsCreated !== undefined) {
            setPostsCount(data.user._count.postsCreated);
          }
        }
        
        if (subjRes.ok) {
          const data = await subjRes.json();
          setSubjectsCount(data.subjects?.length || 0);
        }
        
        if (sessRes.ok) {
          const data = await sessRes.json();
          // Assuming sessions returned are for the logged in faculty
          setSessionsCount(data.sessions?.length || 0);
        }

        if (postsRes.ok) {
          const data = await postsRes.json();
          // If the posts API returns all posts by this user, we count them
          // otherwise fallback to the count from /auth/me if it exists
          if (data.posts && Array.isArray(data.posts)) {
            const myPosts = data.posts.filter((p: { authorId?: string }) => p.authorId === authUser.id);
            setPostsCount(myPosts.length);
          }
        }
      } catch (err) {
        console.error("Load profile data error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (authUser) loadProfileData();
  }, [authUser]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D1A] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  if (!userData) return null;

  const isDoctor = userData.role === "DOCTOR";
  const roleTitle = isDoctor ? "دكتور جامعي" : "هيئة معاونة (معيد)";
  const profile = userData.facultyProfile;

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-[#080D1A] text-white pb-12" lang="ar" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B1121]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link
            href="/dashboard/faculty"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
          <h1 className="text-sm font-black text-white">الملف الشخصي</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-3"
        >
          {/* Right Column: Profile Card & Contact */}
          <div className="space-y-6 md:col-span-1">
            {/* Main Profile Card */}
            <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6 backdrop-blur-xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 opacity-50"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-3xl font-black text-3xl shadow-xl shadow-black/50 border-4 border-[#0E1526] ${
                    isDoctor ? "bg-emerald-400 text-slate-950" : "bg-cyan-400 text-slate-950"
                  }`}
                >
                  {userData.name.substring(0, 2)}
                </div>
                
                <h2 className="mt-4 text-xl font-black text-white">{userData.name}</h2>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold">
                  <Shield className={`h-3.5 w-3.5 ${isDoctor ? "text-emerald-400" : "text-cyan-400"}`} />
                  <span className={isDoctor ? "text-emerald-300" : "text-cyan-300"}>{roleTitle}</span>
                </div>
              </div>
            </motion.div>

            {/* Account Info */}
            <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-amber-400" />
                معلومات الحساب
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/50">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40">البريد الإلكتروني</span>
                    <span className="text-xs font-bold text-white">{userData.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/50">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40">حالة الحساب</span>
                    <span className="inline-block mt-0.5 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      نشط
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/50">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40">تاريخ الانضمام</span>
                    <span className="text-xs font-bold text-white">
                      {new Date(userData.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Left Column: Details & Stats */}
          <div className="space-y-6 md:col-span-2">
            {/* Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 text-center transition hover:bg-white/[0.04]">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-2">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="block text-2xl font-black text-white">{subjectsCount}</span>
                <span className="text-[10px] font-bold text-white/50">مقررات مسندة</span>
              </div>
              
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 text-center transition hover:bg-white/[0.04]">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-2">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="block text-2xl font-black text-white">{sessionsCount}</span>
                <span className="text-[10px] font-bold text-white/50">جلسات حضور</span>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 text-center transition hover:bg-white/[0.04]">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 mb-2">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="block text-2xl font-black text-white">{postsCount}</span>
                <span className="text-[10px] font-bold text-white/50">منشورات</span>
              </div>
            </motion.div>

            {/* Professional Info */}
            <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-amber-400" />
                  المعلومات المهنية والأكاديمية
                </h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <span className="block text-[11px] font-bold text-white/40 mb-1">اللقب الأكاديمي</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Award className="h-4 w-4 text-amber-400/70" />
                    {profile?.title || roleTitle}
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-white/40 mb-1">القسم العلمي</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Activity className="h-4 w-4 text-emerald-400/70" />
                    {userData.department?.name || "غير محدد"}
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-white/40 mb-1">التخصص الدقيق</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Award className="h-4 w-4 text-sky-400/70" />
                    {profile?.specialty || "غير محدد"}
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-white/40 mb-1">الغرفة المكتبية (Office)</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <MapPin className="h-4 w-4 text-rose-400/70" />
                    {profile?.officeRoom || "غير محدد"}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bio Section */}
            <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-400" />
                  النبذة التعريفية (Bio)
                </h3>
              </div>
              
              {profile?.bio ? (
                <p className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap">
                  {profile.bio}
                </p>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 text-center">
                  <p className="text-xs text-white/40">لم يتم إضافة نبذة تعريفية بعد.</p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
