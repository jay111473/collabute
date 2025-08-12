// API utilities for fetching real social media data

export interface GitHubProfile {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
}

export interface GitHubError {
  message: string;
  status: number;
}

/**
 * Fetch real GitHub profile data using GitHub's public API
 * No authentication required for public profiles
 */
export async function fetchGitHubProfile(username: string): Promise<GitHubProfile | GitHubError> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Collabute-App', // GitHub requires a User-Agent header
      },
      // Add caching to avoid rate limits
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      return {
        message: response.status === 404 ? 'User not found' : 'Failed to fetch profile',
        status: response.status
      };
    }

    const data = await response.json();
    return data as GitHubProfile;
  } catch (error) {
    return {
      message: 'Network error while fetching profile',
      status: 500
    };
  }
}

/**
 * Fetch Open Graph metadata for websites
 */
export interface WebsiteMetadata {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  url: string;
}

export async function fetchWebsiteMetadata(url: string): Promise<WebsiteMetadata | null> {
  try {
    // We'll use a metadata extraction service or implement server-side scraping
    // For now, we'll return basic data and expand this later
    const domain = new URL(url).hostname;
    
    return {
      title: `Portfolio - ${domain}`,
      description: "Personal portfolio and professional showcase",
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      url: url
    };
  } catch (error) {
    return null;
  }
}

/**
 * For X/Twitter, we'll need to use their API v2 which requires authentication
 * For now, we'll implement a basic profile checker
 */
export interface XProfile {
  username: string;
  name: string;
  bio: string;
  followers_count: number;
  verified: boolean;
  profile_image_url: string;
}

export async function fetchXProfile(username: string): Promise<XProfile | null> {
  // X API v2 requires authentication and has strict rate limits
  // For MVP, we'll implement basic validation and return a simple indicator
  // that the profile exists, without showing follower counts
  
  try {
    // Basic check if the profile URL is accessible
    const response = await fetch(`https://x.com/${username}`, {
      method: 'HEAD', // Just check if profile exists
      next: { revalidate: 3600 }
    });
    
    if (response.ok) {
      return {
        username,
        name: username,
        bio: "Profile verified on X",
        followers_count: 0, // Don't show count without API access
        verified: false,
        profile_image_url: `https://ui-avatars.com/api/?name=${username}&background=000000&color=ffffff&size=40&bold=true`
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * For design platforms (Dribbble, Behance, Layers), we'll implement similar approaches
 */
export async function fetchDribbbleProfile(username: string): Promise<any | null> {
  try {
    // Dribbble has a public API but requires authentication for detailed data
    // For now, we'll just verify the profile exists
    const response = await fetch(`https://dribbble.com/${username}`, {
      method: 'HEAD',
      next: { revalidate: 3600 }
    });
    
    return response.ok ? { username, exists: true } : null;
  } catch {
    return null;
  }
}

export async function fetchBehanceProfile(username: string): Promise<any | null> {
  try {
    const response = await fetch(`https://www.behance.net/${username}`, {
      method: 'HEAD',
      next: { revalidate: 3600 }
    });
    
    return response.ok ? { username, exists: true } : null;
  } catch {
    return null;
  }
}
