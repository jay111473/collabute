import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface AuthStatus {
  status: 'pending' | 'success' | 'error';
  userId?: string;
  error?: string;
}

interface UseGitHubPopupAuthOptions {
  onSuccess?: (installationId: string) => void;
  onError?: (error: string) => void;
  pollInterval?: number;
  timeout?: number;
}

export const useGitHubPopupAuth = ({
  onSuccess,
  onError,
  pollInterval = 1500,
  timeout = 5 * 60 * 1000 // 5 minutes
}: UseGitHubPopupAuthOptions = {}) => {
  const [authState, setAuthState] = useState<'idle' | 'authenticating' | 'success' | 'error'>('idle');
  const [isConnecting, setIsConnecting] = useState(false);
  const [installationId, setInstallationId] = useState<string | null>(null);
  
  const popupRef = useRef<Window | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusIdRef = useRef<string | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
      popupRef.current = null;
    }
    statusIdRef.current = null;
  }, []);

  // Check authentication status
  const checkAuthStatus = useCallback(async (statusId: string): Promise<AuthStatus | null> => {
    try {
      const response = await fetch(`/api/auth/github/status?statusId=${statusId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error checking auth status:', error);
      return null;
    }
  }, []);

  // Handle popup messages
  const handlePopupMessage = useCallback((event: MessageEvent) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data?.type === 'github-auth-complete') {
      const { status, message, installationId: id } = event.data;
      
      cleanup();
      setIsConnecting(false);
      
      if (status === 'success') {
        setAuthState('success');
        setInstallationId(id);
        toast.success("GitHub App installed successfully!");
        onSuccess?.(id);
      } else {
        setAuthState('error');
        const errorMsg = message || "GitHub connection failed";
        toast.error(errorMsg);
        onError?.(errorMsg);
      }
    }
  }, [cleanup, onSuccess, onError]);

  // Start polling
  const startPolling = useCallback((statusId: string) => {
    let attempts = 0;
    const maxAttempts = Math.floor(timeout / pollInterval);
    
    pollingRef.current = setInterval(async () => {
      attempts++;
      
      try {
        const status = await checkAuthStatus(statusId);
        
        if (status?.status === 'success') {
          cleanup();
          setIsConnecting(false);
          setAuthState('success');
          setInstallationId(status.userId || null);
          toast.success("GitHub App installed successfully!");
          onSuccess?.(status.userId || '');
          return;
          
        } else if (status?.status === 'error') {
          cleanup();
          setIsConnecting(false);
          setAuthState('error');
          const errorMsg = status.error || "GitHub connection failed";
          toast.error(errorMsg);
          onError?.(errorMsg);
          return;
        }
        
        // Check if popup was closed manually (but allow for GitHub redirects)
        if (popupRef.current?.closed) {
          // Only treat as cancellation if we haven't been polling for very long
          // GitHub redirects can sometimes cause temporary "closed" state
          if (attempts < 3) {
            // Give it more time, might just be redirecting
            return;
          }
          
          cleanup();
          setIsConnecting(false);
          setAuthState('error');
          const errorMsg = "GitHub connection was cancelled or popup was closed";
          toast.error(errorMsg);
          onError?.(errorMsg);
          return;
        }
        
        // Check if we've reached max attempts
        if (attempts >= maxAttempts) {
          cleanup();
          setIsConnecting(false);
          setAuthState('error');
          const errorMsg = "GitHub connection timed out";
          toast.error(errorMsg);
          onError?.(errorMsg);
          return;
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        // Don't fail on individual polling errors, just log them
      }
    }, pollInterval);
    
    // Set timeout as backup
    timeoutRef.current = setTimeout(() => {
      if (pollingRef.current) {
        cleanup();
        setIsConnecting(false);
        setAuthState('error');
        const errorMsg = "GitHub connection timed out";
        toast.error(errorMsg);
        onError?.(errorMsg);
      }
    }, timeout);
  }, [checkAuthStatus, cleanup, onSuccess, onError, pollInterval, timeout]);

  // Start authentication
  const startAuth = useCallback(async (userType: string = 'developer') => {
    // Prevent multiple concurrent auth attempts
    if (isConnecting || authState === 'authenticating') {
      console.warn('Authentication already in progress');
      return;
    }

    setIsConnecting(true);
    setAuthState('authenticating');
    
    try {
      // Validate environment
      const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
      if (!appSlug) {
        throw new Error('GitHub App slug not configured');
      }

      // Generate unique status ID
      const statusId = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
      statusIdRef.current = statusId;
      
      // Generate CSRF state
      const randomState = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
      
      // Validate user type
      const validUserTypes = ['developer', 'startup', 'project_manager', 'designer'];
      const validatedUserType = validUserTypes.includes(userType) ? userType : 'developer';
      
      // Encode state information
      const redirectInfo = {
        random: randomState,
        type: validatedUserType,
        step: 'github',
        origin: window.location.origin,
        popup: true,
        statusId: statusId
      };
      
      const encodedState = btoa(JSON.stringify(redirectInfo));
      
      // Store state securely
      try {
        sessionStorage.setItem('github_oauth_state', randomState);
      } catch (storageError) {
        console.warn('Failed to store state in sessionStorage:', storageError);
        // Continue anyway, state is also validated server-side
      }
      
      // Create installation URL
      const installationUrl = `https://github.com/apps/${appSlug}/installations/new?state=${encodedState}`;
      
      // Calculate optimal popup dimensions
      const popupWidth = Math.min(600, window.screen.width * 0.8);
      const popupHeight = Math.min(700, window.screen.height * 0.8);
      const left = Math.max(0, (window.screen.width - popupWidth) / 2);
      const top = Math.max(0, (window.screen.height - popupHeight) / 2);
      
      // Attempt to open popup
      popupRef.current = window.open(
        installationUrl,
        'github-auth',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,noopener=yes,noreferrer=yes`
      );
      
      if (!popupRef.current) {
        // Popup blocked - provide fallback options
        cleanup();
        setIsConnecting(false);
        setAuthState('error');
        
        toast.error("Popup was blocked by your browser", {
          description: "Please allow popups for this site or use the redirect option below",
          duration: 8000,
          action: {
            label: "Use Redirect Instead",
            onClick: () => {
              toast.info("Redirecting to GitHub...");
              window.location.assign(installationUrl);
            }
          }
        });
        
        onError?.("Popup was blocked. Please allow popups and try again, or use the redirect option.");
        return;
      }
      
      // Check if popup opened successfully with better detection
      let popupOpenedSuccessfully = false;
      try {
        // Test if we can access the popup window
        if (popupRef.current.window && !popupRef.current.closed) {
          popupRef.current.focus();
          popupOpenedSuccessfully = true;
        }
      } catch (focusError) {
        console.warn('Could not focus popup, but may still be open:', focusError);
        // Even if focus fails, popup might still be open
        popupOpenedSuccessfully = !popupRef.current.closed;
      }

      // Double-check popup status after a brief delay
      setTimeout(() => {
        if (popupRef.current && popupRef.current.closed) {
          // Popup was likely blocked if it closed immediately
          cleanup();
          setIsConnecting(false);
          setAuthState('error');
          
          toast.error("Popup was blocked or closed immediately", {
            description: "Please allow popups for this site and try again",
            duration: 8000,
            action: {
              label: "Use Redirect Instead",
              onClick: () => {
                toast.info("Redirecting to GitHub...");
                window.location.assign(installationUrl);
              }
            }
          });
          
          onError?.("Popup was blocked or closed. Please allow popups and try again.");
          return;
        }
      }, 500); // Check after 500ms
      
      // Start polling
      startPolling(statusId);
      
    } catch (error) {
      console.error('GitHub auth error:', error);
      cleanup();
      setIsConnecting(false);
      setAuthState('error');
      
      let errorMsg = "Failed to initiate GitHub connection";
      if (error instanceof Error) {
        if (error.message.includes('GitHub App slug')) {
          errorMsg = "GitHub integration is not properly configured";
        } else if (error.message.includes('Popup blocked')) {
          errorMsg = "Popup was blocked. Please allow popups and try again";
        } else {
          errorMsg = error.message;
        }
      }
      
      toast.error(errorMsg);
      onError?.(errorMsg);
    }
  }, [isConnecting, authState, startPolling, cleanup, onError]);

  // Reset state
  const reset = useCallback(() => {
    cleanup();
    setAuthState('idle');
    setIsConnecting(false);
    setInstallationId(null);
  }, [cleanup]);

  // Setup message listener
  useEffect(() => {
    window.addEventListener('message', handlePopupMessage);
    return () => {
      window.removeEventListener('message', handlePopupMessage);
      cleanup();
    };
  }, [handlePopupMessage, cleanup]);

  return {
    authState,
    isConnecting,
    installationId,
    startAuth,
    reset,
    isSuccess: authState === 'success',
    isError: authState === 'error',
    isAuthenticating: authState === 'authenticating'
  };
};