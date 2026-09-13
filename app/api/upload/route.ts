import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

// 5MB limit
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لرفع الملفات." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "لم يتم تحديد أي ملف للرفع." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "حجم الملف يتجاوز الحد الأقصى المسموح به (5 ميجابايت)." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. الصيغ المسموحة: JPG, PNG, WEBP, GIF, PDF." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extension safe check
    const extension = path.extname(file.name).toLowerCase() || (file.type === "application/pdf" ? ".pdf" : ".jpg");
    const safeExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"];
    const finalExt = safeExtensions.includes(extension) ? extension : ".jpg";

    const uniqueId = crypto.randomBytes(16).toString("hex");
    const fileName = `${Date.now()}-${uniqueId}${finalExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
      message: "تم رفع الملف بنجاح.",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "تعذر رفع الملف بسبب خطأ في الخادم." },
      { status: 500 }
    );
  }
}

