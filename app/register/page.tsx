"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";
import {
  GraduationCap,
  UserCheck,
  Briefcase,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Hash,
  ArrowLeft,
  Phone,
} from "lucide-react";

type RoleType = "STUDENT" | "DOCTOR" | "TA";

interface AcademicYear {
  id: string;
  name: string;
  code: string;
  level: number;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function RegisterPage() {
  const { registerStudent, registerFaculty } = useAuth();

  const [selectedRole, setSelectedRole] = useState<RoleType>("STUDENT");
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Common Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [phone, setPhone] = useState("");

  // Student specific fields
  const [studentId, setStudentId] = useState("");
  const [universityCode, setUniversityCode] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");

  // Faculty specific fields
  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [officeRoom, setOfficeRoom] = useState("");

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch academic years and departments from DB
  useEffect(() => {
    async function loadMeta() {
      try {
        const [yearsRes, deptRes] = await Promise.all([
          fetch("/api/academic-years"),
          fetch("/api/departments"),
        ]);
        if (yearsRes.ok) {
          const data = await yearsRes.json();
          setYears(data.years || []);
          if (data.years?.length > 0) setAcademicYearId(data.years[0].id);
        }
        if (deptRes.ok) {
          const data = await deptRes.json();
          setDepartments(data.departments || []);
          if (data.departments?.length > 0) setDepartmentId(data.departments[0].id);
        }
      } catch (err) {
        console.error("Meta load error:", err);
      } finally {
        setLoadingMeta(false);
      }
    }
    loadMeta();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب ألا تقل عن 6 أحرف.");
      return;
    }

    setLoading(true);

    try {
      if (selectedRole === "STUDENT") {
        if (!studentId || !universityCode || !academicYearId) {
          throw new Error("يرجى إكمال بيانات الرقم الأكاديمي والفرقة الدراسية.");
        }
        const res = await registerStudent({
          name,
          email,
          password,
          studentId,
          universityCode,
          academicYearId,
          departmentId: departmentId || undefined,
          phone: phone || undefined,
        });
        setSuccessMessage(res.message);
      } else {
        if (!departmentId) {
          throw new Error("يرجى اختيار القسم العلمي.");
        }
        const res = await registerFaculty({
          role: selectedRole,
          name,
          email,
          password,
          departmentId,
          title: title || undefined,
          specialty: specialty || undefined,
          officeRoom: officeRoom || undefined,
          phone: phone || undefined,
        });
        setSuccessMessage(res.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("تعذر إنشاء الحساب. يرجى التحقق من البيانات.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#0B1121] via-[#0F172A] to-[#050914] text-white">
      {/* Header */}
      <header className="mx-auto w-full max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-85">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0F172A]">
              <span className="text-base font-black text-amber-400">CSI</span>
            </div>
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white">مدينة الثقافة والعلوم</h1>
            <p className="text-[11px] text-white/55">المعهد العالي لعلوم الحاسب ونظم المعلومات</p>
          </div>
        </Link>

        <Link
          href="/login"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/80 hover:bg-white/10 transition"
        >
          <span>تسجيل الدخول</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-8">
        <div className="w-full rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
          {/* Header text */}
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-2xl font-black text-white sm:text-3xl">إنشاء حساب جديد</h2>
            <p className="mt-1 text-xs text-white/50">
              اختر نوع الحساب وأدخل بياناتك للانضمام إلى البوابة الأكاديمية
            </p>
          </div>

          {/* Success Screen */}
          {successMessage ? (
            <div className="mt-8 mx-auto max-w-md text-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 animate-in fade-in zoom-in-95">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-black text-white">تم التسجيل بنجاح</h3>
              <p className="mt-2 text-xs text-emerald-200/80 leading-relaxed">
                {successMessage}
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110"
                >
                  <span>التوجه لصفحة تسجيل الدخول</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Role Selection Tabs (Student, Doctor, TA) - No Admin */}
              <div className="mt-8 grid grid-cols-3 gap-2.5 sm:gap-4 max-w-xl mx-auto">
                <button
                  type="button"
                  onClick={() => setSelectedRole("STUDENT")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition text-center ${
                    selectedRole === "STUDENT"
                      ? "border-amber-500 bg-amber-500/15 text-amber-300 shadow-lg shadow-amber-500/10"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <GraduationCap className="h-5 w-5" />
                  <span className="text-xs font-bold">طالب أكاديمي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("DOCTOR")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition text-center ${
                    selectedRole === "DOCTOR"
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/10"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <UserCheck className="h-5 w-5" />
                  <span className="text-xs font-bold">عضو هيئة تدريس</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("TA")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition text-center ${
                    selectedRole === "TA"
                      ? "border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-lg shadow-cyan-500/10"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Briefcase className="h-5 w-5" />
                  <span className="text-xs font-bold">هيئة معاونة (معيد)</span>
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-200 max-w-xl mx-auto">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-2xl mx-auto">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">
                      الاسم رباعي (كما في السجلات الأكاديمية)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: أحمد محمد علي إبراهيم"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400"
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    </div>
                  </div>

                  {/* Academic Email */}
                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">
                      البريد الأكاديمي أو الشخصي
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@csis.edu.eg"
                        dir="ltr"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        dir="ltr"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        dir="ltr"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    </div>
                  </div>
                </div>

                {/* Phone Number (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    رقم الهاتف المحمول (اختياري)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  </div>
                </div>

                {/* Role Specific Fields: STUDENT */}
                {selectedRole === "STUDENT" && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          الرقم الأكاديمي (Student ID)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="مثال: 20241001"
                            dir="ltr"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400"
                          />
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          كود الجامعة / المعهد (University Code)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={universityCode}
                            onChange={(e) => setUniversityCode(e.target.value)}
                            placeholder="مثال: CSI-24-001"
                            dir="ltr"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400"
                          />
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          الفرقة الدراسية
                        </label>
                        <div className="relative">
                          <select
                            required
                            value={academicYearId}
                            onChange={(e) => setAcademicYearId(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#0B1121] px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                          >
                            {years.map((y) => (
                              <option key={y.id} value={y.id}>
                                {y.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          القسم العلمي
                        </label>
                        <div className="relative">
                          <select
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#0B1121] px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                          >
                            <option value="">(عام / لم يتم التحديد بعد)</option>
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.code})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Role Specific Fields: DOCTOR / TA */}
                {(selectedRole === "DOCTOR" || selectedRole === "TA") && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          القسم الأكاديمي
                        </label>
                        <select
                          required
                          value={departmentId}
                          onChange={(e) => setDepartmentId(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0B1121] px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-400"
                        >
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          اللقب أو الدرجة العلمية
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder={selectedRole === "DOCTOR" ? "أستاذ مشارك / مدرس" : "معيد / مدرس مساعد"}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          التخصص الأكاديمي الدقيق
                        </label>
                        <input
                          type="text"
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          placeholder="مثال: هندسة البرمجيات، قواعد البيانات، الذكاء الاصطناعي"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-1.5">
                          رقم المكتب أو القاعة
                        </label>
                        <input
                          type="text"
                          value={officeRoom}
                          onChange={(e) => setOfficeRoom(e.target.value)}
                          placeholder="مثال: مبنى د - غرفة 204"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || loadingMeta}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    <span className="text-slate-950 font-black text-sm">تأكيد تسجيل الحساب</span>
                  )}
                </button>

                <p className="text-[11px] text-white/40 text-center leading-relaxed">
                  ملاحظة أمنية: تخضع جميع الحسابات المسجلة لمراجعة واعتماد إدارة المعهد قبل تفعيل الصلاحيات.
                </p>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-[11px] text-white/40">
        © {new Date().getFullYear()} المعهد العالي لعلوم الحاسب ونظم المعلومات - مدينة الثقافة والعلوم
      </footer>
    </div>
  );
}
