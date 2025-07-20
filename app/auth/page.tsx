"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";
import GithubIcon from "@/public/icons/github";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";


const Auth = () => {
  const router = useRouter();
  
  const handleGitHubSignIn = async () => {
    await signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-black">
      <div className="flex flex-col items-center justify-center gap-y-10 sm:gap-y-16 px-4 sm:px-[80px] w-full max-w-[500px] py-8 sm:py-[90px] text-center rounded-md">
        <div className="flex flex-col items-center justify-center gap-y-2">
          <Image src="/logo.png" alt="logo" width={66} height={66} />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Collabute</h1>
        </div>
        <div className="flex flex-col items-center justify-center w-full mt-4 gap-y-2">
          <Button
            onClick={handleGitHubSignIn}
            className="w-full gap-x-2 border border-white hover:scale-[1.02] transition-all duration-200 hover:shadow-lg bg-black"
          >
            <GithubIcon />
            Continue with Github
          </Button>
          {/* <Button className="w-full gap-x-2 bg-[#6B4FBB] hover:bg-[#8263d9] dark:bg-[#6B4FBB] dark:hover:bg-[#8263d9] text-white hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-[#6B4FBB]/50">
            <GitLabIcon />
            Continue with GitLab
          </Button> */}
          <Button
            onClick={() => router.push("/auth/password")}
            className="w-full gap-x-2 bg-white dark:bg-white border border-darkPrimary text-black dark:text-black hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-darkPrimary/50"
          >
            Continue with Email
            <ArrowRightIcon color="black" className="w-4 h-4" />
          </Button>
          
          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth/onboarding" className="text-blue-400 hover:text-blue-300 hover:underline">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
