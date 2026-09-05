"use client";

import Link from "next/link";
import { InstituteMark } from "@/components/brand/InstituteMark";

const PROGRAMS = [
  {
    title: "علوم الحاسب",
    body: "برمجة، هياكل بيانات، شبكات، نظم تشغيل، وذكاء اصطناعي — مسار يؤهلك لهندسة البرمجيات وتطوير الأنظمة.",
  },
  {
    title: "نظم المعلومات",
    body: "قواعد البيانات، تحليل النظم، أمن المعلومات، وإدارة المشاريع — مسار يربط التقنية بإدارة المؤسسة.",
  },
];

const PILLARS = [
  { title: "حضور بالـ QR", body: "جلسة محاضرة حقيقية، كود يتجدد، وتسجيل يظهر فورًا في كشف الدكتور." },
  { title: "حساب بموافقة الإدارة", body: "طالب أو معيد أو دكتور لا يدخل البوابة إلا بعد اعتماد الأدمن." },
  { title: "أخبار أكاديمية", body: "إعلانات الدكاترة والمعيدين بالنص والصور والملفات داخل فيد منظم." },
  { title: "ملف شخصي معتمد", body: "الاسم والفرقة والتخصص يُحفظان على الحساب ويظهران في كشوف الغياب." },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <InstituteMark className="h-14 w-14" />
          <div>
            <p className="text-sm font-extrabold leading-tight">مدينة الثقافة والعلوم</p>
            <p className="text-[11px] text-white/55">المعهد العالي لعلوم الحاسب ونظم المعلومات</p>
          </div>
        </div>
        <Link
          href="/login"
          className="rounded-xl bg-[var(--gold)] px-5 py-2.5 text-sm font-extrabold text-[var(--ink)] shadow-[0_8px_24px_rgba(245,158,11,0.25)]"
        >
          دخول البوابة
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 px-6 py-12 shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:px-12 md:py-16">
          <p className="font-mono text-[11px] font-bold tracking-[0.25em] text-[var(--gold)]">
            CSIS PORTAL
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.25] md:text-6xl">
            بوابة حاسبات ومعلومات
            <span className="block text-[var(--gold)]">تليق بمعهدك، وجاهزة للشغل.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
            منصة أكاديمية للمعهد العالي لعلوم الحاسب ونظم المعلومات بمدينة الثقافة والعلوم:
            حضور، أخبار، ملفات، وصلاحيات حقيقية — مش أرقام ثابتة على الشاشة.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-[var(--gold)] px-6 py-3 text-sm font-extrabold text-[var(--ink)]"
            >
              ابدأ كطالب أو عضو هيئة تدريس
            </Link>
            <a
              href="https://csi.edu.eg/"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/15 px-6 py-3 text-sm font-bold text-white/80"
            >
              موقع مدينة الثقافة والعلوم
            </a>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {PROGRAMS.map((program) => (
            <article
              key={program.title}
              className="rounded-3xl border border-white/10 bg-[#0F172A]/70 p-7"
            >
              <p className="text-xs font-bold text-[var(--gold)]">قسم علمي</p>
              <h2 className="mt-2 text-2xl font-black">{program.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">{program.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-lg font-extrabold">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/60">{item.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
