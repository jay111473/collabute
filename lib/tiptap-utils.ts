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
 * Validate and sanitize TipTap content for database storage
 */
export function validateTiptapContent(content: any): any | null {
  // Handle null/undefined content
  if (!content) return null;
  
  try {
    // Ensure content can be serialized/deserialized
    const serialized = JSON.stringify(content);
    const parsed = JSON.parse(serialized);
    
    // Basic TipTap structure validation
    if (parsed && typeof parsed === 'object') {
      // Check if it has the basic TipTap document structure
      if (parsed.type && (parsed.type === 'doc' || parsed.content)) {
        // Test if it can be converted to HTML (validates extensions compatibility)
        try {
          generateHTML(parsed, extensions);
          return parsed;
        } catch (htmlError) {
          console.warn("Content failed HTML generation test:", htmlError);
          // Return the parsed content anyway, as some custom content might not render but should still be saved
          return parsed;
        }
      }
      
      // If it's an object but not proper TipTap format, return null
      console.warn("Content doesn't match TipTap structure:", parsed);
      return null;
    }
    
    // If content is just a string or other primitive, return null
    if (typeof content === 'string' && content.trim() === '') {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error("Content validation failed:", error);
    console.error("Content that failed validation:", content);
    return null;
  }
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
