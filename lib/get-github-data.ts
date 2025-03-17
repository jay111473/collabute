
/**
 * Fetches all GitHub user data including activities, commits, and stats
 */
export async function getGitHubData(
  token: string,
  userId?: string,
  activitiesPerPage: number = 5,
  commitsPerPage: number = 5
): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    
    if (userId) {
      queryParams.append("userId", userId);
    }
    
    queryParams.append("activitiesPerPage", activitiesPerPage.toString());
    queryParams.append("commitsPerPage", commitsPerPage.toString());
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/github/user/index?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch GitHub data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    throw error;
  }
}

/**
 * Fetches GitHub user activities
 */
export async function getGitHubActivities(
  token: string,
  userId?: string,
  perPage: number = 10
): Promise<{ activities: any[] }> {
  try {
    const queryParams = new URLSearchParams();
    
    if (userId) {
      queryParams.append("userId", userId);
    }
    
    queryParams.append("perPage", perPage.toString());
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/github/user/activities?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch GitHub activities");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching GitHub activities:", error);
    throw error;
  }
}

/**
 * Fetches GitHub user commits
 */
export async function getGitHubCommits(
  token: string,
  userId?: string,
  perPage: number = 10
): Promise<{ commits: any[] }> {
  try {
    const queryParams = new URLSearchParams();
    
    if (userId) {
      queryParams.append("userId", userId);
    }
    
    queryParams.append("perPage", perPage.toString());
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/github/user/commits?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch GitHub commits");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching GitHub commits:", error);
    throw error;
  }
}

/**
 * Fetches GitHub user stats
 */
export async function getGitHubStats(
  token: string,
  userId?: string
): Promise<{ stats: any }> {
  try {
    const queryParams = new URLSearchParams();
    
    if (userId) {
      queryParams.append("userId", userId);
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/github/user/stats?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch GitHub stats");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    throw error;
  }
} 