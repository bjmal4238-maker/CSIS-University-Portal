import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لبيانات الإدارة." }, { status: 403 });
    }

    const [
      totalStudents,
      totalDoctors,
      totalTAs,
      pendingCount,
      activeSessionsCount,
      totalPosts,
      totalDepartments,
      totalSubjects,
      years,
      departments,
      recentSessions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "DOCTOR" } }),
      prisma.user.count({ where: { role: "TA" } }),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.attendanceSession.count({ where: { isActive: true } }),
      prisma.post.count(),
      prisma.department.count(),
      prisma.subject.count(),
      prisma.academicYear.findMany({
        select: {
          id: true,
          name: true,
          level: true,
          _count: { select: { students: true } },
        },
        orderBy: { level: "asc" },
      }),
      prisma.department.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          _count: { select: { users: true, subjects: true } },
        },
      }),
      prisma.attendanceSession.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          subject: { select: { name: true } },
          creator: { select: { name: true } },
          _count: { select: { records: true } },
        },
      }),
    ]);

    const studentsByYear = years.map((y) => ({
      name: y.name,
      level: y.level,
      count: y._count.students,
    }));

    const studentsByDept = departments.map((d) => ({
      name: d.name,
      code: d.code,
      count: d._count.users,
    }));

    return NextResponse.json({
      metrics: {
        totalStudents,
        totalDoctors,
        totalTAs,
        pendingCount,
        activeSessionsCount,
        totalPosts,
        totalDepartments,
        totalSubjects,
      },
      charts: {
        studentsByYear,
        studentsByDept,
        recentSessions,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ error: "تعذر تحميل مؤشرات الإدارة." }, { status: 500 });
  }
}
