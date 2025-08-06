import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { CopyLinkButton } from "@/components/blog/copy-link-button";
import { TiptapRenderer } from "@/components/ui/tiptap-renderer";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const blog = await fetchQuery(api.blogs.getBlogBySlug, { slug });

    if (!blog) {
      return {
        title: "Blog Post Not Found",
        description: "The requested blog post could not be found.",
      };
    }

    const imageUrl =
      blog.thumbnail?.url ||
      blog.profilePicture?.url ||
      "/icons/user-avatar.png";
    const description = blog.description || "";

    return {
      title: blog.meta?.title || blog.title,
      description: blog.meta?.description || description,
      openGraph: {
        title: blog.title,
        description: description,
        type: "article",
        publishedTime: blog.publishedAt
          ? new Date(blog.publishedAt).toISOString()
          : undefined,
        modifiedTime: new Date(blog.updatedAt).toISOString(),
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog Post",
      description: "Read our latest blog post.",
    };
  }
}

const BlogDetailPage = async ({ params }: BlogDetailPageProps) => {
  try {
    const { slug } = await params;
    const blog = await fetchQuery(api.blogs.getBlogBySlug, { slug });

    if (!blog || !blog.publishedAt) {
      notFound();
    }

    const categoryName = blog.category?.name || "Uncategorized";
    const categoryColor = blog.category?.color || "#6B7280";
    const imageUrl =
      blog.thumbnail?.url ||
      blog.profilePicture?.url ||
      "/icons/user-avatar.png";
    const publishedDate = new Date(blog.publishedAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    const tags = blog.tags?.filter(Boolean) || [];
    const content = blog.content; // Tiptap JSON content
    const readingTime = calculateReadingTime(content);
    const authorName = blog.author?.name || "Anonymous";

    // Simple reading time calculation
    function calculateReadingTime(tiptapContent: any): number {
      if (!tiptapContent?.content) return 1;

      const extractText = (nodes: any[]): string => {
        return nodes
          .map((node) => {
            if (node.type === "text") return node.text || "";
            if (node.content) return extractText(node.content);
            return "";
          })
          .join(" ");
      };

      const text = extractText(tiptapContent.content);
      const wordCount = text
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      return Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute
    }

    return (
      <div className="min-h-screen bg-black py-20">
        {/* Content */}
        <div className="relative">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-2xl">
            {/* Back button */}
            <div className="mb-2 sm:mb-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors duration-200 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Blog
              </Link>
            </div>

            {/* Article header */}
            <header className="mb-4 sm:mb-12">
              {/* Featured image */}
              {(blog.thumbnail || blog.profilePicture) && (
                <div className="relative w-full h-48 sm:h-64 md:h-96 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-tight mb-6 sm:mb-8">
                {blog.title}
              </h1>

              {/* Description/Subtitle */}
              {blog.description && (
                <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed mb-8 sm:mb-12 italic">
                  {blog.description}
                </p>
              )}

              {/* Author and meta info */}
              <div className="flex justify-between items-center">
                {/* Author and meta info */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm">
                  <span className="text-zinc-300 font-medium">
                    {authorName}
                  </span>
                  <span className="text-zinc-500">•</span>
                  <time className="text-zinc-500">{publishedDate}</time>
                  <span className="text-zinc-500">•</span>
                  <CopyLinkButton className="text-zinc-500 hover:text-zinc-300 transition-colors" />
                </div>
                {/* Category and reading time */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <span
                    className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${categoryColor}20`,
                      color: categoryColor,
                    }}
                  >
                    {categoryName}
                  </span>
                  <span className="text-zinc-500 text-xs sm:text-sm">
                    {readingTime} min read
                  </span>
                </div>
              </div>
            </header>

            {/* Article content */}
            <article className="prose prose-invert prose-sm sm:prose-lg max-w-none">
              <TiptapRenderer
                content={content}
                className="text-zinc-300 leading-relaxed space-y-4 sm:space-y-6"
              />
            </article>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-zinc-800">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag?._id}
                      className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-zinc-900 text-zinc-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      #{tag?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {blog.faq && blog.faq.length > 0 && (
              <section className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-zinc-800">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6 sm:space-y-8">
                  {blog.faq.map((faqItem, index) => (
                    <div key={faqItem.id || index}>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
                        {faqItem.question}
                      </h3>
                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                        {faqItem.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom navigation */}
            <div className="mt-16 sm:mt-20 text-center">
              <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Enjoyed this article?
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 mb-4 sm:mb-6">
                  Check out more of our engineering insights and stories.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex px-4 sm:px-6 py-2.5 sm:py-3 bg-darkPrimary/20 text-darkPrimary border border-darkPrimary/30 rounded-xl text-sm sm:text-base font-medium hover:bg-darkPrimary/30 transition-all duration-200 backdrop-blur-sm"
                >
                  Read More Articles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading blog post:", error);
    notFound();
  }
};

export default BlogDetailPage;
