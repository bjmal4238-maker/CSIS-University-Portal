"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { ROLE_BADGE_CLASS, ROLE_LABELS } from "@/lib/rbac/permissions";
import {
  addNewsComment,
  createNews,
  formatRelativeTime,
  listNews,
  listNewsComments,
  toggleNewsLike,
} from "@/lib/services/news";
import { uploadPortalFile } from "@/lib/services/storage";
import { listSubjects } from "@/lib/services/subjects";
import type { NewsComment, NewsItem, Subject, UserRole } from "@/types";

function rolePrefix(role: UserRole) {
  if (role === "doctor" || role === "admin") return "د.";
  if (role === "ta") return "م.";
  return "";
}

export default function NewsPage() {
  const { profile, can } = useAuth();
  const canPost = can("news.write") || can("news.write_own_subject");

  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [body, setBody] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [openComments, setOpenComments] = useState<Record<string, NewsComment[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId],
  );

  async function refresh() {
    const items = await listNews();
    setPosts(items);
  }

  useEffect(() => {
    void refresh().catch(console.error);
    listSubjects().then(setSubjects).catch(console.error);
  }, []);

  async function handlePublish() {
    if (!profile || !body.trim()) return;
    setBusy(true);
    try {
      let imageUrl: string | undefined;
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      if (imageFile) imageUrl = await uploadPortalFile(`news/${profile.uid}`, imageFile);
      if (docFile) {
        fileUrl = await uploadPortalFile(`news/${profile.uid}`, docFile);
        fileName = docFile.name;
      }
      await createNews({
        authorId: profile.uid,
        authorName: profile.displayName,
        authorRole: profile.role,
        subjectId: selectedSubject?.id,
        subjectName: selectedSubject ? `${selectedSubject.name} — ${selectedSubject.code}` : undefined,
        title: body.trim().slice(0, 80),
        body: body.trim(),
        imageUrl,
        fileUrl,
        fileName,
      });
      setBody("");
      setImageFile(null);
      setDocFile(null);
      await refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  }

  async function handleLike(post: NewsItem) {
    if (!profile) return;
    const liked = post.likes?.includes(profile.uid) ?? false;
    await toggleNewsLike(post.id, profile.uid, liked);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likes: liked
                ? (p.likes ?? []).filter((id) => id !== profile.uid)
                : [...(p.likes ?? []), profile.uid],
            }
          : p,
      ),
    );
  }

  async function toggleComments(newsId: string) {
    if (openComments[newsId]) {
      setOpenComments((prev) => {
        const next = { ...prev };
        delete next[newsId];
        return next;
      });
      return;
    }
    const comments = await listNewsComments(newsId);
    setOpenComments((prev) => ({ ...prev, [newsId]: comments }));
  }

  async function submitComment(newsId: string) {
    if (!profile) return;
    const text = drafts[newsId]?.trim();
    if (!text) return;
    await addNewsComment(newsId, {
      authorId: profile.uid,
      authorName: profile.displayName,
      authorRole: profile.role,
      body: text,
    });
    const comments = await listNewsComments(newsId);
    setOpenComments((prev) => ({ ...prev, [newsId]: comments }));
    setDrafts((prev) => ({ ...prev, [newsId]: "" }));
  }

  async function sharePost(post: NewsItem) {
    const url = `${window.location.origin}/news#${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-black text-[var(--gold)]">الأخبار الأكاديمية</h1>

      {canPost && (
        <div className="mb-8 rounded-3xl border border-[var(--gold)]/25 bg-[#1E293B]/80 p-5">
          <p className="mb-3 text-sm text-white/50">
            سيظهر المنشور باسم {rolePrefix(profile?.role ?? "doctor")} {profile?.displayName} — {ROLE_LABELS[profile?.role ?? "doctor"]}
          </p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="اكتب إعلانًا للطلاب... نص، صورة، أو ملف محاضرة."
            className="min-h-[110px] w-full resize-none rounded-xl border border-gray-700 bg-[#0F172A] p-4 text-sm outline-none focus:border-[var(--gold)]"
          />
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="mt-3 w-full rounded-xl border border-gray-700 bg-[#0F172A] px-3 py-2 text-sm"
          >
            <option value="">بدون ربط بمادة</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              <label className="cursor-pointer rounded-lg bg-gray-800 p-2 text-gray-300">
                <ImageIcon className="h-5 w-5" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              </label>
              <label className="cursor-pointer rounded-lg bg-gray-800 p-2 text-gray-300">
                <FileText className="h-5 w-5" />
                <input type="file" className="hidden" onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
              </label>
              <span className="self-center text-[11px] text-white/40">
                {imageFile?.name || docFile?.name || ""}
              </span>
            </div>
            <button
              type="button"
              disabled={busy || !body.trim()}
              onClick={() => void handlePublish()}
              className="flex items-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-2 font-bold text-[var(--ink)] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              نشر
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {posts.map((post) => {
          const liked = profile ? post.likes?.includes(profile.uid) : false;
          return (
            <article id={post.id} key={post.id} className="rounded-2xl border border-white/10 bg-[#1E293B]/70 p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--gold)] bg-[#0F172A] text-sm font-black text-[var(--gold)]">
                  {rolePrefix(post.authorRole) || post.authorName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold">
                      {rolePrefix(post.authorRole)} {post.authorName}
                    </h3>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${ROLE_BADGE_CLASS[post.authorRole]}`}>
                      {ROLE_LABELS[post.authorRole]}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">
                    نشر {formatRelativeTime(post.createdAt)}
                    {post.subjectName ? ` • ${post.subjectName}` : ""}
                  </p>
                </div>
              </div>

              <p className="mb-4 text-sm leading-7 text-white/85">{post.body}</p>
              {post.imageUrl && (
                <img src={post.imageUrl} alt="" className="mb-4 max-h-80 w-full rounded-xl object-cover" />
              )}
              {post.fileUrl && (
                <a href={post.fileUrl} target="_blank" rel="noreferrer" className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-[var(--gold)]">
                  <FileText className="h-4 w-4" />
                  {post.fileName || "تحميل الملف"}
                </a>
              )}

              <div className="flex items-center gap-2 border-t border-white/10 pt-3">
                <button type="button" onClick={() => void handleLike(post)} className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold ${liked ? "text-red-400" : "text-white/50"}`}>
                  <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                  {post.likes?.length ?? 0}
                </button>
                <button type="button" onClick={() => void toggleComments(post.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold text-white/50">
                  <MessageCircle className="h-4 w-4" />
                  تعليق
                </button>
                <button type="button" onClick={() => void sharePost(post)} className="flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold text-white/50">
                  <Share2 className="h-4 w-4" />
                  مشاركة
                </button>
              </div>

              {openComments[post.id] && (
                <div className="mt-3 space-y-2">
                  {openComments[post.id].map((comment) => (
                    <div key={comment.id} className="rounded-xl bg-[#0F172A] px-3 py-2 text-sm">
                      <span className="font-bold text-[var(--gold)]">{comment.authorName}</span>
                      <span className="text-white/40"> • {ROLE_LABELS[comment.authorRole]}</span>
                      <p className="mt-1 text-white/80">{comment.body}</p>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={drafts[post.id] ?? ""}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="اكتب تعليقًا..."
                      className="flex-1 rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-sm"
                    />
                    <button type="button" onClick={() => void submitComment(post.id)} className="rounded-xl bg-[var(--gold)] px-3 text-sm font-bold text-[var(--ink)]">
                      إرسال
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
