import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always respond with success to prevent user enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "إذا كان هذا البريد مسجلاً، فقد تم إرسال رابط استعادة كلمة المرور.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء طلب إعادة التعيين بنجاح.",
      resetToken: process.env.NODE_ENV === "development" ? token : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء معالجة الطلب." }, { status: 500 });
  }
}
