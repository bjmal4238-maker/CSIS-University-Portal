import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AttendanceScanSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول كطالب لتسجيل الحضور." }, { status: 401 });
    }

    if (user.role !== "STUDENT" || !user.studentProfile) {
      return NextResponse.json(
        { error: "تسجيل الحضور بالـ QR مخصص لحسابات الطلاب فقط." },
        { status: 403 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "حسابك غير نشط، لا يمكنك تسجيل الحضور." },
        { status: 403 }
      );
    }

    // Rate limit: max 10 scan attempts per minute per student
    const limitResult = checkRateLimit(`scan:${user.id}`, { limit: 10, windowSeconds: 60 });
    if (!limitResult.success) {
      return NextResponse.json(
        { error: "لقد تجاوزت عدد محاولات مسح الرمز. يرجى الانتظار دقيقة والمحاولة مجدداً." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = AttendanceScanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "رمز الحضور مفقود أو غير صالح." }, { status: 400 });
    }

    const { token } = parsed.data;

    // 1. Locate attendance session
    const session = await prisma.attendanceSession.findUnique({
      where: { sessionToken: token },
      include: {
        subject: true,
        academicYear: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "رمز الحضور غير صالح." }, { status: 404 });
    }

    // 2. Check if session is explicitly closed
    if (!session.isActive) {
      return NextResponse.json(
        { error: "تم إغلاق جلسة الحضور من قِبل المحاضر." },
        { status: 400 }
      );
    }

    // 3. Check expiration
    const now = new Date();
    if (new Date(session.expiresAt) < now) {
      return NextResponse.json({ error: "انتهت صلاحية رمز الحضور." }, { status: 400 });
    }

    // 4. Check group/academic year match
    if (user.studentProfile.academicYearId !== session.academicYearId) {
      return NextResponse.json(
        { error: "هذه المحاضرة مخصصة لفرقة دراسية أخرى غير فرقتك المقيد بها." },
        { status: 403 }
      );
    }

    // 5. Prevent duplicate attendance
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: user.id,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          error: "تم تسجيل حضورك بالفعل.",
          alreadyMarked: true,
          markedAt: existingRecord.markedAt,
        },
        { status: 409 }
      );
    }

    // Extract IP and headers if available
    const ipAddress = req.headers.get("x-forwarded-for") || "local";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 6. Record attendance
    const record = await prisma.attendanceRecord.create({
      data: {
        sessionId: session.id,
        studentId: user.id,
        status: "PRESENT",
        ipAddress,
        deviceInfo: userAgent.slice(0, 150),
      },
    });

    // 7. Create in-app notification for the student
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "تم تسجيل الحضور بنجاح",
        message: `تم تسجيل حضورك في محاضرة مقرر: ${session.subject.name}`,
        type: "ATTENDANCE",
      },
    });

    await logAudit({
      actorId: user.id,
      targetId: session.id,
      action: "ATTENDANCE_SCAN_SUCCESS",
      targetType: "ATTENDANCE",
      details: {
        subjectName: session.subject.name,
        studentId: user.studentProfile.studentId,
        studentName: user.name,
      },
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل حضورك بنجاح.",
      subjectName: session.subject.name,
      markedAt: record.markedAt,
    });
  } catch (error) {
    console.error("Attendance scan error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الحضور. يرجى المحاولة ثانية." },
      { status: 500 }
    );
  }
}
