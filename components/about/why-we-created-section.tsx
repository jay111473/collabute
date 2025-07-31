import React from "react";

const WhyWeCreatedSection = () => {
  return (
    <section className="w-full py-32">
      <div className="w-full max-w-4xl mx-auto px-6 text-center space-y-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
          Why We Created This
        </h2>
        
        <div className="space-y-8 text-sm sm:text-base text-gray-400 leading-relaxed max-w-3xl mx-auto">
          <p className="text-base sm:text-lg text-gray-300">
            We experienced the frustration firsthand.
          </p>
          
          <p>
            We worked at large companies where promising ideas never made it to market. 
            The familiar pattern—countless meetings, projects that stretched on indefinitely, 
            and juggling dozens of tools just to complete basic tasks. The compensation 
            structure rarely reflected actual contributions.
          </p>
          
          <p>
            We watched skilled professionals lose motivation on projects that didn&apos;t inspire them. 
            Saw founders with excellent concepts get trapped in complex approval processes.
          </p>
          
          <p className="text-lg sm:text-xl font-semibold text-gray-300">
            We knew there was a better approach.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyWeCreatedSection; 