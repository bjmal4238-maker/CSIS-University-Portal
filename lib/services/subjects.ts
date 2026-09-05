import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { SEED_SUBJECTS } from "@/lib/data/seed";
import type { Subject } from "@/types";

const SUBJECTS = "subjects";

export async function seedSubjectsIfEmpty(): Promise<void> {
  const snap = await getDocs(collection(db, SUBJECTS));
  if (!snap.empty) return;

  await Promise.all(
    SEED_SUBJECTS.map((subject) =>
      setDoc(doc(db, SUBJECTS, subject.id), subject),
    ),
  );
}

export async function listSubjects(): Promise<Subject[]> {
  try {
    await seedSubjectsIfEmpty();
  } catch {
    /* الطلاب لا يملكون صلاحية الـ seed */
  }
  const snap = await getDocs(collection(db, SUBJECTS));
  return snap.docs.map((d) => d.data() as Subject);
}

export async function getSubject(id: string): Promise<Subject | null> {
  const snap = await getDoc(doc(db, SUBJECTS, id));
  if (!snap.exists()) return null;
  return snap.data() as Subject;
}
