import React from "react";
import Image from "next/image";

const WhoWeAreSection = () => {
  return (
    <section className="w-full py-32">
      <div className="w-full max-w-4xl mx-auto px-6 space-y-16">
        {/* Text Content */}
        <div className="text-center space-y-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Who We Are
          </h2>

          <div className="space-y-6 text-sm sm:text-base text-gray-400 leading-relaxed max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-gray-300">
              We&apos;re a focused team that chose to build solutions instead of
              accepting problems.
            </p>

            <p>
              Our backgrounds span development, design, and operations.
              We&apos;re united by the belief that work should be fulfilling
              rather than draining.
            </p>

            <p>
              We maintain transparency, recognize achievements, and welcome
              conversations about what we&apos;re building.
            </p>

            <p className="text-lg sm:text-xl font-semibold text-gray-300">
              Ready to create something great together?
            </p>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative">
          <div className="w-full h-80 md:h-[500px] bg-darkGray rounded-2xl border border-gray-800 overflow-hidden">
            {/* Add your team image path here */}
            <Image
              src="/about-us.jpg"
              alt="Team image"
              fill
              className="object-cover"
            />
            <div className="w-full h-full bg-darkGray" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAreSection;
