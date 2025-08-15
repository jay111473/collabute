import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface AuthStatus {
  status: 'pending' | 'success' | 'error';
  userId?: string;
  error?: string;
}

interface UseGitHubSmartAuthOptions {
  onSuccess?: (installationId: string) => void;
  onError?: (error: string) => void;
  pollInterval?: number;
  timeout?: number;
  preferPopup?: boolean;
}

export const useGitHubSmartAuth = ({
  onSuccess,
  onError,
  pollInterval = 1500,
  timeout = 5 * 60 * 1000,
  preferPopup = true
}: UseGitHubSmartAuthOptions = {}) => {
  const [authState, setAuthState] = useState<'idle' | 'authenticating' | 'success' | 'error'>('idle');
  const [isConnecting, setIsConnecting] = useState(false);
  const [installationId, setInstallationId] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'popup' | 'redirect' | null>(null);
  
  const popupRef = useRef<Window | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusIdRef = useRef<string | null>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
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
        
        // For popup method, check if popup is still alive
        if (authMethod === 'popup' && popupRef.current?.closed && attempts > 2) {
          cleanup();
          setIsConnecting(false);
          setAuthState('error');
          const errorMsg = "GitHub connection was cancelled";
          toast.error(errorMsg);
          onError?.(errorMsg);
          return;
        }
        
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
  }, [checkAuthStatus, cleanup, onSuccess, onError, pollInterval, timeout, authMethod]);

  // Try popup authentication
  const tryPopupAuth = useCallback(async (installationUrl: string, statusId: string) => {
    // Calculate popup dimensions
    const popupWidth = Math.min(600, window.screen.width * 0.8);
    const popupHeight = Math.min(700, window.screen.height * 0.8);
    const left = Math.max(0, (window.screen.width - popupWidth) / 2);
    const top = Math.max(0, (window.screen.height - popupHeight) / 2);
    
    // Attempt to open popup
    popupRef.current = window.open(
      installationUrl,
      'github-auth',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    if (!popupRef.current) {
      return false; // Popup blocked
    }

    // Test if popup is actually functional
    try {
      // Check if we can access the popup after a short delay
      setTimeout(() => {
        if (popupRef.current && popupRef.current.closed) {
          // Popup closed immediately - likely blocked
          return false;
        }
      }, 100);
      
      setAuthMethod('popup');
      return true;
    } catch (error) {
      console.warn('Popup access test failed:', error);
      return false;
    }
  }, []);

  // Fallback to redirect authentication
  const fallbackToRedirect = useCallback((installationUrl: string) => {
    setAuthMethod('redirect');
    toast.info("Opening GitHub in this tab...", { duration: 2000 });
    
    // Small delay to show the message
    setTimeout(() => {
      window.location.assign(installationUrl);
    }, 1000);
  }, []);

  // Start authentication with smart method selection
  const startAuth = useCallback(async (userType: string = 'developer') => {
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

      // Generate unique status ID and state
      const statusId = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
      statusIdRef.current = statusId;
      
      const randomState = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
      
      const validUserTypes = ['developer', 'startup', 'project_manager', 'designer'];
      const validatedUserType = validUserTypes.includes(userType) ? userType : 'developer';
      
      // Encode state information
      const redirectInfo = {
        random: randomState,
        type: validatedUserType,
        step: 'github',
        origin: window.location.origin,
        popup: preferPopup,
        statusId: statusId
      };
      
      const encodedState = btoa(JSON.stringify(redirectInfo));
      
      try {
        sessionStorage.setItem('github_oauth_state', randomState);
      } catch (storageError) {
        console.warn('Failed to store state in sessionStorage:', storageError);
      }
      
      const installationUrl = `https://github.com/apps/${appSlug}/installations/new?state=${encodedState}`;
      
      // Try popup first if preferred, then fallback to redirect
      if (preferPopup) {
        const popupSuccess = await tryPopupAuth(installationUrl, statusId);
        
        if (popupSuccess) {
          // Popup opened successfully, start polling
          startPolling(statusId);
          
          // Set a fallback timer - if popup doesn't work, offer redirect
          fallbackTimeoutRef.current = setTimeout(() => {
            if (isConnecting && popupRef.current?.closed) {
              toast.error("Having trouble with popup? Let's try a different approach.", {
                duration: 8000,
                action: {
                  label: "Open in This Tab",
                  onClick: () => {
                    cleanup();
                    fallbackToRedirect(installationUrl);
                  }
                }
              });
            }
          }, 10000); // Offer fallback after 10 seconds
          
        } else {
          // Popup failed, use redirect immediately
          fallbackToRedirect(installationUrl);
        }
      } else {
        // User prefers redirect or popup not supported
        fallbackToRedirect(installationUrl);
      }
      
    } catch (error) {
      console.error('GitHub auth error:', error);
      cleanup();
      setIsConnecting(false);
      setAuthState('error');
      
      let errorMsg = "Failed to initiate GitHub connection";
      if (error instanceof Error) {
        if (error.message.includes('GitHub App slug')) {
          errorMsg = "GitHub integration is not properly configured";
        } else {
          errorMsg = error.message;
        }
      }
      
      toast.error(errorMsg);
      onError?.(errorMsg);
    }
  }, [isConnecting, authState, preferPopup, tryPopupAuth, fallbackToRedirect, startPolling, cleanup, onError]);

  // Reset state
  const reset = useCallback(() => {
    cleanup();
    setAuthState('idle');
    setIsConnecting(false);
    setInstallationId(null);
    setAuthMethod(null);
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
    authMethod,
    startAuth,
    reset,
    isSuccess: authState === 'success',
    isError: authState === 'error',
    isAuthenticating: authState === 'authenticating'
  };
};