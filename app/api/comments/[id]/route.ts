import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً." }, { status: 401 });
    }

    const { id } = await params;
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: "التعليق غير موجود." }, { status: 404 });
    }

    if (comment.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بحذف هذا التعليق." }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "تم حذف التعليق بنجاح." });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ error: "تعذر حذف التعليق." }, { status: 500 });
  }
}
