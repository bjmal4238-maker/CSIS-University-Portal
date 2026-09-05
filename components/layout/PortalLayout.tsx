"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { AuthGuard } from "@/components/auth/AuthGuard";

const PUBLIC_PATHS = ["/", "/login"];

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (isPublic) {
    return (
      <>
        <div className="app-background" />
        {children}
      </>
    );
  }

  return (
    <AuthGuard requireAuth path={pathname}>
      <div className="app-background" />
      <div className="min-h-screen">
        {pathname !== "/pending" && <TopNav />}
        <main
          className={
            pathname === "/pending"
              ? "mx-auto max-w-lg px-4 py-16"
              : "mx-auto max-w-6xl px-4 pb-10 pt-28 md:px-8"
          }
        >
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
