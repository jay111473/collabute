// TEMPORARY: Debug BetterAuth configuration
export async function GET() {
  try {
    // Test if we can import the BetterAuth handler
    const { nextJsHandler } = await import("@convex-dev/better-auth/nextjs");
    
    return Response.json({
      status: "BetterAuth import successful",
      hasNextJsHandler: !!nextJsHandler,
      hasGithubClientId: !!process.env.GITHUB_CLIENT_ID,
      hasGithubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error) {
    return Response.json({
      status: "BetterAuth import failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}