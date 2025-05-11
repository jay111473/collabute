import React from "react";
import CreateAccount from "@/components/auth/components/create-account";
import { Toaster } from "sonner";
import Image from "next/image";
import Link from "next/link";

const Onboarding = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4 py-6 md:px-6 overflow-x-hidden">
      <Toaster />
      {/* Logo */}
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-2">
        <Image
          src="/logo.svg"
          alt="Collabute Logo"
          fill
          className="rounded-md"
          priority
        />
      </div>

      {/* Step Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-center w-full break-words mt-4">
        Set up your account
      </h1>

      {/* Description */}
      <div className="text-center text-zinc-400 space-y-2 w-full mb-2">
        <p className="text-xs sm:text-sm px-2">
          Tell us a bit about yourself so we can personalize your experience.
        </p>
      </div>

      {/* Form */}
      <div className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 flex justify-center items-center mt-4 md:mt-6 overflow-x-auto">
        <CreateAccount />
      </div>

      {/* Sign In Link */}
      <div className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/auth"
          className="text-blue-400 hover:text-blue-300 hover:underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
};

export default Onboarding;
