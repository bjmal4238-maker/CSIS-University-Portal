"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "@/contexts/AuthProvider";
import { markAttendance } from "@/lib/services/attendance";
import { QrCode, CheckCircle, XCircle } from "lucide-react";

export default function StudentScanPage() {
  const { firebaseUser, profile } = useAuth();
  const [status, setStatus] = useState<"scanning" | "success" | "error">("scanning");
  const [msg, setMsg] = useState("");

  const handleScan = async (scannedText: string) => {
    if (!firebaseUser || !profile) return;

    try {
      const payload = JSON.parse(scannedText) as { sessionId?: string; token?: string };

      if (!payload.sessionId || !payload.token) {
        setStatus("error");
        setMsg("كود غير صالح.");
        return;
      }

      const result = await markAttendance(payload.sessionId, payload.token, {
        uid: firebaseUser.uid,
        studentId: profile.studentId || "N/A",
        displayName: profile.displayName || "غير مسجل",
        year: profile.year,
        major: profile.major,
      });

      if (result.ok) {
        setStatus("success");
        setMsg(result.message);
      } else {
        setStatus("error");
        setMsg(result.message);
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMsg("كود غير صالح أو حدث خطأ في الاتصال.");
    }
  };

  useEffect(() => {
    if (status !== "scanning") return;

    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scanner.render(
      (decodedText) => {
        scanner.clear();
        handleScan(decodedText);
      },
      () => {},
    );

    return () => { scanner.clear().catch((e) => console.log(e)); };
  }, [status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="max-w-md w-full bg-[#1E293B]/80 border border-gray-700 rounded-3xl p-6 shadow-2xl text-center">
        <div className="mx-auto w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center border border-[var(--gold)] mb-4">
          <QrCode className="text-[var(--gold)] w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">تسجيل الحضور</h1>

        {status === "scanning" && (
          <div className="overflow-hidden rounded-2xl border-2 border-[var(--gold)] p-2 bg-black/50 mt-4">
            <div id="reader" className="w-full bg-black rounded-xl"></div>
          </div>
        )}

        {status === "success" && (
          <div className="bg-[#4CD08A]/10 border border-[#4CD08A]/30 p-6 rounded-2xl flex flex-col items-center mt-4">
            <CheckCircle className="text-[#4CD08A] w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold text-[#4CD08A]">{msg}</h3>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex flex-col items-center mt-4">
            <XCircle className="text-red-400 w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold text-red-400">فشل التسجيل</h3>
            <p className="text-sm text-gray-300 mt-2">{msg}</p>
            <button onClick={() => setStatus("scanning")} className="mt-4 px-6 py-2 bg-[var(--gold)] text-[#0B1121] rounded-xl font-bold">
              إعادة المحاولة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}