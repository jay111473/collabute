import Image from "next/image";
import React from "react";

const VisionSection = () => {
  return (
    <section className="w-full relative">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-8">
          {/* Vision Graphic */}
          <div className="relative h-[400px] flex items-center justify-center">
            <Image
              src="/tr.png"
              alt="Vision graphic with dome and light beam"
              width={600}
              height={400}
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white">
            The <span className="text-white">Landscape</span>
          </h2>

          <div className="max-w-4xl mx-auto space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Success is defined by collaboration and shared vision. The
              nature of work is changing—people want freedom, purpose, and the
              chance to build something meaningful. Startups need partners,
              not just employees. Developers want to be part of something
              bigger than themselves.
            </p>
            <p>
              We&apos;re building a world where trust and contributions matter
              more than titles and contracts. Where the best ideas win,
              regardless of where they come from. Where every connection has
              the potential to change the world.
            </p>
          </div>

          <div className="bg-darkGray/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-2xl mx-auto">
            <p className="text-white text-xl font-semibold text-center">
              Success is defined by the strength of collaborations
            </p>
            <p className="text-white text-xl font-semibold text-center">
              and the shared vision of its participants
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection; 