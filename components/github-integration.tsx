"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, HelpCircle } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useGitHubSmartAuth } from "./hooks/useGitHubSmartAuth";
import { PopupHelp } from "./ui/popup-help";

interface GitHubIntegrationProps {
  onComplete?: () => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
  title?: string;
  description?: string;
}

export const GitHubIntegration = ({ 
  onComplete,
  onSkip, 
  showSkipOption = true,
  title = "Connect with GitHub",
  description = "Automate issue workflow when GitHub pull requests are opened and merged."
}: GitHubIntegrationProps) => {
  const [showPopupHelp, setShowPopupHelp] = useState(false);
  const searchParams = useSearchParams();
  const connectGitHub = useMutation(api.githubAuth.connectGitHub);

  const {
    authState,
    isConnecting,
    installationId,
    authMethod,
    startAuth,
    reset,
    isSuccess,
    isAuthenticating
  } = useGitHubSmartAuth({
    onSuccess: (id) => {
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 1500);
    },
    onError: (error) => {
      console.error('GitHub auth error:', error);
    },
    preferPopup: true // Try popup first, fallback to redirect
  });

  // Handle GitHub connection
  const handleGitHubConnect = async () => {
    const currentParams = new URLSearchParams(window.location.search);
    const userType = currentParams.get('type') || 'developer';
    await startAuth(userType);
  };

  // Handle fallback for old redirect-based flow
  useEffect(() => {
    const githubError = searchParams.get('github_error');
    const appInstalledParam = searchParams.get('github_app_installed');
    const installationIdParam = searchParams.get('installation_id');

    // Handle GitHub App installation callback (fallback for redirect flow)
    if (appInstalledParam === 'true' && installationIdParam) {
      toast.success("GitHub App installed successfully!");
      
      // Complete the flow
      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
    } else if (githubError) {
      const errorMessage = githubError === 'invalid_state' 
        ? "Security verification failed" 
        : "GitHub connection failed";
      toast.error(errorMessage);
    }
  }, [searchParams, onComplete]);

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-6">
        {/* Logo Integration */}
        <div className="flex items-center justify-center gap-4">
          {/* Collabute Logo */}
          <div className="relative w-14 h-14 rounded-md overflow-hidden">
            <Image
              src="/logo.png"
              alt="Collabute Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Connection Arrow */}
          <ArrowRight className="w-5 h-5 text-gray-500" />
          
          {/* GitHub Icon */}
          <div className="relative w-14 h-14 rounded-full bg-gray-900 border border-grayBorders flex items-center justify-center">
            <FaGithub className="w-7 h-7 text-white" />
            {isSuccess && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
            {isAuthenticating && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {isSuccess ? 'GitHub Connected!' : 
             isAuthenticating ? 'Authenticating...' : 
             title}
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            {isSuccess ? 'Your GitHub account has been successfully connected to Collabute.' :
             isAuthenticating ? 
               authMethod === 'popup' ? 'Please complete the authentication in the popup window.' :
               authMethod === 'redirect' ? 'Redirecting to GitHub for authentication...' :
               'Connecting to GitHub...' :
             description}
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="space-y-4">
        <div className="bg-transparent border border-grayBorders rounded-lg p-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-white font-medium">
                Automatic Issue Linking
              </h3>
              <p className="text-gray-400 text-sm">
                Collabute automatically links issues with GitHub pull requests, keeping your project tracking synchronized.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-transparent border border-grayBorders rounded-lg p-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-white font-medium">
                Real-time Status Sync
              </h3>
              <p className="text-gray-400 text-sm">
                Issue status updates automatically when pull requests are opened, closed, merged, or reverted.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-transparent border border-grayBorders rounded-lg p-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-white font-medium">
                Privacy Focused
              </h3>
              <p className="text-gray-400 text-sm">
                We only request necessary permissions. Your code remains private - we don't ask for read access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Helpful Tips for Popup Authentication */}
      {isAuthenticating && authMethod === 'popup' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">!</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-blue-400 font-medium text-sm">Popup Authentication</h4>
              <p className="text-blue-300 text-sm">
                A popup window has opened for GitHub authentication. If you don't see it, please check for popup blockers 
                and allow popups for this site.
              </p>
              <button
                onClick={() => setShowPopupHelp(true)}
                className="text-blue-400 hover:text-blue-300 text-sm underline mt-2"
              >
                Need help enabling popups?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        <Button
          onClick={handleGitHubConnect}
          disabled={isConnecting || isSuccess}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isSuccess ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              GitHub Connected
            </>
          ) : isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              {isAuthenticating ? 'Authenticating...' : 'Opening GitHub...'}
            </>
          ) : (
            <>
              <FaGithub className="w-5 h-5 mr-2" />
              Install GitHub App
            </>
          )}
        </Button>

        {showSkipOption && (
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isConnecting}
            className="w-full text-gray-400 hover:text-white border-grayBorders"
          >
            I&apos;ll do this later
          </Button>
        )}
      </div>

      {/* Popup Help Modal */}
      {showPopupHelp && (
        <PopupHelp
          onClose={() => setShowPopupHelp(false)}
          onUseRedirect={() => {
            setShowPopupHelp(false);
            // Reset current auth and try with redirect
            reset();
            setTimeout(() => {
              const currentParams = new URLSearchParams(window.location.search);
              const userType = currentParams.get('type') || 'developer';
              
              // Force redirect by creating URL manually and redirecting
              const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || 'collabute';
              const statusId = Math.random().toString(36).substring(2, 15) + 
                              Math.random().toString(36).substring(2, 15);
              const randomState = Math.random().toString(36).substring(2, 15) + 
                                 Math.random().toString(36).substring(2, 15);
              
              const redirectInfo = {
                random: randomState,
                type: userType,
                step: 'github',
                origin: window.location.origin,
                popup: false,
                statusId: statusId
              };
              
              const encodedState = btoa(JSON.stringify(redirectInfo));
              const installationUrl = `https://github.com/apps/${appSlug}/installations/new?state=${encodedState}`;
              
              toast.info("Redirecting to GitHub...");
              window.location.assign(installationUrl);
            }, 500);
          }}
        />
      )}
    </div>
  );
};