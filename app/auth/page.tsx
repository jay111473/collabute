"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Unauthenticated, AuthLoading } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ArrowRightIcon, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { ConvexError } from "convex/values";

function AuthForm() {
  const { signIn } = useAuthActions();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmailInput(email);
    setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordInput(e.target.value);
  };

  const handleEmailSubmit = () => {
    if (isValidEmail) {
      setShowPasswordField(true);
    }
  };

  const handlePasswordSubmit = async () => {
    if (isValidEmail && passwordInput.length >= 8) {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("email", emailInput);
      formData.append("password", passwordInput);
      formData.append("flow", "signIn"); // Add required flow parameter

      try {
        await signIn("password", formData);
        window.location.href = "/dashboard";
      } catch (error: any) {
        console.error("Sign in error:", error);
        const errorMessage =
          error instanceof ConvexError
            ? (error.data as { message?: string })?.message || "Authentication failed"
            : error.message || "An unexpected error occurred";
        console.error("Sign in failed:", errorMessage);
        toast.error("Sign In Failed", {
          description: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showPasswordField) {
      handleEmailSubmit();
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && showPasswordField) {
      handlePasswordSubmit();
    }
  };

  const isPasswordValid = passwordInput.length >= 8;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-black">
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181B",
            border: "1px solid #27272A",
            color: "#ffffff",
          },
        }}
      />
      <div className="flex flex-col items-center justify-center gap-y-10 sm:gap-y-16 px-4 sm:px-[80px] w-full max-w-[500px] py-8 sm:py-[90px] text-center rounded-md">
        <div className="flex flex-col items-center justify-center gap-y-2">
          <Image src="/logo.png" alt="logo" width={66} height={66} />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Collabute
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center w-full mt-4 space-y-4">
          {/* Email Input */}
          <div className="w-full">
            <label className="block text-sm font-medium text-white mb-2 text-left">
              Email
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={emailInput}
              onChange={handleEmailChange}
              onKeyDown={handleEmailKeyDown}
              disabled={showPasswordField}
              className={`w-full bg-black border-grayBorders text-white placeholder:text-gray-400 transition-opacity duration-300 ${
                showPasswordField ? "opacity-75" : ""
              }`}
            />
          </div>

          {/* Password Input - animated */}
          <div
            className={`w-full transform transition-all duration-500 ease-in-out ${
              showPasswordField
                ? "translate-y-0 opacity-100 max-h-32"
                : "-translate-y-4 opacity-0 max-h-0 overflow-hidden"
            }`}
          >
            <label className="block text-sm font-medium text-white mb-2 text-left">
              Password
            </label>
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={passwordInput}
                onChange={handlePasswordChange}
                onKeyDown={handlePasswordKeyDown}
                className="bg-black border-grayBorders text-white placeholder:text-gray-400 pr-10 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button - animated position */}
          <div className="w-full relative">
            {/* Email Continue Button */}
            <div
              className={`absolute inset-0 transform transition-all duration-500 ease-in-out ${
                showPasswordField
                  ? "translate-y-8 opacity-0 pointer-events-none"
                  : "translate-y-0 opacity-100"
              }`}
            >
              <Button
                onClick={handleEmailSubmit}
                disabled={!isValidEmail}
                className="w-full gap-x-2 bg-white dark:bg-white border border-darkPrimary text-black dark:text-black hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-darkPrimary/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRightIcon color="black" className="w-4 h-4" />
              </Button>
            </div>

            {/* Password Sign In Button */}
            <div
              className={`absolute inset-0 transform transition-all duration-500 ease-in-out ${
                showPasswordField
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0 pointer-events-none"
              }`}
            >
              <Button
                onClick={handlePasswordSubmit}
                disabled={!isPasswordValid || isSubmitting}
                className="w-full gap-x-2 bg-white dark:bg-white border border-darkPrimary text-black dark:text-black hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-darkPrimary/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
                {!isSubmitting && (
                  <ArrowRightIcon color="black" className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Spacer to maintain height */}
            <div className="h-10 mt-4"></div>
          </div>

          {/* Separator */}
          <div className="flex items-center w-full my-2">
            <div className="flex-1 border-t border-grayBorders"></div>
            <span className="px-4 text-sm text-gray-400">or</span>
            <div className="flex-1 border-t border-grayBorders"></div>
          </div>

          {/* GitHub Button */}
          <Button
            onClick={() =>
              void signIn("github", {
                redirectTo: "/dashboard",
              })
            }
            className="w-full gap-x-2 bg-white border border-white hover:scale-[1.02] transition-all duration-200 hover:shadow-lg text-black"
          >
            <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with Github
          </Button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/onboarding"
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const Auth = () => {
  return (
    <>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white">Loading...</div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <AuthForm />
      </Unauthenticated>
    </>
  );
};

export default Auth;
