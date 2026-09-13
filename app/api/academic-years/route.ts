import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const years = await prisma.academicYear.findMany({
      orderBy: { level: "asc" },
      include: {
        _count: {
          select: { students: true, subjects: true, schedules: true },
        },
      },
    });
    return NextResponse.json({ years });
  } catch (error) {
    console.error("Academic years fetch error:", error);
    return NextResponse.json({ error: "تعذر تحميل الفرق الدراسية." }, { status: 500 });
  }
}
