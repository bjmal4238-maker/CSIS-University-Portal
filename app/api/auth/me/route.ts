import { NextResponse } from "next/server";
import { getCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح لك بتنفيذ هذه العملية." }, { status: 401 });
    }

    const body = await req.json();
    const { phone, currentPassword, newPassword, avatarUrl } = body;

    const updateData: Record<string, unknown> = {};

    if (phone !== undefined) {
      updateData.phone = phone ? String(phone).trim() : null;
    }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl ? String(avatarUrl).trim() : null;
    }

    // Password change check
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "يرجى إدخال كلمة المرور الحالية لتأكيد التغيير." },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف." },
          { status: 400 }
        );
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!dbUser) {
        return NextResponse.json({ error: "المستخدم غير موجود." }, { status: 404 });
      }

      const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "كلمة المرور الحالية غير صحيحة." },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "لم يتم تقديم أي بيانات للتحديث." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث البيانات بنجاح.",
      user: updated,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "تعذر تحديث البيانات." }, { status: 500 });
  }
}
