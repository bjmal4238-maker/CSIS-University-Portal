export type UserRole = "STUDENT" | "DOCTOR" | "TA" | "ADMIN";
export type AccountStatus = "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "إدارة المعهد (Super Admin)",
  DOCTOR: "عضو هيئة تدريس (دكتور)",
  TA: "هيئة معاونة (معيد)",
  STUDENT: "طالب أكاديمي",
};

export const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  ADMIN: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  DOCTOR: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  TA: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  STUDENT: "bg-blue-500/15 text-blue-300 border-blue-500/30",
};

export const STATUS_LABELS: Record<AccountStatus, string> = {
  PENDING: "قيد المراجعة",
  ACTIVE: "نشط ومعتمد",
  REJECTED: "مرفوض",
  SUSPENDED: "معلّق / موقوف",
};

export const STATUS_BADGE_STYLES: Record<AccountStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  ACTIVE: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  REJECTED: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  SUSPENDED: "bg-red-500/15 text-red-300 border-red-500/30",
};

export function isStaff(role?: string): boolean {
  return role === "ADMIN" || role === "DOCTOR" || role === "TA";
}

export function isFaculty(role?: string): boolean {
  return role === "DOCTOR" || role === "TA";
}

export function isAdmin(role?: string): boolean {
  return role === "ADMIN";
}

export function isStudent(role?: string): boolean {
  return role === "STUDENT";
}
