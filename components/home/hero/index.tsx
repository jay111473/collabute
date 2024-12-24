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
      <div className="absolute  w-full h-full flex justify-center items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/Hero.png"
          alt="Hero background"
          width={812}
          height={588}
          priority
        />
      </div>

      {/* Content with increased z-index to appear above background */}
      <div className="absolute flex flex-col justify-center items-center top-2/3 left-1/2 -translate-x-1/2 -translate-y-3/4 w-full">
        {/* Innovation badge */}
        <AIBadge text="Innovation with ai" />
        {/* Main title */}
        <h1 className="text-2xl md:text-4xl lg:text-[52px] max-w-4xl mx-auto text-center relative z-20 font-bold">
          <span className="bg-clip-text text-darkPrimary">
            Collabute:{" "}
          </span>
          <span className="bg-clip-text text-transparent text-white">
            Unite{" "}
          </span>
          <span className="text-white">to Create</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[#A091B9] md:text-md text-xs text-center mt-2 mb-4 md:mt-6 md:mb-8">
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
