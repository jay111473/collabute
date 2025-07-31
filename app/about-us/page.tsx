import AboutUsComponent from "@/components/about";
import React from "react";

const AboutUsPage = () => {
  return (
    <div className="flex min-h-screen min-w-screen flex-col items-center justify-center px-2 py-8 lg:px-24 lg:py-4 h-full font-sans gap-y-24 bg-background relative">
      <AboutUsComponent />
    </div>
  );
};

export default AboutUsPage;
