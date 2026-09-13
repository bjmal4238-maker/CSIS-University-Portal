import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "csis-secret-key-2026-culture-science";
export const AUTH_COOKIE_NAME = "csis_auth_token";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  status: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "DOCTOR" | "TA" | "ADMIN";
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  avatarUrl?: string | null;
  phone?: string | null;
  departmentId?: string | null;
  department?: { id: string; name: string; code: string } | null;
  studentProfile?: {
    id: string;
    studentId: string;
    universityCode: string;
    academicYearId: string;
    academicYear: { id: string; name: string; code: string; level: number };
    gpa: number;
    totalCredits: number;
  } | null;
  facultyProfile?: {
    id: string;
    title?: string | null;
    officeRoom?: string | null;
    bio?: string | null;
  } | null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload, expiresIn: string = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || !payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        department: { select: { id: true, name: true, code: true } },
        studentProfile: {
          include: {
            academicYear: { select: { id: true, name: true, code: true, level: true } },
          },
        },
        facultyProfile: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as CurrentUser["role"],
      status: user.status as CurrentUser["status"],
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      departmentId: user.departmentId,
      department: user.department,
      studentProfile: user.studentProfile,
      facultyProfile: user.facultyProfile,
    };
  } catch {
    return null;
  }
}
