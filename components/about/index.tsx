import React from "react";
import TurningIdeasSection from "./turning-ideas-section";
import WhyWeCreatedSection from "./why-we-created-section";
import WhatWeBuiltSection from "./what-we-built-section";
import WhoWeAreSection from "./who-we-are-section";

const AboutUsComponent = () => {
  return (
    <div className="w-full">
      <TurningIdeasSection />
      <WhyWeCreatedSection />
      <WhatWeBuiltSection />
      <WhoWeAreSection />
    </div>
  );
};

export default AboutUsComponent;
