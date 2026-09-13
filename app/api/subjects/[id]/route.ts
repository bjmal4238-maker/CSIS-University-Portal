import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SubjectCreateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بتعديل المقرر الدراسي." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = SubjectCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { name, code, creditHours, departmentId, academicYearId, doctorId, taId, description } =
      parsed.data;

    // Check code duplication for other subject
    const existing = await prisma.subject.findFirst({
      where: { code, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: "كود المادة مستخدم لمقرر آخر." }, { status: 409 });
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        name,
        code,
        creditHours,
        departmentId,
        academicYearId,
        doctorId: doctorId || null,
        taId: taId || null,
        description: description || null,
      },
    });

    await logAudit({
      actorId: user.id,
      targetId: id,
      action: "SUBJECT_UPDATE",
      targetType: "SUBJECT",
      details: { name, code },
    });

    return NextResponse.json({ success: true, subject: updated });
  } catch (error) {
    console.error("Update subject error:", error);
    return NextResponse.json({ error: "تعذر تحديث المقرر الدراسي." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بحذف المقرر الدراسي." }, { status: 403 });
    }

    const { id } = await params;

    await prisma.subject.delete({ where: { id } });

    await logAudit({
      actorId: user.id,
      targetId: id,
      action: "SUBJECT_DELETE",
      targetType: "SUBJECT",
    });

    return NextResponse.json({ success: true, message: "تم حذف المقرر الدراسي بنجاح." });
  } catch (error) {
    console.error("Delete subject error:", error);
    return NextResponse.json({ error: "تعذر حذف المقرر الدراسي." }, { status: 500 });
  }
}
