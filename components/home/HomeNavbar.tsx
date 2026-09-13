"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ShieldCheck, Menu, X, GraduationCap, LayoutDashboard } from "lucide-react";

interface HomeNavbarProps {
  instituteName?: string;
  shortName?: string;
}

export function HomeNavbar({
  instituteName = "المعهد العالي لعلوم الحاسب ونظم المعلومات",
}: HomeNavbarProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardHref = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "ADMIN":
        return "/admin";
      case "DOCTOR":
      case "TA":
        return "/dashboard/faculty";
      case "STUDENT":
        return "/dashboard/student";
      default:
        return "/dashboard/student";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0F1D]/90 backdrop-blur-xl dark:bg-[#0A0F1D]/90 dark:border-white/10 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition duration-300">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0A0F1D]">
              <span className="font-mono text-base sm:text-lg font-black text-amber-400">CSI</span>
            </div>
          </div>
          <div>
            <span className="block text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition">
              مدينة الثقافة والعلوم
            </span>
            <span className="block text-[11px] sm:text-xs font-medium text-slate-300">
              {instituteName}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-300">
          <a href="#about" className="hover:text-amber-400 transition py-1">
            عن المعهد
          </a>
          <a href="#departments" className="hover:text-amber-400 transition py-1">
            الأقسام الأكاديمية
          </a>
          <a href="#features" className="hover:text-amber-400 transition py-1">
            المنظومة الرقمية
          </a>
          <a href="#faculty" className="hover:text-amber-400 transition py-1">
            هيئة التدريس
          </a>
          <a href="#events" className="hover:text-amber-400 transition py-1">
            الفعاليات
          </a>
          <a href="#news" className="hover:text-amber-400 transition py-1">
            الأخبار
          </a>
          <a href="#location" className="hover:text-amber-400 transition py-1">
            الموقع والاتصال
          </a>
        </nav>

        {/* Actions (ThemeToggle, Notifications, Portal Login/Dashboard) */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle compact />

          {user && <NotificationBell />}

          {user ? (
            <Link
              href={getDashboardHref()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition hover:brightness-110 active:scale-95"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">لوحة التحكم</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/10 active:scale-95"
              >
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>دخول البوابة</span>
              </Link>
              <Link
                href="/register"
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition hover:brightness-110 active:scale-95"
              >
                <GraduationCap className="h-4 w-4" />
                <span>تسجيل طالب</span>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/5"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0A0F1D]/95 px-6 py-4 space-y-3 backdrop-blur-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2.5 text-xs font-bold text-slate-200">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              عن المعهد
            </a>
            <a
              href="#departments"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              الأقسام الأكاديمية
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              المنظومة الرقمية
            </a>
            <a
              href="#faculty"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              هيئة التدريس
            </a>
            <a
              href="#events"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              الفعاليات
            </a>
            <a
              href="#news"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              الأخبار
            </a>
            <a
              href="#location"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              الموقع والاتصال
            </a>
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {!user && (
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-2.5 text-xs font-black text-slate-950"
              >
                <GraduationCap className="h-4 w-4" />
                <span>تسجيل طالب جديد</span>
              </Link>
            )}
            <a
              href="https://csi.edu.eg/"
              target="_blank"
              rel="noreferrer"
              className="text-center text-[11px] text-white/60 hover:text-white pt-1"
            >
              موقع مدينة الثقافة والعلوم الرسمي csi.edu.eg ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

