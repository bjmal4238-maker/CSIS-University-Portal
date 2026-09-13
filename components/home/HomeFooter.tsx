"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck, ArrowUp } from "lucide-react";

interface HomeFooterProps {
  instituteName?: string;
  shortName?: string;
}

export function HomeFooter({
  instituteName = "المعهد العالي لعلوم الحاسب ونظم المعلومات",
}: HomeFooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/10 bg-[#050811] text-white pt-16 pb-12 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Institute Info */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 font-mono text-base font-black text-slate-950">
                CSI
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{instituteName}</h3>
                <span className="text-xs text-amber-400 font-bold">مدينة الثقافة والعلوم – 6 أكتوبر</span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-400 max-w-md">
              مؤسسة تعليمية عليا معتمدة من وزارة التعليم العالي المصرية والمجلس الأعلى للجامعات، تؤهل خريجيها لنيل درجة البكالوريوس في علوم الحاسب ونظم المعلومات.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://csi.edu.eg/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <span>بوابة مدينة الثقافة والعلوم csi.edu.eg</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Academic Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              الروابط الأكاديمية
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/login" className="hover:text-amber-300 transition flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>دخول البوابة الإلكترونية</span>
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-amber-300 transition">
                  طلب تسجيل طالب جديد
                </Link>
              </li>
              <li>
                <a href="#departments" className="hover:text-amber-300 transition">
                  الأقسام والمقررات الدراسية
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-amber-300 transition">
                  نظام الحضور بالـ QR
                </a>
              </li>
              <li>
                <a href="#news" className="hover:text-amber-300 transition">
                  لوحة الإعلانات والأخبار
                </a>
              </li>
            </ul>
          </div>

          {/* Guidelines & Support */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              الدعم الفني والإرشادات
            </h4>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed">
              لأي استفسارات تقنية بخصوص تسجيل الدخول أو منظومة الحضور الذكي والنتائج، يرجى التواصل مع وحدة تكنولوجيا المعلومات بالمعهد خلال ساعات العمل الرسمية.
            </p>

            <div className="mt-5 rounded-2xl bg-white/[0.02] border border-white/5 p-3.5 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>رقم طابع التنسيق:</span>
                <strong className="text-amber-400 font-mono">110 / معاهد عليا</strong>
              </div>
              <div className="flex justify-between">
                <span>الدرجة الممنوحة:</span>
                <span className="text-white">بكالوريوس معتمد معادَل</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and scroll to top */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} {instituteName} — جميع الحقوق محفوظة لمدينة الثقافة والعلوم بالسادس من أكتوبر.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 hover:text-white transition"
          >
            <span>للأعلى</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}

