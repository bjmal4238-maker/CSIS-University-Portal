"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { listSubjects } from "@/lib/services/subjects";
import {
  createSession,
  stopSession,
  rotateSessionToken,
  buildQrPayload,
  TOKEN_TTL_MS,
} from "@/lib/services/attendance";
import type { Subject, AttendanceSession } from "@/types";
import { Clock, Users, ShieldAlert, Book } from "lucide-react";

export default function DoctorSessionPage() {
  const { profile } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [countdown, setCountdown] = useState(600); // 600 ثانية = 10 دقايق
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    listSubjects().then(setSubjects).catch(console.error);
  }, []);

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  const toggleSession = useCallback(async () => {
    if (!profile) return;

    if (!session) {
      if (!selectedSubject) return;
      const newSession = await createSession({
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        section: "الشعبة الرئيسية",
        room: selectedSubject.room || "غير محدد",
        doctorId: profile.uid,
        durationMinutes: 60,
      });
      setSession(newSession);
      setCountdown(600);
    } else {
      await stopSession(session.id);
      setSession(null);
      setAttendanceCount(0);
    }
  }, [profile, session, selectedSubject]);

  // تدوير التوكن كل 10 دقايق
  useEffect(() => {
    if (!session) return;
    let timer: NodeJS.Timeout;

    timer = setInterval(async () => {
      setCountdown((prev) => {
        if (prev <= 1) {
          rotateSessionToken(session.id)
            .then((updated) => updated && setSession(updated))
            .catch(console.error);
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.id]);

  // متابعة حية لعدد الطلاب الحاضرين
  useEffect(() => {
    if (!session) return;
    const q = query(
      collection(db, "attendance_records"),
      where("sessionId", "==", session.id),
    );
    const unsubscribe = onSnapshot(q, (snap) => setAttendanceCount(snap.size));
    return () => unsubscribe();
  }, [session?.id]);

  const qrValue = useMemo(
    () => (session ? buildQrPayload(session.id, session.currentToken) : ""),
    [session?.id, session?.currentToken],
  );

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-[var(--gold)] mb-6">إدارة جلسة الحضور بالـ QR</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E293B]/80 border border-gray-700 rounded-3xl p-6 shadow-xl flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-white">إعدادات الجلسة</h2>
          <div className="mb-4">
            <label className="text-xs text-gray-400 flex items-center gap-2 mb-2">
              <Book className="w-4 h-4" /> اختر المادة
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={!!session}
              className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--gold)] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">اختر مادة...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <button
            onClick={toggleSession}
            disabled={!subjectId && !session}
            className={`w-full mt-auto py-3 rounded-xl font-extrabold transition-all disabled:bg-gray-600 disabled:cursor-not-allowed ${
              session ? "bg-red-500 text-white" : "bg-[var(--gold)] text-[#0B1121]"
            }`}
          >
            {session ? "إنهاء الجلسة" : "بدء الجلسة وعرض الـ QR"}
          </button>

          {session && (
            <div className="mt-6 flex items-center gap-3 bg-[#0F172A] p-4 rounded-xl border border-gray-700">
              <Users className="text-[var(--gold)] w-6 h-6" />
              <div>
                <p className="text-xs text-gray-400">الطلاب الذين سجلوا الحضور (Live)</p>
                <p className="text-xl font-bold text-[#4CD08A]">{attendanceCount}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#1E293B]/80 border border-gray-700 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
          {!session ? (
            <div className="text-center text-gray-500">
              <ShieldAlert className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>الجلسة غير نشطة حالياً.</p>
            </div>
          ) : (
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-2 mb-4 text-[var(--gold)] font-mono text-xl font-bold">
                <Clock className="w-5 h-5 animate-pulse" />
                يتغير خلال: {String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}
              </div>
              <div className="bg-white p-4 rounded-2xl inline-block mx-auto shadow-[0_0_30px_rgba(216,169,62,0.4)]">
                <QRCodeCanvas
                  value={qrValue}
                  size={220}
                  bgColor={"#ffffff"}
                  fgColor={"#0B1121"}
                  level={"H"}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}