import React from "react";
import CreateAccount from "@/components/auth/components/create-account";
import { Toaster } from "sonner";
import Image from "next/image";

const Onboarding = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <Toaster />
      {/* Logo */}
      <div className="relative w-16 h-16 mb-2">
        <Image
          src="/logo.svg"
          alt="Collabute Logo"
          fill
          className="rounded-md"
          priority
        />
      </div>

      {/* Step Title */}
      <h1 className="text-3xl font-bold text-center w-full break-words">
        Set up your account
      </h1>

      {/* Description */}
      <div className="text-center text-zinc-400 space-y-2 w-full">
        <p className="text-sm">
          Tell us a bit about yourself so we can personalize your experience.
        </p>
      </div>

      {/* Form would go here */}
      <div className="w-1/3 flex justify-center items-center mt-6">
        <CreateAccount />
      </div>
    </div>
  );
};

export default Onboarding;
