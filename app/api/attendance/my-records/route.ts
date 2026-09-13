import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "غير مصرح لك باستعراض سجلات الطالب." }, { status: 403 });
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: user.id },
      orderBy: { markedAt: "desc" },
      include: {
        session: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
            creator: { select: { id: true, name: true } },
            academicYear: { select: { name: true } },
          },
        },
      },
    });

    // Total sessions created for this student's academic year
    const totalSessions = await prisma.attendanceSession.count({
      where: { academicYearId: user.studentProfile?.academicYearId || "" },
    });

    const attendedCount = records.length;
    const attendancePercentage =
      totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 100;

    return NextResponse.json({
      records,
      stats: {
        attendedCount,
        totalSessions,
        attendancePercentage,
      },
    });
  } catch (error) {
    console.error("Fetch student attendance error:", error);
    return NextResponse.json({ error: "تعذر تحميل سجل الحضور." }, { status: 500 });
  }
}
