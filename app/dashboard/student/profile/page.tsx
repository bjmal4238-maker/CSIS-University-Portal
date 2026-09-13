"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Award,
  Calendar,
  Shield,
  Camera,
  Hash,
  BookOpen,
  Briefcase
} from "lucide-react";

interface StudentUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
  phone?: string | null;
  createdAt: string;
  department?: { name: string; code: string };
  studentProfile?: {
    studentId?: string;
    universityCode?: string;
    nationalId?: string;
    gpa?: number;
    totalCredits?: number;
    academicYear?: { name: string; level: number };
  };
}

export default function StudentProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [userData, setUserData] = useState<StudentUserRecord | null>(null);
  const [attendanceStats, setAttendanceStats] = useState({
    attendedCount: 0,
    totalSessions: 0,
    attendancePercentage: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const [userRes, attRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/attendance/my-records"),
        ]);
        
        if (userRes.ok) {
          const data = await userRes.json();
          setUserData(data.user);
        }
        
        if (attRes.ok) {
          const data = await attRes.json();
          if (data.stats) setAttendanceStats(data.stats);
        }
      } catch (e) {
        console.error("Error fetching profile data:", e);
      } finally {
        setLoading(false);
      }
    }
    
    if (authUser) {
      fetchProfileData();
    }
  }, [authUser]);

  if (authLoading || loading || !userData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D1A] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  const profile = userData.studentProfile;
  const gpa = profile?.gpa || 0;
  const gpaPercentage = (gpa / 4.0) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-[#080D1A] text-white" lang="ar" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B1121]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 font-bold text-slate-950">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">الملف الشخصي</h1>
            <span className="text-[11px] text-white/50">
              إدارة بياناتك الأكاديمية والشخصية
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Profile Header */}
          <motion.section variants={itemVariants} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="absolute top-0 right-0 h-32 w-full bg-gradient-to-r from-amber-500/20 to-transparent opacity-50" />
            <div className="relative flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
              <div className="relative group">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-3xl font-black text-slate-950 shadow-xl">
                  {userData.name[0]}
                </div>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#0B1121] border border-white/20 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-lg">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white">{userData.name}</h2>
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
                    <GraduationCap className="h-3 w-3" />
                    طالب
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${
                    userData.status === 'ACTIVE' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    <Shield className="h-3 w-3" />
                    {userData.status === 'ACTIVE' ? 'نشط' : userData.status}
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Academic Info */}
            <motion.section variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/5 rounded-xl">
                  <BookOpen className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white">البيانات الأكاديمية</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <Hash className="h-4 w-4 text-white/40" />
                    <span className="text-sm text-white/70">الرقم الأكاديمي</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white bg-black/20 px-3 py-1 rounded-lg">
                    {profile?.studentId || "---"}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <Hash className="h-4 w-4 text-white/40" />
                    <span className="text-sm text-white/70">كود المعهد</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white bg-black/20 px-3 py-1 rounded-lg">
                    {profile?.universityCode || "---"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <Calendar className="h-4 w-4 text-white/40" />
                    <span className="text-sm text-white/70">الفرقة الدراسية</span>
                  </div>
                  <span className="text-sm font-bold text-amber-300">
                    {profile?.academicYear?.name || "---"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <Briefcase className="h-4 w-4 text-white/40" />
                    <span className="text-sm text-white/70">القسم</span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {userData.department?.name || "عام"}
                  </span>
                </div>
                
                <p className="text-[11px] text-white/40 text-center mt-2 flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" />
                  لا يمكن تعديل البيانات الأكاديمية (للتعديل يرجى مراجعة شؤون الطلاب)
                </p>
              </div>
            </motion.section>

            {/* Performance & Contact */}
            <div className="space-y-6">
              {/* Performance Card */}
              <motion.section variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/5 rounded-xl">
                    <Award className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">الأداء الأكاديمي</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* GPA Ring */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5">
                    <div className="relative h-20 w-20 flex items-center justify-center mb-3">
                      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle className="text-white/10 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                        <circle className="text-amber-400 stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${gpaPercentage * 2.51} 251.2`}></circle>
                      </svg>
                      <span className="absolute text-lg font-black font-mono text-amber-400">{gpa.toFixed(2)}</span>
                    </div>
                    <span className="text-xs text-white/60 font-bold">المعدل التراكمي (GPA)</span>
                  </div>

                  {/* Attendance Ring */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5">
                    <div className="relative h-20 w-20 flex items-center justify-center mb-3">
                      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle className="text-white/10 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                        <circle className="text-emerald-400 stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${attendanceStats.attendancePercentage * 2.51} 251.2`}></circle>
                      </svg>
                      <span className="absolute text-lg font-black font-mono text-emerald-400">{attendanceStats.attendancePercentage}%</span>
                    </div>
                    <span className="text-xs text-white/60 font-bold">نسبة الحضور</span>
                  </div>
                </div>
              </motion.section>

              {/* Contact & Account Info */}
              <motion.section variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/5 rounded-xl">
                    <Mail className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">معلومات الحساب</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50">البريد الإلكتروني</p>
                      <p className="text-sm font-bold text-white" dir="ltr">{userData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50">تاريخ الانضمام</p>
                      <p className="text-sm font-bold text-white">
                        {new Date(userData.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
