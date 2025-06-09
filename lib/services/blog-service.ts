import { Blog, Category, Tag } from "@/types/blog";
import qs from "qs";

interface BlogApiResponse {
  docs: Blog[];
}

interface CategoryApiResponse {
  docs: Category[];
}

interface TagApiResponse {
  docs: Tag[];
}

const getApiBaseUrl = (): string => {
  // For server-side, we might need to use internal URL or full URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

  if (!apiUrl) {
    throw new Error(
      "API_URL or NEXT_PUBLIC_API_URL environment variable is not defined"
    );
  }

  return apiUrl;
};


export const blogService = {
  async getBlogs(): Promise<Blog[]> {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/blogs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Use revalidate for ISR instead of no-store for better performance
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch blogs: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching blogs:", error);

      throw error;
    }
  },

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    const query = {
      where: {
        slug: {
          equals: slug,
        },
      },
    };
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(
        `${API_BASE_URL}/api/blogs?${qs.stringify(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          next: { revalidate: 300 },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch blog: ${response.status} ${response.statusText}`
        );
      }

      const data: BlogApiResponse = await response.json();
      return data.docs[0] || null;
    } catch (error) {
      console.error("Error fetching blog by slug:", error);

      throw error;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // Categories change less frequently
      });
      console.log(response);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch categories: ${response.status} ${response.statusText}`
        );
      }

      const data: CategoryApiResponse = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching categories:", error);

      throw error;
    }
  },

  async getTags(): Promise<Tag[]> {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // Tags change less frequently
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch tags: ${response.status} ${response.statusText}`
        );
      }

      const data: TagApiResponse = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching tags:", error);

      throw error;
    }
  },

  async getBlogsByCategory(categoryId: number): Promise<Blog[]> {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(
        `${API_BASE_URL}/api/blog?where[category][equals]=${categoryId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          next: { revalidate: 300 },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch blogs by category: ${response.status} ${response.statusText}`
        );
      }

      const data: BlogApiResponse = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching blogs by category:", error);
      throw error;
    }
  },

  async getBlogsByTag(tagId: number): Promise<Blog[]> {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(
        `${API_BASE_URL}/api/blog?where[tags][in]=${tagId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          next: { revalidate: 300 },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch blogs by tag: ${response.status} ${response.statusText}`
        );
      }

      const data: BlogApiResponse = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching blogs by tag:", error);
      throw error;
    }
  },

  // Client-side versions for interactive filtering
  async getBlogsClient(): Promise<Blog[]> {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/blog`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch blogs: ${response.status} ${response.statusText}`
        );
      }

      const data: BlogApiResponse = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw error;
    }
  },

  async getCategoriesClient(): Promise<Category[]> {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch categories: ${response.status} ${response.statusText}`
        );
      }

      const data: CategoryApiResponse = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  async getTagsClient(): Promise<Tag[]> {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch tags: ${response.status} ${response.statusText}`
        );
      }

      const data: TagApiResponse = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  },
};
