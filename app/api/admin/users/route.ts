import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك باستعراض المستخدمين." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.trim();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);

    const where: Record<string, unknown> = {};
    if (role && role !== "ALL") where.role = role;
    if (status && status !== "ALL") where.status = status;

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        {
          studentProfile: {
            OR: [
              { studentId: { contains: query } },
              { universityCode: { contains: query } },
            ],
          },
        },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          department: { select: { id: true, name: true, code: true } },
          studentProfile: {
            include: {
              academicYear: { select: { id: true, name: true, code: true, level: true } },
            },
          },
          facultyProfile: true,
        },
      }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Admin list users error:", error);
    return NextResponse.json({ error: "تعذر تحميل قائمة المستخدمين." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بإضافة مستخدم." }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      status = "ACTIVE",
      departmentId,
      studentId,
      universityCode,
      academicYearId,
      gpa = 0.0,
      title,
      officeRoom,
      specialty,
    } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "الاسم، البريد، كلمة المرور، والدور مطلوبة." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقاً." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const created = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role,
        status,
        departmentId: departmentId || null,
        ...(role === "STUDENT" && studentId && universityCode && academicYearId
          ? {
              studentProfile: {
                create: {
                  studentId,
                  universityCode,
                  academicYearId,
                  gpa: parseFloat(gpa) || 0.0,
                  totalCredits: 0,
                },
              },
            }
          : {}),
        ...(role === "DOCTOR" || role === "TA"
          ? {
              facultyProfile: {
                create: {
                  title: title || (role === "DOCTOR" ? "دكتور" : "معيد"),
                  officeRoom: officeRoom || null,
                  specialty: specialty || null,
                },
              },
            }
          : {}),
      },
    });

    await logAudit({
      actorId: user.id,
      targetId: created.id,
      action: "USER_CREATE_BY_ADMIN",
      targetType: "USER",
      details: { role, email: normalizedEmail },
    });

    return NextResponse.json({ success: true, user: created });
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json({ error: "تعذر إنشاء المستخدم." }, { status: 500 });
  }
}
