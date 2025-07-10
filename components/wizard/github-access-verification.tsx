"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Github } from "lucide-react";
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

  // If user has GitHub access, show children and call onAccessVerified
  if (hasGitHubAccess) {
    onAccessVerified();
    return (
      <div className="space-y-4">
        {/* Show GitHub status indicator */}
        <Alert className="bg-green-900/20 border-green-800">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400">
            ✅ GitHub Connected as @{status?.githubUsername}
            <p className="text-sm text-green-300 mt-1">
              Repository will be created when your project is approved
            </p>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
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
          <Alert className="mb-6 bg-yellow-900/20 border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              GitHub is connected but insufficient permissions to create repositories.
            </AlertDescription>
          </Alert>

          <Card className="bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 border-white/10 p-8 rounded-2xl">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-yellow-400" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  Additional Permissions Required
                </h3>
                <p className="text-gray-400">
                  Your GitHub account is connected, but we need additional permissions
                  to create repositories for your projects.
                </p>
              </div>

              <Button
                onClick={connectGitHub}
                disabled={isLoading}
                className="w-full gap-x-2 bg-white dark:bg-white text-black dark:text-black hover:bg-white/90 dark:hover:bg-white/90 hover:scale-[1.02] transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reconnecting...
                  </>
                ) : (
                  <>
                    <GithubIcon />
                    Reconnect with Full Permissions
                  </>
                )}
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
          <Alert className="mb-6 bg-red-900/20 border-red-800">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 border-white/10 p-8 rounded-2xl">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-white">
                GitHub Account Required
              </h3>
              <p className="text-gray-400">
                Connect your GitHub account to create projects with repositories.
                A repository will be automatically created when your project is
                approved.
              </p>
            </div>

            {/* Connection status details */}
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-darkGray rounded-lg">
                <span className="text-gray-300">GitHub Connected</span>
                <span className="text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  No
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-darkGray rounded-lg">
                <span className="text-gray-300">Repository Creation</span>
                <span className="text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Blocked
                </span>
              </div>
            </div>

            <Button
              onClick={connectGitHub}
              disabled={isLoading}
              className="w-full gap-x-2 bg-white dark:bg-white text-black dark:text-black hover:bg-white/90 dark:hover:bg-white/90 hover:scale-[1.02] transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <GithubIcon />
                  Connect GitHub Account
                </>
              )}
            </Button>

            <div className="text-center text-xs text-gray-500">
              <p>
                You&apos;ll be redirected to GitHub to authorize access. After
                connecting, you can continue with the project wizard.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 