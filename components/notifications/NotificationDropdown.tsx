"use client";

import { motion } from "framer-motion";
import { Check, CheckCircle2, Circle } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

function timeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' });
    
    if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return rtf.format(-diffInMinutes, 'minute');
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return rtf.format(-diffInHours, 'hour');
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return rtf.format(-diffInDays, 'day');
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return rtf.format(-diffInMonths, 'month');
    const diffInYears = Math.floor(diffInDays / 365);
    return rtf.format(-diffInYears, 'year');
  } catch {
    return "";
  }
}

export function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 mt-2 w-80 md:w-96 bg-[#0F1629] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0F1629]">
        <h3 className="font-semibold text-white/90">الإشعارات</h3>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-white/50 text-sm">
            لا توجد إشعارات حالياً
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                className={`p-4 border-b border-white/5 transition-colors cursor-pointer hover:bg-white/5 ${
                  notification.isRead ? "opacity-75" : "bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    {notification.isRead ? (
                      <Check className="w-4 h-4 text-white/30" />
                    ) : (
                      <Circle className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${notification.isRead ? 'text-white/70' : 'text-white/90'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-white/50 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-white/40 mt-2">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
