"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser } from "@/lib/auth";
import type { UserProfile, UserRole, UserStatus, StudyLevel, Permission } from "@/types";

interface AuthContextType {
  user: CurrentUser | null;
  profile: UserProfile | null;
  firebaseUser: { uid: string; email: string } | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ redirectUrl: string }>;
  registerStudent: (data: Record<string, unknown>) => Promise<{ message: string }>;
  registerFaculty: (data: Record<string, unknown>) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  can: (permission: Permission) => boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  isTA: boolean;
  isFaculty: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "فشل تسجيل الدخول.");
    }

    await refreshUser();
    return { redirectUrl: data.redirectUrl || "/" };
  };

  const registerStudent = async (formData: Record<string, unknown>) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, role: "STUDENT" }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "فشل تسجيل الحساب.");
    }

    return { message: data.message };
  };

  const registerFaculty = async (formData: Record<string, unknown>) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "فشل تسجيل الحساب.");
    }

    return { message: data.message };
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const profile: UserProfile | null = user
    ? {
        uid: user.id,
        email: user.email,
        displayName: user.name,
        role: user.role.toLowerCase() as UserRole,
        status: (user.status.toLowerCase() === "rejected" ? "suspended" : user.status.toLowerCase()) as UserStatus,
        studentId: user.studentProfile?.studentId,
        year: (user.studentProfile?.academicYear?.name || undefined) as StudyLevel | undefined,
        major: user.department?.name,
        department: user.department?.name,
        createdAt: "",
        updatedAt: "",
      }
    : null;

  const value: AuthContextType = {
    user,
    profile,
    firebaseUser: user ? { uid: user.id, email: user.email } : null,
    loading,
    login,
    registerStudent,
    registerFaculty,
    logout,
    refreshUser,
    can: () => true,
    isAdmin: user?.role === "ADMIN",
    isDoctor: user?.role === "DOCTOR",
    isTA: user?.role === "TA",
    isFaculty: user?.role === "DOCTOR" || user?.role === "TA",
    isStudent: user?.role === "STUDENT",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
