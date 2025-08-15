/**
 * Slug utility functions for generating URL-safe identifiers
 * Used across both client and server (Convex) environments
 */

/**
 * Converts a string to a URL-safe slug
 * @param text - The text to convert to a slug
 * @returns A URL-safe slug string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with -
    .replace(/\s+/g, '-')
    // Remove all non-word chars
    .replace(/[^\w\-]+/g, '')
    // Replace multiple - with single -
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing -
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates a unique slug based on name and ID
 * @param name - The user's name
 * @param id - The user's ID (last 8 characters will be used)
 * @returns A unique slug combining name and ID
 */
export function generateUserSlug(name: string, id: string): string {
  // Clean the name and create base slug
  const baseSlug = slugify(name);
  
  // Get last 8 characters of ID for uniqueness
  const idSuffix = id.slice(-8);
  
  // Combine base slug with ID suffix
  return `${baseSlug}-${idSuffix}`;
}

/**
 * Validates if a slug is properly formatted
 * @param slug - The slug to validate
 * @returns Whether the slug is valid
 */
export function isValidSlug(slug: string): boolean {
  // Check if slug matches expected pattern: letters, numbers, hyphens only
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Extracts the ID from a user slug
 * @param slug - The user slug (e.g., "john-doe-a1b2c3d4")
 * @returns The ID suffix or null if invalid format
 */
export function extractIdFromSlug(slug: string): string | null {
  if (!isValidSlug(slug)) {
    return null;
  }
  
  // Get the last part after the final hyphen (should be the ID suffix)
  const parts = slug.split('-');
  const idSuffix = parts[parts.length - 1];
  
  // Validate it looks like an ID suffix (8 alphanumeric characters)
  if (idSuffix && idSuffix.length === 8 && /^[a-z0-9]{8}$/.test(idSuffix)) {
    return idSuffix;
  }
  
  return null;
}

/**
 * Generates a project slug based on title and ID
 * @param title - The project title
 * @param id - The project ID (last 6 characters will be used)
 * @returns A unique slug combining title and ID
 */
export function generateProjectSlug(title: string, id: string): string {
  // Clean the title and create base slug
  const baseSlug = slugify(title);
  
  // Get last 6 characters of ID for uniqueness (projects use shorter suffix)
  const idSuffix = id.slice(-6);
  
  // Combine base slug with ID suffix
  return `${baseSlug}-${idSuffix}`;
}
