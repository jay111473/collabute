"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import AIBadge from "@/components/uikit/ai-badge";
import { CosmicButton } from "@/components/uikit/cosmic-button";

const Hero = () => {
  return (
    <div className="w-full flex flex-col justify-start items-center min-h-[100vh] relative">
      {/* Background Image */}
      <div className="absolute w-full h-full flex justify-center items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-[900px] h-[900px] md:w-[700px] md:h-[700px] lg:w-[900px] lg:h-[900px] xl:w-[900px] xl:h-[900px] 2xl:w-[1500px] 2xl:h-[1200px]">
          <Image
            src="/cc-center.png"
            alt="Hero background"
            fill
            sizes="(max-width: 768px) 400px, (max-width: 1024px) 700px, (max-width: 1280px) 900px, (max-width: 1536px) 900px, 1600px"
            priority
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Content with increased z-index to appear above background */}
      <div className="absolute flex flex-col justify-center items-center left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 w-full mt-20">
        {/* Innovation badge */}
        <AIBadge text="Innovation with ai" />
        {/* Main title */}
        <h1 className="text-2xl md:text-4xl lg:text-[52px] 2xl:text-[62px] max-w-4xl mx-auto text-center relative z-20 font-bold">
          <span className="bg-clip-text text-darkPrimary">
            Collabute:{" "}
          </span>
          <span className="bg-clip-text text-transparent text-white">
            Unite{" "}
          </span>
          <span className="text-white">to Create</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[#A091B9] md:text-md text-xs xl:text-base 2xl:text-lg text-center mt-2 mb-4 md:mt-6 md:mb-8 ">
          Where Entrepreneurs and Developers Collaborate Seamlessly <br /> to
          Bring Ideas to Life—Faster and Smarter.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-row gap-4">
          <CosmicButton>
            Start your project
          </CosmicButton>
          <Button
            size="lg"
            variant="outline"
            className="border-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 md:px-8 md:py-4 !border-opacity-30 text-sm md:text-base"
          >
            Join as a Developer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
