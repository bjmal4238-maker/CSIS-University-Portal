"use client";

import React from "react";
import { MapPin, Phone, Mail, Clock, ExternalLink, Navigation } from "lucide-react";

interface CampusLocationProps {
  phone?: string;
  email?: string;
  address?: string;
}

export function CampusLocation({
  phone = "02-38350000",
  email = "info@csi.edu.eg",
  address = "مدينة الثقافة والعلوم، المحور المركزي، أمام جهاز مدينة 6 أكتوبر، الجيزة، مصر",
}: CampusLocationProps) {
  return (
    <section id="location" className="border-t border-white/10 py-20 bg-[#080D18] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <MapPin className="h-4 w-4" />
              <span>المقر الجغرافي والاتصال</span>
            </div>

            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-white">
              موقع متميز بقلب مدينة السادس من أكتوبر
            </h2>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-400">
              يقع المعهد داخل المجمع التعليمي لمدينة الثقافة والعلوم بالسادس من أكتوبر، بموقع استراتيجي يسهل الوصول إليه عبر شبكة المحاور وخطوط النقل والمواصلات.
            </p>

            <div className="mt-8 space-y-4 text-xs">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <MapPin className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-bold">العنوان الدقيق:</strong>
                  <span className="text-slate-300 mt-1 block">{address}</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <Phone className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <strong className="block text-white font-bold">هاتف الاستعلامات:</strong>
                    <span className="text-slate-300 mt-0.5 block font-mono" dir="ltr">
                      {phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <Mail className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <strong className="block text-white font-bold">البريد الرسمي:</strong>
                    <span className="text-slate-300 mt-0.5 block font-mono" dir="ltr">
                      {email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <Clock className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <div>
                  <strong className="block text-white font-bold">ساعات العمل الرسمية:</strong>
                  <span className="text-slate-300 mt-0.5 block">
                    السبت – الخميس: 8:30 صباحاً حتى 3:30 عصراً (الإجازة الأسبوعية: الجمعة)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Visual Box */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#0E1626] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-amber-400" />
                  <span className="text-xs font-bold text-white">خريطة الحرم الجامعي</span>
                </div>
                <a
                  href="https://maps.google.com/?q=City+of+Culture+and+Science+6th+of+October"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
                >
                  <span>فتح في Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Styled Mock Interactive Campus Map */}
              <div className="mt-5 relative h-72 w-full rounded-2xl bg-[#090D18] border border-white/10 overflow-hidden flex items-center justify-center p-6 text-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <MapPin className="h-8 w-8 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">مدينة الثقافة والعلوم</h4>
                    <p className="text-xs text-amber-400 font-bold mt-0.5">
                      مبنى معهد علوم الحاسب ونظم المعلومات
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                      المحور المركزي - الحي الأول - السادس من أكتوبر
                    </p>
                  </div>
                  <a
                    href="https://csi.edu.eg/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 shadow hover:bg-amber-400 transition"
                  >
                    <span>زيارة بوابة المدينة الرسمية csi.edu.eg</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

