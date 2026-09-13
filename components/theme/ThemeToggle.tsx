"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Laptop } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-400 transition hover:bg-white/10 hover:border-amber-400/40"
        title={resolvedTheme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الليلي"}
        aria-label="تبديل الثيم"
      >
        {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
      <button
        onClick={() => setTheme("light")}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
          theme === "light"
            ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
            : "text-white/60 hover:text-white"
        }`}
        title="فاتح"
      >
        <Sun className="h-3.5 w-3.5" />
        <span>فاتح</span>
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
          theme === "dark"
            ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
            : "text-white/60 hover:text-white"
        }`}
        title="داكن"
      >
        <Moon className="h-3.5 w-3.5" />
        <span>داكن</span>
      </button>

      <button
        onClick={() => setTheme("system")}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
          theme === "system"
            ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
            : "text-white/60 hover:text-white"
        }`}
        title="تلقائي للنظام"
      >
        <Laptop className="h-3.5 w-3.5" />
        <span>النظام</span>
      </button>
    </div>
  );
}

