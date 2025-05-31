import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types/blog";
import { getMediaUrl, getCategoryName, formatBlogDate, getAuthorInitials } from "@/lib/utils/blog-utils";

interface BlogListServerProps {
  blogs: Blog[];
}

export const BlogListServer: React.FC<BlogListServerProps> = ({ blogs }) => {
  if (blogs.length === 0) {
    return (
      <div className="relative">
        {/* Background container */}
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">No articles found</p>
            <p className="text-zinc-500 text-sm mt-2">Check back later for new content</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background container */}
      <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
        {/* List */}
        <div className="space-y-1">
          {blogs.map((post, index) => {
            const categoryName = getCategoryName(post.category);
            const thumbnailUrl = getMediaUrl(post.thumbnail);
            const publishedDate = post.publishedAt ? formatBlogDate(post.publishedAt) : 'Draft';
            const blogUrl = post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`;
            
            return (
              <Link key={post.id} href={blogUrl}>
                <article className="group flex items-center justify-between py-4 px-4 rounded-xl hover:bg-zinc-800/30 transition-all duration-200 cursor-pointer">
                  {/* Left side - Title and category */}
                  <div className="flex-1 min-w-0 mr-6">
                    <h3 className="text-base font-medium text-white group-hover:text-darkPrimary/90 transition-colors duration-200 truncate">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-zinc-400">
                        {categoryName}
                      </span>
                    </div>
                  </div>

                  {/* Center - Date */}
                  <div className="hidden md:block mr-6">
                    <time className="text-sm text-zinc-500 font-medium">
                      {publishedDate}
                    </time>
                  </div>

                  {/* Right side - Author placeholder */}
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      <div className="relative w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden ring-2 ring-zinc-900 group-hover:ring-darkPrimary/30 transition-all duration-200">
                        <Image
                          src={thumbnailUrl}
                          alt="Author"
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Decorative blur */}
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-darkPrimary/10 to-transparent rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}; 