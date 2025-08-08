"use client";

import React, { useEffect, useState } from "react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import CreateAccount from "@/components/auth/components/create-account";
import { Toaster } from "sonner";
import Image from "next/image";
import Link from "next/link";

function AuthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-white">Redirecting to dashboard...</div>
    </div>
  );
}

function OnboardingForm() {
  const searchParams = useSearchParams();
  const [invitationData, setInvitationData] = useState<{
    token?: string;
    type?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");
    const email = searchParams.get("email");

    if (token || type) {
      setInvitationData({
        token: token || undefined,
        type: type || undefined,
        email: email || undefined,
      });
    }
  }, [searchParams]);

  const isProjectManagerInvite = invitationData?.type === "PROJECT_MANAGER";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4 py-6 md:px-6 overflow-x-hidden">
      <Toaster />

      {/* Logo */}
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-2">
        <Image
          src="/logo.png"
          alt="Collabute Logo"
          fill
          className="rounded-md"
          priority
        />
      </div>

      {/* Step Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-center w-full break-words mt-4">
        {isProjectManagerInvite
          ? "Join as Project Manager"
          : "Set up your account"}
      </h1>

      {/* Description */}
      <div className="text-center text-zinc-400 space-y-2 w-full mb-2">
        {isProjectManagerInvite ? (
          <div className="space-y-2">
            <p className="text-xs sm:text-sm px-2">
              You&apos;ve been invited to be a Technical Product Manager.
            </p>
            <p className="text-xs sm:text-sm px-2 text-blue-400">
              Complete your profile to start managing the project.
            </p>
          </div>
        ) : (
          <p className="text-xs sm:text-sm px-2">
            Tell us a bit about yourself so we can personalize your experience.
          </p>
        )}
      </div>

      {/* Form */}
      <div className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 flex justify-center items-center mt-4 md:mt-6 overflow-x-auto">
        <CreateAccount invitationData={invitationData} />
      </div>

      {/* Sign In Link */}
      <div className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 hover:underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}

const Onboarding = () => {
  return (
    <>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white">Loading...</div>
        </div>
      </AuthLoading>

      <Authenticated>
        <AuthenticatedRedirect />
      </Authenticated>

      <Unauthenticated>
        <OnboardingForm />
      </Unauthenticated>
    </>
  );
};

export default Onboarding;
