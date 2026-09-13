"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Heart, Pin, ChevronLeft, Newspaper } from "lucide-react";

interface PostItem {
  id: string;
  title?: string | null;
  content: string;
  isPinned: boolean;
  createdAt: Date | string;
  author: {
    name: string;
    role: string;
  };
  subject?: {
    name: string;
  } | null;
  _count: {
    comments: number;
    reactions: number;
  };
}

interface NewsSectionProps {
  posts: PostItem[];
}

export function NewsSection({ posts }: NewsSectionProps) {
  const formatRole = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "إدارة المعهد";
      case "DOCTOR":
        return "عضو هيئة تدريس";
      case "TA":
        return "هيئة معاونة";
      default:
        return "طالب";
    }
  };

  return (
    <section id="news" className="border-t border-white/10 py-20 bg-[#0A0F1E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Newspaper className="h-4 w-4" />
              <span>لوحة الإعلانات والأخبار</span>
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-white">
              آخر أخبار وتنويهات المعهد
            </h2>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
          >
            <span>دخول البوابة لكافة المنشورات والتفاعل</span>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center text-slate-400 text-xs">
            لا توجد إعلانات منشورة حالياً.
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <motion.article
                key={post.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-6 hover:border-amber-500/30 hover:bg-white/[0.04] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300">{post.author.name}</span>
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px]">
                        {formatRole(post.author.role)}
                      </span>
                    </div>

                    {post.isPinned && (
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Pin className="h-3 w-3" />
                        <span>مثبت</span>
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-white line-clamp-2">
                    {post.title || post.content.slice(0, 50)}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-4">
                    {post.content}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3.5 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-rose-400" />
                      <span>{post._count.reactions}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
                      <span>{post._count.comments}</span>
                    </span>
                  </div>

                  {post.subject ? (
                    <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] text-amber-300 font-bold">
                      {post.subject.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(post.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

