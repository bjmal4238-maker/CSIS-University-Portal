import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  increment,
  addDoc,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { AttendanceSession, AttendanceRecord } from "@/types";

const SESSIONS = "attendance_sessions";
const RECORDS = "attendance_records";

export const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 دقايق

export function buildQrPayload(sessionId: string, token: string): string {
  return JSON.stringify({
    v: 1,
    sessionId,
    token,
    issuedAt: Date.now(),
  });
}

function generateToken(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function createSession(
  data: Omit<
    AttendanceSession,
    | "id"
    | "currentToken"
    | "tokenExpiresAt"
    | "attendeeCount"
    | "startedAt"
    | "active"
  >,
): Promise<AttendanceSession> {
  const token = generateToken();
  const now = Date.now();
  const session: Omit<AttendanceSession, "id"> = {
    ...data,
    currentToken: token,
    tokenExpiresAt: now + TOKEN_TTL_MS,
    startedAt: new Date().toISOString(),
    attendeeCount: 0,
    active: true,
  };

  const docRef = await addDoc(collection(db, SESSIONS), session);
  return { id: docRef.id, ...session };
}

export async function getSession(sessionId: string): Promise<AttendanceSession | null> {
  const snap = await getDoc(doc(db, SESSIONS, sessionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as AttendanceSession;
}

export async function stopSession(sessionId: string): Promise<void> {
  await updateDoc(doc(db, SESSIONS, sessionId), { active: false });
}

export async function setSessionActive(
  sessionId: string,
  active: boolean,
): Promise<void> {
  await updateDoc(doc(db, SESSIONS, sessionId), { active });
}

export async function getDoctorSessions(
  doctorId: string,
  activeOnly = true,
): Promise<AttendanceSession[]> {
  const constraints: QueryConstraint[] = [where("doctorId", "==", doctorId)];
  if (activeOnly) constraints.push(where("active", "==", true));

  const q = query(collection(db, SESSIONS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceSession));
}

export async function getSessionRecords(
  sessionId: string,
): Promise<AttendanceRecord[]> {
  const snap = await getDocs(
    query(collection(db, RECORDS), where("sessionId", "==", sessionId)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord));
}

export async function listAllSessions(): Promise<AttendanceSession[]> {
  const snap = await getDocs(collection(db, SESSIONS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AttendanceSession);
}

export async function getStudentRecords(studentUid: string): Promise<AttendanceRecord[]> {
  const snap = await getDocs(
    query(collection(db, RECORDS), where("studentUid", "==", studentUid)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AttendanceRecord);
}

export async function markAttendance(
  sessionId: string,
  token: string,
  student: {
    uid: string;
    studentId: string;
    displayName: string;
    year?: AttendanceRecord["year"];
    major?: string;
  },
): Promise<{ ok: boolean; message: string }> {
  const session = await getSession(sessionId);
  if (!session) return { ok: false, message: "الجلسة غير موجودة" };
  if (!session.active) return { ok: false, message: "الجلسة غير نشطة" };
  if (session.currentToken !== token)
    return { ok: false, message: "الكود غير صحيح" };

  // Check if student already recorded
  const existing = await getDocs(
    query(
      collection(db, RECORDS),
      where("sessionId", "==", sessionId),
      where("studentUid", "==", student.uid),
    ),
  );
  if (!existing.empty)
    return { ok: false, message: "تم تسجيل حضورك مسبقاً" };

  // Record attendance
  await addDoc(collection(db, RECORDS), {
    sessionId,
    studentUid: student.uid,
    studentId: student.studentId,
    studentName: student.displayName,
    year: student.year,
    major: student.major,
    markedAt: new Date().toISOString(),
    tokenUsed: token,
  } satisfies Omit<AttendanceRecord, "id">);

  // Increment attendee count
  await updateDoc(doc(db, SESSIONS, sessionId), {
    attendeeCount: increment(1),
  });

  return { ok: true, message: `تم تسجيل الحضور — ${session.subjectName}` };
}

// Rotate token (called from doctor UI for dynamic QR refresh)
export async function rotateSessionToken(
  sessionId: string,
): Promise<AttendanceSession | null> {
  const session = await getSession(sessionId);
  if (!session || !session.active) return session;

  const newToken = generateToken();
  await updateDoc(doc(db, SESSIONS, sessionId), {
    currentToken: newToken,
    tokenExpiresAt: Date.now() + TOKEN_TTL_MS,
  });

  return { ...session, currentToken: newToken, tokenExpiresAt: Date.now() + TOKEN_TTL_MS };
}
