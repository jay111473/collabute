import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

interface GitHubAccessStatus {
  success: boolean;
  canCreateRepositories: boolean;
  githubConnected: boolean;
  githubUsername: string | null;
  error: string | null;
  oauthUrl: string | null;
}

export function useGitHubAccess(_userId?: string | null) {
  const [status, setStatus] = useState<GitHubAccessStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuthActions();
  
  // Use Convex query to check GitHub connection status (automatically uses authenticated user)
  const githubConnectionStatus = useQuery(api.githubAuth.checkGitHubConnection);

  // Update status when GitHub connection status changes
  useEffect(() => {
    if (githubConnectionStatus) {
      const data: GitHubAccessStatus = {
        success: githubConnectionStatus.isConnected,
        canCreateRepositories: githubConnectionStatus.hasGitHubAccess,
        githubConnected: githubConnectionStatus.isConnected,
        githubUsername: githubConnectionStatus.githubUsername,
        error: githubConnectionStatus.error,
        oauthUrl: null,
      };
      setStatus(data);
      setError(githubConnectionStatus.error);
    }
  }, [githubConnectionStatus]);

  const checkGitHubAccess = useCallback(async () => {
    // The query automatically handles authentication and security
    // No manual checks needed here
  }, []);

  const connectGitHub = useCallback(async () => {
    // Prevent multiple simultaneous connections
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use Convex Auth to sign in with GitHub
      // This will redirect to GitHub OAuth and back
      await signIn("github", {
        redirectTo: window.location.pathname + window.location.search,
      });
    } catch (err) {
      setError("Failed to connect to GitHub. Please try again.");
      setIsLoading(false);
    }
  }, [signIn, isLoading]);

  // Loading state is based on query loading
  const queryLoading = githubConnectionStatus === undefined;

  return {
    status,
    isLoading: isLoading || queryLoading,
    error,
    checkGitHubAccess,
    connectGitHub,
    hasGitHubAccess: status?.canCreateRepositories ?? false,
    isGitHubConnected: status?.githubConnected ?? false,
  };
} 