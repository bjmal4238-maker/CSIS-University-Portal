"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password, rememberMe);
      const targetUrl = redirect || result.redirectUrl;
      router.push(targetUrl);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("تعذر تسجيل الدخول. يرجى التحقق من بياناتك.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotMessage(data.message || "تم إرسال تعليمات الاستعادة إلى بريدك.");
    } catch {
      setForgotMessage("تعذر إرسال رابط الاستعادة حالياً.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#0B1121] via-[#0F172A] to-[#050914] text-white">
      {/* Top bar */}
      <header className="mx-auto w-full max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-85">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0F172A]">
              <span className="text-base font-black text-amber-400">CSI</span>
            </div>
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white">مدينة الثقافة والعلوم</h1>
            <p className="text-[11px] text-white/55">المعهد العالي لعلوم الحاسب ونظم المعلومات</p>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1 text-xs font-bold text-white/70 hover:text-white transition"
        >
          <span>الرئيسية</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Main card */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-2xl lg:grid-cols-12">
          {/* Left / Brand Info Panel */}
          <div className="relative hidden flex-col justify-between overflow-hidden border-l border-white/10 bg-gradient-to-br from-[#131E38] via-[#0F172A] to-[#090D18] p-10 lg:col-span-5 lg:flex">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>البوابة الأكاديمية الموحدة</span>
              </div>

              <h2 className="mt-6 text-2xl font-black leading-tight text-white">
                منظومة التعليم وإدارة معهد الحاسبات
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-slate-300">
                تسجيل الحضور التفاعلي برمز الـ QR، الجداول الدراسية اللحظية، ومتابعة السجل الأكاديمي والـ GPA لكافة الفرق الدراسية.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.04] p-3 text-xs">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">حسابات الطلاب</strong>
                    <span className="text-white/50 text-[11px]">متابعة المقررات، الحضور، والجداول</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.04] p-3 text-xs">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">هيئة التدريس والمعاونة</strong>
                    <span className="text-white/50 text-[11px]">توليد جلسات الـ QR وإدارة المنشورات</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 text-[11px] text-white/40 flex items-center justify-between">
              <span>مدينة الثقافة والعلوم – 6 أكتوبر</span>
              <span className="font-mono text-amber-400">v2.5</span>
            </div>
          </div>

          {/* Right / Form Panel */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:col-span-7 bg-[#0E1526]/80">
            <div className="mx-auto w-full max-w-md">
              <div className="text-center sm:text-right">
                <h2 className="text-2xl font-black text-white sm:text-3xl">تسجيل الدخول</h2>
                <p className="mt-1 text-xs text-white/50">
                  أدخل بريدك الأكاديمي وكلمة المرور للوصول إلى حسابك
                </p>
              </div>

              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@csis.edu.eg"
                      dir="ltr"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-amber-400 focus:bg-white/10"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-amber-400 focus:bg-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-white/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-500"
                    />
                    <span>تذكر بياناتي</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-amber-400 hover:text-amber-300 font-bold transition"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-slate-950 stroke-[2.5]" />
                      <span className="text-slate-950 font-black text-sm">دخول الحساب</span>
                    </>
                  )}
                </button>
              </form>

              {/* Create account link */}
              <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/60">
                <span>ليس لديك حساب بعد؟ </span>
                <Link
                  href="/register"
                  className="font-black text-amber-400 hover:text-amber-300 transition"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F172A] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white">استعادة كلمة المرور</h3>
            <p className="mt-1 text-xs text-white/50">
              أدخل بريدك الأكاديمي لإرسال رمز استعادة كلمة المرور.
            </p>

            {forgotMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-300">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{forgotMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@csis.edu.eg"
                dir="ltr"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {forgotLoading ? "جاري الإرسال..." : "إرسال الرابط"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-[11px] text-white/40">
        © {new Date().getFullYear()} المعهد العالي لعلوم الحاسب ونظم المعلومات - مدينة الثقافة والعلوم
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B1121] text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
