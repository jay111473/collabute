"use client";

import { Button } from "@/components/ui/button";
import AIBadge from "@/components/uikit/ai-badge";
import { CosmicButton } from "@/components/uikit/cosmic-button";
import Image from "next/image";

function About() {
  return (
    <section className="w-full relative">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div>
            <AIBadge text="Entrepreneurs" />
            <h2 className="text-2xl md:text-[36px] font-bold text-white mt-4 mb-6">
              Speed Without <span className="text-darkPrimary">Compromise</span>
            </h2>
            <p className="text-gray-400 mb-8">
              Smart development means building it
              right from the start. We use AI-accelerated planning and
              experienced developers to deliver quality products quickly, so you
              launch with confidence knowing your product is ready for real
              users.
            </p>
            {/* <div className="flex flex-wrap gap-4">
              <CosmicButton>Bring Your Idea to Life</CosmicButton>
              <Button
                variant="outline"
                className="px-6 py-2.5 rounded-md border-zinc-800 bg-transparent text-white font-medium hover:bg-zinc-900"
              >
                How it works
              </Button>
            </div> */}
          </div>
          <div>
            <Image
              src="/dashboard-ss.png"
              alt="About"
              width={500}
              height={500}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
