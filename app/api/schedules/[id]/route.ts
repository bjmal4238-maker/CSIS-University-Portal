import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ScheduleCreateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بتعديل الجدول." }, { status: 403 });
    }

    const { id } = await params;
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

    const updated = await prisma.schedule.update({
      where: { id },
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
    });

    await logAudit({
      actorId: user.id,
      targetId: id,
      action: "SCHEDULE_UPDATE",
      targetType: "SCHEDULE",
      details: { dayOfWeek, startTime, room },
    });

    return NextResponse.json({ success: true, schedule: updated });
  } catch (error) {
    console.error("Update schedule error:", error);
    return NextResponse.json({ error: "تعذر تحديث الجدول." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بحذف الحصة من الجدول." }, { status: 403 });
    }

    const { id } = await params;

    await prisma.schedule.delete({ where: { id } });

    await logAudit({
      actorId: user.id,
      targetId: id,
      action: "SCHEDULE_DELETE",
      targetType: "SCHEDULE",
    });

    return NextResponse.json({ success: true, message: "تم حذف الحصة من الجدول بنجاح." });
  } catch (error) {
    console.error("Delete schedule error:", error);
    return NextResponse.json({ error: "تعذر حذف الحصة من الجدول." }, { status: 500 });
  }
}
