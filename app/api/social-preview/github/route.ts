import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  // Validate username format
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return NextResponse.json(
      { error: 'Invalid username format' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Collabute-App',
        // Add GitHub token if available for higher rate limits
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'GitHub user not found' },
          { status: 404 }
        );
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch GitHub profile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return only the data we need for the preview
    const profileData = {
      login: data.login,
      name: data.name || data.login,
      bio: data.bio || 'No bio available',
      avatar_url: data.avatar_url,
      followers: data.followers,
      following: data.following,
      public_repos: data.public_repos,
      html_url: data.html_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return NextResponse.json(profileData, {
      headers: {
        // Cache the response for 1 hour
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
