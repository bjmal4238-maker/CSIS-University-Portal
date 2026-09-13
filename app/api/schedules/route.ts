import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ScheduleCreateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const academicYearId = searchParams.get("academicYearId");
    const departmentId = searchParams.get("departmentId");
    const doctorId = searchParams.get("doctorId");
    const taId = searchParams.get("taId");
    const dayOfWeek = searchParams.get("dayOfWeek");

    const where: Record<string, unknown> = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (departmentId) where.departmentId = departmentId;
    if (doctorId) where.doctorId = doctorId;
    if (taId) where.taId = taId;
    if (dayOfWeek) where.dayOfWeek = dayOfWeek;

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      include: {
        subject: { select: { id: true, name: true, code: true, creditHours: true } },
        academicYear: { select: { id: true, name: true, code: true, level: true } },
        department: { select: { id: true, name: true, code: true } },
        doctor: { select: { id: true, name: true, email: true } },
        ta: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Fetch schedules error:", error);
    return NextResponse.json({ error: "تعذر تحميل الجدول الدراسي." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بإنشاء أو تعديل الجداول الدراسية." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = ScheduleCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const {
      subjectId,
      departmentId,
      academicYearId,
      doctorId,
      taId,
      dayOfWeek,
      startTime,
      endTime,
      room,
      type,
    } = parsed.data;

    const schedule = await prisma.schedule.create({
      data: {
        subjectId,
        departmentId,
        academicYearId,
        doctorId: doctorId || null,
        taId: taId || null,
        dayOfWeek,
        startTime,
        endTime,
        room,
        type,
      },
      include: {
        subject: true,
        academicYear: true,
        department: true,
        doctor: { select: { id: true, name: true } },
        ta: { select: { id: true, name: true } },
      },
    });

    await logAudit({
      actorId: user.id,
      targetId: schedule.id,
      action: "SCHEDULE_CREATE",
      targetType: "SCHEDULE",
      details: { subjectId, dayOfWeek, startTime, endTime, room, type },
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    console.error("Create schedule error:", error);
    return NextResponse.json({ error: "تعذر إضافة الحصة للجدول." }, { status: 500 });
  }
}
