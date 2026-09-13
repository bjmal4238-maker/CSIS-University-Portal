import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بتغيير حالة الحسابات." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["ACTIVE", "PENDING", "REJECTED", "SUSPENDED"].includes(status)) {
      return NextResponse.json({ error: "حالة الحساب غير صالحة." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "المستخدم غير موجود." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
    });

    // If approved, notify the user
    if (status === "ACTIVE" && targetUser.status === "PENDING") {
      await prisma.notification.create({
        data: {
          userId: id,
          title: "تمت الموافقة على حسابك",
          message: "أهلاً بك! لقد تمت مراجعة واعتماد حسابك بنجاح من قِبل إدارة المعهد.",
          type: "APPROVAL",
        },
      });
    }

    await logAudit({
      actorId: adminUser.id,
      targetId: id,
      action: status === "ACTIVE" ? "USER_APPROVE" : `USER_STATUS_${status}`,
      targetType: "USER",
      details: {
        previousStatus: targetUser.status,
        newStatus: status,
        userName: targetUser.name,
      },
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message:
        status === "ACTIVE"
          ? "تم اعتماد وتفعيل الحساب بنجاح."
          : status === "REJECTED"
          ? "تم رفض الحساب."
          : "تم تعليق الحساب.",
    });
  } catch (error) {
    console.error("Change user status error:", error);
    return NextResponse.json({ error: "تعذر تحديث حالة الحساب." }, { status: 500 });
  }
}
