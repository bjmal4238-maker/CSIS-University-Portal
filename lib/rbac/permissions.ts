import type { Permission, UserRole } from "@/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "إدارة المعهد",
  doctor: "دكتور",
  ta: "معيد",
  student: "طالب",
};

export const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  admin: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  doctor: "bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30",
  ta: "bg-teal-500/15 text-teal-300 border-teal-400/30",
  student: "bg-sky-500/15 text-sky-300 border-sky-400/30",
};

export const MAJORS = ["علوم الحاسب", "نظم المعلومات"] as const;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "platform.manage",
    "users.read",
    "users.write",
    "users.assign_roles",
    "profile.read_own",
    "profile.write_own",
    "profile.write_any",
    "subjects.manage",
    "subjects.read",
    "news.read",
    "news.write",
    "news.write_own_subject",
    "schedules.manage",
    "schedules.read",
    "attendance.session.create",
    "attendance.session.manage",
    "attendance.report.read",
    "grades.write",
  ],
  doctor: [
    "profile.read_own",
    "profile.write_own",
    "subjects.read",
    "news.read",
    "news.write_own_subject",
    "schedules.manage",
    "schedules.read",
    "attendance.session.create",
    "attendance.session.manage",
    "attendance.report.read",
    "grades.write",
  ],
  ta: [
    "profile.read_own",
    "profile.write_own",
    "subjects.read",
    "news.read",
    "news.write_own_subject",
    "schedules.read",
    "attendance.session.create",
    "attendance.session.manage",
    "attendance.report.read",
  ],
  student: [
    "profile.read_own",
    "profile.write_own",
    "subjects.read",
    "news.read",
    "schedules.read",
    "attendance.scan",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccessRoute(role: UserRole, path: string): boolean {
  const rules: { prefix: string; permission: Permission }[] = [
    { prefix: "/admin", permission: "platform.manage" },
    { prefix: "/attendance/session", permission: "attendance.session.create" },
    { prefix: "/attendance/report", permission: "attendance.report.read" },
    { prefix: "/attendance/scan", permission: "attendance.scan" },
    { prefix: "/news/create", permission: "news.write_own_subject" },
  ];

  for (const rule of rules) {
    if (path.startsWith(rule.prefix)) {
      return hasPermission(role, rule.permission);
    }
  }

  return true;
}
