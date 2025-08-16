"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CompleteSignupProps {
  githubConnected?: boolean;
  githubSkipped?: boolean;
  userType?: string;
}

export function CompleteSignup({ githubConnected, githubSkipped, userType }: CompleteSignupProps) {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const storeInstallationId = useMutation(api.githubInstallation.storeInstallationId);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createAccount = async () => {
      // Get pending account data from sessionStorage
      const pendingData = sessionStorage.getItem('pendingAccountData');
      const githubInstallationId = sessionStorage.getItem('githubInstallationId');
      
      if (!pendingData) {
        setError("No pending account data found. Please start over.");
        setTimeout(() => {
          router.push("/onboarding");
        }, 3000);
        return;
      }

      try {
        setIsCreatingAccount(true);
        const accountData = JSON.parse(pendingData);
        
        // Create form data for account creation
        const formData = new FormData();
        formData.append("email", accountData.email);
        formData.append("password", accountData.password);
        formData.append("name", accountData.name);
        formData.append("flow", "signUp");
        
        if (accountData.phoneNumber) {
          formData.append("phoneNumber", accountData.phoneNumber);
        }
        if (accountData.countryCode) {
          formData.append("countryCode", accountData.countryCode);
        }
        
        formData.append("type", accountData.type.toUpperCase());
        
        // Add GitHub installation status
        if (githubConnected) {
          formData.append("githubConnected", "true");
          if (githubInstallationId) {
            formData.append("githubInstallationId", githubInstallationId);
          }
        }
        
        // Create the account
        await signIn("password", formData);
        
        // Store GitHub installation ID in Convex if connected
        if (githubConnected && githubInstallationId) {
          try {
            await storeInstallationId({ installationId: githubInstallationId });
          } catch (err) {
            // Non-critical error, just log it
          }
        }
        
        // Clear the stored data
        sessionStorage.removeItem('pendingAccountData');
        sessionStorage.removeItem('githubInstallationId');
        
        // Show success message
        if (githubConnected) {
          toast.success("Account created successfully!", {
            description: "Your GitHub account has been connected.",
          });
        } else if (githubSkipped) {
          toast.success("Account created successfully!", {
            description: "You can connect GitHub later from your dashboard.",
          });
        } else {
          toast.success("Account created successfully!");
        }
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
        
      } catch (error: any) {
        setError(error.message || "Failed to create account. Please try again.");
        setIsCreatingAccount(false);
        
        // Clear bad data and redirect to start over
        sessionStorage.removeItem('pendingAccountData');
        setTimeout(() => {
          router.push("/onboarding");
        }, 3000);
      }
    };

    createAccount();
  }, [signIn, router, githubConnected, githubSkipped, storeInstallationId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="text-red-500 mb-4">❌</div>
        <h2 className="text-xl font-semibold mb-2">Account Creation Failed</h2>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <p className="text-gray-500 text-xs">Redirecting to signup...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <h2 className="text-xl font-semibold mb-2">Creating Your Account</h2>
      <p className="text-gray-400 text-sm">
        {githubConnected 
          ? "Setting up your account with GitHub integration..." 
          : "Setting up your account..."}
      </p>
    </div>
  );
}