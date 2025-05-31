import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types/blog";
import { getMediaUrl, getCategoryName, getCategoryColor, getAuthorInitials } from "@/lib/utils/blog-utils";

interface BlogHeroServerProps {
  featuredBlogs: Blog[];
}

export const BlogHeroServer: React.FC<BlogHeroServerProps> = ({ featuredBlogs }) => {
  const renderVisual = (type: string) => {
    const baseClasses = "absolute inset-0 opacity-20";
    
    switch (type) {
      case "wave":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <path
                d="M0,100 Q100,50 200,100 T400,100"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-darkPrimary"
              />
              <path
                d="M0,120 Q100,70 200,120 T400,120"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-darkPrimary"
              />
            </svg>
          </div>
        );
      case "dots":
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-darkPrimary/30 via-transparent to-transparent`}>
            <div className="absolute inset-4 bg-[radial-gradient(circle_at_50%_50%,rgba(198,157,248,0.3)_1px,transparent_1px)] bg-[length:20px_20px]" />
          </div>
        );
      case "lines":
        return (
          <div className={baseClasses}>
            <div className="absolute inset-4 bg-[linear-gradient(45deg,rgba(198,157,248,0.3)_1px,transparent_1px)] bg-[length:15px_15px]" />
          </div>
        );
      case "grid":
        return (
          <div className={baseClasses}>
            <div className="absolute inset-4 bg-[linear-gradient(rgba(198,157,248,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(198,157,248,0.2)_1px,transparent_1px)] bg-[length:25px_25px]" />
          </div>
        );
      case "arrow":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <path
                d="M50,150 L100,50 L150,150"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-darkPrimary"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getVisualType = (index: number): string => {
    const types = ["wave", "dots", "lines", "grid", "arrow"];
    return types[index % types.length];
  };

  if (featuredBlogs.length === 0) {
    return (
      <div className="relative mb-16">
        {/* Section header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-darkPrimary to-darkPrimary/50 rounded-full" />
            <h1 className="text-3xl font-bold text-white">Featured Articles</h1>
          </div>
          <p className="text-zinc-400 text-lg">
            No featured articles available at the moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-16">
      {/* Section header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-darkPrimary to-darkPrimary/50 rounded-full" />
          <h1 className="text-3xl font-bold text-white">Featured Articles</h1>
        </div>
        <p className="text-zinc-400 text-lg">
          Discover our most impactful insights and stories
        </p>
      </div>

      {/* Featured posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredBlogs.map((post, index) => {
          const categoryName = getCategoryName(post.category);
          const categoryColor = getCategoryColor(post.category);
          const thumbnailUrl = getMediaUrl(post.thumbnail);
          const blogUrl = post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`;
          
          return (
            <Link key={post.id} href={blogUrl}>
              <article
                className={`group relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 hover:border-darkPrimary/30 transition-all duration-300 hover:bg-zinc-900/60 cursor-pointer overflow-hidden ${
                  index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                {/* Visual background */}
                {renderVisual(getVisualType(index))}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-darkPrimary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                
                {/* Content */}
                <div className="relative z-10 space-y-4">
                  {/* Category */}
                  <div>
                    <span 
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border"
                      style={{
                        backgroundColor: `${categoryColor}15`,
                        color: categoryColor,
                        borderColor: `${categoryColor}20`,
                      }}
                    >
                      {categoryName}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`font-semibold text-white leading-snug group-hover:text-darkPrimary/90 transition-colors duration-200 ${
                    index === 0 ? 'text-2xl' : 'text-lg'
                  }`}>
                    {post.title}
                  </h3>

                  {/* Description */}
                  {post.description && (
                    <p className="text-zinc-400 text-sm line-clamp-2">
                      {post.description}
                    </p>
                  )}

                  {/* Author placeholder - since we don't have author data in the Blog type */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden ring-2 ring-zinc-800 group-hover:ring-darkPrimary/30 transition-all duration-200">
                        <Image
                          src={thumbnailUrl}
                          alt="Author"
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-darkPrimary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-300 truncate">
                        Author
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-darkPrimary/20 via-transparent to-darkPrimary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
                     style={{ padding: '1px', background: 'linear-gradient(135deg, rgba(198, 157, 248, 0.2), transparent, rgba(198, 157, 248, 0.1))' }}>
                  <div className="w-full h-full bg-zinc-900/40 rounded-2xl" />
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* Decorative blur */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-darkPrimary/20 to-transparent rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}; 