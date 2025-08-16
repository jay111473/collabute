import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseGitHubSmartAuthProps {
  onSuccess?: (installationId: string) => void;
  onError?: (error: string) => void;
}

export function useGitHubSmartAuth({ 
  onSuccess, 
  onError 
}: UseGitHubSmartAuthProps = {}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [authState, setAuthState] = useState<'idle' | 'success' | 'error'>('idle');
  const [installationId, setInstallationId] = useState<string | null>(null);

  // Start GitHub authentication with direct redirect
  const startAuth = useCallback(async (userType: string = 'developer') => {
    setIsConnecting(true);
    setAuthState('idle');
    
    // Get GitHub App slug from environment
    const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
    if (!appSlug) {
      const error = "GitHub App configuration is missing";
      toast.error(error);
      onError?.(error);
      setIsConnecting(false);
      setAuthState('error');
      return;
    }

    // Create state for CSRF protection
    const state = JSON.stringify({
      random: Math.random().toString(36).substring(2, 15),
      type: userType,
      step: 'github',
      origin: window.location.origin,
      redirect: true
    });
    
    const encodedState = btoa(state);
    
    // Build installation URL
    const installationUrl = `https://github.com/apps/${appSlug}/installations/new?state=${encodedState}`;
    
    // Show info toast
    toast.info("Redirecting to GitHub for installation...", { 
      duration: 2000,
      description: "You'll be redirected back after completing the installation." 
    });
    
    // Redirect to GitHub after a small delay
    setTimeout(() => {
      window.location.assign(installationUrl);
    }, 500);
    
  }, [onSuccess, onError]);

  return {
    startAuth,
    isConnecting,
    authState,
    installationId,
    isSuccess: authState === 'success',
    isError: authState === 'error',
  };
}