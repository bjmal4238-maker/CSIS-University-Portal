import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { LoginSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبان بصيغة صحيحة." },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check rate limit: 5 requests per 60 seconds per IP + email
    const limitResult = checkRateLimit(`login:${ip}:${normalizedEmail}`, {
      limit: 5,
      windowSeconds: 60,
    });

    if (!limitResult.success) {
      return NextResponse.json(
        { error: "تم تجاوز عدد محاولات الدخول المسموح بها. يرجى المحاولة بعد دقيقة." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        studentProfile: true,
        facultyProfile: true,
        department: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    // Account status check
    if (user.status === "PENDING") {
      return NextResponse.json(
        {
          error: "حسابك قيد المراجعة من إدارة المعهد.",
          status: "PENDING",
        },
        { status: 403 }
      );
    }

    if (user.status === "REJECTED") {
      return NextResponse.json(
        {
          error: "تم رفض طلب تسجيل هذا الحساب من إدارة المعهد.",
          status: "REJECTED",
        },
        { status: 403 }
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        {
          error: "تم إيقاف هذا الحساب من قِبل إدارة المعهد. يرجى مراجعة شؤون الطلاب أو الإدارة.",
          status: "SUSPENDED",
        },
        { status: 403 }
      );
    }

    // Active user: sign token
    const token = signToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      rememberMe ? "30d" : "7d"
    );

    let redirectUrl = "/";
    if (user.role === "ADMIN") redirectUrl = "/admin";
    else if (user.role === "DOCTOR" || user.role === "TA") redirectUrl = "/dashboard/faculty";
    else if (user.role === "STUDENT") redirectUrl = "/dashboard/student";

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      redirectUrl,
    });

    // Set HTTP-only Cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
      path: "/",
    });

    await logAudit({
      actorId: user.id,
      targetId: user.id,
      action: "USER_LOGIN",
      targetType: "USER",
      details: { role: user.role },
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء تسجيل الدخول." },
      { status: 500 }
    );
  }
}
