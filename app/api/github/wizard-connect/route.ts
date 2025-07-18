import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get("callbackUrl");
    
    if (!callbackUrl) {
      return Response.json(
        { error: "Callback URL is required" },
        { status: 400 }
      );
    }

    // GitHub OAuth configuration
    const clientId = process.env.GITHUB_CLIENT_ID;
    const scope = "repo,user:email,read:user";
    const state = Buffer.from(JSON.stringify({ callbackUrl })).toString("base64");
    
    if (!clientId) {
      return Response.json(
        { error: "GitHub OAuth not configured" },
        { status: 500 }
      );
    }

    // Build GitHub OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/github/oauth/callback`,
      scope,
      state,
      response_type: "code"
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params}`;
    
    // Redirect to GitHub OAuth
    return Response.redirect(authUrl, 302);

  } catch (error) {
    console.error("Error initiating GitHub OAuth:", error);
    return Response.json(
      { error: "Failed to initiate GitHub OAuth" },
      { status: 500 }
    );
  }
}