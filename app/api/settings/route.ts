import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SiteSettingsUpdateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: "default" },
      });
    }

    const res = NextResponse.json({ settings });
    res.cookies.set("csis_maintenance_mode", settings.maintenanceMode ? "1" : "0", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
    return res;
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "تعذر تحميل إعدادات الموقع." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بتعديل إعدادات المعهد." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = SiteSettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const current = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    const maintenanceChanged =
      parsed.data.maintenanceMode !== undefined &&
      parsed.data.maintenanceMode !== current?.maintenanceMode;

    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: {
        id: "default",
        ...parsed.data,
      },
    });

    if (maintenanceChanged) {
      await logAudit({
        actorId: user.id,
        targetId: "default",
        action: "MAINTENANCE_TOGGLE",
        targetType: "SETTINGS",
        details: { maintenanceMode: parsed.data.maintenanceMode },
      });
    } else {
      await logAudit({
        actorId: user.id,
        targetId: "default",
        action: "SETTINGS_UPDATE",
        targetType: "SETTINGS",
        details: parsed.data,
      });
    }

    const res = NextResponse.json({ success: true, settings: updated });
    res.cookies.set("csis_maintenance_mode", updated.maintenanceMode ? "1" : "0", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
    return res;
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "تعذر حفظ إعدادات الموقع." }, { status: 500 });
  }
}
