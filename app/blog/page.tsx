import React from "react";
import { Metadata, Viewport } from "next";
import { BlogHeroServer } from "@/components/blog/blog-hero-server";
import { BlogClientWrapper } from "@/components/blog/blog-client-wrapper";
import { blogService } from "@/lib/services/blog-service";
import { getFeaturedBlogs } from "@/lib/utils/blog-utils";
import Link from "next/link";

// Generate viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Blog | Engineering Insights & Stories",
  description:
    "Discover our latest engineering insights, product updates, and technical stories. Stay updated with the latest trends and best practices in software development.",
  keywords: [
    "blog",
    "engineering",
    "software development",
    "technical articles",
    "insights",
  ],
  openGraph: {
    title: "Blog | Engineering Insights & Stories",
    description:
      "Discover our latest engineering insights, product updates, and technical stories.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Engineering Insights & Stories",
    description:
      "Discover our latest engineering insights, product updates, and technical stories.",
  },
};

const BlogPage = async () => {
  try {
    // Fetch all blog data from Convex
    const { blogs, categories, tags } = await blogService.getBlogsData();

    // Get featured blogs using utility function
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
    // During build time, return a static fallback instead of interactive elements
    if (process.env.NODE_ENV === "production" && !process.env.VERCEL_URL) {
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
                    Blog Coming Soon
                  </h1>
                  <p className="text-zinc-400 mb-6">
                    Our blog is currently being set up. Please check back later
                    for the latest engineering insights and stories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Error fallback for runtime
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
                <Link
                  href="/blog"
                  className="inline-block px-6 py-3 bg-darkPrimary/20 text-darkPrimary border border-darkPrimary/30 rounded-xl font-medium hover:bg-darkPrimary/30 transition-all duration-200 backdrop-blur-sm"
                >
                  Try Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default BlogPage;
