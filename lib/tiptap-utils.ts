import { generateHTML } from "@tiptap/html";
import { generateText } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

const extensions = [StarterKit, Link, Image, TextStyle, Color];

/**
 * Convert Tiptap JSON to HTML
 */
export function jsonToHtml(json: any): string {
  if (!json) return "";

  try {
    return generateHTML(json, extensions);
  } catch (error) {
    console.error("Error converting JSON to HTML:", error);
    return "";
  }
}

/**
 * Convert Tiptap JSON to plain text (for search/SEO)
 */
export function jsonToText(json: any): string {
  if (!json) return "";

  try {
    return generateText(json, extensions);
  } catch (error) {
    console.error("Error converting JSON to text:", error);
    return "";
  }
}

/**
 * Extract reading time from content (words per minute = 200)
 */
export function getReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extract first image URL from Tiptap JSON content
 */
export function getFirstImageUrl(json: any): string | null {
  if (!json || !json.content) return null;

  function findImage(content: any[]): string | null {
    for (const node of content) {
      if (node.type === "image" && node.attrs?.src) {
        return node.attrs.src;
      }
      if (node.content) {
        const found = findImage(node.content);
        if (found) return found;
      }
    }
    return null;
  }

  return findImage(json.content);
}

/**
 * Generate excerpt from plain text
 */
export function generateExcerpt(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  return lastSpaceIndex > 0
    ? truncated.slice(0, lastSpaceIndex) + "..."
    : truncated + "...";
}

/**
 * Process Tiptap content for storage
 */
export function processTiptapContent(json: any) {
  const html = jsonToHtml(json);
  const plainText = jsonToText(json);

  return {
    json,
    html,
    plainText,
    readingTime: getReadingTime(plainText),
    excerpt: generateExcerpt(plainText),
    firstImageUrl: getFirstImageUrl(json),
  };
}
