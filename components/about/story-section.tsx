import AIBadge from "@/components/uikit/ai-badge";
import Image from "next/image";
import React from "react";

const StorySection = () => {
  return (
    <section className="w-full relative">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text Content */}
          <div className="space-y-6">
            <AIBadge text="Story" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              We&apos;ve all felt it—that{" "}
              <span className="text-white">disconnect</span>
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Founders chasing their next big idea. Developers looking for
                something that actually matters. And somehow, both sides still
                feel stuck. Too many forms, too much noise, and not enough
                real connection.
              </p>
              <p>
                That&apos;s why we started Collabute. To bring builders and
                dreamers into the same room. To create a space where startups
                find people who care, and developers find projects worth
                showing up for.
              </p>
            </div>
            <div className="bg-darkGray/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">
                This isn&apos;t just another platform.
              </p>
              <p className="text-white text-lg font-semibold">
                It&apos;s a new way of working—with meaning, with people, and
                with purpose.
              </p>
            </div>
          </div>

          {/* Right - Brain Illustration */}
          <div className="relative h-[500px] flex items-center justify-center">
            <Image
              src="/brain-illustration.png"
              alt="Connected brain network"
              width={400}
              height={400}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection; 