"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { listAllUsers, approveUser, rejectUser } from "@/lib/services/users";
import { ROLE_LABELS } from "@/lib/rbac/permissions";
import type { UserProfile, UserRole } from "@/types";
import { CheckCircle, Shield, UserCog, Loader2, Ban } from "lucide-react";

const APPROVE_ROLES: UserRole[] = ["student", "ta", "doctor"];

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setUsers(await listAllUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === "admin") void fetchUsers();
  }, [profile]);

  if (profile?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Shield className="mb-4 h-16 w-16 text-red-500 opacity-50" />
        <h1 className="text-2xl font-bold">صلاحيات غير كافية</h1>
      </div>
    );
  }

  const pending = users.filter((u) => u.status === "pending");
  const rest = users.filter((u) => u.status !== "pending");

  return (
    <div>
      <div className="mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
        <UserCog className="h-8 w-8 text-[var(--gold)]" />
        <h1 className="text-3xl font-extrabold">لوحة الإدارة والموافقات</h1>
      </div>

      <UserTable
        title="حسابات بانتظار التأكيد"
        empty="لا توجد طلبات معلّقة."
        loading={loading}
        users={pending}
        onApprove={async (uid, role) => {
          await approveUser(uid, role, "active");
          await fetchUsers();
        }}
        onReject={async (uid) => {
          await rejectUser(uid);
          await fetchUsers();
        }}
      />

      <div className="mt-8">
        <UserTable title="كل الحسابات المحفوظة" empty="لا يوجد مستخدمون." loading={loading} users={rest} />
      </div>
    </div>
  );
}

function UserTable({
  title,
  empty,
  loading,
  users,
  onApprove,
  onReject,
}: {
  title: string;
  empty: string;
  loading: boolean;
  users: UserProfile[];
  onApprove?: (uid: string, role: UserRole) => Promise<void>;
  onReject?: (uid: string) => Promise<void>;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-700 bg-[#1E293B]/80">
      <div className="border-b border-gray-700 bg-[#0F172A]/50 p-6">
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
        </div>
      ) : (
        <table className="w-full text-right text-sm">
          <thead className="bg-[#0F172A] text-gray-400">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">البريد</th>
              <th className="p-4">الفرقة / التخصص</th>
              <th className="p-4">الصفة</th>
              {onApprove && <th className="p-4 text-center">إجراء</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((user) => (
              <tr key={user.uid}>
                <td className="p-4 font-bold">{user.displayName}</td>
                <td className="p-4 font-mono text-left text-gray-400" dir="ltr">{user.email}</td>
                <td className="p-4 text-white/60">{[user.year, user.major, user.studentId].filter(Boolean).join(" • ") || "—"}</td>
                <td className="p-4">{ROLE_LABELS[user.requestedRole || user.role]}</td>
                {onApprove && (
                  <td className="p-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {APPROVE_ROLES.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => void onApprove(user.uid, role)}
                          className="flex items-center gap-1 rounded-lg border border-[#4CD08A]/30 bg-[#4CD08A]/10 px-2 py-1 text-[11px] font-bold text-[#4CD08A]"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {ROLE_LABELS[role]}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => onReject && void onReject(user.uid)}
                        className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-400"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        رفض
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">{empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
