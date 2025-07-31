import React from "react";
import Image from "next/image";

const TurningIdeasSection = () => {
  return (
    <section className="w-full min-h-screen flex items-center">
      <div className="w-full max-w-4xl mx-auto px-6 space-y-16">
        {/* Image Section */}
        <div className="relative">
          <div className="w-full h-96 md:h-[500px] bg-darkGray rounded-2xl border border-gray-800 overflow-hidden">
            {/* Add your hero image path here */}
            <Image
              src="/dashboard-ss.png"
              alt="Hero image"
              fill
              className="object-cover"
              priority
            />
            <div className="w-full h-full bg-darkGray" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Turning Ideas Into Products
          </h1>
          
          <div className="space-y-6 text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl mx-auto">
            <p className="text-base sm:text-lg font-semibold">
              Every breakthrough starts with someone who sees a problem and thinks &quot;I can fix that.&quot;
            </p>
            
            <p className="text-sm sm:text-base text-gray-400">
              Maybe you&apos;re the person with the solution. Maybe you&apos;re the one who knows how to build it. 
              Or maybe you&apos;re the one who can bring the right people together to make it happen.
            </p>
            
            <p className="text-base sm:text-lg font-semibold">
              Great things happen when people with different skills work toward the same goal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TurningIdeasSection; 