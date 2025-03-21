import { getGitHubData } from "@/lib/get-github-data";
import { GitHubClientSection } from "./github-client-section";

interface GitHubActivitySectionProps {
  token: string;
  userId?: string;
}

/**
 * GitHub activity section (server component) that pre-fetches data
 * and passes it to the client component
 */
export async function GitHubActivitySection({ 
  token, 
  userId 
}: GitHubActivitySectionProps) {
  let githubData = null;
  let error = null;
  
  try {
    githubData = await getGitHubData(token, userId);
  } catch (err) {
    console.error("Error fetching GitHub data:", err);
    error = err instanceof Error 
      ? err.message 
      : "Failed to fetch GitHub data. Please try again later.";
  }

  return (
    <GitHubClientSection 
      githubData={githubData} 
      isLoading={!githubData && !error} 
      error={error}
    />
  );
} 