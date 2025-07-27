import type { BlogWithDetails, Category, Tag } from "@/types/convex";

export function extractCategoriesFromBlogs(
  blogs: BlogWithDetails[]
): Category[] {
  const categoryMap = new Map<string, Category>();

  blogs.forEach((blog) => {
    if (blog.category && blog.category._id) {
      categoryMap.set(blog.category._id, blog.category);
    }
  });

  return Array.from(categoryMap.values());
}

export function extractTagsFromBlogs(blogs: BlogWithDetails[]): Tag[] {
  const tagMap = new Map<string, Tag>();

  blogs.forEach((blog) => {
    if (blog.tags) {
      blog.tags.forEach((tag) => {
        if (tag && typeof tag === "object" && "_id" in tag) {
          const tagObject = tag as Tag;
          tagMap.set(tagObject._id, tagObject);
        }
      });
    }
  });

  return Array.from(tagMap.values());
}

export function getFeaturedBlogs(
  blogs: BlogWithDetails[],
  count: number = 3
): BlogWithDetails[] {
  // Return the most recent published blogs as featured
  return blogs
    .filter((blog) => blog.status === "published" && blog.publishedAt)
    .sort((a, b) => {
      const timeA = a.publishedAt || a._creationTime;
      const timeB = b.publishedAt || b._creationTime;
      return timeB - timeA;
    })
    .slice(0, count);
}

export function filterBlogsByCategory(
  blogs: BlogWithDetails[],
  categoryId: string
): BlogWithDetails[] {
  return blogs.filter((blog) => blog.category?._id === categoryId);
}

export function filterBlogsByTag(
  blogs: BlogWithDetails[],
  tagId: string
): BlogWithDetails[] {
  return blogs.filter((blog) =>
    blog.tags?.some((tag) =>
      typeof tag === "object" && "_id" in tag
        ? (tag as Tag)._id === tagId
        : false
    )
  );
}

export function searchBlogs(
  blogs: BlogWithDetails[],
  searchTerm: string
): BlogWithDetails[] {
  const lowerSearchTerm = searchTerm.toLowerCase();

  return blogs.filter((blog) => {
    const titleMatch = blog.title.toLowerCase().includes(lowerSearchTerm);
    const descriptionMatch = blog.description
      ?.toLowerCase()
      .includes(lowerSearchTerm);
    const categoryMatch = blog.category?.name
      .toLowerCase()
      .includes(lowerSearchTerm);
    const tagMatch = blog.tags?.some((tag) =>
      typeof tag === "object" && tag !== null && "name" in tag
        ? (tag as Tag).name.toLowerCase().includes(lowerSearchTerm)
        : false
    );

    return titleMatch || descriptionMatch || categoryMatch || tagMatch;
  });
}

export function sortBlogsByDate(
  blogs: BlogWithDetails[],
  order: "asc" | "desc" = "desc"
): BlogWithDetails[] {
  return [...blogs].sort((a, b) => {
    const timeA = a.publishedAt || a._creationTime;
    const timeB = b.publishedAt || b._creationTime;

    return order === "desc" ? timeB - timeA : timeA - timeB;
  });
}

export function getBlogsByDateRange(
  blogs: BlogWithDetails[],
  startDate: number,
  endDate: number
): BlogWithDetails[] {
  return blogs.filter((blog) => {
    const blogDate = blog.publishedAt || blog._creationTime;
    return blogDate >= startDate && blogDate <= endDate;
  });
}

export function paginateBlogs(
  blogs: BlogWithDetails[],
  page: number,
  limit: number
): { blogs: BlogWithDetails[]; total: number; hasMore: boolean } {
  const offset = (page - 1) * limit;
  const paginatedBlogs = blogs.slice(offset, offset + limit);

  return {
    blogs: paginatedBlogs,
    total: blogs.length,
    hasMore: offset + limit < blogs.length,
  };
}
