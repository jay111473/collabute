import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  const [error, setError] = useState<string | null>(null);
  
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

  const connectGitHub = useCallback(() => {
    // Redirect to GitHub App installation directly
    window.location.href = '/api/auth/github/install';
  }, []);

  // Loading state is based on query loading
  const queryLoading = githubConnectionStatus === undefined;

  return {
    status,
    isLoading: queryLoading,
    error,
    checkGitHubAccess,
    connectGitHub,
    hasGitHubAccess: status?.canCreateRepositories ?? false,
    isGitHubConnected: status?.githubConnected ?? false,
  };
} 