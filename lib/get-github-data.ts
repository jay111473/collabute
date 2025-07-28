
/**
 * Legacy GitHub data fetching utilities
 * 
 * @deprecated These functions are deprecated in favor of using Convex actions directly
 * in components. Use GitHubActivitySection or GitHubSection components instead.
 * 
 * The GitHub data is now fetched using:
 * - useAction(api.github.fetchGithubActivities)
 * - useAction(api.github.fetchGithubUserProfile)
 * - useQuery(api.github.getUserRepositories)
 */

// This file is kept for backward compatibility but should not be used for new code
// All GitHub data fetching should be done directly using Convex hooks in components 