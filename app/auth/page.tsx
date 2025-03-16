"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";
import GitLabIcon from "@/public/icons/gitlab";
import GithubIcon from "@/public/icons/github";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";


const Auth = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-black">
      <div className="flex flex-col items-center justify-center gap-y-16 px-[80px] w-[500px] py-[90px] text-center rounded-md">
        <div className="flex flex-col items-center justify-center gap-y-2">
          <Image src="/logo.svg" alt="logo" width={66} height={66} />
          <h1 className="text-3xl font-bold">Collabute</h1>
        </div>
        <div className="flex flex-col items-center justify-center w-full mt-4 gap-y-2">
          <Button
            onClick={() =>
              router.push(process.env.NEXT_PUBLIC_API_URL + "/api/oauth/github")
            }
            className="w-full gap-x-2 border border-white hover:bg-white/20 hover:scale-[1.02] transition-all duration-200 hover:shadow-lg dark:hover:shadow-white/10"
          >
            <GithubIcon />
            Continue with Github
          </Button>
          <Button className="w-full gap-x-2 bg-[#6B4FBB] hover:bg-[#8263d9] dark:bg-[#6B4FBB] dark:hover:bg-[#8263d9] text-white hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-[#6B4FBB]/50">
            <GitLabIcon />
            Continue with GitLab
          </Button>
          <Button
            onClick={() => router.push("/auth/password")}
            className="w-full gap-x-2 bg-white dark:bg-white border border-[#930CFE] text-black dark:text-black hover:bg-[#930CFE] hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-[#930CFE]/50"
          >
            Continue with Email
            <ArrowRightIcon color="black" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
