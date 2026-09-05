import type { NewsItem, Subject } from "@/types";

export const SEED_SUBJECTS: Subject[] = [
  {
    id: "cs341",
    code: "CS 341",
    name: "نظم التشغيل",
    doctorId: "doctor-samy",
    doctorName: "د. أحمد سامي",
    taIds: ["ta-nour"],
    room: "B204",
    schedule: "الأحد 10:00 — 12:00",
  },
  {
    id: "cs202",
    code: "CS 202",
    name: "شبكات الحاسب",
    doctorId: "doctor-samy",
    doctorName: "د. أحمد سامي",
    taIds: ["ta-nour"],
    room: "A101",
    schedule: "الثلاثاء 14:00 — 16:00",
  },
  {
    id: "cs315",
    code: "CS 315",
    name: "تطوير تطبيقات الموبايل",
    doctorId: "doctor-marwa",
    doctorName: "د. مروة عبد الله",
    taIds: [],
    room: "C305",
    schedule: "الخميس 09:00 — 11:00",
  },
];

export const SEED_NEWS: Omit<NewsItem, "id">[] = [
  {
    authorId: "doctor-samy",
    authorName: "د. أحمد سامي",
    authorRole: "doctor",
    subjectId: "cs341",
    subjectName: "نظم التشغيل — CS 341",
    title: "تغيير قاعة المحاضرة",
    body: "محاضرة الأسبوع القادم لمادة نظم التشغيل هتتقدم لقاعة B204 بدل المدرج الرئيسي.",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    authorId: "ta-nour",
    authorName: "م. نور الدين",
    authorRole: "ta",
    subjectId: "cs202",
    subjectName: "شبكات الحاسب — CS 202",
    title: "سكشن الأسبوع الخامس",
    body: "تم رفع سكشن الأسبوع الخامس لمادة الشبكات، ومطلوب حل التمارين قبل السكشن القادم.",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    authorId: "doctor-marwa",
    authorName: "د. مروة عبد الله",
    authorRole: "doctor",
    subjectId: "cs315",
    subjectName: "تطوير تطبيقات الموبايل — CS 315",
    title: "درجات الميدتيرم",
    body: "درجات الميدتيرم اتحطت على البروفايل، ومكتبي مفتوح للمراجعة الخميس القادم.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
