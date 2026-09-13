"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import {
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Layers,
  BookOpen,
  Calendar,
  MessageSquare,
  Settings,
  Activity,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Plus,
  Search,
  Power,
  LogOut,
  Save,
} from "lucide-react";

type AdminTab =
  | "overview"
  | "pending"
  | "students"
  | "faculty"
  | "departments"
  | "subjects"
  | "schedules"
  | "posts"
  | "settings"
  | "audit";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string | null;
  createdAt: string;
  departmentId?: string | null;
  newPassword?: string;
  department?: { id: string; name: string; code: string } | null;
  studentProfile?: {
    id?: string;
    studentId?: string;
    universityCode?: string;
    academicYearId?: string;
    academicYear?: { id: string; name: string; code: string; level: number } | null;
    gpa?: number;
    totalCredits?: number;
  } | null;
  facultyProfile?: {
    id?: string;
    title?: string | null;
    officeRoom?: string | null;
    specialty?: string | null;
  } | null;
}

interface SubjectRecord {
  id: string;
  name: string;
  code: string;
  creditHours: number;
  departmentId: string;
  academicYearId: string;
  doctorId?: string | null;
  taId?: string | null;
  department?: { id: string; name: string; code: string } | null;
  academicYear?: { id: string; name: string; code: string } | null;
  doctor?: { id: string; name: string } | null;
  ta?: { id: string; name: string } | null;
}

interface ScheduleRecord {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
  subjectId: string;
  departmentId: string;
  academicYearId: string;
  doctorId?: string | null;
  taId?: string | null;
  subject?: { name: string; code: string };
  department?: { name: string };
  academicYear?: { name: string };
  doctor?: { name: string } | null;
  ta?: { name: string } | null;
}

interface PostRecord {
  id: string;
  title?: string | null;
  content: string;
  linkUrl?: string | null;
  imageUrl?: string | null;
  isPinned: boolean;
  allowComments: boolean;
  allowReactions: boolean;
  createdAt: string;
  author: { id: string; name: string; role: string };
  subject?: { id: string; name: string } | null;
  _count: { comments: number; reactions: number };
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; name: string; role: string };
  }>;
}

interface AuditLogRecord {
  id: string;
  action: string;
  targetType: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  actor?: { id: string; name: string; email: string; role: string } | null;
  target?: { id: string; name: string; email: string; role: string } | null;
}

interface SiteSettingsRecord {
  id?: string;
  instituteName?: string;
  shortName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  estimatedEndTime?: string | null;
}

export default function SuperAdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Overview data
  const [overview, setOverview] = useState<{
    metrics: Record<string, number>;
    charts: {
      studentsByYear: Array<{ name: string; level: number; count: number }>;
      studentsByDept: Array<{ name: string; code: string; count: number }>;
      recentSessions: Array<{
        id: string;
        subject: { name: string };
        creator: { name: string };
        _count: { records: number };
      }>;
    };
  } | null>(null);

  // Common Academic Meta
  const [years, setYears] = useState<Array<{ id: string; name: string; level: number }>>([]);
  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string; code: string; headOfDepartment?: string | null }>
  >([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);

  // Tab Specific Data
  const [pendingUsers, setPendingUsers] = useState<UserRecord[]>([]);
  const [students, setStudents] = useState<UserRecord[]>([]);
  const [facultyList, setFacultyList] = useState<UserRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRecord | null>(null);

  // Search & Filters
  const [studentSearch, setStudentSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Modals & Forms
  const [editingStudent, setEditingStudent] = useState<UserRecord | null>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    creditHours: 3,
    departmentId: "",
    academicYearId: "",
    doctorId: "",
    taId: "",
  });

  const [showAddDept, setShowAddDept] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", code: "", headOfDepartment: "" });

  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    subjectId: "",
    departmentId: "",
    academicYearId: "",
    doctorId: "",
    taId: "",
    dayOfWeek: "Saturday",
    startTime: "09:00",
    endTime: "10:30",
    room: "مدرج 1",
    type: "LECTURE",
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load All Primary Data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        overRes,
        yrsRes,
        deptsRes,
        subsRes,
        pendRes,
        stusRes,
        facRes,
        schedRes,
        postsRes,
        settRes,
        logsRes,
      ] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/academic-years"),
        fetch("/api/departments"),
        fetch("/api/subjects"),
        fetch("/api/admin/users?status=PENDING"),
        fetch("/api/admin/users?role=STUDENT"),
        fetch("/api/admin/users?role=ALL"),
        fetch("/api/schedules"),
        fetch("/api/posts"),
        fetch("/api/settings"),
        fetch("/api/admin/audit-logs"),
      ]);

      if (overRes.ok) setOverview(await overRes.json());
      if (yrsRes.ok) {
        const d = await yrsRes.json();
        setYears(d.years || []);
        if (d.years?.length > 0) {
          setNewSubject((p) => ({ ...p, academicYearId: d.years[0].id }));
          setNewSchedule((p) => ({ ...p, academicYearId: d.years[0].id }));
        }
      }
      if (deptsRes.ok) {
        const d = await deptsRes.json();
        setDepartments(d.departments || []);
        if (d.departments?.length > 0) {
          setNewSubject((p) => ({ ...p, departmentId: d.departments[0].id }));
          setNewDept((p) => ({ ...p, departmentId: d.departments[0].id }));
          setNewSchedule((p) => ({ ...p, departmentId: d.departments[0].id }));
        }
      }
      if (subsRes.ok) {
        const d = await subsRes.json();
        setSubjects(d.subjects || []);
        if (d.subjects?.length > 0) {
          setNewSchedule((p) => ({ ...p, subjectId: d.subjects[0].id }));
        }
      }
      if (pendRes.ok) {
        const d = await pendRes.json();
        setPendingUsers(d.users || []);
      }
      if (stusRes.ok) {
        const d = await stusRes.json();
        setStudents(d.users || []);
      }
      if (facRes.ok) {
        const d = await facRes.json();
        const facultyOnly = (d.users || []).filter(
          (u: UserRecord) => u.role === "DOCTOR" || u.role === "TA"
        );
        setFacultyList(facultyOnly);
      }
      if (schedRes.ok) {
        const d = await schedRes.json();
        setSchedules(d.schedules || []);
      }
      if (postsRes.ok) {
        const d = await postsRes.json();
        setPosts(d.posts || []);
      }
      if (settRes.ok) {
        const d = await settRes.json();
        setSiteSettings(d.settings);
      }
      if (logsRes.ok) {
        const d = await logsRes.json();
        setAuditLogs(d.logs || []);
      }
    } catch (e) {
      console.error("Dashboard load error:", e);
      showToast("تعذر تحميل بعض بيانات لوحة التحكم.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // Account Approval Handler
  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "تم تحديث حالة الحساب.");
        loadDashboardData();
      } else {
        showToast(data.error || "فشل تحديث الحالة.", "error");
      }
    } catch {
      showToast("حدث خطأ في الاتصال.", "error");
    }
  };

  // Student Update (GPA, ID, Year, Dept)
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const res = await fetch(`/api/admin/users/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingStudent.name,
          studentId: editingStudent.studentProfile?.studentId,
          universityCode: editingStudent.studentProfile?.universityCode,
          academicYearId: editingStudent.studentProfile?.academicYearId,
          departmentId: editingStudent.departmentId,
          gpa: editingStudent.studentProfile?.gpa,
          status: editingStudent.status,
          password: editingStudent.newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("تم تحديث بيانات الطالب والمعدل التراكمي (GPA) بنجاح.");
        setEditingStudent(null);
        loadDashboardData();
      } else {
        showToast(data.error || "فشل حفظ التعديلات.", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الحفظ.", "error");
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showToast("تم حذف المستخدم بنجاح.");
        loadDashboardData();
      } else {
        showToast(data.error || "تعذر الحذف.", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الحذف.", "error");
    }
  };

  // Add Subject Handler
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSubject,
          creditHours: Number(newSubject.creditHours),
          doctorId: newSubject.doctorId || null,
          taId: newSubject.taId || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("تمت إضافة المقرر الدراسي بنجاح.");
        setShowAddSubject(false);
        setNewSubject({
          name: "",
          code: "",
          creditHours: 3,
          departmentId: departments[0]?.id || "",
          academicYearId: years[0]?.id || "",
          doctorId: "",
          taId: "",
        });
        loadDashboardData();
      } else {
        showToast(data.error || "تعذر إضافة المادة.", "error");
      }
    } catch {
      showToast("حدث خطأ.", "error");
    }
  };

  // Add Department Handler
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDept),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("تمت إضافة القسم العلمي بنجاح.");
        setShowAddDept(false);
        setNewDept({ name: "", code: "", headOfDepartment: "" });
        loadDashboardData();
      } else {
        showToast(data.error || "تعذر إضافة القسم.", "error");
      }
    } catch {
      showToast("حدث خطأ.", "error");
    }
  };

  // Add Schedule Slot Handler
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSchedule,
          doctorId: newSchedule.doctorId || null,
          taId: newSchedule.taId || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("تمت إضافة الحصة للجدول بنجاح.");
        setShowAddSchedule(false);
        loadDashboardData();
      } else {
        showToast(data.error || "تعذر إضافة الحصة.", "error");
      }
    } catch {
      showToast("حدث خطأ.", "error");
    }
  };

  // Toggle Maintenance Mode
  const handleToggleMaintenance = async () => {
    if (!siteSettings) return;
    const nextState = !siteSettings.maintenanceMode;

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode: nextState,
          maintenanceMessage: siteSettings.maintenanceMessage,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSiteSettings(data.settings);
        showToast(
          nextState
            ? "تم تفعيل وضع الصيانة بنجاح (الموقع محجوب عن غير الإدارة)."
            : "تم إيقاف وضع الصيانة وإعادة الموقع للعمل للجميع."
        );
        loadDashboardData();
      }
    } catch {
      showToast("تعذر تغيير وضع الصيانة.", "error");
    }
  };

  // Update Site Branding Settings
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings),
      });
      if (res.ok) {
        showToast("تم حفظ إعدادات وهوية المعهد بنجاح.");
      } else {
        showToast("فشل الحفظ.", "error");
      }
    } catch {
      showToast("حدث خطأ.", "error");
    }
  };

  // Delete Post Handler
  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("تم حذف المنشور بنجاح.");
        loadDashboardData();
      }
    } catch {
      showToast("تعذر حذف المنشور.", "error");
    }
  };

  if (authLoading || !user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1121] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060A14] text-white flex">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-top-4 ${
            feedbackMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-200"
              : "border-rose-500/40 bg-rose-500/20 text-rose-200"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0E1526] p-6 shadow-2xl text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-amber-400" />
            <h3 className="mt-3 text-base font-black text-white">{confirmDialog.title}</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="mt-6 flex gap-2 justify-center">
              <button
                onClick={() => setConfirmDialog(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
              >
                تأكيد الإجراء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 border-l border-white/10 bg-[#0A0F1E] p-4 flex flex-col justify-between hidden lg:flex">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-white/10 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 font-mono font-black text-slate-950">
              CSI
            </div>
            <div>
              <strong className="block text-xs font-black text-white">إدارة معهد الحاسبات</strong>
              <span className="text-[10px] text-amber-400 font-bold">لوحة التحكم العليا</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition ${
                activeTab === "overview"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>نظرة عامة والمؤشرات</span>
            </button>

            <button
              onClick={() => setActiveTab("pending")}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 font-bold transition ${
                activeTab === "pending"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="h-4 w-4" />
                <span>الحسابات المعلقة</span>
              </div>
              {pendingUsers.length > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                  {pendingUsers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition ${
                activeTab === "students"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>إدارة الطلاب والـ GPA</span>
            </button>

            <button
              onClick={() => setActiveTab("faculty")}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition ${
                activeTab === "faculty"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>أعضاء التدريس والمعاونة</span>
            </button>

            <button
              onClick={() => setActiveTab("departments")}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition ${
                activeTab === "departments"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>الأقسام العلمية</span>
            </button>

            <button
              onClick={() => setActiveTab("subjects")}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition ${
                activeTab === "subjects"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>المقررات الدراسية</span>
            </button>

            <button
              onClick={() => setActiveTab("schedules")}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition ${
                activeTab === "schedules"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>الجداول الأكاديمية</span>
            </button>

            <button
              onClick={() => setActiveTab("posts")}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition ${
                activeTab === "posts"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>المنشورات والإعلانات</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition ${
                activeTab === "settings"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>الهوية ووضع الصيانة</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition ${
                activeTab === "audit"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>سجل التدقيق (Audit Logs)</span>
            </button>
          </nav>
        </div>

        {/* User logout section */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <strong className="block text-xs font-bold text-white truncate">{user.name}</strong>
              <span className="text-[10px] text-white/50">مدير النظام (Admin)</span>
            </div>
            <button
              onClick={logout}
              title="تسجيل الخروج"
              className="rounded-lg p-2 text-rose-400 hover:bg-white/5 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="border-b border-white/10 bg-[#0A0F1E]/80 px-6 py-4 flex items-center justify-between backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-black text-white">لوحة تحكم معهد الحاسبات ونظم المعلومات</h1>
            {siteSettings?.maintenanceMode && (
              <span className="flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-0.5 text-[11px] font-bold text-rose-300 animate-pulse">
                <Power className="h-3 w-3" />
                <span>وضع الصيانة مفعّل</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold text-amber-400 hover:underline"
            >
              معاينة الموقع العام
            </Link>
          </div>
        </header>

        {/* Tab Content Wrapper */}
        <main className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <span className="text-xs text-white/50">إجمالي الطلاب المقيدين</span>
                  <strong className="mt-2 block text-3xl font-black text-amber-400 font-mono">
                    {overview?.metrics.totalStudents || 0}
                  </strong>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <span className="text-xs text-white/50">أعضاء هيئة التدريس</span>
                  <strong className="mt-2 block text-3xl font-black text-emerald-400 font-mono">
                    {overview?.metrics.totalDoctors || 0}
                  </strong>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <span className="text-xs text-white/50">الهيئة المعاونة (معيدون)</span>
                  <strong className="mt-2 block text-3xl font-black text-cyan-400 font-mono">
                    {overview?.metrics.totalTAs || 0}
                  </strong>
                </div>

                <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5">
                  <span className="text-xs text-rose-300 font-bold">حسابات بانتظار الاعتماد</span>
                  <strong className="mt-2 block text-3xl font-black text-rose-400 font-mono">
                    {overview?.metrics.pendingCount || 0}
                  </strong>
                </div>
              </div>

              {/* Distribution Charts Visuals */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Students by Year */}
                <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
                  <h3 className="text-sm font-black text-white mb-4">توزيع الطلاب حسب الفرق الأكاديمية</h3>
                  <div className="space-y-3">
                    {overview?.charts.studentsByYear.map((y) => (
                      <div key={y.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/80 font-bold">{y.name}</span>
                          <span className="font-mono text-amber-400">{y.count} طالب</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{
                              width: `${
                                overview.metrics.totalStudents > 0
                                  ? (y.count / overview.metrics.totalStudents) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Students by Department */}
                <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
                  <h3 className="text-sm font-black text-white mb-4">المنتسبون حسب الأقسام العلمية</h3>
                  <div className="space-y-3">
                    {overview?.charts.studentsByDept.map((d) => (
                      <div key={d.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/80 font-bold">
                            {d.name} ({d.code})
                          </span>
                          <span className="font-mono text-emerald-400">{d.count} منتسب</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{
                              width: `${
                                (d.count / (overview.metrics.totalStudents + overview.metrics.totalDoctors || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENDING ACCOUNTS APPROVAL */}
          {activeTab === "pending" && (
            <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h2 className="text-base font-black text-white">الحسابات بانتظار الاعتماد والموافقة</h2>
                  <p className="mt-1 text-xs text-white/50">
                    طلبات التسجيل الجديدة للطلاب وأعضاء هيئة التدريس التي تتطلب اعتماد الإدارة
                  </p>
                </div>
                <span className="rounded-xl bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                  {pendingUsers.length} طلبات معلقة
                </span>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="py-12 text-center text-xs text-white/40">
                  لا توجد حسابات معلقة حالياً. جميع الطلبات تم البت فيها.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full text-right text-xs">
                    <thead className="border-b border-white/10 bg-white/5 text-white/50">
                      <tr>
                        <th className="p-4">الاسم</th>
                        <th className="p-4">نوع الحساب</th>
                        <th className="p-4">البريد الإلكتروني</th>
                        <th className="p-4">البيانات الأكاديمية</th>
                        <th className="p-4">تاريخ التسجيل</th>
                        <th className="p-4 text-center">إجراءات الاعتماد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pendingUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.02]">
                          <td className="p-4 font-bold text-white">{u.name}</td>
                          <td className="p-4">
                            <span
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                u.role === "STUDENT"
                                  ? "bg-blue-500/15 text-blue-300"
                                  : u.role === "DOCTOR"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-cyan-500/15 text-cyan-300"
                              }`}
                            >
                              {u.role === "STUDENT"
                                ? "طالب"
                                : u.role === "DOCTOR"
                                ? "دكتور"
                                : "معيد"}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-white/70" dir="ltr">
                            {u.email}
                          </td>
                          <td className="p-4 text-white/70">
                            {u.studentProfile ? (
                              <span>
                                {u.studentProfile.academicYear?.name} • كود:{" "}
                                {u.studentProfile.universityCode}
                              </span>
                            ) : (
                              <span>{u.facultyProfile?.title || u.department?.name || "هيئة تدريس"}</span>
                            )}
                          </td>
                          <td className="p-4 text-white/50">
                            {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleUserStatusChange(u.id, "ACTIVE")}
                                className="flex items-center gap-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>موافقة وتفعيل</span>
                              </button>

                              <button
                                onClick={() => handleUserStatusChange(u.id, "REJECTED")}
                                className="flex items-center gap-1 rounded-xl bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>رفض</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDENTS MANAGEMENT & GPA */}
          {activeTab === "students" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
                  <div>
                    <h2 className="text-base font-black text-white">شؤون الطلاب وإدارة المعدل التراكمي (GPA)</h2>
                    <p className="mt-1 text-xs text-white/50">
                      تعديل بيانات القيد، الساعات، وتحديث الـ GPA المسجل في الـ Audit Logs
                    </p>
                  </div>

                  <div className="relative w-72">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="بحث باسم الطالب، الرقم أو الكود..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 pl-10 text-xs text-white outline-none focus:border-amber-400"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full text-right text-xs">
                    <thead className="border-b border-white/10 bg-white/5 text-white/50">
                      <tr>
                        <th className="p-4">اسم الطالب</th>
                        <th className="p-4">الرقم الأكاديمي</th>
                        <th className="p-4">كود المعهد</th>
                        <th className="p-4">الفرقة</th>
                        <th className="p-4">القسم</th>
                        <th className="p-4">المعدل (GPA)</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {students
                        .filter((s) => {
                          const q = studentSearch.toLowerCase();
                          return (
                            s.name.toLowerCase().includes(q) ||
                            s.studentProfile?.studentId?.includes(q) ||
                            s.studentProfile?.universityCode?.includes(q)
                          );
                        })
                        .map((s) => (
                          <tr key={s.id} className="hover:bg-white/[0.02]">
                            <td className="p-4">
                              <strong className="block font-bold text-white">{s.name}</strong>
                              <span className="font-mono text-[10px] text-white/40" dir="ltr">
                                {s.email}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-amber-300">
                              {s.studentProfile?.studentId || "---"}
                            </td>
                            <td className="p-4 font-mono text-white/70">
                              {s.studentProfile?.universityCode || "---"}
                            </td>
                            <td className="p-4 text-white/80">
                              {s.studentProfile?.academicYear?.name || "---"}
                            </td>
                            <td className="p-4 text-white/80">{s.department?.name || "عام"}</td>
                            <td className="p-4 font-mono font-black text-amber-400 text-sm">
                              {s.studentProfile?.gpa?.toFixed(2) || "0.00"}
                            </td>
                            <td className="p-4">
                              <span
                                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                                  s.status === "ACTIVE"
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : s.status === "PENDING"
                                    ? "bg-amber-500/15 text-amber-300"
                                    : "bg-rose-500/15 text-rose-300"
                                }`}
                              >
                                {s.status === "ACTIVE"
                                  ? "نشط"
                                  : s.status === "PENDING"
                                  ? "معلق"
                                  : "موقوف"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setEditingStudent(JSON.parse(JSON.stringify(s)))}
                                  className="rounded-lg bg-amber-500/15 p-2 text-amber-300 hover:bg-amber-500/25"
                                  title="تعديل بيانات القيد والـ GPA"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmDialog({
                                      title: "تأكيد حذف الطالب",
                                      message: `هل أنت متأكد من رغبتك في حذف الطالب ${s.name} نهائياً؟`,
                                      onConfirm: () => handleDeleteUser(s.id),
                                    })
                                  }
                                  className="rounded-lg bg-rose-500/15 p-2 text-rose-300 hover:bg-rose-500/25"
                                  title="حذف الطالب"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit Student Modal */}
              {editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0E1526] p-6 shadow-2xl">
                    <h3 className="text-base font-black text-white mb-4">
                      تعديل بيانات الطالب والمعدل التراكمي
                    </h3>
                    <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-white/70 mb-1 font-bold">اسم الطالب</label>
                        <input
                          type="text"
                          value={editingStudent.name}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, name: e.target.value })
                          }
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/70 mb-1 font-bold">الرقم الأكاديمي</label>
                          <input
                            type="text"
                            value={editingStudent.studentProfile?.studentId || ""}
                            onChange={(e) =>
                              setEditingStudent({
                                ...editingStudent,
                                studentProfile: {
                                  ...editingStudent.studentProfile,
                                  studentId: e.target.value,
                                },
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-white/70 mb-1 font-bold">كود المعهد</label>
                          <input
                            type="text"
                            value={editingStudent.studentProfile?.universityCode || ""}
                            onChange={(e) =>
                              setEditingStudent({
                                ...editingStudent,
                                studentProfile: {
                                  ...editingStudent.studentProfile,
                                  universityCode: e.target.value,
                                },
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-amber-300 mb-1 font-black">
                            المعدل التراكمي (GPA)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="4.0"
                            value={editingStudent.studentProfile?.gpa ?? 0}
                            onChange={(e) =>
                              setEditingStudent({
                                ...editingStudent,
                                studentProfile: {
                                  ...editingStudent.studentProfile,
                                  gpa: parseFloat(e.target.value),
                                },
                              })
                            }
                            className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 font-mono text-amber-300 font-bold outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-white/70 mb-1 font-bold">حالة الحساب</label>
                          <select
                            value={editingStudent.status}
                            onChange={(e) =>
                              setEditingStudent({ ...editingStudent, status: e.target.value })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#0B1121] p-2.5 text-white outline-none focus:border-amber-400"
                          >
                            <option value="ACTIVE">نشط ومعتمد (ACTIVE)</option>
                            <option value="PENDING">معلق للمراجعة (PENDING)</option>
                            <option value="SUSPENDED">موقوف (SUSPENDED)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/70 mb-1 font-bold">الفرقة الدراسية</label>
                          <select
                            value={editingStudent.studentProfile?.academicYearId || ""}
                            onChange={(e) =>
                              setEditingStudent({
                                ...editingStudent,
                                studentProfile: {
                                  ...editingStudent.studentProfile,
                                  academicYearId: e.target.value,
                                },
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#0B1121] p-2.5 text-white outline-none focus:border-amber-400"
                          >
                            {years.map((y) => (
                              <option key={y.id} value={y.id}>
                                {y.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-white/70 mb-1 font-bold">القسم</label>
                          <select
                            value={editingStudent.departmentId || ""}
                            onChange={(e) =>
                              setEditingStudent({
                                ...editingStudent,
                                departmentId: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#0B1121] p-2.5 text-white outline-none focus:border-amber-400"
                          >
                            <option value="">(عام)</option>
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/70 mb-1 font-bold">
                          إعادة تعيين كلمة المرور (اختياري)
                        </label>
                        <input
                          type="password"
                          placeholder="اتركه فارغاً إن لم ترغب في التغيير"
                          value={editingStudent.newPassword || ""}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, newPassword: e.target.value })
                          }
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4">
                        <button
                          type="button"
                          onClick={() => setEditingStudent(null)}
                          className="rounded-xl border border-white/10 px-4 py-2 font-bold text-white hover:bg-white/5"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-amber-500 px-5 py-2 font-black text-slate-950 hover:bg-amber-400"
                        >
                          حفظ التعديلات
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FACULTY (DOCTORS & TAs) */}
          {activeTab === "faculty" && (
            <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h2 className="text-base font-black text-white">أعضاء هيئة التدريس والهيئة المعاونة</h2>
                  <p className="mt-1 text-xs text-white/50">
                    متابعة حسابات الدكاترة والمعيدين والأقسام المسندة إليهم
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-right text-xs">
                  <thead className="border-b border-white/10 bg-white/5 text-white/50">
                    <tr>
                      <th className="p-4">الاسم واللقب</th>
                      <th className="p-4">الدور</th>
                      <th className="p-4">القسم الأكاديمي</th>
                      <th className="p-4">البريد الإلكتروني</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {facultyList.map((f) => (
                      <tr key={f.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-bold text-white">{f.name}</td>
                        <td className="p-4">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                              f.role === "DOCTOR"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-cyan-500/15 text-cyan-300"
                            }`}
                          >
                            {f.role === "DOCTOR" ? "دكتور" : "معيد"}
                          </span>
                        </td>
                        <td className="p-4 text-white/80">{f.department?.name || "غير محدد"}</td>
                        <td className="p-4 font-mono text-white/70" dir="ltr">
                          {f.email}
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                              f.status === "ACTIVE"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-rose-500/15 text-rose-300"
                            }`}
                          >
                            {f.status === "ACTIVE" ? "نشط" : "معلق"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleUserStatusChange(
                                  f.id,
                                  f.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
                                )
                              }
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                f.status === "ACTIVE"
                                  ? "bg-rose-500/20 text-rose-300"
                                  : "bg-emerald-500/20 text-emerald-300"
                              }`}
                            >
                              {f.status === "ACTIVE" ? "إيقاف" : "تفعيل"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DEPARTMENTS */}
          {activeTab === "departments" && (
            <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h2 className="text-base font-black text-white">الأقسام الأكاديمية للمعهد</h2>
                  <p className="mt-1 text-xs text-white/50">
                    إدارة الأقسام العلمية ديناميكياً بدون كود ثابت (علوم الحاسب، نظم المعلومات، وإضافة أقسام)
                  </p>
                </div>
                <button
                  onClick={() => setShowAddDept(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة قسم علمي</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 font-mono text-xs font-bold text-amber-300">
                        {dept.code}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-black text-white">{dept.name}</h3>
                    <p className="mt-2 text-xs text-white/60">
                      رئيس القسم: <strong className="text-white">{dept.headOfDepartment || "غير محدد"}</strong>
                    </p>
                  </div>
                ))}
              </div>

              {/* Add Department Modal */}
              {showAddDept && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0E1526] p-6 shadow-2xl">
                    <h3 className="text-base font-black text-white mb-4">إضافة قسم أكاديمي جديد</h3>
                    <form onSubmit={handleAddDept} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-white/70 mb-1 font-bold">اسم القسم</label>
                        <input
                          type="text"
                          required
                          value={newDept.name}
                          onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                          placeholder="مثال: الأمن السيبراني والشبكات"
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 mb-1 font-bold">كود القسم</label>
                        <input
                          type="text"
                          required
                          value={newDept.code}
                          onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                          placeholder="مثال: CYBER"
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 mb-1 font-bold">رئيس القسم</label>
                        <input
                          type="text"
                          value={newDept.headOfDepartment}
                          onChange={(e) =>
                            setNewDept({ ...newDept, headOfDepartment: e.target.value })
                          }
                          placeholder="مثال: أ.د. فلان الفلاني"
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddDept(false)}
                          className="rounded-xl border border-white/10 px-4 py-2 font-bold text-white hover:bg-white/5"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-amber-500 px-5 py-2 font-black text-slate-950 hover:bg-amber-400"
                        >
                          إضافة القسم
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SUBJECTS MANAGEMENT */}
          {activeTab === "subjects" && (
            <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h2 className="text-base font-black text-white">المقررات والمواد الدراسية</h2>
                  <p className="mt-1 text-xs text-white/50">
                    إنشاء وتعديل المقررات وإسناد أساتذة المادة والمعيدين
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSubject(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة مقرر دراسي</span>
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-right text-xs">
                  <thead className="border-b border-white/10 bg-white/5 text-white/50">
                    <tr>
                      <th className="p-4">اسم المادة</th>
                      <th className="p-4">الكود</th>
                      <th className="p-4">الساعات</th>
                      <th className="p-4">القسم</th>
                      <th className="p-4">الفرقة</th>
                      <th className="p-4">أستاذ المادة</th>
                      <th className="p-4">المعيد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-bold text-white">{sub.name}</td>
                        <td className="p-4 font-mono text-amber-400">{sub.code}</td>
                        <td className="p-4 font-mono">{sub.creditHours}</td>
                        <td className="p-4 text-white/80">{sub.department?.name}</td>
                        <td className="p-4 text-white/80">{sub.academicYear?.name}</td>
                        <td className="p-4 text-emerald-300 font-bold">{sub.doctor?.name || "غير مسند"}</td>
                        <td className="p-4 text-cyan-300">{sub.ta?.name || "غير مسند"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Subject Modal */}
              {showAddSubject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0E1526] p-6 shadow-2xl">
                    <h3 className="text-base font-black text-white mb-4">إضافة مقرر دراسي جديد</h3>
                    <form onSubmit={handleAddSubject} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-white/70 mb-1 font-bold">اسم المقرر</label>
                        <input
                          type="text"
                          required
                          value={newSubject.name}
                          onChange={(e) =>
                            setNewSubject({ ...newSubject, name: e.target.value })
                          }
                          placeholder="مثال: هندسة البرمجيات 1"
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/70 mb-1 font-bold">كود المادة</label>
                          <input
                            type="text"
                            required
                            value={newSubject.code}
                            onChange={(e) =>
                              setNewSubject({ ...newSubject, code: e.target.value })
                            }
                            placeholder="مثال: CS301"
                            className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 mb-1 font-bold">الساعات المعتمدة</label>
                          <input
                            type="number"
                            min="1"
                            max="6"
                            value={newSubject.creditHours}
                            onChange={(e) =>
                              setNewSubject({
                                ...newSubject,
                                creditHours: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/70 mb-1 font-bold">القسم</label>
                          <select
                            value={newSubject.departmentId}
                            onChange={(e) =>
                              setNewSubject({ ...newSubject, departmentId: e.target.value })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#0B1121] p-2.5 text-white outline-none focus:border-amber-400"
                          >
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-white/70 mb-1 font-bold">الفرقة الدراسية</label>
                          <select
                            value={newSubject.academicYearId}
                            onChange={(e) =>
                              setNewSubject({ ...newSubject, academicYearId: e.target.value })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#0B1121] p-2.5 text-white outline-none focus:border-amber-400"
                          >
                            {years.map((y) => (
                              <option key={y.id} value={y.id}>
                                {y.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/70 mb-1 font-bold">الدكتور المنسق</label>
                          <select
                            value={newSubject.doctorId}
                            onChange={(e) =>
                              setNewSubject({ ...newSubject, doctorId: e.target.value })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#0B1121] p-2.5 text-white outline-none focus:border-amber-400"
                          >
                            <option value="">(غير مسند حالياً)</option>
                            {facultyList
                              .filter((f) => f.role === "DOCTOR")
                              .map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-white/70 mb-1 font-bold">المعيد المساعد</label>
                          <select
                            value={newSubject.taId}
                            onChange={(e) =>
                              setNewSubject({ ...newSubject, taId: e.target.value })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#0B1121] p-2.5 text-white outline-none focus:border-amber-400"
                          >
                            <option value="">(غير مسند حالياً)</option>
                            {facultyList
                              .filter((f) => f.role === "TA")
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddSubject(false)}
                          className="rounded-xl border border-white/10 px-4 py-2 font-bold text-white hover:bg-white/5"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-amber-500 px-5 py-2 font-black text-slate-950 hover:bg-amber-400"
                        >
                          حفظ المقرر
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SCHEDULES TIMETABLE BUILDER */}
          {activeTab === "schedules" && (
            <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h2 className="text-base font-black text-white">إدارة الجداول الأكاديمية (Timetable Builder)</h2>
                  <p className="mt-1 text-xs text-white/50">
                    بناء الجداول الدراسية الأسبوعية لكافة الفرق بدون تعديل الكود
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSchedule(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة فترة للجدول</span>
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-right text-xs">
                  <thead className="border-b border-white/10 bg-white/5 text-white/50">
                    <tr>
                      <th className="p-4">اليوم</th>
                      <th className="p-4">المقرر</th>
                      <th className="p-4">الفرقة</th>
                      <th className="p-4">التوقيت</th>
                      <th className="p-4">المكان</th>
                      <th className="p-4">المحاضر</th>
                      <th className="p-4">النوع</th>
                      <th className="p-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {schedules.map((sc) => (
                      <tr key={sc.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-bold text-amber-300">{sc.dayOfWeek}</td>
                        <td className="p-4 font-bold text-white">{sc.subject?.name || "المادة"}</td>
                        <td className="p-4 text-white/70">{sc.academicYear?.name || "الفرقة"}</td>
                        <td className="p-4 font-mono" dir="ltr">
                          {sc.startTime} - {sc.endTime}
                        </td>
                        <td className="p-4 text-white/80">{sc.room}</td>
                        <td className="p-4 text-white/80">{sc.doctor?.name || sc.ta?.name || "هيئة التدريس"}</td>
                        <td className="p-4">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                              sc.type === "LECTURE"
                                ? "bg-amber-500/20 text-amber-300"
                                : sc.type === "LAB"
                                ? "bg-sky-500/20 text-sky-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {sc.type}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={async () => {
                              await fetch(`/api/schedules/${sc.id}`, { method: "DELETE" });
                              showToast("تم حذف الفترة من الجدول.");
                              loadDashboardData();
                            }}
                            className="rounded-lg bg-rose-500/15 p-2 text-rose-300 hover:bg-rose-500/25"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Schedule Modal */}
              {showAddSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0E1526] p-6 shadow-2xl">
                    <h3 className="text-base font-black text-white mb-4">إضافة فترة للجدول الدراسي</h3>
                    <form onSubmit={handleAddSchedule} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-white/70 mb-1 font-bold">المقرر الدراسي</label>
                        <select
                          value={newSchedule.subjectId}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, subjectId: e.target.value })
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#0B1121] p-2.5 text-white outline-none focus:border-amber-400"
                        >
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/70 mb-1 font-bold">اليوم</label>
                          <select
                            value={newSchedule.dayOfWeek}
                            onChange={(e) =>
                              setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#0B1121] p-2.5 text-white outline-none focus:border-amber-400"
                          >
                            <option value="Saturday">السبت (Saturday)</option>
                            <option value="Sunday">الأحد (Sunday)</option>
                            <option value="Monday">الإثنين (Monday)</option>
                            <option value="Tuesday">الثلاثاء (Tuesday)</option>
                            <option value="Wednesday">الأربعاء (Wednesday)</option>
                            <option value="Thursday">الخميس (Thursday)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-white/70 mb-1 font-bold">نوع الحصة</label>
                          <select
                            value={newSchedule.type}
                            onChange={(e) =>
                              setNewSchedule({ ...newSchedule, type: e.target.value })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#0B1121] p-2.5 text-white outline-none focus:border-amber-400"
                          >
                            <option value="LECTURE">محاضرة (LECTURE)</option>
                            <option value="SECTION">سكشن (SECTION)</option>
                            <option value="LAB">معمل عملي (LAB)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/70 mb-1 font-bold">وقت البدء (HH:mm)</label>
                          <input
                            type="text"
                            required
                            placeholder="09:00"
                            value={newSchedule.startTime}
                            onChange={(e) =>
                              setNewSchedule({ ...newSchedule, startTime: e.target.value })
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-white/70 mb-1 font-bold">وقت الانتهاء (HH:mm)</label>
                          <input
                            type="text"
                            required
                            placeholder="10:30"
                            value={newSchedule.endTime}
                            onChange={(e) =>
                              setNewSchedule({ ...newSchedule, endTime: e.target.value })
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/70 mb-1 font-bold">القاعة أو المعمل</label>
                        <input
                          type="text"
                          required
                          value={newSchedule.room}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, room: e.target.value })
                          }
                          placeholder="مدرج 1 الرئيسي"
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddSchedule(false)}
                          className="rounded-xl border border-white/10 px-4 py-2 font-bold text-white hover:bg-white/5"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-amber-500 px-5 py-2 font-black text-slate-950 hover:bg-amber-400"
                        >
                          حفظ الفترة
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: POSTS & MODERATION */}
          {activeTab === "posts" && (
            <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h2 className="text-base font-black text-white">إدارة ومراقبة المنشورات والتعليقات</h2>
                  <p className="mt-1 text-xs text-white/50">
                    مراجعة المنشورات المنشورة، حذف المنشورات المخالفة، أو إدارة التعليقات
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {posts.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-white/50">
                        <span className="font-bold text-amber-400">{p.author.name}</span>
                        <span>•</span>
                        <span>{new Date(p.createdAt).toLocaleDateString("ar-EG")}</span>
                        {p.isPinned && (
                          <span className="rounded bg-amber-500/20 text-amber-300 px-2 py-0.5 font-bold">
                            مثبت
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-white">{p.title || p.content.slice(0, 50)}</h4>
                      <p className="mt-1 text-xs text-slate-300 line-clamp-2">{p.content}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeletePost(p.id)}
                        className="flex items-center gap-1 rounded-xl bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/25"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>حذف المنشور</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: SITE SETTINGS & MAINTENANCE MODE */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Maintenance Mode Toggle Card */}
              <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <span className="text-xs text-amber-400 font-bold">مفتاح التحكم الأمني</span>
                    <h2 className="text-lg font-black text-white">وضع الصيانة للمعهد (Maintenance Mode)</h2>
                    <p className="mt-1 text-xs text-white/50">
                      عند التفعيل: يُحجب الموقع عن أي زائر غير مدير، ويظهر تصميم صفحة الصيانة الأنيقة مع اللودر
                    </p>
                  </div>

                  <button
                    onClick={handleToggleMaintenance}
                    className={`flex items-center gap-2.5 rounded-2xl px-6 py-3 text-xs font-black transition shadow-lg ${
                      siteSettings?.maintenanceMode
                        ? "bg-rose-500 text-white shadow-rose-500/25 hover:bg-rose-600"
                        : "bg-emerald-500 text-slate-950 shadow-emerald-500/25 hover:bg-emerald-400"
                    }`}
                  >
                    <Power className="h-4 w-4" />
                    <span>
                      {siteSettings?.maintenanceMode
                        ? "🔴 وضع الصيانة مفعّل (انقر لإلغائه)"
                        : "🟢 الموقع متاح للجميع (Online)"}
                    </span>
                  </button>
                </div>

                <div className="mt-5">
                  <label className="block text-xs font-bold text-white/70 mb-1.5">
                    رسالة الصيانة المعروضة للزوار:
                  </label>
                  <textarea
                    rows={2}
                    value={siteSettings?.maintenanceMessage || ""}
                    onChange={(e) =>
                      setSiteSettings((prev) =>
                        prev ? { ...prev, maintenanceMessage: e.target.value } : null
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none focus:border-amber-400"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleSaveBranding}
                      className="rounded-xl bg-white/10 border border-white/10 px-4 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                    >
                      حفظ رسالة الصيانة
                    </button>
                  </div>
                </div>
              </div>

              {/* Branding and Contact Settings Form */}
              <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
                <h3 className="text-base font-black text-white mb-4">هوية المعهد وبيانات الاتصال</h3>
                <form onSubmit={handleSaveBranding} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-white/70 mb-1 font-bold">اسم المعهد الكامل</label>
                    <input
                      type="text"
                      value={siteSettings?.instituteName || ""}
                      onChange={(e) =>
                        setSiteSettings((prev) =>
                          prev ? { ...prev, instituteName: e.target.value } : null
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 mb-1 font-bold">الاسم المختصر</label>
                      <input
                        type="text"
                        value={siteSettings?.shortName || ""}
                        onChange={(e) =>
                          setSiteSettings((prev) =>
                            prev ? { ...prev, shortName: e.target.value } : null
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 mb-1 font-bold">هاتف المعهد</label>
                      <input
                        type="text"
                        value={siteSettings?.contactPhone || ""}
                        onChange={(e) =>
                          setSiteSettings((prev) =>
                            prev ? { ...prev, contactPhone: e.target.value } : null
                          )
                        }
                        dir="ltr"
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 mb-1 font-bold">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={siteSettings?.contactEmail || ""}
                        onChange={(e) =>
                          setSiteSettings((prev) =>
                            prev ? { ...prev, contactEmail: e.target.value } : null
                          )
                        }
                        dir="ltr"
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 mb-1 font-bold">عنوان المعهد</label>
                      <input
                        type="text"
                        value={siteSettings?.address || ""}
                        onChange={(e) =>
                          setSiteSettings((prev) =>
                            prev ? { ...prev, address: e.target.value } : null
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400"
                    >
                      <Save className="h-4 w-4" />
                      <span>حفظ إعدادات الهوية</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 10: AUDIT LOGS */}
          {activeTab === "audit" && (
            <div className="rounded-3xl border border-white/10 bg-[#0E1526]/80 p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h2 className="text-base font-black text-white">سجل التدقيق والمراقبة (Audit Logs)</h2>
                  <p className="mt-1 text-xs text-white/50">
                    توثيق لكافة العمليات الحساسة (تعديلات الـ GPA، الموافقة على الحسابات، الصيانة، الحضور)
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-right text-xs">
                  <thead className="border-b border-white/10 bg-white/5 text-white/50">
                    <tr>
                      <th className="p-4">المستخدم المنفّذ</th>
                      <th className="p-4">نوع الإجراء</th>
                      <th className="p-4">الهدف</th>
                      <th className="p-4">التفاصيل</th>
                      <th className="p-4">التاريخ والوقت</th>
                      <th className="p-4 font-mono">عنوان IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-bold text-white">
                          {log.actor ? log.actor.name : "النظام / عام"}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-white/70">{log.targetType}</td>
                        <td className="p-4 font-mono text-[11px] text-white/60 max-w-xs truncate">
                          {log.details || "---"}
                        </td>
                        <td className="p-4 text-white/60">
                          {new Date(log.createdAt).toLocaleString("ar-EG")}
                        </td>
                        <td className="p-4 font-mono text-white/40">{log.ipAddress || "local"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
