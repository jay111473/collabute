import { randomBytes } from "crypto";

/**
 * Generates a cryptographically secure random password
 * @param length The length of the password to generate (default: 12)
 * @param includeSpecialChars Whether to include special characters (default: true)
 * @returns A secure random password
 */
export function generateSecurePassword(length = 12, includeSpecialChars = true): string {
  // Define character sets
  const lowerChars = "abcdefghijklmnopqrstuvwxyz";
  const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()-_=+";
  
  // Combine character sets based on includeSpecialChars parameter
  const chars = lowerChars + upperChars + numbers + (includeSpecialChars ? specialChars : "");
  
  if (typeof window === "undefined") {
    // Server-side: Use Node.js crypto
    const bytes = randomBytes(length);
    let password = "";
    
    for (let i = 0; i < length; i++) {
      password += chars.charAt(bytes[i] % chars.length);
    }
    
    return password;
  } else {
    // Client-side: Use Web Crypto API
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    
    return Array.from(array)
      .map((value) => chars[value % chars.length])
      .join("");
  }
}

/**
 * Generates a secure token of specified length
 * @param length The length of the token to generate (default: 32)
 * @returns A secure random token
 */
export function generateSecureToken(length = 32): string {
  return generateSecurePassword(length, false);
}

/**
 * Compares two strings in constant time to prevent timing attacks
 * @param a First string to compare
 * @param b Second string to compare
 * @returns True if strings are equal, false otherwise
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
} 