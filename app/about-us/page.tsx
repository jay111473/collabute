import AboutUsComponent from "@/components/about/hero";
import Header from "@/components/header";
import React from "react";

const AboutUsPage = () => {
  return (
    <div className="flex min-h-screen min-w-screen flex-col items-center justify-center px-2 py-8 lg:px-24 lg:py-4 h-full font-sans gap-y-24 bg-background relative">
      <div className="fixed -top-[1px] left-1/2 -translate-x-1/2 w-[800px] h-[90px] bg-gradient-to-r from-transparent via-[#c99dfe]/25 to-transparent z-20" />
      <Header isAuthenticated={true} />
      <AboutUsComponent />
    </div>
  );
};

export default AboutUsPage;
