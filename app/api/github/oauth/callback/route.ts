import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    
    if (error) {
      const errorDescription = searchParams.get("error_description") || "GitHub OAuth failed";
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wizard?github_auth_error=${encodeURIComponent(errorDescription)}`,
        302
      );
    }

    if (!code || !state) {
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wizard?github_auth_error=${encodeURIComponent("Missing authorization code or state")}`,
        302
      );
    }

    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wizard?github_auth_error=${encodeURIComponent("Invalid state parameter")}`,
        302
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/github/oauth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange authorization code for access token");
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const accessToken = tokenData.access_token;
    
    // Get user information
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `token ${accessToken}`,
        "Accept": "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user information");
    }

    const userData = await userResponse.json();
    
    // Store token in a secure way (this would typically be stored in a database)
    // For now, we'll redirect with success and let the frontend handle token storage
    // In a real application, you'd want to:
    // 1. Store the token securely in your database
    // 2. Associate it with the current user
    // 3. Set up proper session management

    // Redirect back to the callback URL with success
    const callbackUrl = stateData.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wizard?github_auth_success=true`;
    const redirectUrl = new URL(callbackUrl);
    redirectUrl.searchParams.set("github_auth_success", "true");
    redirectUrl.searchParams.set("github_token", accessToken);
    redirectUrl.searchParams.set("github_user", userData.login);
    
    return Response.redirect(redirectUrl.toString(), 302);

  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    const errorMessage = error instanceof Error ? error.message : "OAuth callback failed";
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wizard?github_auth_error=${encodeURIComponent(errorMessage)}`,
      302
    );
  }
}