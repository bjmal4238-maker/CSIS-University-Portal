"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { hasPermission } from "@/lib/rbac/permissions";
import type { Permission } from "@/types";

interface NavItem {
  href: string;
  label: string;
  permission?: Permission;
  roles?: ("admin" | "doctor" | "ta" | "student")[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/news", label: "الأخبار والتحديثات" },
  { href: "/profile", label: "الملف الشخصي" },
  {
    href: "/attendance/session",
    label: "إنشاء جلسة غياب (QR)",
    permission: "attendance.session.create",
    roles: ["doctor", "ta"],
  },
  {
    href: "/attendance/report",
    label: "تقرير حضور الطلاب",
    permission: "attendance.report.read",
    roles: ["doctor", "ta", "admin"],
  },
  {
    href: "/attendance/scan",
    label: "تسجيل الحضور (سكانر)",
    permission: "attendance.scan",
    roles: ["student"],
  },
  {
    href: "/admin",
    label: "لوحة الإدارة",
    permission: "platform.manage",
    roles: ["admin"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!profile) return false;
    if (item.roles && !item.roles.includes(profile.role)) return false;
    if (item.permission && !hasPermission(profile.role, item.permission))
      return false;
    return true;
  });

  return (
    <aside className="flex w-[260px] shrink-0 flex-col bg-[var(--sidebar-bg)] py-6 text-white">
      <div className="flex items-center gap-3 px-6 pb-8">
        <div className="rounded-lg bg-[var(--gold)] px-2 py-2 text-sm font-extrabold text-[var(--sidebar-bg)]">
          CS
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">مدينة الثقافة والعلوم</h2>
          <span className="text-[11px] text-gray-400">CSIS Portal</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {visibleItems.map((item) => {
          const active = pathname === item.href;
          const isAdmin = item.href === "/admin";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-[var(--gold)] text-[var(--sidebar-bg)]"
                  : "text-gray-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
              } ${isAdmin ? "mt-6 text-[var(--gold)]" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {profile && (
        <div className="border-t border-gray-700 px-6 pt-4">
          <p className="truncate text-sm font-semibold">{profile.displayName}</p>
          <p className="truncate text-xs text-gray-400">{profile.email}</p>
          {profile.studentId && (
            <p className="mt-1 font-mono text-xs text-[var(--gold)]">
              {profile.studentId}
            </p>
          )}
          <button
            type="button"
            onClick={() => logout()}
            className="mt-3 w-full rounded-lg border border-gray-600 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-[var(--sidebar-hover)]"
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </aside>
  );
}
