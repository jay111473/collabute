import { useState, useEffect, useCallback } from "react";

interface GitHubAccessStatus {
  success: boolean;
  canCreateRepositories: boolean;
  githubConnected: boolean;
  githubUsername: string | null;
  error: string | null;
  oauthUrl: string | null;
}

export function useGitHubAccess(userId: string | null) {
  const [status, setStatus] = useState<GitHubAccessStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkGitHubAccess = useCallback(async () => {
    if (!userId) {
      setError("User ID is required to check GitHub access");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/github/repository-check?userId=${userId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to check GitHub access: ${response.statusText}`);
      }

      const data: GitHubAccessStatus = await response.json();
      setStatus(data);
      
      if (!data.success) {
        setError(data.error || "Failed to verify GitHub access");
      }
    } catch (err) {
      let errorMessage = "Failed to check GitHub access";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific error cases from the integration docs
        if (errorMessage.includes("GitHub account not connected")) {
          errorMessage = "Please connect your GitHub account to create projects with repositories.";
        } else if (errorMessage.includes("Invalid GitHub access token")) {
          errorMessage = "GitHub connection expired. Please reconnect your account.";
        } else if (errorMessage.includes("rate limit")) {
          errorMessage = "GitHub API limit reached. Please try again in a few minutes.";
        }
      }
      
      setError(errorMessage);
      console.error("Error checking GitHub access:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const connectGitHub = useCallback(() => {
    if (!userId) {
      setError("User ID is required to connect GitHub");
      return;
    }

    try {
      const currentStep = new URLSearchParams(window.location.search).get("step") || "0";
      const callbackUrl = encodeURIComponent(
        `${window.location.origin}/dashboard/wizard?github_auth_success=true&step=${currentStep}`
      );
      
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/oauth/github/login?callback_url=${callbackUrl}`;
    } catch (err) {
      console.error("Error initiating GitHub connection:", err);
      setError("Failed to initiate GitHub connection. Please try again.");
    }
  }, [userId]);

  // Check GitHub access on mount and when userId changes
  useEffect(() => {
    if (userId) {
      checkGitHubAccess();
    }
  }, [userId, checkGitHubAccess]);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get("github_auth_success");
    
    if (authSuccess === "true" && userId) {
      // Re-check access after OAuth success
      checkGitHubAccess();
      
      // Clean up URL
      const params = new URLSearchParams(window.location.search);
      params.delete("github_auth_success");
      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({ path: url }, "", url);
    }
  }, [userId, checkGitHubAccess]);

  return {
    status,
    isLoading,
    error,
    checkGitHubAccess,
    connectGitHub,
    hasGitHubAccess: status?.canCreateRepositories ?? false,
    isGitHubConnected: status?.githubConnected ?? false,
  };
} 