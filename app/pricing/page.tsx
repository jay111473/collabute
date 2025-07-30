import PricingComponent from "@/components/pricing";
import React from "react";

const PricingPage = () => {
  return (
    <div className="flex min-h-screen min-w-screen flex-col items-center justify-center px-2 py-8 lg:px-24 lg:py-4 h-full font-sans gap-y-24 bg-background relative">
      <PricingComponent />
    </div>
  );
};

export default PricingPage;