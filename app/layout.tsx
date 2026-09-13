import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

import { prisma } from "@/lib/prisma";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    const name = settings?.shortName || settings?.instituteName || "معهد الحاسبات";
    const desc =
      settings?.description ||
      "بوابة المعهد العالي لعلوم الحاسب ونظم المعلومات بمدينة الثقافة والعلوم بالسادس من أكتوبر";
    return {
      title: `${name} | مدينة الثقافة والعلوم`,
      description: desc,
      manifest: "/manifest.json",
    };
  } catch {
    return {
      title: "CSIS Portal | مدينة الثقافة والعلوم",
      description: "بوابة المعهد العالي لعلوم الحاسب ونظم المعلومات — مدينة الثقافة والعلوم",
      manifest: "/manifest.json",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased bg-[#0B1121] text-white`}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <PortalLayout>{children}</PortalLayout>
              <ServiceWorkerRegister />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}