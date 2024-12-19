"use client";
import React from "react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="w-full flex flex-col justify-center items-center min-h-[70vh] relative">
      {/* Innovation badge */}
      <div className="mb-6 px-4 py-1.5 bg-neutral-900/50 rounded-full border border-neutral-800 flex items-center gap-2">
        <span className="text-sm text-neutral-300">✨ Innovation with ai</span>
      </div>

      {/* Main title */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto text-center relative z-20 font-bold">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-neutral-200">
          Collabute:{" "}
        </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 to-neutral-400">
          Unite{" "}
        </span>
        <span className="text-white">to Create</span>
      </h1>

      {/* Subtitle */}
      <p className="text-neutral-400 text-lg md:text-xl max-w-2xl text-center mt-6 mb-8">
        Where Entrepreneurs and Developers Collaborate Seamlessly
        to Bring Ideas to Life—Faster and Smarter.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          size="lg"
          variant="primary"
          className="text-white px-4 py-2"
        >
          Start your project
        </Button>
        <Button 
          size="lg"
          variant="outline"
          className="border-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 !border-opacity-30"
        >
          Join as a Developer
        </Button>
      </div>
    </div>
  );
};

export default Hero;
