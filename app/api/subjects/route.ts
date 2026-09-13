import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SubjectCreateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const academicYearId = searchParams.get("academicYearId");
    const doctorId = searchParams.get("doctorId");
    const taId = searchParams.get("taId");

    const where: Record<string, unknown> = {};
    if (departmentId) where.departmentId = departmentId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (doctorId) where.doctorId = doctorId;
    if (taId) where.taId = taId;

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: { code: "asc" },
      include: {
        department: { select: { id: true, name: true, code: true } },
        academicYear: { select: { id: true, name: true, code: true, level: true } },
        doctor: { select: { id: true, name: true, email: true } },
        ta: { select: { id: true, name: true, email: true } },
        _count: {
          select: { schedules: true, sessions: true },
        },
      },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Fetch subjects error:", error);
    return NextResponse.json({ error: "تعذر تحميل المقررات الدراسية." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بإضافة مادة جديدة." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = SubjectCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { name, code, creditHours, departmentId, academicYearId, doctorId, taId, description } =
      parsed.data;

    const existing = await prisma.subject.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "كود المادة مسجل مسبقاً لمادة أخرى." }, { status: 409 });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        creditHours,
        departmentId,
        academicYearId,
        doctorId: doctorId || null,
        taId: taId || null,
        description: description || null,
      },
      include: {
        department: true,
        academicYear: true,
        doctor: { select: { id: true, name: true } },
        ta: { select: { id: true, name: true } },
      },
    });

    await logAudit({
      actorId: user.id,
      targetId: subject.id,
      action: "SUBJECT_CREATE",
      targetType: "SUBJECT",
      details: { name, code, departmentId, academicYearId },
    });

    return NextResponse.json({ success: true, subject });
  } catch (error) {
    console.error("Create subject error:", error);
    return NextResponse.json({ error: "تعذر إنشاء المقرر الدراسي." }, { status: 500 });
  }
}
