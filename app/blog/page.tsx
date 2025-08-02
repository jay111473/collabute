"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlogHeroServer } from "@/components/blog/blog-hero-server";
import { BlogClientWrapper } from "@/components/blog/blog-client-wrapper";
import { getFeaturedBlogs } from "@/lib/utils/blog-utils";
import { BlogWithDetails, Category, Tag } from "@/types/convex";

const BlogPage = () => {
  const blogs = useQuery(api.blogs.getBlogs) as BlogWithDetails[] | undefined;
  const categories = useQuery(api.blogs.getCategories) as
    | Category[]
    | undefined;
  const tags = useQuery(api.blogs.getTags) as Tag[] | undefined;

  // Show loading state while data is being fetched
  if (blogs === undefined || categories === undefined || tags === undefined) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-darkPrimary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-darkPrimary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-darkPrimary/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="text-center py-20">
              <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-4">
                  Loading Blog...
                </h1>
                <p className="text-zinc-400 mb-6">
                  Please wait while we load the latest articles.
                </p>
                <div className="w-8 h-8 border-2 border-darkPrimary/30 border-t-darkPrimary rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get featured blogs using utility function
  const featuredBlogs = getFeaturedBlogs(blogs);

  return (
    <div className="bg-black relative overflow-hidden py-16 lg:pt-36 lg:pb-16">
      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Featured articles section - Server rendered */}
          <BlogHeroServer featuredBlogs={featuredBlogs} />

          {/* Interactive filtering and blog list - Client side for interactivity */}
          <BlogClientWrapper
            initialBlogs={blogs}
            categories={categories}
            tags={tags}
          />

          {/* Bottom section */}
          <div className="mt-20 text-center">
            <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-white mb-3">
                Want to stay updated?
              </h3>
              <p className="text-zinc-400 mb-6">
                Subscribe to our newsletter for the latest engineering insights
                and product updates.
              </p>
              <button className="px-6 py-3 bg-darkPrimary/20 text-darkPrimary border border-darkPrimary/30 rounded-xl font-medium hover:bg-darkPrimary/30 transition-all duration-200 backdrop-blur-sm">
                Subscribe to Newsletter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
