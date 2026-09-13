import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PostCreateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً." }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "المنشور غير موجود." }, { status: 404 });
    }

    // Only author or admin can update
    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بتعديل هذا المنشور." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = PostCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const {
      title,
      content,
      subjectId,
      imageUrl,
      linkUrl,
      allowComments,
      allowReactions,
      isPinned,
    } = parsed.data;

    const shouldPin = user.role === "ADMIN" ? isPinned : post.isPinned;

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title: title || null,
        content,
        subjectId: subjectId || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        allowComments,
        allowReactions,
        isPinned: shouldPin,
      },
    });

    await logAudit({
      actorId: user.id,
      targetId: id,
      action: "POST_UPDATE",
      targetType: "POST",
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json({ error: "تعذر تحديث المنشور." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً." }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "المنشور غير موجود." }, { status: 404 });
    }

    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بحذف هذا المنشور." }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });

    await logAudit({
      actorId: user.id,
      targetId: id,
      action: "POST_DELETE",
      targetType: "POST",
    });

    return NextResponse.json({ success: true, message: "تم حذف المنشور بنجاح." });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "تعذر حذف المنشور." }, { status: 500 });
  }
}
