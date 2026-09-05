"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { canAccessRoute } from "@/lib/rbac/permissions";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  path?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  path,
}: AuthGuardProps) {
  const { firebaseUser, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !firebaseUser) {
      router.replace("/login");
      return;
    }

    if (profile?.status === "pending" && pathname !== "/pending") {
      router.replace("/pending");
      return;
    }

    if (profile?.status === "suspended" && pathname !== "/pending") {
      router.replace("/pending");
      return;
    }

    if (
      profile?.status === "active" &&
      path &&
      !canAccessRoute(profile.role, path)
    ) {
      router.replace("/dashboard");
    }
  }, [loading, firebaseUser, profile, requireAuth, path, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[var(--gold)] border-t-transparent" />
          <p className="text-sm text-[var(--faded)]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !firebaseUser) return null;
  if (profile && (profile.status === "pending" || profile.status === "suspended") && pathname !== "/pending") {
    return null;
  }
  if (profile?.status === "active" && path && !canAccessRoute(profile.role, path)) {
    return null;
  }

  return <>{children}</>;
}
