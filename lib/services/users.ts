import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  buildPendingProfile,
  buildProfileFromRegistry,
  lookupByEmail,
} from "@/lib/data/registry";
import type { UserProfile, UserRole } from "@/types";

const USERS = "users";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS, uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function resolveUserProfile(
  uid: string,
  email: string | null,
  requestedRole?: UserRole,
): Promise<UserProfile> {
  const existing = await getUserProfile(uid);
  if (existing) return existing;

  if (email) {
    const registry = lookupByEmail(email);
    if (registry) {
      const profile = buildProfileFromRegistry(uid, registry);
      await setDoc(doc(db, USERS, uid), profile);
      return profile;
    }
  }

  const pendingRole = requestedRole ?? "student";
  const pending = buildPendingProfile(
    uid,
    email ?? `${uid}@unknown.local`,
    pendingRole,
  );
  await setDoc(doc(db, USERS, uid), pending);
  return pending;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  const ref = doc(db, USERS, uid);
  const payload = { ...data, updatedAt: new Date().toISOString() };

  const exists = await getDoc(ref);
  if (!exists.exists()) {
    await setDoc(ref, { uid, status: "pending", role: "student", ...payload });
  } else {
    await updateDoc(ref, payload);
  }

  const updated = await getDoc(ref);
  return updated.data() as UserProfile;
}

export async function approveUser(
  uid: string,
  role: UserRole,
  status: UserProfile["status"] = "active",
): Promise<UserProfile> {
  return updateUserProfile(uid, { role, status });
}

export async function rejectUser(uid: string): Promise<UserProfile> {
  return updateUserProfile(uid, { status: "suspended" });
}

export async function listAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, USERS));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserProfile);
}

export async function listActiveStudents(): Promise<UserProfile[]> {
  const users = await listAllUsers();
  return users.filter((u) => u.role === "student" && u.status === "active");
}

export async function assignUserRole(
  uid: string,
  role: UserRole,
): Promise<UserProfile> {
  return updateUserProfile(uid, { role, status: "active" });
}

export async function findUserByEmail(
  email: string,
): Promise<UserProfile | null> {
  const q = query(
    collection(db, USERS),
    where("email", "==", email.toLowerCase()),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as UserProfile;
}

export async function saveOtpCode(email: string, code: string): Promise<void> {
  await setDoc(doc(db, "otp_codes", email.toLowerCase()), {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
    createdAt: new Date().toISOString(),
  });
}

export async function verifyOtpCode(
  email: string,
  code: string,
): Promise<boolean> {
  const snap = await getDoc(doc(db, "otp_codes", email.toLowerCase()));
  if (!snap.exists()) return false;
  const data = snap.data() as DocumentData;
  return data.code === code && data.expiresAt > Date.now();
}

export async function getRoleStats(): Promise<Record<UserRole, number>> {
  const users = await listAllUsers();
  return users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] ?? 0) + 1;
      return acc;
    },
    { admin: 0, doctor: 0, ta: 0, student: 0 } as Record<UserRole, number>,
  );
}

export { orderBy, query, collection, getDocs, limit };
