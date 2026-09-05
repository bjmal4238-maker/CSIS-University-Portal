"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { InstituteMark } from "@/components/brand/InstituteMark";
import { ROLE_LABELS } from "@/lib/rbac/permissions";

export default function PendingPage() {
  const { profile, logout } = useAuth();
  const suspended = profile?.status === "suspended";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
      <InstituteMark className="mx-auto h-16 w-16" />
      <h1 className="mt-5 text-2xl font-black">
        {suspended ? "الحساب غير مفعّل" : "بانتظار موافقة الإدارة"}
      </h1>
      <p className="mt-3 text-sm leading-7 text-white/60">
        {suspended
          ? "تم إيقاف هذا الحساب. تواصل مع إدارة المعهد."
          : `طلبت الدخول كـ ${profile?.requestedRole ? ROLE_LABELS[profile.requestedRole] : ROLE_LABELS[profile?.role ?? "student"]}. مش هتقدر تستخدم البوابة قبل ما الأدمن يؤكد الصفة.`}
      </p>
      <p className="mt-2 font-mono text-xs text-white/40">{profile?.email}</p>
      <button
        type="button"
        onClick={() => logout()}
        className="mt-6 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-bold"
      >
        تسجيل الخروج
      </button>
    </div>
  );
}
