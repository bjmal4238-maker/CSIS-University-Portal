import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { StudentRegisterSchema, FacultyRegisterSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Prevent registering as ADMIN via public registration
    if (body.role === "ADMIN") {
      return NextResponse.json(
        { error: "لا يمكن تسجيل حساب مدير عبر نموذج التسجيل العام." },
        { status: 403 }
      );
    }

    // Student registration
    if (body.role === "STUDENT") {
      const parsed = StudentRegisterSchema.safeParse(body);
      if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message || "بيانات غير صالحة";
        return NextResponse.json({ error: firstError }, { status: 400 });
      }

      const { name, email, password, studentId, universityCode, academicYearId, departmentId, phone } =
        parsed.data;

      const normalizedEmail = email.trim().toLowerCase();

      // Check existing email
      const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingEmail) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر." },
          { status: 409 }
        );
      }

      // Check existing student ID or code
      const existingProfile = await prisma.studentProfile.findFirst({
        where: {
          OR: [{ studentId }, { universityCode }],
        },
      });

      if (existingProfile) {
        return NextResponse.json(
          { error: "الرقم الأكاديمي أو كود الجامعة مسجل لطالب آخر." },
          { status: 409 }
        );
      }

      const passwordHash = await hashPassword(password);

      const newUser = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: "STUDENT",
          status: "PENDING", // Strictly pending until admin approval
          phone: phone || null,
          departmentId: departmentId || null,
          studentProfile: {
            create: {
              studentId,
              universityCode,
              academicYearId,
              gpa: 0.0,
              totalCredits: 0,
            },
          },
        },
      });

      await logAudit({
        actorId: newUser.id,
        targetId: newUser.id,
        action: "USER_REGISTER",
        targetType: "USER",
        details: { role: "STUDENT", studentId, universityCode },
      });

      return NextResponse.json({
        success: true,
        message: "تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول باستخدام البيانات التي قمت بتسجيلها.",
      });
    }

    // Doctor / TA registration
    if (body.role === "DOCTOR" || body.role === "TA") {
      const parsed = FacultyRegisterSchema.safeParse(body);
      if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message || "بيانات غير صالحة";
        return NextResponse.json({ error: firstError }, { status: 400 });
      }

      const { name, email, password, role, departmentId, title, officeRoom, specialty, phone } =
        parsed.data;

      const normalizedEmail = email.trim().toLowerCase();

      const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingEmail) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مسجل بالفعل." },
          { status: 409 }
        );
      }

      const passwordHash = await hashPassword(password);

      const newUser = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role,
          status: "PENDING",
          phone: phone || null,
          departmentId,
          facultyProfile: {
            create: {
              title: title || (role === "DOCTOR" ? "دكتور" : "معيد"),
              officeRoom: officeRoom || null,
              specialty: specialty || null,
            },
          },
        },
      });

      await logAudit({
        actorId: newUser.id,
        targetId: newUser.id,
        action: "USER_REGISTER",
        targetType: "USER",
        details: { role, departmentId },
      });

      return NextResponse.json({
        success: true,
        message: "تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول باستخدام البيانات التي قمت بتسجيلها.",
      });
    }

    return NextResponse.json({ error: "نوع الحساب غير معروف." }, { status: 400 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء التسجيل. يرجى المحاولة لاحقاً." },
      { status: 500 }
    );
  }
}
