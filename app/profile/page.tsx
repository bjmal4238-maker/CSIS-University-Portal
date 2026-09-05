"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { updateUserProfile } from "@/lib/services/users";
import { uploadPortalFile } from "@/lib/services/storage";
import { MAJORS } from "@/lib/rbac/permissions";
import type { StudyLevel } from "@/types";

const STUDY_LEVELS: StudyLevel[] = [
  "الفرقة الأولى",
  "الفرقة الثانية",
  "الفرقة الثالثة",
  "الفرقة الرابعة",
];

export default function ProfilePage() {
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const isStudent = profile?.role === "student";

  const [displayName, setDisplayName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [major, setMajor] = useState<string>(MAJORS[0]);
  const [year, setYear] = useState<StudyLevel>("الفرقة الأولى");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName || "");
    setStudentId(profile.studentId || "");
    setMajor(profile.major || MAJORS[0]);
    setYear(profile.year || "الفرقة الأولى");
    setAvatarUrl(profile.avatarUrl || "");
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let nextAvatar = avatarUrl.startsWith("blob:") ? profile?.avatarUrl : avatarUrl;
      if (avatarFile) {
        nextAvatar = await uploadPortalFile(`avatars/${firebaseUser.uid}`, avatarFile);
      }

      await updateUserProfile(firebaseUser.uid, {
        displayName,
        studentId: isStudent ? studentId : profile?.studentId,
        major: isStudent ? major : profile?.major,
        year: isStudent ? year : profile?.year,
        avatarUrl: nextAvatar,
      });
      await refreshProfile();
      setMessage({ type: "success", text: "اتحفظت بياناتك على الحساب، وهتظهر للدكتور في كشوف الغياب." });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "تعذّر الحفظ. تأكد من تفعيل Storage في Firebase إن كنت ترفع صورة." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#1E293B]/80 p-8 shadow-2xl">
      <h1 className="text-2xl font-extrabold text-[var(--gold)]">الملف الشخصي</h1>
      <p className="mt-2 mb-8 border-b border-white/10 pb-6 text-sm text-white/55">
        الاسم والفرقة والتخصص هنا مش محليين على الجهاز — محفوظين على حسابك وبيظهروا في تقرير الغياب.
      </p>

      <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--gold)] bg-[#0F172A]"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="px-4 text-center text-sm font-bold text-white/50">رفع صورة</span>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-white/50">الاسم</label>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-[#0F172A] px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
            />
          </div>

          {isStudent && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-white/50">الرقم الجامعي</label>
              <input
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-[#0F172A] px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
              />
            </div>
          )}

          {isStudent && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-white/50">التخصص</label>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-[#0F172A] px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
              >
                {MAJORS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          )}

          {isStudent && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-white/50">الفرقة الدراسية</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value as StudyLevel)}
                className="w-full rounded-xl border border-gray-700 bg-[#0F172A] px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
              >
                {STUDY_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {message.text && (
          <div className={`rounded-xl p-4 text-center text-sm font-bold ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--gold)] py-3.5 font-extrabold text-[var(--ink)] disabled:opacity-50"
        >
          {loading ? "جارٍ الحفظ..." : "حفظ على الحساب"}
        </button>
      </form>
    </div>
  );
}
