import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// Serve images with proper content-type headers
http.route({
  path: "/images",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const storageId = url.searchParams.get("storageId");

      console.log("=== IMAGE REQUEST ===");
      console.log("URL:", request.url);
      console.log("StorageId:", storageId);
      console.log("StorageId type:", typeof storageId);

      if (!storageId) {
        console.log("Missing storageId parameter");
        return new Response("Missing storageId parameter", { status: 400 });
      }

      console.log("Attempting to fetch blob...");
      const blob = await ctx.storage.get(storageId as any);

      if (!blob) {
        console.log("Blob not found for storageId:", storageId);
        return new Response("File not found", { status: 404 });
      }

      console.log("SUCCESS: Blob found");
      console.log("Blob type:", blob.type);
      console.log("Blob size:", blob.size);

      // Determine content type from blob or use generic image type
      const contentType = blob.type || "image/jpeg";

      console.log("Serving with content-type:", contentType);

      return new Response(blob, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000", // 1 year cache
          "Access-Control-Allow-Origin": "*", // Add CORS headers
        },
      });
    } catch (error) {
      console.error("=== ERROR IN HTTP ACTION ===");
      console.error("Error type:", (error as Error).constructor.name);
      console.error("Error message:", (error as Error)?.message);
      console.error("Error stack:", (error as Error)?.stack);
      return new Response(`Internal server error: ${(error as Error)?.message}`, {
        status: 500,
      });
    }
  }),
});

export default http;
