import type { StudyLevel, UserProfile, UserRole } from "@/types";

/** سجل الجامعة — يُستخدم لتحديد الدور فور أول تسجيل دخول */
export interface RegistryEntry {
  email: string;
  displayName: string;
  role: UserRole;
  studentId?: string;
  major?: string;
  year?: StudyLevel;
}

export const UNIVERSITY_REGISTRY: RegistryEntry[] = [
  {
    email: "marwa.abdullah@csis.edu.eg",
    displayName: "د. مروة عبد الله",
    role: "admin",
  },
  {
    email: "a.samy@csis.edu.eg",
    displayName: "د. أحمد سامي",
    role: "doctor",
  },
  {
    email: "n.eldeen@csis.edu.eg",
    displayName: "م. نور الدين",
    role: "ta",
  },
  {
    email: "sara.mahmoud@csis.edu.eg",
    displayName: "سارة محمود إبراهيم",
    role: "student",
    studentId: "21-01345",
    major: "Information Systems",
    year: "الفرقة الثالثة",
  },
  {
    email: "ahmed.m@csis.edu.eg",
    displayName: "أحمد محمد علي",
    role: "student",
    studentId: "CSIS-2024-0187",
    major: "Computer Science",
    year: "الفرقة الثانية",
  },
  {
    email: "omar.k@csis.edu.eg",
    displayName: "عمر خالد فتحي",
    role: "student",
    studentId: "21-00981",
    major: "Computer Science",
    year: "الفرقة الثالثة",
  },
];

export function lookupByEmail(email: string): RegistryEntry | undefined {
  const normalized = email.trim().toLowerCase();
  return UNIVERSITY_REGISTRY.find((entry) => entry.email === normalized);
}

export function buildProfileFromRegistry(
  uid: string,
  entry: RegistryEntry,
): UserProfile {
  const now = new Date().toISOString();
  return {
    uid,
    email: entry.email,
    displayName: entry.displayName,
    role: entry.role,
    studentId: entry.studentId,
    major: entry.major,
    year: entry.year,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

export function buildPendingProfile(
  uid: string,
  email: string,
  role: UserRole = "student",
): UserProfile {
  const now = new Date().toISOString();
  return {
    uid,
    email: email.toLowerCase(),
    displayName: email.split("@")[0],
    role,
    requestedRole: role,
    status: "pending",
    year: "الفرقة الأولى",
    createdAt: now,
    updatedAt: now,
  };
}
