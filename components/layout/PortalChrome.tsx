"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { ROLE_LABELS } from "@/lib/rbac/permissions";
import type { UserRole } from "@/types";

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-[#F6E7CB] text-[#8A5E12]",
  doctor: "bg-[#DCE1F0] text-[var(--ink)]",
  ta: "bg-[#D9EFE8] text-[var(--teal)]",
  student: "bg-[#F0EEEA] text-[var(--faded)]",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[10.5px] font-bold ${ROLE_STYLES[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

export function TopBar() {
  const { profile } = useAuth();
  const dateStr = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex items-center justify-between border-b border-[var(--line)] bg-white px-8 py-4">
      <div className="text-sm font-semibold text-[var(--faded)]">{dateStr}</div>
      {profile && (
        <div className="flex items-center gap-3">
          <RoleBadge role={profile.role} />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sidebar-bg)] text-sm font-bold text-white">
            {profile.displayName.charAt(0)}
          </div>
        </div>
      )}
    </header>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--gold)]">
          {eyebrow}
        </div>
      )}
      <h1 className="mt-1 text-2xl font-extrabold text-[var(--ink)]">{title}</h1>
      {description && (
        <p className="mt-1 max-w-xl text-sm leading-7 text-[var(--faded)]">
          {description}
        </p>
      )}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius)] border border-[var(--line)] bg-white shadow-[var(--shadow)] ${className}`}
    >
      {children}
    </div>
  );
}
