import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

/**
 * Get the current authenticated user in server-side API routes
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const token = await convexAuthNextjsToken();
    if (!token) {
      return null;
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    convex.setAuth(token);

    return await convex.query(api.userProfiles.getCurrentUser);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Get the current auth token for server-side API requests
 * @returns Token string or null if not authenticated
 */
export async function getCurrentAuthToken() {
  try {
    return await convexAuthNextjsToken();
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

/**
 * Create an authenticated Convex client for server-side operations
 * @returns Authenticated ConvexHttpClient or null if not authenticated
 */
export async function getAuthenticatedConvexClient() {
  try {
    const token = await convexAuthNextjsToken();
    if (!token) {
      return null;
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    convex.setAuth(token);

    return convex;
  } catch (error) {
    console.error("Error creating authenticated Convex client:", error);
    return null;
  }
}
