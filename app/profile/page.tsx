"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";

export default function ProfileRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "STUDENT") {
      router.replace("/dashboard/student/profile");
    } else if (user?.role === "DOCTOR" || user?.role === "TA") {
      router.replace("/dashboard/faculty/profile");
    } else if (user?.role === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/login");
    }
  }, [user, router]);

  return null;
}
