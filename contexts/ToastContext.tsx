"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (title: string, type?: ToastType, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, type: ToastType = "info", message?: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast(title, "success", message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast(title, "error", message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast(title, "info", message), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast(title, "warning", message), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, info, warning, removeToast }}>
      {children}

      {/* Floating Toasts Viewport */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-5 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2.5 px-4 w-full max-w-md"
      >
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
                toast.type === "success"
                  ? "border-emerald-500/30 bg-[#0B1A14]/95 text-emerald-100"
                  : toast.type === "error"
                  ? "border-rose-500/30 bg-[#1A0B0F]/95 text-rose-100"
                  : toast.type === "warning"
                  ? "border-amber-500/30 bg-[#1A140B]/95 text-amber-100"
                  : "border-sky-500/30 bg-[#0B151F]/95 text-sky-100"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                {toast.type === "error" && <AlertCircle className="h-5 w-5 text-rose-400" />}
                {toast.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-400" />}
                {toast.type === "info" && <Info className="h-5 w-5 text-sky-400" />}
              </div>

              <div className="flex-1 text-right">
                <strong className="block text-xs font-black">{toast.title}</strong>
                {toast.message && (
                  <p className="mt-0.5 text-[11px] opacity-80 leading-relaxed">{toast.message}</p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/40 hover:text-white transition-colors"
                aria-label="إغلاق الإشعار"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

