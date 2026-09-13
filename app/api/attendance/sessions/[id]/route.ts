import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً." }, { status: 401 });
    }

    const { id } = await params;

    const session = await prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        academicYear: { select: { id: true, name: true, code: true, level: true } },
        creator: { select: { id: true, name: true, role: true } },
        records: {
          orderBy: { markedAt: "asc" },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                studentProfile: {
                  select: {
                    studentId: true,
                    universityCode: true,
                    gpa: true,
                    academicYear: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "جلسة الحضور غير موجودة." }, { status: 404 });
    }

    // Only creator or admin can view the full session attendees
    if (session.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك باستعراض كشف الحضور لهذه الجلسة." }, { status: 403 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Fetch session detail error:", error);
    return NextResponse.json({ error: "تعذر تحميل تفاصيل الجلسة." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً." }, { status: 401 });
    }

    const { id } = await params;
    const session = await prisma.attendanceSession.findUnique({ where: { id } });

    if (!session) {
      return NextResponse.json({ error: "الجلسة غير موجودة." }, { status: 404 });
    }

    if (session.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بإغلاق هذه الجلسة." }, { status: 403 });
    }

    await prisma.attendanceSession.update({
      where: { id },
      data: { isActive: false },
    });

    await logAudit({
      actorId: user.id,
      targetId: id,
      action: "ATTENDANCE_SESSION_CLOSE",
      targetType: "ATTENDANCE",
    });

    return NextResponse.json({ success: true, message: "تم إنهاء جلسة الحضور بنجاح." });
  } catch (error) {
    console.error("Close session error:", error);
    return NextResponse.json({ error: "تعذر إغلاق الجلسة." }, { status: 500 });
  }
}
