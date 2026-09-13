import { prisma } from "@/lib/prisma";

export interface LogAuditParams {
  actorId?: string | null;
  targetId?: string | null;
  action: string;
  targetType: "USER" | "STUDENT_PROFILE" | "SUBJECT" | "SCHEDULE" | "SETTINGS" | "ATTENDANCE" | "POST" | "DEPARTMENT";
  details?: Record<string, unknown> | string;
  ipAddress?: string | null;
}

export async function logAudit({
  actorId,
  targetId,
  action,
  targetType,
  details,
  ipAddress,
}: LogAuditParams): Promise<void> {
  try {
    const detailsStr = typeof details === "object" ? JSON.stringify(details) : details;
    await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        targetId: targetId || null,
        action,
        targetType,
        details: detailsStr || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}
