import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { SEED_NEWS } from "@/lib/data/seed";
import type { NewsComment, NewsItem } from "@/types";

const NEWS = "news";

export async function seedNewsIfEmpty(): Promise<void> {
  const snap = await getDocs(collection(db, NEWS));
  if (!snap.empty) return;

  await Promise.all(
    SEED_NEWS.map((item) => addDoc(collection(db, NEWS), { ...item, likes: [] })),
  );
}

export async function listNews(): Promise<NewsItem[]> {
  try {
    await seedNewsIfEmpty();
  } catch {
    /* الطلاب لا يملكون صلاحية الـ seed */
  }
  const q = query(collection(db, NEWS), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Omit<NewsItem, "id">;
    return { ...data, id: d.id, likes: data.likes ?? [] };
  });
}

export async function createNews(
  item: Omit<NewsItem, "id" | "createdAt" | "likes">,
): Promise<void> {
  await addDoc(collection(db, NEWS), {
    ...item,
    likes: [],
    createdAt: new Date().toISOString(),
  });
}

export async function toggleNewsLike(newsId: string, uid: string, liked: boolean) {
  await updateDoc(doc(db, NEWS, newsId), {
    likes: liked ? arrayRemove(uid) : arrayUnion(uid),
  });
}

export async function listNewsComments(newsId: string): Promise<NewsComment[]> {
  const snap = await getDocs(
    query(collection(db, NEWS, newsId, "comments"), orderBy("createdAt", "asc")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as NewsComment);
}

export async function addNewsComment(
  newsId: string,
  comment: Omit<NewsComment, "id" | "newsId" | "createdAt">,
): Promise<void> {
  await addDoc(collection(db, NEWS, newsId, "comments"), {
    ...comment,
    newsId,
    createdAt: new Date().toISOString(),
  });
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "أمس";
  return `منذ ${days} أيام`;
}
