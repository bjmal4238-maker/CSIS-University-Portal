export type UserRole = "admin" | "doctor" | "ta" | "student";

export type UserStatus = "active" | "pending" | "suspended";

export type StudyLevel =
  | "الفرقة الأولى"
  | "الفرقة الثانية"
  | "الفرقة الثالثة"
  | "الفرقة الرابعة";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  requestedRole?: UserRole;
  studentId?: string;
  major?: string;
  year?: StudyLevel;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  doctorId: string;
  doctorName: string;
  taIds: string[];
  room?: string;
  schedule?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentUid: string;
  subjectId: string;
  section: string;
  semester: string;
}

export interface NewsAttachment {
  name: string;
  url: string;
  type: "image" | "file";
}

export interface NewsComment {
  id: string;
  newsId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  body: string;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  subjectId?: string;
  subjectName?: string;
  title: string;
  body: string;
  excerpt?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  attachments?: NewsAttachment[];
  likes?: string[];
  createdAt: string;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  subjectName: string;
  section: string;
  room: string;
  doctorId: string;
  active: boolean;
  currentToken: string;
  tokenExpiresAt: number;
  startedAt: string;
  durationMinutes: number;
  attendeeCount: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentUid: string;
  studentId: string;
  studentName: string;
  year?: StudyLevel;
  major?: string;
  markedAt: string;
  tokenUsed: string;
}

export type Permission =
  | "platform.manage"
  | "users.read"
  | "users.write"
  | "users.assign_roles"
  | "profile.read_own"
  | "profile.write_own"
  | "profile.write_any"
  | "subjects.manage"
  | "subjects.read"
  | "news.read"
  | "news.write"
  | "news.write_own_subject"
  | "schedules.manage"
  | "schedules.read"
  | "attendance.session.create"
  | "attendance.session.manage"
  | "attendance.scan"
  | "attendance.report.read"
  | "grades.write";
