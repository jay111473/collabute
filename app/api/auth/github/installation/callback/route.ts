import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const installationId = searchParams.get("installation_id");
  const setupAction = searchParams.get("setup_action");
  const state = searchParams.get("state");

  // Verify state parameter for CSRF protection
  if (!state) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/onboarding?github_error=invalid_state`
    );
  }

  // Decode state parameter to get redirect information
  let redirectInfo;
  try {
    redirectInfo = JSON.parse(atob(state));
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/onboarding?github_error=invalid_state`
    );
  }

  // Check if this is a new installation
  if (setupAction === "install" && installationId) {
    // Always use redirect flow
    const redirectUrl = new URL("/auth/github/complete", redirectInfo.origin || request.nextUrl.origin);
    redirectUrl.searchParams.set("installation_id", installationId);
    redirectUrl.searchParams.set("setup_action", setupAction);
    redirectUrl.searchParams.set("state", state);

    return NextResponse.redirect(redirectUrl.toString());
  }

  // Handle errors - always redirect
  return NextResponse.redirect(
    `${redirectInfo.origin || request.nextUrl.origin}/onboarding?github_error=installation_failed`
  );
}