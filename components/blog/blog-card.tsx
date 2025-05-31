"use client";
import React from "react";
import Image from "next/image";

interface BlogPost {
  id: number;
  category: string;
  categorySecondary?: string;
  date: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
}

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard = ({ post }: BlogCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <article className="group relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 hover:border-darkPrimary/30 transition-all duration-300 hover:bg-zinc-900/60 cursor-pointer overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-darkPrimary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      
      {/* Content */}
      <div className="relative z-10 space-y-4">
        {/* Header with categories and date */}
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-darkPrimary/15 text-darkPrimary border border-darkPrimary/20">
              {post.category}
            </span>
            {post.categorySecondary && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                {post.categorySecondary}
              </span>
            )}
          </div>
          <time className="text-xs text-zinc-500 font-medium tracking-wide">
            {post.date}
          </time>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white leading-snug group-hover:text-darkPrimary/90 transition-colors duration-200 line-clamp-2">
            {post.title}
          </h3>
        </div>

        {/* Author section */}
        <div className="flex items-center gap-3 pt-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden ring-2 ring-zinc-800 group-hover:ring-darkPrimary/30 transition-all duration-200">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={32}
                height={32}
                className="rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
              />
              <div className="hidden w-full h-full bg-zinc-600 flex items-center justify-center text-white text-xs font-semibold">
                {getInitials(post.author.name)}
              </div>
            </div>
            {/* Small accent dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-darkPrimary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-300 truncate">
              {post.author.name}
            </p>
          </div>
        </div>
      </div>

      {/* Subtle border accent on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-darkPrimary/20 via-transparent to-darkPrimary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
           style={{ padding: '1px', background: 'linear-gradient(135deg, rgba(198, 157, 248, 0.2), transparent, rgba(198, 157, 248, 0.1))' }}>
        <div className="w-full h-full bg-zinc-900/40 rounded-2xl" />
      </div>
    </article>
  );
};
