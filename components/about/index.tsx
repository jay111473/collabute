import React from "react";
import HeroSection from "./hero-section";
import StorySection from "./story-section";
import JourneySection from "./journey-section";
import VisionSection from "./vision-section";
import ApproachSection from "./approach-section";
import TeamSection from "./team-section";

const AboutUsComponent = () => {
  return (
    <div className="w-full py-24 space-y-36">
      <HeroSection />
      <StorySection />
      <JourneySection />
      <VisionSection />
      <ApproachSection />
      <TeamSection />
    </div>
  );
};

export default AboutUsComponent;
