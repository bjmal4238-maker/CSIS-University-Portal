"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/admin");
    } else if (user.role === "DOCTOR" || user.role === "TA") {
      router.replace("/dashboard/faculty");
    } else if (user.role === "STUDENT") {
      router.replace("/dashboard/student");
    } else {
      router.replace("/");
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1121] text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
        <p className="text-xs text-white/50">جاري التوجيه إلى البوابة المخصصة...</p>
      </div>
    </div>
  );
}
