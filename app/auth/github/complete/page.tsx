"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

/**
 * This page handles the completion of GitHub App installation
 * Users land here after completing the GitHub App installation
 */
export default function GitHubCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const installationId = searchParams.get("installation_id");

  useEffect(() => {
    // Store the installation ID if present
    if (installationId) {
      sessionStorage.setItem('githubInstallationId', installationId);
    }

    // Check if we have pending account data
    const pendingData = sessionStorage.getItem('pendingAccountData');
    
    // Auto-redirect after a short delay
    const timer = setTimeout(() => {
      if (pendingData) {
        // We have pending account data, so complete the signup
        const accountData = JSON.parse(pendingData);
        router.push(`/onboarding?complete_signup=true&github_connected=true&type=${accountData.type}`);
      } else {
        // No pending data, just go to onboarding
        router.push("/onboarding?step=github&github_app_installed=true");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, installationId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Success Icon */}
        <div className="flex items-center justify-center">
          <div className="relative w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* Logo */}
        <div className="relative w-16 h-16 mx-auto">
          <Image
            src="/logo.png"
            alt="Collabute Logo"
            fill
            className="object-cover rounded-md"
            priority
          />
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">GitHub App Installed!</h1>
          <p className="text-gray-400 text-sm">
            Your GitHub account has been successfully connected to Collabute.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => {
              const pendingData = sessionStorage.getItem('pendingAccountData');
              if (pendingData) {
                const accountData = JSON.parse(pendingData);
                router.push(`/onboarding?complete_signup=true&github_connected=true&type=${accountData.type}`);
              } else {
                router.push("/onboarding?step=github&github_app_installed=true");
              }
            }}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Continue to Collabute
          </Button>
          
          <p className="text-xs text-gray-500">
            You will be redirected automatically in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}