"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { useToast } from "@/contexts/ToastContext";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Phone,
  Lock,
  Moon,
  Bell,
  ShieldCheck,
  Save,
  Key,
} from "lucide-react";

export default function StudentSettingsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  // Profile fields
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification preferences
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [postAlerts, setPostAlerts] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user, authLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      // Update phone via user update API or settings
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (res.ok) {
        success("تم تحديث البيانات الشخصية بنجاح.");
        await refreshUser();
      } else {
        const data = await res.json();
        toastError(data.error || "تعذر تحديث البيانات.");
      }
    } catch {
      toastError("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toastError("كلمتا المرور الجديدتان غير متطابقتين.");
      return;
    }

    if (newPassword.length < 6) {
      toastError("كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.");
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        success("تم تغيير كلمة المرور بنجاح.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        toastError(data.error || "تعذر تغيير كلمة المرور.");
      }
    } catch {
      toastError("حدث خطأ في الخادم أثناء تحديث كلمة المرور.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D1A] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D1A] text-white selection:bg-amber-500 selection:text-slate-950 font-sans pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B1121]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/dashboard/student"
            className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للوحة الطالب</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-400">إعدادات الحساب</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="border-b border-white/10 pb-6 mb-8">
          <h1 className="text-2xl font-black text-white">إعدادات الحساب والتفضيلات</h1>
          <p className="mt-1 text-xs text-white/50">
            تحكم في بيانات الاتصال، كلمة المرور، مظهر البوابة، وتنبيهات الحضور.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column: Personal info & Password */}
          <div className="md:col-span-8 space-y-6">
            {/* Contact Info Form */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6 backdrop-blur-xl"
            >
              <h2 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <Phone className="h-4 w-4 text-amber-400" />
                <span>بيانات الاتصال والتواصل</span>
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">
                    الاسم المسجل (للتعديل يرجى مراجعة شؤون الطلاب)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.name}
                    className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-xs text-white/50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">
                    البريد الأكاديمي المسجل
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    dir="ltr"
                    className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-xs text-white/50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    رقم الهاتف المحمول
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{savingProfile ? "جاري الحفظ..." : "حفظ رقم الهاتف"}</span>
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Change Password Form */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6 backdrop-blur-xl"
            >
              <h2 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>تغيير كلمة المرور</span>
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    كلمة المرور الحالية
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">
                      تأكيد كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <Key className="h-4 w-4" />
                    <span>{savingPassword ? "جاري التحديث..." : "تحديث كلمة المرور"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Appearance & Notifications Preferences */}
          <div className="md:col-span-4 space-y-6">
            {/* Theme Settings Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6 backdrop-blur-xl"
            >
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                <Moon className="h-4 w-4 text-amber-400" />
                <span>مظهر البوابة (الثيم)</span>
              </h3>
              <p className="text-xs text-white/50 mb-4 leading-relaxed">
                اختر مظهر الواجهة المفضل لديك لتصفح مريح للعينين.
              </p>

              <ThemeToggle />
            </motion.div>

            {/* Notification Toggles */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6 backdrop-blur-xl"
            >
              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4 text-sky-400" />
                <span>تفضيلات التنبيهات</span>
              </h3>

              <div className="space-y-4 text-xs">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={attendanceAlerts}
                    onChange={(e) => setAttendanceAlerts(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-500"
                  />
                  <div>
                    <strong className="block text-white font-bold">تأكيد الحضور التلقائي</strong>
                    <span className="text-[11px] text-white/50">
                      إظهار إشعار فوري عند نجاح مسح رمز الـ QR
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={postAlerts}
                    onChange={(e) => setPostAlerts(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-500"
                  />
                  <div>
                    <strong className="block text-white font-bold">إعلانات المقررات الدراسية</strong>
                    <span className="text-[11px] text-white/50">
                      تنبيهك عند نشر الدكاترة لمنشورات أو مواعيد جديدة
                    </span>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Security Notice */}
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 text-xs text-amber-200/80 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-amber-300 mb-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>ملاحظة أمنية هامة</span>
              </div>
              البيانات الأكاديمية الرسمية كالرقم الأكاديمي والفرقة والـ GPA لا يمكن تعديلها إلا عبر
              شؤون الطلاب وإدارة المعهد حفاظاً على سلامة السجلات.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

