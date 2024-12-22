"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import AIBadge from "@/components/uikit/ai-badge";
import { CosmicButton } from "@/components/uikit/cosmic-button";

const Hero = () => {
  return (
    <div className="w-full flex flex-col justify-center items-center min-h-[100vh] relative">
      {/* Background Image */}
      <div className="absolute  w-full h-full flex justify-center items-center">
        <Image
          src="/Hero.png"
          alt="Hero background"
          width={812}
          height={588}
          priority
        />
      </div>

      {/* Content with increased z-index to appear above background */}
      <div className="absolute flex flex-col justify-center items-center bottom-40">
        {/* Innovation badge */}
        <AIBadge text="Innovation with ai" />
        {/* Main title */}
        <h1 className="text-3xl md:text-4xl lg:text-[52px] max-w-4xl mx-auto text-center relative z-20 font-bold">
          <span className="bg-clip-text text-darkPrimary">
            Collabute:{" "}
          </span>
          <span className="bg-clip-text text-transparent text-white">
            Unite{" "}
          </span>
          <span className="text-white">to Create</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[#A091B9] text-md text-center mt-6 mb-8">
          Where Entrepreneurs and Developers Collaborate Seamlessly <br /> to
          Bring Ideas to Life—Faster and Smarter.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <CosmicButton>
            Start your project
          </CosmicButton>
          <Button
            size="lg"
            variant="outline"
            className="border-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 !border-opacity-30"
          >
            Join as a Developer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
