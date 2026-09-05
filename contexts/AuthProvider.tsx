"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { auth, db } from "@/lib/firebase/client";
import { buildPendingProfile } from "@/lib/data/registry";
import { hasPermission } from "@/lib/rbac/permissions";
import { resolveUserProfile } from "@/lib/services/users";
import type { Permission, UserProfile, UserRole } from "@/types";

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: (role?: UserRole) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  can: (permission: Permission) => boolean;
  isStudent: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const requestedRoleRef = useRef<UserRole | undefined>(undefined);

  const loadProfile = useCallback(async (user: User) => {
    const email = user.email ?? `${user.uid}@unknown.local`;
    const requestedRole = requestedRoleRef.current;
    requestedRoleRef.current = undefined;
    try {
      const resolved = await resolveUserProfile(user.uid, email, requestedRole);
      setProfile(resolved);
    } catch (error) {
      console.error(error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setFirebaseUser(user);
          await loadProfile(user);
          return;
        }
        setFirebaseUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, [loadProfile]);

  const signInWithGoogle = useCallback(async (role?: UserRole) => {
    requestedRoleRef.current = role;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      throw new Error("ادخل بريد إلكتروني صحيح.");
    }
    if (password.length < 6) {
      throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
    }

    await signInWithEmailAndPassword(auth, normalized, password);
  }, []);

  const signUpWithEmail = useCallback(async (
    email: string,
    password: string,
    role: UserRole = "student",
  ) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      throw new Error("ادخل بريد إلكتروني صحيح.");
    }
    if (password.length < 6) {
      throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
    }

    requestedRoleRef.current = role;
    const result = await createUserWithEmailAndPassword(auth, normalized, password);
    const user = result.user;
    const profileDraft = buildPendingProfile(user.uid, normalized, role);
    await setDoc(doc(db, "users", user.uid), profileDraft);
    setFirebaseUser(user);
    setProfile(profileDraft);
  }, []);

  const logout = useCallback(async () => {
    setFirebaseUser(null);
    setProfile(null);
    await signOut(auth).catch(() => undefined);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (firebaseUser) await loadProfile(firebaseUser);
  }, [firebaseUser, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      refreshProfile,
      can: (permission) =>
        profile ? hasPermission(profile.role, permission) : false,
      isStudent: profile?.role === "student",
      isStaff: profile
        ? ["admin", "doctor", "ta"].includes(profile.role)
        : false,
    }),
    [
      firebaseUser,
      profile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
