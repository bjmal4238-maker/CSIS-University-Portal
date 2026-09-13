"use client";

import React from "react";
import { Sparkles, Phone, Mail } from "lucide-react";

interface AnnouncementBarProps {
  phone?: string;
  email?: string;
}

export function AnnouncementBar({
  phone = "02-38350000",
  email = "info@csi.edu.eg",
}: AnnouncementBarProps) {
  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 text-xs font-bold py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 rounded-full bg-slate-950 animate-ping" />
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            تنبيه أكاديمي: فتح باب تسجيل المواد للفصل الدراسي الجديد لجميع الفرق وتحديث الجداول الدراسية.
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-[11px]">
          <span className="flex items-center gap-1.5" dir="ltr">
            <Phone className="h-3.5 w-3.5" />
            <span>{phone}</span>
          </span>
          <span className="flex items-center gap-1.5" dir="ltr">
            <Mail className="h-3.5 w-3.5" />
            <span>{email}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

