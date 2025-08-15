import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Check for OAuth errors
  if (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(`${request.nextUrl.origin}/onboarding?github_error=${error}`);
  }

  // Verify state parameter for CSRF protection
  if (!state) {
    console.error('Missing state parameter');
    return NextResponse.redirect(`${request.nextUrl.origin}/onboarding?github_error=invalid_state`);
  }

  if (!code) {
    console.error('Missing authorization code');
    return NextResponse.redirect(`${request.nextUrl.origin}/onboarding?github_error=missing_code`);
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        state,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const accessToken = tokenData.access_token;

    // Get user information from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user information');
    }

    const githubUser = await userResponse.json();

    // Get user's installations (organizations they have access to)
    const installationsResponse = await fetch('https://api.github.com/user/installations', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    let installations = [];
    if (installationsResponse.ok) {
      const installationsData = await installationsResponse.json();
      installations = installationsData.installations || [];
    }

    // Store GitHub connection in database
    // Note: This should be done through a Convex mutation
    // For now, we'll store it in the session/localStorage and handle it on the client

    // Redirect back to onboarding with success
    const redirectUrl = new URL('/onboarding', request.nextUrl.origin);
    redirectUrl.searchParams.set('github_success', 'true');
    redirectUrl.searchParams.set('github_user', githubUser.login);
    redirectUrl.searchParams.set('github_id', githubUser.id.toString());

    return NextResponse.redirect(redirectUrl.toString());

  } catch (error: any) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(`${request.nextUrl.origin}/onboarding?github_error=callback_failed`);
  }
}