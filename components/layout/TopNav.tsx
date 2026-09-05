"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { hasPermission } from "@/lib/rbac/permissions";
import type { LucideIcon } from "lucide-react";
import type { Permission } from "@/types";
import {
  LayoutDashboard, Newspaper, UserCircle, QrCode,
  ClipboardList, ScanLine, Shield, LogOut, ChevronDown,
} from "lucide-react";
import { InstituteMark } from "@/components/brand/InstituteMark";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
  roles?: ("admin" | "doctor" | "ta" | "student")[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/news", label: "الأخبار", icon: Newspaper },
  { href: "/profile", label: "الملف الشخصي", icon: UserCircle },
  { href: "/attendance/session", label: "إنشاء جلسة", icon: QrCode, permission: "attendance.session.create", roles: ["doctor", "ta"] },
  { href: "/attendance/report", label: "تقرير الحضور", icon: ClipboardList, permission: "attendance.report.read", roles: ["doctor", "ta", "admin"] },
  { href: "/attendance/scan", label: "تسجيل الحضور", icon: ScanLine, permission: "attendance.scan", roles: ["student"] },
  { href: "/admin", label: "الإدارة", icon: Shield, permission: "platform.manage", roles: ["admin"] },
];

export function TopNav() {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!profile) return false;
    if (item.roles && !item.roles.includes(profile.role)) return false;
    if (item.permission && !hasPermission(profile.role, item.permission)) return false;
    return true;
  });

  const activeHref = visibleItems.find(
    (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  )?.href;

  useEffect(() => {
    if (!activeHref) return;
    const el = itemRefs.current[activeHref];
    const container = navRef.current;
    if (el && container) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setIndicator({ left: elRect.left - containerRect.left, width: elRect.width, opacity: 1 });
    }
  }, [activeHref, visibleItems.length]);

  if (!profile) return null;

  return (
    <>
      {/* اللوجو */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-[fadeSlideDown_0.5s_ease-out_forwards]">
        <InstituteMark className="h-10 w-10" />
        <div className="hidden sm:block">
          <div className="text-sm font-extrabold leading-tight text-white">مدينة الثقافة والعلوم</div>
          <div className="text-[10px] text-white/50">علوم الحاسب ونظم المعلومات</div>
        </div>
      </div>

      {/* القائمة العائمة في النص */}
      <nav
        ref={navRef}
        className="fixed top-4 left-1/2 z-50 animate-[fadeSlideDownCenter_0.5s_ease-out_forwards]"
      >
        <div className="relative flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div
            className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-2)] transition-all duration-300 ease-out"
            style={{ left: indicator.left, width: indicator.width, opacity: indicator.opacity }}
          />
          {visibleItems.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={(el) => { itemRefs.current[item.href] = el; }}
                className={`relative z-10 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors duration-300 ${
                  isActive ? "text-[var(--ink)]" : "text-white/70 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* المستخدم */}
      <div className="fixed top-4 left-4 z-50 animate-[fadeSlideDown_0.5s_ease-out_forwards]">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition hover:bg-white/10"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sidebar-bg)] text-xs font-bold text-white">
              {profile.displayName.charAt(0)}
            </div>
            <ChevronDown className={`h-4 w-4 text-white/60 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute left-0 mt-2 w-56 origin-top-left rounded-2xl border border-white/10 bg-[#0F172A]/95 p-2 backdrop-blur-xl shadow-2xl">
              <div className="mb-1 border-b border-white/10 px-3 py-2">
                <p className="truncate text-sm font-semibold text-white">{profile.displayName}</p>
                <p className="truncate text-xs text-white/50">{profile.email}</p>
              </div>
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}