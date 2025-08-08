import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { BlogWithDetails, Category, Tag } from "@/types/convex";

export interface PaginatedBlogsResult {
  blogs: BlogWithDetails[];
  total: number;
  hasMore: boolean;
}

export const blogService = {
  async getBlogs() {
    const result = await preloadQuery(api.blogs.getBlogs);
    return result as unknown as BlogWithDetails[];
  },

  async getBlogsData() {
    const [blogs, categories, tags] = await Promise.all([
      preloadQuery(api.blogs.getBlogs),
      preloadQuery(api.blogs.getCategories),
      preloadQuery(api.blogs.getTags),
    ]);

    return {
      blogs: blogs as unknown as BlogWithDetails[],
      categories: categories as unknown as Category[],
      tags: tags as unknown as Tag[],
    };
  },

  async getBlogBySlug(slug: string) {
    const result = await preloadQuery(api.blogs.getBlogBySlug, { slug });
    return result as unknown as BlogWithDetails | null;
  },

  async getBlogsByCategory(categoryId: string) {
    const result = await preloadQuery(api.blogs.getBlogsByCategory, {
      categoryId: categoryId as any,
    });
    return result as unknown as BlogWithDetails[];
  },

  async getBlogsByTag(tagId: string) {
    const result = await preloadQuery(api.blogs.getBlogsByTag, {
      tagId: tagId as any,
    });
    return result as unknown as BlogWithDetails[];
  },

  async getBlogsWithPagination(params: {
    limit?: number;
    offset?: number;
    categoryId?: string;
    tagId?: string;
  }) {
    const result = await preloadQuery(api.blogs.getBlogsWithPagination, {
      limit: params.limit,
      offset: params.offset,
      categoryId: params.categoryId as any,
      tagId: params.tagId as any,
    });
    return result as unknown as PaginatedBlogsResult;
  },

  async getFeaturedBlogs(limit?: number) {
    const result = await preloadQuery(api.blogs.getFeaturedBlogs, { limit });
    return result as unknown as BlogWithDetails[];
  },

  async getCategories() {
    const result = await preloadQuery(api.blogs.getCategories);
    return result as unknown as Category[];
  },

  async getTags() {
    const result = await preloadQuery(api.blogs.getTags);
    return result as unknown as Tag[];
  },
};
