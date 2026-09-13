import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DepartmentCreateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { subjects: true, users: true, schedules: true },
        },
      },
    });
    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Fetch departments error:", error);
    return NextResponse.json({ error: "تعذر تحميل الأقسام." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بإضافة قسم جديد." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = DepartmentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { name, code, description, headOfDepartment } = parsed.data;

    const existing = await prisma.department.findFirst({
      where: { OR: [{ name }, { code }] },
    });
    if (existing) {
      return NextResponse.json({ error: "القسم أو كود القسم مسجل مسبقاً." }, { status: 409 });
    }

    const department = await prisma.department.create({
      data: { name, code, description, headOfDepartment },
    });

    await logAudit({
      actorId: user.id,
      targetId: department.id,
      action: "DEPARTMENT_CREATE",
      targetType: "DEPARTMENT",
      details: { name, code },
    });

    return NextResponse.json({ success: true, department });
  } catch (error) {
    console.error("Create department error:", error);
    return NextResponse.json({ error: "تعذر إنشاء القسم." }, { status: 500 });
  }
}
