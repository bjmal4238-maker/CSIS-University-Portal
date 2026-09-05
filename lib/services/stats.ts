import { listAllSessions, getStudentRecords } from "./attendance";
import { listNews } from "./news";
import { listSubjects } from "./subjects";
import { listAllUsers } from "./users";

export async function getStudentDashboardStats(uid: string) {
  const [records, sessions, subjects, news] = await Promise.all([
    getStudentRecords(uid),
    listAllSessions(),
    listSubjects(),
    listNews(),
  ]);

  const finishedSessions = sessions.filter((s) => !s.active || s.attendeeCount >= 0);
  const rate = finishedSessions.length
    ? Math.round((records.length / finishedSessions.length) * 100)
    : 0;

  return {
    attendanceRate: Math.min(100, rate),
    presentCount: records.length,
    sessionCount: sessions.length,
    subjectCount: subjects.length,
    newsCount: news.length,
  };
}

export async function getStaffDashboardStats() {
  const [users, subjects, sessions, news] = await Promise.all([
    listAllUsers(),
    listSubjects(),
    listAllSessions(),
    listNews(),
  ]);

  const students = users.filter((u) => u.role === "student" && u.status === "active");
  const pending = users.filter((u) => u.status === "pending");
  const totalPresent = sessions.reduce((sum, s) => sum + (s.attendeeCount || 0), 0);
  const expected = students.length * Math.max(sessions.length, 1);
  const attendanceRate = expected ? Math.round((totalPresent / expected) * 100) : 0;

  return {
    studentCount: students.length,
    pendingCount: pending.length,
    subjectCount: subjects.length,
    sessionCount: sessions.length,
    newsCount: news.length,
    attendanceRate: Math.min(100, attendanceRate),
  };
}
