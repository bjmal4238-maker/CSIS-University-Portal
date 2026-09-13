"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Keyboard,
} from "lucide-react";

export default function StudentQRScanner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    subjectName?: string;
    time?: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const scannerRef = useRef<unknown>(null);
  const qrRegionId = "html5qr-code-full-region";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await (scannerRef.current as { stop: () => Promise<void> }).stop();
        scannerRef.current = null;
      } catch {}
    }
    setScanning(false);
  }, []);

  // Handle QR submission to API
  const handleTokenSubmit = useCallback(async (token: string) => {
    if (submitting) return;
    setSubmitting(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setScanResult({
          success: true,
          message: data.message || "تم تسجيل حضورك بنجاح.",
          subjectName: data.subjectName,
          time: new Date().toLocaleTimeString("ar-EG"),
        });
        // Stop scanning after success
        stopScanner();
      } else {
        setScanResult({
          success: false,
          message: data.error || "تعذر تسجيل الحضور.",
        });
      }
    } catch {
      setScanResult({
        success: false,
        message: "حدث خطأ في الاتصال بالخادم أثناء التحقق من الرمز.",
      });
    } finally {
      setSubmitting(false);
    }
  }, [submitting, stopScanner]);

  const startScanner = useCallback(async () => {
    setCameraError(null);
    setScanResult(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerRef.current) {
        try {
          await (scannerRef.current as { stop: () => Promise<void> }).stop();
        } catch {}
      }

      const html5QrCode = new Html5Qrcode(qrRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleTokenSubmit(decodedText);
        },
        () => {
          // scanning frame, do nothing
        }
      );

      setScanning(true);
    } catch (err: unknown) {
      console.error("Camera scanner error:", err);
      setCameraError(
        "تعذر الوصول إلى الكاميرا. يرجى التحقق من إعطاء المتصفح إذن الكاميرا، أو استخدام الإدخال اليدوي."
      );
      setScanning(false);
    }
  }, [handleTokenSubmit]);

  useEffect(() => {
    // Start scanner automatically when on mobile/desktop with camera
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <div className="min-h-screen bg-[#080D1A] text-white flex flex-col justify-between">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-[#0B1121]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/dashboard/student"
            className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للوحة الطالب</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white">الماسح الضوئي الذكي للـ QR</span>
          </div>
        </div>
      </header>

      {/* Main scanner view */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full rounded-3xl border border-white/10 bg-[#0E1526]/90 p-6 shadow-2xl backdrop-blur-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>نظام تسجيل الحضور الأكاديمي</span>
          </div>

          <h2 className="text-xl font-black text-white">وجّه الكاميرا نحو رمز المحاضرة</h2>
          <p className="mt-1 text-xs text-white/50">
            سيتم التحقق من الرمز وتسجيل حضورك تلقائياً
          </p>

          {/* Scanner Viewport */}
          <div className="relative mt-6 overflow-hidden rounded-2xl border-2 border-dashed border-amber-400/50 bg-black/40 aspect-square flex items-center justify-center">
            <div id={qrRegionId} className="w-full h-full" />

            {/* Corner Markers */}
            <div className="absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
            <div className="absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-amber-400 pointer-events-none" />

            {/* Overlay if submitting */}
            {submitting && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 backdrop-blur-sm z-20">
                <RefreshCw className="h-8 w-8 text-amber-400 animate-spin" />
                <span className="text-xs font-bold text-white">جاري التحقق من الرمز وتسجيل الحضور...</span>
              </div>
            )}
          </div>

          {/* Camera Error banner */}
          {cameraError && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-200 text-right">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Scan result response alert */}
          {scanResult && (
            <div
              className={`mt-4 flex flex-col items-center gap-2 rounded-2xl p-5 text-center border animate-in zoom-in-95 ${
                scanResult.success
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                  : "border-rose-500/40 bg-rose-500/15 text-rose-200"
              }`}
            >
              {scanResult.success ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <strong className="text-base font-black text-white">{scanResult.message}</strong>
                  {scanResult.subjectName && (
                    <span className="text-xs text-emerald-300 font-bold">
                      مقرر: {scanResult.subjectName}
                    </span>
                  )}
                  <span className="text-[11px] text-white/50">توقيت التسجيل: {scanResult.time}</span>
                  <Link
                    href="/dashboard/student/attendance"
                    className="mt-2 text-xs font-bold underline text-amber-300"
                  >
                    استعراض سجل الحضور
                  </Link>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <strong className="text-sm font-bold text-white">{scanResult.message}</strong>
                  <button
                    onClick={startScanner}
                    className="mt-2 text-xs font-bold text-amber-300 underline"
                  >
                    إعادة المحاولة
                  </button>
                </>
              )}
            </div>
          )}

          {/* Controls: Restart or Manual Token input */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <button
              onClick={startScanner}
              disabled={scanning}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/80 hover:bg-white/10 transition disabled:opacity-40"
            >
              <Camera className="h-4 w-4" />
              <span>إعادة تشغيل الكاميرا</span>
            </button>

            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/80 hover:bg-white/10 transition"
            >
              <Keyboard className="h-4 w-4" />
              <span>إدخال كود يدوي</span>
            </button>
          </div>

          {/* Manual Token Input Accordion */}
          {showManualInput && (
            <div className="mt-4 border-t border-white/10 pt-4 text-right">
              <label className="block text-xs font-bold text-white/70 mb-1.5">
                أدخل رمز جلسة الحضور يدوياً (للتجربة أو في حال تعطل الكاميرا):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="csis_att_..."
                  dir="ltr"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => handleTokenSubmit(manualToken)}
                  disabled={submitting || !manualToken}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  تحقق
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-[11px] text-white/40">
        بوابة الحضور الذكي • مدينة الثقافة والعلوم
      </footer>
    </div>
  );
}
