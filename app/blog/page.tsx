import React from "react";
import { Metadata } from "next";
import { BlogHeroServer } from "@/components/blog/blog-hero-server";
import { BlogClientWrapper } from "@/components/blog/blog-client-wrapper";
import { blogService } from "@/lib/services/blog-service";
import {
  extractCategoriesFromBlogs,
  extractTagsFromBlogs,
  getFeaturedBlogs,
} from "@/lib/utils/blog-utils";

const BlogPage = async () => {
  try {
    // Fetch blog data - categories and tags are included
    const blogs = await blogService.getBlogs();

    // Extract data using utility functions
    const categories = extractCategoriesFromBlogs(blogs);
    const tags = extractTagsFromBlogs(blogs);
    const featuredBlogs = getFeaturedBlogs(blogs);

    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-darkPrimary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-darkPrimary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-darkPrimary/5 rounded-full blur-3xl" />

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
                  Subscribe to our newsletter for the latest engineering
                  insights and product updates.
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
  } catch (error) {
    console.error("Error loading blog page:", error);

    // Error fallback
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-darkPrimary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-darkPrimary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-darkPrimary/5 rounded-full blur-3xl" />

        {/* Error Content */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="text-center py-20">
              <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-4">
                  Unable to Load Blog
                </h1>
                <p className="text-zinc-400 mb-6">
                  We&apos;re experiencing technical difficulties. Please try
                  again later.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-darkPrimary/20 text-darkPrimary border border-darkPrimary/30 rounded-xl font-medium hover:bg-darkPrimary/30 transition-all duration-200 backdrop-blur-sm"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default BlogPage;
