import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DepartmentCreateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بتعديل القسم." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = DepartmentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { name, code, description, headOfDepartment } = parsed.data;

    const updated = await prisma.department.update({
      where: { id },
      data: { name, code, description, headOfDepartment },
    });

    await logAudit({
      actorId: user.id,
      targetId: id,
      action: "DEPARTMENT_UPDATE",
      targetType: "DEPARTMENT",
      details: { name, code },
    });

    return NextResponse.json({ success: true, department: updated });
  } catch (error) {
    console.error("Update department error:", error);
    return NextResponse.json({ error: "تعذر تحديث القسم." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بحذف القسم." }, { status: 403 });
    }

    const { id } = await params;

    await prisma.department.delete({ where: { id } });

    await logAudit({
      actorId: user.id,
      targetId: id,
      action: "DEPARTMENT_DELETE",
      targetType: "DEPARTMENT",
    });

    return NextResponse.json({ success: true, message: "تم حذف القسم بنجاح." });
  } catch (error) {
    console.error("Delete department error:", error);
    return NextResponse.json({ error: "تعذر حذف القسم." }, { status: 500 });
  }
}
