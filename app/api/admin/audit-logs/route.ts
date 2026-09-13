import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك باستعراض سجل العمليات." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const targetType = searchParams.get("targetType");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (targetType) where.targetType = targetType;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, name: true, role: true, email: true } },
          target: { select: { id: true, name: true, role: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Fetch audit logs error:", error);
    return NextResponse.json({ error: "تعذر تحميل سجل التدقيق." }, { status: 500 });
  }
}
