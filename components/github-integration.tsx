"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useGitHubSmartAuth } from "@/components/hooks/useGitHubSmartAuth";

interface GitHubIntegrationProps {
  onComplete?: () => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
  title?: string;
  description?: string;
}

export function GitHubIntegration({ 
  onComplete, 
  onSkip,
  showSkipOption = false,
  title = "Connect Your GitHub Account",
  description = "Link your GitHub account to enable seamless project management and issue tracking."
}: GitHubIntegrationProps) {
  const searchParams = useSearchParams();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { startAuth } = useGitHubSmartAuth({
    onSuccess: (installationId) => {
      setIsSuccess(true);
      setIsAuthenticating(false);
      // Store installation ID if needed
      if (installationId) {
        sessionStorage.setItem('githubInstallationId', installationId);
      }
      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
    },
    onError: (error) => {
      setIsAuthenticating(false);
      toast.error(error);
    }
  });

  // Handle GitHub connection
  const handleGitHubConnect = async () => {
    setIsAuthenticating(true);
    const currentParams = new URLSearchParams(window.location.search);
    const userType = currentParams.get('type') || 'developer';
    await startAuth(userType);
  };

  // Handle fallback for redirect flow callback
  useEffect(() => {
    const githubError = searchParams.get('github_error');
    const appInstalledParam = searchParams.get('github_app_installed');
    const installationIdParam = searchParams.get('installation_id');

    // Handle GitHub App installation callback
    if (appInstalledParam === 'true' && installationIdParam) {
      setIsSuccess(true);
      toast.success("GitHub App installed successfully!");
      
      // Store installation ID
      sessionStorage.setItem('githubInstallationId', installationIdParam);
      
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
             isAuthenticating ? 'Redirecting to GitHub...' : 
             title}
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            {isSuccess ? 'Your GitHub account has been successfully connected to Collabute.' :
             isAuthenticating ? 'Please complete the authentication in GitHub.' :
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
                We only access the repositories you specifically grant permissions to, ensuring your private code stays private.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {!isSuccess && (
          <>
            <Button
              onClick={handleGitHubConnect}
              disabled={isAuthenticating}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {isAuthenticating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Redirecting to GitHub...
                </>
              ) : (
                <>
                  <FaGithub className="w-5 h-5 mr-2" />
                  Connect GitHub Account
                </>
              )}
            </Button>

            {showSkipOption && !isAuthenticating && (
              <Button
                onClick={handleSkip}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Skip for now
              </Button>
            )}
          </>
        )}

        {isSuccess && (
          <div className="text-center space-y-2">
            <p className="text-green-400 text-sm font-medium">
              ✓ GitHub successfully connected
            </p>
            <p className="text-gray-500 text-xs">
              Redirecting to your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}