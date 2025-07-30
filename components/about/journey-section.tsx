import AIBadge from "@/components/uikit/ai-badge";
import Image from "next/image";
import React from "react";

const JourneySection = () => {
  return (
    <section className="w-full relative">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - 3D Purple Shape */}
          <div className="relative h-[500px] flex items-center justify-center">
            <div className="w-full h-full bg-darkGray rounded-2xl flex items-center justify-center">
              <Image
                src="/purple-3d-shape.png"
                alt="3D purple ribbon shape"
                width={400}
                height={400}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Right - Text Content */}
          <div className="space-y-6">
            <AIBadge text="The journey" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Why We&apos;re Here
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              The journey of creation has become fragmented. Startups
              tirelessly search for the right talent, while developers seek
              projects that ignite their passion. This disconnect stifles
              innovation and dampens the spirit of collaboration. We
              envisioned a space where these paths converge seamlessly.
            </p>
            <div className="bg-darkGray/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-white text-lg font-semibold">
                Collabute exists to bridge this gap, fostering an environment
                where meaningful partnerships are formed, and groundbreaking
                projects come to life.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneySection; 