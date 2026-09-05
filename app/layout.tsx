import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthProvider";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "CSIS Portal | مدينة الثقافة والعلوم",
  description: "بوابة المعهد العالي لعلوم الحاسب ونظم المعلومات — مدينة الثقافة والعلوم",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased bg-[#0B1121]`}>
        <AuthProvider>
          <PortalLayout>{children}</PortalLayout>
          <ServiceWorkerRegister />
        </AuthProvider>
      </body>
    </html>
  );
}