import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AttendanceSessionCreateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    const where: Record<string, unknown> = {};
    if (user.role === "DOCTOR" || user.role === "TA") {
      where.creatorId = user.id;
    }
    if (subjectId) where.subjectId = subjectId;

    const sessions = await prisma.attendanceSession.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        academicYear: { select: { id: true, name: true, code: true, level: true } },
        creator: { select: { id: true, name: true, role: true } },
        _count: { select: { records: true } },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Fetch attendance sessions error:", error);
    return NextResponse.json({ error: "تعذر تحميل جلسات الحضور." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "TA" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "غير مصرح لك بإنشاء جلسة حضور. هذه الصلاحية مخصصة لأعضاء هيئة التدريس والإدارة." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = AttendanceSessionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { subjectId, academicYearId, durationMinutes, room } = parsed.data;

    // Verify subject exists
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return NextResponse.json({ error: "المقرر الدراسي غير موجود." }, { status: 404 });
    }

    // Generate dynamic short-lived token
    const randomHex = crypto.randomBytes(18).toString("hex");
    const sessionToken = `csis_att_${Date.now()}_${randomHex}`;
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const session = await prisma.attendanceSession.create({
      data: {
        subjectId,
        academicYearId,
        creatorId: user.id,
        durationMinutes,
        sessionToken,
        expiresAt,
        room: room || null,
        isActive: true,
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        academicYear: { select: { id: true, name: true, code: true } },
        creator: { select: { id: true, name: true, role: true } },
      },
    });

    await logAudit({
      actorId: user.id,
      targetId: session.id,
      action: "ATTENDANCE_SESSION_CREATE",
      targetType: "ATTENDANCE",
      details: { subjectName: subject.name, durationMinutes, expiresAt },
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("Create attendance session error:", error);
    return NextResponse.json({ error: "تعذر إنشاء جلسة الحضور." }, { status: 500 });
  }
}
