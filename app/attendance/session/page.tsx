"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacySessionRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/faculty/attendance/create");
  }, [router]);

  return null;
}