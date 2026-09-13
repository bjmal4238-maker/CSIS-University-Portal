import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1121] text-white p-6">
      <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mb-4">
          <Clock className="h-8 w-8 animate-pulse" />
        </div>
        <h1 className="text-xl font-black text-white">حسابك قيد المراجعة من إدارة المعهد</h1>
        <p className="mt-3 text-xs text-amber-200/80 leading-relaxed">
          تم استلام طلب التسجيل الخاص بك بنجاح، ويجري حالياً تدقيق واعتماد بياناتك من قِبل شؤون الطلاب وإدارة معهد الحاسبات ونظم المعلومات.
        </p>

        <div className="mt-8 border-t border-white/10 pt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-2.5 text-xs font-black text-slate-950 hover:brightness-110"
          >
            <span>العودة لصفحة تسجيل الدخول</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
