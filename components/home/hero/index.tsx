"use client";
import React from "react";
import Image from "next/image";
import AIBadge from "@/components/uikit/ai-badge";
import { CosmicButton } from "@/components/uikit/cosmic-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGitHubStars } from "@/hooks/use-github-stars";
import GithubIcon from "@/public/icons/github";

const Hero = () => {
  const { stars, formatStars, loading } = useGitHubStars("muperdev/collabute");

  return (
    <div className="w-full flex flex-col justify-center items-center min-h-[70vh] relative bg-background">
      {/* Network pattern background at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] md:h-[400px]">
        <div className="relative w-full h-full">
          <Image
            src="/hero-bg.png"
            alt="Network pattern background"
            fill
            priority
            style={{ objectFit: "cover" }}
            className="opacity-60"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center gap-y-2 max-w-4xl mx-auto px-4 text-center mt-[100px] md:mt-[250px]">
        {/* Innovation badge */}
        <AIBadge text="Innovation with ai" />

        {/* Main title */}
        <h1 className="text-2xl md:text-4xl lg:text-[52px] 2xl:text-[62px] font-bold leading-tight">
          <span className="text-darkPrimary">Build Now</span>{" "}
          <span className="text-white">& Forever</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white md:text-md text-xs xl:text-base 2xl:text-base text-center mt-2 mb-4 md:mt-6 md:mb-8">
          All in one solution to manage and launch your product
          <br />
          Collaborate, ship & scale.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-row gap-4">
          <Link href="/early-bird">
            <CosmicButton>Start your project</CosmicButton>
          </Link>
          <Link href="/early-bird">
            <Button
              size="lg"
              variant="outline"
              className="border-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 md:px-6 md:py-4 !border-opacity-30 text-xs md:text-sm"
            >
              Join as a Developer
            </Button>
          </Link>
        </div>

        {/* Open Source Section */}
        <div className="mt-8">
          <Link
            href="https://github.com/muperdev/collabute"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              className="border border-transparent hover:border-neutral-600 text-white hover:text-white px-4 py-2 text-xs transition-all duration-300 flex items-center gap-2 group hover:bg-darkGray"
            >
              <div className="flex items-center gap-1">
                <GithubIcon
                  width={16}
                  height={16}
                  className="text-white group-hover:text-white transition-colors duration-300"
                />
                <span>Give us a star</span>

                {!loading && formatStars && (
                  <div className="flex items-center gap-1 rounded-full px-2 py-1">
                    <span className="text-xs font-medium">{formatStars}</span>

                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-yellow-400"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </Button>
          </Link>
        </div>

        {/* Company logos section */}
        <div className="mt-12 md:mt-28 w-full">
          <p className="text-gray-500 text-sm mb-8">
            Platforms who trusted us and we brought their ideas into life
          </p>

          <div className="hidden md:flex justify-center items-center gap-4 md:gap-8 opacity-50 overflow-x-auto">
            <Image
              src="/Group 289244.png"
              alt="RIAD Invest"
              width={66}
              height={31}
              className="w-auto"
            />
            <Image
              src="/Logo Kit-06 1.png"
              alt="Avitazen"
              width={66}
              height={31}
              className="w-auto"
            />
            <Image
              src="/Frame 1.png"
              alt="Kylix"
              width={66}
              height={31}
              className="w-auto"
            />
            <Image
              src="/trt-logo 1.png"
              alt="TRT World"
              width={66}
              height={31}
              className="w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
