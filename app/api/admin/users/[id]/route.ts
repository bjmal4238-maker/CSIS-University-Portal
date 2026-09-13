import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك." }, { status: 403 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        studentProfile: { include: { academicYear: true } },
        facultyProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Fetch user error:", error);
    return NextResponse.json({ error: "تعذر تحميل بيانات المستخدم." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بتعديل بيانات المستخدمين." }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true, facultyProfile: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "المستخدم غير موجود." }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      departmentId,
      status,
      password,
      // Student specific
      studentId,
      universityCode,
      academicYearId,
      gpa,
      totalCredits,
      // Faculty specific
      title,
      officeRoom,
      specialty,
    } = body;

    const userUpdateData: Record<string, unknown> = {};
    if (name) userUpdateData.name = name;
    if (email) userUpdateData.email = email.trim().toLowerCase();
    if (phone !== undefined) userUpdateData.phone = phone || null;
    if (departmentId !== undefined) userUpdateData.departmentId = departmentId || null;
    if (status) userUpdateData.status = status;
    if (password && password.length >= 6) {
      userUpdateData.passwordHash = await hashPassword(password);
    }

    // Check GPA change for audit log
    let gpaChanged = false;
    const oldGpa = existing.studentProfile?.gpa;
    const newGpaValue = gpa !== undefined ? parseFloat(gpa) : undefined;

    if (newGpaValue !== undefined && oldGpa !== undefined && newGpaValue !== oldGpa) {
      gpaChanged = true;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...userUpdateData,
        ...(existing.role === "STUDENT" && existing.studentProfile
          ? {
              studentProfile: {
                update: {
                  ...(studentId ? { studentId } : {}),
                  ...(universityCode ? { universityCode } : {}),
                  ...(academicYearId ? { academicYearId } : {}),
                  ...(newGpaValue !== undefined ? { gpa: newGpaValue } : {}),
                  ...(totalCredits !== undefined ? { totalCredits: parseInt(totalCredits, 10) } : {}),
                },
              },
            }
          : {}),
        ...((existing.role === "DOCTOR" || existing.role === "TA") && existing.facultyProfile
          ? {
              facultyProfile: {
                update: {
                  ...(title !== undefined ? { title: title || null } : {}),
                  ...(officeRoom !== undefined ? { officeRoom: officeRoom || null } : {}),
                  ...(specialty !== undefined ? { specialty: specialty || null } : {}),
                },
              },
            }
          : {}),
      },
      include: {
        department: true,
        studentProfile: { include: { academicYear: true } },
        facultyProfile: true,
      },
    });

    if (gpaChanged) {
      await logAudit({
        actorId: adminUser.id,
        targetId: id,
        action: "GPA_UPDATE",
        targetType: "STUDENT_PROFILE",
        details: {
          studentName: existing.name,
          studentId: existing.studentProfile?.studentId,
          oldGpa,
          newGpa: newGpaValue,
        },
      });
    } else {
      await logAudit({
        actorId: adminUser.id,
        targetId: id,
        action: "USER_UPDATE",
        targetType: "USER",
        details: { fields: Object.keys(body) },
      });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "تعذر تحديث بيانات المستخدم." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بحذف المستخدمين." }, { status: 403 });
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (adminUser.id === id) {
      return NextResponse.json({ error: "لا يمكنك حذف حسابك الشخصي الحالي." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    await logAudit({
      actorId: adminUser.id,
      targetId: id,
      action: "USER_DELETE",
      targetType: "USER",
    });

    return NextResponse.json({ success: true, message: "تم حذف المستخدم بنجاح." });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "تعذر حذف المستخدم." }, { status: 500 });
  }
}
