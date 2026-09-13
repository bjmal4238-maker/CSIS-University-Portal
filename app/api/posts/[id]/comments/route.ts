import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CommentCreateSchema } from "@/lib/validators";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await prisma.comment.findMany({
      where: { postId: id },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json({ error: "تعذر تحميل التعليقات." }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول للتعليق." }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "المنشور غير موجود." }, { status: 404 });
    }

    if (!post.allowComments) {
      return NextResponse.json(
        { error: "التعليقات معطلة على هذا المنشور من قِبل الناشر." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = CommentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        authorId: user.id,
        content: parsed.data.content,
      },
      include: {
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "تعذر إضافة التعليق." }, { status: 500 });
  }
}
