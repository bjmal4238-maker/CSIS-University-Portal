import { z } from "zod";

export const StudentRegisterSchema = z.object({
  role: z.literal("STUDENT"),
  name: z.string().min(3, "الاسم الكامل يجب ألا يقل عن 3 أحرف"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
  studentId: z.string().min(4, "الرقم الأكاديمي يجب أن يحتوي على 4 أرقام على الأقل"),
  universityCode: z.string().min(4, "كود المعهد / الجامعة مطلوب"),
  academicYearId: z.string().min(1, "يرجى تحديد الفرقة الدراسية"),
  departmentId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const FacultyRegisterSchema = z.object({
  role: z.enum(["DOCTOR", "TA"]),
  name: z.string().min(3, "الاسم الكامل يجب ألا يقل عن 3 أحرف"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
  departmentId: z.string().min(1, "يرجى اختيار القسم الأكاديمي"),
  title: z.string().optional().nullable(),
  officeRoom: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const LoginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  rememberMe: z.boolean().optional().default(false),
});

export const AttendanceSessionCreateSchema = z.object({
  subjectId: z.string().min(1, "يرجى اختيار المادة"),
  academicYearId: z.string().min(1, "يرجى تحديد الفرقة الدراسية"),
  durationMinutes: z.number().int().min(1).max(180).default(5),
  room: z.string().optional().nullable(),
});

export const AttendanceScanSchema = z.object({
  token: z.string().min(1, "رمز الحضور مطلوب"),
});

export const PostCreateSchema = z.object({
  title: z.string().optional().nullable(),
  content: z.string().min(3, "محتوى المنشور يجب ألا يقل عن 3 أحرف"),
  subjectId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  allowComments: z.boolean().default(true),
  allowReactions: z.boolean().default(true),
  isPinned: z.boolean().default(false),
});

export const CommentCreateSchema = z.object({
  content: z.string().min(1, "نص التعليق مطلوب").max(1000, "التعليق طويل جداً"),
});

export const ScheduleCreateSchema = z.object({
  subjectId: z.string().min(1, "المادة مطلوبة"),
  departmentId: z.string().min(1, "القسم مطلوب"),
  academicYearId: z.string().min(1, "الفرقة مطلوبة"),
  doctorId: z.string().optional().nullable(),
  taId: z.string().optional().nullable(),
  dayOfWeek: z.enum([
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "تنسيق وقت البدء غير صحيح (HH:mm)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "تنسيق وقت الانتهاء غير صحيح (HH:mm)"),
  room: z.string().min(1, "القاعة أو المعمل مطلوب"),
  type: z.enum(["LECTURE", "SECTION", "LAB"]).default("LECTURE"),
});

export const SubjectCreateSchema = z.object({
  name: z.string().min(2, "اسم المادة مطلوب"),
  code: z.string().min(2, "كود المادة مطلوب"),
  creditHours: z.number().int().min(1).max(6).default(3),
  departmentId: z.string().min(1, "القسم مطلوب"),
  academicYearId: z.string().min(1, "الفرقة الدراسية مطلوبة"),
  doctorId: z.string().optional().nullable(),
  taId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const DepartmentCreateSchema = z.object({
  name: z.string().min(2, "اسم القسم مطلوب"),
  code: z.string().min(2, "كود القسم مطلوب"),
  description: z.string().optional().nullable(),
  headOfDepartment: z.string().optional().nullable(),
});

export const StudentUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  studentId: z.string().min(4).optional(),
  universityCode: z.string().min(4).optional(),
  academicYearId: z.string().optional(),
  departmentId: z.string().optional().nullable(),
  gpa: z.number().min(0).max(4.0).optional(),
  totalCredits: z.number().int().min(0).optional(),
  status: z.enum(["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"]).optional(),
  password: z.string().min(6).optional(),
});

export const SiteSettingsUpdateSchema = z.object({
  instituteName: z.string().min(2).optional(),
  shortName: z.string().min(2).optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  description: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  address: z.string().optional(),
  facebookUrl: z.string().optional().nullable(),
  twitterUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImageUrl: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  estimatedEndTime: z.string().optional().nullable(),
});
