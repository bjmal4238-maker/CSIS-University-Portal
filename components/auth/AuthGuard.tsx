"use client";

import { type ReactNode } from "react";

export function AuthGuard({ children }: { children: ReactNode; requireAuth?: boolean; path?: string }) {
  return <>{children}</>;
}
