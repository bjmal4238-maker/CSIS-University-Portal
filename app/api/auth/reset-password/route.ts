import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "الرمز وكلمة المرور الجديدة (6 أحرف على الأقل) مطلوبان." },
        { status: 400 }
      );
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.isUsed || resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "رمز استعادة كلمة المرور غير صالح أو منتهي الصلاحية." },
        { status: 400 }
      );
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { isUsed: true },
      }),
    ]);

    await logAudit({
      actorId: resetRecord.userId,
      targetId: resetRecord.userId,
      action: "PASSWORD_RESET_COMPLETE",
      targetType: "USER",
    });

    return NextResponse.json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "تعذر إعادة تعيين كلمة المرور." }, { status: 500 });
  }
}
