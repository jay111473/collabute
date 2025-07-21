import { nextJsHandler } from "@convex-dev/better-auth/nextjs";

// Debug: Add logging to see if the route is being loaded
console.log("🔧 BetterAuth API route loaded");

// Create handlers and export them
const handlers = nextJsHandler();
console.log("✅ BetterAuth handlers created successfully");

export const { GET, POST } = handlers;
