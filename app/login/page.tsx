"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { InstituteMark } from "@/components/brand/InstituteMark";
import type { UserRole } from "@/types";

const ROLES: { id: Exclude<UserRole, "admin">; title: string; hint: string }[] = [
  { id: "student", title: "دخول كطالب", hint: "محاضرات، أخبار، ومسح حضور QR" },
  { id: "ta", title: "دخول كمعيد", hint: "جلسات حضور، تقارير، ونشر إعلانات" },
  { id: "doctor", title: "دخول كدكتور", hint: "إدارة الجلسات، الأخبار، وكشوف الغياب" },
];

export default function LoginPage() {
  const router = useRouter();
  const {
    firebaseUser,
    profile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "admin">>("student");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !firebaseUser || !profile) return;
    router.replace(profile.status === "active" ? "/dashboard" : "/pending");
  }, [loading, firebaseUser, profile, router]);

  async function run(action: () => Promise<void>) {
    setError("");
    setBusy(true);
    try {
      await action();
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (message.includes("auth/unauthorized-domain")) {
        setError("الدومين غير مضاف في Firebase.");
      } else if (message.includes("auth/invalid-credential") || message.includes("auth/user-not-found")) {
        setError("البريد أو كلمة المرور غير صحيحة.");
      } else if (message.includes("auth/email-already-in-use")) {
        setError("هذا البريد مسجّل بالفعل. استخدم تسجيل الدخول.");
      } else {
        setError(message || "تعذّر إكمال العملية.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) return null;

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex max-w-lg flex-col px-5 py-8">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <InstituteMark className="h-12 w-12" />
          <div>
            <div className="text-sm font-extrabold">مدينة الثقافة والعلوم</div>
            <div className="text-[11px] text-white/50">علوم الحاسب ونظم المعلومات</div>
          </div>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <h1 className="text-2xl font-black">تسجيل الدخول للبوابة</h1>
          <p className="mt-2 text-sm leading-7 text-white/55">
            اختر صفتك أولاً. الحساب الجديد يبقى معلّقًا إلى أن توافق الإدارة إنه فعلًا طالب أو معيد أو دكتور.
          </p>

          <div className="mt-6 grid gap-2">
            {ROLES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRole(item.id)}
                className={`rounded-2xl border px-4 py-3 text-right transition ${
                  role === item.id
                    ? "border-[var(--gold)] bg-[var(--gold)]/10"
                    : "border-white/10 bg-[#0F172A]"
                }`}
              >
                <div className="text-sm font-extrabold">{item.title}</div>
                <div className="text-[11px] text-white/50">{item.hint}</div>
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => signInWithGoogle(role))}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm font-semibold disabled:opacity-60"
          >
            المتابعة بـ Google كـ{ROLES.find((r) => r.id === role)?.title.replace("دخول ك", "")}
          </button>

          <div className="my-5 flex items-center gap-2.5 text-[11px] text-white/40">
            <span className="h-px flex-1 bg-white/10" />
            أو بالبريد الجامعي / الشخصي
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <label className="mb-1 block text-[11.5px] font-semibold text-white/50">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 w-full rounded-lg border border-white/10 bg-[#0F172A] px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
          />

          <label className="mb-1 block text-[11.5px] font-semibold text-white/50">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-5 w-full rounded-lg border border-white/10 bg-[#0F172A] px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy || !email || !password}
              onClick={() => run(() => signInWithEmail(email, password))}
              className="rounded-xl bg-[var(--gold)] py-3 text-sm font-bold text-[var(--ink)] disabled:opacity-60"
            >
              دخول
            </button>
            <button
              type="button"
              disabled={busy || !email || !password}
              onClick={() => run(() => signUpWithEmail(email, password, role))}
              className="rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold disabled:opacity-50"
            >
              إنشاء حساب
            </button>
          </div>

          {error && <p className="mt-4 text-sm font-semibold text-[var(--crimson)]">{error}</p>}
        </div>
      </div>
    </div>
  );
}
