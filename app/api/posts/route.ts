import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PostCreateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const where: Record<string, unknown> = {};
    if (subjectId) where.subjectId = subjectId;

    const posts = await prisma.post.findMany({
      where,
      take: limit,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
        subject: {
          select: { id: true, name: true, code: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, role: true, avatarUrl: true } },
          },
        },
        reactions: {
          select: { id: true, userId: true, type: true },
        },
      },
    });

    // Map posts with user reaction and counts
    const mapped = posts.map((post) => {
      const myReaction = user ? post.reactions.find((r) => r.userId === user.id)?.type || null : null;
      return {
        ...post,
        reactionsCount: post.reactions.length,
        commentsCount: post.comments.length,
        myReaction,
      };
    });

    return NextResponse.json({ posts: mapped });
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json({ error: "تعذر تحميل المنشورات." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً." }, { status: 401 });
    }

    // Students cannot create posts according to rule 15
    if (user.role === "STUDENT") {
      return NextResponse.json(
        { error: "غير مصرح للطلاب بإنشاء منشورات. يمكنك التفاعل والتعليق فقط." },
        { status: 403 }
      );
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

    // Only Admin can pin posts
    const shouldPin = user.role === "ADMIN" ? isPinned : false;

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        title: title || null,
        content,
        subjectId: subjectId || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        allowComments,
        allowReactions,
        isPinned: shouldPin,
      },
      include: {
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
    });

    await logAudit({
      actorId: user.id,
      targetId: post.id,
      action: "POST_CREATE",
      targetType: "POST",
      details: { title: title || content.slice(0, 50) },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "تعذر نشر المنشور." }, { status: 500 });
  }
}
