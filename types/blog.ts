import { Media } from "./dashboard";

export interface Blog {
  id: number;
  slug?: string | null;
  title: string;
  image: number | Media;
  description: string;
  category: number | Category;
  tags?: (number | Tag)[] | null;
  richtext?: {
    root: {
      type: string;
      children: {
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ("ltr" | "rtl") | null;
      format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  publishedAt?: string | null;
  thumbnail?: (number | null) | Media;
  faq?:
    | {
        question?: string | null;
        answer?: string | null;
        id?: string | null;
      }[]
    | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    /**
     * Maximum upload file size: 12MB. Recommended file size for images is <500KB.
     */
    image?: (number | null) | Media;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "categories".
 */
export interface Category {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  /**
   * Hex color code (e.g., #3B82F6)
   */
  color?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "tags".
 */
export interface Tag {
  id: number;
  name: string;
  slug?: string | null;
  /**
   * Hex color code (e.g., #10B981)
   */
  color?: string | null;
  updatedAt: string;
  createdAt: string;
}
