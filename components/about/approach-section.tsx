import AIBadge from "@/components/uikit/ai-badge";
import Image from "next/image";
import React from "react";

const ApproachSection = () => {
  return (
    <section className="w-full relative">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Circular Graphic */}
          <div className="relative h-[500px] flex items-center justify-center">
            <Image
              src="/circular-approach-shapes.png"
              alt="Circular approach graphic"
              width={400}
              height={400}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Right - Text Content */}
          <div className="space-y-6">
            <AIBadge text="Mindset" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Our <span className="text-white">Approach</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              At Collabute, we prioritize quality and authenticity. Our
              platform is designed to ensure that every collaboration is
              meaningful and impactful. We believe in:
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="text-purple-400 font-semibold">
                    Seamless Connections:
                  </span>
                  <span className="text-gray-300">
                    {" "}
                    Effortlessly linking startups with developers who share
                    their vision.
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="text-purple-400 font-semibold">
                    Transparent Processes:
                  </span>
                  <span className="text-gray-300">
                    {" "}
                    Cultivating trust through open communication and clear
                    expectations.
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="text-purple-400 font-semibold">
                    Celebrating Contributions:
                  </span>
                  <span className="text-gray-300">
                    {" "}
                    Recognizing and rewarding the dedication and expertise
                    each member brings to the table.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApproachSection; 