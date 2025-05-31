import { Blog, Category, Tag } from "@/types/blog";
import { Media } from "@/types/dashboard";

export const formatBlogDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getMediaUrl = (
  media: number | Media | null | undefined
): string => {
  if (!media) return "/icons/user-avatar.png"; // Default fallback

  if (typeof media === "object" && media.url) {
    return media.url;
  }

  // If it's just an ID, we might need to construct the URL
  // This depends on your media storage setup
  return "/icons/user-avatar.png"; // Fallback
};

export const getCategoryName = (category: number | Category): string => {
  if (typeof category === "object") {
    return category.name;
  }
  return "Uncategorized";
};

export const getCategoryColor = (category: number | Category): string => {
  if (typeof category === "object" && category.color) {
    return category.color;
  }
  return "#6B7280"; // Default gray color
};

export const getTagName = (tag: number | Tag): string => {
  if (typeof tag === "object") {
    return tag.name;
  }
  return "Tag";
};

export const getTagColor = (tag: number | Tag): string => {
  if (typeof tag === "object" && tag.color) {
    return tag.color;
  }
  return "#10B981"; // Default green color
};

export const getBlogTags = (blog: Blog): Tag[] => {
  if (!blog.tags) return [];

  return blog.tags
    .map((tag) => (typeof tag === "object" ? tag : null))
    .filter((tag): tag is Tag => tag !== null);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

export const generateBlogSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const getReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Lexical node types interface for better type safety
interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  tag?: string;
  listType?: "bullet" | "number";
  value?: number;
  [key: string]: any;
}

export const extractTextFromRichText = (richtext: Blog["richtext"]): string => {
  if (!richtext?.root?.children) return "";

  const extractTextFromNode = (node: LexicalNode): string => {
    // Handle text nodes
    if (node.text) {
      return node.text;
    }

    // Handle different node types
    switch (node.type) {
      case "paragraph":
        const paragraphText = node.children
          ? node.children.map(extractTextFromNode).join("")
          : "";
        return paragraphText + "\n\n";

      case "heading":
        const headingText = node.children
          ? node.children.map(extractTextFromNode).join("")
          : "";
        return headingText + "\n\n";

      case "list":
        const listItems = node.children
          ? node.children.map(extractTextFromNode).join("")
          : "";
        return listItems + "\n";

      case "listitem":
        const itemText = node.children
          ? node.children.map(extractTextFromNode).join("")
          : "";
        const bullet = node.listType === "number" ? "1. " : "• ";
        return bullet + itemText + "\n";

      case "quote":
        const quoteText = node.children
          ? node.children.map(extractTextFromNode).join("")
          : "";
        return '"' + quoteText + '"\n\n';

      case "code":
        const codeText = node.children
          ? node.children.map(extractTextFromNode).join("")
          : "";
        return "`" + codeText + "`";

      case "link":
        const linkText = node.children
          ? node.children.map(extractTextFromNode).join("")
          : "";
        return linkText;

      case "linebreak":
        return "\n";

      default:
        // For any other node type, try to extract text from children
        if (node.children) {
          return node.children.map(extractTextFromNode).join("");
        }
        return "";
    }
  };

  const extractedText = richtext.root.children
    .map(extractTextFromNode)
    .join("")
    .trim();

  // Clean up excessive newlines
  return extractedText.replace(/\n{3,}/g, "\n\n");
};

// New function to convert Lexical JSON to HTML for better rendering
export const convertRichTextToHtml = (richtext: Blog["richtext"]): string => {
  if (!richtext?.root?.children) return "";

  const convertNodeToHtml = (node: LexicalNode): string => {
    // Handle text nodes with formatting
    if (node.text) {
      let text = node.text;

      // Apply text formatting based on node properties
      if (node.format) {
        if (node.format & 1) text = `<strong>${text}</strong>`; // Bold
        if (node.format & 2) text = `<em>${text}</em>`; // Italic
        if (node.format & 4) text = `<u>${text}</u>`; // Underline
        if (node.format & 8) text = `<s>${text}</s>`; // Strikethrough
      }

      return text;
    }

    // Handle different node types
    switch (node.type) {
      case "paragraph":
        const paragraphContent = node.children
          ? node.children.map(convertNodeToHtml).join("")
          : "";
        return `<p class="mb-4 leading-relaxed">${paragraphContent}</p>`;

      case "heading":
        const headingContent = node.children
          ? node.children.map(convertNodeToHtml).join("")
          : "";
        const tag = node.tag || "h2";
        const headingClasses = {
          h1: "text-3xl font-bold mb-6 mt-8",
          h2: "text-2xl font-semibold mb-5 mt-7",
          h3: "text-xl font-semibold mb-4 mt-6",
          h4: "text-lg font-semibold mb-3 mt-5",
          h5: "text-base font-semibold mb-3 mt-4",
          h6: "text-sm font-semibold mb-2 mt-3",
        };
        const headingClass =
          headingClasses[tag as keyof typeof headingClasses] ||
          headingClasses.h2;
        return `<${tag} class="${headingClass}">${headingContent}</${tag}>`;

      case "list":
        const listContent = node.children
          ? node.children.map(convertNodeToHtml).join("")
          : "";
        const listTag = node.listType === "number" ? "ol" : "ul";
        const listClasses =
          node.listType === "number"
            ? "list-decimal list-outside ml-6 mb-4 space-y-2"
            : "list-disc list-outside ml-6 mb-4 space-y-2";
        return `<${listTag} class="${listClasses}">${listContent}</${listTag}>`;

      case "listitem":
        const itemContent = node.children
          ? node.children.map(convertNodeToHtml).join("")
          : "";
        return `<li class="pl-2 leading-relaxed">${itemContent}</li>`;

      case "quote":
        const quoteContent = node.children
          ? node.children.map(convertNodeToHtml).join("")
          : "";
        return `<blockquote class="border-l-4 border-gray-300 pl-4 py-2 mb-4 italic text-gray-600">${quoteContent}</blockquote>`;

      case "code":
        const codeContent = node.children
          ? node.children.map(convertNodeToHtml).join("")
          : "";
        return `<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">${codeContent}</code>`;

      case "link":
        const linkContent = node.children
          ? node.children.map(convertNodeToHtml).join("")
          : "";
        const url = node.url || "#";
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${linkContent}</a>`;

      case "linebreak":
        return "<br>";

      default:
        // For any other node type, try to convert children
        if (node.children) {
          return node.children.map(convertNodeToHtml).join("");
        }
        return "";
    }
  };

  return richtext.root.children.map(convertNodeToHtml).join("");
};

export const getAuthorInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to extract unique categories from blogs
export const extractCategoriesFromBlogs = (blogs: Blog[]): Category[] => {
  const categoryMap = new Map<number, Category>();

  blogs.forEach((blog) => {
    if (blog.category && typeof blog.category === "object") {
      categoryMap.set(blog.category.id, blog.category);
    }
  });

  return Array.from(categoryMap.values());
};

// Helper function to extract unique tags from blogs
export const extractTagsFromBlogs = (blogs: Blog[]): Tag[] => {
  const tagMap = new Map<number, Tag>();

  blogs.forEach((blog) => {
    if (blog.tags && Array.isArray(blog.tags)) {
      blog.tags.forEach((tag) => {
        if (tag && typeof tag === "object") {
          tagMap.set(tag.id, tag);
        }
      });
    }
  });

  return Array.from(tagMap.values());
};

// Helper function to get featured blogs
export const getFeaturedBlogs = (blogs: Blog[]): Blog[] => {
  return blogs
    .filter((blog) => blog.publishedAt)
    .sort(
      (a, b) =>
        new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime()
    )
    .slice(0, 5);
};
