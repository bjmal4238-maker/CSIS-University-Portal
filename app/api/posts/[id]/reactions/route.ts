import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول للتفاعل." }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "المنشور غير موجود." }, { status: 404 });
    }

    if (!post.allowReactions) {
      return NextResponse.json(
        { error: "التفاعلات معطلة على هذا المنشور من قِبل الناشر." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reactionType = body.type || "LIKE";

    // Check if user already reacted to this post
    const existing = await prisma.reaction.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: user.id,
        },
      },
    });

    if (existing) {
      if (existing.type === reactionType) {
        // Toggle off (remove reaction)
        await prisma.reaction.delete({ where: { id: existing.id } });
        return NextResponse.json({ success: true, reacted: false, type: null });
      } else {
        // Update reaction type
        const updated = await prisma.reaction.update({
          where: { id: existing.id },
          data: { type: reactionType },
        });
        return NextResponse.json({ success: true, reacted: true, type: updated.type });
      }
    }

    // Create reaction
    const created = await prisma.reaction.create({
      data: {
        postId: id,
        userId: user.id,
        type: reactionType,
      },
    });

    return NextResponse.json({ success: true, reacted: true, type: created.type });
  } catch (error) {
    console.error("Toggle reaction error:", error);
    return NextResponse.json({ error: "تعذر تسجيل التفاعل." }, { status: 500 });
  }
}
