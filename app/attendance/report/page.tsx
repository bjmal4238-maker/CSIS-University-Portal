"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyReportRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/faculty/attendance/sessions");
  }, [router]);

  return null;
}
