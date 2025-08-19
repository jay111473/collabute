"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import GithubIcon from "@/public/icons/github";
import { useGitHubAccess } from "@/app/dashboard/wizard/hooks/use-github-access";

interface GitHubAccessVerificationProps {
  userId: string;
  onAccessVerified: () => void;
  children: React.ReactNode;
}

/**
 * GitHub Access Verification component that checks if user has GitHub connected
 * and blocks access to wizard content until they do
 */
export function GitHubAccessVerification({
  userId,
  onAccessVerified,
  children,
}: GitHubAccessVerificationProps) {
  const {
    status,
    isLoading,
    error,
    connectGitHub,
    hasGitHubAccess,
    isGitHubConnected,
  } = useGitHubAccess(userId);

  // Call onAccessVerified when GitHub access is granted
  useEffect(() => {
    if (hasGitHubAccess) {
      onAccessVerified();
    }
  }, [hasGitHubAccess, onAccessVerified]);

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-darkPrimary mx-auto" />
          <p className="text-gray-400">Checking GitHub access...</p>
        </div>
      </div>
    );
  }

  // If GitHub is connected and has access, show children
  if (hasGitHubAccess) {
    return <>{children}</>;
  }

  // Handle case where GitHub is connected but can't create repositories
  if (isGitHubConnected && !hasGitHubAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <Alert className="mb-6 bg-blue-900/20 border-blue-800">
            <ArrowRight className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-400">
              GitHub is connected! We need a few more permissions to create
              repositories for you.
            </AlertDescription>
          </Alert>

          <Card className="bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 border-white/10 p-8 rounded-2xl">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                <GithubIcon className="h-8 w-8 text-blue-400" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  Install GitHub App
                </h3>
                <p className="text-gray-400">
                  Great! Your GitHub account is connected. Now install our GitHub App
                  to enable repository creation and collaboration features.
                </p>
              </div>

              <Button
                onClick={connectGitHub}
                className="w-full gap-x-2 bg-white dark:bg-white text-black dark:text-black hover:bg-white/90 dark:hover:bg-white/90 hover:scale-[1.02] transition-all duration-200"
              >
                <GithubIcon />
                Install GitHub App
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // If GitHub not connected, show connection UI
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        {error && (
          <Alert className="mb-6 bg-orange-900/20 border-orange-800">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 border-white/10 p-8 rounded-2xl">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
              <GithubIcon className="h-8 w-8 text-blue-400" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-white">
                Install GitHub App
              </h3>
              <p className="text-gray-400">
                Install our GitHub App to enable repository creation and
                collaboration features for your projects. This allows us to
                automatically set up your project infrastructure.
              </p>
            </div>

            {/* Setup progress */}
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-darkGray rounded-lg">
                <span className="text-gray-300">Step 1: GitHub App Installation</span>
                <span className="text-gray-400 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  Pending
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-darkGray rounded-lg">
                <span className="text-gray-300">Step 2: Account Setup</span>
                <span className="text-gray-400 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  Pending
                </span>
              </div>
            </div>

            <Button
              onClick={connectGitHub}
              className="w-full gap-x-2 bg-white dark:bg-white text-black dark:text-black hover:bg-white/90 dark:hover:bg-white/90 hover:scale-[1.02] transition-all duration-200"
            >
              <GithubIcon />
              Install GitHub App
            </Button>

            <div className="text-center text-xs text-gray-500">
              <p>
                You&apos;ll be redirected to GitHub to install our app.
                This only takes a few seconds and then we can continue setting
                up your project.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
