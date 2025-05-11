import AIBadge from "@/components/uikit/ai-badge";
import Image from "next/image";
import React from "react";

const AboutUsComponent = () => {
  return (
    <section className="w-full mt-24 relative">
      <div className="container px-4 md:px-6 flex flex-col items-center">
        <div className="relative w-full h-[600px] flex flex-col items-center">
          {/* Image as background */}
          <div className="absolute inset-0 w-full h-full z-0 top-10">
            <Image
              src="/about-us-hero.png"
              alt="Pyramid visual"
              className="w-full h-full object-cover"
              objectFit="cover"
              layout="fill"
            />
          </div>

          {/* Text overlay positioned at top 1/3 */}
          <div className="flex flex-col items-center text-center z-10 relative ">
            <AIBadge text="About us" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              A New Way to Build{" "}
              <span className="text-purple-400">Together</span>
            </h2>
          </div>

          {/* Quote at the bottom */}
          <p className="text-white text-xl text-center mt-auto mb-6 z-10">
            &ldquo; When People Gather They Build The Greatests &rdquo;
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUsComponent;
