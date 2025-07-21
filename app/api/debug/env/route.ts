// TEMPORARY: Debug environment variables
export async function GET() {
  return Response.json({
    hasGithubClientId: !!process.env.GITHUB_CLIENT_ID,
    hasGithubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
    githubClientIdLength: process.env.GITHUB_CLIENT_ID?.length || 0,
    githubClientSecretLength: process.env.GITHUB_CLIENT_SECRET?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    convexUrl: process.env.CONVEX_URL ? "set" : "not set",
  });
}